# Wessali — Production Architecture

**Status:** Cloudflare production foundation deployed; external communications and payment providers remain unconfigured.

## Production topology

~~~mermaid
flowchart LR
    APP[Expo iOS / Android]
    ADMIN[Operations dashboard]
    EDGE[Cloudflare Worker API]
    D1[(Cloudflare D1)]
    R2[(Private Cloudflare R2)]
    MAP[OpenStreetMap tiles / native maps]
    APP -->|HTTPS + bearer session| EDGE
    ADMIN -->|Same-origin HTTPS + HttpOnly admin cookie| EDGE
    EDGE --> D1
    EDGE --> R2
    ADMIN --> MAP
    APP --> MAP
~~~

The production API and dashboard are served from:

- API base: https://wessali-platform.anesteb8.workers.dev/v1
- Dashboard: https://wessali-platform.anesteb8.workers.dev/admin

The app no longer depends on a PC-hosted server for its default production connection. The former NestJS/PostgreSQL/Redis implementation remains in the repository as a local development/reference stack; it is not the mobile app's production API.

## Cloudflare resources

| Resource | Name | Purpose |
|---|---|---|
| Worker | wessali-platform | REST API, admin dashboard, scheduled retention cleanup |
| D1 | wessali-production | Accounts, auth sessions, providers, orders, events, tracking, audit, payment records |
| R2 | wessali-private-files | Private provider documents and future attachments |
| Worker observability | enabled | Invocation logs and sampled traces |

D1 and R2 were created with Western Europe placement. Existing Skyline Workers, D1 databases, and buckets were not reused or modified.

## Identity and authentication

- Customer/provider accounts register with an international E.164 phone number, display name, selected role, and password.
- Passwords are salted and derived using PBKDF2-HMAC-SHA-256 through Web Crypto; plaintext passwords are never stored.
- User sessions are random bearer tokens. Only SHA-256 token hashes are stored in D1. Mobile stores the issued session in Expo SecureStore.
- Login is rate-limited by IP and account identifier. Suspended accounts cannot create sessions.
- Phone number ownership is **not** verified by SMS in this deployment. Add an OTP provider before relying on phone numbers as verified identities.
- The administrator initializes the console once using a one-time bootstrap key, then signs in with an email/password. The dashboard uses an HttpOnly, Secure, SameSite=Strict cookie; it does not put admin bearer tokens in localStorage.
- Admin mutations require same-origin requests and are written to the audit trail.

## Application data

The initial D1 migration creates tables for:

- Users, profiles, sessions, administrator users and sessions, and rate limits.
- Provider profiles, approved service capabilities, and provider documents.
- Orders and freight/roadside/water detail tables.
- Provider offers, order events, and live-tracking consent state.
- Location samples, payment records, ledger entries, support cases, notifications, and administrative audit events.

Coordinates are checked for valid latitude/longitude ranges. Booking data is associated with its owning customer and, once accepted, its assigned provider. Customer endpoints return only the caller's own bookings; providers can only query matching work and jobs assigned to their provider profile.

## Location privacy and retention

Provider live GPS is not collected continuously by default. A provider must explicitly start sharing from an active assigned job. The mobile app requests foreground location permission and sends a location sample approximately every 15 seconds while the app remains active. Providers can stop sharing; sharing is disabled automatically when a job completes and the mobile watcher is removed on sign-out.

Only the owner customer can read the live position for their booking. The admin map can display saved pickup/destination points and a provider's most recent fix only while sharing is enabled and the fix is less than 10 minutes old. The scheduled Worker task deletes location samples older than 30 days.

The initial mobile client does not request background location permission. Live sharing therefore pauses when the app is not active; background tracking is intentionally not enabled.

## Operations dashboard

The Worker-hosted dashboard includes:

- Overview metrics and order activity/status/service charts.
- Live map showing active order pickup/destination points and opted-in fresh provider positions.
- Searchable orders, order event history, and current state.
- Customer/provider account list with account suspension/reactivation.
- Provider review queue with approve/reject/suspend actions.
- Payment-record view, audit history, and document retrieval endpoints.

Dashboard routes are protected by administrator authentication. Sensitive account details, coordinates, and private documents are not public assets.

## API surface

| Group | Production routes |
|---|---|
| Health | GET /v1/health |
| Auth | POST /v1/auth/register, /v1/auth/login, /v1/auth/logout |
| Customer bookings | GET /v1/bookings/mine, POST /v1/bookings, POST /v1/bookings/:id/cancel |
| Customer tracking | GET /v1/bookings/:id/tracking |
| Provider profile | GET /v1/providers/me, POST /v1/providers/apply |
| Provider jobs | GET /v1/providers/requests, /v1/providers/jobs, POST /v1/providers/bookings/:id/accept, /advance |
| Provider location | POST /v1/providers/bookings/:id/tracking/start, /stop, /location |
| Provider files | POST /v1/providers/documents |
| Admin | /v1/admin/setup, /auth/login, /me, /overview, /bookings, /users, /providers, /locations, /payments, /audit |

## Current boundaries / next integrations

The cloud foundation does not yet include:
- SMS OTP / phone verification.
- Push notification delivery.
- Payment collection, card/CIB/Edahabia gateway integration, or automatic provider payouts.
- Automated proximity/ETA matching and turn-by-turn route calculations.
- Custom domain and branded DNS; production currently uses the account's workers.dev subdomain.
- A dedicated staff-role hierarchy beyond the initial administrator account.

These require external provider selection, credentials, operational policies, and additional integration tests. The dashboard's payment section reads payment records but does not process payments.

## Local development

The former NestJS API and PostgreSQL/PostGIS migrations remain for local development and reference. Production mobile defaults to the Cloudflare Worker. Redis is not needed by the production Worker API. Never enable the local development session endpoint on a public deployment.
