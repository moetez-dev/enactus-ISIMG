import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { statusUpdateSchema } from "@/lib/validators";
import { generateMemberId } from "@/lib/membership";
import { createNotification } from "@/lib/notify";
import { evaluateAchievements } from "@/lib/achievements";
import { fail, ok, handleApiError } from "@/lib/api";

// GET — admin lists all registered users with server-side search + pagination.
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const validStatuses = ["PENDING", "APPROVED", "REJECTED"] as const;

    if (status && status !== "ALL" && !validStatuses.includes(status as (typeof validStatuses)[number])) {
      return fail("Invalid status filter. Use PENDING, APPROVED, REJECTED or ALL.", 400);
    }

    const q = searchParams.get("q")?.trim() || "";
    const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const pageSize = Math.min(100, Math.max(1, Number.parseInt(searchParams.get("pageSize") ?? "20", 10) || 20));

    const where: {
      status?: "PENDING" | "APPROVED" | "REJECTED";
      OR?: Array<{ fullName?: { contains: string; mode: "insensitive" }; email?: { contains: string; mode: "insensitive" }; memberId?: { contains: string; mode: "insensitive" } }>;
    } = {};

    if (status && status !== "ALL") {
      where.status = status as "PENDING" | "APPROVED" | "REJECTED";
    }
    if (q) {
      where.OR = [
        { fullName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { memberId: { contains: q, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          status: true,
          points: true,
          level: true,
          motivation: true,
          memberId: true,
          memberSince: true,
          institution: true,
          studyLevel: true,
          fieldOfStudy: true,
          skills: true,
          interests: true,
          availability: true,
          linkedin: true,
          github: true,
          portfolioUrl: true,
          createdAt: true,
          departmentId: true,
          department: { select: { id: true, name: true } },
          _count: { select: { missions: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return ok({ users, total, page, pageSize });
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
      memberId?: string;
      memberSince?: Date;
    } = {};
    if (status) data.status = status;
    if (role) data.role = role;
    if (departmentId !== undefined) data.departmentId = departmentId || null;
    if (points && points > 0) data.points = { increment: points };

    // Approving an application activates the membership: allocate the unique
    // member ID and record the start date. Re-approving an existing member
    // keeps their original ID.
    if (status === "APPROVED" && !user.memberId) {
      const allocation = await prisma.$transaction(async (tx) => ({
        memberId: await generateMemberId(tx),
        memberSince: new Date(),
      }));
      data.memberId = allocation.memberId;
      data.memberSince = allocation.memberSince;
    }

const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        points: true,
        level: true,
        motivation: true,
        memberId: true,
        memberSince: true,
        createdAt: true,
      },
    });

    // Notify on application decisions.
    if (status === "APPROVED") {
      await createNotification({
        userId,
        type: "APPLICATION",
        title: "Welcome to Enactus ISIMG!",
        message: "Your membership application has been approved.",
        link: "/member",
      });
      await evaluateAchievements(userId);
    } else if (status === "REJECTED") {
      await createNotification({
        userId,
        type: "APPLICATION",
        title: "Application update",
        message: "Your membership application was not approved this time.",
        link: "/",
      });
    }

    // Notify when points are awarded manually.
    if (points && points > 0) {
      await createNotification({
        userId,
        type: "XP",
        title: `${points} XP awarded`,
        message: "An administrator awarded you bonus XP.",
        link: "/member",
      });
      await evaluateAchievements(userId);
    }

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
