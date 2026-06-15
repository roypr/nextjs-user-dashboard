/**
 * @fileoverview Forgot password page.
 * Email input form in a centered card that always shows a success message
 * after submission to prevent user enumeration.
 */

"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/lib/actions/auth";
import Button from "@/components/shared/button";
import Input from "@/components/shared/input";
import Alert from "@/components/shared/alert";

/**
 * Forgot password form — always shows success after submit to prevent enumeration.
 */
export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(
    forgotPassword,
    undefined,
  );

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="card-lg w-full max-w-sm animate-slide-up p-8">
        <div className="mb-8 text-center">
          <h1 className="page-heading mb-1">Reset Password</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {state?.success && <div className="mb-4"><Alert type="success" message={state.success} /></div>}
        {state?.error && <div className="mb-4"><Alert type="error" message={state.error} /></div>}

        {!state?.success && (
          <form action={formAction} className="space-y-5">
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
            <Button type="submit" fullWidth loading={pending}>
              Send Reset Link
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
          <Link href="/login" className="font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
