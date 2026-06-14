/**
 * @fileoverview Client-side edit group form component.
 * Handles form state and submission for updating a user group.
 * Disables type/permissions editing when canChangePermissions is false.
 */

"use client";

import { useActionState } from "react";
import { updateGroup } from "@/lib/actions/admin/groups";
import { ROUTE_PERMISSIONS } from "@/lib/validators/group";
import Button from "@/components/shared/button";
import Input from "@/components/shared/input";
import Alert from "@/components/shared/alert";

interface EditGroupFormProps {
  group: {
    id: string;
    name: string;
    type: string;
    routePermissions: string[];
    userCount: number;
  };
  canChangePermissions: boolean;
}

/**
 * Edit group form with client-side state management.
 * Wraps the updateGroup Server Action with the group ID bound.
 * Type and permissions fields are disabled when canChangePermissions is false
 * (Super Admin's own group — prevents lockout).
 */
export default function EditGroupForm({
  group,
  canChangePermissions,
}: EditGroupFormProps) {
  const updateGroupWithId = async (
    prevState: { error?: string; success?: string } | undefined,
    formData: FormData,
  ) => {
    return updateGroup(group.id, prevState, formData);
  };

  const [state, formAction, pending] = useActionState(
    updateGroupWithId,
    undefined,
  );

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit Group</h1>

      {state?.success && <Alert type="success" message={state.success} />}
      {state?.error && <Alert type="error" message={state.error} />}

      {!canChangePermissions && (
        <Alert
          type="info"
          message="This is your own group. You can change the name, but type and permissions cannot be modified to prevent lockout."
        />
      )}

      <form action={formAction} className="space-y-6">
        <Input
          label="Group Name"
          name="name"
          type="text"
          defaultValue={group.name}
          required
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
            disabled={!canChangePermissions}
            defaultValue={group.type}
            className={`block w-full rounded border px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              !canChangePermissions
                ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500"
                : "border-gray-300 focus:border-blue-500"
            }`}
          >
            <option value="regular">Regular</option>
            <option value="admin">Admin</option>
          </select>
          {!canChangePermissions && (
            <p className="mt-1 text-xs text-yellow-600">
              Cannot modify type of your own group.
            </p>
          )}
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
            {ROUTE_PERMISSIONS.map((perm) => {
              const isChecked = group.routePermissions.includes(perm.value);
              return (
                <label
                  key={perm.value}
                  className={`flex items-center gap-3 text-sm ${
                    !canChangePermissions ? "cursor-not-allowed opacity-60" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    name="routePermissions"
                    value={perm.value}
                    defaultChecked={isChecked}
                    disabled={!canChangePermissions}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {perm.label}
                  <span className="text-xs text-gray-400">({perm.value})</span>
                </label>
              );
            })}
          </div>
          {!canChangePermissions && (
            <p className="mt-1 text-xs text-yellow-600">
              Cannot modify permissions of your own group.
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" loading={pending}>
            Save Changes
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
