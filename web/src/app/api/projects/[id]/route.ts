import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { projectSchema } from "@/lib/validators";
import { fail, ok, handleApiError } from "@/lib/api";

type Params = { params: { id: string } };

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => null);
    const parsed = projectSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
    }
    const { departmentId, ...data } = parsed.data;
    const project = await prisma.project.update({
      where: { id: params.id },
      data: { ...data, image: data.image || null, departmentId: departmentId || null },
    });
    return ok(project);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    await prisma.project.delete({ where: { id: params.id } });
    return ok({ id: params.id });
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";
