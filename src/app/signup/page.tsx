/**
 * @fileoverview Frontend signup page.
 * Registration form in a centered card with email and password fields.
 * Uses useActionState with the signup Server Action.
 * Supports a ?redirect= search param to persist through email verification flow.
 */

"use client";

import { Suspense } from "react";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signup } from "@/lib/actions/auth";
import Button from "@/components/shared/button";
import Input from "@/components/shared/input";
import Alert from "@/components/shared/alert";

/**
 * Inner signup form that reads redirect from URL search params.
 */
function SignupForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "";

  const [state, formAction, pending] = useActionState(signup, undefined);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="card-lg w-full max-w-sm animate-slide-up p-8">
        <div className="mb-8 text-center">
          <h1 className="page-heading mb-1">Create Account</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Get started with your free account.
          </p>
        </div>

        {state?.success && <div className="mb-4"><Alert type="success" message={state.success} /></div>}
        {state?.error && <div className="mb-4"><Alert type="error" message={state.error} /></div>}

        <form action={formAction} className="space-y-5">
          {redirectTo && <input type="hidden" name="redirect" value={redirectTo} />}
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

        <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
          Already have an account?{" "}
          <Link
            href={redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login"}
            className="font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

/**
 * Signup page with Suspense boundary for searchParams access.
 */
export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
