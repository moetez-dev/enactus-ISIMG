import "server-only";

import type { Prisma } from "@prisma/client";

/**
 * Membership & member ID helpers.
 *
 * Member IDs follow the format EN-ISIMG-<year>-<sequence>, e.g.
 * EN-ISIMG-2026-0042. The sequence resets each year and is allocated from
 * the count of existing IDs for that year, with an explicit existence check
 * and a bounded retry loop so concurrent approvals cannot collide. The
 * unique constraint on `User.memberId` is the final backstop.
 */

const MEMBER_ID_PATTERN = /^EN-ISIMG-\d{4}-\d{4}$/;

export function isValidMemberId(value: string): boolean {
  return MEMBER_ID_PATTERN.test(value);
}

export function memberIdPrefix(year: number): string {
  return `EN-ISIMG-${year}-`;
}

export async function generateMemberId(
  tx: Prisma.TransactionClient,
  year = new Date().getFullYear(),
): Promise<string> {
  const prefix = memberIdPrefix(year);

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const count = await tx.user.count({
      where: { memberId: { startsWith: prefix } },
    });
    const candidate = `${prefix}${String(count + 1).padStart(4, "0")}`;
    const taken = await tx.user.findUnique({
      where: { memberId: candidate },
      select: { id: true },
    });
    if (!taken) return candidate;
  }

  throw new Error("Could not allocate a unique member ID.");
}