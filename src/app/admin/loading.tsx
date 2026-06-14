/**
 * @fileoverview Admin area loading skeleton.
 * Rendered as a fallback while admin page content is being fetched.
 * Shows a pulsing placeholder animation.
 */

import LoadingSpinner from "@/components/shared/loading-spinner";

/**
 * Admin area loading state with a centered spinner.
 */
export default function AdminLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}
