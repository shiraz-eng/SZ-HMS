import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenant";
import { getRevenueSeries } from "@/lib/admin";
import { RevenueBarChart } from "@/components/admin/charts";

export default async function RevenueAnalyticsPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const tenant = await getTenantBySlug(tenantId);
  if (!tenant) notFound();

  const { series, totalCents } = await getRevenueSeries(tenant.id, 30);
  const best = series.reduce((m, p) => (p.cents > m.cents ? p : m), { day: "—", cents: 0 });
  const avg = series.length ? totalCents / series.length : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Revenue · last 30 days</h1>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Collected", `$${(totalCents / 100).toFixed(2)}`],
          ["Daily average", `$${(avg / 100).toFixed(2)}`],
          ["Best day", `${best.day} · $${(best.cents / 100).toFixed(2)}`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-border bg-surface p-4 shadow-card">
            <p className="text-xs text-muted-fg">{label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
        <RevenueBarChart data={series} />
      </div>
    </div>
  );
}
