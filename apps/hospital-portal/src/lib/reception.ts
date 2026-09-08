import { forTenant } from "@szhms/database";

export interface BoardAppointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  time: string;
  startHour: number;
  reason: string;
  status: "SCHEDULED" | "WAITING" | "IN_ROOM" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  waitMinutes: number;
}

export interface ReceptionBoard {
  doctors: { id: string; name: string; roomLabel: string | null }[];
  appointments: BoardAppointment[];
  hours: number[];
}

export async function getReceptionBoard(tenantId: string): Promise<ReceptionBoard> {
  const db = forTenant(tenantId);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const [doctors, appts] = await Promise.all([
    db.doctor.findMany({
      select: { id: true, roomLabel: true, user: { select: { name: true } } },
      orderBy: { user: { name: "asc" } },
    }),
    db.appointment.findMany({
      where: { startsAt: { gte: startOfDay, lt: endOfDay } },
      orderBy: { startsAt: "asc" },
      select: {
        id: true,
        startsAt: true,
        reason: true,
        status: true,
        patient: { select: { id: true, fullName: true } },
        doctor: { select: { id: true, user: { select: { name: true } } } },
      },
    }),
  ]);

  const now = Date.now();

  return {
    doctors: doctors.map((d) => ({ id: d.id, name: d.user.name, roomLabel: d.roomLabel })),
    hours: [8, 9, 10, 11, 12, 13, 14, 15, 16],
    appointments: appts.map((a) => ({
      id: a.id,
      patientId: a.patient.id,
      patientName: a.patient.fullName,
      doctorId: a.doctor.id,
      doctorName: a.doctor.user.name,
      time: a.startsAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      startHour: a.startsAt.getHours(),
      reason: a.reason,
      status: a.status,
      waitMinutes:
        a.status === "WAITING" ? Math.max(0, Math.round((now - a.startsAt.getTime()) / 60000)) : 0,
    })),
  };
}

export async function getDoctors(tenantId: string) {
  const db = forTenant(tenantId);
  const doctors = await db.doctor.findMany({
    select: { id: true, specialty: true, user: { select: { name: true } } },
    orderBy: { user: { name: "asc" } },
  });
  return doctors.map((d) => ({ id: d.id, name: d.user.name, specialty: d.specialty }));
}
