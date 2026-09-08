export type Sex = "male" | "female" | "other";
export type VitalStatus = "normal" | "watch" | "critical";

export interface PatientSummary {
  id: string;
  mrn: string;
  fullName: string;
  dateOfBirth: string; // ISO date
  sex: Sex;
  allergies: string[];
  encounter: {
    id: string;
    type: string; // "Follow-up", "New consult", ...
    reason: string;
    startedAt: string; // ISO datetime
  };
}

export interface VitalReading {
  key: "bp" | "hr" | "temp" | "spo2" | "rr" | "weight";
  label: string;
  value: string;
  unit: string;
  capturedAt: string; // display string, e.g. "09:12"
  trend?: "up" | "down" | "flat";
  status?: VitalStatus;
}

export interface Problem {
  id: string;
  label: string;
  code: string; // ICD-10
  status: "active" | "chronic" | "resolved";
}

export interface Medication {
  id: string;
  name: string;
  sig: string; // dosing instruction
}

export interface Encounter {
  id: string;
  date: string;
  type: string;
  summary: string;
  provider: string;
}

export interface SoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  diagnoses: { code: string; label: string }[];
}

export interface PrescriptionItem {
  id: string;
  drug: string;
  strength: string;
  route: string;
  frequency: string;
  durationDays: number;
  quantity: number;
}

export interface LabOrderItem {
  id: string;
  name: string;
  code: string;
  priority: "routine" | "stat";
}

export interface EhrBootstrap {
  patient: PatientSummary;
  vitals: VitalReading[];
  problems: Problem[];
  medications: Medication[];
  encounters: Encounter[];
  note: SoapNote;
  prescriptions: PrescriptionItem[];
  labOrders: LabOrderItem[];
}
