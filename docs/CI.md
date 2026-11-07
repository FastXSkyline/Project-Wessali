# Continuous Integration

The Wessali CI workflow runs on pushes to main, pull requests targeting main, and manual workflow dispatch.

The workflow uses the repository's pinned Node.js version from .nvmrc and pnpm version from the root packageManager field. The pnpm setup action requires the committed workspace lockfile and performs a frozen install before validation.

The validation command runs:
- Prettier checks.
- TypeScript checks for all workspaces.
- Unit tests for the API and shared contracts.
- Production builds for the Expo Android/iOS JavaScript bundles, Next.js admin app, NestJS API, worker, and shared packages.

The workflow has read-only repository permissions; it does not rewrite source files or push commits from CI.

The Expo build exports Android and iOS JavaScript bundles. Store-signed native binaries, production credentials, live external integrations, and physical-device acceptance testing are separate release activities.
