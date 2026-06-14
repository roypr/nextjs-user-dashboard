/**
 * @fileoverview Edit group page for admin (Super Admin only).
 * Fetches the group data and renders a client-side edit form.
 * Disables type/permissions editing if this is the Super Admin's own group.
 */

import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";
import EditGroupForm from "./edit-group-form";

interface EditGroupPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Admin edit group page — fetches group and renders form.
 */
export default async function EditGroupPage({ params }: EditGroupPageProps) {
  const { id } = await params;

  // Check authorization — Super Admin only
  const session = await getSession();
  if (!authorize(session, { type: "super_admin" })) {
    return notFound();
  }

  const group = await prisma.userGroup.findUnique({
    where: { id },
    include: {
      _count: { select: { users: true } },
    },
  });

  if (!group) {
    return notFound();
  }

  // Determine if this group cannot have its type/permissions changed
  // (Super Admin's own group — prevent lockout)
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  const isSuperAdminGroup =
    session?.isSuperAdmin && session.groupId === group.id;

  // Also check if any user in this group is the Super Admin
  const hasSuperAdminUser = superAdminEmail
    ? await prisma.user.findFirst({
        where: {
          email: superAdminEmail,
          groupId: group.id,
        },
        select: { id: true },
      })
    : null;

  const canChangePermissions = !(isSuperAdminGroup || !!hasSuperAdminUser);

  return (
    <EditGroupForm
      group={{
        id: group.id,
        name: group.name,
        type: group.type,
        routePermissions: group.routePermissions,
        userCount: group._count.users,
      }}
      canChangePermissions={canChangePermissions}
    />
  );
}
