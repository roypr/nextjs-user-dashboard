/**
 * @fileoverview Global error boundary page.
 * Rendered when an unhandled error occurs in any route segment.
 * Shows a "Something went wrong" message with a retry button.
 */

"use client";

/**
 * Global error boundary with retry functionality.
 * @param error - The error that was thrown.
 * @param reset - Function to retry rendering the segment.
 */
export default function Error({
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
          An unexpected error occurred. Please try again later.
        </p>
        <button
          onClick={reset}
          className="rounded bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
