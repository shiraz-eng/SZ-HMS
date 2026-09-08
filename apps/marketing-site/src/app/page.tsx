import Link from "next/link";
import { Hero } from "@/components/marketing/hero";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { PricingTable } from "@/components/marketing/pricing-table";

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <FeatureGrid />

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-2xl font-semibold">Simple, per-hospital pricing</h2>
          <p className="mt-2 text-muted-fg">Start monthly. Upgrade as you add locations.</p>
          <div className="mt-10">
            <PricingTable />
          </div>
        </div>
      </section>

      <section id="demo" className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-2xl border border-border bg-primary p-10 text-primary-fg">
          <h2 className="text-2xl font-semibold">See SZ HMS with your workflows</h2>
          <p className="mt-2 max-w-xl text-primary-fg/80">
            A 30-minute walkthrough of the doctor, reception, patient, and admin portals.
          </p>
          <Link
            href="/pricing"
            className="mt-6 inline-block rounded-md bg-primary-fg px-4 py-2.5 text-sm font-semibold text-primary"
          >
            Book a demo
          </Link>
        </div>
      </section>
    </main>
  );
}
