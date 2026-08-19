import { NextResponse } from "next/server";

export class UnauthorizedError extends Error {
  constructor() {
    super("UNAUTHORIZED");
  }
}

export class ForbiddenError extends Error {
  constructor() {
    super("FORBIDDEN");
  }
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    { success: false, error: message, ...(details ? { details } : {}) },
    { status },
  );
}

/** Consistent error mapping for server handlers. */
export function handleApiError(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return fail("Authentication required.", 401);
  }
  if (error instanceof ForbiddenError) {
    return fail("You do not have permission to access this resource.", 403);
  }
  if (
    error instanceof Error &&
    error.message.includes("P2002")
  ) {
    return fail("A record with this value already exists.", 409);
  }
  if (
    error instanceof Error &&
    (error.message.includes("P2025") || error.message.includes("P2018"))
  ) {
    return fail("The requested record was not found.", 404);
  }
  console.error("[api] unhandled error:", error);
  return fail("An unexpected error occurred. Please try again later.", 500);
}