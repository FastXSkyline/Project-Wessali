# Wessali — Local Development

## Requirements

- Node.js 24.22.2.
- pnpm 12.18.0.
- Git.
- PostgreSQL 17 with PostGIS 3.7 (Docker Compose is optional).
- Redis 7.4 is optional until the worker/queue features are used.
- Android Studio for local Android native builds.
- macOS and Xcode for local iOS native builds.

## 1. Install

~~~bash
pnpm install --frozen-lockfile
~~~

Copy `.env.example` to `.env`. Configure `DATABASE_URL` for a local PostgreSQL instance with PostGIS enabled.

PowerShell:

~~~powershell
Copy-Item .env.example .env
~~~

The checked-in credentials are development-only examples. Do not use them for a public deployment.

## 2. Database

Use Docker Compose:

~~~bash
pnpm db:up
pnpm db:migrate
~~~

Or run PostgreSQL/PostGIS yourself and point `DATABASE_URL` at it, then:

~~~bash
pnpm db:migrate
~~~

PostgreSQL uses port 5432 by default. Redis uses port 6379. The core booking API requires PostgreSQL. Redis is only required by the background worker/queue.

## 3. Local demo accounts

The starter release includes a **development-only sign-in** so customer, provider, and admin workflows can be exercised before an OTP supplier has been selected.

Keep `ALLOW_DEV_AUTH=true` only in local development. The API refuses this sign-in when `NODE_ENV=production`.

- Customer: choose customer mode, enter a name and an E.164 phone such as `+213555123456`.
- Provider: choose provider mode and use a different phone number; submit a provider application.
- Admin: open the admin website and sign in with username `fastx` and the `ADMIN_DEMO_KEY` from your local `.env` as the password (default example: `local-admin-change-me`), then approve provider applications. Change `ADMIN_DEMO_USERNAME` and `ADMIN_DEMO_KEY` in `.env` to customize the local credentials.

This is not real phone verification and is not suitable for public production use. Before launch, replace it with OTP verification, protected admin authentication, rate limiting, and session/device controls.

## 4. Start the API, admin, and mobile

From the repository root:

~~~bash
pnpm dev:core
~~~

| App | Address |
|---|---|
| Admin | http://localhost:3000 |
| API | http://localhost:4000/v1 |
| API health | http://localhost:4000/v1/health |
| Mobile | Expo CLI terminal and QR code |

For a physical phone on the same Wi-Fi, set `EXPO_PUBLIC_API_BASE_URL` to the PC's LAN IP, for example `http://192.168.1.20:4000/v1`, before creating a new mobile build. Allow inbound TCP port 4000 in Windows Firewall for private networks only. The mobile sign-in screen lets you edit the API base URL for the current app session.

Start a single workspace:

~~~bash
pnpm --filter @wessali/admin dev
pnpm --filter @wessali/api dev
pnpm --filter @wessali/mobile dev
~~~

## 5. End-to-end demo flow

1. Sign in on mobile as a customer and submit a freight, roadside, or water request.
2. Sign in on a second device/session as a provider, submit the service application, and wait for approval.
3. Sign in to the admin website using the local admin key and approve the provider application.
4. Refresh the provider request list, accept a matching request, and advance the job through en-route, arrived, in-progress, and completed.
5. Return to customer mode to see the booking status.

The demo currently uses manual address entry; it does not provide live maps, automatic matching, GPS tracking, SMS, online payments, or push notifications.

## 6. Validate

~~~bash
pnpm validate
~~~

The validation command runs lint, typecheck, tests, and workspace builds.

## 7. Production checklist

Before public use: implement real OTP authentication and stronger admin RBAC; configure private document storage; select and integrate maps/routing, push/SMS, and payment/settlement vendors; complete Algerian legal/compliance review; add operational rate limits and observability; and test backups/restores and device workflows.
