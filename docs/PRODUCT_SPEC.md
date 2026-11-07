# Wessali — Product Specification

**Version:** 0.1 · **Status:** Draft for implementation planning

## 1. Product summary

Wessali is a location-aware marketplace for freight transportation, roadside assistance, and water-tanker delivery in Algeria. It connects customers with providers who are eligible, available, and capable of fulfilling a request.

The platform comprises an Android/iOS mobile app for customers and providers, a web administration dashboard, and a shared backend.

## 2. Confirmed decisions

| Requirement | Direction |
|---|---|
| Mobile | Android + iOS |
| Admin | Web dashboard |
| Languages | Arabic, French, English |
| Initial scope | Freight, roadside assistance, and water delivery |
| Market | Algeria |
| Initial market focus in supplied concept | Routes linking eastern wilayas and Algiers; exact pilot locations remain open |

All three services are in the first-release scope. Launch coverage should still be limited to operational areas with enough verified providers.

## 3. User roles

- **Customer:** individual, merchant, company representative, or farmer. Creates requests, reviews offers, follows active work, contacts support, confirms completion, and rates the service.
- **Provider:** approved truck driver, roadside-assistance provider, mechanic/towing operator, or water-tanker provider. Manages services, equipment, availability, offers, and jobs.
- **Operations administrator:** reviews provider applications, manages service areas and bookings, and handles reports/disputes.
- **Finance administrator:** reviews payment records, refunds, commissions, and settlement records.
- **Super administrator:** manages staff roles and platform configuration.

A person may have customer and provider capabilities. Provider functions stay unavailable until the provider profile is approved.

## 4. Mobile and web experiences

### Mobile application

One role-aware mobile codebase is proposed for customers and providers. Customer mode focuses on creating and tracking requests. Provider mode focuses on availability, incoming requests, active jobs, and earnings/history. Provider mode requires approved provider status.

### Administration dashboard

The separate web app provides operational overview, booking queues, provider verification, service-area controls, and finance/support tools.

### Onboarding

- Phone-number-based registration and sign-in with one-time-code verification.
- User profile and language preference.
- Provider application with service categories and equipment/vehicle details.
- Private supporting-document upload and staff review.
- Rate limits, OTP expiry, resend limits, and abuse monitoring.
- Stronger authentication and explicit roles for admin accounts.

SMS and document-verification suppliers must be selected after operational and local compliance review.

## 5. Service workflows

### 5.1 Freight transport — نقل البضائع

Customer inputs: pickup, destination, pickup date/time window, cargo description/category, approximate weight/dimensions, truck type/capacity, loading requirements, contact details, optional photos and access notes.

Matching considers provider approval, truck type/capacity, route compatibility, coverage, availability, timing, and quote. Providers review requests and submit a quote or accept a configured price. Job milestones include pickup, loading, transit, delivery, and completion.

**Return-trip matching:** allow suitable requests in the direction of a driver's planned return to be surfaced. Route compatibility and schedule matter; straight-line distance alone is insufficient. No work is assigned automatically.

### 5.2 Roadside assistance — الديباناج

Customer inputs: GPS or manually selected location, vehicle type, issue category, description/photos, urgency context, towing requirement, and destination when towing is requested.

Matching considers provider capabilities, active availability, service radius, vehicle compatibility, towing equipment, and reliable ETA when available. Provider milestones include en route, arrived, work started, and completed.

The interface must not imply that Wessali replaces emergency services. It should advise users to prioritize a safe location when possible.

### 5.3 Water tankers — صهاريج المياه

Customer inputs: delivery point, required quantity, intended use (residential/agricultural/other), preferred delivery window, and tanker access notes.

Provider details include tanker capacity, service area, availability, delivery equipment, and declared water category/source.

The interface must distinguish potable water from non-potable or irrigation water. Never label water as drinkable unless the source/provider has completed the verification process defined by Wessali operations.

## 6. Shared booking lifecycle

Proposed states: Draft, Submitted, Matching, Offer received, Accepted, Provider en route, Arrived, In progress, Completed, Cancelled, Expired, and Disputed.

Every transition is checked by the backend against the current state, actor, role, and service-specific rules. Persist a booking event for accepted transitions. Service-specific milestones remain separate: freight loading/transit, roadside diagnosis/towing, and water delivery confirmation.

## 7. Provider verification

A provider cannot accept work until the relevant provider/service/equipment profile is approved. Proposed flow: verify phone, submit provider profile, select service categories, register vehicles/equipment, upload category-specific documents, staff review, approve/reject/request changes, then enable service areas.

Required documents and validity rules must be confirmed against applicable Algerian requirements before public launch. Store documents privately and audit staff access.

## 8. Matching and offers

Matching runs on the server. First filter by approved provider/service, capability, equipment/capacity, availability, service area, location/route compatibility, schedule, and capacity. Rank eligible providers using configurable server-side rules such as ETA, distance, reliability, and quote.

Freight should initially support quotes because cargo/route requirements vary. Roadside and water services may use fixed pricing, quotes, or hybrid rules. Final pricing models remain open business decisions.

Provider acceptance must be atomic so simultaneous requests cannot assign the same booking twice.

## 9. Location, tracking, and privacy

- Request location permission only when needed; allow manual pin placement.
- Do not publish provider live location publicly.
- Share precise provider location only with the assigned customer during an active job and with provider permission.
- Stop active tracking at completion/cancellation.
- Define retention rules for historical location samples.
- Do not treat GPS alone as proof of arrival/completion.
- Evaluate map, geocoding, and routing coverage in target Algerian areas, including Arabic/French search and road ETA quality.

## 10. Pricing, payments, cancellation

Support visible estimated prices or quotations, agreed final amount in DZD, separate platform fee/provider net, payment method/status, cancellation reason/actor/time, refunds/adjustments, and auditable financial entries.

Initial implementation should record and reconcile payment states. Cash-on-completion may be supported if approved by the business. Do not activate online payments or automated payouts until a suitable provider, settlement flow, legal requirements, and refund process are validated.

Show price and cancellation rules before booking confirmation.

## 11. Notifications, reviews, and support

Notifications cover OTP/security, request submission, quotes, acceptance, en-route/arrival milestones, completion, cancellation/expiry, dispute, and provider-verification outcomes. Use in-app inbox and push; add SMS only where cost and delivery are approved.

Only completed bookings can be rated. Support cases link to bookings and may contain evidence. Moderation and admin resolution must preserve the original event and financial history.

## 12. Admin dashboard requirements

- Overview and operational alerts.
- Active-job map with permission-controlled location.
- Customer/provider profiles and provider verification.
- Vehicles/equipment and service coverage.
- Freight, roadside, and water request queues.
- Quotes and pricing configuration.
- Payment, commission, refund, and reconciliation records.
- Cancellations, support cases, disputes, and review moderation.
- Staff roles and audit log.
- Localized content and notification templates.

Sensitive actions require role authorization and audit events.

## 13. Localization

Arabic RTL, French LTR, and English LTR must be supported across screens, validation, errors, statuses, notifications, and admin tools. Layout direction changes with the chosen locale. Format dates, quantities, and DZD amounts by locale. Keep language preference independent from device language after the user chooses it. Avoid text embedded in images.

## 14. Security and reliability

- Enforce authentication, ownership, and role permissions on the backend.
- Use short-lived access tokens and secure refresh/session handling.
- Hash passwords if password login is introduced.
- Protect OTP endpoints from brute force/abuse.
- Validate inputs server-side and use HTTPS.
- Keep secrets outside Git and mobile/browser bundles.
- Store provider documents privately with short-lived access links.
- Use transactions for booking assignment and ledger changes.
- Audit administrative and financial operations.
- Back up the database and test restoration.
- Minimize precise-location collection and retention.
- Handle intermittent/slow mobile networks with retry-safe operations.

## 15. First-release acceptance criteria

- Customers can register, choose any supported language, and submit all three request types.
- Providers can apply, undergo staff review, and become approved per service.
- Eligible providers can receive requests and accept/quote according to configuration.
- Duplicate assignment and invalid state transitions are prevented by the backend.
- Customers can follow booking progress and see assigned-provider location only during an active booking.
- Price changes, cancellations, payment records, and booking events are auditable.
- Admins can manage customers, providers, service areas, requests, and support cases.
- Arabic RTL, French, and English workflows pass end-to-end tests.
- All three services are piloted in selected, provider-covered areas before geographic expansion.

## 16. Open business decisions

1. Official spelling and identity: وصلي or وصلني.
2. Pilot wilayas and service zones.
3. Provider/equipment documents required by service.
4. Freight, roadside, and water pricing models.
5. Supported payment methods and provider settlement.
6. Cancellation, refund, and dispute rules.
7. SMS, map/routing, push, and private file-storage suppliers.
8. Commission/subscription model.
9. Support hours and escalation paths.
