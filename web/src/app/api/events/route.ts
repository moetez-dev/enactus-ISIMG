import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { eventSchema } from "@/lib/validators";
import { fail, ok, handleApiError } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const all = request.nextUrl.searchParams.get("all") === "1";
    if (all) await requireAdmin();
    const events = await prisma.event.findMany({
      where: all ? undefined : { published: true, date: { gte: new Date() } },
      orderBy: { date: "asc" },
    });
    return ok(events);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
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
    const event = await prisma.event.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description || null,
        date,
        location: parsed.data.location || null,
        published: parsed.data.published,
      },
    });
    return ok(event, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";
