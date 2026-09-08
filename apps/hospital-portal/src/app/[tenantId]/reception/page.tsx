import { notFound } from "next/navigation";
import { cn } from "@szhms/ui";
import { getTenantBySlug } from "@/lib/tenant";
import { getReceptionBoard } from "@/lib/reception";
import { WaitingRoomBoard } from "@/components/reception/waiting-room-board";

const CELL_TONE: Record<string, string> = {
  SCHEDULED: "bg-muted text-muted-fg",
  WAITING: "bg-warning/15 text-warning",
  IN_ROOM: "bg-primary/15 text-primary",
  COMPLETED: "bg-success/15 text-success",
  CANCELLED: "bg-muted text-muted-fg line-through",
  NO_SHOW: "bg-danger/10 text-danger",
};

export default async function ReceptionDashboard({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const tenant = await getTenantBySlug(tenantId);
  if (!tenant) notFound();

  const board = await getReceptionBoard(tenant.id);

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
      <section className="overflow-hidden rounded-lg border border-border bg-surface">
        <div className="border-b border-border px-4 py-2 text-sm font-semibold">
          Master calendar · Today
        </div>
        <div className="overflow-x-auto">
          <div
            className="grid min-w-[640px] text-xs"
            style={{ gridTemplateColumns: `64px repeat(${board.doctors.length || 1}, 1fr)` }}
          >
            <div className="border-b border-r border-border bg-muted px-2 py-1.5" />
            {board.doctors.map((d) => (
              <div
                key={d.id}
                className="border-b border-r border-border bg-muted px-2 py-1.5 font-medium"
              >
                {d.name}
                {d.roomLabel ? ` · ${d.roomLabel}` : ""}
              </div>
            ))}

            {board.hours.map((h) => (
              <div key={h} className="contents">
                <div className="border-b border-r border-border px-2 py-5 text-muted-fg">
                  {String(h).padStart(2, "0")}:00
                </div>
                {board.doctors.map((d) => {
                  const appt = board.appointments.find(
                    (a) => a.doctorId === d.id && a.startHour === h,
                  );
                  return (
                    <div
                      key={d.id + h}
                      className="border-b border-r border-border px-1.5 py-2"
                    >
                      {appt && (
                        <span
                          className={cn(
                            "block truncate rounded px-1.5 py-1 text-[11px]",
                            CELL_TONE[appt.status],
                          )}
                          title={`${appt.patientName} · ${appt.reason}`}
                        >
                          {appt.patientName}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      <WaitingRoomBoard tenantSlug={tenantId} appointments={board.appointments} />
    </div>
  );
}
