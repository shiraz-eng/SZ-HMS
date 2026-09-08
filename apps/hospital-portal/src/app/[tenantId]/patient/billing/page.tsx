import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenant";
import { requireRole } from "@/lib/auth";
import { getPatientBills } from "@/lib/patient";
import { PayInvoiceButton } from "@/components/patient/pay-invoice-button";

const STATUS_TONE: Record<string, string> = {
  DRAFT: "bg-muted text-muted-fg",
  ISSUED: "bg-warning/15 text-warning",
  PAID: "bg-success/15 text-success",
  VOID: "bg-muted text-muted-fg",
  REFUNDED: "bg-primary/10 text-primary",
};

export default async function PatientBilling({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const tenant = await getTenantBySlug(tenantId);
  if (!tenant) notFound();
  const user = await requireRole(tenantId, "PATIENT");
  const bills = await getPatientBills(tenant.id, user.userId);

  return (
    <div className="space-y-3 py-2">
      <h1 className="text-base font-semibold">Invoices</h1>

      <ul className="space-y-2">
        {bills.map((b) => (
          <li key={b.id} className="rounded-xl border border-border bg-surface p-3 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{b.invoiceNo}</span>
              <span className="text-sm font-semibold tabular-nums">
                {b.currency} {b.amount}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-muted-fg">{b.date}</span>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${STATUS_TONE[b.status]}`}
                >
                  {b.status}
                </span>
                {b.status === "ISSUED" && (
                  <PayInvoiceButton tenantSlug={tenantId} invoiceId={b.id} />
                )}
              </div>
            </div>
          </li>
        ))}
        {bills.length === 0 && (
          <li className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-fg">
            No invoices.
          </li>
        )}
      </ul>
    </div>
  );
}
