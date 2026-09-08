import { redirect } from "next/navigation";

/**
 * Tenant root. Auth wiring (Phase 2) will read the session and redirect to the
 * role home; until then, send everyone to the login screen.
 */
export default async function TenantIndex({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  redirect(`/${tenantId}/login`);
}
