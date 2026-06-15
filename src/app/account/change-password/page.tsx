/**
 * @fileoverview Change password page.
 * Form with current password, new password, and confirm password fields.
 * Uses useActionState with the changePassword action.
 * Styled with warm-professional card design.
 */

"use client";

import { useActionState } from "react";
import { changePassword } from "@/lib/actions/user";
import Button from "@/components/shared/button";
import Input from "@/components/shared/input";
import Alert from "@/components/shared/alert";

/**
 * Change password form in a card.
 */
export default function ChangePasswordPage() {
  const [state, formAction, pending] = useActionState(changePassword, undefined);

  return (
    <div className="animate-slide-up">
      <h1 className="page-heading mb-8">Change Password</h1>

      {state?.success && <div className="mb-4"><Alert type="success" message={state.success} /></div>}
      {state?.error && <div className="mb-4"><Alert type="error" message={state.error} /></div>}

      <div className="card-lg p-6">
        <form action={formAction} className="space-y-5">
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

          <div className="border-t border-[var(--border-light)] pt-6">
            <Button type="submit" loading={pending}>
              Change Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
