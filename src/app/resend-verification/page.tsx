/**
 * @fileoverview Resend verification email page.
 * Email input form in a centered card that always shows success after submission
 * to prevent user enumeration.
 * Supports a ?redirect= search param to persist through the verification email flow.
 */

"use client";

import { Suspense } from "react";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { resendVerification } from "@/lib/actions/auth";
import Button from "@/components/shared/button";
import Input from "@/components/shared/input";
import Alert from "@/components/shared/alert";

/**
 * Inner resend form that reads redirect from URL search params.
 */
function ResendVerificationForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "";

  const [state, formAction, pending] = useActionState(
    resendVerification,
    undefined,
  );

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="card-lg w-full max-w-sm animate-slide-up p-8">
        <div className="mb-8 text-center">
          <h1 className="page-heading mb-1">Resend Verification</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Enter your email and we&apos;ll send a new verification link.
          </p>
        </div>

        {state?.success && <div className="mb-4"><Alert type="success" message={state.success} /></div>}
        {state?.error && <div className="mb-4"><Alert type="error" message={state.error} /></div>}

        {!state?.success && (
          <form action={formAction} className="space-y-5">
            {redirectTo && <input type="hidden" name="redirect" value={redirectTo} />}
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
            <Button type="submit" fullWidth loading={pending}>
              Send Verification Link
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
          <Link
            href={redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login"}
            className="font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

/**
 * Resend verification page with Suspense boundary for searchParams access.
 */
export default function ResendVerificationPage() {
  return (
    <Suspense>
      <ResendVerificationForm />
    </Suspense>
  );
}
