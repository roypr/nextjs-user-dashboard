/**
 * @fileoverview Auth Server Actions — handles signup, login, logout, email verification,
 * forgot password, reset password, and resend verification flows.
 * Follows the mandatory validation pattern:
 * session -> authorize -> rate limit -> validate -> operate -> revalidate -> return
 *
 * Auth required:
 * - signup: none (public)
 * - login: none (public)
 * - logout: any authenticated user
 * - verifyEmail: none (public, uses token)
 * - forgotPassword: none (public)
 * - resetPassword: none (public, uses token)
 * - resendVerification: none (public)
 */

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getSession, createSession, destroySession } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  createVerificationToken,
  createPasswordResetToken,
  validateVerificationToken,
  validatePasswordResetToken,
} from "@/lib/auth/tokens";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/auth/email";
import { authorize } from "@/lib/auth/authorize";
import { invalidateTokenVersionCache } from "@/lib/auth/session-cache";
import {
  loginLimiter,
  signupLimiter,
  forgotPasswordLimiter,
  resendVerificationLimiter,
  verifyEmailLimiter,
} from "@/lib/auth/rate-limiter";
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema,
} from "@/lib/validators/auth";
import { getClientIP } from "@/lib/utils/ip";
import { isRedirectError } from "next/dist/client/components/redirect-error";

/**
 * Validates email/password format and creates a new user account.
 * Sends a verification email to the registered address.
 * Rate limited: 3 attempts per IP per hour.
 *
 * Auth: none (public)
 */
export async function signup(
  prevState: { error?: string; success?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  try {
    // Rate limit
    const ip = await getClientIP();
    const { success: withinLimit } = await signupLimiter.limit(ip);
    if (!withinLimit) {
      return { error: "Too many signup attempts. Please try again later." };
    }

    // Validate
    const parsed = signupSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
      return { error: firstError };
    }

    const { email, password } = parsed.data;

    // Extract redirect URL (internal only, validated server-side)
    const rawRedirect = formData.get("redirect") as string | null;
    const redirect = rawRedirect?.startsWith("/") ? rawRedirect : null;

    // Check for existing user
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      // Don't reveal if the account exists — return generic success
      return { success: "Account created! Please check your email to verify your account." };
    }

    // Create user and verification token in transaction
    const user = await prisma.$transaction(async (tx) => {
      const passwordHash = await hashPassword(password);
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          emailVerified: false,
        },
      });

      const token = await createVerificationToken(newUser.id, undefined, tx as any);
      await sendVerificationEmail(
        email,
        token.token,
        process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
        redirect ?? undefined,
      );

      return newUser;
    });

    return { success: "Account created! Please check your email to verify your account." };
  } catch (error) {
    console.error("Signup error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Validates credentials and creates a session.
 * If isAdmin is true, additionally checks that the user belongs to an admin-type group.
 * Rate limited: 5 attempts per IP per 60s.
 * Error message is generic ("Invalid email or password").
 *
 * Auth: none (public)
 */
export async function login(
  prevState: { error?: string; success?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  try {
    // Rate limit
    const ip = await getClientIP();
    const { success: withinLimit } = await loginLimiter.limit(ip);
    if (!withinLimit) {
      return { error: "Too many login attempts. Please try again later." };
    }

    // Validate
    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      isAdmin: formData.get("isAdmin") === "true",
    });
    if (!parsed.success) {
      return { error: "Invalid email or password" };
    }

    const { email, password, isAdmin } = parsed.data;

    // Extract redirect URL (internal only, validated server-side)
    const rawRedirect = formData.get("redirect") as string | null;
    const redirectUrl = rawRedirect?.startsWith("/") ? rawRedirect : null;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { group: true },
    });

    if (!user) {
      return { error: "Invalid email or password" };
    }

    // Verify password
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return { error: "Invalid email or password" };
    }

    // If admin login, verify user is in an admin-type group
    if (isAdmin) {
      if (!user.group || user.group.type !== "admin") {
        return { error: "Invalid email or password" };
      }
    }

    // Check if user wants admin login but isn't admin
    // Create session
    const isSuperAdmin =
      email === process.env.SUPER_ADMIN_EMAIL;

    const routePermissions = user.group
      ? (user.group.routePermissions as string[])
      : [];

    await createSession({
      userId: user.id,
      email: user.email,
      groupId: user.groupId,
      groupType: user.group?.type ?? null,
      routePermissions,
      isSuperAdmin,
      tokenVersion: user.tokenVersion,
      permissionVersion: user.group
        ? user.group.updatedAt.getTime()
        : 0,
    });

    // Redirect: use redirect param for non-admin logins, fall back to defaults
    if (isAdmin) {
      redirect("/admin/dashboard");
    } else if (redirectUrl) {
      redirect(redirectUrl);
    } else {
      redirect("/account/dashboard");
    }
    
  } catch (error) {
    // If redirect was thrown, re-throw it (Next.js redirects use special errors)
    if (
      isRedirectError(error) ||
      (error instanceof Error && error.message.toLowerCase().includes("redirect"))
    ) {
      throw error;
    }

    console.error("Login error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Destroys the current session and redirects to the home page.
 *
 * Auth: any authenticated user
 */
export async function logout(): Promise<never> {
  await destroySession();
  redirect("/");
}

/**
 * Verifies a user's email address using a verification token.
 * Uses an interactive Prisma transaction to atomically:
 * 1. Delete the token by value
 * 2. Update user.emailVerified to true
 * 3. If pendingEmail is set, move it to email
 * Catches transaction failures to handle double-use race conditions.
 *
 * Auth: none (public, uses token)
 */
export async function verifyEmail(
  prevState: { error?: string; success?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  try {
    const token = formData.get("token") as string;
    if (!token) {
      return { error: "Verification token is missing." };
    }

    // Extract redirect URL (internal only, validated server-side)
    const rawRedirect = formData.get("redirect") as string | null;
    const redirectUrl = rawRedirect?.startsWith("/") ? rawRedirect : null;

    // Rate limit
    const ip = await getClientIP();
    const { success: withinLimit } = await verifyEmailLimiter.limit(ip);
    if (!withinLimit) {
      return { error: "Too many attempts. Please try again later." };
    }

    // Validate token
    const record = await validateVerificationToken(token);
    if (!record) {
      return { error: "Invalid or expired verification token." };
    }

    // Interactive transaction to prevent double-use
    try {
      await prisma.$transaction(async (tx) => {
        // Delete token first (prevents double-use)
        const deleted = await tx.emailVerificationToken.delete({
          where: { id: record.id },
        });

        // Update user
        const updateData: Record<string, unknown> = {
          emailVerified: true,
        };

        // If there's a pending email change, move it to the primary email
        if (deleted.newEmail) {
          updateData.email = deleted.newEmail;
          updateData.pendingEmail = null;
        }

        await tx.user.update({
          where: { id: record.userId },
          data: updateData,
        });
      });
    } catch (txError) {
      // Token was already used (double-use race)
      console.error("Verification transaction error:", txError);
      return { error: "This verification link has already been used." };
    }

    // Redirect to login after successful verification, preserving redirect param
    if (redirectUrl) {
      redirect(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
    } else {
      redirect("/login");
    }

    // Note: redirect throws, so the return below is unreachable but needed for type safety
    return { success: "Email verified successfully! You can now log in." };
  } catch (error) {
    // If redirect was thrown, re-throw it
    if (
      isRedirectError(error) ||
      (error instanceof Error && error.message.toLowerCase().includes("redirect"))
    ) {
      throw error;
    }

    console.error("Verify email error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Sends a password reset email if the email exists (always returns success
 * to prevent user enumeration).
 * Rate limited: 3 attempts per IP per hour.
 *
 * Auth: none (public)
 */
export async function forgotPassword(
  prevState: { error?: string; success?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  try {
    // Rate limit
    const ip = await getClientIP();
    const { success: withinLimit } = await forgotPasswordLimiter.limit(ip);
    if (!withinLimit) {
      return { error: "Too many attempts. Please try again later." };
    }

    // Validate
    const parsed = forgotPasswordSchema.safeParse({
      email: formData.get("email"),
    });
    if (!parsed.success) {
      return { error: "Please enter a valid email address." };
    }

    const { email } = parsed.data;

    // Find user (silently succeed if not found — prevents enumeration)
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return {
        success:
          "If an account with that email exists, we've sent a password reset link.",
      };
    }

    // Create reset token and send email
    const token = await createPasswordResetToken(user.id);
    await sendPasswordResetEmail(
      email,
      token.token,
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    );

    return {
      success:
        "If an account with that email exists, we've sent a password reset link.",
    };
  } catch (error) {
    console.error("Forgot password error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Resets the user's password using a valid reset token.
 * Interactive transaction: validates token, updates password hash,
 * increments tokenVersion, deletes token.
 *
 * Auth: none (public, uses token)
 */
export async function resetPassword(
  prevState: { error?: string; success?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  try {
    // Validate
    const parsed = resetPasswordSchema.safeParse({
      token: formData.get("token"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
      return { error: firstError };
    }

    const { token, password } = parsed.data;

    // Validate token
    const record = await validatePasswordResetToken(token);
    if (!record) {
      return { error: "Invalid or expired reset token." };
    }

    // Interactive transaction
    try {
      await prisma.$transaction(async (tx) => {
        const passwordHash = await hashPassword(password);

        await tx.user.update({
          where: { id: record.userId },
          data: {
            passwordHash,
            tokenVersion: { increment: 1 },
          },
        });

        await tx.passwordResetToken.delete({
          where: { id: record.id },
        });

        // Invalidate token version cache
        invalidateTokenVersionCache(record.userId);
      });
    } catch (txError) {
      console.error("Reset password transaction error:", txError);
      return { error: "An unexpected error occurred. Please try again." };
    }

    return { success: "Password reset successfully! You can now log in with your new password." };
  } catch (error) {
    console.error("Reset password error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Resends the email verification link.
 * Deletes old token, creates a new one, and sends the email.
 * Always returns success to prevent enumeration.
 * Rate limited: 3 attempts per IP per hour.
 *
 * Auth: none (public)
 */
export async function resendVerification(
  prevState: { error?: string; success?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  try {
    // Rate limit
    const ip = await getClientIP();
    const { success: withinLimit } = await resendVerificationLimiter.limit(ip);
    if (!withinLimit) {
      return { error: "Too many attempts. Please try again later." };
    }

    // Validate
    const parsed = resendVerificationSchema.safeParse({
      email: formData.get("email"),
    });
    if (!parsed.success) {
      return { error: "Please enter a valid email address." };
    }

    const { email } = parsed.data;

    // Extract redirect URL (internal only, validated server-side)
    const rawRedirect = formData.get("redirect") as string | null;
    const redirect = rawRedirect?.startsWith("/") ? rawRedirect : null;

    // Find user (silently succeed if not found)
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return {
        success:
          "If an account with that email exists, we've sent a verification link.",
      };
    }

    // If already verified, silently succeed
    if (user.emailVerified) {
      return {
        success:
          "If an account with that email exists, we've sent a verification link.",
      };
    }

    // Delete old tokens and create a new one
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    });

    const token = await createVerificationToken(user.id);
    await sendVerificationEmail(
      email,
      token.token,
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      redirect ?? undefined,
    );

    return {
      success:
        "If an account with that email exists, we've sent a verification link.",
    };
  } catch (error) {
    console.error("Resend verification error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}
