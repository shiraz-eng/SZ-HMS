import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenant";
import { getBedOccupancy } from "@/lib/admin";
import { OccupancyDonut } from "@/components/admin/charts";

export default async function OccupancyAnalyticsPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const tenant = await getTenantBySlug(tenantId);
  if (!tenant) notFound();

  const occ = await getBedOccupancy(tenant.id);
  const donut = [
    { name: "Occupied", value: occ.occupied },
    { name: "Available", value: occ.available },
    { name: "Cleaning", value: occ.cleaning },
    { name: "Out of service", value: occ.outOfService },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Bed occupancy</h1>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
          <p className="text-sm font-semibold">
            {occ.occupied}/{occ.total} beds · {occ.pct}%
          </p>
          <OccupancyDonut data={donut} />
        </div>

        <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
          <p className="text-sm font-semibold">By ward</p>
          <ul className="mt-3 space-y-3">
            {occ.byWard.map((w) => {
              const pct = w.total ? Math.round((w.occupied / w.total) * 100) : 0;
              return (
                <li key={w.ward}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium">{w.ward}</span>
                    <span className="tabular-nums text-muted-fg">
                      {w.occupied}/{w.total} · {pct}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
