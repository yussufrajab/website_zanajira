// Self-contained admin auth: argon2-hashed credentials in `admin_users`,
// JWT session in an http-only cookie signed with AUTH_SECRET (jose).
//
// Why hand-rolled: next-auth v5 (the only Auth.js version) peer-requires
// Next 14/15 and does not support Next 16, the version this app runs. See
// docs/DIRECTUS_TO_NEXTJS_API_MIGRATION_PLAN.md §11.4.
//
// Cookies:
//   tume_admin_session  — signed JWT, http-only, Secure in prod, SameSite=Lax

import { SignJWT, jwtVerify } from "jose";
import argon2 from "argon2";
import { cookies } from "next/headers";
import { prisma } from "./db";

export const SESSION_COOKIE = "tume_admin_session";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-change-me"
);
const MAX_AGE = Number(process.env.AUTH_MAX_AGE_SECONDS || "43200"); // 12h

export interface SessionPayload {
  sub: number; // admin user id
  email: string;
  name: string;
}

/** Hash a plaintext password for storage. */
export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, { type: argon2.argon2id });
}

/** Verify a plaintext password against a stored argon2 hash. */
export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}

/** Create a signed session JWT and set the http-only cookie. */
export async function createSession(user: {
  id: number;
  email: string;
  name: string;
}): Promise<void> {
  const token = await new SignJWT({ email: user.email, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(SECRET);

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

/** Clear the session cookie (sign out). */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
}

/** Verify the current request's session. Returns the payload or null. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const sub = Number(payload.sub);
    if (!Number.isFinite(sub)) return null;
    return {
      sub,
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
    };
  } catch {
    return null;
  }
}

/** Require an admin session; throws a redirect-target marker via the
 * returned sentinel. Route handlers call `requireSession()` and respond 401
 * on null; server components redirect to /admin/login. */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

/** Authenticate an admin by email + password. Returns the user or null. */
export async function authenticateAdmin(
  email: string,
  password: string
): Promise<{ id: number; email: string; name: string } | null> {
  const user = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  return { id: user.id, email: user.email, name: user.name };
}