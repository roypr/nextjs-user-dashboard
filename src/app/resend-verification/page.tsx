/**
 * @fileoverview Resend verification email page.
 * Email input form that always shows success after submission
 * to prevent user enumeration.
 */

"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resendVerification } from "@/lib/actions/auth";
import Button from "@/components/shared/button";
import Input from "@/components/shared/input";
import Alert from "@/components/shared/alert";

/**
 * Resend verification form — always shows success after submit.
 */
export default function ResendVerificationPage() {
  const [state, formAction, pending] = useActionState(
    resendVerification,
    undefined,
  );

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
          Resend Verification
        </h1>
        <p className="mb-6 text-center text-sm text-gray-600">
          Enter your email and we&apos;ll send a new verification link.
        </p>

        {state?.success && <Alert type="success" message={state.success} />}
        {state?.error && <Alert type="error" message={state.error} />}

        {!state?.success && (
          <form action={formAction} className="space-y-4">
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

        <p className="mt-4 text-center text-sm text-gray-600">
          <Link href="/login" className="text-blue-600 hover:text-blue-500">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
