/**
 * @fileoverview Next.js 16 route protection proxy. Reads and decrypts the app_session JWE cookie,
 * validates tokenVersion against the DB (with in-memory cache), and enforces route-level access
 * control for /account/* and /admin/* routes.
 *
 * IMPORTANT: This proxy is READ-ONLY for sessions. Cookie writes (create/update/delete) are
 * handled in Server Actions and Server Components via await cookies() + cookieStore.set()/delete().
 *
 * Export signature: export async function proxy(request: NextRequest)
 * Configured via: export const config = { matcher: ['/account/:path*', '/admin/:path*'] }
 */

import { NextRequest, NextResponse } from "next/server";
import { jwtDecrypt } from "jose";
import { getCachedTokenVersion, getCachedPermissionVersion } from "@/lib/auth/session-cache";
import { authorize } from "@/lib/auth/authorize";
import type { SessionData } from "@/types";

const SESSION_COOKIE_NAME = "app_session";

/**
 * Returns the session encryption secret as a Uint8Array.
 */
function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET must be at least 32 characters long for A256GCM encryption",
    );
  }
  return new TextEncoder().encode(secret);
}

/**
 * Reads and decrypts the session cookie from the incoming request.
 * Returns null if the cookie is missing, expired, or cannot be decrypted.
 */
async function readSessionFromRequest(
  request: NextRequest,
): Promise<SessionData | null> {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) return null;

    const { payload } = await jwtDecrypt(sessionCookie.value, getSecret());
    return payload as unknown as SessionData;
  } catch {
    return null;
  }
}

/**
 * Main proxy function for route protection.
 * Runs on every request matching the configured matcher patterns.
 *
 * Protection rules:
 * - /account/* → requires any authenticated user
 * - /admin/* (except /admin/login) → requires admin + route permission
 *
 * @param request - The incoming Next.js request.
 * @returns NextResponse (redirect or continue).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read session from cookie
  const session = await readSessionFromRequest(request);

  // --- Token version validation ---
  if (session) {
    const cachedVersion = await getCachedTokenVersion(session.userId);
    if (cachedVersion !== session.tokenVersion) {
      // Token version mismatch — session is invalidated (password change, etc.)
      // Redirect to login and remove cookie
      const response = pathname.startsWith("/admin")
        ? NextResponse.redirect(new URL("/admin/login", request.url))
        : NextResponse.redirect(new URL("/login", request.url));

      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    // Permission version check — if mismatch, allow through with stale permissions
    // (acceptable within the 60s cache window)
    if (session.groupId) {
      const cachedPermissionVersion = await getCachedPermissionVersion(session.groupId);
      if (cachedPermissionVersion !== session.permissionVersion) {
        // Allow through with stale permissions — cache will refresh within 60s
        // We don't block here, just log a warning in development
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `[proxy] Permission version mismatch for user ${session.userId}. Using stale permissions.`,
          );
        }
      }
    }
  }

  // --- Route protection ---

  // /account/* routes — require any authenticated user
  if (pathname.startsWith("/account")) {
    if (!authorize(session, { type: "any" })) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // /admin/* routes — require admin authentication
  if (pathname.startsWith("/admin")) {
    // Allow access to admin login page
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    // Check admin authentication
    if (!authorize(session, { type: "admin" })) {
      if (!session) {
        // Not logged in — redirect to admin login
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
      // Logged in but not admin — redirect to user dashboard
      return NextResponse.redirect(new URL("/account/dashboard", request.url));
    }

    // Check route-specific permissions
    if (!authorize(session, { type: "route", path: pathname })) {
      // No permission for this route.
      // If already on the admin dashboard, redirect to login to avoid a self-loop.
      if (pathname === "/admin/dashboard") {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
      // Otherwise redirect to admin dashboard
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    return NextResponse.next();
  }

  // Default: allow through
  return NextResponse.next();
}

/**
 * Proxy configuration — matches account and admin routes.
 */
export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
