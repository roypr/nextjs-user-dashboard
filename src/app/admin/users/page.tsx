/**
 * @fileoverview Admin user list page.
 * Displays a paginated table of users with search functionality.
 * Columns: name, email, phone, group, verified, actions.
 * Warm-professional card design with styled table.
 */

import { Suspense } from "react";
import Link from "next/link";
import { getUsers } from "@/lib/actions/admin/users";
import SearchInput from "@/components/shared/search-input";
import Pagination from "@/components/shared/pagination";
import LoadingSpinner from "@/components/shared/loading-spinner";

interface UsersPageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

/**
 * Admin users list page with search and pagination.
 */
export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  const query = params.search || "";
  const page = parseInt(params.page || "1", 10);

  const result = await getUsers(query || undefined, page);

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="page-heading">Users</h1>
        <Link
          href="/admin/users/create"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-[var(--accent-hover)] active:scale-[0.97]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create User
        </Link>
      </div>

      <SearchInput
        placeholder="Search by name, email, or phone..."
        defaultValue={query}
        className="mb-4"
      />

      <Suspense fallback={<LoadingSpinner className="py-12" />}>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--border)]">
              <thead>
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    Name
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    Email
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    Phone
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    Group
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    Verified
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {result.users.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-[var(--bg-subtle)]">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-[var(--text-primary)]">
                      {user.name || "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-[var(--text-secondary)]">
                      {user.email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-[var(--text-secondary)]">
                      {user.phone || "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-[var(--text-secondary)]">
                      {user.group?.name || "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {user.emailVerified ? (
                        <span className="badge bg-[var(--success-bg)] text-[var(--success)]">
                          Verified
                        </span>
                      ) : (
                        <span className="badge bg-[var(--warning-bg)] text-[var(--warning)]">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <Link
                        href={`/admin/users/${user.id}/edit`}
                        className="font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
                {result.users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination
          currentPage={result.currentPage}
          totalPages={result.totalPages}
          baseUrl="/admin/users"
          queryString={query ? `search=${encodeURIComponent(query)}` : undefined}
        />
      </Suspense>
    </div>
  );
}
