import Link from "next/link";
import { cn } from "@szhms/ui";

export interface Plan {
  id: string;
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  features: string[];
  featured?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: "$149",
    cadence: "/ month",
    blurb: "Single-site clinics getting off paper.",
    features: ["1 location", "Up to 10 staff", "EHR + scheduling", "Card payments", "Email support"],
  },
  {
    id: "polyclinic",
    name: "Polyclinic",
    price: "$499",
    cadence: "/ month",
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
    name: "Enterprise",
    price: "Custom",
    cadence: "",
    blurb: "Hospital groups with compliance needs.",
    features: [
      "Unlimited locations",
      "SSO / SAML",
      "Audit + data residency",
      "Dedicated CSM",
      "99.9% SLA",
    ],
  },
];

export function PricingTable() {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {PLANS.map((p) => (
        <div
          key={p.id}
          className={cn(
            "flex flex-col rounded-2xl border bg-surface p-6 shadow-card",
            p.featured ? "border-primary ring-1 ring-primary" : "border-border",
          )}
        >
          {p.featured && (
            <span className="mb-3 inline-block w-fit rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              Most popular
            </span>
          )}
          <h3 className="text-sm font-semibold">{p.name}</h3>
          <p className="mt-2">
            <span className="text-3xl font-semibold">{p.price}</span>
            <span className="text-sm text-muted-fg">{p.cadence}</span>
          </p>
          <p className="mt-1 text-sm text-muted-fg">{p.blurb}</p>

          <ul className="mt-5 flex-1 space-y-2 text-sm">
            {p.features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {f}
              </li>
            ))}
          </ul>

          <Link
            href={p.id === "enterprise" ? "/#demo" : `/checkout?plan=${p.id}`}
            className={cn(
              "mt-6 rounded-md px-3 py-2 text-center text-sm font-semibold",
              p.featured
                ? "bg-primary text-primary-fg hover:opacity-95"
                : "border border-border hover:bg-muted",
            )}
          >
            {p.id === "enterprise" ? "Talk to sales" : "Start with " + p.name}
          </Link>
        </div>
      ))}
    </div>
  );
}
