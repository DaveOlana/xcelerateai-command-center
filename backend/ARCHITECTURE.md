# Backend Architecture

This document is the authoritative backend direction for the Phase 1 implementation.

## Trust boundaries

- The browser uses Supabase directly only for authentication and session operations.
- The browser sends application-data requests to the XcelerateAI Fastify API.
- Fastify verifies Supabase JWTs through the project's public asymmetric JWKS.
- Fastify connects privately to PostgreSQL and scopes profile data to the verified JWT subject.
- Database credentials never enter the frontend bundle.

The current ECC P-256 signing key is verified as `ES256` through:

`<SUPABASE_URL>/auth/v1/.well-known/jwks.json`

The API never decodes without verification, never treats the publishable key as a JWT secret, and does not request the legacy HS256 secret or a service-role key. JWKS discovery supports public-key rotation. After cryptographic verification, the authenticated Supabase user endpoint supplies the authoritative `email_confirmed_at` value used by the cloud gate.

## Modules

- `config` validates the complete runtime environment without echoing values.
- `db` owns PostgreSQL pooling and versioned migration execution.
- `plugins/auth` owns bearer parsing, ES256/JWKS verification, and confirmed-email identity.
- `modules/health` owns liveness and dependency readiness.
- `modules/profile` owns create-on-first profile persistence and display-name updates.

The API uses strict origin allowlisting, Helmet, bounded request bodies, parameterized queries, safe public errors, and JWT-derived ownership. These controls are a Phase 1 baseline, not a claim of complete application security.

## Local-first boundary

A verified account is required to activate the full learner experience. Guests and unverified accounts may use entry, authentication, catalog exploration, and safe Settings surfaces, but cannot access or mutate private learner progress.

The browser records a minimal `xcelerate.auth.verified-device.v1` ownership marker separately from learner state. The first verified account claims the existing local record; the same account can restore it later. Temporary network loss permits an active, previously verified device to continue local learning, while explicit logout returns the app to guest access without deleting progress. A different verified account receives an ownership-conflict screen and cannot view, delete, merge, or silently reassign the bound data.

This marker is an offline UX entitlement only. It is never sent as backend proof and never contains a bearer token. Fastify always requires a valid cryptographically verified Supabase token. Phase 1 intentionally supports one local learner owner per browser profile; multi-account and cloud synchronization belong to Phase 2.

`AppContext`, Curriculum Engine V2, PYAE Revision 3, and existing local learner-state/revision semantics remain authoritative and unchanged.

## Phase ownership

Phase 1 owns backend foundation, identity verification, health/readiness, and the minimal learner profile. It does not own progress synchronization, learning instances, conflict resolution, queues, AI execution, or learner-code execution.

The owner accepted the Phase 1 identity behavior after manually verifying guest catalog access, existing-state restoration, cloud profile persistence, offline verified-device learning, non-destructive logout and sign-in restoration, and password recovery. Branded authentication delivery is separately deferred until XcelerateAI has an owned domain, verified DNS, custom SMTP, a branded sender address, applied templates, and delivery testing.

The historical Phase 9 direct-to-Supabase application-data proposal is superseded. Phase 2 may add V2 learner-state synchronization through the Fastify API without changing immutable curriculum truth.
