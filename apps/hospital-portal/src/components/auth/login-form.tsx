"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@szhms/ui";

type Role = "doctor" | "patient" | "reception" | "admin";

const ROLE_HOME: Record<Role, string> = {
  doctor: "doctor",
  patient: "patient",
  reception: "reception",
  admin: "admin",
};

/**
 * Demo-only auth. Phase 2 replaces `resolveRole` with a real credential check
 * (Auth.js) + a server action that sets the session cookie and redirects.
 * For now, type an email that starts with the role, e.g. `doctor@demo.io`.
 */
function resolveRole(email: string): Role | null {
  const local = email.split("@")[0]?.toLowerCase() ?? "";
  return (["doctor", "patient", "reception", "admin"] as Role[]).find((r) =>
    local.startsWith(r),
  ) ?? null;
}

export function LoginForm({ tenantId }: { tenantId: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const role = resolveRole(email);
    if (!role || password.length < 4) {
      setError("Invalid credentials. Try doctor@demo.io / any 4+ char password.");
      return;
    }
    setPending(true);
    router.push(`/${tenantId}/${ROLE_HOME[role]}`);
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Email</span>
        <input
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="doctor@demo.io"
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Password</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </label>

      {error && (
        <p role="alert" className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

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

      <p className="text-center text-xs text-muted-fg">
        Roles: <code>doctor@</code>, <code>reception@</code>, <code>patient@</code>,{" "}
        <code>admin@</code>
      </p>
    </form>
  );
}
