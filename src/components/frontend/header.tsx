/**
 * @fileoverview Frontend header component.
 * Static placeholder showing site name and navigation links (Home, Login).
 * Will become dynamic in Phase 2 with settings-based menu items.
 */

import Link from "next/link";

/**
 * Frontend header with site name and navigation links.
 */
export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold text-gray-900">
          My App
        </Link>
        <nav className="flex items-center space-x-4">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Home
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
