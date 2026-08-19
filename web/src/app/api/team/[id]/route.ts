import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { teamMemberSchema } from "@/lib/validators";
import { fail, ok, handleApiError } from "@/lib/api";

type Params = { params: { id: string } };

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => null);
    const parsed = teamMemberSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
    }
    const member = await prisma.teamMember.update({
      where: { id: params.id },
      data: {
        ...parsed.data,
        image: parsed.data.image || null,
        facebook: parsed.data.facebook || null,
        instagram: parsed.data.instagram || null,
        email: parsed.data.email || null,
      },
    });
    return ok(member);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    await prisma.teamMember.delete({ where: { id: params.id } });
    return ok({ id: params.id });
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";
