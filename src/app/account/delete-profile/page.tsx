/**
 * @fileoverview Account deletion page.
 * Shows a warning about data loss and requires password confirmation.
 * Uses useActionState with the deleteAccount action and a ConfirmDialog.
 */

"use client";

import { useState, useActionState } from "react";
import { deleteAccount } from "@/lib/actions/user";
import Button from "@/components/shared/button";
import Input from "@/components/shared/input";
import Alert from "@/components/shared/alert";
import ConfirmDialog from "@/components/shared/confirm-dialog";

/**
 * Delete profile page with confirmation dialog.
 */
export default function DeleteProfilePage() {
  const [state, formAction, pending] = useActionState(deleteAccount, undefined);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Delete Account
      </h1>

      {state?.success && <Alert type="success" message={state.success} />}
      {state?.error && <Alert type="error" message={state.error} />}

      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h2 className="mb-2 text-lg font-semibold text-red-800">
          Danger Zone
        </h2>
        <p className="mb-4 text-sm text-red-700">
          Once you delete your account, all your data will be permanently
          removed. This action cannot be undone.
        </p>

        <form
          action={formAction}
          onSubmit={(e) => {
            e.preventDefault();
            setShowConfirm(true);
          }}
          className="space-y-4"
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
