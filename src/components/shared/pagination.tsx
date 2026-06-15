/**
 * @fileoverview Reusable pagination component with Previous/Next buttons and page numbers.
 * Supports optional baseUrl for query-parameter-based navigation.
 * Styled consistently with the warm-professional design system.
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

  const linkBase = "inline-flex items-center justify-center rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-150";
  const activeStyle = "bg-[var(--accent)] text-white shadow-sm";
  const inactiveStyle = "border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]";
  const disabledStyle = "border border-[var(--border-light)] text-[var(--text-muted)] cursor-not-allowed";

  return (
    <nav className="mt-6 flex items-center justify-center gap-1.5" aria-label="Pagination">
      {currentPage > 1 ? (
        <Link
          href={buildPageUrl(baseUrl, currentPage - 1, queryString)}
          className={`${linkBase} ${inactiveStyle}`}
        >
          <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </Link>
      ) : (
        <span className={`${linkBase} ${disabledStyle}`}>
          <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </span>
      )}

      <div className="flex items-center gap-1">
        {pages.map((page, idx) =>
          page === "..." ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-sm text-[var(--text-muted)]">
              ...
            </span>
          ) : (
            <Link
              key={page}
              href={buildPageUrl(baseUrl, page, queryString)}
              className={`${linkBase} min-w-[2.25rem] ${
                page === currentPage ? activeStyle : inactiveStyle
              }`}
            >
              {page}
            </Link>
          ),
        )}
      </div>

      {currentPage < totalPages ? (
        <Link
          href={buildPageUrl(baseUrl, currentPage + 1, queryString)}
          className={`${linkBase} ${inactiveStyle}`}
        >
          Next
          <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <span className={`${linkBase} ${disabledStyle}`}>
          Next
          <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      )}
    </nav>
  );
}
