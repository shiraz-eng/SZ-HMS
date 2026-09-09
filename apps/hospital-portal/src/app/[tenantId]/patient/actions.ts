"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { forTenant, recordAudit } from "@szhms/database";
import { requireRole } from "@/lib/auth";
import { getTenantBySlug } from "@/lib/tenant";

async function ctx(tenantSlug: string) {
  const user = await requireRole(tenantSlug, "PATIENT");
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) throw new Error("Unknown hospital");
  const db = forTenant(tenant.id);
  const patient = await db.patient.findFirst({
    where: { userId: user.userId },
    select: { id: true },
  });
  if (!patient) throw new Error("No patient record linked to this account");
  return { db, patientId: patient.id, tenantId: tenant.id, actor: user };
}

// ---------------------------------------------------------------------------

const bookSchema = z.object({
  tenantSlug: z.string().min(1),
  doctorId: z.string().min(1),
  date: z.string().min(4),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  reason: z.string().min(3).max(200),
});

export interface BookState {
  ok?: boolean;
  error?: string;
}

export async function bookAppointment(_prev: BookState, formData: FormData): Promise<BookState> {
  const parsed = bookSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const v = parsed.data;
  const { db, patientId, tenantId } = await ctx(v.tenantSlug);

  const starts = new Date(`${v.date}T${v.time}:00`);
  if (Number.isNaN(starts.getTime()) || starts.getTime() < Date.now()) {
    return { error: "Pick a future date and time." };
  }
  const ends = new Date(starts.getTime() + 20 * 60_000);

  await db.appointment.create({
    data: {
      tenantId,
      patientId,
      doctorId: v.doctorId,
      startsAt: starts,
      endsAt: ends,
      reason: v.reason,
      type: "New consult",
      status: "SCHEDULED",
    },
  });

  revalidatePath(`/${v.tenantSlug}/patient`);
  revalidatePath(`/${v.tenantSlug}/patient/appointments`);
  return { ok: true };
}

// ---------------------------------------------------------------------------

/**
 * Demo settlement. A real integration would create a Stripe PaymentIntent for
 * the invoice and confirm it here on webhook; this marks it paid directly.
 */
export async function payInvoice(
  tenantSlug: string,
  invoiceId: string,
): Promise<{ ok: boolean; error?: string }> {
  const { db, patientId, tenantId, actor } = await ctx(tenantSlug);
  const invoice = await db.billing.findFirst({
    where: { id: invoiceId },
    select: { id: true, patientId: true, status: true },
  });
  if (!invoice || invoice.patientId !== patientId) {
    return { ok: false, error: "Invoice not found." };
  }
  if (invoice.status === "PAID") return { ok: true };

  await db.billing.updateMany({
    where: { id: invoice.id },
    data: { status: "PAID", paidAt: new Date(), paymentRef: `demo_${Date.now().toString(36)}` },
  });

  await recordAudit({
    tenantId,
    actorId: actor.userId,
    actorName: actor.name,
    actorRole: actor.role,
    action: "invoice.paid",
    target: invoice.id,
  });

  revalidatePath(`/${tenantSlug}/patient`);
  revalidatePath(`/${tenantSlug}/patient/billing`);
  return { ok: true };
}
