/**
 * @fileoverview Admin pages list page.
 * Displays a paginated table of CMS pages with search functionality.
 * Columns: title, slug, updatedAt, actions.
 */

import { Suspense } from "react";
import Link from "next/link";
import { getPages } from "@/lib/actions/admin/pages";
import SearchInput from "@/components/shared/search-input";
import Pagination from "@/components/shared/pagination";
import LoadingSpinner from "@/components/shared/loading-spinner";

interface PagesPageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

/**
 * Admin pages list page with search and pagination.
 */
export default async function PagesPage({ searchParams }: PagesPageProps) {
  const params = await searchParams;
  const query = params.search || "";
  const page = parseInt(params.page || "1", 10);

  const result = await getPages(query || undefined, page);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
        <Link
          href="/admin/pages/create"
          className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Create Page
        </Link>
      </div>

      <SearchInput
        placeholder="Search by title..."
        defaultValue={query}
        className="mb-4"
      />

      <Suspense fallback={<LoadingSpinner />}>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {result.pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {page.title}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    /{page.slug}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {page.updatedAt.toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <Link
                      href={`/admin/pages/${page.id}/edit`}
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {result.pages.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    No pages found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={result.currentPage}
          totalPages={result.totalPages}
          baseUrl="/admin/pages"
          queryString={query ? `search=${encodeURIComponent(query)}` : undefined}
        />
      </Suspense>
    </div>
  );
}
