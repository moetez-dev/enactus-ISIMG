import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { projectSchema } from "@/lib/validators";
import { fail, ok, handleApiError } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const all = request.nextUrl.searchParams.get("all") === "1";
    if (all) await requireAdmin();
    const projects = await prisma.project.findMany({
      where: all ? undefined : { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { department: { select: { id: true, name: true, slug: true } } },
    });
    return ok(projects);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => null);
    const parsed = projectSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
    }
    const { departmentId, ...data } = parsed.data;
    const project = await prisma.project.create({
      data: {
        ...data,
        image: data.image || null,
        departmentId: departmentId || null,
      },
    });
    return ok(project, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";
