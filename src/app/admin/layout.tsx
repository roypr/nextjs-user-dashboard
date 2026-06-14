/**
 * @fileoverview Admin root layout — wraps children in AdminLayout, enforces
 * admin authorization, and refreshes session permissions if stale.
 * Redirects non-admin users to /admin/login.
 */

import { redirect } from "next/navigation";
import { getSession, updateSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";
import { getCachedPermissionVersion } from "@/lib/auth/session-cache";
import AdminLayout from "@/components/admin/admin-layout";

/**
 * Admin layout with authorization check and stale permission refresh.
 * If the session's permissionVersion doesn't match the DB (within cache window),
 * updates the session with fresh permissions.
 * Redirects unauthorized users to /admin/login.
 */
export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!authorize(session, { type: "admin" })) {
    redirect("/admin/login");
  }

  // Session is guaranteed non-null here since authorize returned true
  const currentSession = session!;

  // Check for stale permissionVersion — if mismatch, update session
  if (currentSession.groupId) {
    try {
      const cachedPermissionVersion = await getCachedPermissionVersion(
        currentSession.groupId,
      );
      if (cachedPermissionVersion !== currentSession.permissionVersion) {
        // Permission version changed — fetch fresh data and update session
        const prisma = (await import("@/lib/prisma")).default;
        const freshGroup = await prisma.userGroup.findUnique({
          where: { id: currentSession.groupId },
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
