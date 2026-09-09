"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getPlan, getPaymentProvider } from "@szhms/payments";
import { isSlugAvailable, normalizeSlug, provisionTenant } from "@szhms/database/provisioning";

const schema = z
  .object({
    planId: z.string().min(1),
    hospitalName: z.string().min(2).max(80),
    subdomain: z.string().min(2).max(32),
    adminName: z.string().min(2).max(80),
    adminEmail: z.string().email(),
    password: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

export interface CheckoutState {
  error?: string;
}

const ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "szhms.com";

export async function startCheckout(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const data = parsed.data;

  const plan = getPlan(data.planId);
  if (!plan || plan.contactSales) return { error: "Pick a self-serve plan." };

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey || stripeKey === "sk_test_xxx" || !stripeKey.startsWith("sk_")) {
    return {
      error:
        "Payments aren't configured on this environment. Set STRIPE_SECRET_KEY and the STRIPE_PRICE_* vars to enable checkout.",
    };
  }

  const slug = normalizeSlug(data.subdomain);
  if (!(await isSlugAvailable(slug))) {
    return { error: `The subdomain "${slug}" is taken or invalid.` };
  }

  // Create the tenant + admin now (subscription INCOMPLETE); the Stripe webhook
  // flips it to ACTIVE. Password never transits the payment provider.
  const { tenantId } = await provisionTenant({
    slug,
    hospitalName: data.hospitalName,
    tier: plan.tier,
    admin: { name: data.adminName, email: data.adminEmail, password: data.password },
    seats: plan.seats,
    activate: false,
  });

  const origin = process.env.NEXT_PUBLIC_MARKETING_URL ?? "http://localhost:3000";
  const portalBase =
    process.env.NEXT_PUBLIC_PORTAL_URL ?? `http://${slug}.localhost:3001`;

  const { url } = await getPaymentProvider("stripe").createCheckoutSession({
    planId: data.planId,
    tenantId,
    tenantSlug: slug,
    hospitalName: data.hospitalName,
    customerEmail: data.adminEmail,
    successUrl: `${origin}/checkout/success?slug=${slug}`,
    cancelUrl: `${origin}/checkout?plan=${data.planId}`,
  });

  void portalBase; // used on the success page
  redirect(url);
}
