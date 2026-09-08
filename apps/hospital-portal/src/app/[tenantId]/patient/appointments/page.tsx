import Link from "next/link";
import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenant";
import { requireRole } from "@/lib/auth";
import { getPatientAppointments } from "@/lib/patient";

export default async function PatientAppointments({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const tenant = await getTenantBySlug(tenantId);
  if (!tenant) notFound();
  const user = await requireRole(tenantId, "PATIENT");
  const appts = await getPatientAppointments(tenant.id, user.userId);

  return (
    <div className="space-y-3 py-2">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold">My visits</h1>
        <Link
          href={`/${tenantId}/patient/appointments/book`}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-fg"
        >
          Book
        </Link>
      </div>

      <ul className="space-y-2">
        {appts.map((a) => (
          <li key={a.id} className="rounded-xl border border-border bg-surface p-3 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{a.doctor}</span>
              <span className="text-xs tabular-nums text-muted-fg">{a.when}</span>
            </div>
            <div className="mt-0.5 flex items-center justify-between">
              <span className="text-xs text-muted-fg">{a.reason}</span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-fg">
                {a.status.replace("_", " ")}
              </span>
            </div>
          </li>
        ))}
        {appts.length === 0 && (
          <li className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-fg">
            No visits yet.
          </li>
        )}
      </ul>
    </div>
  );
}
