/**
 * @fileoverview Create page for admin CMS.
 * Form with title input (slug auto-generated and displayed below),
 * and content HTML textarea. Uses useActionState with the createPage action.
 * Styled with warm-professional design system.
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
    <div className="mx-auto max-w-3xl animate-slide-up">
      <h1 className="page-heading mb-8">Create Page</h1>

      {state?.success && <div className="mb-4"><Alert type="success" message={state.success} /></div>}
      {state?.error && <div className="mb-4"><Alert type="error" message={state.error} /></div>}

      <div className="card-lg p-6">
        <form action={formAction} className="space-y-5">
          <Input
            label="Title"
            name="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {autoSlug && (
            <div className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-3 text-sm">
              <span className="font-medium text-[var(--text-primary)]">Slug:</span>{" "}
              <span className="text-[var(--text-secondary)]">/{autoSlug}</span>
              <input type="hidden" name="slug" value={autoSlug} />
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="content" className="label-base">
              Content (HTML)
            </label>
            <textarea
              id="content"
              name="content"
              rows={15}
              className="input-base font-mono text-xs"
              placeholder="<h1>Hello World</h1>"
            />
          </div>

          <Button type="submit" loading={pending}>
            Create Page
          </Button>
        </form>
      </div>
    </div>
  );
}
