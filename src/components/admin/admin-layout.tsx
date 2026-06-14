/**
 * @fileoverview Admin layout wrapper with sidebar and main content area.
 * Used by the admin route group to wrap all admin pages.
 */

import Sidebar from "@/components/admin/sidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Admin layout with sidebar navigation and main content area.
 * @param props.children - The admin page content to render.
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-50 p-8">{children}</main>
    </div>
  );
}
