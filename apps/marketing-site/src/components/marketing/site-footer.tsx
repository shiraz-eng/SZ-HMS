export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-8 text-sm text-muted-fg sm:flex-row">
        <p>© {new Date().getFullYear()} SZ HMS. Smarter Care. Seamless Operations.</p>
        <p className="flex gap-4">
          <a href="#" className="hover:text-[rgb(var(--color-fg))]">
            Privacy
          </a>
          <a href="#" className="hover:text-[rgb(var(--color-fg))]">
            Terms
          </a>
          <a href="#" className="hover:text-[rgb(var(--color-fg))]">
            Security
          </a>
        </p>
      </div>
    </footer>
  );
}
