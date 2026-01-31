/**
 * Seed one admin user for WebGIS Semarang Barat.
 * Run: node scripts/seed-admin.mjs
 * Requires: DATABASE_URL in .env, and bcrypt (npm install bcrypt).
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

async function main() {
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const user = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { password: hash, role: "admin" },
    create: {
      email: ADMIN_EMAIL,
      password: hash,
      role: "admin",
    },
  });
  console.log("Admin user ready:", user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
