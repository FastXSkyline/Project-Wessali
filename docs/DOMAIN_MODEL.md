# Wessali — Domain Model and Lifecycle

**Version:** 0.1  
**Status:** Proposed domain baseline

## 1. Modeling principle

Wessali has one shared booking concept and three service-specific detail models. This gives the platform consistent authentication, offers, status history, notifications, ratings, and financial records without pretending that freight, roadside assistance, and water delivery have identical requirements.

## 2. Main entities

| Entity | Purpose |
|---|---|
| User | Login identity and account status |
| UserProfile | Name, contact preferences, language, and general profile data |
| ProviderProfile | Provider status, verification state, business/contact details |
| ProviderService | Approved service categories and capabilities |
| VehicleEquipment | Truck, tow vehicle/equipment, tanker, capacity and technical details |
| ProviderDocument | Private document metadata, type, expiry, review state |
| ServiceArea | Geographic area where a service is enabled |
| ProviderCoverage | Areas and service types a provider accepts |
| AvailabilityWindow | Working schedule and online/offline availability |
| Booking | Shared customer request, ownership, status, schedule, assigned provider |
| FreightDetails | Cargo, weight, dimensions, route, loading and transport requirements |
| RoadsideDetails | Vehicle, issue category, location, urgency, towing requirement |
| WaterDetails | Quantity, intended use, water category, access requirements |
| ProviderOffer | Quote or acceptance offer made against a booking |
| BookingEvent | Append-only timeline of status and important booking changes |
| LocationSample | Provider coordinates with timestamp and active-booking reference |
| Attachment | Private file metadata related to a booking or provider |
| PaymentRecord | Amount, currency, method, status, references |
| LedgerEntry | Auditable charge, commission, refund, or settlement entry |
| Review | Rating and review connected to a completed booking |
| SupportCase | Customer/provider support request and resolution |
| Notification | In-app/push/SMS notification state |
| AuditEvent | Important security, staff, and financial actions |

## 3. Relationship outline

~~~mermaid
erDiagram
    USER ||--o| USER_PROFILE : has
    USER ||--o| PROVIDER_PROFILE : may_have
    PROVIDER_PROFILE ||--o{ PROVIDER_SERVICE : offers
    PROVIDER_PROFILE ||--o{ VEHICLE_EQUIPMENT : registers
    PROVIDER_PROFILE ||--o{ PROVIDER_DOCUMENT : submits
    PROVIDER_PROFILE ||--o{ AVAILABILITY_WINDOW : sets
    PROVIDER_PROFILE ||--o{ PROVIDER_COVERAGE : serves
    USER ||--o{ BOOKING : requests
    BOOKING ||--o| FREIGHT_DETAILS : may_have
    BOOKING ||--o| ROADSIDE_DETAILS : may_have
    BOOKING ||--o| WATER_DETAILS : may_have
    BOOKING ||--o{ PROVIDER_OFFER : receives
    PROVIDER_PROFILE ||--o{ PROVIDER_OFFER : submits
    BOOKING ||--o{ BOOKING_EVENT : records
    BOOKING ||--o{ LOCATION_SAMPLE : tracks
    BOOKING ||--o{ PAYMENT_RECORD : has
    BOOKING ||--o{ REVIEW : receives
    BOOKING ||--o{ SUPPORT_CASE : may_have
~~~

A user may also have a provider profile. A provider can offer more than one service category, but each category and piece of equipment must be reviewed according to its own requirements.

## 4. Booking aggregate

The shared booking record should contain:

- ID and public booking reference.
- Customer ID.
- Service type.
- Current status.
- Pickup / service location and optional destination.
- Requested schedule.
- Assigned provider ID, nullable until assignment.
- Price estimate and agreed final amount, when known.
- Currency code.
- Payment status.
- Customer-visible notes.
- Created, updated, accepted, started, completed, and cancelled timestamps as appropriate.

Do not store all service-specific data as loosely defined JSON if it needs validation, filtering, matching, or reporting. Use dedicated detail tables or typed domain records.

## 5. Lifecycle and transition rules

Proposed shared lifecycle:

~~~mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Submitted
    Submitted --> Matching
    Matching --> OfferReceived
    Matching --> Accepted
    OfferReceived --> Accepted
    OfferReceived --> Matching
    Matching --> Expired
    Draft --> Cancelled
    Submitted --> Cancelled
    Matching --> Cancelled
    OfferReceived --> Cancelled
    Accepted --> ProviderEnRoute
    Accepted --> Cancelled
    ProviderEnRoute --> Arrived
    ProviderEnRoute --> Cancelled
    Arrived --> InProgress
    Arrived --> Cancelled
    InProgress --> Completed
    InProgress --> Disputed
    Completed --> Disputed
    Cancelled --> [*]
    Expired --> [*]
    Completed --> [*]
    Disputed --> [*]
~~~

Rules:

- Only the backend may make a transition.
- Each transition checks current state, actor, role, and service-specific rules.
- Record each accepted transition as a BookingEvent.
- A repeated request should be idempotent where possible.
- Cancellation after a configured milestone may require a reason or staff review.
- Dispute handling does not erase the original completion/status history.

Service-specific event examples:

**Freight:** pickup confirmed → loading → loaded → in transit → delivered.

**Roadside:** provider en route → arrived → diagnosis/work started → assistance completed, optionally towing completed.

**Water:** provider en route → arrived → delivery started → quantity delivered / delivery confirmed.

## 6. Offers and concurrent acceptance

A provider offer should record booking ID, provider ID, quote amount and currency (if applicable), message or quote details, proposed timing, offer status, and created/expiry timestamps.

The API must accept a provider only if the booking is still eligible and unassigned (or if the customer's selected-offer workflow confirms the offer). Enforce this with a transaction and database constraint/conditional update. Do not trust a UI-disabled button as a concurrency safeguard.

## 7. Spatial model

Store user-selected pickup, destination, service location, service areas, and provider location using consistent spatial conventions.

- Use SRID 4326 for GPS coordinates unless a specific transformation is needed.
- Prefer geography for distance calculations in metres when appropriate.
- Add GiST indexes to spatial columns used by proximity queries.
- Use index-aware functions such as ST_DWithin for radius filtering.
- Treat straight-line distance and driving ETA as different values.
- Store route geometry only where there is a clear use case and retention policy.

Provider location samples should reference an active tracking session or booking. Avoid retaining every raw coordinate indefinitely.

## 8. Money model

- Store currency explicitly (initial market currency: DZD).
- Store monetary values as integer minor units.
- Keep quoted amount, agreed amount, platform fee, provider net, and refund/adjustment entries distinct.
- Do not use floating-point values for money.
- Do not silently overwrite financial history.
- Final rounding and invoice display rules must be defined with the finance workflow.

## 9. API resource outline

| Resource | Example operations |
|---|---|
| Auth | Sign up, verify phone, sign in, refresh, sign out |
| Me | Read/update profile, update language |
| Providers | Apply, read profile, upload documents, check approval |
| Vehicles | Register/update vehicle or equipment |
| Availability | Set online/offline, manage schedule |
| Bookings | Create, list, detail, cancel |
| Freight | Submit and read freight-specific details |
| Roadside | Submit and read roadside details |
| Water | Submit and read water-delivery details |
| Offers | List, quote, accept, reject, expire |
| Tracking | Publish provider location, read authorized booking tracking |
| Payments | Read payment state, create allowed payment records |
| Reviews | Create and view eligible reviews |
| Support | Open case, attach evidence, read resolution |
| Admin | Review providers, manage coverage, bookings, disputes, and reports |

These are resource groups, not a finalized API contract. Exact request schemas, permissions, and response envelopes belong in OpenAPI and shared contract tests.

## 10. Required constraints and indexes

Before production, define migrations and tests for:

- Unique user phone number after normalization.
- Provider approval state and service eligibility.
- One active assigned provider per booking.
- Valid booking status transitions.
- Provider-offer uniqueness per provider/booking where required.
- Foreign-key integrity for booking details.
- Spatial GiST indexes for searchable coordinates/areas.
- Indexes for booking status, service type, customer, provider, and created/updated time.
- Retention and deletion behavior for location samples and uploaded documents.

## 11. Reporting events

Capture domain events for booking created; matching started/completed; offer sent, accepted, rejected, or expired; provider assigned; provider status/location milestones; booking completed, cancelled, or disputed; payment recorded, adjusted, or refunded; provider submitted, approved, suspended, or rejected; and review submitted.

Operational reports should derive from persisted records and events, not client analytics alone.
