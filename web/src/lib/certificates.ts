import "server-only";

import { prisma } from "@/lib/prisma";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomSegment(length: number): string {
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

/**
 * Generates a unique, human-readable certificate identifier.
 * Format: ENIMG-YYYY-XXXXXX. Retries on collision.
 */
export async function generateCertificateNumber(): Promise<string> {
  const year = new Date().getFullYear();
  for (let i = 0; i < 10; i += 1) {
    const candidate = `ENIMG-${year}-${randomSegment(6)}`;
    const existing = await prisma.certificate.findUnique({
      where: { certificateNumber: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  // Extremely unlikely fallback: add more entropy.
  return `ENIMG-${year}-${randomSegment(6)}${randomSegment(4)}`;
}