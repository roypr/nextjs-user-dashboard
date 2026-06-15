/**
 * @fileoverview Logout page.
 * Reads session, destroys it via the logout Server Action, and redirects to home.
 * Shows a centered "logging out" message while the redirect happens.
 */

"use client";

import { useEffect } from "react";
import { logout } from "@/lib/actions/auth";

/**
 * Logout page that calls the logout action on mount and redirects.
 */
export default function LogoutPage() {
  useEffect(() => {
    logout();
  }, []);

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="text-center">
        <svg
          className="mx-auto mb-4 h-8 w-8 animate-spin text-[var(--accent)]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm text-[var(--text-muted)]">Logging out...</p>
      </div>
    </div>
  );
}
