"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-fg print:hidden"
    >
      Print / Save as PDF
    </button>
  );
}
