import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { statusUpdateSchema } from "@/lib/validators";
import { fail, ok, handleApiError } from "@/lib/api";

// GET — admin lists all registered users
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const validStatuses = ["PENDING", "APPROVED", "REJECTED"] as const;

    if (status && status !== "ALL" && !validStatuses.includes(status as (typeof validStatuses)[number])) {
      return fail("Invalid status filter. Use PENDING, APPROVED, REJECTED or ALL.", 400);
    }

    const users = await prisma.user.findMany({
      where:
        status && status !== "ALL"
          ? { status: status as "PENDING" | "APPROVED" | "REJECTED" }
          : undefined,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        points: true,
        level: true,
        motivation: true,
        createdAt: true,
        departmentId: true,
        department: { select: { id: true, name: true } },
        _count: { select: { missions: true } },
      },
    });
    return ok(users);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH — admin updates a user's role/status, points, or department
export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => null);
    const parsed = statusUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
    }

    const { userId, status, role, points, departmentId } = parsed.data;
const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return fail("User not found.", 404);

    if (role === "MEMBER" && user.role === "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) return fail("You cannot demote the last admin.", 400);
    }

    const data: {
      status?: "PENDING" | "APPROVED" | "REJECTED";
      role?: "ADMIN" | "MEMBER";
      departmentId?: string | null;
      points?: { increment: number };
    } = {};
    if (status) data.status = status;
    if (role) data.role = role;
    if (departmentId !== undefined) data.departmentId = departmentId || null;
    if (points && points > 0) data.points = { increment: points };

    const updated = await prisma.user.update({ where: { id: userId }, data });
    return ok(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE — admin removes a user (never themselves)
export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json().catch(() => null);
    const { userId } = body ?? {};
if (!userId) return fail("userId is required.", 400);
    if (userId === admin.id) return fail("You cannot delete your own account.", 400);
    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) return fail("User not found.", 404);
    if (target.role === "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) return fail("You cannot delete the last admin.", 400);
    }
    await prisma.user.delete({ where: { id: userId } });
    return ok({ id: userId });
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";
