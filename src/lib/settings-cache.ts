/**
 * @fileoverview Module-level cache for site settings with 60-second TTL.
 * Stores a parsed SettingsData object. On cache miss, fetches from the database.
 * Call `invalidateSettingsCache()` after updating settings to force a fresh fetch.
 */

import prisma from "@/lib/prisma";
import type { SettingsData, HeaderMenuItem } from "@/types";

const CACHE_TTL_MS = 60_000; // 60 seconds

interface SettingsCacheEntry {
  data: SettingsData;
  expiresAt: number;
}

let cachedSettings: SettingsCacheEntry | null = null;

/**
 * Default settings returned when the database is empty or unreachable.
 */
function getDefaultSettings(): SettingsData {
  return {
    siteName: "My App",
    homePage: "",
    headerMenuLoggedOut: [
      { label: "Home", href: "/" },
      { label: "Login", href: "/login" },
    ],
    headerMenuLoggedIn: [
      { label: "Dashboard", href: "/account/dashboard" },
    ],
    footerContent: "<p>Powered by Next.js</p>",
  };
}

/**
 * Parses the raw settings from the database into a typed SettingsData object.
 * Falls back to defaults for any missing or malformed settings.
 * @param rawSettings - Array of { key, value } pairs from the Setting table.
 * @returns A fully typed SettingsData object.
 */
function parseSettings(rawSettings: { key: string; value: string }[]): SettingsData {
  const map = new Map(rawSettings.map((s) => [s.key, s.value]));
  const defaults = getDefaultSettings();

  const parseMenu = (value: string | undefined, fallback: HeaderMenuItem[]): HeaderMenuItem[] => {
    if (!value) return fallback;
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
      return fallback;
    } catch {
      return fallback;
    }
  };

  return {
    siteName: map.get("site_name") ?? defaults.siteName,
    homePage: map.get("home_page") ?? defaults.homePage,
    headerMenuLoggedOut: parseMenu(map.get("header_menu_logged_out"), defaults.headerMenuLoggedOut),
    headerMenuLoggedIn: parseMenu(map.get("header_menu_logged_in"), defaults.headerMenuLoggedIn),
    footerContent: map.get("footer_content") ?? defaults.footerContent,
  };
}

/**
 * Returns the current site settings from cache (if valid) or fetches from the database.
 * Cached value has a 60-second TTL.
 * @returns The parsed SettingsData object.
 */
export async function getCachedSettings(): Promise<SettingsData> {
  const now = Date.now();

  if (cachedSettings && cachedSettings.expiresAt > now) {
    return cachedSettings.data;
  }

  try {
    const rawSettings = await prisma.setting.findMany({
      select: { key: true, value: true },
    });

    const data = parseSettings(rawSettings);
    cachedSettings = { data, expiresAt: now + CACHE_TTL_MS };
    return data;
  } catch (error) {
    console.error("Settings cache fetch error:", error);
    // Return stale cache if available, otherwise defaults
    if (cachedSettings) return cachedSettings.data;
    return getDefaultSettings();
  }
}

/**
 * Invalidates the settings cache, forcing a fresh fetch on the next call.
 * Call this after updating any setting in the database.
 */
export function invalidateSettingsCache(): void {
  cachedSettings = null;
}
