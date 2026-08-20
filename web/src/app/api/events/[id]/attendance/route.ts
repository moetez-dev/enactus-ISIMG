import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { attendanceMarkSchema } from "@/lib/validators";
import { evaluateAchievements } from "@/lib/achievements";
import { createNotification } from "@/lib/notify";
import { fail, ok, handleApiError } from "@/lib/api";

type Params = { params: { id: string } };

// GET — admin lists participants of an event with status.
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const event = await prisma.event.findUnique({ where: { id: params.id } });
    if (!event) return fail("Event not found.", 404);

    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId: params.id },
      orderBy: { registeredAt: "asc" },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePic: true,
            department: { select: { name: true } },
          },
        },
      },
    });
    return ok({ event, registrations });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST — admin marks attendance (or moves someone back to REGISTERED).
// Creating a record for an unregistered user is allowed and auditable.
export async function POST(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const event = await prisma.event.findUnique({ where: { id: params.id } });
    if (!event) return fail("Event not found.", 404);

    const body = await request.json().catch(() => null);
    const parsed = attendanceMarkSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
    }
    const userId = typeof body?.userId === "string" ? body.userId.trim() : "";
    if (!userId) return fail("userId is required.", 400);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.role !== "MEMBER") return fail("Select a valid member.", 400);

    const wanted = parsed.data.status;

    const existing = await prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId: params.id, userId } },
    });

    let registration: {
      id: string;
      status: string;
      hours: number;
      attendedAt: Date | null;
    };
    if (!existing) {
      const created = await prisma.eventRegistration.create({
        data: {
          eventId: params.id,
          userId,
          status: wanted,
          hours: parsed.data.hours ?? 0,
          attendedAt: wanted === "ATTENDED" ? new Date() : null,
        },
        select: { id: true, status: true, hours: true, attendedAt: true },
      });
      registration = created;
    } else {
      if (wanted === "ATTENDED" && existing.status === "ATTENDED") {
        // Allow adjusting recorded hours for a repeated mark, otherwise 409.
        if (parsed.data.hours === undefined) {
          return fail(`${user.fullName} is already marked as attended.`, 409);
        }
        registration = await prisma.eventRegistration.update({
          where: { id: existing.id },
          data: { hours: parsed.data.hours },
          select: { id: true, status: true, hours: true, attendedAt: true },
        });
        return ok(registration);
      }
      registration = await prisma.eventRegistration.update({
        where: { id: existing.id },
        data: {
          status: wanted,
          hours: parsed.data.hours ?? existing.hours,
          attendedAt: wanted === "ATTENDED" ? new Date() : existing.attendedAt,
        },
        select: { id: true, status: true, hours: true, attendedAt: true },
      });
    }

    // Attendance unlocks event-related achievements.
    if (wanted === "ATTENDED") {
      await evaluateAchievements(userId);
      await createNotification({
        userId,
        type: "EVENT",
        title: `Attendance confirmed: ${event.title}`,
        message: "You were marked as attended.",
        link: "/member?tab=events",
      });
    }

    return ok(registration);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE — admin removes a member from the event roster entirely.
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const body = await _request.json().catch(() => null);
    const userId = typeof body?.userId === "string" ? body.userId.trim() : "";
    if (!userId) return fail("userId is required.", 400);

    const registration = await prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId: params.id, userId } },
    });
    if (!registration) return fail("This member is not on the event roster.", 404);

    await prisma.eventRegistration.delete({ where: { id: registration.id } });
    return ok({ eventId: params.id, userId });
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";