/**
 * @fileoverview Zod validation schemas for user group management forms.
 * All fields use `.describe()` for self-documenting schemas.
 */

import { z } from "zod";

/**
 * Predefined route permission options available for assignment to admin groups.
 */
export const ROUTE_PERMISSIONS = [
  { label: "Users", value: "/admin/users" },
  { label: "Pages", value: "/admin/pages" },
  { label: "Settings", value: "/admin/settings" },
  { label: "Groups", value: "/admin/groups" },
] as const;

/**
 * Create group validation schema.
 * Name is required and unique. Type must be "admin" or "regular".
 * Route permissions is an array of path strings.
 */
export const createGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Group name is required")
    .max(100, "Group name must be at most 100 characters")
    .describe("Display name for the group"),
  type: z
    .enum(["admin", "regular"])
    .describe("Group type: admin for admin panel access, regular for standard users"),
  routePermissions: z
    .array(z.string())
    .default([])
    .describe("Route permission patterns for admin-type groups"),
});

/**
 * Update group validation schema.
 * Same fields as create, all required for explicit updates.
 */
export const updateGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Group name is required")
    .max(100, "Group name must be at most 100 characters")
    .describe("Display name for the group"),
  type: z
    .enum(["admin", "regular"])
    .describe("Group type: admin for admin panel access, regular for standard users"),
  routePermissions: z
    .array(z.string())
    .default([])
    .describe("Route permission patterns for admin-type groups"),
});
