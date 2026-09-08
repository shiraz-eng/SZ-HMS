import Link from "next/link";

export default async function PatientHome({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;

  return (
    <div className="space-y-4 py-2">
      <section className="rounded-xl border border-border bg-primary p-4 text-primary-fg">
        <p className="text-xs uppercase tracking-wide text-primary-fg/70">Next appointment</p>
        <p className="mt-1 text-lg font-semibold">Tue, 16 Sep · 10:30</p>
        <p className="text-sm text-primary-fg/80">Dr. Reyes · General Medicine</p>
        <div className="mt-3 flex gap-2">
          <button className="rounded-md bg-primary-fg/15 px-3 py-1.5 text-xs font-medium">
            Reschedule
          </button>
          <button className="rounded-md bg-primary-fg/15 px-3 py-1.5 text-xs font-medium">
            Directions
          </button>
        </div>
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
          <p className="mt-1 text-xs text-muted-fg">2 new PDFs to download</p>
        </Link>
      </div>

      <section className="rounded-xl border border-border bg-surface p-4 shadow-card">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Outstanding balance</p>
          <span className="text-lg font-semibold text-danger">$84.00</span>
        </div>
        <Link
          href={`/${tenantId}/patient/billing`}
          className="mt-3 block rounded-md bg-primary py-2 text-center text-sm font-semibold text-primary-fg"
        >
          Pay now
        </Link>
      </section>
    </div>
  );
}
