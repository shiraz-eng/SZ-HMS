"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { bookAppointment, type BookState } from "@/app/[tenantId]/patient/actions";

const initial: BookState = {};
const input =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export function BookingForm({
  tenantSlug,
  doctors,
}: {
  tenantSlug: string;
  doctors: { id: string; name: string; specialty: string }[];
}) {
  const [state, action] = useActionState(bookAppointment, initial);

  if (state.ok) {
    return (
      <div className="rounded-xl border border-success/30 bg-success/5 p-5 text-sm">
        <p className="font-semibold text-success">Appointment requested</p>
        <p className="mt-1 text-muted-fg">Reception will confirm your slot shortly.</p>
        <Link
          href={`/${tenantSlug}/patient`}
          className="mt-4 inline-block rounded-md bg-primary px-3 py-1.5 font-semibold text-primary-fg"
        >
          Done
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="tenantSlug" value={tenantSlug} />

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Doctor</span>
        <select name="doctorId" required className={input} defaultValue="">
          <option value="" disabled>
            Select…
          </option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} — {d.specialty}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Date</span>
          <input name="date" type="date" required className={input} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Time</span>
          <input name="time" type="time" required className={input} />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Reason for visit</span>
        <textarea name="reason" rows={3} required className={input} />
      </label>

      {state.error && (
        <p role="alert" className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}

      <Submit />
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-fg disabled:opacity-60"
    >
      {pending ? "Requesting…" : "Request appointment"}
    </button>
  );
}
