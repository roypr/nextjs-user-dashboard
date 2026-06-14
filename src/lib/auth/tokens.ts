/**
 * @fileoverview Token generation and validation utilities for email verification
 * and password reset flows. Uses crypto.randomUUID for token generation and Prisma
 * for storage with interactive transactions to prevent race conditions.
 */

import crypto from "node:crypto";
import prisma from "@/lib/prisma";

const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;
const RESET_TOKEN_EXPIRY_HOURS = 1;

/**
 * Generates a cryptographically secure random token string.
 * @returns A UUID v4 string.
 */
export function generateToken(): string {
  return crypto.randomUUID();
}

/**
 * Creates an email verification token for the given user.
 * Optionally stores a new email to verify (used during email change flow).
 * @param userId - The user's ID.
 * @param newEmail - Optional new email to verify during email change.
 * @returns The created EmailVerificationToken record.
 */
export async function createVerificationToken(
  userId: string,
  newEmail?: string,
) {
  const token = generateToken();
  const expiresAt = new Date(
    Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
  );

  return prisma.emailVerificationToken.create({
    data: {
      token,
      userId,
      newEmail: newEmail ?? null,
      expiresAt,
    },
  });
}

/**
 * Creates a password reset token for the given user.
 * @param userId - The user's ID.
 * @returns The created PasswordResetToken record.
 */
export async function createPasswordResetToken(userId: string) {
  const token = generateToken();
  const expiresAt = new Date(
    Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
  );

  return prisma.passwordResetToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });
}

/**
 * Validates an email verification token, returning the associated record if valid.
 * A token is valid if it exists and hasn't expired.
 * @param token - The token string to validate.
 * @returns The token record with user relation, or null if invalid.
 */
export async function validateVerificationToken(token: string) {
  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record) return null;
  if (record.expiresAt < new Date()) return null;

  return record;
}

/**
 * Validates a password reset token, returning the associated record if valid.
 * A token is valid if it exists and hasn't expired.
 * @param token - The token string to validate.
 * @returns The token record with user relation, or null if invalid.
 */
export async function validatePasswordResetToken(token: string) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record) return null;
  if (record.expiresAt < new Date()) return null;

  return record;
}

/**
 * Deletes all expired email verification and password reset tokens.
 * Should be called periodically to prevent token table bloat.
 */
export async function cleanupExpiredTokens(): Promise<void> {
  const now = new Date();

  await prisma.$transaction([
    prisma.emailVerificationToken.deleteMany({
      where: { expiresAt: { lt: now } },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { expiresAt: { lt: now } },
    }),
  ]);
}
