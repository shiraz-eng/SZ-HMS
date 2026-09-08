"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@szhms/database";
import {
  createSessionToken,
  ROLE_HOME,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  verifyPassword,
} from "@szhms/auth";
import { getTenantBySlug } from "@/lib/tenant";

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

  redirect(`/${tenant.slug}/${ROLE_HOME[user.role]}`);
}
