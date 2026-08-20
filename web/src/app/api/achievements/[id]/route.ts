import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { achievementSchema } from "@/lib/validators";
import { fail, ok, handleApiError } from "@/lib/api";

type Params = { params: { id: string } };

// PUT — admin edits an achievement
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => null);
    const parsed = achievementSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
    }
    const existing = await prisma.achievement.findUnique({
      where: { id: params.id },
    });
    if (!existing) return fail("Achievement not found.", 404);

    const updated = await prisma.achievement.update({
      where: { id: params.id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        icon: parsed.data.icon,
        criteria: parsed.data.criteria,
        threshold: parsed.data.threshold,
        xpReward: parsed.data.xpReward,
      },
    });
    return ok(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE — admin archives (soft) an achievement. If it was never earned and
// has no certificates, it is removed entirely.
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const existing = await prisma.achievement.findUnique({
      where: { id: params.id },
      include: { _count: { select: { earnedBy: true, certificates: true } } },
    });
    if (!existing) return fail("Achievement not found.", 404);

    if (existing._count.earnedBy === 0 && existing._count.certificates === 0) {
      await prisma.achievement.delete({ where: { id: params.id } });
    } else {
      await prisma.achievement.update({
        where: { id: params.id },
        data: { active: false },
      });
    }
    return ok({ id: params.id });
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";