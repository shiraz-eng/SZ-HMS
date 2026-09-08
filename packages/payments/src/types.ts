export interface CheckoutInput {
  planId: string;
  tenantId: string;
  tenantSlug: string;
  hospitalName: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResult {
  url: string;
  sessionId: string;
}

/** Normalised event every provider maps its webhook to. */
export type PaymentEvent =
  | {
      type: "checkout.completed";
      tenantId: string;
      externalCustomerId?: string;
      externalSubscriptionId?: string;
      currentPeriodEnd?: Date;
    }
  | { type: "subscription.past_due"; externalSubscriptionId: string }
  | { type: "subscription.canceled"; externalSubscriptionId: string }
  | { type: "ignored"; raw: string };

export interface PaymentProvider {
  readonly id: "stripe" | "paypal";
  createCheckoutSession(input: CheckoutInput): Promise<CheckoutResult>;
  /** Verify signature + normalise. `payload` is the raw request body. */
  parseWebhook(payload: string, signature: string | null): Promise<PaymentEvent>;
}
