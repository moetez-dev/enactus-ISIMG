import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { revokeAchievement, evaluateAchievements } from "@/lib/achievements";
import { fail, ok, handleApiError } from "@/lib/api";

type Params = { params: { id: string } };

// POST — admin revokes an achievement from a member.
export async function POST(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => null);
    const userId = typeof body?.userId === "string" ? body.userId.trim() : "";

    if (!userId) return fail("userId is required.", 400);

    const reason =
      typeof body?.reason === "string" && body.reason.trim()
        ? body.reason.trim().slice(0, 500)
        : undefined;

    const revoked = await revokeAchievement({ userId, achievementId: params.id, reason });

    if (!revoked) return fail("This member does not have this achievement.", 404);

    // XP was removed, so re-evaluate XP-driven achievements (they may be
    // lost). The revoked achievement itself is excluded so it cannot be
    // instantly re-earned while the member still satisfies its criteria.
    await evaluateAchievements(userId, { excludeAchievementIds: [params.id] });

    return ok({ id: params.id, userId });
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";