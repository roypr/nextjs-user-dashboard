/**
 * @fileoverview Pure URL slug generation utility. No database dependencies.
 * This can be safely imported by client components.
 */

/**
 * Generates a URL-friendly slug from a title string.
 * Lowercases, converts spaces to hyphens, removes special characters.
 * @param title - The source string to convert to a slug.
 * @returns The basic slug without collision handling.
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")   // Remove special characters
    .replace(/\s+/g, "-")       // Replace spaces with hyphens
    .replace(/-+/g, "-")        // Collapse multiple hyphens
    .replace(/^-+|-+$/g, "");   // Trim leading/trailing hyphens
}
