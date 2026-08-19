import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { eventSchema } from "@/lib/validators";
import { fail, ok, handleApiError } from "@/lib/api";

type Params = { params: { id: string } };

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => null);
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
    }
    const date = new Date(parsed.data.date);
    if (Number.isNaN(date.getTime())) {
      return fail("Please provide a valid event date.", 400);
    }
    const event = await prisma.event.update({
      where: { id: params.id },
      data: {
        title: parsed.data.title,
        description: parsed.data.description || null,
        date,
        location: parsed.data.location || null,
        published: parsed.data.published,
      },
    });
    return ok(event);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    await prisma.event.delete({ where: { id: params.id } });
    return ok({ id: params.id });
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";
