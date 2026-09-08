"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@szhms/ui";
import { login, type LoginState } from "@/app/[tenantId]/login/actions";

const initial: LoginState = {};

export function LoginForm({ tenantId }: { tenantId: string }) {
  const [state, formAction] = useActionState(login, initial);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="tenantSlug" value={tenantId} />

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="username"
          placeholder="doctor@demo.io"
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Password</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </label>

      {state.error && (
        <p role="alert" className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}

      <SubmitButton />

      <p className="text-center text-xs text-muted-fg">
        Demo: <code>admin@demo.io</code> · <code>doctor@demo.io</code> ·{" "}
        <code>reception@demo.io</code> · <code>patient@demo.io</code> — password{" "}
        <code>password</code>
      </p>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "w-full rounded-md bg-primary py-2 text-sm font-semibold text-primary-fg transition-opacity",
        pending ? "opacity-60" : "hover:opacity-95",
      )}
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}
