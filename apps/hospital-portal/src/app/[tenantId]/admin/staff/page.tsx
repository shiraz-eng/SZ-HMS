import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenant";
import { getStaff } from "@/lib/admin";
import { AddStaffForm } from "@/components/admin/add-staff-form";
import { StaffRowActions } from "@/components/admin/staff-row-actions";

const ROLE_TONE: Record<string, string> = {
  ADMIN: "bg-primary/10 text-primary",
  DOCTOR: "bg-accent/15 text-accent",
  RECEPTIONIST: "bg-warning/15 text-warning",
  PATIENT: "bg-muted text-muted-fg",
};

export default async function StaffPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const tenant = await getTenantBySlug(tenantId);
  if (!tenant) notFound();

  const staff = await getStaff(tenant.id);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Staff</h1>

      <section className="rounded-lg border border-border bg-surface p-4 shadow-card">
        <p className="mb-3 text-sm font-semibold">Add staff member</p>
        <AddStaffForm tenantSlug={tenantId} />
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-fg">
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">Joined</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2 font-medium">{s.name}</td>
                <td className="px-4 py-2 text-muted-fg">{s.email}</td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${ROLE_TONE[s.role]}`}
                  >
                    {s.role}
                  </span>
                </td>
                <td className="px-4 py-2 tabular-nums text-muted-fg">{s.joined}</td>
                <td className="px-4 py-2">
                  <span className={s.isActive ? "text-success" : "text-muted-fg"}>
                    {s.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <StaffRowActions tenantSlug={tenantId} userId={s.id} isActive={s.isActive} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
