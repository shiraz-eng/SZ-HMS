"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid h-dvh place-items-center bg-canvas p-8 text-center">
      <div className="max-w-sm">
        <h1 className="text-base font-semibold text-danger">Couldn&rsquo;t load this record</h1>
        <p className="mt-1 text-sm text-muted-fg">
          The patient chart failed to open. This does not affect saved data.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-fg hover:opacity-95"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
