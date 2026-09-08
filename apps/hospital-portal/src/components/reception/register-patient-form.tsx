"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { registerPatient, type RegisterState } from "@/app/[tenantId]/reception/actions";

const initial: RegisterState = {};
const input =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export function RegisterPatientForm({ tenantSlug }: { tenantSlug: string }) {
  const [state, action] = useActionState(registerPatient, initial);

  if (state.ok) {
    return (
      <div className="rounded-xl border border-success/30 bg-success/5 p-5">
        <p className="text-sm font-semibold text-success">Patient registered</p>
        {state.tempPassword && (
          <p className="mt-2 text-sm">
            Portal login created. Temporary password:{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">{state.tempPassword}</code>
            <br />
            <span className="text-muted-fg">Give this to the patient — it is shown once.</span>
          </p>
        )}
        <div className="mt-4 flex gap-2">
          <Link
            href={`/${tenantSlug}/reception`}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-fg"
          >
            Back to board
          </Link>
          {state.patientId && (
            <Link
              href={`/${tenantSlug}/doctor/patients/${state.patientId}`}
              className="rounded-md border border-border px-3 py-1.5 text-sm font-medium"
            >
              Open chart
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="tenantSlug" value={tenantSlug} />

      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold uppercase tracking-wide text-muted-fg">
          1 · Identity
        </legend>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Full name</span>
          <input name="fullName" required className={input} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Date of birth</span>
            <input name="dateOfBirth" type="date" required className={input} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Sex</span>
            <select name="sex" required className={input} defaultValue="FEMALE">
              <option value="FEMALE">Female</option>
              <option value="MALE">Male</option>
              <option value="OTHER">Other</option>
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold uppercase tracking-wide text-muted-fg">
          2 · Contact &amp; clinical
        </legend>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Phone</span>
            <input name="phone" className={input} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Email</span>
            <input name="email" type="email" className={input} />
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Allergies (comma-separated)</span>
          <input name="allergies" placeholder="Penicillin, Sulfa drugs" className={input} />
        </label>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold uppercase tracking-wide text-muted-fg">
          3 · Portal access
        </legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="portalAccess" className="h-4 w-4 rounded border-border" />
          Create a patient portal login (needs an email)
        </label>
      </fieldset>

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
      className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-fg disabled:opacity-60"
    >
      {pending ? "Registering…" : "Register patient"}
    </button>
  );
}
