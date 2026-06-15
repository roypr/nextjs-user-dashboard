/**
 * @fileoverview Custom 404 page.
 * Rendered when a route is not found.
 * Shows a centered card with "Page not found" and a link back to the home page.
 */

import Link from "next/link";

/**
 * 404 Not Found page with a link back to the home page.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="card-lg w-full max-w-md animate-slide-up p-8 text-center">
        <h1 className="text-6xl font-bold tracking-tight text-[var(--accent)]">404</h1>
        <p className="mb-2 mt-4 text-xl font-semibold text-[var(--text-primary)]">Page not found</p>
        <p className="mb-8 text-sm text-[var(--text-secondary)]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-[var(--accent-hover)] active:scale-[0.97]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Go home
        </Link>
      </div>
    </div>
  );
}
