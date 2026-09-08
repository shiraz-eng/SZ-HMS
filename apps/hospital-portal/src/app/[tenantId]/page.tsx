import { redirect } from "next/navigation";
import { ROLE_HOME } from "@szhms/auth";
import { getSessionUser } from "@/lib/auth";

/** Tenant root: route to the signed-in user's portal, or to login. */
export default async function TenantIndex({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const user = await getSessionUser();

  if (user && user.tenantSlug === tenantId) {
    redirect(`/${tenantId}/${ROLE_HOME[user.role]}`);
  }
  redirect(`/${tenantId}/login`);
}
