/**
 * @fileoverview Create page for admin CMS.
 * Form with title input (slug auto-generated and displayed below),
 * and content HTML textarea. Uses useActionState with the createPage action.
 */

"use client";

import { useState, useActionState } from "react";
import { createPage } from "@/lib/actions/admin/pages";
import { slugify } from "@/lib/utils/slugify";
import Button from "@/components/shared/button";
import Input from "@/components/shared/input";
import Alert from "@/components/shared/alert";

/**
 * Admin create page form with slug preview.
 */
export default function CreatePagePage() {
  const [state, formAction, pending] = useActionState(createPage, undefined);
  const [title, setTitle] = useState("");
  const autoSlug = title ? slugify(title) : "";

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Create Page</h1>

      {state?.success && <Alert type="success" message={state.success} />}
      {state?.error && <Alert type="error" message={state.error} />}

      <form action={formAction} className="space-y-4">
        <Input
          label="Title"
          name="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {autoSlug && (
          <div className="mb-4 text-sm text-gray-500">
            <span className="font-medium">Slug:</span> /{autoSlug}
            <input type="hidden" name="slug" value={autoSlug} />
          </div>
        )}

        <div className="mb-4">
          <label
            htmlFor="content"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Content (HTML)
          </label>
          <textarea
            id="content"
            name="content"
            rows={15}
            className="block w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
        </div>

        <Button type="submit" loading={pending}>
          Create Page
        </Button>
      </form>
    </div>
  );
}
