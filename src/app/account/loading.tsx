/**
 * @fileoverview Account area loading skeleton.
 * Rendered as a fallback while account page content is being fetched.
 * Shows a pulsing placeholder animation.
 */

import LoadingSpinner from "@/components/shared/loading-spinner";

/**
 * Account area loading state with a centered spinner.
 */
export default function AccountLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}
