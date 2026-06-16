/**
 * @fileoverview Zod validation schemas for authentication forms.
 * All fields use `.describe()` for self-documenting schemas.
 */

import { z } from "zod";

/**
 * Password strength refinement: requires uppercase, lowercase, number, and special character.
 */
const passwordStrength = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .refine((val) => /[A-Z]/.test(val), "Password must contain at least one uppercase letter")
  .refine((val) => /[a-z]/.test(val), "Password must contain at least one lowercase letter")
  .refine((val) => /[0-9]/.test(val), "Password must contain at least one number")
  .refine((val) => /[^A-Za-z0-9]/.test(val), "Password must contain at least one special character");

/**
 * Signup form validation schema.
 * Requires email (valid format) and strong password.
 */
export const signupSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .describe("User's email address for login and verification"),
  password: passwordStrength.describe("User's password (minimum 8 characters, must include uppercase, lowercase, number, and special character)"),
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
 * Requires token (from URL), strong new password, and confirmation.
 */
export const resetPasswordSchema = z
  .object({
    token: z
      .string()
      .min(1, "Reset token is required")
      .describe("Password reset token from the email link"),
    password: passwordStrength.describe("New password (minimum 8 characters, must include uppercase, lowercase, number, and special character)"),
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
