import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { destroySession, getSession, requireUser, toSafeUser } from "@/lib/auth";
import { fail, ok, handleApiError } from "@/lib/api";
import { profileUpdateSchema } from "@/lib/validators";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return fail("Not authenticated.", 401);
    }

    // Always re-check the user against the DB on each request.
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { department: true },
    });
    if (!user || (user.status !== "APPROVED" && user.role !== "ADMIN")) {
      destroySession();
      return fail("Not authenticated.", 401);
    }

    return ok(toSafeUser(user));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => null);
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
    }
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        fullName: parsed.data.fullName,
        profilePic: parsed.data.profilePic,
      },
      include: { department: true },
    });
    return ok(toSafeUser(updated));
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";