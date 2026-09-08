import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenant";
import { getEhrBootstrap } from "@/lib/ehr";
import { EhrWorkspace } from "@/components/doctor/ehr/ehr-workspace";

export default async function PatientEhrPage({
  params,
}: {
  params: Promise<{ tenantId: string; patientId: string }>;
}) {
  const { tenantId, patientId } = await params;
  const tenant = await getTenantBySlug(tenantId);
  if (!tenant) notFound();

  const data = await getEhrBootstrap(tenant.id, patientId);
  if (!data) notFound();

  return (
    <EhrWorkspace
      tenantSlug={tenantId}
      encounterId={data.patient.encounter.id}
      patient={data.patient}
      vitals={data.vitals}
      problems={data.problems}
      medications={data.medications}
      encounters={data.encounters}
      initialNote={data.note}
      initialPrescriptions={data.prescriptions}
      initialLabOrders={data.labOrders}
    />
  );
}
