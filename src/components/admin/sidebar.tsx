/**
 * @fileoverview Admin sidebar with navigation links.
 * Static for Phase 1 — links to Dashboard, Users, Pages, Settings.
 * Groups link will be added in Phase 3 (Super Admin only).
 */

import Link from "next/link";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Users", href: "/admin/users" },
  { label: "Pages", href: "/admin/pages" },
  { label: "Settings", href: "/admin/settings" },
];

/**
 * Admin sidebar navigation component.
 */
export default function Sidebar() {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <Link href="/admin/dashboard" className="text-lg font-bold text-gray-900">
          Admin Panel
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
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
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to Site
        </Link>
      </div>
    </aside>
  );
}
