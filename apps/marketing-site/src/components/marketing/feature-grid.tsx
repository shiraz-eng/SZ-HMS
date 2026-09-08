const FEATURES = [
  {
    title: "Electronic Health Records",
    body: "A fast 3-column clinical workspace — vitals & history, notes, and order entry side by side.",
  },
  {
    title: "Smart Scheduling",
    body: "Drag-and-drop master calendar, colour-coded waiting room, and automated patient reminders.",
  },
  {
    title: "Billing & Payments",
    body: "Point-of-sale invoicing, insurance-ready statements, and global card payments via Stripe.",
  },
  {
    title: "Inventory",
    body: "Track pharmacy and consumables with par levels, expiry alerts, and per-department usage.",
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-2xl font-semibold">Everything the front desk to the ward needs</h2>
      <p className="mt-2 max-w-2xl text-muted-fg">
        One platform, four role-based portals, fully white-labeled to your hospital&rsquo;s brand.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-xl border border-border bg-surface p-5 shadow-card">
            <div className="h-9 w-9 rounded-lg bg-primary/10" />
            <h3 className="mt-4 text-sm font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-fg">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
