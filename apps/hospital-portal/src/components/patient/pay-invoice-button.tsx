"use client";

import { useTransition } from "react";
import { payInvoice } from "@/app/[tenantId]/patient/actions";

export function PayInvoiceButton({
  tenantSlug,
  invoiceId,
}: {
  tenantSlug: string;
  invoiceId: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => void payInvoice(tenantSlug, invoiceId))}
      className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-fg disabled:opacity-60"
    >
      {pending ? "Processing…" : "Pay"}
    </button>
  );
}
