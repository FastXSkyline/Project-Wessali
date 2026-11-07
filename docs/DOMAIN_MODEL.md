# Wessali — Domain Model and Lifecycle

## Modeling principle

Use one shared booking record and three service-specific detail records. Shared identity, offers, status history, notifications, payments, reviews, and support should not force all services to have identical data fields.

## Core entities

User/UserProfile, ProviderProfile, ProviderService, VehicleEquipment, ProviderDocument, ServiceArea, ProviderCoverage, AvailabilityWindow, Booking, FreightDetails, RoadsideDetails, WaterDetails, ProviderOffer, BookingEvent, LocationSample, Attachment, PaymentRecord, LedgerEntry, Review, SupportCase, Notification, and AuditEvent.

## Booking lifecycle

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
    Accepted --> ProviderEnRoute
    ProviderEnRoute --> Arrived
    Arrived --> InProgress
    InProgress --> Completed
    InProgress --> Disputed
    Completed --> Disputed
~~~

Every transition validates current state, actor, role, and service-specific rules. Record accepted transitions in BookingEvent. Freight adds pickup/loading/transit/delivery events; roadside adds arrival/diagnosis/assistance or towing; water adds arrival/delivery/quantity confirmation.

## Offers and concurrency

An offer records booking, provider, amount/currency if quoted, message, proposed timing, status, and expiry. Accept only if the booking remains eligible and unassigned (or the customer selected that offer). Enforce this with a transaction/conditional update; a disabled UI button is not a concurrency safeguard.

## Spatial and money models

Use SRID 4326 for GPS input and PostGIS geography/geometry with GiST indexes for spatial queries. Use ST_DWithin for appropriate radius filters. Retain location samples only according to a documented policy and active booking need.

Use explicit currency and integer minor units; never floating-point for money. Keep quoted amount, agreed amount, platform fee, provider net, refund, adjustment, and settlement movements distinct and auditable.

## Initial database migration

The first SQL migration creates users, profiles, provider services, equipment, provider documents, service areas/coverage, bookings, three service-detail tables, offers, booking events, location samples, payment records, ledger entries, reviews, support cases, audit events, and spatial/lookup indexes.

The migration runner tracks applied filenames in schema_migrations and applies each SQL migration within a transaction.

## Constraints to strengthen before production

- Unique normalized phone numbers.
- Provider approval required for eligible services/equipment.
- One active assigned provider per booking.
- Valid booking transitions and service/detail consistency.
- Offer uniqueness/expiry rules.
- Foreign-key integrity.
- Spatial indexes and tested query plans.
- Booking/customer/provider lookup indexes.
- Retention/deletion rules for location samples and documents.
