/**
 * @fileoverview Global loading skeleton.
 * Rendered as a fallback while page content is being fetched.
 * Shows a pulsing placeholder animation.
 */

import LoadingSpinner from "@/components/shared/loading-spinner";

/**
 * Global loading state with a centered spinner.
 */
export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}
