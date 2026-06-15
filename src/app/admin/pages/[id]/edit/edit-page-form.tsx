/**
 * @fileoverview Client-side edit page form component.
 * Handles the form state and submission for updating a CMS page.
 * Includes delete functionality with confirmation dialog.
 * Styled with warm-professional design system.
 */

"use client";

import { useActionState } from "react";
import { updatePage, deletePage } from "@/lib/actions/admin/pages";
import Button from "@/components/shared/button";
import Input from "@/components/shared/input";
import Alert from "@/components/shared/alert";
import ConfirmDialog from "@/components/shared/confirm-dialog";
import { useState } from "react";

interface EditPageFormProps {
  page: {
    id: string;
    title: string;
    slug: string;
    content: string;
  };
}

/**
 * Edit page form with client-side state management.
 * Includes delete functionality with confirmation dialog.
 */
export default function EditPageForm({ page }: EditPageFormProps) {
  const updatePageWithId = async (
    prevState: { error?: string; success?: string } | undefined,
    formData: FormData,
  ) => {
    return updatePage(page.id, prevState, formData);
  };

  const [state, formAction, pending] = useActionState(updatePageWithId, undefined);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | undefined>();

  const handleDelete = async () => {
    setDeleteLoading(true);
    setDeleteError(undefined);
    const result = await deletePage(page.id);
    setDeleteLoading(false);

    if (result?.error) {
      setDeleteError(result.error);
      setShowDelete(false);
    } else {
      window.location.href = "/admin/pages";
    }
  };

  return (
    <div className="mx-auto max-w-3xl animate-slide-up">
      <h1 className="page-heading mb-8">Edit Page</h1>

      {state?.success && <div className="mb-4"><Alert type="success" message={state.success} /></div>}
      {state?.error && <div className="mb-4"><Alert type="error" message={state.error} /></div>}
      {deleteError && <div className="mb-4"><Alert type="error" message={deleteError} /></div>}

      <div className="card-lg p-6">
        <form action={formAction} className="space-y-5">
          <Input
            label="Title"
            name="title"
            type="text"
            required
            defaultValue={page.title}
          />

          <Input
            label="Slug"
            name="slug"
            type="text"
            required
            defaultValue={page.slug}
          />

          <div className="mb-4">
            <label htmlFor="content" className="label-base">
              Content (HTML)
            </label>
            <textarea
              id="content"
              name="content"
              rows={15}
              defaultValue={page.content}
              className="input-base font-mono text-xs"
            />
          </div>

          <div className="flex items-center justify-between border-t border-[var(--border-light)] pt-6">
            <Button type="submit" loading={pending}>
              Save Changes
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => setShowDelete(true)}
            >
              Delete Page
            </Button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete Page"
        message="Are you sure you want to delete this page? This action cannot be undone."
        confirmLabel="Delete"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
