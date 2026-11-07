# Build Verification

The GitHub Actions workflow named Wessali CI is the canonical hosted validation for this repository.

The validation sequence is:

1. Install the pinned Node.js and pnpm runtimes.
2. Install workspace dependencies and generate the pnpm lockfile when it is first created.
3. Run Prettier over the application and package sources.
4. Reinstall with the frozen lockfile.
5. Run the repository validation script: formatting checks, Turbo TypeScript checks, unit tests, and production builds.

The mobile build exports Android and iOS JavaScript bundles through Expo. It does not sign or produce store-ready APK/AAB/IPA files. Native signing, deployment credentials, real SMS/maps/payment integrations, database provisioning, and physical-device checks remain release tasks.

A green CI result verifies that the checked-in scaffold builds in the hosted Linux environment. It does not mean that unfinished booking, authentication, matching, tracking, payment, or provider workflows are already implemented.
