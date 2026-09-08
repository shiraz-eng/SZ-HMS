"use client";

import { useState, useTransition } from "react";
import { cn } from "@szhms/ui";
import { rescheduleAppointment } from "@/app/[tenantId]/reception/actions";
import type { BoardAppointment, ReceptionBoard } from "@/lib/reception";

const CELL_TONE: Record<string, string> = {
  SCHEDULED: "bg-muted text-muted-fg",
  WAITING: "bg-warning/15 text-warning",
  IN_ROOM: "bg-primary/15 text-primary",
  COMPLETED: "bg-success/15 text-success",
  CANCELLED: "bg-muted text-muted-fg line-through",
  NO_SHOW: "bg-danger/10 text-danger",
};

/** Master calendar with HTML5 drag-and-drop to reschedule (no external lib). */
export function MasterCalendar({
  tenantSlug,
  board,
}: {
  tenantSlug: string;
  board: ReceptionBoard;
}) {
  const [pending, start] = useTransition();
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);

  const cols = board.doctors.length || 1;

  function drop(doctorId: string, hour: number) {
    const id = dragId;
    setDragId(null);
    setOver(null);
    if (!id) return;
    start(() => {
      void rescheduleAppointment(tenantSlug, id, doctorId, hour);
    });
  }

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="text-sm font-semibold">Master calendar · Today</span>
        <span className="text-xs text-muted-fg">
          {pending ? "Saving…" : "Drag a visit to reschedule"}
        </span>
      </div>
      <div className="overflow-x-auto">
        <div
          className="grid min-w-[640px] text-xs"
          style={{ gridTemplateColumns: `64px repeat(${cols}, 1fr)` }}
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
                const key = `${d.id}:${h}`;
                const appt: BoardAppointment | undefined = board.appointments.find(
                  (a) => a.doctorId === d.id && a.startHour === h,
                );
                return (
                  <div
                    key={key}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setOver(key);
                    }}
                    onDragLeave={() => setOver((o) => (o === key ? null : o))}
                    onDrop={() => drop(d.id, h)}
                    className={cn(
                      "min-h-[48px] border-b border-r border-border px-1.5 py-2 transition-colors",
                      over === key && "bg-primary/5 ring-1 ring-inset ring-primary/40",
                    )}
                  >
                    {appt && (
                      <button
                        type="button"
                        draggable
                        onDragStart={() => setDragId(appt.id)}
                        onDragEnd={() => setDragId(null)}
                        title={`${appt.patientName} · ${appt.reason}`}
                        className={cn(
                          "block w-full cursor-grab truncate rounded px-1.5 py-1 text-left text-[11px] active:cursor-grabbing",
                          CELL_TONE[appt.status],
                          dragId === appt.id && "opacity-40",
                        )}
                      >
                        {appt.time} {appt.patientName}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
