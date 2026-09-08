import { prisma } from "./client";

export interface AuditEntry {
  tenantId: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  target?: string;
  meta?: Record<string, unknown>;
}

/**
 * Append-only audit trail. Uses the unscoped client (tenantId is always passed
 * explicitly) and never throws into the caller — a failed audit write must not
 * roll back the business action, but it is logged.
 */
export async function recordAudit(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        tenantId: entry.tenantId,
        actorId: entry.actorId,
        actorName: entry.actorName,
        actorRole: entry.actorRole,
        action: entry.action,
        target: entry.target,
        meta: (entry.meta ?? {}) as object,
      },
    });
  } catch (err) {
    console.error("[audit] failed to record", entry.action, err);
  }
}
