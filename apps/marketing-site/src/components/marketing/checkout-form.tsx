"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { startCheckout, type CheckoutState } from "@/app/checkout/actions";

const initial: CheckoutState = {};

const inputCls =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export function CheckoutForm({ planId }: { planId: string }) {
  const [state, formAction] = useActionState(startCheckout, initial);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="planId" value={planId} />

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Hospital name</span>
        <input name="hospitalName" required className={inputCls} placeholder="Mercy Clinic" />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Subdomain</span>
        <div className="flex items-center gap-2">
          <input name="subdomain" required className={inputCls} placeholder="mercy" />
          <span className="text-sm text-muted-fg">.szhms.com</span>
        </div>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Your name</span>
          <input name="adminName" required className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Work email</span>
          <input name="adminEmail" type="email" required className={inputCls} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Password</span>
          <input name="password" type="password" required minLength={8} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Confirm password</span>
          <input name="confirm" type="password" required minLength={8} className={inputCls} />
        </label>
      </div>

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
      {pending ? "Redirecting to Stripe…" : "Continue to payment"}
    </button>
  );
}
