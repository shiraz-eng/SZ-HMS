import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ROLE_HOME,
  SESSION_COOKIE,
  verifySessionToken,
  type Role,
  type SessionUser,
} from "@szhms/auth";

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

/** Use in a portal layout: guarantees a session for `tenantSlug`, else -> login. */
export async function requireUser(tenantSlug: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user || user.tenantSlug !== tenantSlug) {
    redirect(`/${tenantSlug}/login`);
  }
  return user;
}

/** Guarantees the session belongs to `role`; wrong role -> that user's own home. */
export async function requireRole(tenantSlug: string, role: Role): Promise<SessionUser> {
  const user = await requireUser(tenantSlug);
  if (user.role !== role) {
    redirect(`/${tenantSlug}/${ROLE_HOME[user.role]}`);
  }
  return user;
}
