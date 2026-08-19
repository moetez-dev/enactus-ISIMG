import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { departmentSchema } from "@/lib/validators";
import { fail, ok, handleApiError } from "@/lib/api";

// GET — public list of departments
export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, description: true, icon: true },
    });
    return ok(departments);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST — admin creates a department
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => null);
    const parsed = departmentSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
    }
    const department = await prisma.department.create({ data: parsed.data });
    return ok(department, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";
