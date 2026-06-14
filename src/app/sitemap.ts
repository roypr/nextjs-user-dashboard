/**
 * @fileoverview Dynamic sitemap generation for SEO.
 * Includes the home page, all published CMS pages, and static auth routes.
 * Uses NEXT_PUBLIC_SITE_URL for the base URL.
 */

import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

/**
 * Generates the sitemap XML with all public routes.
 * Includes the home page, all published CMS pages from the database,
 * and static auth routes (login, signup).
 * @returns Sitemap entries array.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // Static routes
  const staticRoutes = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
    {
      url: `${siteUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
  ];

  // Dynamic CMS pages
  let pages: { slug: string; updatedAt: Date }[] = [];
  try {
    pages = await prisma.page.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
  } catch {
    // If DB is unreachable, return only static routes
  }

  const pageRoutes = pages.map((page) => ({
    url: `${siteUrl}/${page.slug}`,
    lastModified: page.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...pageRoutes];
}
