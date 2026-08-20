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
        phone: parsed.data.phone,
        bio: parsed.data.bio,
        institution: parsed.data.institution ?? null,
        studyLevel: parsed.data.studyLevel ?? null,
        fieldOfStudy: parsed.data.fieldOfStudy ?? null,
        availability: parsed.data.availability ?? null,
        linkedin: parsed.data.linkedin ?? null,
        github: parsed.data.github ?? null,
        portfolioUrl: parsed.data.portfolioUrl ?? null,
        skills: "skills" in body ? parsed.data.skills : undefined,
        interests: "interests" in body ? parsed.data.interests : undefined,
        publicProfile: parsed.data.publicProfile ?? undefined,
      },
      include: { department: true },
    });
    return ok(toSafeUser(updated));
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";