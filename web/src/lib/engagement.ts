import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * Member engagement score.
 *
 * The score is a weighted sum of real participation data (never hardcoded):
 * approved missions, attended events, approved project memberships, volunteer
 * hours, active certificates and earned achievements. Tune the weights or the
 * target below to change how quickly members reach 100%.
 */
export const ENGAGEMENT_WEIGHTS = {
  missionsCompleted: 2,
  eventsAttended: 3,
  projectsJoined: 2,
  volunteerHours: 1,
  certificates: 5,
  achievements: 3,
} as const;

/** Total weighted points needed to reach 100% engagement. */
export const ENGAGEMENT_TARGET = 60;

export type EngagementResult = {
  /** 0-100 percentage. */
  score: number;
  earned: number;
  target: number;
  breakdown: Record<string, number>;
};

export async function computeEngagement(userId: string): Promise<EngagementResult> {
  const [missionsCompleted, eventsAttended, projectsJoined, certificateCount, achievementCount, attendedHours, activityHours] =
    await Promise.all([
      prisma.mission.count({ where: { userId, status: "APPROVED" } }),
      prisma.eventRegistration.count({ where: { userId, status: "ATTENDED" } }),
      prisma.projectMember.count({ where: { userId, status: "APPROVED" } }),
      prisma.certificate.count({ where: { userId, status: "ACTIVE" } }),
      prisma.userAchievement.count({ where: { userId } }),
      prisma.eventRegistration.aggregate({
        where: { userId, status: "ATTENDED" },
        _sum: { hours: true },
      }),
      prisma.activity.aggregate({
        where: { userId },
        _sum: { hours: true },
      }),
    ]);

  const volunteerHours = (attendedHours._sum.hours ?? 0) + (activityHours._sum.hours ?? 0);

  const items = {
    missionsCompleted,
    eventsAttended,
    projectsJoined,
    volunteerHours,
    certificates: certificateCount,
    achievements: achievementCount,
  } as const;

  const breakdown: Record<string, number> = {};
  let earned = 0;
  for (const [key, count] of Object.entries(items)) {
    const weighted = count * ENGAGEMENT_WEIGHTS[key as keyof typeof ENGAGEMENT_WEIGHTS];
    breakdown[key] = weighted;
    earned += weighted;
  }

  const score = Math.min(100, Math.round((earned / ENGAGEMENT_TARGET) * 100));

  return { score, earned, target: ENGAGEMENT_TARGET, breakdown };
}