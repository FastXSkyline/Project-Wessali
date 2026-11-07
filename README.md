# Wessali | وصلي

Wessali is an Algerian digital marketplace concept for logistics, transport, and on-demand field services. It connects customers with eligible service providers through location-aware requests, matching, and job tracking.

## First-release services

1. **Freight transport** — connect merchants, businesses, farmers, and individuals with suitable truck drivers, including opportunities to reduce empty return journeys.
2. **Roadside assistance (dépannage)** — connect stranded drivers with nearby assistance, mechanics, and towing providers.
3. **Water tankers** — connect households and farmers with providers according to delivery location, quantity, and water category.

## Confirmed direction

| Area | Decision |
|---|---|
| Mobile | Android and iOS |
| Administration | Web dashboard |
| Languages | Arabic, French, English |
| First release | All three service lines |
| Market | Algeria |
| Architecture | Shared backend, role-aware mobile app, separate admin web |

The working Arabic spelling in this repository is **وصلي**. The supplied presentation also used **وصلني**; confirm the final spelling and brand identity before public release.

## Technology

- Mobile: React Native + Expo + TypeScript
- Admin: Next.js + TypeScript
- API: NestJS + TypeScript
- Database: PostgreSQL + PostGIS
- Queue: Redis + BullMQ
- Shared validation: Zod
- Monorepo: pnpm workspaces + Turborepo

## Repository layout

~~~text
apps/
  mobile/       Expo Android/iOS app
  admin/        Next.js operations dashboard
  api/          NestJS REST API
  worker/       BullMQ background worker
packages/
  contracts/    Shared domain types and Zod request schemas
  i18n/         Arabic, French, and English strings
  design-tokens/Shared design values
infra/
  db/migrations/Versioned PostgreSQL/PostGIS migrations
docs/           Product, architecture, domain, and delivery documentation
~~~

## Quick start

Requirements: Node.js 24.22.2, pnpm 12.18.0, Git, and Docker Desktop.

~~~bash
pnpm install
~~~

Copy .env.example to .env, then run:

~~~bash
pnpm db:up
pnpm db:migrate
pnpm dev
~~~

Useful checks:

~~~bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm validate
~~~

See docs/LOCAL_DEVELOPMENT.md for platform-specific setup.

## Current implementation status

The repository now contains a local-development MVP slice:

- Customer demo sessions and booking creation for freight, roadside, and water requests.
- Provider applications, admin approval/rejection, request acceptance, and job milestone updates.
- PostgreSQL persistence, booking events, and protected session-token API routes.
- Mobile customer/provider screens and an API-connected admin operations dashboard.
- Arabic, French, and English interface labels for the primary workflows.

The demo sign-in is not phone verification and is disabled when `NODE_ENV=production`. The MVP still does not include production OTP, provider document uploads, automated geospatial matching, live GPS, maps/routing, SMS/push delivery, online payments/payouts, or a production admin identity system. The app is not ready for public launch until those integrations, legal checks, rate limits, monitoring, and security review are completed.

## Team

- Amjad Rziq
- Mazhoud Omar
- Supervisor: الأستاذ رابح بنور

## Product principles

- Arabic RTL and French/English LTR are first-class experiences.
- Provider live location is private and shared only with the assigned customer during an active booking.
- Providers and relevant vehicles/equipment require review before accepting work.
- Prices, quotes, cancellations, and payment status must be clear.
- Enable service areas only when suitable verified providers are available.
