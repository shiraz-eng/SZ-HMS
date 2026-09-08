import { forTenant } from "@szhms/database";

export interface AdminOverview {
  revenueTodayCents: number;
  revenue7d: { day: string; cents: number }[];
  appointmentsToday: number;
  completedToday: number;
  activePatients: number;
  staffCount: number;
  utilisationPct: number;
  occupancy: OccupancySummary;
}

export interface OccupancySummary {
  total: number;
  occupied: number;
  available: number;
  cleaning: number;
  outOfService: number;
  pct: number;
  byWard: { ward: string; total: number; occupied: number }[];
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getBedOccupancy(tenantId: string): Promise<OccupancySummary> {
  const db = forTenant(tenantId);
  const beds = await db.bed.findMany({ select: { ward: true, status: true } });

  const total = beds.length;
  const count = (s: string) => beds.filter((b) => b.status === s).length;
  const occupied = count("OCCUPIED");

  const wardMap = new Map<string, { total: number; occupied: number }>();
  for (const b of beds) {
    const w = wardMap.get(b.ward) ?? { total: 0, occupied: 0 };
    w.total += 1;
    if (b.status === "OCCUPIED") w.occupied += 1;
    wardMap.set(b.ward, w);
  }

  return {
    total,
    occupied,
    available: count("AVAILABLE"),
    cleaning: count("CLEANING"),
    outOfService: count("OUT_OF_SERVICE"),
    pct: total > 0 ? Math.round((occupied / total) * 100) : 0,
    byWard: [...wardMap.entries()].map(([ward, v]) => ({ ward, ...v })),
  };
}

export async function getAdminOverview(tenantId: string): Promise<AdminOverview> {
  const db = forTenant(tenantId);

  const start = startOfToday();
  const start7d = new Date(start.getTime() - 6 * 864e5);
  const endToday = new Date(start.getTime() + 864e5);

  const [paidRows, apptsToday, completedToday, activePatients, doctors, staff, occupancy] =
    await Promise.all([
      db.billing.findMany({
        where: { status: "PAID", paidAt: { gte: start7d } },
        select: { amountCents: true, taxCents: true, paidAt: true },
      }),
      db.appointment.count({ where: { startsAt: { gte: start, lt: endToday } } }),
      db.appointment.count({
        where: { startsAt: { gte: start, lt: endToday }, status: "COMPLETED" },
      }),
      db.patient.count(),
      db.doctor.count(),
      db.user.count({ where: { isActive: true } }),
      getBedOccupancy(tenantId),
    ]);

  const buckets = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    buckets.set(new Date(start7d.getTime() + i * 864e5).toISOString().slice(0, 10), 0);
  }
  let revenueTodayCents = 0;
  for (const r of paidRows) {
    if (!r.paidAt) continue;
    const key = r.paidAt.toISOString().slice(0, 10);
    const cents = r.amountCents + r.taxCents;
    buckets.set(key, (buckets.get(key) ?? 0) + cents);
    if (r.paidAt >= start) revenueTodayCents += cents;
  }

  const capacityPerDoctor = 16;
  const utilisationPct =
    doctors > 0
      ? Math.min(100, Math.round((apptsToday / (doctors * capacityPerDoctor)) * 100))
      : 0;

  return {
    revenueTodayCents,
    revenue7d: [...buckets.entries()].map(([day, cents]) => ({ day: day.slice(5), cents })),
    appointmentsToday: apptsToday,
    completedToday,
    activePatients,
    staffCount: staff,
    utilisationPct,
    occupancy,
  };
}

export async function getRevenueSeries(tenantId: string, days = 30) {
  const db = forTenant(tenantId);
  const start = new Date(startOfToday().getTime() - (days - 1) * 864e5);

  const rows = await db.billing.findMany({
    where: { status: "PAID", paidAt: { gte: start } },
    select: { amountCents: true, taxCents: true, paidAt: true },
  });

  const buckets = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    buckets.set(new Date(start.getTime() + i * 864e5).toISOString().slice(0, 10), 0);
  }
  for (const r of rows) {
    if (!r.paidAt) continue;
    const key = r.paidAt.toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, buckets.get(key)! + r.amountCents + r.taxCents);
  }

  const series = [...buckets.entries()].map(([day, cents]) => ({ day: day.slice(5), cents }));
  const totalCents = series.reduce((s, p) => s + p.cents, 0);
  return { series, totalCents };
}

export async function getDoctorUtilisation(tenantId: string) {
  const db = forTenant(tenantId);
  const start = startOfToday();
  const end = new Date(start.getTime() + 864e5);

  const doctors = await db.doctor.findMany({
    select: { id: true, user: { select: { name: true } } },
  });
  const grouped = await db.appointment.groupBy({
    by: ["doctorId"],
    where: { startsAt: { gte: start, lt: end } },
    _count: { _all: true },
  });
  const countFor = new Map(grouped.map((g) => [g.doctorId, g._count._all]));

  const capacity = 16;
  return doctors.map((d) => ({
    name: d.user.name.replace(/^Dr\.?\s*/i, ""),
    booked: countFor.get(d.id) ?? 0,
    pct: Math.min(100, Math.round(((countFor.get(d.id) ?? 0) / capacity) * 100)),
  }));
}

export async function getStaff(tenantId: string) {
  const db = forTenant(tenantId);
  const users = await db.user.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  });
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: u.isActive,
    joined: u.createdAt.toISOString().slice(0, 10),
  }));
}

export async function getAuditLog(tenantId: string, take = 100) {
  const db = forTenant(tenantId);
  const rows = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      createdAt: true,
      actorName: true,
      actorRole: true,
      action: true,
      target: true,
    },
  });
  return rows.map((r) => ({
    id: r.id,
    when: r.createdAt.toISOString().replace("T", " ").slice(0, 16),
    actor: r.actorName,
    role: r.actorRole,
    action: r.action,
    target: r.target ?? "",
  }));
}
