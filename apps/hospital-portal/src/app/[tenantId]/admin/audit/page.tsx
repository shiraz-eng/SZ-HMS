import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenant";
import { getAuditLog } from "@/lib/admin";

export default async function AuditPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const tenant = await getTenantBySlug(tenantId);
  if (!tenant) notFound();

  const rows = await getAuditLog(tenant.id, 150);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Audit log</h1>
      <p className="text-sm text-muted-fg">
        Append-only record of privileged actions. Newest first.
      </p>

      <section className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-fg">
              <th className="px-4 py-2 font-medium">When</th>
              <th className="px-4 py-2 font-medium">Actor</th>
              <th className="px-4 py-2 font-medium">Action</th>
              <th className="px-4 py-2 font-medium">Target</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="whitespace-nowrap px-4 py-2 tabular-nums text-muted-fg">{r.when}</td>
                <td className="px-4 py-2">
                  {r.actor}{" "}
                  <span className="text-[10px] uppercase text-muted-fg">{r.role}</span>
                </td>
                <td className="px-4 py-2 font-mono text-xs">{r.action}</td>
                <td className="px-4 py-2 font-mono text-xs text-muted-fg">{r.target}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-fg">
                  No activity recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
