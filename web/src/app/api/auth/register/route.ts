import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";
import { fail, ok, handleApiError } from "@/lib/api";
import { enforceRateLimit, AUTH_LIMITS } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const limited = await enforceRateLimit(request, "register", AUTH_LIMITS.register);
    if (limited) return limited;

    const body = await request.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return fail(firstIssue?.message ?? "Invalid input.", 400);
    }

    const { fullName, email, password, departmentId, motivation } =
      parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return fail("An account with this email already exists. Try logging in.", 409);
    }

    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });
    if (!department) {
      return fail("Please select a valid department.", 400);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        departmentId: department.id,
        motivation,
        role: "MEMBER",
        status: "PENDING",
        level: "Junior",
      },
    });

    return ok({ id: user.id }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";