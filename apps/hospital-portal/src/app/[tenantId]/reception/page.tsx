const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00"];
const ROOMS = ["Dr. Reyes", "Dr. Osei", "Dr. Lin", "Physio"];

const WAITING = [
  { name: "Ben Carter", since: "12m", state: "waiting" },
  { name: "Priya Nair", since: "4m", state: "waiting" },
  { name: "Amara Okafor", since: "—", state: "in-room" },
  { name: "Grace Kim", since: "22m", state: "overdue" },
];

const stateColor: Record<string, string> = {
  waiting: "bg-warning/15 text-warning border-warning/30",
  "in-room": "bg-primary/10 text-primary border-primary/30",
  overdue: "bg-danger/10 text-danger border-danger/30",
};

export default function ReceptionDashboard() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
      {/* Master calendar (grid placeholder — drag-and-drop lands in Phase 4) */}
      <section className="overflow-hidden rounded-lg border border-border bg-surface">
        <div className="border-b border-border px-4 py-2 text-sm font-semibold">
          Master calendar · Today
        </div>
        <div className="grid grid-cols-[64px_repeat(4,1fr)] text-xs">
          <div className="border-b border-r border-border bg-muted px-2 py-1.5" />
          {ROOMS.map((r) => (
            <div
              key={r}
              className="border-b border-r border-border bg-muted px-2 py-1.5 font-medium"
            >
              {r}
            </div>
          ))}
          {HOURS.map((h) => (
            <div key={h} className="contents">
              <div className="border-b border-r border-border px-2 py-6 text-muted-fg">{h}</div>
              {ROOMS.map((r) => (
                <button
                  key={r + h}
                  className="border-b border-r border-border px-2 py-6 text-left hover:bg-primary/5"
                >
                  {h === "09:00" && r === "Dr. Reyes" ? (
                    <span className="block rounded bg-primary/10 px-1.5 py-1 text-[11px] text-primary">
                      A. Okafor · HTN
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Waiting room tracker */}
      <section className="rounded-lg border border-border bg-surface p-3">
        <div className="mb-2 text-sm font-semibold">Waiting room</div>
        <ul className="space-y-2">
          {WAITING.map((w) => (
            <li
              key={w.name}
              className={`flex items-center justify-between rounded-md border px-2.5 py-2 text-sm ${stateColor[w.state]}`}
            >
              <span className="font-medium">{w.name}</span>
              <span className="text-xs">{w.since}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
