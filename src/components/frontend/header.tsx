/**
 * @fileoverview Dynamic frontend header component with responsive navigation.
 * Reads session via getSession() and settings via getCachedSettings(),
 * then renders the appropriate header menu based on auth state.
 * Collapses to hamburger menu on mobile viewports.
 * Sleeker warm-professional design with subtle glass-like border.
 */

import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getCachedSettings } from "@/lib/settings-cache";
import HeaderMobileNav from "./header-mobile-nav";

/**
 * Frontend header with dynamic navigation based on authentication state.
 * Shows different menu items for logged-in vs logged-out users.
 * Responsive: shows hamburger menu on mobile.
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
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg-card)]/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
          {siteName}
        </Link>

        {/* Desktop navigation — hidden on mobile */}
        <nav className="hidden items-center gap-1 md:flex">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            >
              {item.label}
            </Link>
          ))}
          {isLoggedIn && (
            <Link
              href="/logout"
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
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
