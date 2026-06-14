/**
 * @fileoverview Shared TypeScript types used across the application.
 * These types define the shape of session data, auth checks, page data,
 * header menu items, and site settings.
 */

/**
 * Session data stored in the JWE cookie.
 * Contains user identity, group info, and version counters for invalidation.
 */
export interface SessionData {
  /** Unique user identifier */
  userId: string;
  /** User's email address */
  email: string;
  /** User group ID (nullable for users without a group) */
  groupId: string | null;
  /** User group type: "admin" or "regular" */
  groupType: string | null;
  /** Route permission patterns for admin-type groups */
  routePermissions: string[];
  /** Whether the user is the Super Admin */
  isSuperAdmin: boolean;
  /** Session invalidation counter — checked against DB on each request */
  tokenVersion: number;
  /** Permission version for cache invalidation */
  permissionVersion: number;
}

/**
 * Authorization check descriptors passed to the `authorize()` function.
 */
export type AuthCheck =
  /** Any authenticated user */
  | { type: "any" }
  /** User in an admin-type group */
  | { type: "admin" }
  /** Admin user with matching route permission */
  | { type: "route"; path: string }
  /** Session email matches SUPER_ADMIN_EMAIL env var */
  | { type: "super_admin" };

/**
 * CMS page data returned from the database.
 */
export interface PageData {
  /** Page ID */
  id: string;
  /** Page title (plain text) */
  title: string;
  /** URL slug */
  slug: string;
  /** Page content as HTML */
  content: string;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * A single header menu item with label and URL.
 */
export interface HeaderMenuItem {
  /** Display label for the menu item */
  label: string;
  /** URL href for the menu item */
  href: string;
}

/**
 * Typed site settings object.
 */
export interface SettingsData {
  /** Site name displayed in header and SEO metadata */
  siteName: string;
  /** Slug of the selected home page (empty string if none) */
  homePage: string;
  /** Header menu items for logged-out users */
  headerMenuLoggedOut: HeaderMenuItem[];
  /** Header menu items for logged-in users */
  headerMenuLoggedIn: HeaderMenuItem[];
  /** Footer HTML content */
  footerContent: string;
}
