/**
 * @fileoverview Change email page.
 * Form with new email input in a card. Uses useActionState with the changeEmail action.
 * On success, shows a message to check the inbox for verification.
 */

"use client";

import { useActionState } from "react";
import { changeEmail } from "@/lib/actions/user";
import Button from "@/components/shared/button";
import Input from "@/components/shared/input";
import Alert from "@/components/shared/alert";

/**
 * Change email form — initiates email change flow with verification.
 */
export default function ChangeEmailPage() {
  const [state, formAction, pending] = useActionState(changeEmail, undefined);

  return (
    <div className="animate-slide-up">
      <h1 className="page-heading mb-8">Change Email</h1>

      {state?.success && <div className="mb-4"><Alert type="success" message={state.success} /></div>}
      {state?.error && <div className="mb-4"><Alert type="error" message={state.error} /></div>}

      <div className="card-lg p-6">
        <form action={formAction} className="space-y-5">
          <Input
            label="New Email Address"
            name="newEmail"
            type="email"
            autoComplete="email"
            required
            placeholder="new@example.com"
          />

          <div className="border-t border-[var(--border-light)] pt-6">
            <Button type="submit" loading={pending}>
              Send Verification Email
            </Button>
          </div>
        </form>

        <p className="mt-6 text-sm text-[var(--text-muted)]">
          A verification link will be sent to your new email address. Your current
          email will remain active until the new one is verified.
        </p>
      </div>
    </div>
  );
}
