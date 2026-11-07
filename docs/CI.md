# Continuous Integration

The Wessali CI workflow runs on pushes to main, pull requests targeting main, and manual workflow dispatch.

The workflow uses the repository's pinned Node.js version from .nvmrc and pnpm version from the root packageManager field. The pnpm setup action requires the committed workspace lockfile and performs a frozen install before validation.

Before code validation, CI starts the same PostgreSQL/PostGIS and Redis services defined in docker-compose.yml, waits for their health checks, creates a local environment file from .env.example, applies the SQL migrations, verifies the bookings table and PostGIS extension, and pings Redis.

The workspace validation command runs:
- Prettier checks.
- TypeScript checks for all workspaces.
- Unit tests for the API and shared contracts.
- Production builds for the Expo Android/iOS JavaScript bundles, Next.js admin app, NestJS API, worker, and shared packages.

The workflow has read-only repository permissions; it does not rewrite source files or push commits from CI.

The Expo build exports Android and iOS JavaScript bundles. Store-signed native binaries, production credentials, live external integrations, and physical-device acceptance testing are separate release activities.
