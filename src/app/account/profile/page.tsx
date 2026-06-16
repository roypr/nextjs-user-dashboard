/**
 * @fileoverview User profile page — server component that fetches current user data
 * and passes it to the client-side profile form for editing.
 */

import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";
import ProfileForm from "./profile-form";

/**
 * Server component that fetches user profile data and renders the edit form.
 */
export default async function ProfilePage() {
  const session = await getSession();

  if (!authorize(session, { type: "any" })) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session!.userId },
    select: {
      name: true,
      email: true,
      phone: true,
      address: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <ProfileForm
      initialName={user.name ?? ""}
      initialEmail={user.email}
      initialPhone={user.phone ?? ""}
      initialAddress={user.address ?? ""}
    />
  );
}
