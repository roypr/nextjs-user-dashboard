/**
 * @fileoverview Admin login page.
 * Admin-specific login form in a centered card with dark accent.
 * Passes isAdmin: true to the login action.
 * Only allows users in admin-type groups to log in.
 */

"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth";
import Button from "@/components/shared/button";
import Input from "@/components/shared/input";
import Alert from "@/components/shared/alert";

/**
 * Admin login page with email and password form in a card.
 */
export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-sidebar)] px-4">
      <div className="card-lg w-full max-w-sm animate-slide-up border-[#1e293b] bg-[#1a2235] p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="page-heading mb-1 text-white">Admin Sign In</h1>
          <p className="text-sm text-[#94a3b8]">
            Authorized personnel only.
          </p>
        </div>

        {state?.success && <div className="mb-4"><Alert type="success" message={state.success} /></div>}
        {state?.error && <div className="mb-4"><Alert type="error" message={state.error} /></div>}

        <form action={formAction} className="space-y-5">
          <input type="hidden" name="isAdmin" value="true" />

          <div className="mb-4">
            <label className="label-base !text-[#cbd5e1]">Email</label>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="input-base !border-[#334155] !bg-[#0f172a] !text-white placeholder:!text-[#64748b] focus:!border-[var(--accent)] focus:!shadow-[0_0_0_3px_var(--accent-ring)]"
              placeholder="admin@example.com"
            />
          </div>

          <div className="mb-4">
            <label className="label-base !text-[#cbd5e1]">Password</label>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="input-base !border-[#334155] !bg-[#0f172a] !text-white placeholder:!text-[#64748b] focus:!border-[var(--accent)] focus:!shadow-[0_0_0_3px_var(--accent-ring)]"
              placeholder="Enter your password"
            />
          </div>

          <Button type="submit" fullWidth loading={pending}>
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
