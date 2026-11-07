# Wessali — Decision Record

A proposed engineering choice is not automatically a confirmed business requirement.

## Confirmed product decisions

| ID | Decision | Status |
|---|---|---|
| P-001 | Android and iOS mobile | Confirmed |
| P-002 | Web admin dashboard | Confirmed |
| P-003 | Arabic, French, English | Confirmed |
| P-004 | Freight, roadside, and water in v1 scope | Confirmed |
| P-005 | Algeria launch market | From supplied concept; pilot zones open |

## Proposed architecture decisions

| ID | Proposal | Reason |
|---|---|---|
| A-001 | TypeScript monorepo with pnpm | Shared contracts and tooling |
| A-002 | Expo / React Native | One maintained mobile codebase |
| A-003 | One role-aware mobile app initially | Avoid separate customer/provider codebases |
| A-004 | Next.js admin app | Separate operations experience |
| A-005 | NestJS modular monolith | Clear domains without early microservice overhead |
| A-006 | Separate BullMQ worker | Background tasks outside request handling |
| A-007 | PostgreSQL + PostGIS | Transactions and geographic matching |
| A-008 | Redis + BullMQ | Queue and coordination |
| A-009 | REST/OpenAPI; WebSockets planned | API contract plus future realtime |
| A-010 | External provider adapters | Avoid vendor lock-in in business rules |

## Open decisions

1. Official spelling: وصلي or وصلني.
2. Pilot wilayas/routes and service coverage.
3. Documents required for each provider/equipment category.
4. Pricing and quote model by service.
5. Payment methods, settlement, refunds, and provider payout.
6. Mapping/geocoding/routing provider for Algerian coverage.
7. SMS, push, and private file-storage suppliers.
8. Commission or subscription model.
9. Cancellation/dispute rules and support hours.

## Change process

When changing a decision, update this record, affected product/architecture/domain documentation, relevant migrations/API compatibility notes, and the pull request or commit rationale.
