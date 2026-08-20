import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { announcementSchema } from "@/lib/validators";
import { broadcastAnnouncement } from "@/lib/notify";
import { fail, ok, handleApiError } from "@/lib/api";

// POST — admin broadcasts an announcement to every approved member.
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => null);
    const parsed = announcementSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
    }

    const sent = await broadcastAnnouncement({
      title: parsed.data.title,
      message: parsed.data.message || undefined,
      link: parsed.data.link ?? undefined,
    });

    return ok({ sent });
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";