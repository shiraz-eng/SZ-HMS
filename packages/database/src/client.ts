import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Unscoped Prisma client singleton. Use this only for:
 *  - tenant resolution (looking up a Tenant by slug)
 *  - provisioning (creating a new tenant + its first admin)
 *  - webhook handlers
 *
 * Everything inside a tenant portal must go through `forTenant()`.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
