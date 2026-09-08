import Link from "next/link";

export function PortalTopbar({
  tenantId,
  portal,
  right,
}: {
  tenantId: string;
  portal: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-2.5">
      <div className="flex items-center gap-2">
        <Link href={`/${tenantId}`} className="text-sm font-semibold">
          SZ HMS
        </Link>
        <span className="text-muted-fg">/</span>
        <span className="text-sm text-muted-fg">{portal}</span>
      </div>
      <div className="flex items-center gap-2">{right}</div>
    </header>
  );
}
