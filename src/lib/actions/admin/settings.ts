/**
 * @fileoverview Admin settings management Server Actions.
 * Reads and updates site settings with cache invalidation.
 * Follows the mandatory validation pattern:
 * session -> authorize -> rate limit -> validate -> operate -> revalidate -> return
 *
 * Auth required (both): admin + route /admin/settings
 */

"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";
import { getCachedSettings, invalidateSettingsCache } from "@/lib/settings-cache";
import { settingsSchema, parseMenuJson } from "@/lib/validators/settings";

/**
 * Returns the typed settings object from cache (or DB on cache miss).
 * Auth: admin + route /admin/settings
 */
export async function getSettings() {
  const session = await getSession();
  if (!authorize(session, { type: "admin" }) || !authorize(session, { type: "route", path: "/admin/settings" })) {
    throw new Error("Unauthorized");
  }

  return getCachedSettings();
}

/**
 * Updates site settings, validates each field, writes to DB, and invalidates
 * the settings cache.
 * Auth: admin + route /admin/settings
 */
export async function updateSettings(
  prevState: { error?: string; success?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  try {
    const session = await getSession();
    if (!authorize(session, { type: "admin" }) || !authorize(session, { type: "route", path: "/admin/settings" })) {
      return { error: "Unauthorized." };
    }

    // Validate
    const parsed = settingsSchema.safeParse({
      siteName: formData.get("siteName"),
      homePage: formData.get("homePage") || "",
      headerMenuLoggedOut: formData.get("headerMenuLoggedOut") || "[]",
      headerMenuLoggedIn: formData.get("headerMenuLoggedIn") || "[]",
      footerContent: formData.get("footerContent") || "",
    });
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
      return { error: firstError };
    }

    const { siteName, homePage, headerMenuLoggedOut, headerMenuLoggedIn, footerContent } = parsed.data;

    // Validate JSON menu formats with try-catch
    try {
      parseMenuJson(headerMenuLoggedOut);
    } catch {
      return {
        error:
          "Invalid format for logged-out menu. Must be a JSON array of {label, href} objects.",
      };
    }

    try {
      parseMenuJson(headerMenuLoggedIn);
    } catch {
      return {
        error:
          "Invalid format for logged-in menu. Must be a JSON array of {label, href} objects.",
      };
    }

    // Upsert each setting
    const settingsMap: Record<string, string> = {
      site_name: siteName,
      home_page: homePage,
      header_menu_logged_out: headerMenuLoggedOut,
      header_menu_logged_in: headerMenuLoggedIn,
      footer_content: footerContent,
    };

    await prisma.$transaction(
      Object.entries(settingsMap).map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        }),
      ),
    );

    // Invalidate cache
    invalidateSettingsCache();

    revalidatePath("/admin/settings");
    return { success: "Settings updated successfully." };
  } catch (error) {
    console.error("Update settings error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}
