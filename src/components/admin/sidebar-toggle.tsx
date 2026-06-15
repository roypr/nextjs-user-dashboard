/**
 * @fileoverview Client-side hamburger toggle button for the admin sidebar.
 * Visible only on mobile viewports. Toggles the sidebar visibility and
 * overlay backdrop via DOM class manipulation.
 * Styled to match the dark sidebar theme.
 */

"use client";

/**
 * Hamburger menu toggle button for the responsive admin sidebar.
 * Toggles the sidebar and overlay visibility when clicked.
 * Only visible on screens smaller than the md breakpoint (768px).
 */
export default function SidebarToggle() {
  function toggleSidebar() {
    const sidebar = document.getElementById("admin-sidebar");
    const overlay = document.getElementById("sidebar-overlay");

    if (!sidebar) return;

    const isHidden = sidebar.classList.contains("-translate-x-full");

    if (isHidden) {
      sidebar.classList.remove("-translate-x-full");
      overlay?.classList.remove("hidden");
    } else {
      sidebar.classList.add("-translate-x-full");
      overlay?.classList.add("hidden");
    }
  }

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="fixed left-4 top-4 z-50 rounded-lg bg-[var(--bg-card)] p-2.5 shadow-md md:hidden"
        aria-label="Toggle sidebar menu"
      >
        <svg
          className="h-5 w-5 text-[var(--text-primary)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <div
        id="sidebar-overlay"
        className="fixed inset-0 z-30 hidden bg-black/50 md:hidden"
        onClick={toggleSidebar}
      />
    </>
  );
}
