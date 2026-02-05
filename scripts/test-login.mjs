/**
 * Test login flow directly from server
 * Run: railway run node scripts/test-login.mjs
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const SESSION_SECRET = process.env.SESSION_SECRET || "webgis-semarang-barat-session-secret-change-in-production";

async function testLogin() {
  console.log("Testing login flow...\n");
  console.log(`Email: ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
  console.log(`SESSION_SECRET exists: ${!!SESSION_SECRET}`);
  console.log(`SESSION_SECRET length: ${SESSION_SECRET.length}\n`);

  // Step 1: Find user
  console.log("Step 1: Finding user...");
  const user = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (!user) {
    console.error("❌ User not found!");
    return;
  }

  console.log(`✅ User found: ${user.email}, role: ${user.role}\n`);

  // Step 2: Verify password
  console.log("Step 2: Verifying password...");
  const valid = await bcrypt.compare(ADMIN_PASSWORD, user.password);
  
  if (!valid) {
    console.error("❌ Password invalid!");
    return;
  }

  console.log("✅ Password valid!\n");

  // Step 3: Create session token
  console.log("Step 3: Creating session token...");
  try {
    const secret = new TextEncoder().encode(SESSION_SECRET);
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);
    
    console.log("✅ Session token created!");
    console.log(`Token length: ${token.length} characters`);
    console.log(`Token preview: ${token.substring(0, 50)}...\n`);
    
    console.log("✅ All login steps successful!");
    console.log("\nIf login still fails in browser:");
    console.log("1. Check browser console for errors");
    console.log("2. Check Network tab - look for cookie 'admin_session'");
    console.log("3. Ensure using HTTPS (Railway provides automatically)");
    console.log("4. Clear browser cookies and try again");
  } catch (error) {
    console.error("❌ Error creating token:", error.message);
  }
}

testLogin()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
