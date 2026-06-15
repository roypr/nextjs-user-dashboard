/**
 * @fileoverview Admin area error boundary.
 * Rendered when an unhandled error occurs in the admin route group.
 * Shows a card with a retry button and a link back to the admin dashboard.
 */

"use client";

import Link from "next/link";

/**
 * Admin area error boundary with retry and navigation options.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="card-lg w-full max-w-md animate-slide-up p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--error-bg)]">
          <svg className="h-6 w-6 text-[var(--error)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="page-heading mb-2">Something went wrong</h1>
        <p className="mb-6 text-sm text-[var(--text-secondary)]">
          An error occurred in the admin area. Please try again.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-[var(--accent-hover)] active:scale-[0.97]"
          >
            Try again
          </button>
          <Link
            href="/admin/dashboard"
            className="text-sm font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
