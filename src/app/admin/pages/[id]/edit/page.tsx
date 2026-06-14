/**
 * @fileoverview Edit page for admin CMS.
 * Server component that fetches page data and renders a client-side edit form.
 * Form with title, slug override, and content HTML textarea.
 */

import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";
import EditPageForm from "./edit-page-form";

interface EditPagePageProps {
  params: Promise<{ id: string }>;
}

/**
 * Admin edit page — fetches page and renders edit form.
 */
export default async function EditPagePage({ params }: EditPagePageProps) {
  const { id } = await params;

  // Check authorization
  const session = await getSession();
  if (!authorize(session, { type: "admin" }) || !authorize(session, { type: "route", path: "/admin/pages" })) {
    return notFound();
  }

  const page = await prisma.page.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
    },
  });

  if (!page) {
    return notFound();
  }

  return <EditPageForm page={page} />;
}
