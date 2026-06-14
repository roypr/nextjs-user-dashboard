/**
 * @fileoverview Create user page for admin.
 * Server component that fetches groups and renders a client-side create form
 * with email, password, name, and group dropdown.
 */

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";
import { redirect } from "next/navigation";
import CreateUserForm from "./create-user-form";

/**
 * Admin create user page — fetches groups and renders form.
 */
export default async function CreateUserPage() {
  const session = await getSession();
  if (
    !authorize(session, { type: "admin" }) ||
    !authorize(session, { type: "route", path: "/admin/users" })
  ) {
    redirect("/admin/dashboard");
  }

  const groups = await prisma.userGroup.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return <CreateUserForm groups={groups} />;
}
