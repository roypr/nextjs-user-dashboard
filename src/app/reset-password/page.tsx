/**
 * @fileoverview Reset password page.
 * Reads the token from searchParams and shows a new password form in a card.
 * Uses useActionState with the resetPassword Server Action.
 */

"use client";

import { Suspense } from "react";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/lib/actions/auth";
import Button from "@/components/shared/button";
import Input from "@/components/shared/input";
import Alert from "@/components/shared/alert";

/**
 * Inner form component that reads token from URL search params.
 * Must be wrapped in a Suspense boundary per Next.js requirements.
 */
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, formAction, pending] = useActionState(resetPassword, undefined);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="card-lg w-full max-w-sm animate-slide-up p-8">
        <div className="mb-8 text-center">
          <h1 className="page-heading mb-1">Set New Password</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Enter your new password below.
          </p>
        </div>

        {state?.success && <div className="mb-4"><Alert type="success" message={state.success} /></div>}
        {state?.error && <div className="mb-4"><Alert type="error" message={state.error} /></div>}

        {!token && (
          <Alert type="error" message="Missing reset token. Please use the link from your email." />
        )}

        {token && !state?.success && (
          <form action={formAction} className="space-y-5">
            <input type="hidden" name="token" value={token} />
            <Input
              label="New Password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
            />
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
            />
            <Button type="submit" fullWidth loading={pending}>
              Reset Password
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          {!state?.success && (
            <p className="text-sm text-[var(--text-secondary)]">
              <Link href="/login" className="font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]">
                Back to sign in
              </Link>
            </p>
          )}
          {state?.success && (
            <p className="text-sm text-[var(--text-secondary)]">
              <Link href="/login" className="font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]">
                Sign in with your new password
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Reset password page with Suspense boundary for useSearchParams.
 */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-sm text-[var(--text-muted)]">Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
