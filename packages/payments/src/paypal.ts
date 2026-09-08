import type { CheckoutInput, PaymentEvent, PaymentProvider } from "./types";

/**
 * PayPal driver — interface parity with Stripe so the marketing site can offer
 * it as an alternative. Implement with the Orders v2 / Subscriptions API in a
 * later phase; kept as a typed stub for now.
 */
export const paypalProvider: PaymentProvider = {
  id: "paypal",

  async createCheckoutSession(_input: CheckoutInput) {
    throw new Error("PayPal checkout is not implemented yet");
  },

  async parseWebhook(_payload: string, _signature: string | null): Promise<PaymentEvent> {
    throw new Error("PayPal webhooks are not implemented yet");
  },
};
