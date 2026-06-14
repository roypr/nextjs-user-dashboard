/**
 * @fileoverview Change password page.
 * Form with current password, new password, and confirm password fields.
 * Uses useActionState with the changePassword action.
 * On success, prompts the user to log in again (session invalidated).
 */

"use client";

import { useActionState } from "react";
import { changePassword } from "@/lib/actions/user";
import Button from "@/components/shared/button";
import Input from "@/components/shared/input";
import Alert from "@/components/shared/alert";

/**
 * Change password form with current password, new password, and confirmation.
 */
export default function ChangePasswordPage() {
  const [state, formAction, pending] = useActionState(changePassword, undefined);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Change Password
      </h1>

      {state?.success && (
        <div className="mb-4">
          <Alert type="success" message={state.success} />
        </div>
      )}
      {state?.error && (
        <div className="mb-4">
          <Alert type="error" message={state.error} />
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <Input
          label="Current Password"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />

        <Input
          label="New Password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
        />

        <Input
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />

        <Button type="submit" loading={pending}>
          Change Password
        </Button>
      </form>
    </div>
  );
}
