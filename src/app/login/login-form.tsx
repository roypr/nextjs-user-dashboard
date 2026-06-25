/**
 * @fileoverview Client component: login form with useActionState and redirect search param.
 * Extracted from page.tsx to allow the page to be a server component with session checks.
 */
"use client";

import { Suspense } from "react";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/actions/auth";
import Button from "@/components/shared/button";
import Input from "@/components/shared/input";
import Alert from "@/components/shared/alert";

/**
 * Inner login form that reads redirect from URL search params.
 */
function LoginFormInner() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "";

  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="card-lg w-full max-w-sm animate-slide-up p-8">
        <div className="mb-8 text-center">
          <h1 className="page-heading mb-1">Sign In</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Welcome back! Sign in to your account.
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
            autoComplete="current-password"
            required
          />
          <Button type="submit" fullWidth loading={pending}>
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-[var(--text-secondary)]">
          <Link
            href={redirectTo ? `/signup?redirect=${encodeURIComponent(redirectTo)}` : "/signup"}
            className="font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
          >
            Create an account
          </Link>
          <span className="mx-2 text-[var(--text-muted)]">·</span>
          <Link href="/forgot-password" className="font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Wrapped in Suspense for useSearchParams compatibility.
 */
export default function LoginForm() {
  return (
    <Suspense>
      <LoginFormInner />
    </Suspense>
  );
}