import type { Metadata } from "next";
import { PricingTable } from "@/components/marketing/pricing-table";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Pricing</h1>
      <p className="mt-2 max-w-xl text-muted-fg">
        Every plan includes the full portal suite. You&rsquo;re billed per hospital; add locations
        as you grow. Checkout is handled by Stripe (wired in Phase 3).
      </p>
      <div className="mt-12">
        <PricingTable />
      </div>

      <section className="mt-16 grid gap-6 rounded-2xl border border-border bg-surface p-8 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold">What counts as a location?</h2>
          <p className="mt-1 text-sm text-muted-fg">
            Any physical site with its own front desk and schedule.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Can we migrate our data?</h2>
          <p className="mt-1 text-sm text-muted-fg">
            Yes — CSV and HL7/FHIR imports are included on Polyclinic and Enterprise.
          </p>
        </div>
      </section>
    </main>
  );
}
