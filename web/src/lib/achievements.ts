import "server-only";

import { prisma } from "@/lib/prisma";

export type AchievementCriteriaKey =
  | "MANUAL"
  | "MISSIONS_COMPLETED"
  | "XP_TOTAL"
  | "EVENTS_ATTENDED"
  | "PROJECTS_JOINED";

/**
 * Computes the raw progress value a user has for the given criteria type.
 */
export async function getCriteriaProgress(
  userId: string,
  criteria: AchievementCriteriaKey,
): Promise<number> {
  switch (criteria) {
    case "MISSIONS_COMPLETED":
      return prisma.mission.count({
        where: { userId, status: "APPROVED" },
      });
    case "XP_TOTAL": {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { points: true },
      });
      return user?.points ?? 0;
    }
    case "EVENTS_ATTENDED":
      return prisma.eventRegistration.count({
        where: { userId, status: "ATTENDED" },
      });
    case "PROJECTS_JOINED":
      return prisma.projectMember.count({
        where: { userId, status: "APPROVED" },
      });
    default:
      return 0;
  }
}

/**
 * Grants an achievement inside a transaction.
 * Awards XP reward, logs activity and notifies the user.
 * Duplicate awards are prevented by the unique(userId, achievementId)
 * constraint — safe to call from anywhere.
 *
 * Returns true if newly awarded, false if already earned.
 */
export async function awardAchievement({
  userId,
  achievementId,
  reason,
}: {
  userId: string;
  achievementId: string;
  reason?: string;
}): Promise<boolean> {
  const achievement = await prisma.achievement.findUnique({
    where: { id: achievementId },
  });
  if (!achievement?.active) return false;

  const existing = await prisma.userAchievement.findUnique({
    where: {
      userId_achievementId: { userId, achievementId },
    },
  });
  if (existing) return false;

  await prisma.$transaction(async (tx) => {
    await tx.userAchievement.create({
      data: { userId, achievementId },
    });
    if (achievement.xpReward > 0) {
      await tx.user.update({
        where: { id: userId },
        data: { points: { increment: achievement.xpReward } },
      });
    }
    await tx.activity.create({
      data: {
        userId,
        type: "ACHIEVEMENT_UNLOCKED",
        title: `Achievement unlocked: ${achievement.name}`,
        description: reason ?? achievement.description,
        points: achievement.xpReward,
        refId: achievementId,
      },
    });
    await tx.notification.create({
      data: {
        userId,
        type: "ACHIEVEMENT",
        title: `Achievement unlocked: ${achievement.name}`,
        message: achievement.description,
        link: "/member?tab=achievements",
      },
    });
  });

  return true;
}

/**
 * Revokes an achievement from a user.
 * Removes the badge and the unlock activity, and reverses the XP reward
 * (clamped so points never go negative). Safe to call for manual revoke.
 */
export async function revokeAchievement({
  userId,
  achievementId,
  reason,
}: {
  userId: string;
  achievementId: string;
  reason?: string;
}): Promise<boolean> {
  const link = await prisma.userAchievement.findUnique({
    where: { userId_achievementId: { userId, achievementId } },
    include: { achievement: true },
  });
  if (!link) return false;

  await prisma.$transaction(async (tx) => {
    await tx.userAchievement.delete({
      where: { id: link.id },
    });
    if (link.achievement.xpReward > 0) {
      await tx.user.update({
        where: { id: userId },
        data: {
          points: { increment: -link.achievement.xpReward },
        },
      });
    }
    await tx.activity.deleteMany({
      where: { userId, type: "ACHIEVEMENT_UNLOCKED", refId: achievementId },
    });
    await tx.notification.create({
      data: {
        userId,
        type: "ACHIEVEMENT",
        title: `Achievement removed: ${link.achievement.name}`,
        message: reason ?? "An administrator revoked this achievement.",
        link: "/member?tab=achievements",
      },
    });
  });

  return true;
}

/**
 * Re-evaluates all active, not-yet-earned achievements for a user and awards
 * any that their current stats satisfy. Repeats a bounded number of times so
 * that XP granted by one achievement can unlock a higher XP milestone.
 *
 * Call after: mission approval, event attendance marked, project membership
 * approved, or admin awarding points.
 *
 * Pass `excludeAchievementIds` to keep specific achievements out of the
 * evaluation (e.g. the one being revoked, so it is not instantly re-earned).
 */
export async function evaluateAchievements(
  userId: string,
  options?: { excludeAchievementIds?: string[] },
): Promise<void> {
  const excluded = options?.excludeAchievementIds ?? [];
  for (let round = 0; round < 20; round += 1) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        points: true,
        achievements: {
          select: { achievementId: true },
        },
      },
    });
    if (!user) return;

    const earnedIds = user.achievements.map((e) => e.achievementId);
    const eligible = await prisma.achievement.findMany({
      where: {
        active: true,
        criteria: { not: "MANUAL" },
        id: { notIn: [...earnedIds, ...excluded] },
      },
    });

    let awardedAny = false;
    for (const achievement of eligible) {
      const progress = await getCriteriaProgress(userId, achievement.criteria);
      if (progress >= achievement.threshold) {
        const awarded = await awardAchievement({
          userId,
          achievementId: achievement.id,
          reason: achievement.description,
        });
        awardedAny = awarded || awardedAny;
      }
    }

    if (!awardedAny) return;
  }
}