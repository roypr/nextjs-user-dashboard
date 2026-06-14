/**
 * @fileoverview Admin page management Server Actions.
 * Provides CRUD operations for CMS pages with pagination, search, and slug collision handling.
 * Follows the mandatory validation pattern:
 * session -> authorize -> rate limit -> validate -> operate -> revalidate -> return
 *
 * Auth required (all): admin + route /admin/pages
 */

"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";
import { generateSlug } from "@/lib/utils/slug";
import { createPageSchema, updatePageSchema } from "@/lib/validators/page";

const ITEMS_PER_PAGE = 20;

interface PaginatedPagesResult {
  pages: Array<{
    id: string;
    title: string;
    slug: string;
    updatedAt: Date;
  }>;
  totalPages: number;
  currentPage: number;
  total: number;
}

/**
 * Returns a paginated list of CMS pages with optional search by title.
 * Auth: admin + route /admin/pages
 *
 * @param query - Search query (matches against page title).
 * @param page - Page number (1-indexed, default: 1).
 */
export async function getPages(
  query?: string,
  page: number = 1,
): Promise<PaginatedPagesResult> {
  const session = await getSession();
  if (!authorize(session, { type: "admin" }) || !authorize(session, { type: "route", path: "/admin/pages" })) {
    throw new Error("Unauthorized");
  }

  const skip = (page - 1) * ITEMS_PER_PAGE;

  const where = query
    ? { title: { contains: query, mode: "insensitive" as const } }
    : {};

  const [pages, total] = await Promise.all([
    prisma.page.findMany({
      where,
      skip,
      take: ITEMS_PER_PAGE,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        updatedAt: true,
      },
    }),
    prisma.page.count({ where }),
  ]);

  return {
    pages,
    totalPages: Math.ceil(total / ITEMS_PER_PAGE),
    currentPage: page,
    total,
  };
}

/**
 * Creates a new CMS page.
 * If no slug is provided, auto-generates from the title with collision handling.
 * Catches Prisma unique constraint errors and suggests an alternative slug.
 * Auth: admin + route /admin/pages
 */
export async function createPage(
  prevState: { error?: string; success?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  try {
    const session = await getSession();
    if (!authorize(session, { type: "admin" }) || !authorize(session, { type: "route", path: "/admin/pages" })) {
      return { error: "Unauthorized." };
    }

    // Validate
    const parsed = createPageSchema.safeParse({
      title: formData.get("title"),
      slug: formData.get("slug") || undefined,
      content: formData.get("content") || "",
    });
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
      return { error: firstError };
    }

    let { title, slug, content } = parsed.data;

    // Auto-generate slug if not provided
    if (!slug) {
      slug = await generateSlug(title);
    }

    try {
      await prisma.page.create({
        data: { title, slug, content: content ?? "" },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        // Unique constraint violation — suggest alternative
        const suggestion = await generateSlug(title);
        return {
          error: `A page with slug "${slug}" already exists. Consider using "${suggestion}" instead.`,
        };
      }
      throw error;
    }

    revalidatePath("/admin/pages");
    return { success: "Page created successfully." };
  } catch (error) {
    console.error("Create page error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Updates an existing CMS page (title, content, slug).
 * Slug must remain unique.
 * Auth: admin + route /admin/pages
 *
 * @param id - The page ID to update.
 */
export async function updatePage(
  id: string,
  prevState: { error?: string; success?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  try {
    const session = await getSession();
    if (!authorize(session, { type: "admin" }) || !authorize(session, { type: "route", path: "/admin/pages" })) {
      return { error: "Unauthorized." };
    }

    // Validate
    const parsed = updatePageSchema.safeParse({
      title: formData.get("title"),
      slug: formData.get("slug"),
      content: formData.get("content") || "",
    });
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
      return { error: firstError };
    }

    const { title, slug, content } = parsed.data;

    // Check slug uniqueness (exclude current page)
    const existingPageWithSlug = await prisma.page.findUnique({
      where: { slug },
    });
    if (existingPageWithSlug && existingPageWithSlug.id !== id) {
      const suggestion = await generateSlug(title);
      return {
        error: `A page with slug "${slug}" already exists. Consider using "${suggestion}" instead.`,
      };
    }

    await prisma.page.update({
      where: { id },
      data: { title, slug, content },
    });

    revalidatePath("/admin/pages");
    return { success: "Page updated successfully." };
  } catch (error) {
    console.error("Update page error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Deletes a CMS page. Refuses if the page slug matches the `home_page` setting.
 * Auth: admin + route /admin/pages
 *
 * @param id - The page ID to delete.
 */
export async function deletePage(
  id: string,
): Promise<{ error?: string; success?: string }> {
  try {
    const session = await getSession();
    if (!authorize(session, { type: "admin" }) || !authorize(session, { type: "route", path: "/admin/pages" })) {
      return { error: "Unauthorized." };
    }

    const page = await prisma.page.findUnique({
      where: { id },
      select: { id: true, slug: true },
    });

    if (!page) {
      return { error: "Page not found." };
    }

    // Check if this page is set as the home page
    const homePageSetting = await prisma.setting.findUnique({
      where: { key: "home_page" },
    });

    if (homePageSetting && homePageSetting.value === page.slug) {
      return {
        error:
          `Cannot delete this page because it is set as the home page. ` +
          `Please change the home page setting in Settings first.`,
      };
    }

    await prisma.page.delete({
      where: { id },
    });

    revalidatePath("/admin/pages");
    return { success: "Page deleted successfully." };
  } catch (error) {
    console.error("Delete page error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}
