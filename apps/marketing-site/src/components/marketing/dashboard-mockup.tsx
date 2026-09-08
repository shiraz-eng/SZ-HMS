/** Lightweight faux-dashboard used as the hero visual. Pure CSS, no images. */
export function DashboardMockup() {
  const bars = [46, 62, 38, 72, 58, 81, 69];
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-panel">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
        </div>
        <span className="text-xs text-muted-fg">mercy.szhms.com/admin</span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          ["Revenue", "$12.4k"],
          ["Occupancy", "78%"],
          ["Wait", "14m"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-border p-3">
            <p className="text-[10px] uppercase tracking-wide text-muted-fg">{label}</p>
            <p className="mt-1 text-lg font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-lg border border-border p-3">
        <p className="text-[10px] uppercase tracking-wide text-muted-fg">Admissions · 7d</p>
        <div className="mt-3 flex h-24 items-end gap-2">
          {bars.map((b, i) => (
            <div key={i} className="flex-1 rounded-t bg-primary/80" style={{ height: `${b}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
