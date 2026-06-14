/**
 * @fileoverview Conditional rendering wrapper for permission-based UI elements.
 * Accepts an AuthCheck and session, renders children only if authorized.
 * Used for conditionally showing admin UI elements based on user permissions.
 */

import type { SessionData, AuthCheck } from "@/types";
import { authorize } from "@/lib/auth/authorize";
import { getSession } from "@/lib/auth/session";

interface PermissionGuardProps {
  /** The authorization check to evaluate */
  requiredPermission: AuthCheck;
  /** Content to render if authorized */
  children: React.ReactNode;
  /** Optional fallback content to render if unauthorized */
  fallback?: React.ReactNode;
}

/**
 * Permission guard component — renders children only if the current session
 * satisfies the required authorization check.
 *
 * @param props.requiredPermission - The authorization check descriptor.
 * @param props.children - Content to render when authorized.
 * @param props.fallback - Optional content to render when unauthorized.
 *
 * @example
 * ```tsx
 * <PermissionGuard requiredPermission={{ type: 'route', path: '/admin/users' }}>
 *   <Link href="/admin/users">Users</Link>
 * </PermissionGuard>
 * ```
 */
export default async function PermissionGuard({
  requiredPermission,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const session = await getSession();
  const isAuthorized = authorize(session, requiredPermission);

  if (isAuthorized) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
