import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas p-8 text-center">
      <div>
        <p className="text-sm font-semibold text-primary">404</p>
        <h1 className="mt-1 text-lg font-semibold">Hospital or page not found</h1>
        <p className="mt-1 text-sm text-muted-fg">Check the subdomain and try again.</p>
        <Link href="/" className="mt-4 inline-block text-sm text-primary underline">
          Back to directory
        </Link>
      </div>
    </main>
  );
}
