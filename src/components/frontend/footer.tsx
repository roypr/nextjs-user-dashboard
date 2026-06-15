/**
 * @fileoverview Dynamic frontend footer component.
 * Reads footer_content from site settings and renders via dangerouslySetInnerHTML.
 * Falls back to default text if settings are unavailable.
 * Styled with the warm-professional design system.
 */

import { getCachedSettings } from "@/lib/settings-cache";

/**
 * Frontend footer with dynamic HTML content from settings.
 * Falls back to "Powered by Next.js" if settings are not available.
 */
export default async function Footer() {
  let footerContent = "<p>Powered by Next.js</p>";

  try {
    const settings = await getCachedSettings();
    if (settings.footerContent) {
      footerContent = settings.footerContent;
    }
  } catch {
    // Use default fallback
  }

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-card)]">
      <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-[var(--text-muted)] sm:px-6 lg:px-8">
        {/**
         * HTML trust boundary: Footer content is authored by admins through the
         * settings panel. Admins are trusted users, so rendering HTML via
         * dangerouslySetInnerHTML is acceptable in this context.
         */}
        <div dangerouslySetInnerHTML={{ __html: footerContent }} />
      </div>
    </footer>
  );
}
