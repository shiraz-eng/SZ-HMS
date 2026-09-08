import type { ReactNode } from "react";
import { getTodaysQueue } from "@/lib/queue";
import { PatientQueueSidebar } from "@/components/doctor/patient-queue-sidebar";

/**
 * Doctor Portal shell: opts into the low-eye-strain token variant and pins the
 * live patient queue to the left. The queue is a Server Component fetch passed
 * to a Client child so filtering/active-state stay on the client.
 */
export default async function DoctorLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const queue = await getTodaysQueue(tenantId);

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
