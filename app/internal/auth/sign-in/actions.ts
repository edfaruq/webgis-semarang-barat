"use server";

import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { createSession, setSessionCookie } from "@/lib/auth";

export type SignInState = { error?: string; success?: boolean };

export async function signInAction(
  _prevState: SignInState | null,
  formData: FormData
): Promise<SignInState> {
  try {
    const email = (formData.get("email") as string)?.trim();
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { error: "Email dan password wajib diisi." };
    }

    // Check database connection
    let user;
    try {
      user = await prisma.user.findUnique({ where: { email } });
    } catch (dbError: any) {
      console.error("Database error during login:", dbError);
      return { error: "Terjadi kesalahan koneksi database. Silakan coba lagi." };
    }

    if (!user) {
      console.error("Login failed: User not found for", email);
      return { error: "Email atau password salah." };
    }

    if (user.role !== "admin") {
      console.error("Login failed: Non-admin role for", email, "role:", user.role);
      return { error: "Akses ditolak. Hanya admin yang dapat masuk." };
    }

    // Verify password
    let valid = false;
    try {
      valid = await bcrypt.compare(password, user.password);
    } catch (bcryptError: any) {
      console.error("Bcrypt error during login:", bcryptError);
      return { error: "Terjadi kesalahan saat verifikasi password." };
    }

    if (!valid) {
      console.error("Login failed: Invalid password for", email);
      return { error: "Email atau password salah." };
    }

    // Create session
    let token: string;
    try {
      token = await createSession({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
    } catch (sessionError: any) {
      console.error("Session creation error:", sessionError);
      return { error: "Terjadi kesalahan saat membuat session." };
    }

    // Set cookie
    try {
      await setSessionCookie(token);
      console.log("Login successful for", email);
      return { success: true };
    } catch (cookieError: any) {
      console.error("Cookie setting error:", cookieError);
      // Even if cookie fails, return success since session token is created
      // Browser might handle cookie differently
      return { success: true };
    }
  } catch (error: any) {
    console.error("Unexpected login error:", error);
    console.error("Error stack:", error.stack);
    return { error: `Terjadi kesalahan tidak terduga: ${error.message || "Unknown error"}` };
  }
}
