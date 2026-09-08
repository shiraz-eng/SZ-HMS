"use client";

import { useTransition } from "react";
import Link from "next/link";
import { cn } from "@szhms/ui";
import { setAppointmentStatus } from "@/app/[tenantId]/reception/actions";
import type { BoardAppointment } from "@/lib/reception";

const TONE: Record<string, string> = {
  SCHEDULED: "border-border bg-surface",
  WAITING: "border-warning/30 bg-warning/10 text-warning",
  IN_ROOM: "border-primary/30 bg-primary/10 text-primary",
  COMPLETED: "border-success/30 bg-success/10 text-success",
  CANCELLED: "border-border bg-muted text-muted-fg",
  NO_SHOW: "border-danger/30 bg-danger/10 text-danger",
};

const NEXT: Record<string, { label: string; status: string } | null> = {
  SCHEDULED: { label: "Check in", status: "WAITING" },
  WAITING: { label: "Room", status: "IN_ROOM" },
  IN_ROOM: { label: "Done", status: "COMPLETED" },
  COMPLETED: null,
  CANCELLED: null,
  NO_SHOW: null,
};

export function WaitingRoomBoard({
  tenantSlug,
  appointments,
}: {
  tenantSlug: string;
  appointments: BoardAppointment[];
}) {
  const [pending, start] = useTransition();
  const active = appointments.filter(
    (a) => !["COMPLETED", "CANCELLED", "NO_SHOW"].includes(a.status),
  );

  return (
    <section className="rounded-lg border border-border bg-surface p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold">Waiting room</span>
        <span className="text-xs text-muted-fg">{active.length} active</span>
      </div>
      <ul className="space-y-2">
        {active.map((a) => {
          const next = NEXT[a.status];
          return (
            <li
              key={a.id}
              className={cn("rounded-md border px-2.5 py-2 text-sm", TONE[a.status])}
            >
              <div className="flex items-center justify-between gap-2">
                <Link
                  href={`/${tenantSlug}/doctor/patients/${a.patientId}`}
                  className="truncate font-medium hover:underline"
                >
                  {a.patientName}
                </Link>
                <span className="shrink-0 text-xs tabular-nums">
                  {a.time}
                  {a.status === "WAITING" && a.waitMinutes > 0 ? ` · ${a.waitMinutes}m` : ""}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="truncate text-xs opacity-80">
                  {a.doctorName} · {a.reason}
                </span>
                {next && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      start(() => {
                        void setAppointmentStatus(tenantSlug, a.id, next.status);
                      })
                    }
                    className="shrink-0 rounded bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-fg disabled:opacity-60"
                  >
                    {next.label}
                  </button>
                )}
              </div>
            </li>
          );
        })}
        {active.length === 0 && (
          <li className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-muted-fg">
            No one waiting
          </li>
        )}
      </ul>
    </section>
  );
}
