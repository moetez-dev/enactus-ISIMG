import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { settingsSchema } from "@/lib/validators";
import { fail, ok, handleApiError } from "@/lib/api";

// GET — admin reads all settings
export async function GET() {
  try {
    await requireAdmin();
    const settings = await prisma.setting.findMany();
    return ok(settings);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT — admin saves settings
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => null);
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid input.", 400);
    }
    const entries = Object.entries(parsed.data).filter(
      ([, value]) => value !== undefined,
    );
    await prisma.$transaction(
      entries.map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          create: { key, value },
          update: { value },
        }),
      ),
    );
    return ok({ updated: entries.length });
  } catch (error) {
    return handleApiError(error);
  }
}
export const dynamic = "force-dynamic";
