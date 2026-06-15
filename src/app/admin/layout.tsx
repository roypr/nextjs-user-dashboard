/**
 * @fileoverview Admin root layout — wraps children in AdminLayout and refreshes
 * session permissions if stale.
 *
 * IMPORTANT: Auth enforcement for /admin/* routes is handled by proxy.ts
 * (middleware), which allows /admin/login through unprotected and redirects
 * unauthenticated users for all other admin routes. This layout does NOT
 * duplicate that check — it only refreshes stale permission versions for
 * already-authenticated sessions.
 */

import { getSession, updateSession } from "@/lib/auth/session";
import { getCachedPermissionVersion } from "@/lib/auth/session-cache";
import AdminLayout from "@/components/admin/admin-layout";

/**
 * Admin layout with stale permission refresh.
 * If the session's permissionVersion doesn't match the DB (within cache window),
 * updates the session with fresh permissions.
 * Auth enforcement is handled by the proxy.ts middleware.
 */
export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Only refresh permissions if we have a valid session
  if (session?.groupId) {
    try {
      const cachedPermissionVersion = await getCachedPermissionVersion(
        session.groupId,
      );
      if (cachedPermissionVersion !== session.permissionVersion) {
        // Permission version changed — fetch fresh data and update session
        const prisma = (await import("@/lib/prisma")).default;
        const freshGroup = await prisma.userGroup.findUnique({
          where: { id: session.groupId },
          select: {
            type: true,
            routePermissions: true,
            permissionVersion: true,
          },
        });

        if (freshGroup) {
          await updateSession({
            groupType: freshGroup.type,
            routePermissions: freshGroup.routePermissions,
            permissionVersion: freshGroup.permissionVersion,
          });
        }
      }
    } catch {
      // Silently handle — stale permissions are acceptable for one request
    }
  }

  return <AdminLayout>{children}</AdminLayout>;
}
