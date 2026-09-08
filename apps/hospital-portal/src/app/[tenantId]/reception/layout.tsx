import type { ReactNode } from "react";
import Link from "next/link";
import { PortalTopbar } from "@/components/shell/portal-topbar";
import { SignOutButton } from "@/components/shell/sign-out-button";
import { requireRole } from "@/lib/auth";

export default async function ReceptionLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  await requireRole(tenantId, "RECEPTIONIST");

  return (
    <div className="flex h-dvh flex-col bg-canvas">
      <PortalTopbar
        tenantId={tenantId}
        portal="Reception"
        right={
          <>
            <Link
              href={`/${tenantId}/reception/register`}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-fg"
            >
              + Register patient
            </Link>
            <SignOutButton tenantId={tenantId} />
          </>
        }
      />
      <main className="min-h-0 flex-1 overflow-auto p-4">{children}</main>
    </div>
  );
}
