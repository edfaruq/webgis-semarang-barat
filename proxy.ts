/**
 * Proxy (dulu: middleware) untuk proteksi route /internal/* (admin).
 * Next.js 16 mengganti konvensi middleware.ts → proxy.ts; logika sama.
 */
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "admin_session";
const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "webgis-semarang-barat-session-secret-change-in-production"
);

type SessionPayload = { userId: number; email: string; role: string };

async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Hanya proteksi route /internal/* (admin)
  if (!pathname.startsWith("/internal")) {
    return NextResponse.next();
  }

  const signInPath = "/internal/auth/sign-in";
  const isSignIn = pathname === signInPath;

  const session = await getSessionFromRequest(req);

  // Halaman sign-in: jika sudah login admin, redirect ke console
  if (isSignIn) {
    if (session?.role === "admin") {
      return NextResponse.redirect(new URL("/internal/console", req.url));
    }
    return NextResponse.next();
  }

  // Semua route /internal/* lain: wajib login admin
  if (!session) {
    return NextResponse.redirect(new URL(signInPath, req.url));
  }
  if (session.role !== "admin") {
    return NextResponse.redirect(new URL("/403", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/internal/:path*"],
};
