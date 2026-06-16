/**
 * @fileoverview Client-side profile form component.
 * Displays editable fields for name, phone, and address
 * with pre-populated values from the server.
 * Email is shown as read-only.
 */

"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/lib/actions/user";
import Button from "@/components/shared/button";
import Input from "@/components/shared/input";
import Alert from "@/components/shared/alert";

interface ProfileFormProps {
  initialName: string;
  initialEmail: string;
  initialPhone: string;
  initialAddress: string;
}

/**
 * Profile edit form with pre-populated defaults from the server.
 */
export default function ProfileForm({
  initialName,
  initialEmail,
  initialPhone,
  initialAddress,
}: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(updateProfile, undefined);
  const router = useRouter();

  return (
    <div className="animate-slide-up">
      <h1 className="page-heading mb-8">My Profile</h1>

      {state?.success && <div className="mb-4"><Alert type="success" message={state.success} /></div>}
      {state?.error && <div className="mb-4"><Alert type="error" message={state.error} /></div>}

      <div className="card-lg p-6">
        <form action={formAction} className="space-y-5">
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
            <label htmlFor="address" className="label-base">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              defaultValue={initialAddress}
              placeholder="Your address"
              rows={3}
              className="input-base"
            />
          </div>

          <div className="border-t border-[var(--border-light)] pt-6">
            <Button type="submit" loading={pending}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
