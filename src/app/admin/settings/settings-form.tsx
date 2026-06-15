/**
 * @fileoverview Client-side settings form component.
 * Handles editing site name, home page selection, header menus (JSON),
 * and footer content (HTML). Validates JSON menus on submit.
 * Styled with warm-professional design system.
 */

"use client";

import { useActionState } from "react";
import { updateSettings } from "@/lib/actions/admin/settings";
import Button from "@/components/shared/button";
import Input from "@/components/shared/input";
import Alert from "@/components/shared/alert";
import type { SettingsData } from "@/types";

interface SettingsFormProps {
  settings: SettingsData;
  pages: { slug: string; title: string }[];
}

/**
 * Settings edit form.
 */
export default function SettingsForm({ settings, pages }: SettingsFormProps) {
  const [state, formAction, pending] = useActionState(updateSettings, undefined);

  return (
    <div className="mx-auto max-w-3xl animate-slide-up">
      <h1 className="page-heading mb-8">Settings</h1>

      {state?.success && <div className="mb-4"><Alert type="success" message={state.success} /></div>}
      {state?.error && <div className="mb-4"><Alert type="error" message={state.error} /></div>}

      <div className="card-lg p-6">
        <form action={formAction} className="space-y-6">
          <Input
            label="Site Name"
            name="siteName"
            type="text"
            defaultValue={settings.siteName}
            required
            maxLength={100}
          />

          <div className="mb-4">
            <label htmlFor="homePage" className="label-base">
              Home Page
            </label>
            <select
              id="homePage"
              name="homePage"
              defaultValue={settings.homePage}
              className="input-base"
            >
              <option value="">— Default Landing Page —</option>
              {pages.map((page) => (
                <option key={page.slug} value={page.slug}>
                  {page.title} (/{page.slug})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="headerMenuLoggedOut" className="label-base">
              Header Menu (Logged Out)
            </label>
            <textarea
              id="headerMenuLoggedOut"
              name="headerMenuLoggedOut"
              rows={4}
              defaultValue={JSON.stringify(settings.headerMenuLoggedOut, null, 2)}
              className="input-base font-mono text-xs"
            />
            <p className="mt-1.5 text-xs text-[var(--text-muted)]">
              JSON array of {`{label, href}`} objects. Example: {`[{"label":"Home","href":"/"}]`}
            </p>
          </div>

          <div className="mb-4">
            <label htmlFor="headerMenuLoggedIn" className="label-base">
              Header Menu (Logged In)
            </label>
            <textarea
              id="headerMenuLoggedIn"
              name="headerMenuLoggedIn"
              rows={4}
              defaultValue={JSON.stringify(settings.headerMenuLoggedIn, null, 2)}
              className="input-base font-mono text-xs"
            />
            <p className="mt-1.5 text-xs text-[var(--text-muted)]">
              JSON array of {`{label, href}`} objects.
            </p>
          </div>

          <div className="mb-4">
            <label htmlFor="footerContent" className="label-base">
              Footer Content (HTML)
            </label>
            <textarea
              id="footerContent"
              name="footerContent"
              rows={4}
              defaultValue={settings.footerContent}
              className="input-base font-mono text-xs"
            />
            <p className="mt-1.5 text-xs text-[var(--text-muted)]">
              HTML content displayed in the site footer.
            </p>
          </div>

          <Button type="submit" loading={pending}>
            Save Settings
          </Button>
        </form>
      </div>
    </div>
  );
}
