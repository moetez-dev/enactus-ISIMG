import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fail, ok, handleApiError } from "@/lib/api";

type Params = { params: { id: string } };

// POST — a member registers for an event they are not yet registered for.
export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();

    const event = await prisma.event.findUnique({ where: { id: params.id } });
    if (!event?.published) return fail("Event not found.", 404);

    const existing = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: { eventId: event.id, userId: user.id },
      },
    });
    if (existing) {
      return fail(
        existing.status === "ATTENDED"
          ? "You already attended this event."
          : "You are already registered for this event.",
        409,
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.eventRegistration.create({
        data: { eventId: event.id, userId: user.id },
      });
      await tx.notification.create({
        data: {
          userId: user.id,
          type: "EVENT",
          title: `Registered for: ${event.title}`,
          message: event.location ?? "See you there!",
          link: "/member?tab=events",
        },
      });
    });

    return ok({ eventId: event.id }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE — a member cancels their registration (only while not attended).
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const registration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: { eventId: params.id, userId: user.id },
      },
      include: { event: { select: { title: true } } },
    });
    if (!registration) return fail("You are not registered for this event.", 404);
    if (registration.status === "ATTENDED") {
      return fail("You cannot cancel after attending the event.", 409);
    }

    await prisma.eventRegistration.delete({ where: { id: registration.id } });
    return ok({ eventId: params.id });
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";