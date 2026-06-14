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
 * Shows a confirm dialog before submitting the delete action.
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
        className={`text-sm font-medium ${
          isDeletable
            ? "text-red-600 hover:text-red-500"
            : "cursor-not-allowed text-gray-400"
        }`}
        title={
          !isDeletable
            ? `Cannot delete — group has ${userCount} user(s) assigned`
            : "Delete group"
        }
      >
        Delete
      </button>

      {showConfirm && (
        <ConfirmDialog
          open={showConfirm}
          title="Delete Group"
          message={`Are you sure you want to delete the group "${groupName}"? This action cannot be undone.`}
          confirmLabel="Delete"
          loading={loading}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </>
  );
}
