export interface QueueEntry {
  patientId: string;
  name: string;
  time: string;
  reason: string;
  status: "waiting" | "in-room" | "done";
  isNew?: boolean;
}

/** Swap for a tenant-scoped query of today's appointments in Phase 4. */
export async function getTodaysQueue(_tenantId: string): Promise<QueueEntry[]> {
  return [
    { patientId: "pt_1039", name: "Marta Silva", time: "08:45", reason: "Med refill", status: "done" },
    { patientId: "pt_1042", name: "Amara Okafor", time: "09:15", reason: "HTN review", status: "in-room" },
    { patientId: "pt_1043", name: "Ben Carter", time: "09:30", reason: "Knee pain", status: "waiting" },
    { patientId: "pt_1044", name: "Priya Nair", time: "09:45", reason: "New consult", status: "waiting", isNew: true },
    { patientId: "pt_1045", name: "Luca Rossi", time: "10:00", reason: "Lab follow-up", status: "waiting" },
    { patientId: "pt_1046", name: "Grace Kim", time: "10:15", reason: "Rash", status: "waiting" },
  ];
}
