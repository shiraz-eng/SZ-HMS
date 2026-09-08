import type {
  EhrBootstrap,
  Encounter,
  Medication,
  PatientSummary,
  Problem,
  SoapNote,
  VitalReading,
} from "@/types/ehr";

const patients: Record<string, PatientSummary> = {
  pt_1042: {
    id: "pt_1042",
    mrn: "A-1042",
    fullName: "Amara Okafor",
    dateOfBirth: "1987-03-14",
    sex: "female",
    allergies: ["Penicillin", "Sulfa drugs"],
    encounter: {
      id: "enc_88",
      type: "Follow-up",
      reason: "Hypertension review + fatigue",
      startedAt: new Date().toISOString(),
    },
  },
  pt_1043: {
    id: "pt_1043",
    mrn: "A-1043",
    fullName: "Ben Carter",
    dateOfBirth: "1969-11-02",
    sex: "male",
    allergies: [],
    encounter: {
      id: "enc_89",
      type: "New consult",
      reason: "Right knee pain, 3 weeks",
      startedAt: new Date().toISOString(),
    },
  },
};

const vitals: VitalReading[] = [
  { key: "bp", label: "Blood pressure", value: "148/94", unit: "mmHg", capturedAt: "09:12", trend: "up", status: "watch" },
  { key: "hr", label: "Heart rate", value: "82", unit: "bpm", capturedAt: "09:12", trend: "flat", status: "normal" },
  { key: "temp", label: "Temp", value: "36.8", unit: "°C", capturedAt: "09:12", trend: "flat", status: "normal" },
  { key: "spo2", label: "SpO₂", value: "97", unit: "%", capturedAt: "09:12", trend: "flat", status: "normal" },
  { key: "rr", label: "Resp. rate", value: "16", unit: "/min", capturedAt: "09:12", status: "normal" },
  { key: "weight", label: "Weight", value: "78.4", unit: "kg", capturedAt: "09:12", trend: "up", status: "normal" },
];

const problems: Problem[] = [
  { id: "p1", label: "Essential hypertension", code: "I10", status: "chronic" },
  { id: "p2", label: "Iron-deficiency anaemia", code: "D50.9", status: "active" },
  { id: "p3", label: "Appendicectomy (2011)", code: "Z98.89", status: "resolved" },
];

const medications: Medication[] = [
  { id: "m1", name: "Amlodipine 5 mg", sig: "1 tab PO once daily" },
  { id: "m2", name: "Ferrous sulfate 200 mg", sig: "1 tab PO twice daily with food" },
];

const encounters: Encounter[] = [
  { id: "e1", date: "2026-06-02", type: "Follow-up", summary: "BP 138/88, continued amlodipine.", provider: "Dr. Reyes" },
  { id: "e2", date: "2026-03-19", type: "New consult", summary: "Fatigue workup, started oral iron.", provider: "Dr. Reyes" },
  { id: "e3", date: "2025-12-08", type: "Telehealth", summary: "Medication refill, clinically stable.", provider: "Dr. Osei" },
];

function emptyNote(): SoapNote {
  return {
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
    diagnoses: [{ code: "I10", label: "Essential hypertension" }],
  };
}

/** Swap for a tenant-scoped, patient-scoped query in Phase 4. */
export async function getEhrBootstrap(
  _tenantId: string,
  patientId: string,
): Promise<EhrBootstrap | null> {
  const patient = patients[patientId] ?? patients.pt_1042;
  if (!patient) return null;
  return { patient, vitals, problems, medications, encounters, note: emptyNote() };
}
