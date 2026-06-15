/**
 * @fileoverview Toast notification component that reads flash messages from
 * a cookie and displays them with auto-dismiss after 5 seconds.
 * Renders a styled notification bar at the top of the page with slide-in animation.
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import type { FlashData } from "@/lib/flash";

/**
 * Parses the flash cookie value from the document.cookie string.
 * @returns The flash data if the cookie exists, null otherwise.
 */
function getFlashFromCookie(): FlashData | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("app_flash="));

  if (!match) return null;

  try {
    const value = match.split("=")[1];
    const parsed = JSON.parse(decodeURIComponent(value));

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      ["success", "error", "info"].includes(parsed.type) &&
      typeof parsed.message === "string"
    ) {
      return parsed as FlashData;
    }
  } catch {
    // Invalid cookie — ignore
  }

  return null;
}

/**
 * Clears the flash cookie from the browser.
 */
function clearFlashCookie(): void {
  document.cookie =
    "app_flash=; path=/; max-age=0; sameSite=lax" +
    (process.env.NODE_ENV === "production" ? "; secure" : "");
}

/**
 * Toast notification component.
 * Checks for a flash cookie on mount, displays the message, auto-dismisses after 5 seconds.
 * Also supports click-to-dismiss and a manual dismiss button.
 */
export default function Toast() {
  const [flash, setFlash] = useState<FlashData | null>(null);
  const [visible, setVisible] = useState(false);

  const dismiss = useCallback(() => {
    setVisible(false);
    clearFlashCookie();
    setTimeout(() => setFlash(null), 300);
  }, []);

  useEffect(() => {
    const data = getFlashFromCookie();
    if (data) {
      setFlash(data);
      setVisible(true);
      clearFlashCookie();

      const timer = setTimeout(dismiss, 5000);
      return () => clearTimeout(timer);
    }
  }, [dismiss]);

  if (!flash) return null;

  const styles: Record<string, string> = {
    success: "bg-[var(--success)]",
    error: "bg-[var(--error)]",
    info: "bg-[var(--accent)]",
  };

  const bgColor = styles[flash.type] ?? styles.info;

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
      }`}
    >
      <div
        className={`pointer-events-auto mx-4 mt-4 flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-medium text-white shadow-lg ${bgColor}`}
        role="alert"
      >
        <span className="flex-1">{flash.message}</span>
        <button
          onClick={dismiss}
          className="shrink-0 rounded-md p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          aria-label="Dismiss"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
