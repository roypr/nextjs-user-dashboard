/**
 * @fileoverview Account area layout — protected route.
 * Calls getSession() + authorize(session, { type: 'any' }) and redirects to /login if unauthorized.
 */

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";

/**
 * Account layout with authentication check.
 * Redirects unauthenticated users to /login.
 */
export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!authorize(session, { type: "any" })) {
    redirect("/login");
  }

  return <>{children}</>;
}
