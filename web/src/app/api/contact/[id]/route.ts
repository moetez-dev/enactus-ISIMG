import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, handleApiError } from "@/lib/api";

type Params = { params: { id: string } };

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    await prisma.contactMessage.delete({ where: { id: params.id } });
    return ok({ id: params.id });
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";
