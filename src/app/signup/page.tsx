/**
 * @fileoverview Frontend signup page.
 * Registration form with email and password fields.
 * Uses useActionState with the signup Server Action.
 */

"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/lib/actions/auth";
import Button from "@/components/shared/button";
import Input from "@/components/shared/input";
import Alert from "@/components/shared/alert";

/**
 * Signup page with email and password registration form.
 */
export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, undefined);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Create Account
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
            autoComplete="new-password"
            required
          />
          <Button type="submit" fullWidth loading={pending}>
            Create Account
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
