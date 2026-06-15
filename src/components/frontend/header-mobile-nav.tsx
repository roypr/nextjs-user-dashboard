/**
 * @fileoverview Client-side mobile navigation toggle for the frontend header.
 * Shows a hamburger button on mobile that toggles a slide-down menu.
 * Only visible on viewports below the md breakpoint (768px).
 */

"use client";

import { useState } from "react";
import Link from "next/link";

interface MenuItem {
  label: string;
  href: string;
}

interface HeaderMobileNavProps {
  menuItems: MenuItem[];
  isLoggedIn: boolean;
}

/**
 * Mobile navigation toggle with slide-down menu.
 * Renders a hamburger icon button on mobile that opens/closes a
 * vertical menu overlay.
 *
 * @param props.menuItems - The navigation items to display.
 * @param props.isLoggedIn - Whether the user is authenticated.
 */
export default function HeaderMobileNav({
  menuItems,
  isLoggedIn,
}: HeaderMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute inset-x-0 top-full z-50 border-b border-[var(--border)] bg-[var(--bg-card)] px-4 pb-4 pt-2 shadow-lg animate-fade-in">
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
              >
                {item.label}
              </Link>
            ))}
            {isLoggedIn && (
              <Link
                href="/logout"
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
              >
                Logout
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
