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
- `verification` owns immutable verifier results, server structural checks, the explicit browser-Python registry, and disabled future adapter declarations.
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

The historical Phase 9 direct-to-Supabase application-data proposal is superseded. V2 learner-state synchronization flows through the Fastify API without changing immutable curriculum truth.

## Phase 2 progress synchronization

Normal learning remains local-first: AppContext persists learner activity immediately, while a dedicated SyncContext observes and coalesces the published V2 curriculum state. `projectForCloud` removes local-only `questionSnapshot` curriculum content and filters Notes/Blockers to the current published V2 curriculum. `hydrateFromCloud` reconciles the projection through the current curriculum runtime and retains matching local historical snapshots when available. The backend validates and persists this projection; it does not own curriculum content or educational progression rules.

Cloud state is keyed by authenticated user and curriculum. A deterministic, recursively key-sorted JSON representation feeds UTF-8 SHA-256 hashes in both browser and backend; the backend always recomputes authoritative state and request hashes. Writes carry an expected version, expected reset generation, and UUID mutation ID. PostgreSQL serializes mutations inside a transaction and records mutation acknowledgements for exact retries.

The browser stores coordination metadata separately under `xca_v2_sync_metadata_v1`, nested by account ID and curriculum ID. A record contains the last cloud base state/hash/version/generation, dirty state, at most one exact persisted in-flight mutation, an optional pending reset with its recovery branch, and any preserved conflict branches. This key is excluded from learner backup/export/import. A separate short-lived `xca_v2_sync_lease_v1:<userId>:<curriculumId>` key and BroadcastChannel/storage events reduce routine duplicate writes across tabs; server concurrency remains authoritative.

Only proven-safe same-generation changes merge automatically. Monotonic week/stage/resource achievements are protected; stable-ID Skill Check attempts union only when identical; Builds use per-ID three-way semantics; learner-authored Proof, Reflection, Note, and Blocker conflicts remain preserved for focused resolution. Note/Blocker deletions use tombstones. A generation mismatch pauses writes and preserves base/local/remote branches instead of resurrecting pre-reset history.

Phase 2 remains deliberately narrow: it does not add curriculum authoring, AI execution, evidence-file storage, portfolio publishing, analytics, or learner-code execution.

## Phase 3 evidence submission

Phase 3 adds a separate evidence authority without embedding submission identities or binary data into Phase 2 learner snapshots. Existing Proof values remain editable, local-first drafts. For incomplete PYAE Revision 3 weeks, Proof submission satisfaction now requires a current server-acknowledged `submitted` record; it does not require or imply verification. Previously completed weeks remain durable across this change.

`evidence_submissions` provides immutable revisions and authoritative timestamps. Resubmission atomically supersedes the current revision, while withdrawal changes lifecycle status without deleting history. `evidence_items` holds strict structured payloads for text, URL, repository, file reference, and explicit self-attestation. `evidence_assets` tracks private object metadata, upload readiness, byte count, detected MIME, and SHA-256. Direct `anon` and `authenticated` table privileges are revoked, and all ownership derives from the verified JWT subject.

Private binary upload uses a purpose-specific Fastify intent, a short-lived Supabase signed upload authorization, and backend finalization that downloads and inspects the stored bytes before marking the asset ready. The server-only `SUPABASE_SECRET_KEY` is never returned to the browser. Objects use opaque user-ID paths, are not publicly enumerable, and are accessed later only through short-lived signed downloads. Stored ZIPs are never extracted or executed; MIME inspection is not represented as malware scanning.

The browser keeps evidence receipts, staged asset metadata, and retryable submission operations in an account-namespaced evidence store separate from AppContext and SyncContext. No File/Blob bytes enter localStorage. Offline text/link/repository/attestation submissions queue for retry but do not satisfy Proof until the server acknowledges them. Account switches load a different namespace. Normal backup/export/import deliberately excludes evidence cache, outbox, submission IDs, and binary files. Course reset withdraws current submissions and preserves immutable history.

Phase 3 does not add verification results, grading, AI review, code execution, public portfolios, or competency confirmation. A future verifier can reference an immutable `evidence_submission_id` without mutating the evidence record.

## Backend V1 verification foundation

The additive verification layer references immutable evidence submissions without changing Proof completion. Server structural checks establish only that the required item, allowed method, and finalized file metadata exist. Browser Python results are stored as `client_advisory` and shown as automated checks, never as verified competency. Results contain bounded check records and an optional SHA-256 source fingerprint; learner source code itself is not uploaded or persisted.

Browser Python support is intentionally limited to `PYAE-PR-W03-E01`. A local `service.py` is parsed by a controlled Python AST harness inside a dedicated Web Worker to check syntax, named service functions, explicit returns, and separation from `input()`/`print()`. Pyodide is pinned to the official CDN release and loaded only when the learner invokes this check. The worker receives no React objects, DOM reference, bearer token, Supabase session, or privileged API client, and is terminated on completion, error, oversized output, or timeout.

The registry marks server sandbox and AI rubric verifiers as unavailable extension points. No paid execution or inference service is called. Unsupported PYAE tasks retain `Submitted · Not yet verified` and ordinary progression remains based on curriculum gates plus formal evidence submission.
