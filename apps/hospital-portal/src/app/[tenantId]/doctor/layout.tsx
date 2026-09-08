import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenant";
import { requireRole } from "@/lib/auth";
import { getTodaysQueue } from "@/lib/queue";
import { PatientQueueSidebar } from "@/components/doctor/patient-queue-sidebar";

/**
 * Doctor Portal shell: role-guarded, opts into the low-eye-strain token
 * variant, and pins the live patient queue to the left.
 */
export default async function DoctorLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const tenant = await getTenantBySlug(tenantId);
  if (!tenant) notFound();

  const user = await requireRole(tenantId, "DOCTOR");
  const queue = await getTodaysQueue(tenant.id, user.userId);

  return (
    <div
      data-portal="doctor"
      className="grid h-dvh grid-cols-1 bg-canvas lg:grid-cols-[288px_minmax(0,1fr)]"
    >
      <PatientQueueSidebar queue={queue} />
      <main className="min-h-0 min-w-0">{children}</main>
    </div>
  );
}
