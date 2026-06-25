/**
 * @fileoverview Frontend login page (server component).
 * If the user is already authenticated, redirects to the dashboard
 * (or the ?redirect= param if provided). Otherwise renders the login form.
 */

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import LoginForm from "./login-form";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Login page — checks session and redirects authenticated users away.
 */
export default async function LoginPage({ searchParams }: Props) {
  const session = await getSession();

  if (session) {
    const params = await searchParams;
    const redirectTo = params.redirect;
    const safeRedirect =
      typeof redirectTo === "string" && redirectTo.startsWith("/")
        ? redirectTo
        : null;

    redirect(safeRedirect ?? "/account/dashboard");
  }

  return <LoginForm />;
}