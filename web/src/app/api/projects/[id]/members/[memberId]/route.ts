import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { projectMemberUpdateSchema } from "@/lib/validators";
import { evaluateAchievements } from "@/lib/achievements";
import { fail, ok, handleApiError } from "@/lib/api";

type Params = { params: { id: string; memberId: string } };

// PATCH — admin approves/rejects a request or updates the role.
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const project = await prisma.project.findUnique({ where: { id: params.id } });
    if (!project) return fail("Project not found.", 404);

    const membership = await prisma.projectMember.findUnique({
      where: { id: params.memberId },
      include: { user: { select: { fullName: true } } },
    });
    if (!membership || membership.projectId !== project.id) {
      return fail("Project member not found.", 404);
    }

    const body = await request.json().catch(() => null);
    const parsed = projectMemberUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
    }

    if (
      parsed.data.status === "REJECTED" &&
      membership.status === "APPROVED"
    ) {
      return fail("Remove an approved member instead of rejecting them.", 400);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const record = await tx.projectMember.update({
        where: { id: membership.id },
        data: {
          status: parsed.data.status,
          role: parsed.data.role ?? membership.role,
          respondedAt: new Date(),
        },
      });
      await tx.notification.create({
        data: {
          userId: membership.userId,
          type: "PROJECT",
          title:
            parsed.data.status === "APPROVED"
              ? `Approved: ${project.name}`
              : `Request declined: ${project.name}`,
          message:
            parsed.data.status === "APPROVED"
              ? `You are now part of the project as ${parsed.data.role ?? membership.role}.`
              : "Your request to join was declined.",
          link: "/member?tab=projects",
        },
      });
      return record;
    });

    if (parsed.data.status === "APPROVED") {
      await evaluateAchievements(membership.userId);
    }

    return ok(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE — admin removes a member from the project.
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const project = await prisma.project.findUnique({ where: { id: params.id } });
    if (!project) return fail("Project not found.", 404);

    const membership = await prisma.projectMember.findUnique({
      where: { id: params.memberId },
    });
    if (!membership || membership.projectId !== project.id) {
      return fail("Project member not found.", 404);
    }

    await prisma.$transaction(async (tx) => {
      await tx.projectMember.delete({ where: { id: membership.id } });
      await tx.notification.create({
        data: {
          userId: membership.userId,
          type: "PROJECT",
          title: `Removed from: ${project.name}`,
          message: "An administrator removed you from this project.",
          link: "/member?tab=projects",
        },
      });
    });

    return ok({ id: membership.id });
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";