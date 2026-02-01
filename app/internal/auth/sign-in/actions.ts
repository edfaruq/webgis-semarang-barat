"use server";

import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { createSession, setSessionCookie } from "@/lib/auth";

export type SignInState = { error?: string; success?: boolean };

export async function signInAction(
  _prevState: SignInState | null,
  formData: FormData
): Promise<SignInState> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Email atau password salah." };
  }

  if (user.role !== "admin") {
    return { error: "Akses ditolak. Hanya admin yang dapat masuk." };
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return { error: "Email atau password salah." };
  }

  const token = await createSession({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
  await setSessionCookie(token);
  return { success: true };
}
