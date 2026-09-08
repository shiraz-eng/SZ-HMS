import Link from "next/link";
import { PLANS } from "@/components/marketing/pricing-table";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan: planId } = await searchParams;
  const plan = PLANS.find((p) => p.id === planId) ?? PLANS[1];

  return (
    <main className="mx-auto max-w-md px-6 py-20">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <p className="mt-1 text-sm text-muted-fg">
        Stripe Checkout redirect is wired in Phase 3 (`packages/payments`).
      </p>

      <div className="mt-8 rounded-xl border border-border bg-surface p-5 shadow-card">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">{plan.name} plan</span>
          <span className="text-sm">
            {plan.price}
            <span className="text-muted-fg">{plan.cadence}</span>
          </span>
        </div>
        <ul className="mt-4 space-y-1.5 text-sm text-muted-fg">
          {plan.features.map((f) => (
            <li key={f}>• {f}</li>
          ))}
        </ul>
        <button
          disabled
          className="mt-6 w-full rounded-md bg-primary py-2 text-sm font-semibold text-primary-fg opacity-60"
        >
          Continue to payment
        </button>
        <Link href="/pricing" className="mt-3 block text-center text-xs text-primary underline">
          Back to plans
        </Link>
      </div>
    </main>
  );
}
