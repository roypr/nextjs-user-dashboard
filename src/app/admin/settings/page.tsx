/**
 * @fileoverview Admin settings page.
 * Form for editing all site settings: site name, home page, menus, and footer.
 * Settings are loaded server-side and passed to a client-side form.
 */

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";
import { getCachedSettings } from "@/lib/settings-cache";
import SettingsForm from "./settings-form";

/**
 * Admin settings page — fetches current settings and renders the edit form.
 */
export default async function SettingsPage() {
  const session = await getSession();
  if (!authorize(session, { type: "admin" }) || !authorize(session, { type: "route", path: "/admin/settings" })) {
    return (
      <div className="p-8 text-center text-gray-500">
        Unauthorized
      </div>
    );
  }

  const settings = await getCachedSettings();

  // Get all page slugs for the home page dropdown
  const pages = await prisma.page.findMany({
    select: { slug: true, title: true },
    orderBy: { title: "asc" },
  });

  return <SettingsForm settings={settings} pages={pages} />;
}
