import type { TenantTheme } from "@szhms/ui";

export interface TenantRecord {
  slug: string;
  name: string;
  logoText: string;
  theme: TenantTheme;
}

/**
 * Stand-in for `packages/database`. Replace with a tenant-scoped Prisma query
 * (cached per request) in Phase 2. Every value here is what the Hospital Admin
 * "theme customizer" would write.
 */
const TENANTS: Record<string, TenantRecord> = {
  demo: {
    slug: "demo",
    name: "SZ HMS Demo Hospital",
    logoText: "SZ",
    theme: { primaryHex: "#2563EB", accentHex: "#0D9488" },
  },
  mercy: {
    slug: "mercy",
    name: "Mercy Clinic",
    logoText: "MC",
    theme: { primaryHex: "#1D4ED8", accentHex: "#0EA5E9" },
  },
  "st-lukes": {
    slug: "st-lukes",
    name: "St. Luke's Hospital",
    logoText: "SL",
    theme: { primaryHex: "#7C3AED", accentHex: "#DB2777", radius: "0.375rem" },
  },
};

export async function getTenantBySlug(slug: string): Promise<TenantRecord | null> {
  return TENANTS[slug] ?? null;
}

export function listTenants(): TenantRecord[] {
  return Object.values(TENANTS);
}
