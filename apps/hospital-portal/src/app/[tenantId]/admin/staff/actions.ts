"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { forTenant, recordAudit } from "@szhms/database";
import { hashPassword } from "@szhms/auth/password";
import { requireRole } from "@/lib/auth";
import { getTenantBySlug } from "@/lib/tenant";

async function ctx(tenantSlug: string) {
  const actor = await requireRole(tenantSlug, "ADMIN");
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) throw new Error("Unknown hospital");
  return { db: forTenant(tenant.id), tenantId: tenant.id, actor };
}

const addSchema = z.object({
  tenantSlug: z.string().min(1),
  name: z.string().min(2).max(80),
  email: z.string().email(),
  role: z.enum(["ADMIN", "DOCTOR", "RECEPTIONIST"]),
  specialty: z.string().max(80).optional().or(z.literal("")),
  licenseNo: z.string().max(60).optional().or(z.literal("")),
});

export interface AddStaffState {
  ok?: boolean;
  error?: string;
  tempPassword?: string;
}

export async function addStaff(_prev: AddStaffState, formData: FormData): Promise<AddStaffState> {
  const parsed = addSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const v = parsed.data;
  const { db, tenantId, actor } = await ctx(v.tenantSlug);

  const existing = await db.user.findFirst({
    where: { email: v.email.toLowerCase() },
    select: { id: true },
  });
  if (existing) return { error: "A user with that email already exists." };

  const tempPassword = randomBytes(6).toString("base64url");

  const user = await db.user.create({
    data: {
      name: v.name,
      email: v.email.toLowerCase(),
      role: v.role,
      passwordHash: await hashPassword(tempPassword),
    },
    select: { id: true },
  });

  if (v.role === "DOCTOR") {
    await db.doctor.create({
      data: {
        userId: user.id,
        specialty: v.specialty || "General Medicine",
        licenseNo: v.licenseNo || `LIC-${randomBytes(3).toString("hex").toUpperCase()}`,
      },
    });
  } else if (v.role === "RECEPTIONIST") {
    await db.receptionist.create({ data: { userId: user.id } });
  }

  await recordAudit({
    tenantId,
    actorId: actor.userId,
    actorName: actor.name,
    actorRole: actor.role,
    action: "staff.created",
    target: v.email.toLowerCase(),
    meta: { role: v.role },
  });

  revalidatePath(`/${v.tenantSlug}/admin/staff`);
  return { ok: true, tempPassword };
}

export async function setStaffActive(
  tenantSlug: string,
  userId: string,
  isActive: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const { db, tenantId, actor } = await ctx(tenantSlug);

  if (userId === actor.userId) return { ok: false, error: "You cannot deactivate yourself." };

  const res = await db.user.updateMany({ where: { id: userId }, data: { isActive } });
  if (res.count === 0) return { ok: false, error: "User not found." };

  await recordAudit({
    tenantId,
    actorId: actor.userId,
    actorName: actor.name,
    actorRole: actor.role,
    action: isActive ? "staff.reactivated" : "staff.deactivated",
    target: userId,
  });

  revalidatePath(`/${tenantSlug}/admin/staff`);
  return { ok: true };
}
