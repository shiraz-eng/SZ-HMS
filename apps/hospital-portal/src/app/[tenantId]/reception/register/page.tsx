import type { Metadata } from "next";
import { RegisterPatientForm } from "@/components/reception/register-patient-form";

export const metadata: Metadata = { title: "Register patient" };

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-lg font-semibold">Register a patient</h1>
      <p className="mt-1 text-sm text-muted-fg">
        Three quick steps. An MRN is assigned automatically.
      </p>
      <div className="mt-6 rounded-xl border border-border bg-surface p-6 shadow-card">
        <RegisterPatientForm tenantSlug={tenantId} />
      </div>
    </div>
  );
}
