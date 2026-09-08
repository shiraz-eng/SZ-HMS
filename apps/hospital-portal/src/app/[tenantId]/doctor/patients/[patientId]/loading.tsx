export default function Loading() {
  return (
    <div className="flex h-dvh flex-col bg-canvas">
      <div className="h-[57px] border-b border-border bg-surface" />
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-px bg-border xl:grid-cols-[minmax(300px,340px)_minmax(0,1fr)_minmax(320px,380px)]">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-3 bg-canvas p-4">
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="h-24 animate-pulse rounded-lg bg-muted" />
            <div className="h-24 animate-pulse rounded-lg bg-muted" />
            <div className="h-24 animate-pulse rounded-lg bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
