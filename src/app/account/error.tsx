/**
 * @fileoverview Account area error boundary.
 * Rendered when an unhandled error occurs in the account route group.
 * Shows a message with a retry button and a link back to the account dashboard.
 */

"use client";

import Link from "next/link";

/**
 * Account area error boundary with retry and navigation options.
 * @param error - The error that was thrown.
 * @param reset - Function to retry rendering the segment.
 */
export default function AccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          Something went wrong
        </h1>
        <p className="mb-6 text-gray-600">
          An error occurred in your account area. Please try again.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="rounded bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try again
          </button>
          <Link
            href="/account/dashboard"
            className="rounded bg-gray-200 px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
