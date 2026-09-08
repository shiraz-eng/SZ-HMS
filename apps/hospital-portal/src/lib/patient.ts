import { forTenant } from "@szhms/database";

export async function getPatientRecord(tenantId: string, userId: string) {
  const db = forTenant(tenantId);
  return db.patient.findFirst({
    where: { userId },
    select: { id: true, fullName: true, mrn: true },
  });
}

export async function getPatientHome(tenantId: string, userId: string) {
  const db = forTenant(tenantId);
  const patient = await db.patient.findFirst({ where: { userId }, select: { id: true } });
  if (!patient) return null;

  const [nextAppt, balance, reportCount] = await Promise.all([
    db.appointment.findFirst({
      where: { patientId: patient.id, startsAt: { gte: new Date() }, status: { in: ["SCHEDULED", "WAITING"] } },
      orderBy: { startsAt: "asc" },
      select: { startsAt: true, reason: true, doctor: { select: { user: { select: { name: true } }, specialty: true } } },
    }),
    db.billing.aggregate({
      where: { patientId: patient.id, status: "ISSUED" },
      _sum: { amountCents: true, taxCents: true },
    }),
    db.medicalRecord.count({ where: { patientId: patient.id, signedAt: { not: null } } }),
  ]);

  const due = (balance._sum.amountCents ?? 0) + (balance._sum.taxCents ?? 0);

  return {
    patientId: patient.id,
    nextAppointment: nextAppt
      ? {
          when: nextAppt.startsAt.toLocaleString([], {
            weekday: "short",
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
          doctor: nextAppt.doctor.user.name,
          specialty: nextAppt.doctor.specialty,
          reason: nextAppt.reason,
        }
      : null,
    balanceDueCents: due,
    reportCount,
  };
}

export async function getPatientAppointments(tenantId: string, userId: string) {
  const db = forTenant(tenantId);
  const patient = await db.patient.findFirst({ where: { userId }, select: { id: true } });
  if (!patient) return [];
  const rows = await db.appointment.findMany({
    where: { patientId: patient.id },
    orderBy: { startsAt: "desc" },
    take: 25,
    select: {
      id: true,
      startsAt: true,
      reason: true,
      status: true,
      doctor: { select: { user: { select: { name: true } } } },
    },
  });
  return rows.map((a) => ({
    id: a.id,
    when: a.startsAt.toLocaleString([], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
    doctor: a.doctor.user.name,
    reason: a.reason,
    status: a.status,
  }));
}

export async function getPatientReports(tenantId: string, userId: string) {
  const db = forTenant(tenantId);
  const patient = await db.patient.findFirst({ where: { userId }, select: { id: true } });
  if (!patient) return [];
  const rows = await db.medicalRecord.findMany({
    where: { patientId: patient.id, signedAt: { not: null } },
    orderBy: { signedAt: "desc" },
    select: {
      id: true,
      signedAt: true,
      assessment: true,
      labOrders: true,
      appointment: { select: { type: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    date: r.signedAt ? r.signedAt.toISOString().slice(0, 10) : "",
    title: `${r.appointment?.type ?? "Visit"} summary`,
    assessment: r.assessment || "—",
    labs: Array.isArray(r.labOrders) ? (r.labOrders as { name: string }[]).length : 0,
  }));
}

export async function getPatientBills(tenantId: string, userId: string) {
  const db = forTenant(tenantId);
  const patient = await db.patient.findFirst({ where: { userId }, select: { id: true } });
  if (!patient) return [];
  const rows = await db.billing.findMany({
    where: { patientId: patient.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      invoiceNo: true,
      amountCents: true,
      taxCents: true,
      currency: true,
      status: true,
      issuedAt: true,
    },
  });
  return rows.map((b) => ({
    id: b.id,
    invoiceNo: b.invoiceNo,
    amount: ((b.amountCents + b.taxCents) / 100).toFixed(2),
    currency: b.currency,
    status: b.status,
    date: b.issuedAt ? b.issuedAt.toISOString().slice(0, 10) : "—",
  }));
}

export async function getPatientReport(tenantId: string, userId: string, reportId: string) {
  const db = forTenant(tenantId);
  const patient = await db.patient.findFirst({
    where: { userId },
    select: { id: true, fullName: true, mrn: true, dateOfBirth: true },
  });
  if (!patient) return null;

  const rec = await db.medicalRecord.findFirst({
    where: { id: reportId, patientId: patient.id, signedAt: { not: null } },
    select: {
      id: true,
      signedAt: true,
      subjective: true,
      objective: true,
      assessment: true,
      plan: true,
      diagnoses: true,
      prescriptions: true,
      labOrders: true,
      appointment: {
        select: { type: true, reason: true, startsAt: true, doctor: { select: { user: { select: { name: true } }, specialty: true } } },
      },
    },
  });
  if (!rec) return null;

  const asArray = (v: unknown) => (Array.isArray(v) ? v : []);

  return {
    id: rec.id,
    signedAt: rec.signedAt ? rec.signedAt.toISOString().slice(0, 10) : "",
    patient: {
      name: patient.fullName,
      mrn: patient.mrn,
      dob: patient.dateOfBirth.toISOString().slice(0, 10),
    },
    visit: {
      type: rec.appointment?.type ?? "Visit",
      reason: rec.appointment?.reason ?? "",
      date: rec.appointment?.startsAt.toISOString().slice(0, 10) ?? "",
      doctor: rec.appointment?.doctor.user.name ?? "—",
      specialty: rec.appointment?.doctor.specialty ?? "",
    },
    note: {
      subjective: rec.subjective,
      objective: rec.objective,
      assessment: rec.assessment,
      plan: rec.plan,
    },
    diagnoses: asArray(rec.diagnoses) as { code: string; label: string }[],
    prescriptions: asArray(rec.prescriptions) as {
      drug: string;
      strength: string;
      route: string;
      frequency: string;
      durationDays: number;
    }[],
    labOrders: asArray(rec.labOrders) as { name: string; code: string; priority: string }[],
  };
}

export async function getBookingDoctors(tenantId: string) {
  const db = forTenant(tenantId);
  const rows = await db.doctor.findMany({
    select: { id: true, specialty: true, user: { select: { name: true } } },
    orderBy: { user: { name: "asc" } },
  });
  return rows.map((d) => ({ id: d.id, name: d.user.name, specialty: d.specialty }));
}
