/**
 * @fileoverview Create group page for admin (Super Admin only).
 * Form with name input, type dropdown, and route permissions checkboxes.
 * Uses useActionState with the createGroup Server Action.
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
 * Displays name, type (admin/regular), and checkbox list of route permissions.
 */
export default function CreateGroupPage() {
  const [state, formAction, pending] = useActionState(createGroup, undefined);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Create Group</h1>

      {state?.success && <Alert type="success" message={state.success} />}
      {state?.error && <Alert type="error" message={state.error} />}

      <form action={formAction} className="space-y-6">
        <Input
          label="Group Name"
          name="name"
          type="text"
          required
          autoComplete="off"
        />

        <div className="mb-4">
          <label
            htmlFor="type"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Group Type
          </label>
          <select
            id="type"
            name="type"
            required
            className="block w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="regular">Regular</option>
            <option value="admin">Admin</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Admin groups have access to the admin panel. Regular groups are for
            standard frontend users.
          </p>
        </div>

        <div className="mb-4">
          <span className="mb-2 block text-sm font-medium text-gray-700">
            Route Permissions
          </span>
          <p className="mb-2 text-xs text-gray-500">
            Select which admin sections this group can access (only applies to
            admin-type groups).
          </p>
          <div className="space-y-2 rounded border border-gray-200 bg-gray-50 p-4">
            {ROUTE_PERMISSIONS.map((perm) => (
              <label
                key={perm.value}
                className="flex items-center gap-3 text-sm"
              >
                <input
                  type="checkbox"
                  name="routePermissions"
                  value={perm.value}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {perm.label}
                <span className="text-xs text-gray-400">({perm.value})</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" loading={pending}>
            Create Group
          </Button>
          <a
            href="/admin/groups"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
