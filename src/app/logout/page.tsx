/**
 * @fileoverview Logout page.
 * Reads session, destroys it via the logout Server Action, and redirects to home.
 * Uses a "logging out" message while the redirect happens.
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
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-gray-500">Logging out...</p>
    </div>
  );
}
