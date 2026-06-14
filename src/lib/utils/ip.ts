/**
 * @fileoverview Utility to extract the client IP address from the incoming request.
 * Reads the x-forwarded-for header with a fallback to 127.0.0.1.
 */

import { headers } from "next/headers";

/**
 * Extracts the client IP address from the current request.
 * Reads the x-forwarded-for header (first IP in comma-separated list)
 * with a fallback to "127.0.0.1".
 * @returns The client IP address string.
 */
export async function getClientIP(): Promise<string> {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    if (forwardedFor) {
      // Take the first IP in case of proxy chain
      return forwardedFor.split(",")[0].trim();
    }

    // Fallback to x-real-ip if available
    const realIp = headersList.get("x-real-ip");
    if (realIp) return realIp;

    return "127.0.0.1";
  } catch {
    return "127.0.0.1";
  }
}
