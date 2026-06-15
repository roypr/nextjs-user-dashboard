/**
 * @fileoverview Email verification page.
 * Reads the token from searchParams and calls verifyEmail on mount.
 * Shows success or error message in a centered card.
 */

"use client";

import { Suspense, useActionState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyEmail } from "@/lib/actions/auth";
import Alert from "@/components/shared/alert";
import LoadingSpinner from "@/components/shared/loading-spinner";

/**
 * Inner form component that reads token from URL search params.
 * Must be wrapped in a Suspense boundary per Next.js requirements.
 */
function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [state, formAction, pending] = useActionState(verifyEmail, undefined);

  useEffect(() => {
    if (token && !state) {
      const formData = new FormData();
      formData.set("token", token);
      formAction(formData);
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="card-lg w-full max-w-sm animate-slide-up p-8 text-center">
        <h1 className="page-heading mb-6">Email Verification</h1>

        {pending && <LoadingSpinner size="lg" className="py-8" />}

        {!token && !pending && (
          <Alert type="error" message="Missing verification token." />
        )}

        {state?.success && (
          <div className="space-y-4">
            <Alert type="success" message={state.success} />
            <Link
              href="/login"
              className="inline-block text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
            >
              Sign in to your account →
            </Link>
          </div>
        )}

        {state?.error && (
          <div className="space-y-4">
            <Alert type="error" message={state.error} />
            <Link
              href="/resend-verification"
              className="inline-block text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
            >
              Resend verification email →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Email verification page with Suspense boundary.
 */
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[70vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}
