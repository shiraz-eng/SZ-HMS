import type { ReactNode } from "react";
import Link from "next/link";

const NAV = [
  { label: "Overview", href: "" },
  { label: "Revenue", href: "/analytics/revenue" },
  { label: "Occupancy", href: "/analytics/occupancy" },
  { label: "Staff", href: "/staff" },
  { label: "Theme", href: "/settings/theme" },
];

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;

  return (
    <div className="grid h-dvh grid-cols-[220px_minmax(0,1fr)] bg-canvas">
      <aside className="flex flex-col border-r border-border bg-surface p-3">
        <span className="px-2 py-1 text-sm font-semibold">Admin</span>
        <nav className="mt-2 space-y-0.5">
          {NAV.map((n) => (
            <Link
              key={n.label}
              href={`/${tenantId}/admin${n.href}`}
              className="block rounded-md px-2 py-1.5 text-sm text-muted-fg hover:bg-muted hover:text-[rgb(var(--color-fg))]"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="min-h-0 overflow-auto p-6">{children}</main>
    </div>
  );
}
