/**
 * @fileoverview Idempotent seed script that sets up the initial database state.
 * Creates user groups, users, demo pages, and default settings.
 *
 * Usage: npx tsx scripts/seed.ts
 *
 * Idempotent — safe to run multiple times.
 * - Creates "Super Admins" group (type="admin", routePermissions=["*"]) if not exists
 * - Creates or updates Super Admin user (email from SUPER_ADMIN_EMAIL, password from SUPER_ADMIN_PASSWORD)
 * - Creates "Admins" and "Regular Users" groups
 * - Creates 2 admin-type users and 5 regular demo users
 * - Creates demo pages: Home, About Us, Privacy Policy
 * - Sets home_page setting to the Home page slug
 * - Inserts default settings if Setting table is empty
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const BCRYPT_COST_FACTOR = 12;
const DEMO_PASSWORD = "Demo1234!";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const connectionString = process.env.DATABASE_URL ?? "";
  const adapter = new PrismaPg(connectionString);
  const prisma = new PrismaClient({ adapter });

  console.log("🌱 Starting seed...");

  try {
    // =========================================================
    // 1. USER GROUPS
    // =========================================================

    // --- Super Admins group ---
    const superAdminGroup = await upsertGroup(prisma, {
      name: "Super Admins",
      type: "admin",
      routePermissions: ["*"],
    });

    // --- Admins group ---
    const adminGroup = await upsertGroup(prisma, {
      name: "Admins",
      type: "admin",
      routePermissions: ["/admin/users", "/admin/pages", "/admin/settings"],
    });

    // --- Regular Users group ---
    const regularGroup = await upsertGroup(prisma, {
      name: "Regular Users",
      type: "regular",
      routePermissions: [],
    });

    // =========================================================
    // 2. SUPER ADMIN USER (from env vars)
    // =========================================================

    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

    if (!superAdminEmail || !superAdminPassword) {
      console.error(
        "❌ SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set in .env",
      );
      process.exit(1);
    }

    await upsertUser(prisma, {
      email: superAdminEmail,
      password: superAdminPassword,
      name: "Super Admin",
      groupId: superAdminGroup.id,
      emailVerified: true,
    });

    // =========================================================
    // 3. DEMO ADMIN USERS (2 users)
    // =========================================================

    const adminUsers = [
      { email: "admin1@example.com", name: "Alice Admin" },
      { email: "admin2@example.com", name: "Bob Admin" },
    ];

    for (const user of adminUsers) {
      await upsertUser(prisma, {
        email: user.email,
        password: DEMO_PASSWORD,
        name: user.name,
        groupId: adminGroup.id,
        emailVerified: true,
      });
    }

    // =========================================================
    // 4. DEMO REGULAR USERS (5 users)
    // =========================================================

    const regularUsers = [
      { email: "user1@example.com", name: "Charlie User" },
      { email: "user2@example.com", name: "Diana User" },
      { email: "user3@example.com", name: "Eve User" },
      { email: "user4@example.com", name: "Frank User" },
      { email: "user5@example.com", name: "Grace User" },
    ];

    for (const user of regularUsers) {
      await upsertUser(prisma, {
        email: user.email,
        password: DEMO_PASSWORD,
        name: user.name,
        groupId: regularGroup.id,
        emailVerified: true,
      });
    }

    // =========================================================
    // 5. DEMO PAGES
    // =========================================================

    const pages = [
      {
        title: "Home",
        content: `<h1>Welcome to Our Website</h1>
<p>This is the home page of our demo application. We are excited to have you here!</p>
<p>Feel free to explore the various features and pages available. This content management system allows you to create and manage pages with ease.</p>
<h2>Getting Started</h2>
<p>To get started, you can <a href="/login">log in</a> to your account or <a href="/signup">create a new account</a> if you don't have one yet.</p>
<p>Admin users can access the <a href="/admin/dashboard">admin panel</a> to manage users, pages, groups, and settings.</p>`,
      },
      {
        title: "About Us",
        content: `<h1>About Us</h1>
<p>We are a team of passionate developers building modern web applications using Next.js and Prisma.</p>
<h2>Our Mission</h2>
<p>Our mission is to create high-quality, user-friendly applications that make a difference. We believe in clean code, great user experiences, and continuous improvement.</p>
<h2>Our Team</h2>
<p>Our team consists of experienced full-stack developers, designers, and project managers who work together to deliver exceptional results.</p>
<h2>Technologies We Use</h2>
<ul>
  <li>Next.js — React framework for production</li>
  <li>Prisma — Next-generation ORM for Node.js</li>
  <li>PostgreSQL — Powerful open-source database</li>
  <li>TypeScript — Typed JavaScript for better code quality</li>
</ul>`,
      },
      {
        title: "Privacy Policy",
        content: `<h1>Privacy Policy</h1>
<p><em>Last updated: June 2025</em></p>
<h2>Information We Collect</h2>
<p>We collect information you provide directly to us, such as your name, email address, and any other information you choose to share when creating an account or contacting us.</p>
<h2>How We Use Your Information</h2>
<p>We use the information we collect to:</p>
<ul>
  <li>Provide, maintain, and improve our services</li>
  <li>Send you technical notices, updates, and support messages</li>
  <li>Respond to your comments, questions, and requests</li>
</ul>
<h2>Data Protection</h2>
<p>We implement appropriate security measures to protect your personal information. Passwords are hashed and salted using bcrypt, and sensitive data is handled with care.</p>
<h2>Contact Us</h2>
<p>If you have any questions about this Privacy Policy, please contact us at privacy@example.com.</p>`,
      },
    ];

    const createdPages: { title: string; slug: string }[] = [];

    for (const page of pages) {
      const slug = slugify(page.title);
      const existing = await prisma.page.findUnique({ where: { slug } });

      if (existing) {
        await prisma.page.update({
          where: { id: existing.id },
          data: { title: page.title, content: page.content },
        });
        console.log(`ℹ️  Updated page: "${page.title}" (slug: ${slug})`);
      } else {
        await prisma.page.create({
          data: { title: page.title, slug, content: page.content },
        });
        console.log(`✅ Created page: "${page.title}" (slug: ${slug})`);
      }

      createdPages.push({ title: page.title, slug });
    }

    // =========================================================
    // 6. SETTINGS
    // =========================================================

    const homePageSlug = slugify("Home");

    const settingsToUpsert = [
      { key: "site_name", value: "My App" },
      { key: "home_page", value: homePageSlug },
      {
        key: "header_menu_logged_out",
        value: JSON.stringify([
          { label: "Home", href: "/" },
          { label: "About Us", href: "/about-us" },
          { label: "Privacy Policy", href: "/privacy-policy" },
          { label: "Login", href: "/login" },
        ]),
      },
      {
        key: "header_menu_logged_in",
        value: JSON.stringify([
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/account/dashboard" },
        ]),
      },
      {
        key: "footer_content",
        value: "<p>&copy; 2025 My App. All rights reserved. | <a href='/privacy-policy'>Privacy Policy</a></p>",
      },
    ];

    for (const setting of settingsToUpsert) {
      const existing = await prisma.setting.findUnique({
        where: { key: setting.key },
      });

      if (existing) {
        await prisma.setting.update({
          where: { id: existing.id },
          data: { value: setting.value },
        });
      } else {
        await prisma.setting.create({ data: setting });
      }
    }
    console.log("✅ Settings configured");

    console.log("🎉 Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Creates or updates a user group with the given properties.
 */
async function upsertGroup(
  prisma: PrismaClient,
  data: {
    name: string;
    type: string;
    routePermissions: string[];
  },
) {
  let group = await prisma.userGroup.findUnique({
    where: { name: data.name },
  });

  if (group) {
    group = await prisma.userGroup.update({
      where: { id: group.id },
      data: {
        type: data.type,
        routePermissions: data.routePermissions,
        permissionVersion: group.permissionVersion + 1,
      },
    });
    console.log(`ℹ️  Updated group: ${data.name}`);
  } else {
    group = await prisma.userGroup.create({ data });
    console.log(`✅ Created group: ${data.name}`);
  }

  return group;
}

/**
 * Creates or updates a user with the given properties.
 * Updates password hash and increments tokenVersion on update.
 */
async function upsertUser(
  prisma: PrismaClient,
  data: {
    email: string;
    password: string;
    name: string;
    groupId: string;
    emailVerified: boolean;
  },
) {
  const passwordHash = await bcrypt.hash(data.password, BCRYPT_COST_FACTOR);
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        name: data.name,
        passwordHash,
        emailVerified: data.emailVerified,
        groupId: data.groupId,
        tokenVersion: existing.tokenVersion + 1,
      },
    });
    console.log(`ℹ️  Updated user: ${data.email}`);
  } else {
    await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        emailVerified: data.emailVerified,
        groupId: data.groupId,
      },
    });
    console.log(`✅ Created user: ${data.email}`);
  }
}

main();
