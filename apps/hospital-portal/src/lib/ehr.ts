import { forTenant } from "@szhms/database";
import type { EhrBootstrap, SoapNote, VitalReading } from "@/types/ehr";

const SEX_MAP = { MALE: "male", FEMALE: "female", OTHER: "other" } as const;

function vitalsFromJson(v: unknown): VitalReading[] {
  if (Array.isArray(v)) return v as VitalReading[];
  return [];
}

function noteFromRecord(rec: {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  diagnoses: unknown;
} | null): SoapNote {
  return {
    subjective: rec?.subjective ?? "",
    objective: rec?.objective ?? "",
    assessment: rec?.assessment ?? "",
    plan: rec?.plan ?? "",
    diagnoses: Array.isArray(rec?.diagnoses)
      ? (rec?.diagnoses as SoapNote["diagnoses"])
      : [],
  };
}

/**
 * Loads everything the 3-column EHR needs for one patient, tenant-scoped.
 * The active encounter is the patient's most recent non-completed appointment.
 */
export async function getEhrBootstrap(
  tenantId: string,
  patientId: string,
): Promise<EhrBootstrap | null> {
  const db = forTenant(tenantId);

  const patient = await db.patient.findUnique({
    where: { id: patientId },
    select: {
      id: true,
      mrn: true,
      fullName: true,
      dateOfBirth: true,
      sex: true,
      allergies: true,
    },
  });
  if (!patient) return null;

  const appointment = await db.appointment.findFirst({
    where: { patientId, status: { in: ["SCHEDULED", "WAITING", "IN_ROOM"] } },
    orderBy: { startsAt: "asc" },
    select: { id: true, type: true, reason: true, startsAt: true },
  });

  const [records, activeRecord] = await Promise.all([
    db.medicalRecord.findMany({
      where: { patientId },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        createdAt: true,
        assessment: true,
        signedById: true,
        appointment: { select: { type: true } },
      },
    }),
    appointment
      ? db.medicalRecord.findUnique({
          where: { appointmentId: appointment.id },
          select: {
            subjective: true,
            objective: true,
            assessment: true,
            plan: true,
            diagnoses: true,
            vitals: true,
          },
        })
      : Promise.resolve(null),
  ]);

  return {
    patient: {
      id: patient.id,
      mrn: patient.mrn,
      fullName: patient.fullName,
      dateOfBirth: patient.dateOfBirth.toISOString(),
      sex: SEX_MAP[patient.sex],
      allergies: patient.allergies,
      encounter: {
        id: appointment?.id ?? "none",
        type: appointment?.type ?? "Walk-in",
        reason: appointment?.reason ?? "—",
        startedAt: (appointment?.startsAt ?? new Date()).toISOString(),
      },
    },
    vitals: vitalsFromJson(activeRecord?.vitals),
    problems: [],
    medications: [],
    encounters: records.map((r) => ({
      id: r.id,
      date: r.createdAt.toISOString().slice(0, 10),
      type: r.appointment?.type ?? "Encounter",
      summary: r.assessment || "—",
      provider: r.signedById ? "Signed" : "Draft",
    })),
    note: noteFromRecord(activeRecord),
  };
}
