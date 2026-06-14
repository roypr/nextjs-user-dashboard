/**
 * @fileoverview Client-side edit user form component.
 * Handles the form state and submission for updating a user.
 * Includes group assignment dropdown for users with appropriate permissions.
 */

"use client";

import { useActionState } from "react";
import { updateUser } from "@/lib/actions/admin/users";
import Button from "@/components/shared/button";
import Input from "@/components/shared/input";
import Alert from "@/components/shared/alert";

interface EditUserFormProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    address: string | null;
    groupId: string | null;
    isSuperAdmin: boolean;
  };
  groups: Array<{ id: string; name: string }>;
}

/**
 * Edit user form with client-side state management.
 * Wraps the updateUser Server Action with the user ID bound.
 * Shows group dropdown for users with group management permissions.
 */
export default function EditUserForm({ user, groups }: EditUserFormProps) {
  const updateUserWithId = async (
    prevState: { error?: string; success?: string } | undefined,
    formData: FormData,
  ) => {
    return updateUser(user.id, prevState, formData);
  };

  const [state, formAction, pending] = useActionState(updateUserWithId, undefined);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit User</h1>

      {state?.success && <Alert type="success" message={state.success} />}
      {state?.error && <Alert type="error" message={state.error} />}

      <form action={formAction} className="space-y-4">
        <Input
          label="Name"
          name="name"
          type="text"
          defaultValue={user.name ?? ""}
        />

        <Input
          label="Email"
          name="email"
          type="email"
          defaultValue={user.email}
          disabled={user.isSuperAdmin}
        />

        <Input
          label="Phone"
          name="phone"
          type="tel"
          defaultValue={user.phone ?? ""}
        />

        <div className="mb-4">
          <label
            htmlFor="address"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Address
          </label>
          <textarea
            id="address"
            name="address"
            defaultValue={user.address ?? ""}
            rows={3}
            className="block w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="groupId"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Group
          </label>
          <select
            id="groupId"
            name="groupId"
            defaultValue={user.groupId ?? ""}
            className="block w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No group</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" loading={pending}>
          Save Changes
        </Button>
      </form>
    </div>
  );
}
