/**
 * Verify admin user exists and test password hash
 * Run: node scripts/verify-admin.mjs
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

async function main() {
  console.log("Checking admin user...");
  console.log(`Email: ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}\n`);

  const user = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (!user) {
    console.error("❌ User tidak ditemukan di database!");
    console.log("\nJalankan seed admin:");
    console.log("  railway run npm run db:seed");
    console.log("  atau");
    console.log("  node scripts/seed-admin.mjs");
    return;
  }

  console.log("✅ User ditemukan:");
  console.log(`  ID: ${user.id}`);
  console.log(`  Email: ${user.email}`);
  console.log(`  Role: ${user.role}`);
  console.log(`  Password Hash: ${user.password.substring(0, 20)}...`);

  // Test password
  console.log("\nTesting password...");
  const isValid = await bcrypt.compare(ADMIN_PASSWORD, user.password);
  
  if (isValid) {
    console.log("✅ Password valid!");
    console.log("\nAnda bisa login dengan:");
    console.log(`  Email: ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
  } else {
    console.error("❌ Password tidak cocok!");
    console.log("\nKemungkinan masalah:");
    console.log("  1. Password di database berbeda dengan yang di input");
    console.log("  2. Password tidak di-hash dengan benar");
    console.log("\nSolusi: Jalankan seed ulang:");
    console.log("  railway run npm run db:seed");
  }
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
