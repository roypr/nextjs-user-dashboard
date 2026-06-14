/**
 * @fileoverview Frontend login page.
 * Displays a login form using useActionState with the login Server Action.
 * If already logged in, shows a message instead of the form.
 */

"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/lib/actions/auth";
import Button from "@/components/shared/button";
import Input from "@/components/shared/input";
import Alert from "@/components/shared/alert";

/**
 * Login page with email and password form.
 */
export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Sign In
        </h1>

        {state?.success && <Alert type="success" message={state.success} />}
        {state?.error && <Alert type="error" message={state.error} />}

        <form action={formAction} className="space-y-4">
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

        <div className="mt-4 text-center text-sm text-gray-600">
          <Link href="/signup" className="text-blue-600 hover:text-blue-500">
            Create an account
          </Link>
          <span className="mx-2">·</span>
          <Link
            href="/forgot-password"
            className="text-blue-600 hover:text-blue-500"
          >
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}
