export type PlanTier = "BASIC" | "POLYCLINIC" | "ENTERPRISE";

export interface PlanConfig {
  id: string;
  tier: PlanTier;
  name: string;
  priceLabel: string;
  cadence: string;
  seats: number;
  /** Env var holding the Stripe Price id for this plan. */
  stripePriceEnv: string;
  blurb: string;
  features: string[];
  featured?: boolean;
  contactSales?: boolean;
}

export const PLANS: PlanConfig[] = [
  {
    id: "basic",
    tier: "BASIC",
    name: "Basic",
    priceLabel: "$149",
    cadence: "/ month",
    seats: 10,
    stripePriceEnv: "STRIPE_PRICE_BASIC",
    blurb: "Single-site clinics getting off paper.",
    features: ["1 location", "Up to 10 staff", "EHR + scheduling", "Card payments", "Email support"],
  },
  {
    id: "polyclinic",
    tier: "POLYCLINIC",
    name: "Polyclinic",
    priceLabel: "$499",
    cadence: "/ month",
    seats: 50,
    stripePriceEnv: "STRIPE_PRICE_POLYCLINIC",
    blurb: "Multi-department clinics and day hospitals.",
    features: [
      "Up to 5 locations",
      "Unlimited staff",
      "Billing + inventory",
      "Custom theming",
      "Priority support",
    ],
    featured: true,
  },
  {
    id: "enterprise",
    tier: "ENTERPRISE",
    name: "Enterprise",
    priceLabel: "Custom",
    cadence: "",
    seats: 1000,
    stripePriceEnv: "STRIPE_PRICE_ENTERPRISE",
    blurb: "Hospital groups with compliance needs.",
    features: ["Unlimited locations", "SSO / SAML", "Audit + data residency", "Dedicated CSM", "99.9% SLA"],
    contactSales: true,
  },
];

export function getPlan(id: string): PlanConfig | undefined {
  return PLANS.find((p) => p.id === id);
}
