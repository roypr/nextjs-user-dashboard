/**
 * @fileoverview Dynamic robots.txt generation for SEO.
 * Allows all crawlers and points to the sitemap.
 * Uses NEXT_PUBLIC_SITE_URL for the base URL.
 */

import type { MetadataRoute } from "next";

/**
 * Generates robots.txt content dynamically.
 * Allows all well-behaved crawlers and links to the sitemap.
 * @returns Robots configuration.
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
