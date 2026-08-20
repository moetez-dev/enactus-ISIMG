import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireAdmin } from "@/lib/auth";
import { certificateIssueSchema } from "@/lib/validators";
import { generateCertificateNumber } from "@/lib/certificates";
import { fail, ok, handleApiError } from "@/lib/api";

// GET — admins see all issued certificates; members only their own.
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();

    if (user.role === "ADMIN") {
      const all = request.nextUrl.searchParams.get("all") !== "1";
      const certificates = await prisma.certificate.findMany({
        where: all
          ? { status: "ACTIVE" }
          : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, fullName: true, email: true, profilePic: true } },
          event: { select: { id: true, title: true } },
          achievement: { select: { id: true, name: true, icon: true } },
        },
      });
      return ok(certificates);
    }

    const certificates = await prisma.certificate.findMany({
      where: { userId: user.id, status: "ACTIVE" },
      orderBy: { issueDate: "desc" },
      include: {
        event: { select: { id: true, title: true } },
        achievement: { select: { id: true, name: true, icon: true } },
      },
    });
    return ok(certificates);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST — admin issues a certificate to a member.
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json().catch(() => null);
    const parsed = certificateIssueSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
    }

    const { userId, title, description, eventId, achievementId } = parsed.data;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.role !== "MEMBER") {
      return fail("Select a valid member.", 400);
    }
    if (eventId) {
      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (!event) return fail("Event not found.", 400);
    }
    if (achievementId) {
      const achievement = await prisma.achievement.findUnique({
        where: { id: achievementId },
      });
      if (!achievement) return fail("Achievement not found.", 400);
    }

    const certificateNumber = await generateCertificateNumber();

    const certificate = await prisma.$transaction(async (tx) => {
      const cert = await tx.certificate.create({
        data: {
          certificateNumber,
          title,
          description: description || null,
          userId,
          issuedById: admin.id,
          eventId: eventId || null,
          achievementId: achievementId || null,
        },
      });
      await tx.notification.create({
        data: {
          userId,
          type: "CERTIFICATE",
          title: `Certificate issued: ${title}`,
          message: `Certificate ${certificateNumber} has been issued to you.`,
          link: "/member?tab=certificates",
        },
      });
      return cert;
    });

    return ok(certificate, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";