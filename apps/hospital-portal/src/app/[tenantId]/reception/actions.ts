"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { forTenant, recordAudit } from "@szhms/database";
import { hashPassword } from "@szhms/auth/password";
import { requireRole } from "@/lib/auth";
import { getTenantBySlug } from "@/lib/tenant";

const STATUSES = ["SCHEDULED", "WAITING", "IN_ROOM", "COMPLETED", "CANCELLED", "NO_SHOW"] as const;

async function ctx(tenantSlug: string) {
  const actor = await requireRole(tenantSlug, "RECEPTIONIST");
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) throw new Error("Unknown hospital");
  return { db: forTenant(tenant.id), tenantId: tenant.id, actor };
}

function mrn(): string {
  return `A-${randomBytes(3).readUIntBE(0, 3).toString().padStart(7, "0").slice(-7)}`;
}

// ---------------------------------------------------------------------------

export async function setAppointmentStatus(
  tenantSlug: string,
  appointmentId: string,
  status: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!(STATUSES as readonly string[]).includes(status)) {
    return { ok: false, error: "Invalid status" };
  }
  const { db, tenantId, actor } = await ctx(tenantSlug);
  const updated = await db.appointment.updateMany({
    where: { id: appointmentId },
    data: { status: status as (typeof STATUSES)[number] },
  });
  if (updated.count === 0) return { ok: false, error: "Appointment not found." };
  await recordAudit({
    tenantId,
    actorId: actor.userId,
    actorName: actor.name,
    actorRole: actor.role,
    action: "appointment.status",
    target: appointmentId,
    meta: { status },
  });
  revalidatePath(`/${tenantSlug}/reception`);
  return { ok: true };
}

// ---------------------------------------------------------------------------

const registerSchema = z.object({
  tenantSlug: z.string().min(1),
  fullName: z.string().min(2).max(100),
  dateOfBirth: z.string().min(4),
  sex: z.enum(["MALE", "FEMALE", "OTHER"]),
  phone: z.string().max(40).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  allergies: z.string().max(400).optional().or(z.literal("")),
  portalAccess: z.union([z.literal("on"), z.null()]).optional(),
});

export interface RegisterState {
  ok?: boolean;
  error?: string;
  patientId?: string;
  tempPassword?: string;
}

export async function registerPatient(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    tenantSlug: formData.get("tenantSlug"),
    fullName: formData.get("fullName"),
    dateOfBirth: formData.get("dateOfBirth"),
    sex: formData.get("sex"),
    phone: formData.get("phone") ?? "",
    email: formData.get("email") ?? "",
    allergies: formData.get("allergies") ?? "",
    portalAccess: formData.get("portalAccess") as "on" | null,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const v = parsed.data;
  const { db, tenantId, actor } = await ctx(v.tenantSlug);

  const dob = new Date(v.dateOfBirth);
  if (Number.isNaN(dob.getTime())) return { error: "Invalid date of birth." };

  const allergies = (v.allergies ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  let tempPassword: string | undefined;
  let userConnect: { userId: string } | undefined;

  if (v.portalAccess === "on") {
    if (!v.email) return { error: "Portal access needs an email address." };
    tempPassword = randomBytes(6).toString("base64url");
    const user = await db.user.create({
      data: {
        email: v.email.toLowerCase(),
        name: v.fullName,
        role: "PATIENT",
        passwordHash: await hashPassword(tempPassword),
      },
      select: { id: true },
    });
    userConnect = { userId: user.id };
  }

  // Retry once on the (very unlikely) MRN collision.
  let patientId: string | undefined;
  for (let attempt = 0; attempt < 2 && !patientId; attempt++) {
    try {
      const p = await db.patient.create({
        data: {
          mrn: mrn(),
          fullName: v.fullName,
          dateOfBirth: dob,
          sex: v.sex,
          phone: v.phone || null,
          email: v.email || null,
          allergies,
          ...(userConnect ?? {}),
        },
        select: { id: true },
      });
      patientId = p.id;
    } catch (err) {
      if (attempt === 1) throw err;
    }
  }

  await recordAudit({
    tenantId,
    actorId: actor.userId,
    actorName: actor.name,
    actorRole: actor.role,
    action: "patient.registered",
    target: patientId,
    meta: { portalAccess: v.portalAccess === "on" },
  });

  revalidatePath(`/${v.tenantSlug}/reception`);
  return { ok: true, patientId, tempPassword };
}

// ---------------------------------------------------------------------------

const scheduleSchema = z.object({
  tenantSlug: z.string().min(1),
  patientId: z.string().min(1),
  doctorId: z.string().min(1),
  startsAt: z.string().min(4),
  reason: z.string().min(2).max(200),
  type: z.string().max(60).optional().or(z.literal("")),
});

export interface ScheduleState {
  ok?: boolean;
  error?: string;
}

export async function scheduleAppointment(
  _prev: ScheduleState,
  formData: FormData,
): Promise<ScheduleState> {
  const parsed = scheduleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const v = parsed.data;
  const { db, tenantId, actor } = await ctx(v.tenantSlug);

  const starts = new Date(v.startsAt);
  if (Number.isNaN(starts.getTime())) return { error: "Invalid start time." };
  const ends = new Date(starts.getTime() + 20 * 60_000);

  const appt = await db.appointment.create({
    data: {
      patientId: v.patientId,
      doctorId: v.doctorId,
      startsAt: starts,
      endsAt: ends,
      reason: v.reason,
      type: v.type || "Follow-up",
      status: "SCHEDULED",
    },
    select: { id: true },
  });

  await recordAudit({
    tenantId,
    actorId: actor.userId,
    actorName: actor.name,
    actorRole: actor.role,
    action: "appointment.scheduled",
    target: appt.id,
  });

  revalidatePath(`/${v.tenantSlug}/reception`);
  return { ok: true };
}

// ---------------------------------------------------------------------------

/** Drag-and-drop on the master calendar: move an appointment to a new doctor/hour. */
export async function rescheduleAppointment(
  tenantSlug: string,
  appointmentId: string,
  doctorId: string,
  hour: number,
): Promise<{ ok: boolean; error?: string }> {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    return { ok: false, error: "Invalid hour." };
  }
  const { db, tenantId, actor } = await ctx(tenantSlug);

  const appt = await db.appointment.findFirst({
    where: { id: appointmentId },
    select: { id: true, startsAt: true, endsAt: true },
  });
  if (!appt) return { ok: false, error: "Appointment not found." };

  const durationMs = appt.endsAt.getTime() - appt.startsAt.getTime();
  const starts = new Date(appt.startsAt);
  starts.setHours(hour, 0, 0, 0);
  const ends = new Date(starts.getTime() + Math.max(durationMs, 10 * 60_000));

  await db.appointment.updateMany({
    where: { id: appointmentId },
    data: { doctorId, startsAt: starts, endsAt: ends },
  });

  await recordAudit({
    tenantId,
    actorId: actor.userId,
    actorName: actor.name,
    actorRole: actor.role,
    action: "appointment.rescheduled",
    target: appointmentId,
    meta: { doctorId, hour },
  });

  revalidatePath(`/${tenantSlug}/reception`);
  return { ok: true };
}
