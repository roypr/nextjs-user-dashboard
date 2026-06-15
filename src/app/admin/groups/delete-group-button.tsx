/**
 * @fileoverview Client component for the delete group button with confirmation dialog.
 * Wraps the deleteGroup Server Action with a confirm dialog.
 */

"use client";

import { useState } from "react";
import { deleteGroup } from "@/lib/actions/admin/groups";
import ConfirmDialog from "@/components/shared/confirm-dialog";

interface DeleteGroupButtonProps {
  groupId: string;
  groupName: string;
  userCount: number;
}

/**
 * Delete group button with confirmation dialog.
 */
export default function DeleteGroupButton({
  groupId,
  groupName,
  userCount,
}: DeleteGroupButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const isDeletable = userCount === 0;

  const handleConfirm = async () => {
    setLoading(true);
    setError(undefined);
    const result = await deleteGroup(groupId);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    }
    setShowConfirm(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        disabled={!isDeletable}
        className={`text-sm font-medium transition-colors ${
          isDeletable
            ? "text-[var(--error)] hover:text-[#b91c1c]"
            : "cursor-not-allowed text-[var(--text-muted)]"
        }`}
        title={
          !isDeletable
            ? `Cannot delete — group has ${userCount} user(s) assigned`
            : "Delete group"
        }
      >
        Delete
      </button>

      <ConfirmDialog
        open={showConfirm}
        title={`Delete "${groupName}"`}
        message={`Are you sure you want to delete the "${groupName}" group? This action cannot be undone.`}
        confirmLabel="Delete Group"
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />

      {error && (
        <div className="mb-4">
          <div className="animate-fade-in rounded-lg border border-[var(--error)]/30 bg-[var(--error-bg)] px-4 py-3 text-sm font-medium text-[var(--error)]">
            {error}
          </div>
        </div>
      )}
    </>
  );
}
