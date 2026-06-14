/**
 * @fileoverview Admin dashboard page.
 * Empty dashboard with a welcome message for admin users.
 */

import { getSession } from "@/lib/auth/session";

/**
 * Admin dashboard — shows welcome message with admin email.
 */
export default async function AdminDashboardPage() {
  const session = await getSession();

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">
        Admin Dashboard
      </h1>
      <p className="text-gray-600">
        Welcome, {session?.email ?? "Admin"}.
      </p>
    </div>
  );
}
