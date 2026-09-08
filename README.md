# SZ HMS — _Smarter Care. Seamless Operations._

Multi-tenant B2B SaaS Hospital Management System. Turborepo monorepo: a public
marketing site and a white-labeled hospital portal sharing one design system.

## Prerequisites

Node.js is **not currently installed on this machine**. Install it first:

```bash
winget install OpenJS.NodeJS.LTS
```

Then restart the terminal and enable pnpm:

```bash
corepack enable
```

## Install & run

```bash
pnpm install
pnpm dev
```

| App               | URL                     | Purpose                                  |
| ----------------- | ----------------------- | --------------------------------------- |
| `marketing-site`  | http://localhost:3000   | B2B storefront, pricing, checkout        |
| `hospital-portal` | http://localhost:3001   | The multi-tenant SaaS shell             |

Run one at a time with `pnpm dev:marketing` or `pnpm dev:portal`.

### Trying the portal

Tenants are resolved from the subdomain in production (`mercy.szhms.com`). In dev,
use either form:

- http://localhost:3001/demo/login — explicit tenant segment
- http://demo.localhost:3001 — subdomain (middleware rewrites it)

Seeded demo tenants: `demo`, `mercy`, `st-lukes`.

**Login** — the demo auth routes by email prefix. Use any 4+ char password with:
`doctor@demo.io`, `reception@demo.io`, `patient@demo.io`, `admin@demo.io`.

### Reference screen — Doctor Portal EHR

http://localhost:3001/demo/doctor/patients/pt_1042

The 3-column EHR (`src/components/doctor/ehr/`) is the design standard: all colour
via CSS-variable Tailwind tokens, persistent patient header, independently
scrolling columns on `xl+`, segmented switch below that, debounced autosave stub.

## Structure

```
apps/
  marketing-site/     Next.js App Router — public site
  hospital-portal/    Next.js App Router — [tenantId] routing + role portals
packages/
  ui/                 design tokens, Tailwind preset, TenantThemeProvider, cn()
```

### Theming

`packages/ui/src/styles/globals.css` defines token defaults. `TenantThemeProvider`
converts a hospital's hex colours to RGB channels and overrides the CSS variables
for its subtree — one component tree, every white-label. The Doctor Portal opts
into a calmer variant with `data-portal="doctor"`.

## Roadmap

1. **Foundation & data layer** — _this scaffold_ + Prisma schema (`Tenants`, `Users`)
2. **Multi-tenancy, auth & theming** — real `middleware` + Auth.js + tenant-safe DB client
3. **Marketing & billing** — Stripe/PayPal, webhook-driven tenant provisioning
4. **Core portals** — Patients/Doctors/Appointments/Records/Billing + server actions
5. **Admin, analytics & hardening** — Chart.js/D3 widgets, audit logs, tests, deploy

## What's implemented now

- ✅ Monorepo + shared design system + tenant theming
- ✅ `middleware.ts` subdomain → `[tenantId]` rewrite
- ✅ White-labeled unified login with role routing (demo auth)
- ✅ **Doctor Portal**: queue sidebar + full 3-column EHR
- 🟡 Patient / Reception / Admin: styled route stubs (layouts + representative pages)
- ⬜ Database, real auth, payments, charts — later phases
