/**
 * @fileoverview Change email page.
 * Form with new email input. Uses useActionState with the changeEmail action.
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
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Change Email
      </h1>

      {state?.success && <Alert type="success" message={state.success} />}
      {state?.error && <Alert type="error" message={state.error} />}

      <form action={formAction} className="space-y-4">
        <Input
          label="New Email Address"
          name="newEmail"
          type="email"
          autoComplete="email"
          required
          placeholder="new@example.com"
        />

        <Button type="submit" loading={pending}>
          Send Verification Email
        </Button>
      </form>

      <p className="mt-4 text-sm text-gray-500">
        A verification link will be sent to your new email address. Your current
        email will remain active until the new one is verified.
      </p>
    </div>
  );
}
