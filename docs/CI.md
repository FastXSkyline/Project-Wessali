# Continuous Integration

The Wessali CI workflow runs on pushes to main, pull requests targeting main, and manual workflow dispatch.

It installs the pinned Node.js and pnpm versions, resolves and records the workspace lockfile, formats the source files, then verifies a frozen install. The validation command runs formatting checks, TypeScript checks, unit tests, and production builds for the mobile bundles, admin app, API, worker, and shared packages.

The Expo build exports Android and iOS JavaScript bundles. Store-signed native binaries, production credentials, live external integrations, and physical-device acceptance testing are separate release activities.
