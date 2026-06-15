/**
 * @fileoverview Admin pages list page.
 * Displays a paginated table of CMS pages with search functionality.
 * Columns: title, slug, updatedAt, actions.
 * Warm-professional card design with styled table.
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
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="page-heading">Pages</h1>
        <Link
          href="/admin/pages/create"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-[var(--accent-hover)] active:scale-[0.97]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Page
        </Link>
      </div>

      <SearchInput
        placeholder="Search by title..."
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
                    Title
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    Slug
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    Last Updated
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {result.pages.map((page) => (
                  <tr key={page.id} className="transition-colors hover:bg-[var(--bg-subtle)]">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-[var(--text-primary)]">
                      {page.title}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-[var(--text-secondary)]">
                      /{page.slug}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-[var(--text-secondary)]">
                      {page.updatedAt.toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <Link
                        href={`/admin/pages/${page.id}/edit`}
                        className="font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
                {result.pages.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">
                      No pages found.
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
          baseUrl="/admin/pages"
          queryString={query ? `search=${encodeURIComponent(query)}` : undefined}
        />
      </Suspense>
    </div>
  );
}
