import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { newsSchema } from "@/lib/validators";
import { fail, ok, handleApiError } from "@/lib/api";

// GET — members can read announcements, admins too; ?all=1 for admin CRUD
export async function GET(request: NextRequest) {
  try {
    const all = request.nextUrl.searchParams.get("all") === "1";
    if (all) await requireAdmin();
    const news = await prisma.news.findMany({
      where: all ? undefined : { published: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return ok(news);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST — admin publishes an announcement
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => null);
    const parsed = newsSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
    }
    const news = await prisma.news.create({ data: parsed.data });
    return ok(news, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";
