/**
 * @fileoverview Dynamic sitemap generation for SEO.
 * Includes the home page, all published CMS pages ([slug]), and
 * an extendable list of extra public routes (contact, etc.).
 * Auth, admin, and account routes are intentionally excluded.
 * Uses NEXT_PUBLIC_SITE_URL for the base URL.
 */

import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

// ── Extendable list of extra public routes ──────────────────────────────────
// Add any future public-facing routes here (e.g., /contact, /about, /faq).
const EXTRA_ROUTES: { path: string; priority?: number }[] = [];

/**
 * Generates the sitemap XML.
 *
 * Priority order:
 *  1. Home page
 *  2. CMS pages ([slug]) from the database
 *  3. Extra public routes (e.g., /contact)
 *
 * @returns Sitemap entries array.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const now = new Date();

  // 1. Home page — highest priority
  const homeEntry: MetadataRoute.Sitemap[number] = {
    url: siteUrl,
    lastModified: now,
    changeFrequency: "daily",
    priority: 1.0,
  };

  // 2. Dynamic CMS pages from the database
  let pages: { slug: string; updatedAt: Date }[] = [];
  try {
    pages = await prisma.page.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
  } catch {
    // DB unreachable → continue with home + extra routes only
  }

  const pageEntries: MetadataRoute.Sitemap = pages.map((page) => ({
    url: `${siteUrl}/${page.slug}`,
    lastModified: page.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 3. Extra public routes (contact, etc.)
  const extraEntries: MetadataRoute.Sitemap = EXTRA_ROUTES.map(({ path, priority }) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: priority ?? 0.5,
  }));

  return [homeEntry, ...pageEntries, ...extraEntries];
}
