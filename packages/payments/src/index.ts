export { PLANS, getPlan, type PlanConfig, type PlanTier } from "./plans";
export type {
  CheckoutInput,
  CheckoutResult,
  PaymentEvent,
  PaymentProvider,
} from "./types";
export { stripeProvider } from "./stripe";
export { paypalProvider } from "./paypal";

import { stripeProvider } from "./stripe";
import { paypalProvider } from "./paypal";
import type { PaymentProvider } from "./types";

export function getPaymentProvider(id: string = "stripe"): PaymentProvider {
  if (id === "paypal") return paypalProvider;
  return stripeProvider;
}
