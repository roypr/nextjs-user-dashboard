/**
 * @fileoverview Zod validation schemas for user account management forms.
 * All fields use `.describe()` for self-documenting schemas.
 */

import { z } from "zod";

/**
 * Profile update validation schema.
 * Name, phone, and address are all optional and trimmed.
 */
export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .max(100, "Name must be at most 100 characters")
    .optional()
    .describe("User's display name"),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number must be at most 30 characters")
    .optional()
    .describe("User's phone number"),
  address: z
    .string()
    .trim()
    .max(500, "Address must be at most 500 characters")
    .optional()
    .describe("User's physical address"),
});

/**
 * Change password validation schema.
 * Requires current password, new password (min 8 chars), and confirmation.
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required")
      .describe("User's current password for verification"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .describe("New password (minimum 8 characters)"),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your new password")
      .describe("Confirm new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

/**
 * Change email validation schema.
 * Requires a new email address (valid format).
 */
export const changeEmailSchema = z.object({
  newEmail: z
    .string()
    .email("Please enter a valid email address")
    .describe("New email address to set (requires verification)"),
});

/**
 * Account deletion validation schema.
 * Requires password confirmation.
 */
export const deleteAccountSchema = z.object({
  password: z
    .string()
    .min(1, "Password is required to delete your account")
    .describe("User's password for confirmation"),
});
