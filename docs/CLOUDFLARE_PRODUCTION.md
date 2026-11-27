# Wessali Cloudflare Production Deployment

## Deployed resources

| Item | Value |
|---|---|
| Worker script | wessali-platform |
| Production API | https://wessali-platform.anesteb8.workers.dev/v1 |
| Dashboard | https://wessali-platform.anesteb8.workers.dev/admin |
| D1 database | wessali-production |
| D1 database ID | 70dd4aca-ce5b-4251-b5b1-ab09df25b553 |
| D1 primary location | Western Europe (WEUR) |
| R2 bucket | wessali-private-files |
| R2 location | Western Europe (WEUR) |

Worker bindings:

- D1 binding name: DB
- R2 binding name: FILES
- Observability: enabled, invocation logs persisted, traces sampled

The Worker uses the Cloudflare API and is deployed independently of the legacy local NestJS API. No custom zone is attached yet; the account workers.dev hostname is the production endpoint for this first release.

## First administrator setup

1. Open the dashboard URL.
2. The dashboard checks whether an administrator exists. On a new database it opens first-time setup.
3. Enter the one-time bootstrap key supplied separately, your administrator display name, your email, and a unique password of at least 12 characters.
4. After setup, sign in with the administrator email and password.

The one-time key is represented in Worker source only by its SHA-256 hash. Do not paste it into GitHub, documentation, app code, or support messages. Once the first administrator is created, the setup endpoint cannot create another one.

## Schema and deployment source

- D1 initial schema: infra/d1/migrations/0001_initial.sql
- Cloudflare Worker: apps/cloudflare/worker/index.js
- Dashboard source: apps/cloudflare/worker/admin.html

The deployed Worker includes the dashboard HTML in its script module so API and dashboard share one origin. The separate HTML file remains in the repository as the editable dashboard source.

## Smoke checks

- GET /v1/health returns service status and D1 connectivity.
- GET /v1/admin/setup/status reports whether first-time administrator setup is complete.
- Register a test customer/provider with a valid international phone and a password of at least 12 characters.
- Sign in, create a test booking, and confirm the booking appears in the admin dashboard.
- Apply as a provider, approve the provider in the dashboard, accept a test booking, then explicitly start and stop provider location sharing from the active job.

Use test accounts and test locations during acceptance testing. Do not use real customer records or precise provider positions for tests.

## Security and operational notes

- Keep admin access restricted to trusted operators. Use a unique password; do not reuse a personal email password.
- User sessions use random bearer tokens; only token hashes are stored in D1. Admin uses a Secure, HttpOnly, SameSite=Strict cookie.
- The API rate-limits registration/login attempts and rejects suspended accounts.
- Provider documents go to a private R2 bucket; the API does not expose the bucket publicly.
- Provider location sharing is explicit, active-job-only, foreground-only, and can be stopped. Recent locations are visible only to the assigned customer and authorized admin dashboard.
- Scheduled cleanup expires sessions/rate limits and deletes location samples older than 30 days.
- Backups, a recovery process for the initial administrator, and a custom domain should be configured before a public launch.

## Integrations not connected yet

The Cloudflare app has account registration/login, bookings, providers, tracking, an operations dashboard, D1 persistence, and private R2 document storage. It does not currently send SMS/OTP, push notifications, collect online payments, or pay providers. The payment view displays database payment records only. Pick the intended Algerian SMS and payment partners before implementing those integrations.
