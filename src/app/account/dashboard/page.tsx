/**
 * @fileoverview User account dashboard page.
 * Empty dashboard with welcome message showing the user's email.
 */

import { getSession } from "@/lib/auth/session";

/**
 * User dashboard — shows welcome message with user's email.
 */
export default async function AccountDashboardPage() {
  const session = await getSession();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">
        My Dashboard
      </h1>
      <p className="text-gray-600">
        Welcome, {session?.email ?? "User"}.
      </p>
    </div>
  );
}
