import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FrontendLayout from "@/components/frontend/frontend-layout";
import Toast from "@/components/shared/toast";

// Register background tasks (token cleanup) at module load time
import { registerBackgroundTasks } from "@/lib/startup";
registerBackgroundTasks();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "User Dashboard",
    template: "%s | User Dashboard",
  },
  description: "User management system with CMS",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    siteName: "User Dashboard",
    title: "User Dashboard",
    description: "User management system with CMS",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "User Dashboard",
    description: "User management system with CMS",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Toast />
        <FrontendLayout>{children}</FrontendLayout>
      </body>
    </html>
  );
}
