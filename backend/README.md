# XcelerateAI Backend

This independent Node.js 24 and TypeScript package provides the trusted Fastify application-data boundary for XcelerateAI.

## Requirements

- Node.js 24 LTS
- npm
- A Supabase project using asymmetric JWT signing
- A PostgreSQL connection string for that project

Install dependencies with `npm install` from this directory.

## Private configuration checkpoint

Copy `.env.example` to `.env` and fill the required values locally. Never commit `.env` or paste its contents into documentation, issues, or chat.

Required variable names:

- `NODE_ENV`
- `HOST`
- `PORT`
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `CORS_ORIGINS`

`CORS_ORIGINS` is a comma-separated allowlist. Wildcard origins are rejected.

## Commands

- `npm run dev` — start the local API using `.env`
- `npm run migrate` — apply pending versioned SQL migrations
- `npm run verify:schema` — verify the live Phase 1 schema and migration checksum
- `npm run verify:profile-activity` — verify aggregate create/update activity without selecting identity data
- `npm test` — run backend tests
- `npm run typecheck` — validate TypeScript without output
- `npm run build` — compile to `dist/`
- `npm start` — run the compiled API using `.env`

## HTTP surface

- `GET /healthz` — process liveness; does not require authentication
- `GET /readyz` — PostgreSQL readiness; does not expose internal errors
- `GET /api/v1/profile/me` — create/read the verified learner's profile
- `PATCH /api/v1/profile/me` — update only the verified learner's display name

Profile routes accept Supabase bearer access tokens. The API validates ES256 signatures against the public JWKS, issuer, audience, expiry, authenticated role, and UUID subject. It then asks Supabase Auth for the current user record to enforce confirmed email before cloud profile access.

## Migrations

Migrations are ordered SQL files under `migrations/`. The runner holds a PostgreSQL advisory lock, records SHA-256 checksums in `public.schema_migrations`, applies each migration transactionally, and refuses to continue if an already-applied file changes.

Phase 1 uses create-on-first profile behavior. The authenticated JWT subject is the only accepted profile owner; request bodies cannot choose `user_id`.

## Auth email branding

Prepared confirmation and password-recovery templates live in `supabase/email-templates/`. Supabase's default development delivery is accepted for Phase 1. Applying the templates, adopting an owned domain, verifying DNS, configuring custom SMTP and a branded sender, and completing delivery testing are intentionally deferred to production readiness.

## Phase 1 acceptance

The owner manually accepted the guest/catalog experience, restoration of the existing learner state, cloud display-name persistence, verified-device offline learning, explicit logout with non-destructive restoration, and the real password-recovery flow. The authoritative access model is documented in `ARCHITECTURE.md`.

## Deferred tooling and dependency work

- The root lint script references ESLint, but ESLint is not currently installed. Repairing that tooling mismatch is deferred and is not a Phase 1 blocker.
- Four known frontend dependency advisories remain assigned to a dedicated upgrade task. Phase 1 does not force React Router 7, Vite 8, or `npm audit fix --force`.

## Phase 2 V2 progress synchronization

The authenticated progress surface is:

- `GET /api/v1/v2/learning-instances/:curriculumId` to fetch the verified learner's cloud-safe V2 progress projection.
- `PUT /api/v1/v2/learning-instances/:curriculumId` to conditionally create, synchronize, or reset that projection.

Phase 2 adds `learning_instances` and `learning_instance_mutations`. Each instance is uniquely owned by a JWT subject and curriculum, uses an optimistic `version`, and has a separate `generation` barrier so stale pre-reset progress cannot merge automatically after a reset. Mutation UUIDs are retained for exact idempotent retries. Progress writes use a transaction and conditional version/generation checks. Direct `anon` and `authenticated` database-table access is revoked; browser application data continues to flow through Fastify.

The progress PUT route alone accepts up to 1 MiB. The global API body limit remains 64 KiB. Only the published, cloud-enabled PYAE curriculum is accepted, currently at Revision 3 with learner-state schema version 1. `npm run verify:schema` verifies both Phase 1 and Phase 2 tables plus every applied migration checksum.
