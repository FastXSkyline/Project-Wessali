# Wessali — Decision Record

This document records confirmed product choices and proposed engineering choices. A proposal is not considered approved merely because it appears in the architecture document.

## Confirmed product decisions

| ID | Decision | Status | Notes |
|---|---|---|---|
| P-001 | Android and iOS mobile applications | Confirmed | Both mobile platforms are in scope. |
| P-002 | Web administration dashboard | Confirmed | Operations and administration use the web. |
| P-003 | Arabic, French, and English | Confirmed | Arabic requires full RTL support. |
| P-004 | All three service lines in the first release | Confirmed | Freight, roadside assistance, and water tankers. |
| P-005 | Algeria as the launch market | From supplied concept | Initial pilot service zones still need selection. |

## Proposed architecture decisions

| ID | Proposal | Reason | Status |
|---|---|---|---|
| A-001 | TypeScript monorepo with pnpm workspaces | Shared contracts and coordinated app/backend tooling | Proposed |
| A-002 | Expo / React Native for mobile | One maintained mobile codebase for Android and iOS | Proposed |
| A-003 | One role-aware mobile app for customers and providers | Avoid separate mobile codebases initially; provider features are permission-gated | Proposed |
| A-004 | Next.js for the admin web application | Dedicated web UX for Wessali staff | Proposed |
| A-005 | NestJS as a modular monolith API | Clear domain boundaries without early microservice operations | Proposed |
| A-006 | Separate NestJS worker process | Keep notifications, expiries, and scheduled work out of request handling | Proposed |
| A-007 | PostgreSQL + PostGIS | Transactional storage plus geographic search | Proposed |
| A-008 | Redis + BullMQ | Background job queue and short-lived coordination/cache needs | Proposed |
| A-009 | REST/OpenAPI and WebSockets | Stable request contracts plus realtime tracking/status events | Proposed |
| A-010 | Map/routing provider adapter | Avoid locking business logic to a map vendor before testing Algerian coverage | Proposed |

## Open decisions

| ID | Question | Why it matters |
|---|---|---|
| O-001 | Is the official Arabic name وصلي or وصلني? | Brand consistency across app, store listings, legal and marketing material |
| O-002 | Which wilayas and routes are enabled for the first pilot? | Provider supply, service coverage, support capacity |
| O-003 | What documents are required for each provider type? | Verification workflow and operational compliance |
| O-004 | Which pricing model applies to each service? | Quote flow, tariff configuration, commissions |
| O-005 | Which payment methods and settlement process are supported? | Payment UI, ledger, refunds, provider payouts |
| O-006 | Which mapping/geocoding/routing supplier works best in target Algerian areas? | Map accuracy, routing, cost, language coverage |
| O-007 | Which SMS and push delivery providers are selected? | OTP, notification delivery, operating cost |
| O-008 | What are the cancellation, refund, and dispute policies? | Booking transitions and admin operations |
| O-009 | What is the monetization model? | Provider commission, subscriptions, or other revenue |
| O-010 | What are customer support hours and escalation routes? | Pilot operations and customer expectations |

## Change process

When changing a decision:

1. Update this record.
2. Update the affected product/architecture/domain documentation.
3. Add the migration or compatibility plan if data or API behavior changes.
4. Include the reason in the pull request or commit description.
