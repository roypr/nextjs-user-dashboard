/**
 * @fileoverview Client-side edit group form component.
 * Handles form state and submission for updating a user group.
 * Disables type/permissions editing when canChangePermissions is false.
 * Styled with warm-professional design system.
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
 * Type and permissions fields are disabled when canChangePermissions is false.
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
    <div className="mx-auto max-w-2xl animate-slide-up">
      <h1 className="page-heading mb-8">Edit Group</h1>

      {state?.success && <div className="mb-4"><Alert type="success" message={state.success} /></div>}
      {state?.error && <div className="mb-4"><Alert type="error" message={state.error} /></div>}

      {!canChangePermissions && (
        <div className="mb-4">
          <Alert
            type="info"
            message="This is your own group. You can change the name, but type and permissions cannot be modified to prevent lockout."
          />
        </div>
      )}

      <div className="card-lg p-6">
        <form action={formAction} className="space-y-6">
          <Input
            label="Group Name"
            name="name"
            type="text"
            defaultValue={group.name}
            required
          />

          <div className="mb-4">
            <label htmlFor="type" className="label-base">
              Group Type
            </label>
            <select
              id="type"
              name="type"
              required
              disabled={!canChangePermissions}
              defaultValue={group.type}
              className={`input-base ${
                !canChangePermissions
                  ? "!cursor-not-allowed !bg-[var(--bg-subtle)] !text-[var(--text-muted)]"
                  : ""
              }`}
            >
              <option value="regular">Regular</option>
              <option value="admin">Admin</option>
            </select>
            {!canChangePermissions && (
              <p className="mt-1.5 text-xs text-[var(--warning)]">
                Cannot modify type of your own group.
              </p>
            )}
          </div>

          <div className="mb-4">
            <span className="label-base block">Route Permissions</span>
            <p className="mb-3 text-xs text-[var(--text-muted)]">
              Select which admin sections this group can access (only applies to admin-type groups).
            </p>
            <div className={`space-y-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4 ${
              !canChangePermissions ? "opacity-60" : ""
            }`}>
              {ROUTE_PERMISSIONS.map((perm) => {
                const isChecked = group.routePermissions.includes(perm.value);
                return (
                  <label
                    key={perm.value}
                    className={`flex cursor-pointer items-center gap-3 text-sm text-[var(--text-primary)] ${
                      !canChangePermissions ? "cursor-not-allowed" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="routePermissions"
                      value={perm.value}
                      defaultChecked={isChecked}
                      disabled={!canChangePermissions}
                      className="h-4 w-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                    />
                    {perm.label}
                    <span className="text-xs text-[var(--text-muted)]">({perm.value})</span>
                  </label>
                );
              })}
            </div>
            {!canChangePermissions && (
              <p className="mt-1.5 text-xs text-[var(--warning)]">
                Cannot modify permissions of your own group.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 border-t border-[var(--border-light)] pt-6">
            <Button type="submit" loading={pending}>
              Save Changes
            </Button>
            <a
              href="/admin/groups"
              className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
