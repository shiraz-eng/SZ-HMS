"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma, recordAudit } from "@szhms/database";
import {
  createSessionToken,
  ROLE_HOME,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  verifyPassword,
} from "@szhms/auth";
import { getTenantBySlug } from "@/lib/tenant";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  tenantSlug: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
});

export interface LoginState {
  error?: string;
}

/** Server action wired to the login form via `useActionState`. */
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({
    tenantSlug: formData.get("tenantSlug"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Enter a valid email and password." };

  const { tenantSlug, email, password } = parsed.data;

  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limited = rateLimit(`login:${tenantSlug}:${email.toLowerCase()}:${ip}`, 5, 60_000);
  if (!limited.ok) {
    return { error: `Too many attempts. Try again in ${limited.retryAfterSec}s.` };
  }

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return { error: "Unknown hospital." };

  const user = await prisma.user.findUnique({
    where: { tenantId_email: { tenantId: tenant.id, email: email.toLowerCase() } },
    select: { id: true, name: true, email: true, role: true, passwordHash: true, isActive: true },
  });

  // Constant-ish work whether or not the user exists.
  const ok =
    !!user && user.isActive && (await verifyPassword(password, user.passwordHash));
  if (!ok || !user) return { error: "Invalid credentials." };

  const token = await createSessionToken({
    userId: user.id,
    tenantId: tenant.id,
    tenantSlug: tenant.slug,
    role: user.role,
    name: user.name,
    email: user.email,
  });

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  await recordAudit({
    tenantId: tenant.id,
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
    action: "auth.login",
  });

  redirect(`/${tenant.slug}/${ROLE_HOME[user.role]}`);
}
