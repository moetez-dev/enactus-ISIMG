import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ok, handleApiError } from "@/lib/api";

// GET — the member's notifications (newest first) plus unread count.
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const take = Math.min(
      Math.max(Number(request.nextUrl.searchParams.get("take") ?? 50) || 50, 1),
      200,
    );

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take,
      }),
      prisma.notification.count({
        where: { userId: user.id, read: false },
      }),
    ]);
    return ok({ notifications, unreadCount });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST — mark every notification as read.
export async function POST() {
  try {
    const user = await requireUser();
    const result = await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });
    return ok({ updated: result.count });
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";