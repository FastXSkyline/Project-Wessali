# Wessali — Development Roadmap

**Version:** 0.1  
**Status:** Proposed delivery plan

## Guiding rule

The first release includes **all three service lines**: freight transport, roadside assistance, and water-tanker delivery. The stages below organize the work; they are not a decision to postpone two services indefinitely.

The pilot should begin in a limited set of service areas where Wessali has enough verified providers to fulfill requests. Exact wilayas and operating hours must be confirmed with the project team.

## Stage 0 — Product decisions and validation

**Deliverables**

- Confirm official brand spelling and initial identity.
- Confirm pilot wilayas and service zones.
- Define provider document requirements by service type.
- Decide freight, roadside, and water quote/pricing rules.
- Decide supported payment methods and settlement process.
- Select SMS, mapping/routing, file storage, and notification suppliers after practical tests.
- Review privacy, terms, cancellation, refund, and dispute policies.

**Exit criteria:** The team can explain who is allowed to request and provide each service, what information is required, how a price is agreed, and how a job is completed.

## Stage 1 — Repository and engineering foundation

**Deliverables**

- pnpm workspace and root TypeScript/lint configuration.
- Expo mobile application shell.
- Next.js admin application shell.
- NestJS API and worker shells.
- Docker Compose for local PostgreSQL/PostGIS and Redis.
- Environment variable validation and .env.example.
- CI workflow for lint, typecheck, test, and build.
- Database migration workflow.
- Shared Zod contracts and localization package skeleton for ar, fr, and en.

**Exit criteria:** A developer can clone the repository, install dependencies, start local infrastructure, run each app, and execute CI checks using documented commands.

## Stage 2 — Identity, profiles, and provider operations

**Deliverables**

- Phone verification and secure account sessions.
- User profile and language preferences.
- Provider application and service-category selection.
- Vehicle/equipment registration.
- Private document uploads and review workflow.
- Admin provider approval/rejection/suspension.
- Provider availability and service-area management.
- Role-based access control and audit events.

**Exit criteria:** A customer can register. A provider can apply, submit required details, and become approved only after an authorized admin review.

## Stage 3 — All three booking verticals

Build the common booking lifecycle and the three service-specific flows.

### Freight

- Pickup/destination and route details.
- Cargo type, weight, dimensions, truck type, schedule.
- Provider offer/quotation.
- Transport milestones and delivery confirmation.
- Initial route-direction support for return-trip opportunities where data is available.

### Roadside assistance

- GPS or manual location.
- Vehicle and issue details.
- Assistance/towing requirements.
- Provider quote/acceptance.
- Arrival and completion milestones.

### Water tankers

- Delivery point and access notes.
- Quantity and intended use.
- Tanker capacity and availability matching.
- Water category/source declaration and verification flow.
- Delivery confirmation.

**Exit criteria:** A customer can create each request type, eligible providers can respond, one provider can be assigned safely, and each service can be completed and reviewed.

## Stage 4 — Realtime, notifications, and commercial operations

**Deliverables**

- Authorized live tracking for active bookings.
- Realtime booking status updates.
- Push notifications and in-app inbox.
- SMS for selected critical events.
- Price quotes and agreed totals.
- Payment records and ledger.
- Cancellation, support, and dispute workflows.
- Ratings and moderation.

**Exit criteria:** Customers and providers receive reliable status updates; money and cancellations are recorded with an auditable history.

## Stage 5 — Operations dashboard and pilot readiness

**Deliverables**

- Admin overview and active booking queues.
- Operations map with permission-controlled location access.
- Customer/provider/vehicle management.
- Service-area and pricing configuration.
- Payment, support, dispute, and review management.
- Operational metrics and alerts.
- Security review, backup/restore test, monitoring, and incident runbook.
- Android and iOS device testing.
- Arabic RTL, French, and English end-to-end tests.

**Exit criteria:** Operations staff can supervise the pilot without direct database edits. The team can investigate failed requests, provider complaints, payment issues, and service incidents.

## Stage 6 — Controlled pilot and improvement

**Pilot approach**

- Activate only selected service zones.
- Recruit and verify providers before promoting a category in a zone.
- Track request-to-match time, fulfilment, cancellations, provider response, customer feedback, and service coverage.
- Interview customers and providers in all three verticals.
- Fix operational gaps before enabling additional areas.

**Expansion gate:** Expand only when each enabled service area has adequate provider coverage, an operational support process, and acceptable fulfilment results.

## Suggested first vertical slice

After Stage 1, implement one complete end-to-end booking path through the shared platform (create request → matching → provider accepts → status updates → completion), then reuse the foundation for the other two service types. This validates the architecture without making freight the only first-release service.

## Definition of done for every feature

- Requirements and permissions are documented.
- Mobile and admin states are localized in Arabic, French, and English where applicable.
- API validation and authorization are enforced server-side.
- Unit and integration tests cover main and failure paths.
- Loading, empty, offline, retry, and error states are designed.
- Logs avoid secrets and unnecessary personal data.
- Database changes use migrations.
- Relevant admin/audit actions are recorded.
- Feature behavior is documented.
