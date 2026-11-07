# Wessali — Local Development

## Requirements

- Node.js 24.22.2.
- pnpm 12.18.0.
- Git.
- Docker Desktop with Docker Compose.
- Android Studio and an emulator for local Android device builds.
- macOS and Xcode for local iOS simulator/device builds.

Check versions:

~~~bash
node --version
pnpm --version
git --version
docker --version
docker compose version
~~~

## 1. Clone and install

~~~bash
git clone https://github.com/FastXSkyline/Project-Wessali.git
cd Project-Wessali
pnpm install
~~~

Copy .env.example to .env.

PowerShell:

~~~powershell
Copy-Item .env.example .env
~~~

macOS / Linux:

~~~bash
cp .env.example .env
~~~

The checked-in values are local development defaults only.

## 2. Start local infrastructure

~~~bash
pnpm db:up
~~~

PostgreSQL/PostGIS uses port 5432. Redis uses port 6379. Wait for both containers to become healthy.

## 3. Apply database migrations

~~~bash
pnpm db:migrate
~~~

Applied SQL filenames are recorded in schema_migrations.

## 4. Start the workspaces

~~~bash
pnpm dev
~~~

| App | Address |
|---|---|
| Admin | http://localhost:3000 |
| API | http://localhost:4000/v1 |
| API health | http://localhost:4000/v1/health |
| Mobile | Expo CLI terminal and QR code |
| Worker | Background process; requires Redis |

Start one workspace:

~~~bash
pnpm --filter @wessali/mobile dev
pnpm --filter @wessali/admin dev
pnpm --filter @wessali/api dev
pnpm --filter @wessali/worker dev
~~~

## 5. Validate

~~~bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm validate
~~~

The mobile CI build exports Android and iOS JavaScript bundles. It does not create signed Play Store or App Store binaries.

## 6. Native mobile builds

Android device builds require Android tooling. Local iOS builds require macOS and Xcode. Cloud iOS builds need separately configured build credentials. Never commit signing certificates, provisioning profiles, keystores, or service credentials.

## Troubleshooting

- Docker unavailable: start Docker Desktop and rerun pnpm db:up.
- Port 5432/6379 occupied: stop the conflicting service or change the host port mapping.
- API cannot connect: check container health and DATABASE_URL.
- Worker cannot connect: check Redis health and REDIS_URL.
- Expo cannot resolve a workspace package: run pnpm install from the repository root.
- Arabic layout appears LTR: confirm locale ar and apply RTL direction to the root layout.
