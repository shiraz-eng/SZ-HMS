import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenant";
import { requireRole } from "@/lib/auth";
import { getBookingDoctors } from "@/lib/patient";
import { BookingForm } from "@/components/patient/booking-form";

export default async function BookAppointmentPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const tenant = await getTenantBySlug(tenantId);
  if (!tenant) notFound();
  await requireRole(tenantId, "PATIENT");

  const doctors = await getBookingDoctors(tenant.id);

  return (
    <div className="py-2">
      <h1 className="text-base font-semibold">Book a visit</h1>
      <p className="mt-1 text-sm text-muted-fg">Request a slot with one of our clinicians.</p>
      <div className="mt-4 rounded-xl border border-border bg-surface p-4 shadow-card">
        <BookingForm tenantSlug={tenantId} doctors={doctors} />
      </div>
    </div>
  );
}
