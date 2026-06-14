/**
 * @fileoverview User account dashboard page.
 * Shows welcome message with user's name/email and quick links to account pages.
 */

import Link from "next/link";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

/**
 * User dashboard — shows welcome message and quick links.
 */
export default async function AccountDashboardPage() {
  const session = await getSession();

  let userName: string | null = null;
  if (session?.userId) {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true },
    });
    userName = user?.name ?? null;
  }

  const displayName = (userName || session?.email) ?? "User";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">
        My Dashboard
      </h1>
      <p className="mb-8 text-gray-600">
        Welcome, {displayName}.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/account/profile"
          className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50"
        >
          <h2 className="font-semibold text-gray-900">Profile</h2>
          <p className="mt-1 text-sm text-gray-600">
            View and edit your personal information
          </p>
        </Link>
        <Link
          href="/account/change-password"
          className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50"
        >
          <h2 className="font-semibold text-gray-900">Password</h2>
          <p className="mt-1 text-sm text-gray-600">
            Change your password
          </p>
        </Link>
        <Link
          href="/account/change-email"
          className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50"
        >
          <h2 className="font-semibold text-gray-900">Email</h2>
          <p className="mt-1 text-sm text-gray-600">
            Update your email address
          </p>
        </Link>
        <Link
          href="/account/delete-profile"
          className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-red-300 hover:bg-red-50"
        >
          <h2 className="font-semibold text-red-700">Delete Account</h2>
          <p className="mt-1 text-sm text-gray-600">
            Permanently delete your account
          </p>
        </Link>
      </div>
    </div>
  );
}
