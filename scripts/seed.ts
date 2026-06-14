/**
 * @fileoverview Idempotent seed script that sets up the initial database state.
 * Creates the "Super Admins" group and Super Admin user, and inserts default settings.
 *
 * Usage: npx tsx scripts/seed.ts
 *
 * Idempotent — safe to run multiple times.
 * - Creates "Super Admins" group (type="admin", routePermissions=["*"]) if not exists
 * - Creates or updates Super Admin user (email from SUPER_ADMIN_EMAIL, password from SUPER_ADMIN_PASSWORD)
 * - Inserts default settings if Setting table is empty
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const BCRYPT_COST_FACTOR = 12;

async function main() {
  const connectionString = process.env.DATABASE_URL ?? "";
  const adapter = new PrismaPg(connectionString);
  const prisma = new PrismaClient({ adapter });

  console.log("🌱 Starting seed...");

  try {
    // --- Create Super Admins group ---
    const groupName = "Super Admins";
    let superAdminGroup = await prisma.userGroup.findUnique({
      where: { name: groupName },
    });

    if (!superAdminGroup) {
      superAdminGroup = await prisma.userGroup.create({
        data: {
          name: groupName,
          type: "admin",
          routePermissions: ["*"],
        },
      });
      console.log(`✅ Created group: ${groupName}`);
    } else {
      // Ensure it has correct permissions
      superAdminGroup = await prisma.userGroup.update({
        where: { id: superAdminGroup.id },
        data: {
          type: "admin",
          routePermissions: ["*"],
          permissionVersion: superAdminGroup.permissionVersion + 1,
        },
      });
      console.log(`ℹ️  Updated group: ${groupName}`);
    }

    // --- Create or update Super Admin user ---
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

    if (!superAdminEmail || !superAdminPassword) {
      console.error(
        "❌ SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set in .env",
      );
      process.exit(1);
    }

    const existingSuperAdmin = await prisma.user.findUnique({
      where: { email: superAdminEmail },
    });

    const passwordHash = await bcrypt.hash(
      superAdminPassword,
      BCRYPT_COST_FACTOR,
    );

    if (existingSuperAdmin) {
      await prisma.user.update({
        where: { id: existingSuperAdmin.id },
        data: {
          passwordHash,
          emailVerified: true,
          groupId: superAdminGroup.id,
          tokenVersion: existingSuperAdmin.tokenVersion + 1, // Invalidate existing sessions
        },
      });
      console.log(`✅ Updated Super Admin: ${superAdminEmail}`);
    } else {
      await prisma.user.create({
        data: {
          email: superAdminEmail,
          passwordHash,
          emailVerified: true,
          groupId: superAdminGroup.id,
        },
      });
      console.log(`✅ Created Super Admin: ${superAdminEmail}`);
    }

    // --- Insert default settings ---
    const settingCount = await prisma.setting.count();
    if (settingCount === 0) {
      const defaultSettings = [
        { key: "site_name", value: "My App" },
        { key: "home_page", value: "" },
        {
          key: "header_menu_logged_out",
          value: JSON.stringify([
            { label: "Home", href: "/" },
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
        { key: "footer_content", value: "<p>Powered by Next.js</p>" },
      ];

      for (const setting of defaultSettings) {
        await prisma.setting.create({ data: setting });
      }
      console.log("✅ Inserted default settings");
    } else {
      console.log(`ℹ️  Settings table already has ${settingCount} entries — skipping defaults`);
    }

    console.log("🎉 Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
