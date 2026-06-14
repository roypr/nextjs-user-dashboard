/**
 * @fileoverview Admin sidebar with permission-filtered navigation and responsive
 * hamburger toggle. Collapses to overlay menu on mobile (max-width: 768px).
 * Fetches the current session and filters visible menu items based on
 * routePermissions. Super Admin sees all items. Groups link is only
 * visible to Super Admin users.
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
 * Filters menu items based on the current user's route permissions.
 * Super Admin sees all items. Groups link is Super Admin only.
 * Responsive: collapses to overlay on mobile via SidebarToggle.
 */
export default async function Sidebar() {
  const session = await getSession();

  const filteredItems = allNavItems.filter((item) => {
    // Super Admin sees everything
    if (session?.isSuperAdmin) return true;

    // Groups is Super Admin only
    if (item.requiredPermission === "super_admin") return false;

    // Check route permission for items that require it
    if (item.requiredRoute) {
      return authorize(session, { type: "route", path: item.requiredRoute });
    }

    return true;
  });

  return (
    <>
      {/* Mobile toggle button — visible below md breakpoint */}
      <SidebarToggle />

      {/* Sidebar — hidden on mobile by default, toggled via JS */}
      <aside
        id="admin-sidebar"
        className="fixed inset-y-0 left-0 z-40 flex w-64 -translate-x-full flex-col border-r border-gray-200 bg-white transition-transform duration-200 md:static md:translate-x-0"
      >
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <Link
            href="/admin/dashboard"
            className="text-lg font-bold text-gray-900"
          >
            Admin Panel
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {filteredItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-gray-200 px-6 py-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Site
          </Link>
        </div>
      </aside>

      {/* Overlay backdrop for mobile sidebar */}
      <div
        id="sidebar-overlay"
        className="fixed inset-0 z-30 hidden bg-black/50 md:hidden"
        onClick={() => {
          document.getElementById("admin-sidebar")?.classList.add("-translate-x-full");
          document.getElementById("sidebar-overlay")?.classList.add("hidden");
        }}
      />
    </>
  );
}
