# Wessali — Development Roadmap

All three services remain in the first-release scope. Stages order implementation work; they do not drop freight, roadside, or water from v1. Pilot only in areas where suitable verified providers are available.

## Stage 0 — Product validation

Confirm brand spelling/identity, pilot wilayas/service zones, provider/equipment documents by service, pricing/payment/settlement rules, cancellation/refund/dispute rules, and suitable maps/SMS/push/storage suppliers. Review local compliance requirements.

## Stage 1 — Engineering foundation

Create pnpm/Turborepo workspace, Expo mobile shell, Next.js admin shell, NestJS API, queue worker, local PostGIS/Redis, environment template, migration runner, shared Zod contracts, three-language dictionaries, design tokens, and CI.

## Stage 2 — Identity and provider operations

Phone verification and sessions; profiles and language preference; provider applications and service selection; vehicle/equipment and private documents; admin review/approval/suspension; provider coverage, availability, and role permissions.

## Stage 3 — All service request flows

**Freight:** pickup/destination, cargo/weight/dimensions, truck compatibility, quotes, transport milestones, return-route matching.

**Roadside:** location, vehicle/issue details, towing requirements, provider matching, arrival and completion.

**Water:** delivery location, quantity/use/category, tanker capacity, source verification, delivery confirmation.

**Shared:** booking lifecycle, atomic assignment, offers, history and reviews.

## Stage 4 — Realtime and commercial operations

Authorized live tracking and status events, push/in-app notifications, SMS where configured, quotes and agreed totals, payment records/ledger, cancellation, support, disputes, ratings and moderation.

## Stage 5 — Operations dashboard and pilot readiness

Admin overview, booking queues and authorized operations map; customer/provider/vehicle management; service-area/pricing configuration; finance/support/review tools; audit log; monitoring, backups/restore, security review, incident runbook; device and localization testing.

## Stage 6 — Controlled pilot

Enable selected zones only. Recruit and verify providers before public launch in each service category. Measure match time, fulfilment, cancellation, provider response, support volume, and user feedback. Expand only when coverage and operations meet agreed thresholds.

## Definition of done

Every feature has requirements, access rules, localization, server validation, unit/integration coverage, loading/offline/error states, safe logging, migrations, relevant audit events, and documentation.
