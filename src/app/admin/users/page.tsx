/**
 * @fileoverview Admin user list page.
 * Displays a paginated table of users with search functionality.
 * Columns: name, email, phone, group, verified, actions.
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
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <Link
          href="/admin/users/create"
          className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Create User
        </Link>
      </div>

      <SearchInput
        placeholder="Search by name, email, or phone..."
        defaultValue={query}
        className="mb-4"
      />

      <Suspense fallback={<LoadingSpinner />}>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Group
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Verified
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {result.users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {user.name || "—"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {user.phone || "—"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {user.group?.name || "—"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {user.emailVerified ? (
                      <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-yellow-100 px-2 text-xs font-semibold leading-5 text-yellow-800">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <Link
                      href={`/admin/users/${user.id}/edit`}
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {result.users.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
