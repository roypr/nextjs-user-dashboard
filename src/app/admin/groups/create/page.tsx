/**
 * @fileoverview Create group page for admin (Super Admin only).
 * Form with name input, type dropdown, and route permissions checkboxes.
 * Uses useActionState with the createGroup Server Action.
 * Styled with warm-professional design system.
 */

"use client";

import { useActionState } from "react";
import { createGroup } from "@/lib/actions/admin/groups";
import { ROUTE_PERMISSIONS } from "@/lib/validators/group";
import Button from "@/components/shared/button";
import Input from "@/components/shared/input";
import Alert from "@/components/shared/alert";

/**
 * Admin create group form — Super Admin only.
 */
export default function CreateGroupPage() {
  const [state, formAction, pending] = useActionState(createGroup, undefined);

  return (
    <div className="mx-auto max-w-2xl animate-slide-up">
      <h1 className="page-heading mb-8">Create Group</h1>

      {state?.success && <div className="mb-4"><Alert type="success" message={state.success} /></div>}
      {state?.error && <div className="mb-4"><Alert type="error" message={state.error} /></div>}

      <div className="card-lg p-6">
        <form action={formAction} className="space-y-6">
          <Input
            label="Group Name"
            name="name"
            type="text"
            required
            autoComplete="off"
          />

          <div className="mb-4">
            <label htmlFor="type" className="label-base">
              Group Type
            </label>
            <select
              id="type"
              name="type"
              required
              className="input-base"
            >
              <option value="regular">Regular</option>
              <option value="admin">Admin</option>
            </select>
            <p className="mt-1.5 text-xs text-[var(--text-muted)]">
              Admin groups have access to the admin panel. Regular groups are for standard frontend users.
            </p>
          </div>

          <div className="mb-4">
            <span className="label-base block">Route Permissions</span>
            <p className="mb-3 text-xs text-[var(--text-muted)]">
              Select which admin sections this group can access (only applies to admin-type groups).
            </p>
            <div className="space-y-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
              {ROUTE_PERMISSIONS.map((perm) => (
                <label
                  key={perm.value}
                  className="flex cursor-pointer items-center gap-3 text-sm text-[var(--text-primary)]"
                >
                  <input
                    type="checkbox"
                    name="routePermissions"
                    value={perm.value}
                    className="h-4 w-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                  />
                  {perm.label}
                  <span className="text-xs text-[var(--text-muted)]">({perm.value})</span>
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" loading={pending}>
            Create Group
          </Button>
        </form>
      </div>
    </div>
  );
}
