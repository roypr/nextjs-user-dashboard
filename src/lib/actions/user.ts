/**
 * @fileoverview User account management Server Actions.
 * Follows the mandatory validation pattern:
 * session -> authorize -> rate limit -> validate -> operate -> revalidate -> return
 *
 * Auth required:
 * - updateProfile: any authenticated user
 * - changePassword: any authenticated user
 * - changeEmail: any authenticated user
 * - deleteAccount: any authenticated user
 */

"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getSession, destroySession } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createVerificationToken } from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/auth/email";
import { authorize } from "@/lib/auth/authorize";
import { invalidateTokenVersionCache } from "@/lib/auth/session-cache";
import {
  updateProfileSchema,
  changePasswordSchema,
  changeEmailSchema,
  deleteAccountSchema,
} from "@/lib/validators/user";

/**
 * Updates the authenticated user's profile (name, phone, address).
 *
 * Auth: any authenticated user
 */
export async function updateProfile(
  prevState: { error?: string; success?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  try {
    // Session & authorize
    const session = await getSession();
    if (!authorize(session, { type: "any" })) {
      return { error: "You must be logged in to update your profile." };
    }

    // Validate
    const parsed = updateProfileSchema.safeParse({
      name: formData.get("name") || undefined,
      phone: formData.get("phone") || undefined,
      address: formData.get("address") || undefined,
    });
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
      return { error: firstError };
    }

    const { name, phone, address } = parsed.data;

    // Operate
    await prisma.user.update({
      where: { id: session!.userId },
      data: {
        name: name ?? null,
        phone: phone ?? null,
        address: address ?? null,
      },
    });

    revalidatePath("/account/profile");
    return { success: "Profile updated successfully." };
  } catch (error) {
    console.error("Update profile error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Changes the authenticated user's password.
 * Verifies the current password before applying the change.
 * Increments tokenVersion to invalidate all existing sessions.
 *
 * Auth: any authenticated user
 */
export async function changePassword(
  prevState: { error?: string; success?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  try {
    // Session & authorize
    const session = await getSession();
    if (!authorize(session, { type: "any" })) {
      return { error: "You must be logged in to change your password." };
    }

    // Validate
    const parsed = changePasswordSchema.safeParse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    });
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
      return { error: firstError };
    }

    const { currentPassword, newPassword } = parsed.data;

    // Verify current password
    const user = await prisma.user.findUnique({
      where: { id: session!.userId },
      select: { passwordHash: true },
    });

    if (!user) {
      return { error: "User not found." };
    }

    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) {
      return { error: "Current password is incorrect." };
    }

    // Hash new password and update
    const newHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: session!.userId },
      data: {
        passwordHash: newHash,
        tokenVersion: { increment: 1 },
      },
    });

    // Invalidate cache
    invalidateTokenVersionCache(session!.userId);

    revalidatePath("/account/change-password");
    return { success: "Password changed successfully. Please log in again with your new password." };
  } catch (error) {
    console.error("Change password error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Initiates an email change flow.
 * Sets pendingEmail on the user record and sends a verification email
 * to the new address. The old email remains active until the new one is verified.
 *
 * Auth: any authenticated user
 */
export async function changeEmail(
  prevState: { error?: string; success?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  try {
    // Session & authorize
    const session = await getSession();
    if (!authorize(session, { type: "any" })) {
      return { error: "You must be logged in to change your email." };
    }

    // Validate
    const parsed = changeEmailSchema.safeParse({
      newEmail: formData.get("newEmail"),
    });
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
      return { error: firstError };
    }

    const { newEmail } = parsed.data;

    // Check if new email is the same as current
    if (newEmail === session!.email) {
      return { error: "New email is the same as your current email." };
    }

    // Check if new email is already taken
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    });
    if (existingUser) {
      return { error: "This email address is already in use." };
    }

    // Set pendingEmail and send verification
    await prisma.user.update({
      where: { id: session!.userId },
      data: { pendingEmail: newEmail },
    });

    // Delete any existing verification tokens for this user
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: session!.userId },
    });

    // Create a new verification token with the new email
    const token = await createVerificationToken(session!.userId, newEmail);
    await sendVerificationEmail(
      newEmail,
      token.token,
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    );

    revalidatePath("/account/change-email");
    return {
      success:
        "A verification link has been sent to your new email address. Please check your inbox to confirm the change.",
    };
  } catch (error) {
    console.error("Change email error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Deletes the authenticated user's account.
 * Requires password confirmation. Increments tokenVersion,
 * then deletes the user (cascading deletes tokens).
 *
 * Auth: any authenticated user
 */
export async function deleteAccount(
  prevState: { error?: string; success?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  try {
    // Session & authorize
    const session = await getSession();
    if (!authorize(session, { type: "any" })) {
      return { error: "You must be logged in to delete your account." };
    }

    // Validate
    const parsed = deleteAccountSchema.safeParse({
      password: formData.get("password"),
    });
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
      return { error: firstError };
    }

    const { password } = parsed.data;

    // Verify password
    const user = await prisma.user.findUnique({
      where: { id: session!.userId },
      select: { passwordHash: true },
    });

    if (!user) {
      return { error: "User not found." };
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return { error: "Password is incorrect." };
    }

    // Increment tokenVersion first to invalidate sessions
    await prisma.user.update({
      where: { id: session!.userId },
      data: { tokenVersion: { increment: 1 } },
    });

    invalidateTokenVersionCache(session!.userId);

    // Delete the user
    await prisma.user.delete({
      where: { id: session!.userId },
    });

    // Destroy session
    await destroySession();

    return { success: "Your account has been permanently deleted." };
  } catch (error) {
    console.error("Delete account error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}
