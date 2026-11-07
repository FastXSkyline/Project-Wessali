# Wessali | وصلي

Wessali is a proposed Algerian digital marketplace for logistics, transport, and on-demand field services. It connects customers with verified providers through location-aware booking, matching, and service tracking.

## First-release services

1. **Freight transport** — connect merchants, businesses, farmers, and individuals with suitable truck drivers, including opportunities to reduce empty return journeys.
2. **Roadside assistance (dépannage)** — connect stranded drivers with nearby mechanics, towing operators, and field-assistance providers.
3. **Water tankers** — connect households and farmers with tanker providers according to location, quantity, and delivery requirements.

## Confirmed product direction

| Area | Decision |
|---|---|
| Mobile platforms | Android and iOS |
| Administration | Web dashboard |
| Languages | Arabic, French, English |
| Initial service scope | All three service lines |
| Architecture | Shared platform, role-aware mobile experience, separate admin web app |

The working Arabic spelling in this repository is **وصلي**. The supplied presentation also contains **وصلني**; final spelling and visual identity need confirmation before public release.

## Documentation

- [Product specification](docs/PRODUCT_SPEC.md)
- [System architecture](docs/ARCHITECTURE.md)
- [Domain model and lifecycle](docs/DOMAIN_MODEL.md)
- [Development roadmap](docs/ROADMAP.md)
- [Architecture and product decisions](docs/DECISIONS.md)

## Proposed technology direction

- Mobile: React Native + Expo + TypeScript
- Admin web: Next.js + TypeScript
- API: NestJS + TypeScript
- Database: PostgreSQL + PostGIS
- Realtime: WebSockets / Socket.IO
- Background jobs: Redis + BullMQ
- API contract: REST + OpenAPI
- Repository: pnpm workspaces monorepo

These are proposed engineering choices, not a claim that application code has already been implemented. Exact dependency versions will be pinned when the implementation scaffold is created.

## Repository status

This repository contains the initial product and architecture baseline. The next implementation milestone is to create the workspace scaffold, local development environment, database migrations, and the first vertical slice.

## Project team

- Amjad Rziq
- Mazhoud Omar
- Supervised by الأستاذ رابح بنور

## Product principles

- Make Arabic RTL and French/English LTR first-class experiences.
- Share provider live location only with the assigned customer during an active job.
- Verify providers and relevant vehicles/equipment before they can accept requests.
- Make service prices, quotes, cancellations, and payment status understandable.
- Launch all three service lines in controlled service areas rather than claiming nationwide coverage before providers are available.
