import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { teamMemberSchema } from "@/lib/validators";
import { fail, ok, handleApiError } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const all = request.nextUrl.searchParams.get("all") === "1";
    if (all) await requireAdmin();
    const team = await prisma.teamMember.findMany({
      where: all ? undefined : { published: true },
      orderBy: [{ isLeadership: "desc" }, { order: "asc" }, { name: "asc" }],
    });
    return ok(team);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => null);
    const parsed = teamMemberSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
    }
    const member = await prisma.teamMember.create({
      data: {
        ...parsed.data,
        image: parsed.data.image || null,
        facebook: parsed.data.facebook || null,
        instagram: parsed.data.instagram || null,
        email: parsed.data.email || null,
      },
    });
    return ok(member, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";
