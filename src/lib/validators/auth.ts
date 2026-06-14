/**
 * @fileoverview Zod validation schemas for authentication forms.
 * All fields use `.describe()` for self-documenting schemas.
 */

import { z } from "zod";

/**
 * Signup form validation schema.
 * Requires email (valid format) and password (minimum 8 characters).
 */
export const signupSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .describe("User's email address for login and verification"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .describe("User's password (minimum 8 characters)"),
});

/**
 * Login form validation schema.
 * Requires email and password. Optional isAdmin flag for admin login.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .describe("User's email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .describe("User's password"),
  isAdmin: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether this is an admin login attempt"),
});

/**
 * Forgot password form validation schema.
 * Requires a valid email address.
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .describe("Email address to send password reset link to"),
});

/**
 * Reset password form validation schema.
 * Requires token (from URL), new password (min 8 chars), and confirmation.
 */
export const resetPasswordSchema = z
  .object({
    token: z
      .string()
      .min(1, "Reset token is required")
      .describe("Password reset token from the email link"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .describe("New password (minimum 8 characters)"),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your password")
      .describe("Confirm new password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Resend verification form validation schema.
 * Requires a valid email address.
 */
export const resendVerificationSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .describe("Email address to resend verification link to"),
});
