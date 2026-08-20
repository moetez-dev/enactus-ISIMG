import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { awardAchievement, evaluateAchievements } from "@/lib/achievements";
import { fail, ok, handleApiError } from "@/lib/api";

type Params = { params: { id: string } };

// POST — admin manually awards an achievement to a member.
export async function POST(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => null);
    const userId = typeof body?.userId === "string" ? body.userId.trim() : "";

    if (!userId) return fail("userId is required.", 400);

    const [achievement, user] = await Promise.all([
      prisma.achievement.findUnique({ where: { id: params.id } }),
      prisma.user.findUnique({ where: { id: userId } }),
    ]);
    if (!achievement?.active) {
      return fail("Achievement not found.", 404);
    }
    if (user?.role !== "MEMBER") {
      return fail("Select a valid member.", 400);
    }

    const awarded = await awardAchievement({
      userId,
      achievementId: achievement.id,
      reason: "Awarded manually by an administrator.",
    });

    if (!awarded) {
      return fail("This member has already earned this achievement.", 409);
    }

    // XP earned this way might cross an XP milestone.
    if (achievement.xpReward > 0) {
      await evaluateAchievements(userId);
    }

    return ok({ id: achievement.id, userId });
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";