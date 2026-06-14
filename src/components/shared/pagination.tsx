/**
 * @fileoverview Reusable pagination component with Previous/Next buttons and page numbers.
 * Supports optional baseUrl for query-parameter-based navigation.
 */

import Link from "next/link";

interface PaginationProps {
  /** Current active page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Base URL path for generating page links */
  baseUrl: string;
  /** Additional query params as a string (e.g., "search=foo") */
  queryString?: string;
}

function buildPageUrl(baseUrl: string, page: number, queryString?: string): string {
  const separator = baseUrl.includes("?") ? "&" : "?";
  const qs = queryString ? `${separator}${queryString}&page=${page}` : `${separator}page=${page}`;
  return `${baseUrl}${qs}`;
}

/**
 * Pagination navigation component.
 * Shows Previous/Next buttons and numbered page buttons (max 7 visible).
 *
 * @param props.currentPage - The current active page (1-indexed).
 * @param props.totalPages - The total number of pages.
 * @param props.baseUrl - The base URL path for page links.
 * @param props.queryString - Optional query params string to preserve.
 */
export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  queryString,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <nav className="mt-6 flex items-center justify-center gap-1" aria-label="Pagination">
      {currentPage > 1 ? (
        <Link
          href={buildPageUrl(baseUrl, currentPage - 1, queryString)}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
        >
          Previous
        </Link>
      ) : (
        <span className="rounded border border-gray-200 px-3 py-1.5 text-sm text-gray-400">
          Previous
        </span>
      )}

      {pages.map((page, idx) =>
        page === "..." ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-sm text-gray-500">
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={buildPageUrl(baseUrl, page, queryString)}
            className={`rounded px-3 py-1.5 text-sm ${
              page === currentPage
                ? "bg-blue-600 text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {page}
          </Link>
        ),
      )}

      {currentPage < totalPages ? (
        <Link
          href={buildPageUrl(baseUrl, currentPage + 1, queryString)}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
        >
          Next
        </Link>
      ) : (
        <span className="rounded border border-gray-200 px-3 py-1.5 text-sm text-gray-400">
          Next
        </span>
      )}
    </nav>
  );
}
