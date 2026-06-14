/**
 * @fileoverview Admin root layout — wraps children in AdminLayout and enforces
 * admin authorization. Redirects non-admin users to /admin/login.
 */

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";
import AdminLayout from "@/components/admin/admin-layout";

/**
 * Admin layout with authorization check.
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

  return <AdminLayout>{children}</AdminLayout>;
}
