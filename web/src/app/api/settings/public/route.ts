import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api";

const PUBLIC_KEYS = [
  "siteName",
  "description",
  "email",
  "phone",
  "address",
  "facebook",
  "instagram",
  "tiktok",
  "youtube",
] as const;

// GET — public settings used for footer + contact info
export async function GET() {
  try {
    const rows = await prisma.setting.findMany({
      where: { key: { in: [...PUBLIC_KEYS] } },
    });
    const data = Object.fromEntries(
      rows.map((row) => [row.key, String(row.value)]),
    );
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}