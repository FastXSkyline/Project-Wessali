# Wessali — System Architecture

**Version:** 0.1 · **Status:** Proposed implementation architecture

## Technology

| Layer | Technology | Responsibility |
|---|---|---|
| Mobile | React Native + Expo + TypeScript | Android/iOS customer and provider experiences |
| Admin | Next.js App Router + TypeScript | Operations dashboard |
| API | NestJS + TypeScript | REST API and business rules |
| Worker | Node.js + BullMQ | Background queue consumers |
| Contracts | Zod + TypeScript | Shared validation and types |
| Database | PostgreSQL + PostGIS | Transactions and spatial search |
| Queue/cache | Redis + BullMQ | Background work and coordination |
| Realtime (planned) | WebSockets / Socket.IO | Authorized booking/tracking updates |
| Storage (planned) | Private S3-compatible storage | Documents and attachments |
| Workspace | pnpm + Turborepo | Monorepo management |
| Local infrastructure | Docker Compose | PostgreSQL/PostGIS and Redis |
| CI | GitHub Actions | Install, lint, typecheck, tests, builds |

## System shape

Start with a **modular monolith** API plus a separately runnable worker. Keep freight, roadside, and water rules in separate backend modules while sharing identity, bookings, matching infrastructure, notification events, and auditing. Do not split into microservices until measured load or team ownership justifies it.

~~~mermaid
flowchart TD
    M[Expo mobile app<br/>Customer and Provider modes]
    W[Next.js admin web]
    API[NestJS API]
    WORKER[BullMQ worker]
    DB[(PostgreSQL + PostGIS)]
    REDIS[(Redis)]
    STORE[(Private object storage)]
    MAPS[Maps / Geocoding / Routing]
    PUSH[Push / SMS providers]
    M -->|HTTPS REST| API
    W -->|HTTPS REST| API
    API --> DB
    API --> REDIS
    API --> STORE
    API --> MAPS
    WORKER --> REDIS
    WORKER --> PUSH
~~~

## Monorepo layout

~~~text
Project-Wessali/
├── apps/
│   ├── mobile/                 # Expo Android/iOS app
│   ├── admin/                  # Next.js operations dashboard
│   ├── api/                    # NestJS REST API
│   └── worker/                 # BullMQ queue consumers
├── packages/
│   ├── contracts/              # Shared Zod schemas and domain types
│   ├── i18n/                   # ar, fr, en translations
│   └── design-tokens/          # Brand, spacing, and radius tokens
├── infra/db/migrations/        # Versioned PostgreSQL migrations
└── docs/
~~~

Share API contracts, translations, design tokens, and platform-independent utilities. Do not force React Native UI components into the Next.js app.

## Backend module boundaries

Auth/Users, Providers, Vehicles/Equipment, Service Catalog, Service Areas, Availability, Bookings, Freight, Roadside, Water, Matching, Tracking, Pricing, Payments, Notifications, Reviews, Support, Admin, and Audit should have distinct domain boundaries. Controllers delegate to domain services.

## Data and transaction rules

Use UUID identifiers, UTC timestamps, explicit currency (DZD initially), and integer minor-unit amounts. Service-specific fields belong in typed detail tables rather than unvalidated JSON blobs when they need filtering/reporting.

PostGIS uses consistent SRID 4326 GPS inputs and indexed spatial columns. Use GiST indexes and index-aware operations such as ST_DWithin. Straight-line distance and driving ETA are distinct metrics.

Use transactions for provider assignment and ledger changes. Concurrent offer acceptance must result in one winning assignment only.

## Matching

1. Read booking and service-specific requirements.
2. Filter approved providers and approved capabilities.
3. Exclude suspended, offline, unavailable, or capacity-incompatible providers.
4. Filter by coverage and geographic/route compatibility.
5. Rank candidates using configurable server-side policy.
6. Create offers/notifications.
7. Atomically accept one provider.
8. Record the decision and booking event.

Freight ranking can include route direction/return-trip fit. Roadside prioritizes capability and response proximity. Water prioritizes tanker capacity, coverage, quantity, and declared water category.

## API conventions

- REST prefix: /v1.
- JSON request/response bodies.
- OpenAPI is the API contract.
- Server-side validation and authorization for protected operations.
- Stable machine-readable error codes.
- Idempotency support for booking creation and retry-sensitive changes.

Initial endpoint groups: auth, me, providers, vehicles, service-areas, availability, bookings, freight, roadside, water, offers, tracking, payments, reviews, support, and admin.

The initial API scaffold currently exposes only /v1/health and /v1/services. Remaining routes are planned, not implemented.

## Background jobs

BullMQ is intended for push/SMS dispatch, offer/request expiry, reminders, attachment processing, periodic coverage tasks, payment reconciliation, and metrics. Processors must be retry-safe and idempotent. The current worker is a queue listener shell; notification delivery integrations are not configured.

## Localization

Shared dictionaries live in packages/i18n. Arabic switches the interface to RTL; French and English use LTR. API returns stable codes/identifiers, and clients render localized strings. Missing keys should be caught by type checks/tests.

## External providers

Keep map/routing, SMS, push, and object-storage services behind adapters. Evaluate against Algerian coverage, Arabic/French quality, cost, rate limits, licensing, and operational support.

## Security boundaries

- Browser and mobile clients are untrusted.
- Authentication identifies the caller; backend authorization determines permitted actions.
- Provider eligibility is checked server-side.
- Admin roles are least-privilege.
- Documents are stored privately and served with short-lived authorization.
- Precise provider location is available only to authorized participants during an active booking.
- Secrets are injected at runtime and never committed.
- Audit important admin, booking, and financial operations.
- Define retention/deletion rules for documents and location samples.

## Testing and deployment

Use local, staging, and production environments. Local development uses Docker Compose for PostGIS and Redis. Production also needs API/worker runtimes, backed-up PostgreSQL, Redis, private storage, admin hosting, TLS, logs, metrics, monitoring, and incident procedures.

Test domain rules, authorization, schema validation, state transitions, PostGIS queries, concurrent acceptance, booking workflows, RTL/LTR rendering, and WebSocket access when realtime is introduced. Never log OTPs, tokens, identity documents, or unnecessary precise location.

## Architecture rules

1. Business rules live in backend domain services.
2. Keep shared lifecycle separate from service-specific details.
3. Every database change is a migration.
4. Never commit secrets or personal documents.
5. Treat location as sensitive information.
6. Do not add microservices without a demonstrated need.
7. Record material changes in DECISIONS.md.
