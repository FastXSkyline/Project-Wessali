# Wessali — System Architecture

**Version:** 0.1  
**Status:** Proposed implementation architecture

## 1. Architecture goals

- Deliver Android and iOS mobile applications plus a web operations dashboard.
- Support three service verticals without duplicating authentication, booking, matching, and notification infrastructure.
- Share TypeScript contracts and localization resources where appropriate.
- Support geographic matching and active-job tracking.
- Keep the initial deployment understandable and affordable.
- Allow components to be separated later if measured traffic or team ownership requires it.

## 2. Proposed technology stack

| Layer | Proposed technology | Responsibility |
|---|---|---|
| Mobile | React Native, Expo, TypeScript | Customer and provider experiences on Android/iOS |
| Mobile navigation | Expo Router | Route and navigation structure |
| Admin web | Next.js App Router, TypeScript | Operations dashboard |
| API | NestJS, TypeScript | Authentication, business rules, REST API |
| Worker | NestJS application context | Background jobs and scheduled work |
| API schema | OpenAPI | Documented, versioned API contract |
| Shared validation | Zod | Runtime validation and shared request schemas |
| Database | PostgreSQL | Transactional business data |
| Spatial queries | PostGIS | Provider proximity, service areas, route-related geometry |
| Cache/queue | Redis + BullMQ | Jobs, rate-limit support, short-lived cache |
| Realtime | Socket.IO WebSocket gateway | Authorized booking and location updates |
| File storage | S3-compatible private object storage | Provider documents, request attachments, proof of delivery |
| Package manager | pnpm workspaces | Monorepo dependency management |
| Build orchestration | Turborepo | Workspace task graph and caching |
| Local infrastructure | Docker Compose | PostgreSQL/PostGIS, Redis, local object-storage service if needed |
| CI | GitHub Actions | Lint, typecheck, tests, builds, migration checks |

Versions should be selected from stable releases and pinned together when the scaffold is generated. Do not copy version numbers from an old tutorial.

### Why this stack

- Expo is a React Native framework for Android and iOS and documents workspace-based monorepo support: https://docs.expo.dev/get-started/create-a-project/ and https://docs.expo.dev/guides/monorepos/
- Next.js documents its App Router and Node/Docker deployment options: https://nextjs.org/docs/app/getting-started and https://nextjs.org/docs/app/getting-started/deploying
- NestJS provides modular server-side application structure, WebSocket gateways, and queues: https://docs.nestjs.com/ and https://docs.nestjs.com/websockets/gateways
- PostGIS supports distance queries with ST_DWithin and spatial indexes: https://postgis.net/docs/ST_DWithin.html and https://postgis.net/documentation/faq/spatial-indexes/

## 3. System shape

The initial backend is a **modular monolith** with a separately runnable worker process. This is intentional: one deployable API codebase, one database, clear domain boundaries, and background processing without prematurely introducing multiple independently operated services.

~~~mermaid
flowchart TD
    M[Expo Mobile App<br/>Customer + Provider modes]
    W[Next.js Admin Web]
    API[NestJS API]
    WORKER[NestJS Worker]
    DB[(PostgreSQL + PostGIS)]
    REDIS[(Redis)]
    STORE[(Private Object Storage)]
    MAPS[Maps / Geocoding / Routing Provider]
    PUSH[Push / SMS Providers]

    M -->|HTTPS REST| API
    W -->|HTTPS REST| API
    M <-->|Authorized WebSocket| API
    API --> DB
    API --> REDIS
    API --> STORE
    API --> MAPS
    API -->|Queue jobs| REDIS
    WORKER --> REDIS
    WORKER --> DB
    WORKER --> STORE
    WORKER --> PUSH
~~~

## 4. Monorepo layout

The following is the target layout. It is a design map, not a claim that these directories already exist.

~~~text
Project-Wessali/
├── apps/
│   ├── mobile/                 # Expo: Android + iOS
│   │   ├── app/                # Expo Router routes
│   │   ├── src/
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   ├── customer/
│   │   │   │   ├── provider/
│   │   │   │   ├── freight/
│   │   │   │   ├── roadside/
│   │   │   │   ├── water/
│   │   │   │   ├── bookings/
│   │   │   │   ├── tracking/
│   │   │   │   └── profile/
│   │   │   ├── components/
│   │   │   ├── navigation/
│   │   │   ├── services/
│   │   │   └── localization/
│   │   └── assets/
│   ├── admin/                  # Next.js operations dashboard
│   │   ├── app/
│   │   └── src/
│   │       ├── features/
│   │       ├── components/
│   │       └── services/
│   ├── api/                    # NestJS REST API + WebSocket gateway
│   │   └── src/
│   │       ├── modules/
│   │       ├── common/
│   │       ├── database/
│   │       └── main.ts
│   └── worker/                 # Background queue consumers / schedules
│       └── src/
├── packages/
│   ├── contracts/              # Zod schemas, DTO contracts, API types
│   ├── i18n/                   # ar, fr, en translations
│   ├── config/                 # Shared lint / TypeScript configuration
│   └── design-tokens/          # Shared brand tokens, spacing, typography
├── infra/
│   ├── docker/
│   └── deployment/
├── scripts/
├── docs/
├── .env.example
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
~~~

Do not share React Native components directly with Next.js unless they are genuinely platform-neutral. Share contracts, translation keys, design tokens, and business-independent utilities instead.

## 5. Backend module boundaries

| Module | Responsibilities |
|---|---|
| Auth | Phone verification, sessions/tokens, refresh, sign-out |
| Users | User profile, preferences, language |
| Providers | Provider applications, verification, approval, suspension |
| Vehicles & equipment | Trucks, tow equipment, tankers, capacities, documents |
| Service catalog | Freight, roadside, water service definitions |
| Service areas | Enabled regions, provider coverage, operating hours |
| Availability | Provider online/offline and working schedule |
| Bookings | Shared booking lifecycle and ownership checks |
| Freight | Cargo details, route requirements, offers, transport milestones |
| Roadside | Vehicle issue, assistance type, towing requirements |
| Water | Quantity, use, tanker capacity, water category |
| Matching | Eligibility filters, discovery, offers, assignment |
| Tracking | Authorized active-job location updates |
| Pricing | Quotes, configurable rates, fees, commission calculation |
| Payments | Payment records, ledger entries, refunds/adjustments |
| Notifications | In-app, push, SMS dispatch |
| Reviews | Ratings, reports, moderation |
| Support | Support cases and disputes |
| Admin | Staff permissions and operational actions |
| Audit | Important security, staff, and financial actions |

Each module owns its rules and persistence operations. A controller should not directly implement a business workflow.

## 6. Core data and transaction boundaries

Core records include user/profile, provider profile and services, vehicle/equipment, provider documents, service area, availability, booking, service-specific details, provider offers, booking events, location samples, attachments, payment/ledger entries, ratings, support cases, notifications, and audit events.

Use UUID identifiers for application entities. Store monetary values as integer minor units plus ISO currency code (DZD for the Algerian launch). Store timestamps in UTC; format them for the user's selected locale.

Use PostgreSQL transactions for operations that must succeed together. Provider acceptance should use a conditional update or transaction/locking strategy so only one provider can be assigned. Payment and commission changes must be recorded as auditable ledger entries, not just overwritten totals.

For proximity search, store spatial values using an agreed SRID and PostGIS geography/geometry types. Add GiST indexes and verify that proximity queries use index-aware functions such as ST_DWithin. Spatial units and route distance must be explicit.

## 7. Matching design

Matching should be a domain service with separate eligibility rules for each vertical.

1. Read the booking and its service-specific requirements.
2. Find providers approved for the required service.
3. Exclude suspended, offline, unavailable, or capacity-incompatible providers.
4. Filter by service area and geographic/route compatibility.
5. Rank the remaining providers using configurable policy.
6. Create offers or notifications.
7. Accept a provider atomically.
8. Record the matching decision and status event.

Initial ranking may consider capability, capacity, distance/ETA, schedule, service history, and provider quote. Keep ranking weights in server-side configuration and monitor the results.

Freight matching should later support return-trip/route-direction compatibility. Roadside matching prioritizes provider capability and proximity. Water matching prioritizes tanker capacity, delivery coverage, quantity, and declared water category.

## 8. API and realtime conventions

- Prefix REST endpoints with /v1.
- Use JSON request/response bodies.
- Publish an OpenAPI specification from the API.
- Validate all inbound data on the server.
- Use consistent error envelopes with machine-readable codes.
- Enforce object ownership and role permissions on every request.
- Add idempotency support to booking creation and other retry-sensitive operations.

Initial endpoint groups:

~~~text
/v1/auth/*
/v1/me
/v1/providers/*
/v1/vehicles/*
/v1/service-areas/*
/v1/availability/*
/v1/bookings/*
/v1/freight/*
/v1/roadside/*
/v1/water/*
/v1/offers/*
/v1/tracking/*
/v1/payments/*
/v1/reviews/*
/v1/support/*
/v1/admin/*
~~~

WebSocket rooms must be authorized by booking membership and role. A customer may subscribe to the booking they own; the assigned provider may publish allowed status/location events for that booking. Do not allow clients to choose arbitrary room IDs and receive another user's data.

Persist important status changes before broadcasting them. WebSocket delivery is a convenience channel, not the system of record; clients must be able to recover state with REST.

## 9. Background jobs

Use Redis + BullMQ for work that should not block an API request:

- Sending push/SMS notifications.
- Expiring unaccepted requests and offers.
- Reminder scheduling.
- Image/document processing.
- Periodic provider and service-area checks.
- Payment reconciliation jobs, when payment integrations exist.
- Aggregated operational metrics.

Jobs must be retry-safe and idempotent. Failed jobs should have structured logs and an operator-visible failure path.

## 10. Localization architecture

Keep translation dictionaries in the shared i18n package:

~~~text
packages/i18n/
├── src/
│   ├── ar/
│   │   ├── common.json
│   │   ├── customer.json
│   │   ├── provider.json
│   │   └── admin.json
│   ├── fr/
│   └── en/
└── index.ts
~~~

The mobile UI must switch layout direction at runtime for Arabic. Translation keys should be typed or validated so missing strings are found in CI. API responses should return stable status codes and identifiers; clients translate them rather than relying on server-returned display text.

## 11. Map and location provider abstraction

Create a MapsProvider boundary for address search/geocoding, reverse geocoding, map display configuration, route/ETA estimates, and route geometry where available.

Do not bind booking or matching business rules to one map vendor's response format. Evaluate suppliers using real test locations across the intended Algerian launch areas. Record coverage, Arabic/French search quality, pricing, terms, and fallback limitations before choosing a production provider.

## 12. Security boundaries

- The mobile app and admin web are untrusted clients.
- Authentication identifies the caller; authorization decides what they may do.
- Provider approval and service permissions are checked by the API on every relevant action.
- Admin roles are least-privilege and separate from customer/provider roles.
- Provider documents live in private storage and are accessed using short-lived authorized links.
- Secrets are injected at runtime and never committed.
- Precise provider location is available only to authorized users during eligible active bookings.
- Use retention rules for location samples and uploaded documents.
- Record important admin, booking, and financial actions in an audit log.

## 13. Environments and deployment

Target environments:

- Local development.
- Staging / internal testing.
- Production.

Local development should use Docker Compose for PostgreSQL with PostGIS and Redis. Keep external provider integrations behind adapters so local development can use sandbox or fake implementations.

Production deployment should contain, at minimum:

- API runtime.
- Worker runtime.
- PostgreSQL/PostGIS with automated backups.
- Redis.
- Private object storage.
- Admin web runtime.
- TLS termination, logs, metrics, uptime monitoring, and alerting.

Do not deploy production database credentials or real provider secrets to a mobile bundle. Mobile configuration may contain public client identifiers, never server-side secrets.

On a Windows development machine, Android development can be local. Expo documents cloud builds for iOS, which avoids requiring a local macOS machine for the build itself; an Apple developer account and device testing are still separate release requirements: https://docs.expo.dev/faq/

## 14. Testing strategy

- Unit tests for service rules, pricing, authorization, and state transitions.
- Integration tests against PostgreSQL/PostGIS and Redis.
- API contract tests from shared schemas/OpenAPI.
- Concurrency tests for duplicate provider acceptance.
- End-to-end tests for each vertical.
- Localization tests for Arabic RTL, French, and English.
- Permission tests for customer/provider/admin access.
- WebSocket tests for unauthorized booking subscriptions.
- Mobile testing on physical Android and iOS devices.
- Backup restore and incident recovery exercises.

## 15. Observability

Use structured logs with request ID, booking ID, actor ID, and module where appropriate. Do not log OTPs, access tokens, full identity documents, or unnecessary precise location data.

Track operational metrics such as request-to-match time, offer acceptance rate, cancellation rate, service completion rate, provider online coverage, notification delivery failures, and support-case volume.

## 16. Architecture rules

1. Keep business rules in backend domain services.
2. Keep service-specific fields in service-specific detail models.
3. Keep shared booking, identity, notification, and audit infrastructure common.
4. Use database migrations for every schema change.
5. Never commit secrets or real user documents.
6. Treat location as sensitive data.
7. Do not add microservices until a demonstrated scaling or ownership need justifies them.
8. Record significant architectural changes in docs/DECISIONS.md.
