/**
 * @fileoverview Account deletion page.
 * Shows a warning card about data loss and requires password confirmation.
 * Uses useActionState with the deleteAccount action and a ConfirmDialog.
 * Styled with warm-professional design system.
 */

"use client";

import { useState, useActionState } from "react";
import { deleteAccount } from "@/lib/actions/user";
import Button from "@/components/shared/button";
import Input from "@/components/shared/input";
import Alert from "@/components/shared/alert";
import ConfirmDialog from "@/components/shared/confirm-dialog";

/**
 * Delete profile page with confirmation dialog and warning card.
 */
export default function DeleteProfilePage() {
  const [state, formAction, pending] = useActionState(deleteAccount, undefined);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="animate-slide-up">
      <h1 className="page-heading mb-8">Delete Account</h1>

      {state?.success && <div className="mb-4"><Alert type="success" message={state.success} /></div>}
      {state?.error && <div className="mb-4"><Alert type="error" message={state.error} /></div>}

      <div className="rounded-xl border border-[var(--error)]/30 bg-[var(--error-bg)] p-6">
        <div className="mb-4 flex items-center gap-3">
          <svg className="h-6 w-6 text-[var(--error)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86l-8.3 14.33A1 1 0 002.7 20h18.6a1 1 0 00.9-1.45l-8.3-14.33a1 1 0 00-1.7 0z" />
          </svg>
          <h2 className="text-lg font-semibold text-[var(--error)]">
            Danger Zone
          </h2>
        </div>
        <p className="mb-6 text-sm text-[var(--error)]">
          Once you delete your account, all your data will be permanently
          removed. This action cannot be undone.
        </p>

        <form
          action={formAction}
          onSubmit={(e) => {
            e.preventDefault();
            setShowConfirm(true);
          }}
          className="space-y-5"
        >
          <Input
            label="Enter your password to confirm"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />

          <Button type="submit" variant="danger">
            Delete My Account
          </Button>
        </form>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently removed."
        confirmLabel="Yes, Delete My Account"
        loading={pending}
        onConfirm={() => {
          const form = document.querySelector("form");
          if (form) {
            form.requestSubmit();
          }
          setShowConfirm(false);
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
