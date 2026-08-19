import "server-only";

import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";
import { fail } from "@/lib/api";

export type RateLimitRule = {
  windowSeconds: number;
  max: number;
};

export const AUTH_LIMITS = {
  login: { windowSeconds: 15 * 60, max: 10 },
  register: { windowSeconds: 60 * 60, max: 5 },
  contact: { windowSeconds: 10 * 60, max: 5 },
  forgotPassword: { windowSeconds: 15 * 60, max: 5 },
  resetPassword: { windowSeconds: 15 * 60, max: 10 },
} satisfies Record<string, RateLimitRule>;

/**
 * DB-backed fixed-window rate limiter.
 *
 * Works across serverless instances (Vercel) because the counter lives in
 * PostgreSQL instead of process memory. The upsert increment is atomic, so
 * concurrent requests cannot exceed the limit by racing the read.
 */
export async function rateLimit(
  request: NextRequest,
  keyPrefix: string,
  rule: RateLimitRule,
): Promise<null | { limited: boolean }> {
  const ip = clientIp(request);
  const key = `${keyPrefix}:${ip}`;
  const windowStart = Math.floor(
    Date.now() / 1000 / rule.windowSeconds,
  ) * rule.windowSeconds;

  const row = await prisma.rateLimit.upsert({
    where: { key_windowStart: { key, windowStart } },
    create: { key, windowStart, count: 1 },
    update: { count: { increment: 1 } },
    select: { count: true },
  });

  // Lazily prune old buckets whenever a fresh one is created.
  if (row.count === 1) {
    const cutoff = Math.floor(Date.now() / 1000) - 24 * 60 * 60;
    await prisma.rateLimit.deleteMany({
      where: { windowStart: { lt: cutoff } },
    });
  }

  if (row.count > rule.max) {
    return { limited: true };
  }
  return null;
}

/** Convenience: apply a rule or return a 429 JSON response. */
export async function enforceRateLimit(
  request: NextRequest,
  keyPrefix: string,
  rule: RateLimitRule,
): Promise<ReturnType<typeof fail> | null> {
  const result = await rateLimit(request, keyPrefix, rule);
  if (result?.limited) {
    return fail(
      "Too many attempts. Please try again later.",
      429,
    );
  }
  return null;
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") || "unknown";
}
