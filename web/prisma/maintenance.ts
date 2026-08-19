import { existsSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

/**
 * Maintenance prune job.
 *
 * Run it periodically from any scheduler:
 *   npm run db:prune
 * (e.g. a cron/systemd timer, GitHub Actions workflow, or serverless cron.)
 *
 * Deletes:
 *   - expired password-reset tokens (they are one-time and expire in 1h)
 *   - rate-limit buckets older than 24h (belt-and-braces on top of the
 *     lazy cleanup already performed inside lib/rate-limit.ts)
 */
for (const file of [".env", ".env.local"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  const staleBucketCutoff = Math.floor(Date.now() / 1000) - 24 * 60 * 60;

  const [expiredTokens, staleBuckets] = await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({
      where: { expiresAt: { lt: now } },
    }),
    prisma.rateLimit.deleteMany({
      where: { windowStart: { lt: staleBucketCutoff } },
    }),
  ]);

  console.log(`[prune] deleted ${expiredTokens.count} expired reset token(s)`);
  console.log(`[prune] deleted ${staleBuckets.count} stale rate-limit bucket(s)`);
}

main()
  .catch((error) => {
    console.error("[prune] failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());