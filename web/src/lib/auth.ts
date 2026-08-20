import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ForbiddenError, UnauthorizedError } from "@/lib/api";
import type { User } from "@prisma/client";

const SESSION_COOKIE = "enactus_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set.");
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  sub: string;
  role: "ADMIN" | "MEMBER";
  /** Incremented on password change/reset to revoke existing sessions. */
  ver: number;
};

/** Minimal user shape exposed to the client (never the password hash). */
export type SafeUser = {
  id: string;
  email: string;
  fullName: string;
  role: "ADMIN" | "MEMBER";
  status: "PENDING" | "APPROVED" | "REJECTED";
  department: { id: string; name: string; slug: string } | null;
  motivation: string | null;
  memberId: string | null;
  memberSince: Date | null;
  institution: string | null;
  studyLevel: string | null;
  fieldOfStudy: string | null;
  skills: string[];
  interests: string[];
  availability: string | null;
  linkedin: string | null;
  github: string | null;
  portfolioUrl: string | null;
  publicProfile: boolean;
  points: number;
  level: string;
  profilePic: string | null;
  phone: string | null;
  bio: string | null;
  createdAt: Date;
};

export function toSafeUser(user: User & { department?: SafeUser["department"] | null }): SafeUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role as SafeUser["role"],
    status: user.status as SafeUser["status"],
    department: user.department ?? null,
    motivation: user.motivation,
    memberId: user.memberId,
    memberSince: user.memberSince,
    institution: user.institution,
    studyLevel: user.studyLevel,
    fieldOfStudy: user.fieldOfStudy,
    skills: user.skills,
    interests: user.interests,
    availability: user.availability,
    linkedin: user.linkedin,
    github: user.github,
    portfolioUrl: user.portfolioUrl,
    publicProfile: user.publicProfile,
    points: user.points,
    level: user.level,
    profilePic: user.profilePic,
    phone: user.phone,
    bio: user.bio,
    createdAt: user.createdAt,
  };
}

export async function createSessionToken(
  userId: string,
  role: "ADMIN" | "MEMBER",
  ver: number,
): Promise<string> {
  return new SignJWT({ sub: userId, role, ver })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    });
    if (!payload.sub || !payload.role || typeof payload.ver !== "number") {
      return null;
    }
    return {
      sub: payload.sub as string,
      role: payload.role as SessionPayload["role"],
      ver: payload.ver as number,
    };
  } catch {
    return null;
  }
}

export function getSessionCookieValue(): string | undefined {
  return cookies().get(SESSION_COOKIE)?.value;
}

/** Server-side session loader used by server components + route handlers. */
export async function getSession() {
  const token = getSessionCookieValue();
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload) return null;
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: { department: true },
  });
  // Reject sessions issued against an older token version, e.g. after a
  // password reset, so stolen/old tokens cannot keep a session alive.
  if (!user || user.tokenVersion !== payload.ver) return null;
  return {
    payload,
    user: toSafeUser(user),
  };
}

/** Loads the current user or throws if unauthenticated. */
export async function requireUser() {
  const session = await getSession();
  if (!session) throw new UnauthorizedError();
  return session.user;
}

/** Loads the current admin or throws if not an admin. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new UnauthorizedError();
  if (session.user.role !== "ADMIN") throw new ForbiddenError();
  return session.user;
}

/** Removes the session cookie. */
export function destroySession() {
  cookies().delete(SESSION_COOKIE);
}

export const sessionCookieName = SESSION_COOKIE;
export const sessionMaxAgeSeconds = SESSION_MAX_AGE_SECONDS;