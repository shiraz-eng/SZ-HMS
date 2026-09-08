import { notFound } from "next/navigation";
import Link from "next/link";
import { getTenantBySlug } from "@/lib/tenant";
import { requireRole } from "@/lib/auth";
import { getPatientReport } from "@/lib/patient";
import { PrintButton } from "@/components/patient/print-button";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ tenantId: string; reportId: string }>;
}) {
  const { tenantId, reportId } = await params;
  const tenant = await getTenantBySlug(tenantId);
  if (!tenant) notFound();
  const user = await requireRole(tenantId, "PATIENT");

  const r = await getPatientReport(tenant.id, user.userId, reportId);
  if (!r) notFound();

  return (
    <div className="py-2">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link href={`/${tenantId}/patient/reports`} className="text-sm text-primary underline">
          ← All reports
        </Link>
        <PrintButton />
      </div>

      <article className="rounded-xl border border-border bg-surface p-6 text-sm shadow-card print:border-0 print:shadow-none">
        <header className="mb-4 border-b border-border pb-3">
          <p className="text-xs uppercase tracking-widest text-primary">{tenant.name}</p>
          <h1 className="mt-1 text-lg font-semibold">{r.visit.type} summary</h1>
          <p className="text-xs text-muted-fg">
            {r.patient.name} · MRN {r.patient.mrn} · DOB {r.patient.dob}
          </p>
          <p className="text-xs text-muted-fg">
            {r.visit.date} · {r.visit.doctor}
            {r.visit.specialty ? ` (${r.visit.specialty})` : ""} · signed {r.signedAt}
          </p>
        </header>

        <Section title="Reason for visit">{r.visit.reason || "—"}</Section>
        <Section title="Subjective">{r.note.subjective || "—"}</Section>
        <Section title="Objective">{r.note.objective || "—"}</Section>
        <Section title="Assessment">{r.note.assessment || "—"}</Section>
        <Section title="Plan">{r.note.plan || "—"}</Section>

        <Section title="Diagnoses">
          {r.diagnoses.length
            ? r.diagnoses.map((d) => `${d.code} — ${d.label}`).join("; ")
            : "—"}
        </Section>

        <Section title="Prescriptions">
          {r.prescriptions.length ? (
            <ul className="list-disc pl-5">
              {r.prescriptions.map((p, i) => (
                <li key={i}>
                  {p.drug} {p.strength} · {p.route} {p.frequency} · {p.durationDays} days
                </li>
              ))}
            </ul>
          ) : (
            "—"
          )}
        </Section>

        <Section title="Lab orders">
          {r.labOrders.length
            ? r.labOrders.map((l) => `${l.code} ${l.name} (${l.priority})`).join("; ")
            : "—"}
        </Section>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-3">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-fg">{title}</h2>
      <div className="mt-1 whitespace-pre-wrap leading-relaxed">{children}</div>
    </section>
  );
}
