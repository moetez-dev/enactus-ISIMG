import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fail, ok, handleApiError } from "@/lib/api";

type Params = { params: { id: string } };

// POST — member requests to join a project.
export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const project = await prisma.project.findUnique({ where: { id: params.id } });
    if (!project?.published) return fail("Project not found.", 404);

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: project.id, userId: user.id } },
    });
    if (existing) {
      if (existing.status === "APPROVED") {
        return fail("You are already a member of this project.", 409);
      }
      if (existing.status === "PENDING") {
        return fail("Your request is already awaiting approval.", 409);
      }
      // A rejected request can be re-requested.
      const reRequested = await prisma.projectMember.update({
        where: { id: existing.id },
        data: { status: "PENDING", requestedAt: new Date(), respondedAt: null },
      });
      return ok(reRequested, { status: 201 });
    }

    const membership = await prisma.projectMember.create({
      data: { projectId: project.id, userId: user.id, status: "PENDING" },
    });
    return ok(membership, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE — member cancels a pending request or leaves an approved project.
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: params.id, userId: user.id } },
    });
    if (!membership) return fail("You are not part of this project.", 404);
    if (membership.status !== "PENDING" && membership.status !== "APPROVED") {
      return fail("This membership can only be removed by an admin.", 403);
    }

    await prisma.projectMember.delete({ where: { id: membership.id } });
    return ok({ projectId: params.id });
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";