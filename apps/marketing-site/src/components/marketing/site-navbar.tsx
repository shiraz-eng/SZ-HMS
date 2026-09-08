import Link from "next/link";

export function SiteNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-xs font-bold text-primary-fg">
            SZ
          </span>
          SZ HMS
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-fg md:flex">
          <Link href="/#features" className="hover:text-[rgb(var(--color-fg))]">
            Features
          </Link>
          <Link href="/pricing" className="hover:text-[rgb(var(--color-fg))]">
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/pricing"
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
          >
            View pricing
          </Link>
          <Link
            href="/#demo"
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-fg hover:opacity-95"
          >
            Book demo
          </Link>
        </div>
      </div>
    </header>
  );
}
