/**
 * @fileoverview Dynamic CMS page route — renders a page by its slug.
 * Fetches the Page by slug from the database. If not found, calls notFound().
 * Export generateMetadata() with page title + description (first 160 chars of stripped content).
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Strips HTML tags from a string to get plain text for SEO description.
 * @param html - The HTML string to strip.
 * @returns Plain text string.
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Generates SEO metadata for a CMS page.
 * Uses the page title and first 160 characters of content as description.
 * Includes OpenGraph and Twitter card metadata for social sharing.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const page = await prisma.page.findUnique({
    where: { slug },
    select: { title: true, content: true },
  });

  if (!page) {
    return { title: "Page Not Found" };
  }

  const plainText = stripHtml(page.content);
  const description = plainText.slice(0, 160).trim() + (plainText.length > 160 ? "..." : "");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    title: page.title,
    description: description || undefined,
    openGraph: {
      title: page.title,
      description: description || undefined,
      url: `${siteUrl}/${slug}`,
      type: "article",
      siteName: "User Dashboard",
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: description || undefined,
    },
  };
}

/**
 * Dynamic CMS page — renders the title and content for the given slug.
 * Calls notFound() if the slug doesn't match any page.
 */
export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  const page = await prisma.page.findUnique({
    where: { slug },
    select: {
      title: true,
      content: true,
      updatedAt: true,
    },
  });

  if (!page) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
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
      <p className="mt-12 text-xs text-gray-400">
        Last updated: {page.updatedAt.toLocaleDateString()}
      </p>
    </article>
  );
}
