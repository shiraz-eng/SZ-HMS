import { Prisma } from "@prisma/client";
import { prisma } from "./client";
import { TENANT_SCOPED_MODELS, TenantContextError, scopeArgs } from "./tenant-scope";

/**
 * A Prisma client bound to one tenant. Every query on a tenant-scoped model gets
 * `where.tenantId` (and `data.tenantId` on create) forced to this tenant.
 * A filter naming a different tenant throws. See `tenant-scope.ts` for the rules.
 *
 * Requires Prisma >= 5 (non-unique filters allowed in findUnique/update/delete
 * `where`), so a cross-tenant id in a `{ id }` lookup resolves to "not found".
 */
export function forTenant(tenantId: string) {
  if (!tenantId) throw new TenantContextError("forTenant() called without a tenantId");

  return prisma.$extends({
    name: "tenant-isolation",
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!model || !TENANT_SCOPED_MODELS.has(model)) return query(args);
          return query(scopeArgs(model, operation, args, tenantId));
        },
      },
    },
  });
}

export type TenantClient = ReturnType<typeof forTenant>;
export { Prisma, TenantContextError, scopeArgs };
