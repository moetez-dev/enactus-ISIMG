import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ok, handleApiError } from "@/lib/api";

type Params = { params: { id: string } };

// GET — admin sees the full project roster; a member sees only their own
// membership status for this project (IDOR-safe).
export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await requireUser();

    if (user.role === "ADMIN") {
      const members = await prisma.projectMember.findMany({
        where: { projectId: params.id },
        orderBy: { requestedAt: "asc" },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profilePic: true,
              department: { select: { name: true } },
            },
          },
        },
      });
      return ok(members);
    }

    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: params.id, userId: user.id } },
    });
    return ok(membership); // null means "not a member / no request"
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";