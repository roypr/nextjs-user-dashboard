/**
 * @fileoverview Password hashing and verification using bcryptjs with cost factor 12.
 * Uses pure-JS bcryptjs to avoid native build issues in CI/CD environments.
 */

import bcrypt from "bcryptjs";

const BCRYPT_COST_FACTOR = 12;

/**
 * Hashes a plaintext password using bcryptjs with cost factor 12.
 * @param password - The plaintext password to hash.
 * @returns The bcrypt hash string.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST_FACTOR);
}

/**
 * Verifies a plaintext password against a bcrypt hash.
 * @param password - The plaintext password to verify.
 * @param hash - The bcrypt hash to compare against.
 * @returns True if the password matches the hash, false otherwise.
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
