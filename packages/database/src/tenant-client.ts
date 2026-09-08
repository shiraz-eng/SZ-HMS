import { Prisma } from "@prisma/client";
import { prisma } from "./client";

/**
 * Models that carry a `tenantId` column and must never be queried without one.
 * `Tenant` itself and `User` lookups during login are handled by the unscoped
 * client on purpose.
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

const READ_OPS = new Set([
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "findUnique",
  "findUniqueOrThrow",
  "count",
  "aggregate",
  "groupBy",
]);

const WRITE_WITH_WHERE = new Set(["update", "updateMany", "delete", "deleteMany", "upsert"]);

export class TenantContextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TenantContextError";
  }
}

/**
 * Returns a Prisma client bound to a single tenant. Every query against a
 * tenant-scoped model gets `where.tenantId` injected; every create gets
 * `data.tenantId` set. Callers cannot widen the scope — passing a different
 * `tenantId` in a filter throws.
 */
export function forTenant(tenantId: string) {
  if (!tenantId) {
    throw new TenantContextError("forTenant() called without a tenantId");
  }

  return prisma.$extends({
    name: "tenant-isolation",
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!model || !TENANT_SCOPED_MODELS.has(model)) {
            return query(args);
          }

          const next = { ...(args as Record<string, unknown>) };

          if (READ_OPS.has(operation) || WRITE_WITH_WHERE.has(operation)) {
            const where = { ...((next.where as Record<string, unknown> | undefined) ?? {}) };
            if (
              typeof where.tenantId === "string" &&
              where.tenantId !== tenantId
            ) {
              throw new TenantContextError(
                `Cross-tenant ${operation} on ${model} blocked (filter tenantId != context)`,
              );
            }
            where.tenantId = tenantId;
            next.where = where;
          }

          if (operation === "create") {
            next.data = { ...((next.data as Record<string, unknown>) ?? {}), tenantId };
          }

          if (operation === "createMany") {
            const data = next.data;
            next.data = Array.isArray(data)
              ? data.map((row) => ({ ...(row as Record<string, unknown>), tenantId }))
              : { ...((data as Record<string, unknown>) ?? {}), tenantId };
          }

          if (operation === "upsert") {
            next.create = {
              ...((next.create as Record<string, unknown>) ?? {}),
              tenantId,
            };
          }

          return query(next);
        },
      },
    },
  });
}

export type TenantClient = ReturnType<typeof forTenant>;
export { Prisma };
