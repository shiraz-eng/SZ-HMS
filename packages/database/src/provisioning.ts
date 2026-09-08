import { hashPassword } from "@szhms/auth";
import { prisma } from "./client";
import type { PlanTier } from "@prisma/client";

export interface ProvisionTenantInput {
  slug: string;
  hospitalName: string;
  tier: PlanTier;
  admin: { name: string; email: string; password: string };
  provider?: "stripe" | "paypal";
  externalCustomerId?: string;
  externalSubscriptionId?: string;
  seats?: number;
  /** false => subscription starts INCOMPLETE, awaiting a payment webhook. */
  activate?: boolean;
}

export interface ProvisionResult {
  tenantId: string;
  slug: string;
  created: boolean;
}

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])?$/;
const RESERVED = new Set(["www", "app", "api", "admin", "static", "assets", "cdn", "mail"]);

export function normalizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

export async function isSlugAvailable(slug: string): Promise<boolean> {
  if (!SLUG_RE.test(slug) || RESERVED.has(slug)) return false;
  const existing = await prisma.tenant.findUnique({ where: { slug }, select: { id: true } });
  return !existing;
}

/**
 * Creates a Tenant + its first ADMIN user + a Subscription row, atomically and
 * idempotently. Safe to call repeatedly from a webhook: if the tenant slug (or
 * externalSubscriptionId) already exists, it updates the subscription instead.
 */
export async function provisionTenant(input: ProvisionTenantInput): Promise<ProvisionResult> {
  const slug = normalizeSlug(input.slug);
  if (!SLUG_RE.test(slug) || RESERVED.has(slug)) {
    throw new Error(`Invalid tenant slug: "${input.slug}"`);
  }

  const existing = await prisma.tenant.findFirst({
    where: {
      OR: [
        { slug },
        input.externalSubscriptionId
          ? { subscription: { externalSubscriptionId: input.externalSubscriptionId } }
          : { id: "__never__" },
      ],
    },
    select: { id: true, slug: true },
  });

  const status = input.activate === false ? "INCOMPLETE" : "ACTIVE";

  if (existing) {
    await prisma.subscription.update({
      where: { tenantId: existing.id },
      data: {
        tier: input.tier,
        status,
        provider: input.provider ?? "stripe",
        externalCustomerId: input.externalCustomerId,
        externalSubscriptionId: input.externalSubscriptionId,
        seats: input.seats ?? undefined,
      },
    });
    return { tenantId: existing.id, slug: existing.slug, created: false };
  }

  const passwordHash = await hashPassword(input.admin.password);

  const tenant = await prisma.$transaction(async (tx) => {
    const t = await tx.tenant.create({
      data: {
        slug,
        name: input.hospitalName,
        logoText: input.hospitalName.slice(0, 2).toUpperCase(),
        subscription: {
          create: {
            tier: input.tier,
            status,
            provider: input.provider ?? "stripe",
            externalCustomerId: input.externalCustomerId,
            externalSubscriptionId: input.externalSubscriptionId,
            seats: input.seats ?? 10,
          },
        },
        users: {
          create: {
            name: input.admin.name,
            email: input.admin.email.toLowerCase(),
            passwordHash,
            role: "ADMIN",
          },
        },
      },
      select: { id: true, slug: true },
    });
    return t;
  });

  return { tenantId: tenant.id, slug: tenant.slug, created: true };
}

export interface ActivateInput {
  tenantId: string;
  externalCustomerId?: string;
  externalSubscriptionId?: string;
  currentPeriodEnd?: Date;
}

/** Called from a payment webhook once funds are confirmed. Idempotent. */
export async function activateSubscription(input: ActivateInput): Promise<void> {
  await prisma.subscription.update({
    where: { tenantId: input.tenantId },
    data: {
      status: "ACTIVE",
      externalCustomerId: input.externalCustomerId,
      externalSubscriptionId: input.externalSubscriptionId,
      currentPeriodEnd: input.currentPeriodEnd,
    },
  });
}
