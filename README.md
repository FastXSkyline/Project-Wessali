# Wessali | وصلي

Wessali connects customers with reviewed providers for freight transport, roadside assistance, and water-tanker delivery across Algeria.

## Production platform

The production API, database, private file storage, and operations dashboard run on Cloudflare. The iOS/Android app connects directly to the Cloudflare API; your desktop PC is not required to run the service.

| Component | Production service |
|---|---|
| API + scheduled cleanup | Cloudflare Worker |
| Relational application data | Cloudflare D1 (wessali-production, Western Europe) |
| Private provider documents | Cloudflare R2 (wessali-private-files, Western Europe) |
| Operations dashboard | Worker-hosted web app at /admin |
| Worker observability | Cloudflare Worker logs and traces |
| Mobile | Expo / React Native / TypeScript |

**Production URLs**

- API: https://wessali-platform.anesteb8.workers.dev/v1
- Health check: https://wessali-platform.anesteb8.workers.dev/v1/health
- Operations dashboard: https://wessali-platform.anesteb8.workers.dev/admin

The first administrator must initialize the dashboard once using the one-time bootstrap key supplied separately. Choose a private administrator email and a unique password of at least 12 characters. The bootstrap key is not stored in this repository.

## Production app workflows

- Customer/provider registration and sign-in use an international phone number plus a password. Passwords are salted and hashed on the server; sessions are stored hashed in D1 and the mobile app stores its session in iOS/Android secure storage.
- Provider accounts submit a business application and can accept work only after operations approves their application and service capabilities.
- Customers can create, review, cancel, and follow their bookings.
- Providers can advance an assigned job through its milestones.
- Provider live GPS is opt-in. A provider must start sharing from an active assigned job; the app stops the watch when sharing is stopped, the job completes, or the provider signs out. Customers can see only their own assigned job's recent shared position.
- The administrator dashboard shows active order pins and fresh provider locations, customer/provider accounts, provider applications, payment records, status history, and audit events.
- Location samples older than 30 days are removed by the Worker scheduled task; dashboard/customer views hide provider fixes older than 10 minutes.

**Current integration boundaries:** phone numbers are not yet verified by SMS/OTP; no SMS/push delivery provider or payment gateway/payout provider is connected. Payment tables and admin views are ready to record gateway events, but do not imply that online payment collection is enabled. Matching currently filters providers by approved service capability; automatic distance/ETA ranking, routing/geocoding, and a full customer support messaging channel remain follow-on work.

## Repository layout

~~~text
apps/
  mobile/       Expo customer/provider app
  admin/        Next.js entry point that redirects to the Cloudflare console
  api/          Legacy/local NestJS API scaffold (not the production API)
  worker/       Legacy/local BullMQ worker scaffold
  cloudflare/
    worker/     Deployed Cloudflare Worker and dashboard source
packages/
  contracts/    Shared domain types and Zod request schemas
  i18n/         Arabic, French, and English strings
  design-tokens/Shared design values
infra/
  db/migrations/       Legacy/local PostgreSQL migrations
  d1/migrations/       Cloudflare D1 production schema
docs/                  Product, architecture, and deployment documentation
~~~

## Run the mobile app against production

Requirements: Node.js 24.22.2 and pnpm 12.18.0.

~~~bash
pnpm install
pnpm --filter @wessali/mobile dev
~~~

The mobile app defaults to the Cloudflare production API. It does not require Docker, PostgreSQL, Redis, or a PC-hosted API for normal customer/provider use. The API URL can still be changed from the app's Connection section for testing.

## Local legacy backend development

The older NestJS/PostgreSQL/PostGIS API is retained as a local development/reference environment. It is not the production endpoint used by the app.

Requirements: PostgreSQL with PostGIS. Redis is only needed for the legacy BullMQ worker.

~~~bash
cp .env.example .env
pnpm install
pnpm db:migrate
pnpm dev:core
~~~

Local development auth in the NestJS API is for development only and must never be exposed as a production login system. Cloudflare production authentication is implemented separately in apps/cloudflare/worker/index.js.

## Validation

~~~bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm validate
~~~

See docs/CLOUDFLARE_PRODUCTION.md for the deployed resources, environment bindings, security boundaries, and setup process.

## Team

- Amjad Rziq
- Mazhoud Omar
- Supervisor: الأستاذ رابح بنور

## Product principles

- Arabic RTL and French/English LTR are first-class experiences.
- Provider eligibility is checked server-side.
- Provider location is private, explicitly shared, time-limited, and visible only to authorized participants.
- Prices, quotes, cancellations, and payment state must be clear.
- Keep documents in private object storage and audit operations access.
- Do not commit passwords, access tokens, bootstrap keys, or customer data.
