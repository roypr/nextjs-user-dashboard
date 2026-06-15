/**
 * @fileoverview Account area layout — protected route with sub-navigation.
 * Calls getSession() + authorize(session, { type: 'any' }) and redirects to /login if unauthorized.
 * Renders a sidebar with links to account pages using warm-professional design.
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";

const accountNavItems = [
  { label: "Dashboard", href: "/account/dashboard" },
  { label: "Profile", href: "/account/profile" },
  { label: "Change Password", href: "/account/change-password" },
  { label: "Change Email", href: "/account/change-email" },
  { label: "Delete Account", href: "/account/delete-profile" },
];

/**
 * Account layout with authentication check and sub-navigation.
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

  return (
    <div className="mx-auto flex max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <aside className="mr-8 hidden w-56 shrink-0 md:block">
        <nav className="space-y-1">
          {accountNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3.5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
