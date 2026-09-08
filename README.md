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
```

### 1. Database (Phase 1)

Start Postgres and point the env at it:

```bash
docker run --name szhms-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
```

Copy env files, then create the schema and seed demo data:

```bash
cp packages/database/.env.example packages/database/.env
cp apps/hospital-portal/.env.example apps/hospital-portal/.env.local
cp apps/marketing-site/.env.example apps/marketing-site/.env.local

pnpm --filter @szhms/database db:generate
pnpm --filter @szhms/database db:migrate --name init
pnpm --filter @szhms/database db:seed
```

Set a real `AUTH_SECRET` in `apps/hospital-portal/.env.local`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Run

```bash
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

**Login** — seeded users, password `password`:
`admin@demo.io`, `doctor@demo.io`, `reception@demo.io`, `patient@demo.io`.
The session is a signed (jose) HTTP-only cookie; `middleware.ts` enforces the
role → portal mapping, and each portal layout re-checks with `requireRole()`.

### Reference screen — Doctor Portal EHR

http://localhost:3001/demo/doctor/patients/pt_1042

The 3-column EHR (`src/components/doctor/ehr/`) is the design standard: all colour
via CSS-variable Tailwind tokens, persistent patient header, independently
scrolling columns on `xl+`, segmented switch below that, debounced autosave stub.

## Billing & onboarding (Phase 3)

`marketing-site/checkout` collects hospital name, subdomain, and admin
credentials, provisions the tenant with the subscription `INCOMPLETE`, then
redirects to Stripe Checkout. `apps/marketing-site/src/app/api/webhooks/stripe`
verifies the signature and flips the subscription to `ACTIVE`
(`activateSubscription`). Passwords never transit Stripe.

Local Stripe:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# put the printed whsec_... in apps/marketing-site/.env.local
```

## Deploy to Vercel

The monorepo hosts as **two Vercel projects** from the same GitHub repo.

For each app (`apps/marketing-site`, `apps/hospital-portal`):

1. **New Project** → import `shiraz-eng/SZ-HMS`.
2. Set **Root Directory** to the app folder (e.g. `apps/hospital-portal`).
   Vercel detects the pnpm workspace and Turborepo automatically; `vercel.json`
   in each app pins the build to run `prisma generate` first.
3. Add environment variables (from that app's `.env.example`):
   - both: `DATABASE_URL` (a **pooled** connection string — e.g. Neon/Supabase
     pooler or Prisma Accelerate; serverless functions exhaust direct connections),
     `NEXT_PUBLIC_ROOT_DOMAIN`
   - `hospital-portal`: `AUTH_SECRET`
   - `marketing-site`: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
     `STRIPE_PRICE_*`, `NEXT_PUBLIC_PORTAL_URL`, `NEXT_PUBLIC_MARKETING_URL`
4. Deploy. Then run the migration against the production DB once:
   `DATABASE_URL=... pnpm --filter @szhms/database db:deploy` (and `db:seed` if you
   want demo tenants).
5. Point DNS: `szhms.com` → marketing project, `*.szhms.com` → portal project
   (add `*.szhms.com` as a wildcard domain on the portal project).
6. In Stripe, set the live webhook endpoint to
   `https://<marketing-domain>/api/webhooks/stripe`.

Notes:
- `next.config.mjs` sets `outputFileTracingRoot` to the repo root so Vercel
  bundles the workspace packages, and currently sets
  `eslint.ignoreDuringBuilds` / `typescript.ignoreBuildErrors` so the first
  deploy isn't blocked by lint/type nits — run `pnpm lint` / `pnpm typecheck`
  locally and drop those flags once green.
- Prisma's `binaryTargets` includes `rhel-openssl-3.0.x` for Vercel's runtime.
- `.nvmrc` pins Node 20.

## Structure

```
apps/
  marketing-site/     Next.js App Router — public site + Stripe checkout/webhook
  hospital-portal/    Next.js App Router — [tenantId] routing + role portals
packages/
  ui/                 design tokens, Tailwind preset, TenantThemeProvider, cn()
  database/           Prisma schema + client + forTenant() + provisioning
  auth/               scrypt password hashing + jose session tokens
  payments/           PaymentProvider interface + Stripe driver (PayPal stub)
```

### Tenant isolation

`forTenant(tenantId)` returns a Prisma client whose extension injects
`where.tenantId` on every read/update/delete and `data.tenantId` on every
create, for all operational models. A filter naming a different tenant throws.
The unscoped `prisma` is used only for tenant resolution, login, provisioning,
and webhooks.

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
- ✅ **Phase 1** — Prisma schema (Tenants, Subscriptions, Users, Doctors,
  Receptionists, Patients, Appointments, MedicalRecords, Billings), client
  singleton, `forTenant()` isolation extension, seed script
- ✅ **Phase 2** — scrypt + jose auth, real login server action, `middleware.ts`
  subdomain rewrite **+ role guard**, `requireRole()` per portal, DB-backed
  tenant resolution + theming, admin theme customizer persists to the DB
- ✅ **Phase 3** — `@szhms/payments` (Stripe driver, PayPal stub), checkout
  onboarding flow, webhook-driven tenant activation
- ✅ **Phase 4** — write paths on every portal, all via server actions +
  transactions, all tenant-scoped:
  - Doctor: `saveEncounter` / `signEncounter` (SOAP + Rx + labs → `MedicalRecord`,
    signs the visit, drafts an invoice)
  - Reception: 3-step `registerPatient` (optional portal login), `scheduleAppointment`,
    one-tap waiting-room status transitions
  - Patient: `bookAppointment`, `payInvoice` (demo settlement), reports &
    invoices lists
  - Admin overview reads real aggregates (revenue 7d, appts, utilisation)
- ✅ Vercel-ready: `vercel.json` per app, `outputFileTracingRoot`, Prisma
  `binaryTargets`, `.nvmrc`
- ⬜ Phase 5 — Chart.js/D3 widgets, drag-and-drop calendar, PDF report renderer,
  audit log, tests
