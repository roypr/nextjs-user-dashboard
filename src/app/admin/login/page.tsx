/**
 * @fileoverview Admin login page.
 * Admin-specific login form that passes isAdmin: true to the login action.
 * Only allows users in admin-type groups to log in.
 */

"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth";
import Button from "@/components/shared/button";
import Input from "@/components/shared/input";
import Alert from "@/components/shared/alert";

/**
 * Admin login page with email and password form.
 */
export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Admin Sign In
        </h1>

        {state?.success && <Alert type="success" message={state.success} />}
        {state?.error && <Alert type="error" message={state.error} />}

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="isAdmin" value="true" />
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
          <Button type="submit" fullWidth loading={pending}>
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
