/**
 * @fileoverview Dynamic frontend header component with responsive navigation.
 * Reads session via getSession() and settings via getCachedSettings(),
 * then renders the appropriate header menu based on auth state.
 * Collapses to hamburger menu on mobile viewports.
 * Falls back to static links if settings are unavailable.
 */

import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getCachedSettings } from "@/lib/settings-cache";
import HeaderMobileNav from "./header-mobile-nav";

/**
 * Frontend header with dynamic navigation based on authentication state.
 * Shows different menu items for logged-in vs logged-out users.
 * Responsive: shows hamburger menu on mobile (< 768px).
 */
export default async function Header() {
  const [session, settings] = await Promise.all([
    getSession(),
    getCachedSettings().catch(() => null),
  ]);

  const isLoggedIn = !!session;
  const siteName = settings?.siteName ?? "My App";
  const menuItems = isLoggedIn
    ? settings?.headerMenuLoggedIn ?? [
        { label: "Dashboard", href: "/account/dashboard" },
      ]
    : settings?.headerMenuLoggedOut ?? [
        { label: "Home", href: "/" },
        { label: "Login", href: "/login" },
      ];

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold text-gray-900">
          {siteName}
        </Link>

        {/* Desktop navigation — hidden on mobile */}
        <nav className="hidden items-center space-x-4 md:flex">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              {item.label}
            </Link>
          ))}
          {isLoggedIn && (
            <Link
              href="/logout"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Logout
            </Link>
          )}
        </nav>

        {/* Mobile hamburger toggle */}
        <HeaderMobileNav
          menuItems={menuItems}
          isLoggedIn={isLoggedIn}
        />
      </div>
    </header>
  );
}
