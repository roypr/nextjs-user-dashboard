/**
 * @fileoverview Application startup utilities.
 * Registers periodic background tasks like token cleanup.
 * Called once when the app module loads.
 */

import { cleanupExpiredTokens } from "@/lib/auth/tokens";

const TOKEN_CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 60 minutes

let registered = false;

/**
 * Registers background tasks:
 * 1. Runs cleanupExpiredTokens() immediately at startup.
 * 2. Schedules cleanupExpiredTokens() to run every 60 minutes.
 *
 * Safe to call multiple times — only registers once.
 */
export function registerBackgroundTasks(): void {
  if (registered) return;
  registered = true;

  // Immediate cleanup on startup
  cleanupExpiredTokens().catch((error) => {
    console.error("Initial token cleanup failed:", error);
  });

  // Periodic cleanup every 60 minutes
  setInterval(() => {
    cleanupExpiredTokens().catch((error) => {
      console.error("Periodic token cleanup failed:", error);
    });
  }, TOKEN_CLEANUP_INTERVAL_MS);
}
