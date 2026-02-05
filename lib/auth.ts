import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "admin_session";
const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "webgis-semarang-barat-session-secret-change-in-production"
);

export type SessionPayload = {
  userId: number;
  email: string;
  role: string;
  exp: number;
};

export async function createSession(payload: Omit<SessionPayload, "exp">): Promise<string> {
  const token = await new SignJWT({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
  return token;
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  try {
    const cookieStore = await cookies();
    // Railway menggunakan HTTPS, jadi selalu set secure: true di production
    const isProduction = process.env.NODE_ENV === "production" || process.env.RAILWAY_ENVIRONMENT === "production";
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProduction, // Railway selalu HTTPS
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
  } catch (error: any) {
    console.error("Error setting session cookie:", error);
    console.error("Cookie error details:", {
      message: error.message,
      stack: error.stack,
      NODE_ENV: process.env.NODE_ENV,
      RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
    });
    // Re-throw to be caught by caller
    throw error;
  }
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function requireAdmin(): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session || session.role !== "admin") return null;
  return session;
}
