"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@szhms/ui";
import type {
  Encounter,
  LabOrderItem,
  Medication,
  PatientSummary,
  PrescriptionItem,
  Problem,
  SoapNote,
  VitalReading,
} from "@/types/ehr";
import { VitalsHistoryPanel } from "./vitals-history-panel";
import { DiagnosticNotesPanel } from "./diagnostic-notes-panel";
import { PrescriptionOrderPanel } from "./prescription-order-panel";

type Column = "history" | "notes" | "orders";
type SaveState = "idle" | "saving" | "saved";

interface Props {
  patient: PatientSummary;
  vitals: VitalReading[];
  problems: Problem[];
  medications: Medication[];
  encounters: Encounter[];
  initialNote: SoapNote;
}

/**
 * Doctor Portal — 3-column EHR. Sets the design standard for the product:
 *  - all colour via CSS-variable Tailwind tokens (works white-labeled)
 *  - a persistent patient-context header
 *  - three independently scrolling columns on xl+, a segmented switch below that
 *  - debounced autosave indicator (wire to a server action in Phase 4)
 */
export function EhrWorkspace({
  patient,
  vitals,
  problems,
  medications,
  encounters,
  initialNote,
}: Props) {
  const [note, setNote] = useState<SoapNote>(initialNote);
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [labs, setLabs] = useState<LabOrderItem[]>([]);
  const [save, setSave] = useState<SaveState>("idle");
  const [savedAt, setSavedAt] = useState("");
  const [column, setColumn] = useState<Column>("notes");
  const isFirstRun = useRef(true);

  // Debounced autosave stub.
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    setSave("saving");
    const t = setTimeout(() => {
      setSave("saved");
      setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }, 650);
    return () => clearTimeout(t);
  }, [note]);

  const age = useMemo(() => {
    const dob = new Date(patient.dateOfBirth).getTime();
    return Math.floor((Date.now() - dob) / 31_557_600_000);
  }, [patient.dateOfBirth]);

  const initials = patient.fullName
    .split(" ")
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join("");
  const orderCount = prescriptions.length + labs.length;

  return (
    <div className="flex h-dvh flex-col bg-canvas">
      {/* Patient context header — always visible */}
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border bg-surface px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2">
              <h1 className="truncate text-sm font-semibold leading-tight">{patient.fullName}</h1>
              <span className="text-xs text-muted-fg">
                {age}y · {patient.sex} · MRN {patient.mrn}
              </span>
            </div>
            <p className="truncate text-xs text-muted-fg">
              {patient.encounter.type} — {patient.encounter.reason}
            </p>
          </div>
        </div>

        {patient.allergies.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-md bg-danger/10 px-2 py-1 text-xs font-medium text-danger">
            <span aria-hidden>⚠</span>
            Allergies: {patient.allergies.join(", ")}
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-fg" aria-live="polite">
            {save === "saving" ? "Saving…" : save === "saved" ? `Saved ${savedAt}` : "Draft"}
          </span>
          <button
            type="button"
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
          >
            Save draft
          </button>
          <button
            type="button"
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-fg transition-opacity hover:opacity-95"
          >
            Sign &amp; close{orderCount > 0 ? ` (${orderCount})` : ""}
          </button>
        </div>
      </header>

      {/* Column switch — mobile / tablet only */}
      <div className="flex gap-1 border-b border-border bg-surface p-1 xl:hidden">
        {(["history", "notes", "orders"] as Column[]).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColumn(c)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors",
              column === c ? "bg-primary text-primary-fg" : "text-muted-fg hover:bg-muted",
            )}
          >
            {c}
            {c === "orders" && orderCount > 0 ? ` (${orderCount})` : ""}
          </button>
        ))}
      </div>

      {/* 3-column clinical grid — independent scroll per column */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-px bg-border xl:grid-cols-[minmax(300px,340px)_minmax(0,1fr)_minmax(320px,380px)]">
        <ColumnPane show={column === "history"} tone="canvas" label="Patient vitals and history">
          <VitalsHistoryPanel
            vitals={vitals}
            problems={problems}
            medications={medications}
            encounters={encounters}
          />
        </ColumnPane>

        <ColumnPane show={column === "notes"} tone="surface" label="Active diagnostic notes">
          <DiagnosticNotesPanel note={note} onChange={setNote} />
        </ColumnPane>

        <ColumnPane show={column === "orders"} tone="canvas" label="Prescriptions and lab orders">
          <PrescriptionOrderPanel
            prescriptions={prescriptions}
            labs={labs}
            onPrescriptionsChange={setPrescriptions}
            onLabsChange={setLabs}
          />
        </ColumnPane>
      </div>
    </div>
  );
}

function ColumnPane({
  show,
  tone,
  label,
  children,
}: {
  show: boolean;
  tone: "canvas" | "surface";
  label: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-label={label}
      className={cn(
        "min-h-0 overflow-y-auto",
        tone === "surface" ? "bg-surface" : "bg-canvas",
        !show && "hidden xl:block",
      )}
    >
      {children}
    </section>
  );
}
