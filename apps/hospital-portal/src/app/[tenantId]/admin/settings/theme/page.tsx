"use client";

import { useState } from "react";
import { TenantThemeProvider } from "@szhms/ui";

/**
 * Hospital theme customizer. In Phase 5 the "Save" action writes these hex
 * values to the tenant row; here it just previews live via TenantThemeProvider.
 */
export default function ThemeSettingsPage() {
  const [primary, setPrimary] = useState("#2563EB");
  const [accent, setAccent] = useState("#0D9488");

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Portal theme</h1>
        <p className="text-sm text-muted-fg">
          These colours re-skin every portal for your hospital.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-4">
          <Field label="Primary colour" value={primary} onChange={setPrimary} />
          <Field label="Accent colour" value={accent} onChange={setAccent} />
          <button className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-fg">
            Save changes
          </button>
        </div>

        <TenantThemeProvider theme={{ primaryHex: primary, accentHex: accent }}>
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-fg">Preview</p>
            <div className="mt-3 space-y-2">
              <button className="w-full rounded-md bg-primary py-2 text-sm font-semibold text-primary-fg">
                Primary button
              </button>
              <button className="w-full rounded-md border border-primary py-2 text-sm font-semibold text-primary">
                Secondary
              </button>
              <span className="inline-block rounded bg-accent/15 px-2 py-1 text-xs font-medium text-accent">
                Accent badge
              </span>
            </div>
          </div>
        </TenantThemeProvider>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
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
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-32 rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </label>
  );
}
