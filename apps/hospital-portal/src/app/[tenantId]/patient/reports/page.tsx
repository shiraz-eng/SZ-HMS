import Link from "next/link";
import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenant";
import { requireRole } from "@/lib/auth";
import { getPatientReports } from "@/lib/patient";

export default async function PatientReports({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const tenant = await getTenantBySlug(tenantId);
  if (!tenant) notFound();
  const user = await requireRole(tenantId, "PATIENT");
  const reports = await getPatientReports(tenant.id, user.userId);

  return (
    <div className="space-y-3 py-2">
      <h1 className="text-base font-semibold">Lab reports &amp; visit summaries</h1>

      <ul className="space-y-2">
        {reports.map((r) => (
          <li key={r.id} className="rounded-xl border border-border bg-surface p-3 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{r.title}</span>
              <span className="text-xs tabular-nums text-muted-fg">{r.date}</span>
            </div>
            <p className="mt-1 line-clamp-2 text-xs text-muted-fg">{r.assessment}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] text-muted-fg">{r.labs} lab order(s)</span>
              <Link
                href={`/${tenantId}/patient/reports/${r.id}`}
                className="rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:bg-muted"
              >
                View / print PDF
              </Link>
            </div>
          </li>
        ))}
        {reports.length === 0 && (
          <li className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-fg">
            No signed reports yet.
          </li>
        )}
      </ul>
    </div>
  );
}
