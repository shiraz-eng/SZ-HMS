import type { ReactNode } from "react";
import { PortalTopbar } from "@/components/shell/portal-topbar";

export default async function ReceptionLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  return (
    <div className="flex h-dvh flex-col bg-canvas">
      <PortalTopbar
        tenantId={tenantId}
        portal="Reception"
        right={
          <button className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-fg">
            + Register patient
          </button>
        }
      />
      <main className="min-h-0 flex-1 overflow-auto p-4">{children}</main>
    </div>
  );
}
