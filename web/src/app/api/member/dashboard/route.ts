import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fail, ok, handleApiError } from "@/lib/api";
import { getLevelInfo } from "@/lib/constants";

export async function GET() {
  try {
    const user = await requireUser();

    const [dbUser, missionsCompleted, missionsActive, missionsReview, activity] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: user.id },
          include: { department: true },
        }),
        prisma.mission.count({
          where: { userId: user.id, status: "APPROVED" },
        }),
        prisma.mission.count({
          where: { userId: user.id, status: "LIVE", submitted: false },
        }),
        prisma.mission.count({
          where: { userId: user.id, status: "PENDING_REVIEW" },
        }),
        prisma.activity.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            type: true,
            title: true,
            description: true,
            points: true,
            createdAt: true,
          },
        }),
      ]);

    if (!dbUser || (dbUser.status !== "APPROVED" && dbUser.role !== "ADMIN")) {
      return fail("Not authenticated.", 401);
    }

    return ok({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        fullName: dbUser.fullName,
        role: dbUser.role,
        status: dbUser.status,
        department: dbUser.department,
        motivation: dbUser.motivation,
        points: dbUser.points,
        level: dbUser.level,
        profilePic: dbUser.profilePic,
        createdAt: dbUser.createdAt,
      },
      stats: {
        points: dbUser.points,
        level: getLevelInfo(dbUser.points),
        missionsCompleted,
        missionsPendingReview: missionsReview,
        missionsActive,
        eventsAttended: 0,
        projectsCount: 0,
        achievementsCount: 0,
        certificatesCount: 0,
      },
      activity,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export const dynamic = "force-dynamic";