import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/auth";
import { missionWorkSchema, missionReviewSchema } from "@/lib/validators";
import { evaluateAchievements } from "@/lib/achievements";
import { fail, ok, handleApiError } from "@/lib/api";

type Params = { params: { id: string } };

// PATCH — member submits their work, or admin reviews it.
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => null);
    const mission = await prisma.mission.findUnique({ where: { id: params.id } });
    if (!mission) return fail("Mission not found.", 404);

// Admin review: approve or send back (reopen).
    if (user.role === "ADMIN") {
      const parsed = missionReviewSchema.safeParse(body);
      if (!parsed.success) {
        return fail(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
      }
      if (parsed.data.status === "APPROVED") {
        if (mission.pointsAwarded) {
          return fail("Points for this mission have already been awarded.", 409);
        }
        const approved = await prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: mission.userId },
            data: { points: { increment: mission.points } },
          });
          await tx.activity.create({
            data: {
              userId: mission.userId,
              type: "MISSION_COMPLETED",
              title: "Mission completed",
              description: mission.text,
              points: mission.points,
              refId: mission.id,
            },
          });
          await tx.notification.create({
            data: {
              userId: mission.userId,
              type: "MISSION",
              title: "Mission approved",
              message: `Your mission "${mission.text}" earned ${mission.points} XP.`,
              link: "/member?tab=missions",
            },
          });
          const updatedMission = await tx.mission.update({
            where: { id: mission.id },
            data: { status: "APPROVED", completed: true, pointsAwarded: true },
          });
          return updatedMission;
        });
        await evaluateAchievements(mission.userId);
        return ok(approved);
      }
      // Reopened — let the member know the submission was sent back.
      await prisma.notification.create({
        data: {
          userId: mission.userId,
          type: "MISSION",
          title: "Mission sent back for revision",
          message: `"${mission.text}" was reopened. Please resubmit your work.`,
          link: "/member?tab=missions",
        },
      });
      const reopened = await prisma.mission.update({
        where: { id: mission.id },
        data: { status: "LIVE", submitted: false, workLink: null },
      });
      return ok(reopened);
    }

    // Member: only their own mission, only when still live.
    if (mission.userId !== user.id) {
      return fail("You cannot modify this mission.", 403);
    }
    if (mission.status !== "LIVE" || mission.submitted) {
      return fail("This mission has already been submitted.", 409);
    }
    const parsed = missionWorkSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
    }
    const updated = await prisma.mission.update({
      where: { id: mission.id },
      data: { workLink: parsed.data.workLink, status: "PENDING_REVIEW", submitted: true },
    });
    return ok(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE — admin removes a mission.
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    await prisma.mission.delete({ where: { id: params.id } });
    return ok({ id: params.id });
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";
