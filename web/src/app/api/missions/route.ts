import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireAdmin } from "@/lib/auth";
import { missionSchema } from "@/lib/validators";
import { fail, ok, handleApiError } from "@/lib/api";

// GET — admins see all missions; members only their own
export async function GET() {
  try {
    const session = await requireUser();
    if (session.role === "ADMIN") {
      const missions = await prisma.mission.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, fullName: true, email: true, profilePic: true },
          },
        },
      });
      return ok(missions);
    }
    const missions = await prisma.mission.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
    });
    return ok(missions);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST — admin assigns a mission to a member
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => null);
    const parsed = missionSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
    }
    const mission = await prisma.mission.create({
      data: {
        userId: parsed.data.userId,
        text: parsed.data.text,
        points: parsed.data.points,
      },
    });
    return ok(mission, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";
