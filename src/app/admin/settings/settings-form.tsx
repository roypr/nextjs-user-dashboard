/**
 * @fileoverview Client-side settings form component.
 * Handles editing site name, home page selection, header menus (JSON),
 * and footer content (HTML). Validates JSON menus on submit.
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
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Settings</h1>

      {state?.success && <Alert type="success" message={state.success} />}
      {state?.error && <Alert type="error" message={state.error} />}

      <form action={formAction} className="space-y-6">
        {/* Site Name */}
        <Input
          label="Site Name"
          name="siteName"
          type="text"
          defaultValue={settings.siteName}
          required
          maxLength={100}
        />

        {/* Home Page Select */}
        <div className="mb-4">
          <label
            htmlFor="homePage"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Home Page
          </label>
          <select
            id="homePage"
            name="homePage"
            defaultValue={settings.homePage}
            className="block w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— Default Landing Page —</option>
            {pages.map((page) => (
              <option key={page.slug} value={page.slug}>
                {page.title} (/{page.slug})
              </option>
            ))}
          </select>
        </div>

        {/* Header Menu (Logged Out) */}
        <div className="mb-4">
          <label
            htmlFor="headerMenuLoggedOut"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Header Menu (Logged Out)
          </label>
          <textarea
            id="headerMenuLoggedOut"
            name="headerMenuLoggedOut"
            rows={4}
            defaultValue={JSON.stringify(settings.headerMenuLoggedOut, null, 2)}
            className="block w-full rounded border border-gray-300 px-3 py-2 text-sm font-mono shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            JSON array of {`{label, href}`} objects. Example:{` [{"label":"Home","href":"/"}]`}
          </p>
        </div>

        {/* Header Menu (Logged In) */}
        <div className="mb-4">
          <label
            htmlFor="headerMenuLoggedIn"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Header Menu (Logged In)
          </label>
          <textarea
            id="headerMenuLoggedIn"
            name="headerMenuLoggedIn"
            rows={4}
            defaultValue={JSON.stringify(settings.headerMenuLoggedIn, null, 2)}
            className="block w-full rounded border border-gray-300 px-3 py-2 text-sm font-mono shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            JSON array of {`{label, href}`} objects.
          </p>
        </div>

        {/* Footer Content */}
        <div className="mb-4">
          <label
            htmlFor="footerContent"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Footer Content (HTML)
          </label>
          <textarea
            id="footerContent"
            name="footerContent"
            rows={4}
            defaultValue={settings.footerContent}
            className="block w-full rounded border border-gray-300 px-3 py-2 text-sm font-mono shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            HTML content displayed in the site footer.
          </p>
        </div>

        <Button type="submit" loading={pending}>
          Save Settings
        </Button>
      </form>
    </div>
  );
}
