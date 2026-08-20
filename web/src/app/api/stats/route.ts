import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ok, handleApiError } from "@/lib/api";

// GET — admin dashboard stats
export async function GET() {
  try {
    await requireAdmin();
    const now = new Date();
    const [
      members,
      pendingMembers,
      departments,
      projects,
      events,
      team,
      messages,
      achievements,
      achievementsEarned,
      certificates,
      eventAttendance,
      projectMemberships,
      pendingProjectRequests,
      unreadNotifications,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "MEMBER" } }),
      prisma.user.count({ where: { status: "PENDING" } }),
      prisma.department.count(),
      prisma.project.count({ where: { published: true } }),
      prisma.event.count({ where: { published: true, date: { gte: now } } }),
      prisma.teamMember.count(),
      prisma.contactMessage.count(),
      prisma.achievement.count({ where: { active: true } }),
      prisma.userAchievement.count(),
      prisma.certificate.count({ where: { status: "ACTIVE" } }),
      prisma.eventRegistration.count(),
      prisma.projectMember.count({ where: { status: "APPROVED" } }),
      prisma.projectMember.count({ where: { status: "PENDING" } }),
      prisma.notification.count({ where: { read: false } }),
    ]);

    const leaderboard = await prisma.user.findMany({
      where: { role: "MEMBER", status: "APPROVED" },
      orderBy: { points: "desc" },
      take: 5,
      select: {
        id: true,
        fullName: true,
        email: true,
        points: true,
        profilePic: true,
        department: { select: { name: true } },
      },
    });

    const recentMembers = await prisma.user.findMany({
      where: { role: "MEMBER" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
        status: true,
      },
    });

return ok({
      members,
      pendingMembers,
      departments,
      projects,
      events,
      team,
      messages,
      achievements,
      achievementsEarned,
      certificates,
      eventAttendance,
      projectMemberships,
      pendingProjectRequests,
      unreadNotifications,
      leaderboard,
      recentMembers,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";
