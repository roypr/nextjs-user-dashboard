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
 * vertical menu overlay. Auto-closes on link click.
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
        className="rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute inset-x-0 top-16 z-50 border-b border-gray-200 bg-white px-4 pb-4 shadow-lg">
          <nav className="flex flex-col space-y-2 pt-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {item.label}
              </Link>
            ))}
            {isLoggedIn && (
              <Link
                href="/logout"
                onClick={() => setIsOpen(false)}
                className="rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
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
