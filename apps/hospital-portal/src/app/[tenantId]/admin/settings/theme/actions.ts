"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@szhms/database";
import { requireRole } from "@/lib/auth";
import { getTenantBySlug } from "@/lib/tenant";

const hex = z.string().regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Enter a hex colour");

const schema = z.object({
  tenantSlug: z.string().min(1),
  primaryHex: hex,
  accentHex: hex,
});

export interface ThemeState {
  ok?: boolean;
  error?: string;
}

export async function saveTheme(_prev: ThemeState, formData: FormData): Promise<ThemeState> {
  const parsed = schema.safeParse({
    tenantSlug: formData.get("tenantSlug"),
    primaryHex: formData.get("primaryHex"),
    accentHex: formData.get("accentHex"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { tenantSlug, primaryHex, accentHex } = parsed.data;
  await requireRole(tenantSlug, "ADMIN");

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return { error: "Unknown hospital." };

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: { primaryHex, accentHex },
  });

  revalidatePath(`/${tenantSlug}`, "layout");
  return { ok: true };
}
