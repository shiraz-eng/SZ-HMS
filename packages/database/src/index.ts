export { prisma } from "./client";
export { forTenant, TenantContextError, Prisma, type TenantClient } from "./tenant-client";
export {
  Role,
  Sex,
  PlanTier,
  SubscriptionStatus,
  AppointmentStatus,
  BillingStatus,
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
} from "@prisma/client";
