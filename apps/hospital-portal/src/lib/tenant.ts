import { cache } from "react";
import { prisma } from "@szhms/database";
import type { TenantTheme } from "@szhms/ui";

export interface TenantRecord {
  id: string;
  slug: string;
  name: string;
  logoText: string;
  theme: TenantTheme;
}

/**
 * Resolves a hospital by its subdomain slug. `cache()` dedupes the query across
 * the layout + page render of a single request.
 */
export const getTenantBySlug = cache(async (slug: string): Promise<TenantRecord | null> => {
  const t = await prisma.tenant.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      logoText: true,
      primaryHex: true,
      accentHex: true,
      primaryForegroundHex: true,
      radius: true,
    },
  });
  if (!t) return null;

  return {
    id: t.id,
    slug: t.slug,
    name: t.name,
    logoText: t.logoText,
    theme: {
      primaryHex: t.primaryHex,
      accentHex: t.accentHex,
      primaryForegroundHex: t.primaryForegroundHex,
      radius: t.radius,
    },
  };
});

export async function listTenants(): Promise<TenantRecord[]> {
  const rows = await prisma.tenant.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      logoText: true,
      primaryHex: true,
      accentHex: true,
      primaryForegroundHex: true,
      radius: true,
    },
  });
  return rows.map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    logoText: t.logoText,
    theme: {
      primaryHex: t.primaryHex,
      accentHex: t.accentHex,
      primaryForegroundHex: t.primaryForegroundHex,
      radius: t.radius,
    },
  }));
}
