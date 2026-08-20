import { type NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { sessionCookieName } from "@/lib/auth";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "");

async function verify(request: NextRequest) {
  const token = request.cookies.get(sessionCookieName)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET, { algorithms: ["HS256"] });
    if (!payload.sub || !payload.role) return null;
    return {
      sub: payload.sub as string,
      role: payload.role as "ADMIN" | "MEMBER",
    };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verify(request);

  const isProtectedPage =
    pathname.startsWith("/admin") || pathname.startsWith("/member");
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi =
    pathname.startsWith("/api/users") ||
    pathname.startsWith("/api/departments") ||
    pathname.startsWith("/api/team") ||
    pathname.startsWith("/api/settings") ||
    pathname.startsWith("/api/stats") ||
    pathname.startsWith("/api/achievements") ||
    pathname.startsWith("/api/certificates") ||
    pathname.startsWith("/api/notifications/announce") ||
    pathname.endsWith("/attendance") ||
    pathname.includes("/members/") ||
    pathname.endsWith("/members");
  // GETs are public reads; route handlers enforce admin on sensitive ones
  // (e.g. /api/settings, /api/stats, /api/team?all=1). Writes are admin-only.
  const isAdminWrite = request.method !== "GET" && isAdminApi;

  // Admin-only resources even for GET (rosters).
  const isAdminOnlyResource = pathname.endsWith("/attendance");
  const isAdminOnlyGet = isAdminOnlyResource && request.method === "GET";

  // Protected pages: redirect to /login when unauthenticated.
  if (isProtectedPage && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Admin-only pages: regular members get sent back to their area.
  if (isAdminPage && session && session.role !== "ADMIN") {
    const url = request.nextUrl.clone();
    url.pathname = "/member";
    return NextResponse.redirect(url);
  }

  // Admin-only REST endpoints (writes).
  if (isAdminWrite || isAdminOnlyGet) {
    if (session?.role !== "ADMIN") {
      const status = session ? 403 : 401;
      return NextResponse.json(
        {
          success: false,
          error:
            status === 403
              ? "You do not have permission to access this resource."
              : "Authentication required.",
        },
        { status },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/member/:path*",
    "/api/users/:path*",
    "/api/departments/:path*",
    "/api/team/:path*",
    "/api/settings/:path*",
    "/api/stats",
    "/api/achievements/:path*",
    "/api/certificates/:path*",
    "/api/notifications/announce",
    "/api/events/:path*/attendance",
    "/api/projects/:path*/members/:path*",
  ],
};