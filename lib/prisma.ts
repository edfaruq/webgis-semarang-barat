import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Ensure DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set in environment variables!");
  console.error("Available env vars:", Object.keys(process.env).filter(k => k.includes("DATABASE")));
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
