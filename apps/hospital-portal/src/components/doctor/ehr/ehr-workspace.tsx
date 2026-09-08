"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
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
import {
  saveEncounter,
  signEncounter,
  type EncounterActionResult,
} from "@/app/[tenantId]/doctor/patients/[patientId]/actions";
import { VitalsHistoryPanel } from "./vitals-history-panel";
import { DiagnosticNotesPanel } from "./diagnostic-notes-panel";
import { PrescriptionOrderPanel } from "./prescription-order-panel";

type Column = "history" | "notes" | "orders";

interface Props {
  tenantSlug: string;
  encounterId: string;
  patient: PatientSummary;
  vitals: VitalReading[];
  problems: Problem[];
  medications: Medication[];
  encounters: Encounter[];
  initialNote: SoapNote;
  initialPrescriptions?: PrescriptionItem[];
  initialLabOrders?: LabOrderItem[];
}

/**
 * Doctor Portal — 3-column EHR. The design standard for the product:
 * CSS-variable tokens (white-label safe), a persistent patient-context header,
 * three independently scrolling columns on xl+ (segmented switch below that),
 * and server-action save / sign with a live status line.
 */
export function EhrWorkspace({
  tenantSlug,
  encounterId,
  patient,
  vitals,
  problems,
  medications,
  encounters,
  initialNote,
  initialPrescriptions = [],
  initialLabOrders = [],
}: Props) {
  const [note, setNote] = useState<SoapNote>(initialNote);
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>(initialPrescriptions);
  const [labs, setLabs] = useState<LabOrderItem[]>(initialLabOrders);
  const [status, setStatus] = useState<string>("Draft");
  const [column, setColumn] = useState<Column>("notes");
  const [pending, startTransition] = useTransition();

  const hasEncounter = encounterId !== "none";

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

  function run(sign: boolean) {
    if (!hasEncounter || pending) return;
    setStatus(sign ? "Signing…" : "Saving…");
    startTransition(async () => {
      const fn = sign ? signEncounter : saveEncounter;
      const res: EncounterActionResult = await fn(tenantSlug, encounterId, {
        note,
        prescriptions,
        labOrders: labs,
      });
      if (res.ok) {
        const t = new Date(res.savedAt ?? Date.now()).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        setStatus(sign ? `Signed ${t}` : `Saved ${t}`);
      } else {
        setStatus(res.error ?? "Save failed");
      }
    });
  }

  return (
    <div className="flex h-dvh flex-col bg-canvas">
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
            {hasEncounter ? status : "No active encounter"}
          </span>
          <button
            type="button"
            onClick={() => run(false)}
            disabled={!hasEncounter || pending}
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={() => run(true)}
            disabled={!hasEncounter || pending}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-fg transition-opacity hover:opacity-95 disabled:opacity-50"
          >
            Sign &amp; close{orderCount > 0 ? ` (${orderCount})` : ""}
          </button>
        </div>
      </header>

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
