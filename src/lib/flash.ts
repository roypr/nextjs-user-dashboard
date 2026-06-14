/**
 * @fileoverview Flash message utilities using short-lived cookies.
 * Enables Server Actions to set success/error messages that survive redirects.
 * Messages are stored in a cookie with a 60-second maxAge and cleared on read.
 */

import { cookies } from "next/headers";

const FLASH_COOKIE_NAME = "app_flash";
const FLASH_MAX_AGE_SECONDS = 60;

export interface FlashData {
  type: "success" | "error" | "info";
  message: string;
}

/**
 * Stores a flash message in a short-lived cookie.
 * The message survives one redirect and is cleared when read via `getFlash()`.
 *
 * @param type - The message type for styling ('success', 'error', or 'info').
 * @param message - The message text.
 */
export async function setFlash(
  type: FlashData["type"],
  message: string,
): Promise<void> {
  const cookieStore = await cookies();
  const data: FlashData = { type, message };

  cookieStore.set(FLASH_COOKIE_NAME, JSON.stringify(data), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: FLASH_MAX_AGE_SECONDS,
  });
}

/**
 * Reads and clears the flash message cookie.
 * Should be called once per request to consume the flash message.
 *
 * @returns The flash data if present, null otherwise.
 */
export async function getFlash(): Promise<FlashData | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(FLASH_COOKIE_NAME);

    if (!cookie?.value) return null;

    // Clear the cookie after reading
    cookieStore.delete(FLASH_COOKIE_NAME);

    const parsed = JSON.parse(cookie.value);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      ["success", "error", "info"].includes(parsed.type) &&
      typeof parsed.message === "string"
    ) {
      return parsed as FlashData;
    }

    return null;
  } catch {
    return null;
  }
}
