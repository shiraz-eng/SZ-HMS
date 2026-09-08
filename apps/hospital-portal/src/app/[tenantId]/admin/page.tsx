import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenant";
import { getAdminOverview } from "@/lib/admin";

export default async function AdminOverviewPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const tenant = await getTenantBySlug(tenantId);
  if (!tenant) notFound();

  const o = await getAdminOverview(tenant.id);
  const maxCents = Math.max(1, ...o.revenue7d.map((d) => d.cents));

  const kpis = [
    { label: "Revenue today", value: `$${(o.revenueTodayCents / 100).toFixed(2)}` },
    { label: "Appointments today", value: `${o.completedToday}/${o.appointmentsToday}` },
    { label: "Active patients", value: String(o.activePatients) },
    { label: "Doctor utilisation", value: `${o.utilisationPct}%` },
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

      <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
        <p className="text-sm font-semibold">Revenue · last 7 days</p>
        <div className="mt-4 flex h-40 items-end gap-3">
          {o.revenue7d.map((d) => (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-primary/80"
                style={{ height: `${Math.max(2, (d.cents / maxCents) * 100)}%` }}
                title={`$${(d.cents / 100).toFixed(2)}`}
              />
              <span className="text-[10px] text-muted-fg">{d.day}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-fg">
          Chart.js / D3 widgets replace these bars in Phase 5.
        </p>
      </div>
    </div>
  );
}
