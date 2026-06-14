/**
 * @fileoverview Custom 404 page.
 * Rendered when a route is not found.
 * Shows a "Page not found" message with a link back to the home page.
 */

import Link from "next/link";

/**
 * 404 Not Found page with a link back to the home page.
 * Static component — no data fetching needed.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-gray-900">404</h1>
        <p className="mb-2 text-xl text-gray-700">Page not found</p>
        <p className="mb-8 text-gray-500">
          The page you&apos;re looking for doesn&apos;t exist or has been
          moved.
        </p>
        <Link
          href="/"
          className="rounded bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
