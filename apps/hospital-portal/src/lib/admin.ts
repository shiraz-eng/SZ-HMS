import { forTenant } from "@szhms/database";

export interface AdminOverview {
  revenueTodayCents: number;
  revenue7d: { day: string; cents: number }[];
  appointmentsToday: number;
  completedToday: number;
  activePatients: number;
  staffCount: number;
  utilisationPct: number;
}

export async function getAdminOverview(tenantId: string): Promise<AdminOverview> {
  const db = forTenant(tenantId);

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const start7d = new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000);
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

  const [paidRows, apptsToday, completedToday, activePatients, doctors, seatUsed] =
    await Promise.all([
      db.billing.findMany({
        where: { status: "PAID", paidAt: { gte: start7d } },
        select: { amountCents: true, taxCents: true, paidAt: true },
      }),
      db.appointment.count({ where: { startsAt: { gte: startOfToday, lt: endOfToday } } }),
      db.appointment.count({
        where: { startsAt: { gte: startOfToday, lt: endOfToday }, status: "COMPLETED" },
      }),
      db.patient.count(),
      db.doctor.count(),
      db.user.count({ where: { isActive: true } }),
    ]);

  const buckets = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(start7d.getTime() + i * 24 * 60 * 60 * 1000);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  let revenueTodayCents = 0;
  for (const r of paidRows) {
    if (!r.paidAt) continue;
    const key = r.paidAt.toISOString().slice(0, 10);
    const cents = r.amountCents + r.taxCents;
    buckets.set(key, (buckets.get(key) ?? 0) + cents);
    if (r.paidAt >= startOfToday) revenueTodayCents += cents;
  }

  const capacityPerDoctor = 16; // 20-min slots over an 8h day, roughly
  const utilisationPct =
    doctors > 0 ? Math.min(100, Math.round((apptsToday / (doctors * capacityPerDoctor)) * 100)) : 0;

  return {
    revenueTodayCents,
    revenue7d: [...buckets.entries()].map(([day, cents]) => ({ day: day.slice(5), cents })),
    appointmentsToday: apptsToday,
    completedToday,
    activePatients,
    staffCount: seatUsed,
    utilisationPct,
  };
}
