/**
 * @fileoverview Toast notification component that reads flash messages from
 * a cookie and displays them with auto-dismiss after 5 seconds.
 * Renders a styled notification bar at the top of the page.
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
    // Clear after animation
    setTimeout(() => setFlash(null), 300);
  }, []);

  useEffect(() => {
    const data = getFlashFromCookie();
    if (data) {
      setFlash(data);
      setVisible(true);
      clearFlashCookie();

      // Auto-dismiss after 5 seconds
      const timer = setTimeout(dismiss, 5000);
      return () => clearTimeout(timer);
    }
  }, [dismiss]);

  if (!flash) return null;

  const bgColorMap = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-blue-600",
  };

  const bgColor = bgColorMap[flash.type];

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`pointer-events-auto mx-4 mt-4 flex items-center gap-3 rounded-lg px-6 py-3 text-sm font-medium text-white shadow-lg ${bgColor}`}
        role="alert"
      >
        <span className="flex-1">{flash.message}</span>
        <button
          onClick={dismiss}
          className="shrink-0 text-white/80 hover:text-white focus:outline-none"
          aria-label="Dismiss notification"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
