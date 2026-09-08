"use client";

import { useState } from "react";
import { cn } from "@szhms/ui";
import type { LabOrderItem, PrescriptionItem } from "@/types/ehr";

const LAB_CATALOG: { code: string; name: string }[] = [
  { code: "CBC", name: "Complete Blood Count" },
  { code: "BMP", name: "Basic Metabolic Panel" },
  { code: "LIPID", name: "Lipid Panel" },
  { code: "HBA1C", name: "Hemoglobin A1c" },
  { code: "TSH", name: "Thyroid Stimulating Hormone" },
  { code: "UA", name: "Urinalysis" },
];

const ROUTES = ["PO", "IV", "IM", "SC", "Topical", "PR", "Inhaled"];
const FREQUENCIES = ["OD", "BID", "TID", "QID", "QHS", "PRN"];

const uid = () => Math.random().toString(36).slice(2, 9);

type Tab = "rx" | "labs";

/** Column 3 — order entry: digital prescriptions + lab orders. */
export function PrescriptionOrderPanel({
  prescriptions,
  labs,
  onPrescriptionsChange,
  onLabsChange,
}: {
  prescriptions: PrescriptionItem[];
  labs: LabOrderItem[];
  onPrescriptionsChange: (next: PrescriptionItem[]) => void;
  onLabsChange: (next: LabOrderItem[]) => void;
}) {
  const [tab, setTab] = useState<Tab>("rx");
  const [draft, setDraft] = useState<Omit<PrescriptionItem, "id">>({
    drug: "",
    strength: "",
    route: "PO",
    frequency: "BID",
    durationDays: 7,
    quantity: 14,
  });

  const addRx = () => {
    if (!draft.drug.trim()) return;
    onPrescriptionsChange([...prescriptions, { ...draft, id: uid() }]);
    setDraft({ ...draft, drug: "", strength: "" });
  };

  const toggleLab = (code: string, name: string) => {
    const existing = labs.find((l) => l.code === code);
    if (existing) {
      onLabsChange(labs.filter((l) => l.code !== code));
    } else {
      onLabsChange([...labs, { id: uid(), code, name, priority: "routine" }]);
    }
  };

  const cyclePriority = (id: string) =>
    onLabsChange(
      labs.map((l) =>
        l.id === id ? { ...l, priority: l.priority === "stat" ? "routine" : "stat" } : l,
      ),
    );

  return (
    <div className="flex h-full flex-col">
      <div className="flex gap-1 border-b border-border bg-surface p-1">
        {(
          [
            ["rx", `Prescriptions (${prescriptions.length})`],
            ["labs", `Lab orders (${labs.length})`],
          ] as [Tab, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              tab === value ? "bg-primary text-primary-fg" : "text-muted-fg hover:bg-muted",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {tab === "rx" ? (
          <>
            <div className="space-y-2 rounded-lg border border-border bg-surface p-3">
              <input
                value={draft.drug}
                onChange={(e) => setDraft({ ...draft, drug: e.target.value })}
                placeholder="Drug name"
                className="w-full rounded-md border border-border px-2.5 py-1.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={draft.strength}
                  onChange={(e) => setDraft({ ...draft, strength: e.target.value })}
                  placeholder="Strength e.g. 500 mg"
                  className="rounded-md border border-border px-2.5 py-1.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <select
                  value={draft.route}
                  onChange={(e) => setDraft({ ...draft, route: e.target.value })}
                  className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {ROUTES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                <select
                  value={draft.frequency}
                  onChange={(e) => setDraft({ ...draft, frequency: e.target.value })}
                  className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
                <label className="flex items-center gap-1.5 text-xs text-muted-fg">
                  Days
                  <input
                    type="number"
                    min={1}
                    value={draft.durationDays}
                    onChange={(e) =>
                      setDraft({ ...draft, durationDays: Math.max(1, Number(e.target.value)) })
                    }
                    className="w-full rounded-md border border-border px-2 py-1.5 text-sm text-[rgb(var(--color-fg))] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={addRx}
                className="w-full rounded-md bg-primary py-1.5 text-sm font-semibold text-primary-fg transition-opacity hover:opacity-95"
              >
                Add medication
              </button>
            </div>

            <ul className="space-y-1.5">
              {prescriptions.map((p) => (
                <li
                  key={p.id}
                  className="rounded-md border border-border bg-surface px-2.5 py-2 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium">
                      {p.drug} {p.strength}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onPrescriptionsChange(prescriptions.filter((x) => x.id !== p.id))
                      }
                      className="shrink-0 text-xs text-danger hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="text-xs text-muted-fg">
                    {p.route} · {p.frequency} · {p.durationDays} days
                  </div>
                </li>
              ))}
              {prescriptions.length === 0 && <EmptyRow text="No medications added" />}
            </ul>
          </>
        ) : (
          <>
            <div className="flex flex-wrap gap-1.5">
              {LAB_CATALOG.map((l) => {
                const active = labs.some((x) => x.code === l.code);
                return (
                  <button
                    key={l.code}
                    type="button"
                    title={l.name}
                    onClick={() => toggleLab(l.code, l.name)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-fg hover:border-primary",
                    )}
                  >
                    {active ? "✓ " : "+ "}
                    {l.code}
                  </button>
                );
              })}
            </div>

            <ul className="space-y-1.5">
              {labs.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-2 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{l.name}</div>
                    <div className="text-xs text-muted-fg">{l.code}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => cyclePriority(l.id)}
                    className={cn(
                      "rounded px-2 py-0.5 text-[11px] font-semibold uppercase",
                      l.priority === "stat"
                        ? "bg-danger/10 text-danger"
                        : "bg-muted text-muted-fg",
                    )}
                  >
                    {l.priority}
                  </button>
                  <button
                    type="button"
                    onClick={() => onLabsChange(labs.filter((x) => x.id !== l.id))}
                    className="text-xs text-danger hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
              {labs.length === 0 && <EmptyRow text="No lab orders selected" />}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <li className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-muted-fg">
      {text}
    </li>
  );
}
