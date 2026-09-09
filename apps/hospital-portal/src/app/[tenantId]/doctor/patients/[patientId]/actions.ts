"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { forTenant, recordAudit } from "@szhms/database";
import { requireRole } from "@/lib/auth";
import { getTenantBySlug } from "@/lib/tenant";

const diagnosis = z.object({ code: z.string().min(1), label: z.string() });

const prescription = z.object({
  id: z.string(),
  drug: z.string().min(1),
  strength: z.string(),
  route: z.string(),
  frequency: z.string(),
  durationDays: z.number().int().positive(),
  quantity: z.number().int().nonnegative(),
});

const labOrder = z.object({
  id: z.string(),
  name: z.string().min(1),
  code: z.string().min(1),
  priority: z.enum(["routine", "stat"]),
});

const payloadSchema = z.object({
  note: z.object({
    subjective: z.string(),
    objective: z.string(),
    assessment: z.string(),
    plan: z.string(),
    diagnoses: z.array(diagnosis),
  }),
  prescriptions: z.array(prescription),
  labOrders: z.array(labOrder),
});

export type EncounterPayload = z.infer<typeof payloadSchema>;

export interface EncounterActionResult {
  ok: boolean;
  error?: string;
  savedAt?: string;
}

async function persist(
  tenantSlug: string,
  encounterId: string,
  raw: unknown,
  opts: { sign: boolean },
): Promise<EncounterActionResult> {
  const user = await requireRole(tenantSlug, "DOCTOR");
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return { ok: false, error: "Unknown hospital." };
  if (!encounterId || encounterId === "none") {
    return { ok: false, error: "No active encounter to write to." };
  }

  const parsed = payloadSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid encounter data." };
  const { note, prescriptions, labOrders } = parsed.data;

  const db = forTenant(tenant.id);

  const appointment = await db.appointment.findFirst({
    where: { id: encounterId },
    select: { id: true, patientId: true, status: true },
  });
  if (!appointment) return { ok: false, error: "Encounter not found." };

  const recordData = {
    subjective: note.subjective,
    objective: note.objective,
    assessment: note.assessment,
    plan: note.plan,
    diagnoses: note.diagnoses,
    prescriptions,
    labOrders,
    ...(opts.sign ? { signedAt: new Date(), signedById: user.userId } : {}),
  };

  await db.$transaction(async (tx) => {
    const record = await tx.medicalRecord.findFirst({
      where: { appointmentId: appointment.id },
      select: { id: true },
    });
    if (record) {
      await tx.medicalRecord.updateMany({ where: { id: record.id }, data: recordData });
    } else {
      await tx.medicalRecord.create({
        data: {
          tenantId: tenant.id,
          appointmentId: appointment.id,
          patientId: appointment.patientId,
          vitals: [],
          ...recordData,
        },
      });
    }

    if (opts.sign) {
      await tx.appointment.updateMany({
        where: { id: appointment.id },
        data: { status: "COMPLETED" },
      });

      // Draft an invoice for the visit if one doesn't exist yet.
      const existingBill = await tx.billing.findFirst({
        where: { appointmentId: appointment.id },
        select: { id: true },
      });
      if (!existingBill) {
        await tx.billing.create({
          data: {
            tenantId: tenant.id,
            appointmentId: appointment.id,
            patientId: appointment.patientId,
            invoiceNo: `INV-${Date.now().toString(36).toUpperCase()}`,
            amountCents: 8400,
            currency: "USD",
            status: "ISSUED",
            issuedAt: new Date(),
            lineItems: [{ description: "Consultation", qty: 1, unitCents: 8400 }],
          },
        });
      }
    }
  });

  if (opts.sign) {
    await recordAudit({
      tenantId: tenant.id,
      actorId: user.userId,
      actorName: user.name,
      actorRole: user.role,
      action: "encounter.signed",
      target: appointment.id,
      meta: { patientId: appointment.patientId },
    });
  }

  revalidatePath(`/${tenantSlug}/doctor/patients/${appointment.patientId}`);
  revalidatePath(`/${tenantSlug}/doctor`);

  return { ok: true, savedAt: new Date().toISOString() };
}

export async function saveEncounter(
  tenantSlug: string,
  encounterId: string,
  payload: EncounterPayload,
): Promise<EncounterActionResult> {
  return persist(tenantSlug, encounterId, payload, { sign: false });
}

export async function signEncounter(
  tenantSlug: string,
  encounterId: string,
  payload: EncounterPayload,
): Promise<EncounterActionResult> {
  return persist(tenantSlug, encounterId, payload, { sign: true });
}
