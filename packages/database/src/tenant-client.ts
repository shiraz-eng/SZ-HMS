import { Prisma } from "@prisma/client";
import { prisma } from "./client";

/**
 * Models that carry a `tenantId` column and must never be touched without one.
 * `Tenant` itself and the login `User` lookup use the unscoped client on purpose.
 *
 * Requires Prisma >= 5, where `where` on findUnique/update/delete/upsert accepts
 * additional non-unique filters alongside the unique selector — that is what lets
 * us append `tenantId` to a `{ id }` lookup and have it act as a hard guard
 * (a cross-tenant id simply resolves to "record not found").
 */
const TENANT_SCOPED_MODELS = new Set<string>([
  "User",
  "Doctor",
  "Receptionist",
  "Patient",
  "Appointment",
  "MedicalRecord",
  "Billing",
  "Subscription",
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
 * A Prisma client bound to one tenant. Every query on a tenant-scoped model gets
 * `where.tenantId` (and `data.tenantId` on create) forced to this tenant.
 * Passing a different `tenantId` in a filter throws.
 */
export function forTenant(tenantId: string) {
  if (!tenantId) throw new TenantContextError("forTenant() called without a tenantId");

  return prisma.$extends({
    name: "tenant-isolation",
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!model || !TENANT_SCOPED_MODELS.has(model)) {
            return query(args);
          }

          const next: Record<string, unknown> = { ...(args as Record<string, unknown>) };

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

          if (operation === "create" || operation === "upsert") {
            if (operation === "create") {
              next.data = { ...((next.data as Record<string, unknown>) ?? {}), tenantId };
            } else {
              next.create = { ...((next.create as Record<string, unknown>) ?? {}), tenantId };
            }
          }

          if (operation === "createMany") {
            const data = next.data;
            next.data = Array.isArray(data)
              ? data.map((row) => ({ ...(row as Record<string, unknown>), tenantId }))
              : { ...((data as Record<string, unknown>) ?? {}), tenantId };
          }

          return query(next);
        },
      },
    },
  });
}

export type TenantClient = ReturnType<typeof forTenant>;
export { Prisma };
