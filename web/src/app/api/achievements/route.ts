import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireAdmin } from "@/lib/auth";
import { achievementSchema } from "@/lib/validators";
import { getCriteriaProgress } from "@/lib/achievements";
import { fail, ok, handleApiError } from "@/lib/api";

// GET — members see active achievements with their earn/progress state;
// admins see everything including archived.
export async function GET() {
  try {
    const user = await requireUser();

    if (user.role === "ADMIN") {
      const achievements = await prisma.achievement.findMany({
        orderBy: { createdAt: "asc" },
        include: { _count: { select: { earnedBy: true } } },
      });
      return ok(achievements);
    }

    const achievements = await prisma.achievement.findMany({
      where: { active: true },
      orderBy: { createdAt: "asc" },
      include: {
        earnedBy: {
          where: { userId: user.id },
          select: { earnedAt: true },
        },
      },
    });

    const result = await Promise.all(
      achievements.map(async (a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        icon: a.icon,
        criteria: a.criteria,
        threshold: a.threshold,
        xpReward: a.xpReward,
        earned: a.earnedBy.length > 0,
        earnedAt: a.earnedBy[0]?.earnedAt ?? null,
        progress: await getCriteriaProgress(user.id, a.criteria),
      })),
    );

    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST — admin creates an achievement
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => null);
    const parsed = achievementSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
    }
    const achievement = await prisma.achievement.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        icon: parsed.data.icon,
        criteria: parsed.data.criteria,
        threshold: parsed.data.threshold,
        xpReward: parsed.data.xpReward,
      },
    });
    return ok(achievement, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";