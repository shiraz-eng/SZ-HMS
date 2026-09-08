"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { addStaff, type AddStaffState } from "@/app/[tenantId]/admin/staff/actions";

const initial: AddStaffState = {};
const input =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export function AddStaffForm({ tenantSlug }: { tenantSlug: string }) {
  const [state, action] = useActionState(addStaff, initial);
  const [role, setRole] = useState("DOCTOR");

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="tenantSlug" value={tenantSlug} />

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Name</span>
        <input name="name" required className={input} />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Email</span>
        <input name="email" type="email" required className={input} />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Role</span>
        <select
          name="role"
          className={input}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="DOCTOR">Doctor</option>
          <option value="RECEPTIONIST">Receptionist</option>
          <option value="ADMIN">Admin</option>
        </select>
      </label>
      {role === "DOCTOR" && (
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Specialty</span>
          <input name="specialty" className={input} placeholder="Cardiology" />
        </label>
      )}

      {state.error && (
        <p role="alert" className="sm:col-span-2 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}
      {state.ok && state.tempPassword && (
        <p className="sm:col-span-2 rounded-md bg-success/10 px-3 py-2 text-sm text-success">
          Added. Temporary password: <code>{state.tempPassword}</code> — shown once.
        </p>
      )}

      <div className="sm:col-span-2">
        <Submit />
      </div>
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-fg disabled:opacity-60"
    >
      {pending ? "Adding…" : "Add staff member"}
    </button>
  );
}
