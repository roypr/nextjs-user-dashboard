/**
 * @fileoverview Global error boundary page.
 * Rendered when an unhandled error occurs in any route segment.
 * Shows a centered card with error message and retry button.
 */

"use client";

/**
 * Global error boundary with retry functionality.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDev = process.env.NODE_ENV === "development";

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
          An unexpected error occurred. Please try again later.
        </p>
        {isDev && error?.message && (
          <p className="mb-4 rounded-lg bg-[var(--error-bg)] px-3 py-2 text-xs text-[var(--error)] font-mono">
            {error.message}
          </p>
        )}
        <button
          onClick={reset}
          className="rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-[var(--accent-hover)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
