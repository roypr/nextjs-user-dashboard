/**
 * @fileoverview Email verification page.
 * Reads the token from searchParams and calls verifyEmail on mount.
 * Shows success or error message.
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

  // Create a form data object and pass it to verifyEmail
  const [state, formAction, pending] = useActionState(verifyEmail, undefined);

  useEffect(() => {
    if (token && !state) {
      const formData = new FormData();
      formData.set("token", token);
      formAction(formData);
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          Email Verification
        </h1>

        {pending && <LoadingSpinner size="lg" />}

        {!token && !pending && (
          <Alert type="error" message="Missing verification token." />
        )}

        {state?.success && (
          <>
            <Alert type="success" message={state.success} />
            <p className="mt-4">
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-500"
              >
                Sign in to your account
              </Link>
            </p>
          </>
        )}

        {state?.error && (
          <>
            <Alert type="error" message={state.error} />
            <p className="mt-4">
              <Link
                href="/resend-verification"
                className="text-blue-600 hover:text-blue-500"
              >
                Resend verification email
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Verify email page with Suspense boundary for useSearchParams.
 */
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><LoadingSpinner size="lg" /></div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
