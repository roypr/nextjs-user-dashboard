/**
 * @fileoverview Client-side create user form component.
 * Handles form state and submission for creating a new user.
 * Includes group assignment dropdown.
 */

"use client";

import { useActionState } from "react";
import { createUser } from "@/lib/actions/admin/users";
import Button from "@/components/shared/button";
import Input from "@/components/shared/input";
import Alert from "@/components/shared/alert";

interface CreateUserFormProps {
  groups: Array<{ id: string; name: string }>;
}

/**
 * Create user form with group dropdown.
 */
export default function CreateUserForm({ groups }: CreateUserFormProps) {
  const [state, formAction, pending] = useActionState(createUser, undefined);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Create User</h1>

      {state?.success && <Alert type="success" message={state.success} />}
      {state?.error && <Alert type="error" message={state.error} />}

      <form action={formAction} className="space-y-4">
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="off"
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />

        <Input
          label="Name"
          name="name"
          type="text"
          autoComplete="off"
        />

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
          Create User
        </Button>
      </form>
    </div>
  );
}
