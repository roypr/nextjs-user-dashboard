/**
 * @fileoverview Admin layout wrapper with sidebar and main content area.
 * Used by the admin route group to wrap all admin pages.
 * The sidebar is responsive — collapses to hamburger menu on mobile.
 */

import Sidebar from "@/components/admin/sidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Admin layout with responsive sidebar navigation and main content area.
 * On mobile (< 768px), the sidebar is hidden behind a hamburger toggle,
 * and the main content fills the full width.
 *
 * @param props.children - The admin page content to render.
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-50 p-4 pt-16 md:pt-8 md:p-8">
        {children}
      </main>
    </div>
  );
}
