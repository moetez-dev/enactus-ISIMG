import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";
import { fail, ok, handleApiError } from "@/lib/api";
import { enforceRateLimit, AUTH_LIMITS } from "@/lib/rate-limit";
import {
  createSessionToken,
  sessionCookieName,
  sessionMaxAgeSeconds,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const limited = await enforceRateLimit(request, "login", AUTH_LIMITS.login);
    if (limited) return limited;

    const body = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return fail("Invalid email or password. Please check and try again.", 401);
    }

    // Only approved members and admins may sign in.
    if (user.status !== "APPROVED") {
      const message =
        user.status === "PENDING"
          ? "Your application is still awaiting approval. Please try again later."
          : "Your application was not approved. Contact the team for details.";
      return fail(message, 403);
    }

    const token = await createSessionToken(user.id, user.role, user.tokenVersion);
    const response = ok({
      status: user.status,
      role: user.role,
      fullName: user.fullName,
      redirect: user.role === "ADMIN" ? "/admin" : "/member",
    });

    response.cookies.set(sessionCookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: sessionMaxAgeSeconds,
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";