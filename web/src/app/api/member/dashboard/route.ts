import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fail, ok, handleApiError } from "@/lib/api";
import { getLevelInfo } from "@/lib/constants";
import { computeEngagement } from "@/lib/engagement";

export async function GET() {
  try {
    const user = await requireUser();

    const [dbUser, missionsCompleted, missionsActive, missionsReview, activity, achievementsCount, certificatesCount, eventsAttended, projectsCount, unreadNotifications, attendedHours, activityHours, engagement] =
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
            hours: true,
            createdAt: true,
          },
        }),
        prisma.userAchievement.count({ where: { userId: user.id } }),
        prisma.certificate.count({
          where: { userId: user.id, status: "ACTIVE" },
        }),
        prisma.eventRegistration.count({
          where: { userId: user.id, status: "ATTENDED" },
        }),
        prisma.projectMember.count({
          where: { userId: user.id, status: "APPROVED" },
        }),
        prisma.notification.count({
          where: { userId: user.id, read: false },
        }),
        prisma.eventRegistration.aggregate({
          where: { userId: user.id, status: "ATTENDED" },
          _sum: { hours: true },
        }),
        prisma.activity.aggregate({
          where: { userId: user.id },
          _sum: { hours: true },
        }),
        computeEngagement(user.id),
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
        memberId: dbUser.memberId,
        memberSince: dbUser.memberSince,
        institution: dbUser.institution,
        studyLevel: dbUser.studyLevel,
        fieldOfStudy: dbUser.fieldOfStudy,
        skills: dbUser.skills,
        interests: dbUser.interests,
        availability: dbUser.availability,
        linkedin: dbUser.linkedin,
        github: dbUser.github,
        portfolioUrl: dbUser.portfolioUrl,
        publicProfile: dbUser.publicProfile,
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
        eventsAttended,
        projectsCount,
        achievementsCount,
        certificatesCount,
        unreadNotifications,
        totalHours: (attendedHours._sum.hours ?? 0) + (activityHours._sum.hours ?? 0),
        engagement,
      },
      activity,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export const dynamic = "force-dynamic";