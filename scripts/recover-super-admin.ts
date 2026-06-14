/**
 * @fileoverview CLI recovery script for Super Admin account.
 * Reads SUPER_ADMIN_EMAIL from env, updates the email and password hash,
 * and increments tokenVersion to invalidate existing sessions.
 *
 * Usage: npx tsx scripts/recover-super-admin.ts --email new@example.com --password newpass
 * If --email and --password are not provided, uses values from .env.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const BCRYPT_COST_FACTOR = 12;

async function main() {
  const args = process.argv.slice(2);
  const emailArg = parseArg(args, "--email");
  const passwordArg = parseArg(args, "--password");

  const newEmail = emailArg ?? process.env.SUPER_ADMIN_EMAIL;
  const newPassword = passwordArg ?? process.env.SUPER_ADMIN_PASSWORD;

  if (!newEmail || !newPassword) {
    console.error(
      "❌ Email and password required. Provide --email and --password args or set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in .env",
    );
    console.log("Usage: npx tsx scripts/recover-super-admin.ts --email new@example.com --password newpass");
    process.exit(1);
  }

  const connectionString = process.env.DATABASE_URL ?? "";
  const adapter = new PrismaPg(connectionString);
  const prisma = new PrismaClient({ adapter });

  console.log("🔐 Starting Super Admin recovery...");

  try {
    // Find the Super Admins group
    const superAdminGroup = await prisma.userGroup.findFirst({
      where: { type: "admin", routePermissions: { has: "*" } },
    });

    if (!superAdminGroup) {
      console.error("❌ No Super Admin group found. Run seed script first.");
      process.exit(1);
    }

    // Find existing user by current email or group membership
    let user = await prisma.user.findFirst({
      where: {
        groupId: superAdminGroup.id,
        email: process.env.SUPER_ADMIN_EMAIL ?? "",
      },
    });

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_COST_FACTOR);

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          email: newEmail,
          passwordHash,
          emailVerified: true,
          tokenVersion: { increment: 1 },
        },
      });
      console.log(`✅ Updated Super Admin: ${user.email} -> ${newEmail}`);
      console.log(`✅ Password updated and tokenVersion incremented (sessions invalidated)`);
    } else {
      // Create new Super Admin user
      await prisma.user.create({
        data: {
          email: newEmail,
          passwordHash,
          emailVerified: true,
          groupId: superAdminGroup.id,
        },
      });
      console.log(`✅ Created Super Admin: ${newEmail}`);
    }

    console.log("🎉 Recovery completed successfully!");
  } catch (error) {
    console.error("❌ Recovery failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

function parseArg(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  if (index !== -1 && index + 1 < args.length) {
    return args[index + 1];
  }
  return undefined;
}

main();
