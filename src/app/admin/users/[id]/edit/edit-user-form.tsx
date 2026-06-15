/**
 * @fileoverview Client-side edit user form component.
 * Handles the form state and submission for updating a user.
 * Includes group assignment dropdown for users with appropriate permissions.
 * Styled with warm-professional design system.
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
    <div className="mx-auto max-w-2xl animate-slide-up">
      <h1 className="page-heading mb-8">Edit User</h1>

      {state?.success && <div className="mb-4"><Alert type="success" message={state.success} /></div>}
      {state?.error && <div className="mb-4"><Alert type="error" message={state.error} /></div>}

      <div className="card-lg p-6">
        <form action={formAction} className="space-y-5">
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
            <label htmlFor="address" className="label-base">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              defaultValue={user.address ?? ""}
              rows={3}
              className="input-base"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="groupId" className="label-base">
              Group
            </label>
            <select
              id="groupId"
              name="groupId"
              defaultValue={user.groupId ?? ""}
              className="input-base"
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
    </div>
  );
}
