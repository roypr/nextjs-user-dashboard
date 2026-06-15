/**
 * @fileoverview Admin sidebar with permission-filtered navigation and responsive
 * hamburger toggle. Dark navy theme. Collapses to overlay menu on mobile.
 * Fetches the current session and filters visible menu items based on
 * routePermissions. Super Admin sees all items.
 */

import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";
import SidebarToggle from "./sidebar-toggle";

interface NavItem {
  label: string;
  href: string;
  /** Required permission to see this item. null = any authenticated admin. */
  requiredPermission?: "admin" | "super_admin";
  /** Route permission pattern required to see this item (only checked for non-super-admins) */
  requiredRoute?: string;
}

const allNavItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard" },
  {
    label: "Users",
    href: "/admin/users",
    requiredRoute: "/admin/users",
  },
  {
    label: "Pages",
    href: "/admin/pages",
    requiredRoute: "/admin/pages",
  },
  {
    label: "Settings",
    href: "/admin/settings",
    requiredRoute: "/admin/settings",
  },
  {
    label: "Groups",
    href: "/admin/groups",
    requiredPermission: "super_admin",
  },
];

/**
 * Admin sidebar navigation component.
 * Dark navy background with white text.
 * Filters menu items based on the current user's route permissions.
 * Responsive: collapses to overlay on mobile via SidebarToggle.
 */
export default async function Sidebar() {
  const session = await getSession();

  const filteredItems = allNavItems.filter((item) => {
    if (session?.isSuperAdmin) return true;
    if (item.requiredPermission === "super_admin") return false;
    if (item.requiredRoute) {
      return authorize(session, { type: "route", path: item.requiredRoute });
    }
    return true;
  });

  return (
    <>
      <SidebarToggle />

      <aside
        id="admin-sidebar"
        className="fixed inset-y-0 left-0 z-40 flex w-64 -translate-x-full flex-col border-r border-[#1e293b] bg-[var(--bg-sidebar)] transition-transform duration-200 md:static md:translate-x-0"
      >
        {/* Logo area */}
        <div className="flex h-16 items-center border-b border-[#1e293b] px-6">
          <Link
            href="/admin/dashboard"
            className="text-lg font-bold tracking-tight text-white"
          >
            Admin Panel
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {filteredItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#94a3b8] transition-colors hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Back to site link */}
        <div className="border-t border-[#1e293b] px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-[#64748b] transition-colors hover:text-[#94a3b8]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Site
          </Link>
        </div>
      </aside>
    </>
  );
}
