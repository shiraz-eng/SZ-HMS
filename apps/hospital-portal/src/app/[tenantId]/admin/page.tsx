const KPIS = [
  { label: "Revenue today", value: "$12,480", delta: "+8.2%", up: true },
  { label: "Bed occupancy", value: "78%", delta: "+3 pts", up: true },
  { label: "Avg wait time", value: "14 min", delta: "-2 min", up: true },
  { label: "Doctor utilisation", value: "86%", delta: "-1.4%", up: false },
];

// Sparkline-ish bars — swap for Chart.js / D3 widgets in Phase 5.
const REVENUE_7D = [8, 9.5, 7, 11, 10.5, 12.5, 12.48];

export default function AdminOverview() {
  const max = Math.max(...REVENUE_7D);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Operational overview</h1>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((k) => (
          <div key={k.label} className="rounded-lg border border-border bg-surface p-4 shadow-card">
            <p className="text-xs text-muted-fg">{k.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{k.value}</p>
            <p className={`mt-1 text-xs font-medium ${k.up ? "text-success" : "text-danger"}`}>
              {k.delta}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
        <p className="text-sm font-semibold">Revenue · last 7 days ($k)</p>
        <div className="mt-4 flex h-40 items-end gap-3">
          {REVENUE_7D.map((v, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-primary/80"
                style={{ height: `${(v / max) * 100}%` }}
              />
              <span className="text-[10px] text-muted-fg">D{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
