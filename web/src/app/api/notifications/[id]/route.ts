import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fail, ok, handleApiError } from "@/lib/api";

type Params = { params: { id: string } };

// PATCH — mark a notification as read (only your own, IDOR-safe).
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => null);
    const read = typeof body?.read === "boolean" ? body.read : true;

    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
    });
    if (!notification) return fail("Notification not found.", 404);
    if (notification.userId !== user.id) {
      return fail("You cannot modify this notification.", 403);
    }

    const updated = await prisma.notification.update({
      where: { id: params.id },
      data: { read },
    });
    return ok(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE — remove a notification (only your own).
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
    });
    if (!notification) return fail("Notification not found.", 404);
    if (notification.userId !== user.id) {
      return fail("You cannot modify this notification.", 403);
    }
    await prisma.notification.delete({ where: { id: params.id } });
    return ok({ id: params.id });
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";