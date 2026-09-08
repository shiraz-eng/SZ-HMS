import Link from "next/link";

export default async function CheckoutSuccess({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const { slug } = await searchParams;
  const portalUrl =
    process.env.NEXT_PUBLIC_PORTAL_URL ??
    (slug ? `http://${slug}.localhost:3001` : "http://localhost:3001");

  return (
    <main className="mx-auto max-w-md px-6 py-24 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-success/10 text-success">
        ✓
      </div>
      <h1 className="mt-4 text-2xl font-semibold">Your workspace is ready</h1>
      <p className="mt-2 text-sm text-muted-fg">
        Payment confirmed{slug ? ` for ${slug}.szhms.com` : ""}. Sign in with the admin
        email and password you just chose.
      </p>
      <Link
        href={`${portalUrl}/${slug ?? ""}/login`}
        className="mt-6 inline-block rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg"
      >
        Go to your portal
      </Link>
      <p className="mt-3 text-xs text-muted-fg">
        Activation can take a few seconds while we finish provisioning.
      </p>
    </main>
  );
}
