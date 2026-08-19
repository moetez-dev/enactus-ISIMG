import "server-only";

import { prisma } from "@/lib/prisma";

export const ACTIVITY_TYPES = [
  "MISSION_COMPLETED",
  "EVENT_ATTENDED",
  "PROJECT_JOINED",
  "BADGE_EARNED",
  "CERTIFICATE_ISSUED",
  "POINTS_AWARDED",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export type ActivityInput = {
  type: ActivityType;
  title: string;
  description?: string | null;
};

/**
 * Server-side XP awarding. Members can never award themselves points:
 * this is only reachable from admin or system flows and runs in a single
 * transaction so the points change and the activity entry stay consistent.
 */
export async function awardPoints(
  userId: string,
  points: number,
  activity: ActivityInput,
) {
  if (!Number.isInteger(points) || points <= 0) {
    throw new Error("Points must be a positive integer.");
  }

  const user = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: userId },
      data: { points: { increment: points } },
      select: { id: true, points: true },
    });
    await tx.activity.create({
      data: {
        userId,
        type: activity.type,
        title: activity.title,
        description: activity.description ?? null,
        points,
      },
    });
    return updated;
  });

  return user.points;
}