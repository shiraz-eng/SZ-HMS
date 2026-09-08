"use client";

import type { SoapNote } from "@/types/ehr";

const TEMPLATES = ["Normal exam", "URI", "HTN follow-up", "T2DM review", "Med refill"] as const;

type NoteField = "subjective" | "objective" | "assessment" | "plan";

const FIELDS: { key: NoteField; label: string; rows: number; placeholder: string }[] = [
  { key: "subjective", label: "Subjective", rows: 4, placeholder: "Chief complaint, HPI, ROS…" },
  { key: "objective", label: "Objective", rows: 4, placeholder: "Exam findings, in-clinic results…" },
  { key: "assessment", label: "Assessment", rows: 3, placeholder: "Clinical impression…" },
  { key: "plan", label: "Plan", rows: 4, placeholder: "Management, follow-up, patient education…" },
];

/** Column 2 — the working area. Structured SOAP note + ICD-10 tagging. */
export function DiagnosticNotesPanel({
  note,
  onChange,
}: {
  note: SoapNote;
  onChange: (next: SoapNote) => void;
}) {
  const set = (key: NoteField, value: string) => onChange({ ...note, [key]: value });

  const addFromTemplate = (t: string) =>
    set("subjective", note.subjective ? `${note.subjective}\n${t}` : t);

  const removeDiagnosis = (code: string) =>
    onChange({ ...note, diagnoses: note.diagnoses.filter((d) => d.code !== code) });

  const addDiagnosis = (raw: string) => {
    const code = raw.trim().toUpperCase();
    if (!code || note.diagnoses.some((d) => d.code === code)) return;
    onChange({ ...note, diagnoses: [...note.diagnoses, { code, label: "—" }] });
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap gap-1.5">
        {TEMPLATES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => addFromTemplate(t)}
            className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-muted-fg transition-colors hover:border-primary hover:text-primary"
          >
            + {t}
          </button>
        ))}
      </div>

      {FIELDS.map((f) => (
        <label key={f.key} className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-fg">
            {f.label}
          </span>
          <textarea
            rows={f.rows}
            value={note[f.key]}
            onChange={(e) => set(f.key, e.target.value)}
            placeholder={f.placeholder}
            className="w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm leading-relaxed outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
      ))}

      <div>
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-fg">
          Diagnoses (ICD-10)
        </span>
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-surface p-2">
          {note.diagnoses.map((d) => (
            <span
              key={d.code}
              className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-xs text-primary"
            >
              {d.code}
              {d.label !== "—" ? ` · ${d.label}` : ""}
              <button
                type="button"
                onClick={() => removeDiagnosis(d.code)}
                aria-label={`Remove ${d.code}`}
                className="text-primary/60 hover:text-primary"
              >
                ×
              </button>
            </span>
          ))}
          <input
            placeholder="Add code, press Enter"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addDiagnosis(e.currentTarget.value);
                e.currentTarget.value = "";
              }
            }}
            className="min-w-[140px] flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-fg"
          />
        </div>
      </div>
    </div>
  );
}
