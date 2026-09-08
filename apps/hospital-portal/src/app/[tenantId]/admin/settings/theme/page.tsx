import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenant";
import { ThemeCustomizerForm } from "@/components/admin/theme-customizer-form";

export default async function ThemeSettingsPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const tenant = await getTenantBySlug(tenantId);
  if (!tenant) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Portal theme</h1>
        <p className="text-sm text-muted-fg">
          These colours re-skin every portal for your hospital.
        </p>
      </div>
      <ThemeCustomizerForm
        tenantSlug={tenant.slug}
        initialPrimary={tenant.theme.primaryHex}
        initialAccent={tenant.theme.accentHex ?? "#0D9488"}
      />
    </div>
  );
}
