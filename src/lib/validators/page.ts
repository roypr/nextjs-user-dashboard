/**
 * @fileoverview Zod validation schemas for CMS page management forms.
 * All fields use `.describe()` for self-documenting schemas.
 */

import { z } from "zod";

/**
 * Create page validation schema.
 * Title is required. Slug is optional (auto-generated if omitted).
 * Content defaults to empty string.
 */
export const createPageSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters")
    .describe("Page title (plain text)"),
  slug: z
    .string()
    .trim()
    .max(200, "Slug must be at most 200 characters")
    .optional()
    .describe("URL slug (auto-generated from title if not provided)"),
  content: z
    .string()
    .optional()
    .default("")
    .describe("Page content as HTML"),
});

/**
 * Update page validation schema.
 * Same fields as create, but all are optional since it's a partial update.
 */
export const updatePageSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters")
    .describe("Page title (plain text)"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(200, "Slug must be at most 200 characters")
    .describe("URL slug (must be unique)"),
  content: z
    .string()
    .describe("Page content as HTML"),
});
