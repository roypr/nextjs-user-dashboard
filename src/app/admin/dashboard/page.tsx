/**
 * @fileoverview Admin dashboard page.
 * Shows a welcome card with admin email and stats overview.
 */

import { getSession } from "@/lib/auth/session";

/**
 * Admin dashboard — shows welcome card with admin info.
 */
export default async function AdminDashboardPage() {
  const session = await getSession();

  return (
    <div className="animate-fade-in">
      <h1 className="page-heading mb-8">Admin Dashboard</h1>

      <div className="card-lg p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-light)]">
            <svg className="h-6 w-6 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-[var(--text-secondary)]">Welcome back,</p>
            <p className="text-lg font-semibold text-[var(--text-primary)]">
              {session?.email ?? "Admin"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
