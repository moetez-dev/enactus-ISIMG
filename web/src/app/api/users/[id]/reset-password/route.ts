import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { adminSetPasswordSchema } from "@/lib/validators";
import { fail, ok, handleApiError } from "@/lib/api";

type Params = { params: { id: string } };

// POST — admin sets/resets a user's password directly. Bumps the user's
// tokenVersion so any existing sessions for that account are revoked.
export async function POST(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => null);
    const parsed = adminSetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
    }

    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user) return fail("User not found.", 404);

    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, tokenVersion: { increment: 1 } },
    });

    return ok({ id: user.id });
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";