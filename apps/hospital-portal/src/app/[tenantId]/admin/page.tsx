import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenant";
import { getAdminOverview, getDoctorUtilisation } from "@/lib/admin";
import { OccupancyDonut, RevenueBarChart, UtilisationBarChart } from "@/components/admin/charts";

export default async function AdminOverviewPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const tenant = await getTenantBySlug(tenantId);
  if (!tenant) notFound();

  const [o, utilisation] = await Promise.all([
    getAdminOverview(tenant.id),
    getDoctorUtilisation(tenant.id),
  ]);

  const kpis = [
    { label: "Revenue today", value: `$${(o.revenueTodayCents / 100).toFixed(2)}` },
    { label: "Appointments today", value: `${o.completedToday}/${o.appointmentsToday}` },
    { label: "Bed occupancy", value: `${o.occupancy.pct}%` },
    { label: "Doctor utilisation", value: `${o.utilisationPct}%` },
  ];

  const occ = o.occupancy;
  const donut = [
    { name: "Occupied", value: occ.occupied },
    { name: "Available", value: occ.available },
    { name: "Cleaning", value: occ.cleaning },
    { name: "Out of service", value: occ.outOfService },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Operational overview</h1>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-lg border border-border bg-surface p-4 shadow-card">
            <p className="text-xs text-muted-fg">{k.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
          <p className="text-sm font-semibold">Revenue · last 7 days</p>
          <div className="mt-3">
            <RevenueBarChart data={o.revenue7d} />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
          <p className="text-sm font-semibold">Bed occupancy</p>
          <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-4">
            <OccupancyDonut data={donut} />
            <ul className="space-y-1 text-xs">
              <li>
                <span className="font-semibold tabular-nums">{occ.occupied}</span> occupied
              </li>
              <li>
                <span className="font-semibold tabular-nums">{occ.available}</span> available
              </li>
              <li>
                <span className="font-semibold tabular-nums">{occ.cleaning}</span> cleaning
              </li>
              <li>
                <span className="font-semibold tabular-nums">{occ.outOfService}</span> out of service
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
        <p className="text-sm font-semibold">Doctor utilisation · today</p>
        <div className="mt-3">
          <UtilisationBarChart data={utilisation} />
        </div>
      </div>
    </div>
  );
}
