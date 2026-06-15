/**
 * @fileoverview User account dashboard page.
 * Shows welcome message with user's name/email and quick link cards.
 * Warm-professional card design.
 */

import Link from "next/link";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

/**
 * User dashboard — shows welcome message and quick link cards.
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

  const quickLinks = [
    {
      href: "/account/profile",
      title: "Profile",
      description: "View and edit your personal information",
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
      color: "text-[var(--accent)]",
      bg: "bg-[var(--accent-light)]",
      hover: "hover:border-[var(--accent)]/40",
    },
    {
      href: "/account/change-password",
      title: "Password",
      description: "Change your password",
      icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
      color: "text-[var(--success)]",
      bg: "bg-[var(--success-bg)]",
      hover: "hover:border-[var(--success)]/40",
    },
    {
      href: "/account/change-email",
      title: "Email",
      description: "Update your email address",
      icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
      color: "text-[var(--info)]",
      bg: "bg-[var(--info-bg)]",
      hover: "hover:border-[var(--info)]/40",
    },
    {
      href: "/account/delete-profile",
      title: "Delete Account",
      description: "Permanently delete your account",
      icon: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
      color: "text-[var(--error)]",
      bg: "bg-[var(--error-bg)]",
      hover: "hover:border-[var(--error)]/40",
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="page-heading mb-1">My Dashboard</h1>
        <p className="text-[var(--text-secondary)]">
          Welcome, {displayName}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`card-lg p-5 transition-all duration-200 ${link.hover} hover:shadow-md`}
          >
            <div className="flex items-start gap-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${link.bg}`}>
                <svg className={`h-5 w-5 ${link.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-[var(--text-primary)]">{link.title}</h2>
                <p className="mt-0.5 text-sm text-[var(--text-secondary)]">{link.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
