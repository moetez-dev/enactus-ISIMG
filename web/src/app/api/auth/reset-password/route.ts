import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validators";
import { fail, ok, handleApiError } from "@/lib/api";
import { enforceRateLimit, AUTH_LIMITS } from "@/lib/rate-limit";
import { hashResetToken } from "@/lib/password-reset";

export async function POST(request: NextRequest) {
  try {
    const limited = await enforceRateLimit(
      request,
      "resetPassword",
      AUTH_LIMITS.resetPassword,
    );
    if (limited) return limited;

    const body = await request.json().catch(() => null);
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
    }

    const { token, password } = parsed.data;

    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashResetToken(token) },
    });

    // Generic error — do not reveal whether the token existed or expired.
    if (!record || record.expiresAt.getTime() < Date.now()) {
      return fail("Invalid or expired reset link.", 400);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // One-time use: consume the token and revoke all of the user's
    // existing sessions in the same transaction as the password change.
    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash, tokenVersion: { increment: 1 } },
      }),
    ]);

    return ok({
      message: "Your password has been reset. You can now sign in.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";