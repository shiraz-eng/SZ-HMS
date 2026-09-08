import type { ReactNode } from "react";
import { cn } from "@szhms/ui";
import type { Encounter, Medication, Problem, VitalReading } from "@/types/ehr";

const trendGlyph: Record<NonNullable<VitalReading["trend"]>, string> = {
  up: "▲",
  down: "▼",
  flat: "—",
};

const statusRing: Record<NonNullable<VitalReading["status"]>, string> = {
  normal: "border-border",
  watch: "border-warning/50",
  critical: "border-danger/60",
};

const problemBadge: Record<Problem["status"], string> = {
  active: "bg-danger/10 text-danger",
  chronic: "bg-warning/10 text-warning",
  resolved: "bg-muted text-muted-fg",
};

/** Column 1 — read-only clinical context: vitals, problems, meds, history. */
export function VitalsHistoryPanel({
  vitals,
  problems,
  medications,
  encounters,
}: {
  vitals: VitalReading[];
  problems: Problem[];
  medications: Medication[];
  encounters: Encounter[];
}) {
  return (
    <div className="space-y-5 p-4">
      <Section title="Vitals" hint={vitals[0] ? `Captured ${vitals[0].capturedAt}` : undefined}>
        <div className="grid grid-cols-2 gap-2">
          {vitals.map((v) => (
            <div
              key={v.key}
              className={cn("rounded-lg border bg-surface p-2.5", statusRing[v.status ?? "normal"])}
            >
              <div className="text-[11px] uppercase tracking-wide text-muted-fg">{v.label}</div>
              <div className="mt-0.5 flex items-baseline gap-1">
                <span className="text-lg font-semibold tabular-nums">{v.value}</span>
                <span className="text-xs text-muted-fg">{v.unit}</span>
                {v.trend && (
                  <span className="ml-auto text-[10px] text-muted-fg" aria-hidden>
                    {trendGlyph[v.trend]}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Problem list">
        <ul className="space-y-1.5">
          {problems.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5"
            >
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                  problemBadge[p.status],
                )}
              >
                {p.status}
              </span>
              <span className="truncate text-sm">{p.label}</span>
              <span className="ml-auto text-xs tabular-nums text-muted-fg">{p.code}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Current medications">
        <ul className="divide-y divide-border overflow-hidden rounded-md border border-border bg-surface">
          {medications.map((m) => (
            <li key={m.id} className="px-2.5 py-1.5">
              <div className="text-sm font-medium">{m.name}</div>
              <div className="text-xs text-muted-fg">{m.sig}</div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Past encounters">
        <ol className="space-y-3 border-l border-border pl-4">
          {encounters.map((e) => (
            <li key={e.id} className="relative">
              <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-canvas bg-primary" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{e.type}</span>
                <span className="text-xs tabular-nums text-muted-fg">{e.date}</span>
              </div>
              <p className="text-xs text-muted-fg">{e.summary}</p>
              <p className="text-[11px] text-muted-fg">{e.provider}</p>
            </li>
          ))}
        </ol>
      </Section>
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-fg">{title}</h3>
        {hint && <span className="text-[11px] text-muted-fg">{hint}</span>}
      </div>
      {children}
    </section>
  );
}
