"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { TenantThemeProvider } from "@szhms/ui";
import { saveTheme, type ThemeState } from "@/app/[tenantId]/admin/settings/theme/actions";

const initial: ThemeState = {};

export function ThemeCustomizerForm({
  tenantSlug,
  initialPrimary,
  initialAccent,
}: {
  tenantSlug: string;
  initialPrimary: string;
  initialAccent: string;
}) {
  const [state, formAction] = useActionState(saveTheme, initial);
  const [primary, setPrimary] = useState(initialPrimary);
  const [accent, setAccent] = useState(initialAccent);

  return (
    <form action={formAction} className="grid gap-6 sm:grid-cols-2">
      <input type="hidden" name="tenantSlug" value={tenantSlug} />

      <div className="space-y-4">
        <Field label="Primary colour" name="primaryHex" value={primary} onChange={setPrimary} />
        <Field label="Accent colour" name="accentHex" value={accent} onChange={setAccent} />

        {state.error && (
          <p role="alert" className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
            {state.error}
          </p>
        )}
        {state.ok && (
          <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">
            Saved. Reload a portal to see it applied everywhere.
          </p>
        )}

        <SaveButton />
      </div>

      <TenantThemeProvider theme={{ primaryHex: primary, accentHex: accent }}>
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-fg">Preview</p>
          <div className="mt-3 space-y-2">
            <span className="block w-full rounded-md bg-primary py-2 text-center text-sm font-semibold text-primary-fg">
              Primary button
            </span>
            <span className="block w-full rounded-md border border-primary py-2 text-center text-sm font-semibold text-primary">
              Secondary
            </span>
            <span className="inline-block rounded bg-accent/15 px-2 py-1 text-xs font-medium text-accent">
              Accent badge
            </span>
          </div>
        </div>
      </TenantThemeProvider>
    </form>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded border border-border bg-surface"
          aria-label={`${label} picker`}
        />
        <input
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-32 rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </label>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-fg disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save changes"}
    </button>
  );
}
