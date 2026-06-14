/**
 * @fileoverview Home page Server Component.
 * Reads the home_page setting to determine which CMS page to render.
 * If no home page is set, shows a default landing page.
 * Export generateMetadata() for dynamic SEO.
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { getCachedSettings } from "@/lib/settings-cache";

/**
 * Generates SEO metadata for the home page.
 * Uses settings for the site name and home page content.
 * Includes OpenGraph and Twitter card metadata for social sharing.
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getCachedSettings();
    const siteName = settings.siteName || "Home";
    const description = `Welcome to ${settings.siteName || "our site"}`;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    return {
      title: siteName,
      description,
      openGraph: {
        title: siteName,
        description,
        url: siteUrl,
        siteName,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: siteName,
        description,
      },
    };
  } catch {
    return {
      title: "Home",
      description: "Welcome to our site",
    };
  }
}

/**
 * Home page — renders the selected CMS page or a default landing page.
 */
export default async function HomePage() {
  let settings;
  try {
    settings = await getCachedSettings();
  } catch {
    settings = null;
  }

  const homePageSlug = settings?.homePage;

  // If a home page is configured, render it
  if (homePageSlug) {
    const page = await prisma.page.findUnique({
      where: { slug: homePageSlug },
      select: { title: true, content: true },
    });

    if (!page) {
      // Home page slug is set but page doesn't exist — fall through to default
      return renderDefaultHome(settings?.siteName ?? "My App");
    }

    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">{page.title}</h1>
        {/**
         * HTML trust boundary: Page content is authored by admins through the
         * CMS editor. Admins are trusted users, so rendering HTML via
         * dangerouslySetInnerHTML is acceptable in this context.
         */}
        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    );
  }

  // Default landing page
  return renderDefaultHome(settings?.siteName ?? "My App");
}

/**
 * Renders the default landing page when no home page is configured.
 * @param siteName - The site name from settings.
 */
function renderDefaultHome(siteName: string) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <h1 className="mb-4 text-4xl font-bold text-gray-900">
        Welcome to {siteName}
      </h1>
      <p className="mb-8 text-lg text-gray-600">
        This is a user management system with CMS capabilities.
        Use the admin panel to manage users, pages, and settings.
      </p>
      <div className="flex justify-center gap-4">
        <a
          href="/login"
          className="inline-flex items-center rounded bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Sign In
        </a>
        <a
          href="/signup"
          className="inline-flex items-center rounded border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Create Account
        </a>
      </div>
    </div>
  );
}
