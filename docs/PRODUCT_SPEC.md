# Wessali — Product Specification

**Version:** 0.1  
**Status:** Draft for implementation planning  
**Working Arabic spelling:** وصلي

## 1. Product summary

Wessali is a location-aware marketplace that connects people and businesses who need logistics or field services with suitable, available providers.

The first release supports three service lines: freight transport, roadside assistance/dépannage, and water-tanker delivery. The platform consists of an Android/iOS mobile experience for customers and providers, a web administration dashboard, and a shared backend.

The business concept is based on improving the use of available transport capacity, making roadside help easier to find, and making water-tanker requests easier to organize.

## 2. Confirmed decisions

| Requirement | Confirmed direction |
|---|---|
| Mobile platforms | Android and iOS |
| Admin platform | Web |
| Product languages | Arabic, French, English |
| First-release service scope | Freight + roadside assistance + water tankers |
| Market context | Algeria |
| Initial market focus in source material | Routes connecting eastern wilayas with Algiers; exact launch wilayas remain to be selected |

All three service lines belong in the first release. This does not mean every wilaya must be enabled on day one. Operations should activate service areas where enough verified providers are available.

## 3. Product goals

1. Let a customer describe a service need and submit it with a precise location.
2. Match the request with providers who are eligible, available, and capable of fulfilling it.
3. Let providers receive, assess, accept, or quote on appropriate requests.
4. Give customers clear booking status and, where applicable, live provider tracking.
5. Build trust through provider verification, service history, completion confirmation, and two-sided ratings.
6. Give Wessali operators tools to manage providers, service areas, bookings, pricing rules, disputes, and platform activity.
7. Support Arabic, French, and English throughout the customer/provider experience.

## 4. User roles

### 4.1 Customer

May be an individual, merchant, company representative, or farmer. Customers create requests, compare eligible offers, track accepted jobs, contact support, confirm completion, and rate the service.

### 4.2 Service provider

May offer one or more service types, subject to review and approval:

- Truck / freight transport.
- Roadside assistance, mechanics, or towing.
- Water tanker delivery.

A provider profile includes contact information, service areas, availability, credentials, equipment or vehicle details, and verification status.

### 4.3 Operations administrator

Reviews provider applications and documents, manages service areas and bookings, handles reports and disputes, and monitors service quality.

### 4.4 Finance administrator

A restricted role for reviewing recorded charges, refunds, commissions, payment status, and financial reports. Access must be limited by role.

### 4.5 Super administrator

Manages staff roles, platform configuration, service categories, access policies, and audit review.

## 5. Application experience

### 5.1 Mobile application

The proposed implementation is one mobile application for Android and iOS with role-aware experiences:

- Customer mode for requesting and tracking services.
- Provider mode for managing availability and fulfilling jobs.
- A user may have both capabilities, but provider functions remain locked until the provider profile is approved.

This avoids maintaining two separate mobile codebases at the start. The application can later be split into separate store listings without replacing the shared backend if business needs require it.

### 5.2 Admin dashboard

The web dashboard is a separate application for Wessali staff. It is not a substitute for the customer-facing mobile experience.

### 5.3 Onboarding and authentication

- Support phone-number-based account creation and sign-in.
- Verify phone ownership using a one-time code.
- Collect only profile data needed for the requested role.
- Require additional provider and vehicle/equipment information before provider approval.
- Add rate limits, OTP expiry, resend limits, and abuse monitoring.
- Admin accounts require stronger authentication and explicit role assignment.

The SMS vendor and identity/document verification process are implementation decisions to validate for Algeria.

## 6. Customer workflows by service

### 6.1 Freight transport — نقل البضائع

**Customer inputs**

- Pickup location and destination.
- Pickup date/time or time window.
- Cargo category and description.
- Approximate weight and dimensions.
- Required truck/body type and capacity.
- Loading/unloading requirements.
- Optional photos and handling notes.
- Contact person and access constraints.

**Matching considerations**

- Vehicle type and available capacity.
- Provider approval and active status.
- Provider availability and declared service area.
- Compatibility with pickup and destination.
- Route direction and, where supported, return-trip opportunities.
- Customer timing and loading requirements.

**Provider experience**

- Receive a suitable request.
- Review route, cargo details, date, and requirements.
- Submit a price/quotation or accept an offered price, depending on the configured pricing model.
- Confirm pickup, loading, transit, delivery, and completion milestones.
- Record proof of delivery when required.

**Return-trip opportunity**

The matching model should support route compatibility, not only straight-line proximity. A driver completing a delivery may be shown suitable jobs in the direction of their planned return. This feature must respect provider availability and customer timing; it must not assign work automatically.

### 6.2 Roadside assistance — الديباناج

**Customer inputs**

- Current location, selected by GPS or map pin.
- Vehicle type and optional vehicle details.
- Problem category, such as mechanical issue, tyre issue, battery issue, or towing request.
- Short description and optional photos.
- Whether the vehicle is blocking traffic or requires urgent assistance.
- Safe contact method and destination if towing is needed.

**Matching considerations**

- Provider's service category and capability.
- Provider's active availability and service radius.
- Vehicle compatibility.
- Estimated travel time from the routing provider, where reliable.
- Whether towing equipment is required.

**Provider experience**

- Receive request details and approximate location.
- Accept or submit a quote.
- Navigate to the customer.
- Mark en route, arrived, work started, and completed.
- Record towing destination or job notes where relevant.

The application should encourage customers to move to a safe location when possible and must not imply that app booking replaces emergency services.

### 6.3 Water tankers — صهاريج المياه

**Customer inputs**

- Delivery location.
- Required quantity (litres or cubic metres).
- Intended use: residential, agricultural, or another configured category.
- Preferred delivery window.
- Access information for the tanker.
- Optional notes about the tank, reservoir, or farm access.

**Provider inputs**

- Tanker capacity.
- Current availability and service area.
- Delivery capability and equipment details.
- Water source/type declaration and any required supporting verification.

The UI must distinguish potable/drinking water from non-potable or agricultural water. Do not label water as drinkable unless the provider and source have passed the verification process defined by Wessali operations.

**Matching considerations**

- Quantity and tanker capacity.
- Location and service coverage.
- Availability and delivery window.
- Water category and verified source information.
- Access constraints.

## 7. Shared booking lifecycle

A shared booking model should support these core states:

1. Draft.
2. Submitted.
3. Matching.
4. Offer received / awaiting customer choice, where quotations are used.
5. Accepted.
6. Provider en route.
7. Arrived.
8. In progress.
9. Completed.
10. Cancelled.
11. Expired.
12. Disputed.

Service-specific milestones may be recorded as events without forcing every vertical into an identical workflow. Freight needs loading and in-transit milestones; water delivery needs delivery confirmation; roadside assistance needs arrival and work-completion details.

Every state transition must be validated by the backend. A client must not be able to mark a booking completed by changing local UI state.

## 8. Provider onboarding and verification

A provider cannot accept customer work until the relevant profile has been approved.

Proposed onboarding:

1. Verify phone number.
2. Create provider profile and select service categories.
3. Submit identity and contact details.
4. Add relevant vehicle/equipment details.
5. Upload documents required for the provider's service category.
6. Operations review.
7. Approve, reject, or request more information.
8. Activate service areas and availability.

Document types and approval requirements must be confirmed against applicable Algerian rules and business operations before implementation. Store document access privately and log staff access.

## 9. Matching and offers

Matching is a server-side decision, not a client-side filter.

The first matching pass should filter by provider approval, service category, vehicle/equipment capability, availability, service area, location or route compatibility, and booking schedule/capacity.

The system may rank eligible providers using configurable factors such as estimated travel time, distance, provider reliability, and quote. Do not hard-code ranking weights into the mobile application.

Provider acceptance must be atomic: two providers must never win the same booking because of simultaneous taps or network retries.

For freight, quotation-based offers are a suitable starting model because cargo, route, and vehicle requirements vary. Roadside and water services may use fixed rates, provider quotes, or a hybrid model. The final commercial model remains an open business decision.

## 10. Location and tracking

- Ask for location permission only when a feature needs it.
- Allow manual map-pin placement when GPS is unavailable or inaccurate.
- Do not publish provider live locations to everyone.
- Share precise provider location only with the assigned customer during an active booking and with the provider's informed permission.
- Stop active-job tracking when the job is completed or cancelled.
- Define a retention policy for historical location records and make it configurable.
- Do not rely on GPS alone for arrival or completion proof.

Map, geocoding, and routing suppliers must be evaluated for Algerian address coverage, road routing quality, Arabic/French place-name handling, cost, rate limits, and licensing.

## 11. Pricing, payments, and cancellation

The system must support:

- Customer-visible estimated price or quote status.
- Provider-submitted quotations where configured.
- Final agreed price and currency (DZD).
- Platform commission and provider net amount as separate ledger entries.
- Payment method and payment status.
- Cancellation reason, timestamp, initiator, and any applicable fee.
- Refund or adjustment records.
- Audit history for all financial changes.

**Initial payment recommendation:** build payment recording and reconciliation first. Cash-on-completion can be supported if approved by the business. Do not enable online card or wallet processing, automated payouts, or a payment gateway until a suitable provider, legal requirements, settlement flow, and refund process have been validated.

All pricing and cancellation policies must be visible before the customer confirms a booking.

## 12. Notifications and communication

Required notifications:

- OTP and account security events.
- Request submitted.
- Provider offer or quote received.
- Booking accepted.
- Provider en route / arrived.
- Booking status changes.
- Completion and rating reminder.
- Cancellation, expiry, and dispute updates.
- Provider approval or document-review outcome.

Use push notifications for mobile, with an in-app notification inbox. SMS may be used for essential events when configured and cost-approved. Notification content must use the user's chosen language and avoid exposing sensitive details on a lock screen.

## 13. Reviews, support, and disputes

- Allow ratings only after a completed booking.
- Support ratings for both provider and customer, with moderation controls.
- Allow a user to report a problem and attach evidence.
- Provide a support case linked to the booking.
- Let authorized staff record a resolution and internal notes.
- Preserve booking events and financial changes for later review.
- Prevent staff from silently editing the history of a completed booking.

## 14. Administration requirements

The first admin dashboard should include:

- Overview: requests, active jobs, completion rate, provider coverage, and operational alerts.
- Live operations map: active bookings and authorized provider locations.
- Customer management.
- Provider applications, documents, approvals, and suspensions.
- Vehicles and equipment.
- Service areas and coverage settings.
- Freight, roadside, and water booking queues.
- Quotes and pricing configuration.
- Payment and commission records.
- Cancellations, support cases, and disputes.
- Ratings and reports.
- Staff roles and audit log.
- Multilingual content and notification templates.

Sensitive admin actions must require role authorization and produce audit events.

## 15. Localization and user experience

Supported languages:

- Arabic — right-to-left layout.
- French — left-to-right layout.
- English — left-to-right layout.

Requirements:

- A language selector during onboarding and in settings.
- Translate every customer/provider label, error, status, notification, and validation message.
- Mirror layout direction for Arabic, including navigation, icons where directional, alignment, and forms.
- Format dates, times, quantities, and DZD amounts by locale.
- Keep language choice independent of phone system language after the user selects a preference.
- Avoid text embedded in images.
- Test long French labels and Arabic text expansion.

Arabic should be fully usable, not treated as a later translation.

## 16. Security, privacy, and reliability requirements

- Enforce authorization on the backend for every protected operation.
- Use short-lived access tokens and secure refresh/session handling.
- Hash passwords if passwords are supported; never store them in plaintext.
- Protect OTP endpoints against brute force and automated abuse.
- Validate and normalize all input on the server.
- Use HTTPS in every deployed environment.
- Store secrets outside Git and use separate development, staging, and production credentials.
- Restrict provider-document storage and access.
- Keep an audit trail for admin and financial actions.
- Use database transactions for booking acceptance and payment-ledger changes.
- Back up the database and test restoration.
- Minimize collection and retention of precise location data.
- Design for mobile connections that are intermittent or slow.

## 17. First-release acceptance criteria

The first release is ready for a controlled pilot when:

- A customer can sign up, choose a language, and create each of the three request types.
- A provider can apply, be reviewed, and become approved for one or more service categories.
- Eligible providers receive matching requests and can accept or quote according to the configured model.
- The backend prevents duplicate assignment and invalid status transitions.
- Customers can view booking progress and see assigned-provider location only during an active booking.
- All booking states, price changes, cancellations, and payment records are auditable.
- Admin staff can manage users, providers, bookings, service coverage, and support cases.
- Arabic RTL, French, and English workflows pass end-to-end tests.
- Privacy, security, backup, monitoring, and operational procedures are documented.
- All three service lines are tested in the selected pilot area before public expansion.

## 18. Open business decisions

1. Official spelling, logo, and brand identity: وصلي or وصلني.
2. Exact launch wilayas and service zones.
3. Provider verification requirements by category.
4. Freight pricing: quote-based, tariff-based, or hybrid.
5. Roadside and water pricing models.
6. Accepted payment methods and provider settlement.
7. Cancellation, refund, and dispute policies.
8. SMS, map, routing, push, and file-storage suppliers.
9. Commission model and any provider subscription fees.
10. Customer support hours and escalation rules.

These decisions should be recorded as product configuration or explicit business policies, not buried in application code.
