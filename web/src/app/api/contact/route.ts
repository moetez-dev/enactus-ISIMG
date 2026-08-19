import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/auth";
import { contactSchema } from "@/lib/validators";
import { fail, ok, handleApiError } from "@/lib/api";
import { enforceRateLimit, AUTH_LIMITS } from "@/lib/rate-limit";

// GET — admin lists messages
export async function GET() {
  try {
    await requireAdmin();
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return ok(messages);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST — public: submit a contact message
export async function POST(request: NextRequest) {
  try {
    const limited = await enforceRateLimit(request, "contact", AUTH_LIMITS.contact);
    if (limited) return limited;

    const body = await request.json().catch(() => null);
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
    }
    // Attribute the message to a logged-in user when possible.
    let userId: string | null = null;
    try {
      const user = await requireUser();
      userId = user.id;
    } catch {
      userId = null;
    }
    const message = await prisma.contactMessage.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject || null,
        message: parsed.data.message,
        userId,
      },
    });
    return ok(message, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";
