/**
 * @fileoverview Edit user page for admin.
 * Server component that fetches user data and groups, then renders a
 * client-side edit form with group dropdown.
 * Email is read-only if the user is the Super Admin.
 */

import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";
import EditUserForm from "./edit-user-form";

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Admin edit user page — fetches user and groups, renders form.
 */
export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params;

  // Check authorization
  const session = await getSession();
  if (!authorize(session, { type: "admin" }) || !authorize(session, { type: "route", path: "/admin/users" })) {
    return notFound();
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      groupId: true,
    },
  });

  if (!user) {
    return notFound();
  }

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  const isSuperAdmin = user.email === superAdminEmail;

  // Fetch all groups for the dropdown
  const groups = await prisma.userGroup.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <EditUserForm
      user={{
        ...user,
        isSuperAdmin,
      }}
      groups={groups}
    />
  );
}
