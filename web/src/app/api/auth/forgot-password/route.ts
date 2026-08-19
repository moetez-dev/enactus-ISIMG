import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validators";
import { fail, ok, handleApiError } from "@/lib/api";
import { enforceRateLimit, AUTH_LIMITS } from "@/lib/rate-limit";
import {
  generateResetToken,
  hashResetToken,
  RESET_TOKEN_TTL_MS,
} from "@/lib/password-reset";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { SITE_URL } from "@/lib/constants";

const GENERIC_MESSAGE =
  "If an account exists for that email, a reset link has been sent.";

export async function POST(request: NextRequest) {
  try {
    const limited = await enforceRateLimit(
      request,
      "forgotPassword",
      AUTH_LIMITS.forgotPassword,
    );
    if (limited) return limited;

    const body = await request.json().catch(() => null);
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    // Identical response + comparable work whether or not the account exists
    // to prevent account enumeration.
    if (!user) {
      await bcrypt.hash("dummy-reset", 12);
      return ok({ message: GENERIC_MESSAGE });
    }

    // One active token per user: revoke any previous unused tokens.
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const rawToken = generateResetToken();
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashResetToken(rawToken),
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    const resetUrl = `${SITE_URL}/reset-password?token=${rawToken}`;
    const sent = await sendPasswordResetEmail({ to: user.email, resetUrl });

    // Non-production convenience: return the link in the payload only when
    // explicitly enabled. Production never returns it.
    const devLinkReturn =
      !sent &&
      process.env.NODE_ENV !== "production" &&
      process.env.PASSWORD_RESET_DEV_LINK === "true";

    if (devLinkReturn) {
      return ok({ message: GENERIC_MESSAGE, devResetUrl: resetUrl });
    }

    return ok({ message: GENERIC_MESSAGE });
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";