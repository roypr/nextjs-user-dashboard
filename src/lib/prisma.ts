/**
 * @fileoverview Prisma client singleton with connection error handling and retry logic.
 * Exports a single PrismaClient instance configured with the Prisma 7 adapter pattern.
 * On connection failure, retries up to 3 times with exponential backoff before throwing.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL ?? "";
  const adapter = new PrismaPg(connectionString);
  return new PrismaClient({ adapter });
}

let prisma: PrismaClient;

declare const globalThis: {
  prismaGlobal: PrismaClient | undefined;
};

if (process.env.NODE_ENV === "production") {
  prisma = createPrismaClient();
} else {
  // Preserve client across hot reloads in development
  if (!globalThis.prismaGlobal) {
    globalThis.prismaGlobal = createPrismaClient();
  }
  prisma = globalThis.prismaGlobal;
}

/**
 * Attempts to connect to the database with retry logic.
 * Retries up to MAX_RETRIES times with exponential backoff.
 * @throws {Error} If all connection attempts fail.
 */
export async function connectWithRetry(): Promise<void> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await prisma.$connect();
      console.log("Prisma connected successfully");
      return;
    } catch (error) {
      console.error(
        `Prisma connection attempt ${attempt}/${MAX_RETRIES} failed:`,
        error instanceof Error ? error.message : error,
      );
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, attempt - 1)),
        );
      }
    }
  }
  throw new Error("Failed to connect to database after multiple retries");
}

/**
 * Safely disconnects the Prisma client.
 */
export async function disconnectPrisma(): Promise<void> {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error("Error disconnecting Prisma:", error);
  }
}

export default prisma;
