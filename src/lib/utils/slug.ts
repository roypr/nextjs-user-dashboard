/**
 * @fileoverview URL slug generation utility with database collision handling.
 * Generates slugs from page titles and checks the database for uniqueness,
 * appending incrementing suffixes (-2, -3, etc.) when collisions are detected.
 */

import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils/slugify";

const MAX_COLLISION_ATTEMPTS = 10;

/**
 * Generates a unique slug from a title by checking the database for collisions.
 * Generates a unique slug from a title by checking the database for collisions.
 * If the slug already exists, appends -2, -3, etc. (up to MAX_COLLISION_ATTEMPTS).
 * @param title - The source string to generate a slug from.
 * @param excludeId - Optional page ID to exclude from collision checks (for updates).
 * @returns A unique slug string.
 * @throws {Error} If a unique slug cannot be generated after max attempts.
 */
export async function generateSlug(
  title: string,
  excludeId?: string,
): Promise<string> {
  const baseSlug = slugify(title);
  if (!baseSlug) {
    throw new Error("Cannot generate slug from empty or invalid title");
  }

  for (let attempt = 0; attempt < MAX_COLLISION_ATTEMPTS; attempt++) {
    const candidate = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;

    const existing = await prisma.page.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) {
      return candidate;
    }
  }

  throw new Error(
    `Could not generate unique slug for "${title}" after ${MAX_COLLISION_ATTEMPTS} attempts`,
  );
}
