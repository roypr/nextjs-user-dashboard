/**
 * @fileoverview Frontend layout wrapper combining Header, main content area, and Footer.
 * Wraps all public-facing pages with consistent warm background.
 */

import Header from "@/components/frontend/header";
import Footer from "@/components/frontend/footer";

interface FrontendLayoutProps {
  children: React.ReactNode;
}

/**
 * Wraps page content in frontend header + main + footer layout.
 * @param props.children - The page content to render.
 */
export default function FrontendLayout({ children }: FrontendLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-page)]">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
