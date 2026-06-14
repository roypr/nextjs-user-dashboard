/**
 * @fileoverview User profile page — view and edit name, phone, address.
 * Email is displayed as read-only. Uses useActionState with the updateProfile action.
 */

"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/lib/actions/user";
import Button from "@/components/shared/button";
import Input from "@/components/shared/input";
import Alert from "@/components/shared/alert";

interface ProfilePageProps {
  /** Pre-loaded user data passed from a parent layout or server component */
  initialName?: string;
  initialEmail?: string;
  initialPhone?: string;
  initialAddress?: string;
}

/**
 * Profile page with edit form for name, phone, and address.
 */
export default function ProfilePage({
  initialName = "",
  initialEmail = "",
  initialPhone = "",
  initialAddress = "",
}: ProfilePageProps) {
  const [state, formAction, pending] = useActionState(updateProfile, undefined);
  const router = useRouter();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Profile</h1>

      {state?.success && <Alert type="success" message={state.success} />}
      {state?.error && <Alert type="error" message={state.error} />}

      <form action={formAction} className="space-y-4">
        <Input
          label="Name"
          name="name"
          type="text"
          defaultValue={initialName}
          placeholder="Your name"
        />

        <Input
          label="Email"
          name="email"
          type="email"
          defaultValue={initialEmail}
          disabled
        />

        <Input
          label="Phone"
          name="phone"
          type="tel"
          defaultValue={initialPhone}
          placeholder="Your phone number"
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
            defaultValue={initialAddress}
            placeholder="Your address"
            rows={3}
            className="block w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <Button type="submit" loading={pending}>
          Save Changes
        </Button>
      </form>
    </div>
  );
}
