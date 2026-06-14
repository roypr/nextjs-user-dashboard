/**
 * @fileoverview Delete confirmation modal using the native <dialog> element.
 * Provides a reusable confirmation prompt with optional loading state.
 */

"use client";

import { useEffect, useRef } from "react";
import Button from "@/components/shared/button";

interface ConfirmDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Dialog title */
  title: string;
  /** Dialog message/body text */
  message: string;
  /** Label for the confirm button (default: "Confirm") */
  confirmLabel?: string;
  /** Label for the cancel button (default: "Cancel") */
  cancelLabel?: string;
  /** Whether the confirm action is in progress */
  loading?: boolean;
  /** Called when the user confirms */
  onConfirm: () => void;
  /** Called when the user cancels or closes the dialog */
  onCancel: () => void;
}

/**
 * Confirmation dialog using the native HTML <dialog> element.
 * Opens/closes based on the `open` prop.
 *
 * @param props.open - Controls dialog visibility.
 * @param props.title - Dialog title.
 * @param props.message - Dialog message text.
 * @param props.confirmLabel - Confirm button label.
 * @param props.cancelLabel - Cancel button label.
 * @param props.loading - Shows loading state on confirm button.
 * @param props.onConfirm - Confirm callback.
 * @param props.onCancel - Cancel callback.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;

    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  // Close on backdrop click
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;

    const handleClose = () => {
      if (open) onCancel();
    };

    el.addEventListener("close", handleClose);
    return () => el.removeEventListener("close", handleClose);
  }, [open, onCancel]);

  return (
    <dialog
      ref={dialogRef}
      className="rounded-lg border border-gray-200 p-0 shadow-lg backdrop:bg-black/40"
      onClick={(e) => {
        // Close if user clicks on the backdrop
        if (e.target === dialogRef.current) onCancel();
      }}
    >
      <div className="p-6">
        <h2 className="mb-2 text-lg font-semibold text-gray-900">{title}</h2>
        <p className="mb-6 text-sm text-gray-600">{message}</p>
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
