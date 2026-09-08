import Stripe from "stripe";
import { getPlan } from "./plans";
import type { CheckoutInput, CheckoutResult, PaymentEvent, PaymentProvider } from "./types";

let _stripe: Stripe | null = null;

function client(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  // Use the account's default API version (avoids a brittle version literal).
  _stripe = new Stripe(key);
  return _stripe;
}

export const stripeProvider: PaymentProvider = {
  id: "stripe",

  async createCheckoutSession(input: CheckoutInput): Promise<CheckoutResult> {
    const plan = getPlan(input.planId);
    if (!plan) throw new Error(`Unknown plan: ${input.planId}`);
    if (plan.contactSales) throw new Error("Enterprise plans go through sales, not checkout");

    const priceId = process.env[plan.stripePriceEnv];
    if (!priceId) throw new Error(`${plan.stripePriceEnv} is not set`);

    const session = await client().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: input.customerEmail,
      client_reference_id: input.tenantId,
      metadata: {
        tenantId: input.tenantId,
        tenantSlug: input.tenantSlug,
        planId: input.planId,
        hospitalName: input.hospitalName,
      },
      subscription_data: {
        metadata: { tenantId: input.tenantId, tenantSlug: input.tenantSlug },
      },
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      allow_promotion_codes: true,
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    return { url: session.url, sessionId: session.id };
  },

  async parseWebhook(payload: string, signature: string | null): Promise<PaymentEvent> {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    if (!signature) throw new Error("Missing stripe-signature header");

    const event = client().webhooks.constructEvent(payload, signature, secret);

    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const tenantId = s.client_reference_id ?? s.metadata?.tenantId;
        if (!tenantId) return { type: "ignored", raw: event.type };
        return {
          type: "checkout.completed",
          tenantId,
          externalCustomerId: typeof s.customer === "string" ? s.customer : undefined,
          externalSubscriptionId:
            typeof s.subscription === "string" ? s.subscription : undefined,
        };
      }
      case "invoice.payment_failed": {
        const inv = event.data.object as unknown as {
          subscription?: string | { id: string } | null;
        };
        const sub =
          typeof inv.subscription === "string"
            ? inv.subscription
            : (inv.subscription?.id ?? null);
        return sub
          ? { type: "subscription.past_due", externalSubscriptionId: sub }
          : { type: "ignored", raw: event.type };
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        return { type: "subscription.canceled", externalSubscriptionId: sub.id };
      }
      default:
        return { type: "ignored", raw: event.type };
    }
  },
};
