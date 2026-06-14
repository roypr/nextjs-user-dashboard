/**
 * @fileoverview Unified authorization function supporting all four check types:
 * any authenticated user, admin group membership, route-based permission,
 * and super admin (email matches env var). Super Admin always passes route checks.
 */

import type { SessionData, AuthCheck } from "@/types";

/**
 * Checks whether the given session satisfies the provided authorization check.
 *
 * @param session - The session data from the JWE cookie (may be null if not logged in).
 * @param check - The authorization check descriptor.
 * @returns True if the session satisfies the check, false otherwise.
 *
 * Authorization types:
 * - `{ type: 'any' }` — any authenticated user
 * - `{ type: 'admin' }` — user in group with type "admin"
 * - `{ type: 'route', path }` — admin user with matching route permission (startsWith pattern matching; Super Admin always passes)
 * - `{ type: 'super_admin' }` — session email matches SUPER_ADMIN_EMAIL env var
 */
export function authorize(
  session: SessionData | null,
  check: AuthCheck,
): boolean {
  if (!session) return false;

  switch (check.type) {
    case "any":
      return true;

    case "admin":
      return session.groupType === "admin";

    case "route": {
      // Super Admin always passes all route checks
      if (session.isSuperAdmin) return true;

      // Must be an admin user
      if (session.groupType !== "admin") return false;

      // Check if any route permission pattern matches the requested path
      return session.routePermissions.some((pattern) => {
        // Exact match
        if (pattern === check.path) return true;
        // Wildcard match (e.g., "/admin/users*" matches "/admin/users/create")
        if (pattern.endsWith("*")) {
          const prefix = pattern.slice(0, -1);
          return check.path.startsWith(prefix);
        }
        // startsWith match for standard patterns
        return check.path.startsWith(pattern);
      });
    }

    case "super_admin": {
      const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
      if (!superAdminEmail) return false;
      return session.email === superAdminEmail;
    }

    default:
      return false;
  }
}
