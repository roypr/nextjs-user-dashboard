/**
 * @fileoverview Email sending utilities using nodemailer configured with SMTP env vars.
 * Provides functions for sending verification and password reset emails.
 * Uses Resend SMTP by default (SMTP_HOST=smtp.resend.com), but works with any SMTP provider.
 */

import nodemailer from "nodemailer";

/**
 * Creates a reusable nodemailer transporter configured from environment variables.
 * Reads SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM from env.
 */
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP configuration is incomplete. Set SMTP_HOST, SMTP_USER, and SMTP_PASS env vars.",
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

/**
 * Returns the configured "from" address for outgoing emails.
 */
function getFromAddress(): string {
  return process.env.SMTP_FROM ?? "noreply@localhost";
}

/**
 * Sends an email verification email to the user.
 * @param email - The recipient's email address.
 * @param token - The verification token.
 * @param siteUrl - The base URL of the site (for constructing the verification link).
 */
export async function sendVerificationEmail(
  email: string,
  token: string,
  siteUrl: string,
): Promise<void> {
  const transporter = createTransporter();
  const verificationUrl = `${siteUrl}/verify-email?token=${encodeURIComponent(token)}`;

  await transporter.sendMail({
    from: getFromAddress(),
    to: email,
    subject: "Verify your email address",
    text: `Please verify your email address by clicking this link: ${verificationUrl}\n\nThis link expires in 24 hours.`,
    html: `
      <h1>Email Verification</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${verificationUrl}">Verify Email</a></p>
      <p>This link expires in 24 hours.</p>
    `,
  });
}

/**
 * Sends a password reset email to the user.
 * @param email - The recipient's email address.
 * @param token - The password reset token.
 * @param siteUrl - The base URL of the site (for constructing the reset link).
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  siteUrl: string,
): Promise<void> {
  const transporter = createTransporter();
  const resetUrl = `${siteUrl}/reset-password?token=${encodeURIComponent(token)}`;

  await transporter.sendMail({
    from: getFromAddress(),
    to: email,
    subject: "Reset your password",
    text: `You requested a password reset. Click this link to reset your password: ${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, please ignore this email.`,
    html: `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  });
}
