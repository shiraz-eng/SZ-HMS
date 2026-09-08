import Link from "next/link";
import { listTenants } from "@/lib/tenant";

/**
 * Apex host (no tenant subdomain). In production this would redirect to the
 * marketing site; in dev it's a handy directory of seeded demo tenants.
 */
export default async function ApexPage() {
  const tenants = await listTenants();

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-8 px-6 py-16">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">SZ HMS</p>
        <h1 className="mt-2 text-3xl font-semibold">Smarter Care. Seamless Operations.</h1>
        <p className="mt-2 text-muted-fg">
          Multi-tenant hospital management shell. Pick a demo hospital to enter its white-labeled
          portal.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {tenants.map((t) => (
          <li key={t.slug}>
            <Link
              href={`/${t.slug}/login`}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 shadow-card transition-colors hover:border-primary"
            >
              <span
                className="grid h-9 w-9 place-items-center rounded-md text-sm font-bold text-primary-fg"
                style={{ backgroundColor: t.theme.primaryHex }}
              >
                {t.name.slice(0, 1)}
              </span>
              <span>
                <span className="block text-sm font-medium">{t.name}</span>
                <span className="block text-xs text-muted-fg">
                  {t.slug}.szhms.com
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="text-xs text-muted-fg">
        Direct link to the EHR reference screen:{" "}
        <Link className="text-primary underline" href="/demo/doctor/patients/pt_1042">
          /demo/doctor/patients/pt_1042
        </Link>
      </p>
    </main>
  );
}
