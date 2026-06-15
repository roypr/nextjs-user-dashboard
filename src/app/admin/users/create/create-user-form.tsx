/**
 * @fileoverview Client-side create user form component.
 * Handles form state and submission for creating a new user.
 * Includes group assignment dropdown.
 * Styled with warm-professional design system.
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
    <div className="mx-auto max-w-2xl animate-slide-up">
      <h1 className="page-heading mb-8">Create User</h1>

      {state?.success && <div className="mb-4"><Alert type="success" message={state.success} /></div>}
      {state?.error && <div className="mb-4"><Alert type="error" message={state.error} /></div>}

      <div className="card-lg p-6">
        <form action={formAction} className="space-y-5">
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
            <label htmlFor="groupId" className="label-base">
              Group
            </label>
            <select
              id="groupId"
              name="groupId"
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
            Create User
          </Button>
        </form>
      </div>
    </div>
  );
}
