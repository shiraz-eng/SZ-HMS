import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { TenantThemeProvider } from "@szhms/ui";
import { getTenantBySlug } from "@/lib/tenant";

export async function generateMetadata({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const tenant = await getTenantBySlug(tenantId);
  return { title: { default: tenant?.name ?? "SZ HMS", template: `%s · ${tenant?.name ?? "SZ HMS"}` } };
}

/**
 * Tenant boundary: resolves the hospital from the URL segment and injects its
 * theme tokens. Everything below here is white-labeled.
 */
export default async function TenantLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const tenant = await getTenantBySlug(tenantId);
  if (!tenant) notFound();

  return (
    <TenantThemeProvider theme={tenant.theme}>
      <div className="min-h-dvh bg-canvas text-[rgb(var(--color-fg))]">{children}</div>
    </TenantThemeProvider>
  );
}
