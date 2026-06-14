/**
 * @fileoverview Zod validation schema for site settings.
 * Validates each setting key's structure with appropriate constraints.
 * All fields use `.describe()` for self-documenting schemas.
 */

import { z } from "zod";

/**
 * Header menu item schema — used within menu arrays.
 */
const headerMenuItemSchema = z.object({
  label: z.string().min(1, "Menu item label is required").describe("Display label for the menu item"),
  href: z.string().min(1, "Menu item href is required").describe("URL for the menu item"),
});

/**
 * Site settings validation schema.
 * Validates all configurable site settings in a single object.
 */
export const settingsSchema = z.object({
  /** Site name displayed in header and SEO metadata */
  siteName: z
    .string()
    .trim()
    .min(1, "Site name is required")
    .max(100, "Site name must be at most 100 characters")
    .describe("Site name displayed in header and SEO metadata"),
  /** Slug of the selected home page (empty string if none) */
  homePage: z
    .string()
    .describe("Slug of the page to use as the home page (empty string for default)"),
  /** Header menu items for logged-out users (JSON array of {label, href}) */
  headerMenuLoggedOut: z
    .string()
    .describe("JSON array of {label, href} objects for logged-out header menu"),
  /** Header menu items for logged-in users (JSON array of {label, href}) */
  headerMenuLoggedIn: z
    .string()
    .describe("JSON array of {label, href} objects for logged-in header menu"),
  /** Footer HTML content */
  footerContent: z
    .string()
    .describe("Footer content as HTML"),
});

/**
 * Parses and validates the header menu JSON string.
 * @param jsonString - The JSON string to parse.
 * @returns Parsed array of HeaderMenuItem or throws on invalid input.
 */
export function parseMenuJson(jsonString: string): { label: string; href: string }[] {
  try {
    const parsed = JSON.parse(jsonString);
    return headerMenuItemSchema.array().parse(parsed);
  } catch {
    throw new Error("Invalid menu format. Must be a JSON array of {label, href} objects.");
  }
}
