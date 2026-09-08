import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenant";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

/**
 * Unified, white-labeled login. One screen for every role — the submitted
 * credentials determine which sub-portal the user lands in (see LoginForm).
 */
export default async function LoginPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const tenant = await getTenantBySlug(tenantId);
  if (!tenant) notFound();

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-fg lg:flex">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-primary-fg/15 text-sm font-bold">
            {tenant.logoText}
          </span>
          <span className="font-semibold">{tenant.name}</span>
        </div>
        <div>
          <h1 className="text-3xl font-semibold leading-tight">
            Smarter Care.
            <br />
            Seamless Operations.
          </h1>
          <p className="mt-3 max-w-sm text-primary-fg/80">
            One secure workspace for doctors, reception, patients, and administration.
          </p>
        </div>
        <p className="text-xs text-primary-fg/60">Powered by SZ HMS</p>
      </aside>

      {/* Form */}
      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="font-semibold">{tenant.name}</span>
          </div>
          <h2 className="text-xl font-semibold">Sign in to your portal</h2>
          <p className="mt-1 text-sm text-muted-fg">
            Use your staff or patient credentials.
          </p>
          <LoginForm tenantId={tenant.slug} />
        </div>
      </main>
    </div>
  );
}
