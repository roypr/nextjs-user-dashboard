/**
 * @fileoverview Reset password page.
 * Reads the token from searchParams and shows a new password form.
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
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Set New Password
        </h1>

        {state?.success && <Alert type="success" message={state.success} />}
        {state?.error && <Alert type="error" message={state.error} />}

        {!token && (
          <Alert type="error" message="Missing reset token. Please use the link from your email." />
        )}

        {token && !state?.success && (
          <form action={formAction} className="space-y-4">
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

        {!state?.success && (
          <p className="mt-4 text-center text-sm text-gray-600">
            <Link href="/login" className="text-blue-600 hover:text-blue-500">
              Back to sign in
            </Link>
          </p>
        )}
        {state?.success && (
          <p className="mt-4 text-center text-sm text-gray-600">
            <Link href="/login" className="text-blue-600 hover:text-blue-500">
              Sign in with your new password
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Reset password page with Suspense boundary for useSearchParams.
 */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><p className="text-gray-500">Loading...</p></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
