import { notFound } from "next/navigation";
import { EhrWorkspace } from "@/components/doctor/ehr/ehr-workspace";
import { getEhrBootstrap } from "@/components/doctor/ehr/mock";

export default async function PatientEhrPage({
  params,
}: {
  params: Promise<{ tenantId: string; patientId: string }>;
}) {
  const { tenantId, patientId } = await params;
  const data = await getEhrBootstrap(tenantId, patientId);
  if (!data) notFound();

  return (
    <EhrWorkspace
      patient={data.patient}
      vitals={data.vitals}
      problems={data.problems}
      medications={data.medications}
      encounters={data.encounters}
      initialNote={data.note}
    />
  );
}
