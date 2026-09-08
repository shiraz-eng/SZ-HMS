import { notFound } from "next/navigation";
import { getPlan } from "@szhms/payments/plans";
import { CheckoutForm } from "@/components/marketing/checkout-form";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan: planId } = await searchParams;
  const plan = getPlan(planId ?? "polyclinic");
  if (!plan || plan.contactSales) notFound();

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-2xl font-semibold">Create your hospital workspace</h1>
      <p className="mt-1 text-sm text-muted-fg">
        {plan.name} plan · {plan.priceLabel}
        {plan.cadence}. You&rsquo;ll be sent to Stripe to confirm payment.
      </p>

      <div className="mt-8 rounded-xl border border-border bg-surface p-6 shadow-card">
        <CheckoutForm planId={plan.id} />
      </div>

      <p className="mt-4 text-xs text-muted-fg">
        Test card <code>4242 4242 4242 4242</code>, any future expiry / CVC.
      </p>
    </main>
  );
}
