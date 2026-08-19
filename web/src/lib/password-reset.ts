import "server-only";

import { createHash, randomBytes } from "node:crypto";

/**
 * Password-reset token helpers.
 *
 * Only the SHA-256 hash of a token is ever persisted or looked up, so a
 * database leak does not expose usable reset links.
 */

export const RESET_TOKEN_BYTES = 32;
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export function generateResetToken(): string {
  return randomBytes(RESET_TOKEN_BYTES).toString("hex");
}

export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
