import { jwtVerify, SignJWT } from "jose";

export type Role = "ADMIN" | "DOCTOR" | "RECEPTIONIST" | "PATIENT";

export interface SessionUser {
  userId: string;
  tenantId: string;
  tenantSlug: string;
  role: Role;
  name: string;
  email: string;
}

export const SESSION_COOKIE = "szhms_session";
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

/** Where each role lands after login and when hitting a portal they don't own. */
export const ROLE_HOME: Record<Role, string> = {
  ADMIN: "admin",
  DOCTOR: "doctor",
  RECEPTIONIST: "reception",
  PATIENT: "patient",
};

function secret(): Uint8Array {
  const raw = process.env.AUTH_SECRET;
  if (!raw || raw.length < 16) {
    throw new Error("AUTH_SECRET is missing or too short (need >= 16 chars)");
  }
  return new TextEncoder().encode(raw);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .setSubject(user.userId)
    .sign(secret());
}

/** Verifies signature + expiry. Returns null on any failure. Edge-runtime safe. */
export async function verifySessionToken(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (
      typeof payload.userId === "string" &&
      typeof payload.tenantId === "string" &&
      typeof payload.tenantSlug === "string" &&
      typeof payload.role === "string" &&
      typeof payload.name === "string" &&
      typeof payload.email === "string"
    ) {
      return {
        userId: payload.userId,
        tenantId: payload.tenantId,
        tenantSlug: payload.tenantSlug,
        role: payload.role as Role,
        name: payload.name,
        email: payload.email,
      };
    }
    return null;
  } catch {
    return null;
  }
}
