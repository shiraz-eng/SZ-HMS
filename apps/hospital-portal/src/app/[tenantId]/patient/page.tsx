import Link from "next/link";
import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenant";
import { requireRole } from "@/lib/auth";
import { getPatientHome } from "@/lib/patient";

export default async function PatientHome({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const tenant = await getTenantBySlug(tenantId);
  if (!tenant) notFound();

  const user = await requireRole(tenantId, "PATIENT");
  const home = await getPatientHome(tenant.id, user.userId);

  const balance = home ? (home.balanceDueCents / 100).toFixed(2) : "0.00";

  return (
    <div className="space-y-4 py-2">
      <section className="rounded-xl border border-border bg-primary p-4 text-primary-fg">
        <p className="text-xs uppercase tracking-wide text-primary-fg/70">Next appointment</p>
        {home?.nextAppointment ? (
          <>
            <p className="mt-1 text-lg font-semibold">{home.nextAppointment.when}</p>
            <p className="text-sm text-primary-fg/80">
              {home.nextAppointment.doctor} · {home.nextAppointment.specialty}
            </p>
          </>
        ) : (
          <p className="mt-1 text-sm text-primary-fg/80">Nothing scheduled.</p>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href={`/${tenantId}/patient/appointments/book`}
          className="rounded-xl border border-border bg-surface p-4 shadow-card"
        >
          <p className="text-sm font-semibold">Book a visit</p>
          <p className="mt-1 text-xs text-muted-fg">Choose a doctor and time</p>
        </Link>
        <Link
          href={`/${tenantId}/patient/reports`}
          className="rounded-xl border border-border bg-surface p-4 shadow-card"
        >
          <p className="text-sm font-semibold">Lab reports</p>
          <p className="mt-1 text-xs text-muted-fg">
            {home?.reportCount ?? 0} available
          </p>
        </Link>
      </div>

      <section className="rounded-xl border border-border bg-surface p-4 shadow-card">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Outstanding balance</p>
          <span className={home && home.balanceDueCents > 0 ? "text-lg font-semibold text-danger" : "text-lg font-semibold text-success"}>
            ${balance}
          </span>
        </div>
        <Link
          href={`/${tenantId}/patient/billing`}
          className="mt-3 block rounded-md bg-primary py-2 text-center text-sm font-semibold text-primary-fg"
        >
          {home && home.balanceDueCents > 0 ? "Pay now" : "View invoices"}
        </Link>
      </section>
    </div>
  );
}
