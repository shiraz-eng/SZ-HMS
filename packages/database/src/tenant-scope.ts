/**
 * Pure tenant-scoping logic — no Prisma import, so it is unit-testable without a
 * generated client. `tenant-client.ts` wires this into a real `$extends`.
 */

export const TENANT_SCOPED_MODELS = new Set<string>([
  "User",
  "Doctor",
  "Receptionist",
  "Patient",
  "Appointment",
  "MedicalRecord",
  "Billing",
  "Subscription",
  "Bed",
  "AuditLog",
]);

const WHERE_OPS = new Set([
  "findFirst",
  "findFirstOrThrow",
  "findUnique",
  "findUniqueOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
  "update",
  "updateMany",
  "delete",
  "deleteMany",
  "upsert",
]);

export class TenantContextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TenantContextError";
  }
}

/**
 * Given the args for a Prisma operation on `model`, return a copy scoped to
 * `tenantId`: `where.tenantId` forced on reads/writes, `data.tenantId` set on
 * creates. A filter naming a different tenant throws.
 */
export function scopeArgs(
  model: string,
  operation: string,
  args: unknown,
  tenantId: string,
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...((args as Record<string, unknown>) ?? {}) };
  if (!TENANT_SCOPED_MODELS.has(model)) return next;

  if (WHERE_OPS.has(operation)) {
    const where = { ...((next.where as Record<string, unknown> | undefined) ?? {}) };
    if (typeof where.tenantId === "string" && where.tenantId !== tenantId) {
      throw new TenantContextError(
        `Cross-tenant ${operation} on ${model} blocked (filter tenantId mismatch)`,
      );
    }
    where.tenantId = tenantId;
    next.where = where;
  }

  if (operation === "create") {
    next.data = { ...((next.data as Record<string, unknown>) ?? {}), tenantId };
  } else if (operation === "upsert") {
    next.create = { ...((next.create as Record<string, unknown>) ?? {}), tenantId };
  } else if (operation === "createMany") {
    const data = next.data;
    next.data = Array.isArray(data)
      ? data.map((row) => ({ ...(row as Record<string, unknown>), tenantId }))
      : { ...((data as Record<string, unknown>) ?? {}), tenantId };
  }

  return next;
}
