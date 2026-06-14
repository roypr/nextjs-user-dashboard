/**
 * @fileoverview jose-based session utilities for creating, reading, updating, and destroying
 * JWE-encrypted httpOnly session cookies. Uses AES-256-GCM encryption (alg: dir, enc: A256GCM)
 * with a 7-day expiration. The SESSION_SECRET env var must be at least 32 characters.
 */

import { jwtDecrypt, EncryptJWT } from "jose";
import { cookies } from "next/headers";
import type { SessionData } from "@/types";
import type { JWTPayload } from "jose";

const SESSION_COOKIE_NAME = "app_session";
const SESSION_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

/**
 * Returns the session encryption secret as a Uint8Array.
 * The SESSION_SECRET env var must be at least 32 characters for A256GCM.
 */
function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET must be at least 32 characters long for A256GCM encryption",
    );
  }
  return new TextEncoder().encode(secret);
}

/**
 * Reads the app_session cookie, decrypts the JWE payload, and returns the session data.
 * Returns null if the cookie is missing, expired, or cannot be decrypted.
 */
export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) return null;

    const { payload } = await jwtDecrypt(sessionCookie.value, getSecret());

    return payload as unknown as SessionData;
  } catch {
    return null;
  }
}

/**
 * Creates a new encrypted session cookie with the given session data.
 * Sets httpOnly, sameSite: lax, secure in production, path: /, 7-day maxAge.
 * @param data - The session data to encrypt into the cookie.
 */
export async function createSession(data: SessionData): Promise<void> {
  const secret = getSecret();
  const token = await new EncryptJWT(data as unknown as JWTPayload)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setExpirationTime(`${SESSION_EXPIRY_SECONDS}s`)
    .setIssuedAt()
    .encrypt(secret);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_EXPIRY_SECONDS,
  });
}

/**
 * Reads the current session, merges the provided updates, and re-creates the
 * cookie with the merged data.
 * @param updates - Partial session data to merge into the existing session.
 */
export async function updateSession(
  updates: Partial<SessionData>,
): Promise<void> {
  const currentSession = await getSession();
  if (!currentSession) {
    throw new Error("Cannot update session: no active session found");
  }

  const merged: SessionData = {
    ...currentSession,
    ...updates,
  };

  await createSession(merged);
}

/**
 * Destroys the session by deleting the app_session cookie.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
