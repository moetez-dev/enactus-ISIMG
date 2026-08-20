import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ok, handleApiError } from "@/lib/api";

// GET — current member's registrations with their event details.
export async function GET() {
  try {
    const user = await requireUser();
    const registrations = await prisma.eventRegistration.findMany({
      where: { userId: user.id },
      orderBy: { registeredAt: "desc" },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            date: true,
            location: true,
          },
        },
      },
    });
    return ok(registrations);
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";