export { prisma } from "./client";
export { forTenant, TenantContextError, Prisma, type TenantClient } from "./tenant-client";
export {
  Role,
  Sex,
  PlanTier,
  SubscriptionStatus,
  AppointmentStatus,
  BillingStatus,
  BedStatus,
} from "@prisma/client";
export type {
  Tenant,
  Subscription,
  User,
  Doctor,
  Receptionist,
  Patient,
  Appointment,
  MedicalRecord,
  Billing,
  Bed,
  AuditLog,
} from "@prisma/client";
export { recordAudit } from "./audit";
