"use client";

import { useTransition } from "react";
import { setStaffActive } from "@/app/[tenantId]/admin/staff/actions";

export function StaffRowActions({
  tenantSlug,
  userId,
  isActive,
}: {
  tenantSlug: string;
  userId: string;
  isActive: boolean;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => void setStaffActive(tenantSlug, userId, !isActive))}
      className="rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:bg-muted disabled:opacity-60"
    >
      {pending ? "…" : isActive ? "Deactivate" : "Reactivate"}
    </button>
  );
}
