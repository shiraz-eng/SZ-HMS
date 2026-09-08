import type { ReactNode } from "react";
import Link from "next/link";

/**
 * Patient Portal shell — mobile-first. Content is a single centered column;
 * primary navigation is a bottom tab bar on small screens.
 */
const TABS = [
  { key: "home", label: "Home", href: "" },
  { key: "appointments", label: "Visits", href: "/appointments" },
  { key: "reports", label: "Reports", href: "/reports" },
  { key: "billing", label: "Bills", href: "/billing" },
];

export default async function PatientLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-canvas">
      <header className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-semibold">My Health</span>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          AO
        </span>
      </header>

      <main className="flex-1 px-4 pb-24">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 mx-auto flex max-w-md items-center justify-around border-t border-border bg-surface px-2 py-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/${tenantId}/patient${t.href}`}
            className="flex flex-1 flex-col items-center gap-0.5 rounded-md py-1 text-[11px] font-medium text-muted-fg hover:text-primary"
          >
            {t.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
