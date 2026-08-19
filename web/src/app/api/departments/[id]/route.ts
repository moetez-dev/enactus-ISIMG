import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { departmentSchema } from "@/lib/validators";
import { fail, ok, handleApiError } from "@/lib/api";

type Params = { params: { id: string } };

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => null);
    const parsed = departmentSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
    }
    const department = await prisma.department.update({
      where: { id: params.id },
      data: parsed.data,
    });
    return ok(department);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    await prisma.department.delete({ where: { id: params.id } });
    return ok({ id: params.id });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("P2003")
    ) {
      return fail(
        "This department still has members or projects. Reassign them first.",
        409,
      );
    }
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";
