import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireAdmin } from "@/lib/auth";
import { fail, ok, handleApiError } from "@/lib/api";

type Params = { params: { id: string } };

// GET — admin sees any certificate; member sees their own (IDOR-safe).
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const certificate = await prisma.certificate.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { fullName: true, email: true } },
        event: { select: { title: true, date: true } },
        achievement: { select: { name: true, icon: true } },
      },
    });
    if (!certificate) return fail("Certificate not found.", 404);
    if (user.role !== "ADMIN" && certificate.userId !== user.id) {
      return fail("You cannot view this certificate.", 403);
    }
    return ok(certificate);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE — admin revokes a certificate (soft revoke keeps the audit trail).
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const existing = await prisma.certificate.findUnique({
      where: { id: params.id },
    });
    if (!existing) return fail("Certificate not found.", 404);
    if (existing.status === "REVOKED") {
      return fail("This certificate is already revoked.", 409);
    }

    await prisma.$transaction(async (tx) => {
      await tx.certificate.update({
        where: { id: params.id },
        data: { status: "REVOKED" },
      });
      await tx.notification.create({
        data: {
          userId: existing.userId,
          type: "CERTIFICATE",
          title: "Certificate revoked",
          message: `Certificate "${existing.title}" (${existing.certificateNumber}) was revoked.`,
          link: "/member?tab=certificates",
        },
      });
    });
    return ok({ id: params.id });
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";