"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSelectedLayoutSegments } from "next/navigation";
import { cn } from "@szhms/ui";
import type { QueueEntry } from "@/lib/queue";

const statusDot: Record<QueueEntry["status"], string> = {
  waiting: "bg-warning",
  "in-room": "bg-primary",
  done: "bg-muted-fg/40",
};

const statusLabel: Record<QueueEntry["status"], string> = {
  waiting: "Waiting",
  "in-room": "In room",
  done: "Done",
};

export function PatientQueueSidebar({ queue }: { queue: QueueEntry[] }) {
  const [q, setQ] = useState("");
  const params = useParams<{ tenantId: string }>();
  const segments = useSelectedLayoutSegments();
  const activeId = segments[0] === "patients" ? segments[1] : undefined;

  const rows = useMemo(
    () => queue.filter((e) => e.name.toLowerCase().includes(q.trim().toLowerCase())),
    [queue, q],
  );
  const waiting = queue.filter((e) => e.status === "waiting").length;

  return (
    <aside className="hidden min-h-0 flex-col border-r border-border bg-surface lg:flex">
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Today&rsquo;s Queue</h2>
          <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
            {waiting} waiting
          </span>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search patients"
          aria-label="Search today's queue"
          className="mt-2 w-full rounded-md border border-border bg-canvas px-2.5 py-1.5 text-sm outline-none placeholder:text-muted-fg focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto p-2">
        {rows.map((e) => {
          const active = e.patientId === activeId;
          return (
            <Link
              key={e.patientId}
              href={`/${params.tenantId}/doctor/patients/${e.patientId}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "mb-1 block rounded-lg border px-3 py-2 transition-colors",
                active ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="truncate text-sm font-medium">{e.name}</span>
                <span className="text-xs tabular-nums text-muted-fg">{e.time}</span>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span
                  className={cn("h-1.5 w-1.5 shrink-0 rounded-full", statusDot[e.status])}
                  title={statusLabel[e.status]}
                />
                <span className="truncate text-xs text-muted-fg">{e.reason}</span>
                {e.isNew && (
                  <span className="ml-auto rounded bg-accent/10 px-1.5 text-[10px] font-semibold uppercase text-accent">
                    New
                  </span>
                )}
              </div>
            </Link>
          );
        })}
        {rows.length === 0 && (
          <p className="px-3 py-6 text-center text-xs text-muted-fg">No matching patients.</p>
        )}
      </nav>
    </aside>
  );
}
