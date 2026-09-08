import Link from "next/link";
import { DashboardMockup } from "./dashboard-mockup";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
        <div>
          <span className="inline-block rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-fg">
            Multi-tenant HMS for modern hospitals
          </span>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.1] sm:text-5xl">
            Smarter Care.
            <br />
            Seamless Operations.
          </h1>
          <p className="mt-4 max-w-md text-muted-fg">
            Run clinical, front-desk, and executive workflows on one white-labeled platform. Go live
            on your own subdomain in days, not months.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/#demo"
              className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg hover:opacity-95"
            >
              Book a demo
            </Link>
            <Link
              href="/pricing"
              className="rounded-md border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted"
            >
              View pricing
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-fg">
            SOC 2-ready · HIPAA-aligned · Data residency options
          </p>
        </div>

        <div className="lg:pl-6">
          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}
