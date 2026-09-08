import { forTenant } from "@szhms/database";

export interface QueueEntry {
  patientId: string;
  name: string;
  time: string;
  reason: string;
  status: "waiting" | "in-room" | "done";
  isNew?: boolean;
}

const STATUS_MAP: Record<string, QueueEntry["status"]> = {
  WAITING: "waiting",
  SCHEDULED: "waiting",
  IN_ROOM: "in-room",
  COMPLETED: "done",
  CANCELLED: "done",
  NO_SHOW: "done",
};

/** Today's appointments for the signed-in doctor's tenant, ordered by time. */
export async function getTodaysQueue(tenantId: string, doctorUserId?: string): Promise<QueueEntry[]> {
  const db = forTenant(tenantId);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const doctor = doctorUserId
    ? await db.doctor.findUnique({ where: { userId: doctorUserId }, select: { id: true } })
    : null;

  const appts = await db.appointment.findMany({
    where: {
      startsAt: { gte: startOfDay, lt: endOfDay },
      ...(doctor ? { doctorId: doctor.id } : {}),
    },
    orderBy: { startsAt: "asc" },
    select: {
      startsAt: true,
      reason: true,
      status: true,
      type: true,
      patient: { select: { id: true, fullName: true } },
    },
  });

  return appts.map((a) => ({
    patientId: a.patient.id,
    name: a.patient.fullName,
    time: a.startsAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    reason: a.reason,
    status: STATUS_MAP[a.status] ?? "waiting",
    isNew: a.type.toLowerCase().includes("new"),
  }));
}
