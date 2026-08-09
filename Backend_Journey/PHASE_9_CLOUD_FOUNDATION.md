# Phase 9 — Cloud Foundation

## Architecture Contract for XcelerateAI Command Center

**This document is a contract, not a proposal.** Every decision recorded here is locked. Phase 9 implementation must conform to this document exactly. Where an implementation detail is not covered here, it must be resolved by extending this document's existing reasoning and principles — never by inventing new scope, and never by silently deviating from a rule stated here. If a change is genuinely needed, this document is amended first; code follows.

This is not a summary written after the fact. It is written before a single line of Phase 9 code exists, specifically so implementation has one authoritative source to build against.

---

## Existing System Reference

*(Grounding, so this contract can be implemented without needing to independently rediscover the current repository. Verified directly against the live codebase, not assumed.)*

- **Frontend:** React 18 + Vite + React Router + Tailwind CSS, in `xcelerate-command-center/`. Phase 8C (the Educational Experience Engine) is complete and is **not** touched by this document.
- **Current state model:** one global `AppContext.jsx` owns all application state and persists it through two helpers, `loadFromStorage(key, fallback)` / `saveToStorage(key, value)`, writing to `localStorage`. No component touches `localStorage` directly — every mutation goes through a named context action. This is the exact shape Phase 9 extends; it is not replaced.
- **Curriculum:** authored externally as a single JSON file, imported through the existing Import Roadmap screen, normalized by `normalizeRoadmap.js` into one canonical shape regardless of which JSON dialect the author used. **`normalizeRoadmap.js` and `unlockChecker.js` are untouched by Phase 9** — the same rule Phase 8C already followed.
- **Existing re-import behavior (directly relevant to Section 4):** `AppContext.jsx`'s `importRoadmap()` action already resets all progress state and rotates a local backup (`xca_import_backup_1` / `xca_import_backup_2`) whenever a new curriculum is imported over an existing one. Phase 9 extends this exact, already-shipped pattern — it does not invent a new one.
- **Route gating:** `DataGuard` redirects to `/import` when no roadmap is loaded. Phase 9 adds a second, independent gate — verified-auth state — without altering `DataGuard`'s existing logic.
- **Existing reusable UI (must be reused, not reinvented):** `StatusBanner`, `ConfirmAction`, `InlineStatus`, `LoadingIndicator` (`src/components/ui/`). No browser `alert()`/`confirm()`/`prompt()` exists anywhere in the app today — this discipline is preserved.
- **Progress data shape, authoritative source:** the exported Elliot learner backup and the current `localStorage` implementation (table below) are the ground truth for what "progress" actually looks like. Phase 9 mirrors this shape (Section 3, principle 7) rather than redesigning it.

### Current persisted state — the definition of "Progress"

| `localStorage` key | Holds | In scope for cloud sync |
|---|---|---|
| `xca_roadmap` | Active normalized curriculum | Yes — becomes the Learning Instance's curriculum snapshot |
| `xca_progress` | `completedTasks`, `completedWeeks`, project milestones, GitHub links, project notes | Yes |
| `xca_resources_status` | Per-resource completion | Yes |
| `xca_skill_checks` | Skill-check status | Yes |
| `xca_practical_missions` | Practical mission completion | Yes |
| `xca_checkpoints` | Checkpoint confidence ratings | Yes |
| `xca_week_proofs` | Proof submissions (links today; files added in Phase 9) | Yes |
| `xca_week_reflections` | Per-week reflection text | Yes |
| `xca_notes` | Journal entries | Yes |
| `xca_blockers` | Blocker log | Yes |
| `xca_streak` | Streak counters | Yes |
| `xca_timer_history` | Past study session log | Yes |
| `xca_settings` | Active week/month (current location), mentor name, start date, weekly-hours target | Yes |
| `xca_session_timer` | Live, in-progress Pomodoro countdown | **No** — ephemeral, device-local; resuming a live countdown on another device is meaningless |
| `xcelerate.userProfile`, `xcelerate.onboarding.*`, `xai_*` | Local profile seed, onboarding flags, UI toggles | Onboarding/UI flags: **No** (cosmetic, not learning progress). Local profile: seeds the cloud `profiles` row once, then is superseded by it. |

---

## 1. Project Philosophy

Phase 9 exists to answer one question: **can a learner log in on a different device and continue exactly where they stopped?** Everything in this document exists in service of that question and nothing else.

Phase 9 is named **Cloud Foundation**. It is not "Backend Platform," not "Admin System," not "Learning Management System," and it does not become any of those things through scope drift during implementation. The frontend's learning experience, visual language, and offline-first responsiveness — all already shipped through Phase 8C — are preserved unchanged. Phase 9 adds a persistence and identity layer underneath the existing app; it does not modify what the app teaches or how it presents learning.

---

## 2. Scope

### 2.1 In Scope

| # | Capability |
|---|---|
| 1 | Register (email + password) |
| 2 | Verify email (mandatory — see Section 5) |
| 3 | Login |
| 4 | Logout |
| 5 | Reset password |
| 6 | User profile |
| 7 | Load a curriculum (existing import flow, now also seeding/replacing a Learning Instance) |
| 8 | Create a Learning Instance |
| 9 | Save progress — fully automatic, no save button |
| 10 | Load progress on any device |
| 11 | Continue learning on another device with zero manual steps |
| 12 | Proof-of-work file upload (images, PDFs, ZIPs, videos) — completes the existing proof system, not a future feature |
| 13 | Confirmation dialog when importing a curriculum that would replace an active Learning Instance |

### 2.2 Explicitly Out of Scope

AI / Mentor System · XP · Badges · Achievements · Certificates · Analytics (admin-facing) · Admin Dashboard · Curriculum Assignment · Notifications · Marketplace · Payments · Teams · Gamification · Multiple Simultaneous Learning Instances · Curriculum Editing · **Merge-based conflict resolution** (explicitly reserved for a future phase — see Section 16).

None of the above are designed, scaffolded, or partially implemented in Phase 9. Section 20 names them again for planning continuity only.

---

## 3. Core Backend Principles

1. **No custom server.** The frontend talks to Supabase directly via `@supabase/supabase-js`. Postgres Row-Level-Security is the entire authorization boundary. There is no API server to design, deploy, or keep available.
2. **Deterministic over clever.** Every synchronization decision in this document resolves to one unambiguous outcome given the same inputs. No probabilistic merging, no silent partial application of changes.
3. **Extend, don't replace.** Phase 9 builds on the existing `AppContext.jsx` action pattern, the existing re-import/backup behavior, and the existing UI component kit. Nothing here restructures frontend architecture that Phase 8C already stabilized.
4. **The curriculum is immutable once attached to a Learning Instance.** The backend never generates, edits, or assigns curriculum content.
5. **Local-first UX is non-negotiable.** Every write still lands in `localStorage` instantly, exactly as today. Cloud sync is a layer behind that, never a blocking step in front of it. A learner with no account still uses the full app, entirely locally.
6. **Build only what Section 2.1 requires.** Any capability not in that list does not get built, not even in a reduced or "just in case" form.
7. **The progress data model is a mirror, not a redesign.** V1's `progress_state` (Section 9) reproduces the existing `localStorage` progress shape exactly — the same keys, the same nesting, the same structure the frontend already persists today. It is not normalized, split into additional tables, or restructured for storage efficiency. During implementation, the exported Elliot learner backup and the current `localStorage` implementation are the source of truth for that shape — the schema conforms to them, not the reverse. Optimizing this shape is explicitly deferred to a future phase, and only if a measurable need for it exists.

---

## 4. Learning Instance Architecture

**Definition:** the Learning Instance is the cloud-side object that binds one learner to one curriculum and everything they have done inside it. It is the single unit that makes cross-device continuity possible — a brand-new device with zero local data can reconstruct the learner's entire state from one Learning Instance.

A Learning Instance holds:

| Component | Source (Existing System Reference table) |
|---|---|
| Learner identity | `auth.uid()` |
| Curriculum snapshot | `xca_roadmap`, frozen at creation/replacement time |
| Mission / step / resource completion | `xca_progress`, `xca_resources_status`, `xca_skill_checks`, `xca_practical_missions` |
| Checkpoints | `xca_checkpoints` |
| Reflections | `xca_week_reflections` |
| Notes | `xca_notes` |
| Blockers | `xca_blockers` |
| Proof (links + files) | `xca_week_proofs` + Storage Bucket references |
| Streak & study history | `xca_streak`, `xca_timer_history` |
| Current location & settings | `xca_settings` |
| `updated_at` | One audit timestamp for the whole instance — informational only, see Section 9 |

**V1 cardinality: exactly one Learning Instance per user**, enforced by a uniqueness constraint on `user_id` (Section 9) — not a soft "active" flag, because there is nothing else it could point to in V1.

The components above are a definitional list, not a field-by-field schema — Section 9 defines exactly how this content is actually stored.

### 4.1 Replacing a Learning Instance (new curriculum import)

This extends the existing `importRoadmap()` behavior (Existing System Reference) rather than replacing it:

1. Learner initiates an import while existing progress would be discarded — whether or not they are authenticated. The confirmation requirement (step 2) is about protecting the learner's progress, not about the existence of a cloud Learning Instance specifically, so it applies the same way in guest/local-only mode as it does for a cloud-connected account.
2. **A confirmation dialog appears**, built from the existing `ConfirmAction` component — no new dialog pattern. It states plainly that the current learning journey will be replaced.
3. If the learner cancels, nothing changes.
4. If the learner confirms: the existing local reset-and-backup behavior runs (progress state reset, local backup rotated, exactly as it does today) and, if the learner is authenticated, the Learning Instance's curriculum snapshot and progress are replaced in the cloud to match.
5. The old cloud state is not merged with the new curriculum — progress is tied to the old curriculum's week/mission IDs, which have no guaranteed correspondence in a different curriculum.
6. Re-importing the *same* curriculum unchanged is not special-cased or detected — it follows the identical reset-and-confirm path as importing a genuinely different one, matching the existing app's behavior today.

**Hard rule (unchanged from the general philosophy):** nothing a learner does ever writes back into a curriculum snapshot. Snapshots are read-only from the moment they exist.

**Known limitation:** once a Learning Instance's progress is replaced, it is gone from the cloud — there is no cloud-side history or versioning of a prior Learning Instance in V1. The existing local backup rotation (`xca_import_backup_1`/`_2`) remains the only safety net, and it is local-only, not synced. This is consistent with Section 2.2 excluding multiple/historical Learning Instances, not an oversight.

---

## 5. Authentication Architecture

Authentication is handled entirely by **Supabase Auth**. No custom password hashing, token issuance, session logic, or reset-token generation is written for this project.

```
 Register
    │  (email + password)
    ▼
 Verification Email  ── sent automatically by Supabase Auth
    │
    ▼
 User Verifies Email  ── email_confirmed_at is set
    │
    ▼
 Login  ── rejected if email is not yet verified
    │
    ▼
 Dashboard  ── the learning application itself
```

**Mandatory gate (locked):** an unverified account cannot reach the dashboard. This is enforced at two layers, not one, since a session token existing does not by itself guarantee a verified email:
1. **Supabase project setting** — "Confirm email" enabled, so `signInWithPassword()` itself fails for an unconfirmed account.
2. **Frontend route guard** — an auth-aware check, sitting alongside the existing `DataGuard` (Existing System Reference), that inspects the session's `email_confirmed_at` before allowing navigation past the verification screen, so a stale or manually-crafted session cannot bypass the gate either.

**Logout:** client discards the session; Supabase invalidates the refresh token.

**Password reset:** learner requests a reset → Supabase emails a single-use, time-limited link → learner sets a new password → a fresh session is issued. No custom expiry or token logic.

**Session persistence:** `supabase-js` persists the session client-side and silently refreshes the access token using the refresh token. App boot checks for an existing, verified session before deciding between authenticated (cloud-synced) mode and guest (local-only) mode.

**Unauthenticated usage:** unchanged from today. A visitor with no account uses the full app, entirely locally. Registering is what turns cloud sync on — it is never a precondition for using the app at all (Section 3, principle 5).

---

## 6. User Profile Architecture

One profile row per user, created at registration, editable afterward.

| Field | Notes |
|---|---|
| Username | Learner-chosen display identity; seeded from the existing local `xcelerate.userProfile.name` if present, falling back to the email's local part (before `@`) if no local profile exists — always editable afterward |
| Email | Mirrors Supabase Auth's own record, for display |
| Phone Number | Optional |
| Country | Optional |
| Timezone | Optional. Stored for future use; Phase 9 does not change how streak/date logic works — that logic already exists in the frontend (`markStudyToday()`) and is untouched (Section 3, principle 7) |
| Experience Level | Optional |
| Career Goal | Optional, free text |
| Created At | Set once |
| Last Login | Updated on each successful login |
| Account Status | Single field, e.g. `active` / `disabled`. Present structurally, per the original field list — no state-transition logic exists in Phase 9 (nothing sets it to anything other than `active`); it is not a permissions system and has no admin surface to change it (Section 2.2) |

**Explicitly excluded:** Occupation.

---

## 7. Cloud Synchronization Lifecycle

This section describes the lifecycle end-to-end, at a conceptual level. Exact timing and comparison rules are formalized in Section 16.

```
 Registration
    │
    ▼
 First curriculum import (authenticated)
    │
    ▼
 Learning Instance created in the cloud, seeded from local state
    │
    ▼
 ┌─────────────────────────────────────────────┐
 │  Continuous local writes (instant, unchanged) │
 │       │                                       │
 │       ▼                                       │
 │  Debounced push to Supabase                   │
 └─────────────────────────────────────────────┘
    │
    ▼
 App reopened / regains focus / reconnects
    │
    ▼
 Pull cloud state (Section 16.1)
    │
    ▼
 Cloud is unconditionally authoritative — replace local wholesale, no merge
```

Every step above uses the same mechanism regardless of which device triggers it. There is no special-cased "first device" logic beyond the naturally deterministic outcome of "no cloud instance exists yet" (Section 16.1).

---

## 8. Cross-Device Synchronization

```
   Laptop A                     Supabase Cloud                    Phone B
  ┌──────────┐                 ┌───────────────┐                ┌──────────┐
  │  Local    │ debounced push  │   Postgres     │  pull on login │  Local    │
  │  state    │ ───────────────►│ (single source │───────────────►│  state    │
  │ (instant) │                 │   of truth)    │                │ (instant) │
  └──────────┘                 └───────────────┘                └──────────┘
```

**No import. No export. No manual synchronization step.** The learner's only actions are logging in and learning.

**Worked example (matches Section 21's acceptance scenario):**
1. Learner registers, verifies email, logs in on Laptop A.
2. Learner imports a curriculum → Learning Instance created in the cloud.
3. Learner completes several missions → saved locally instantly, pushed to Supabase within seconds.
4. Learner closes Laptop A.
5. Learner logs in on Phone B for the first time → no local Learning Instance exists on this device → the cloud Learning Instance is downloaded in full and becomes Phone B's local state (Section 16's deterministic rule).
6. Learner completes another mission on Phone B → pushed to Supabase.
7. Learner reopens Laptop A → app pulls on load → a cloud Learning Instance exists, so it is unconditionally authoritative (Section 16.1) → Laptop A's local state is replaced wholesale with the cloud's → the mission completed on Phone B in step 6 is now visible on Laptop A.

---

## 9. Database Conceptual Model

No SQL is specified here — entities and relationships only. Exact table definitions are a Phase 9 build-time detail, not a decision this contract makes.

```
   Users (Supabase Auth, managed)
     │ 1
     │ 1
   Profiles
     │
     │ 1
     │ 1   (unique constraint on user_id — enforces Section 4's V1 cardinality)
   Learning Instances
     │
     │ 1
     │ N
   Proof   (one row per week/mission with a submission)
```

**Users** — Supabase Auth-managed, not designed here. Every other entity references it via `user_id` / `auth.uid()`.

**Profiles** (1:1 with Users) — fields per Section 6.

**Learning Instances** (1:1 with Users) —

| Field | Description |
|---|---|
| `id` | Primary key |
| `user_id` | FK, unique |
| `curriculum_title` | Display name |
| `curriculum_snapshot` | Immutable curriculum JSON (Section 4) |
| `progress_state` | The Learning Instance's progress content (Section 4's table). **Mirrors the existing `localStorage` progress shape exactly** (Existing System Reference, Section 3 principle 7) — the same keyed structure the frontend already persists today, stored as-is. It is not normalized, split into additional tables, or restructured for V1. |
| `updated_at` | Audit/display timestamp (e.g. "last synced X ago"). It does not drive any sync decision — Section 16.1's rule is unconditional and does not compare timestamps. |
| `created_at` | Set once |

**Proof** (1:N under a Learning Instance) —

| Field | Description |
|---|---|
| `id` | Primary key |
| `learning_instance_id` | FK |
| `week_or_mission_ref` | Which week/mission this belongs to |
| `github_repo_link`, `github_commit_link` | Plain URL text fields |
| `file_refs` | Pointers to Storage Bucket objects (Section 10), if any |
| `submitted_at`, `updated_at` | Display-only timestamps (when first submitted, when last touched) — neither drives a sync decision |

Proof rows carry no independent sync logic of their own. They are downloaded/replaced together with the rest of the Learning Instance as part of Section 16.1's whole-instance rule — there is no proof-level comparison, versioning, or merge.

**Access control:** every table is scoped by Row-Level-Security to `auth.uid()`, directly or via the Learning Instance relationship. This is the complete authorization model — no roles, no admin bypass, no shared access.

---

## 10. Storage Architecture

| Data | Mechanism | Why |
|---|---|---|
| Profiles, Learning Instances, Progress, Proof metadata | **Database** (Postgres) | Structured, small, queryable |
| Proof images, PDFs, ZIPs, videos | **Storage bucket** (private, signed URLs) | Binary, large, not queryable |
| GitHub repository links | **Plain URL field in the database** | Already just a link |

**Proof upload is in scope for Phase 9 (locked decision).** The existing app has no file-upload UI anywhere today — only the GitHub-link fields. Phase 9 builds the upload interface (file picker on the Proof stage) as part of completing the existing proof-of-work system, not as a new feature bolted on separately.

**Bucket configuration:**
- **Private buckets**, no public URLs. Every file access uses a short-lived **signed URL**, generated on demand.
- **Per-file cap: 25MB.** A limit must exist; this number is adjustable but not zero.
- **Accepted types:** images (`jpg`, `png`, `webp`, `gif`), `pdf`, `zip`, video (`mp4`, `mov`). Rejected client-side before upload begins.
- One file belongs to exactly one Proof row, under exactly one Learning Instance.

---

## 11. API Blueprint

**No custom REST API exists.** The frontend calls Supabase directly via its client SDK; Row-Level-Security (Section 9) makes this safe regardless of what the client requests. The groupings below are the *capabilities* Phase 9 needs and which Supabase subsystem provides each — this is an architectural mapping (which subsystem owns which capability), not an implementation guide for how the client code is written.

**Authentication** — provided entirely by Supabase Auth
| Capability | Supabase subsystem |
|---|---|
| Register | Auth: sign-up |
| Verify email | Auth: confirmation-link redirect (automatic) |
| Login | Auth: password sign-in (fails if unverified) |
| Logout | Auth: sign-out |
| Reset password | Auth: password-reset email + update |
| Session check/refresh | Auth: session retrieval (automatic) |

**Profile** — provided by a database table
| Capability | Supabase subsystem |
|---|---|
| Create (on first verified login) | Database: insert into `profiles` |
| Read | Database: select, scoped by RLS to the caller |
| Update | Database: update own row |

**Learning Instance** — provided by a database table
| Capability | Supabase subsystem |
|---|---|
| Create | Database: insert into `learning_instances` |
| Read (login / boot / focus / reconnect) | Database: select, scoped by RLS to the caller |
| Replace (re-import per Section 4.1, or an authoritative pull per Section 16.1) | Database: wholesale update of `curriculum_snapshot`, `progress_state`, `updated_at` |

**Progress** — part of the same `learning_instances` table, not a separate store
| Capability | Supabase subsystem |
|---|---|
| Push (debounced, automatic) | Database: update `progress_state` + `updated_at` |
| Pull (on boot/focus/reconnect) | Database: select, then apply Section 16.1's unconditional rule |

**Proof** — a database table plus a storage bucket
| Capability | Supabase subsystem |
|---|---|
| Submit GitHub links | Database: upsert into `proof` |
| Upload file | Storage: upload to the private bucket, path stored in `file_refs` |
| View file | Storage: generate a short-lived signed URL |

Nothing beyond these five groups is required to satisfy Section 2.1.

---

## 12. Folder Structure

This contract lives at `Backend_Journey/PHASE_9_CLOUD_FOUNDATION.md`. There is no separate backend service (Section 3, principle 1) — implementation code lives inside the application repository, at the folder level:

```
xcelerate-command-center/
├── supabase/          # Supabase project config + versioned schema migrations (Section 14)
├── src/
│   ├── lib/            # Supabase client integration
│   ├── sync/            # Sync module (Section 13)
│   ├── context/          # Auth session state, alongside the existing AppContext
│   ├── pages/auth/        # Register, Login, Verify Email, Reset Password, Profile screens
│   ├── components/auth/    # Auth UI, composed from the existing design system (Existing System Reference)
│   └── ai/                  # RESERVED, empty — see Section 20
└── .env                      # Supabase project credentials (gitignored)
```

This is a location map, not a file-by-file design — how each folder's contents are internally split into files is an implementation decision made during the build, not a decision this contract makes. Section 13 defines the responsibilities each folder's module is accountable for.

---

## 13. Backend Module Organization

Independent of the literal file tree above, Phase 9 introduces four logical modules. Each has one responsibility and does not reach into another module's concern:

| Module | Responsibility | Depends on |
|---|---|---|
| **Auth module** | Registration, verification gate, login, logout, password reset, session state | Supabase Auth only |
| **Profile module** | Read/write the learner's profile row | Auth module (for `auth.uid()`) |
| **Sync module** | Debounce local changes, push, pull, whole-instance comparison, offline queueing, sync-status exposure | Auth module (for identity), not the Profile or Proof modules |
| **Proof module** | GitHub link fields, file upload UI, signed-URL retrieval | Sync module (proof is part of a Learning Instance's `progress_state`), Storage bucket |

No module implements another module's responsibility. In particular: the Sync module never contains auth logic, and the Auth module never touches `progress_state`.

---

## 14. Deployment Architecture

No custom server means no server deployment.

1. **Supabase project** — created once via the Supabase dashboard. Schema changes are written as migrations under `supabase/migrations/` and applied with the **Supabase CLI** (`supabase db push`) — the schema is version-controlled, never hand-edited in the dashboard. Bucket creation and RLS policies are defined the same way.
2. **Local development** — the **Supabase CLI's local Docker stack** (`supabase start`), running Postgres, Auth, and Storage locally. Migrations are written and tested locally first, then pushed to the hosted project.
3. **Production** — targets **Supabase Cloud**. The frontend continues deploying exactly as it does today (Vercel), with two new environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

No additional infrastructure (queues, caches, containers beyond the local dev stack, CDNs beyond what Vercel/Supabase already provide) is introduced.

---

## 15. Security Model

- **Email verification is mandatory** and enforced at two layers (Section 5) — a session cannot reach the dashboard while unverified.
- **Session handling:** short-lived access tokens, longer-lived refresh tokens, both issued and rotated by Supabase Auth. The frontend never stores a raw password after registration/login.
- **Password reset:** single-use, time-limited links via Supabase Auth.
- **Unlimited devices (V1):** each device holds its own independent session; no device-count limit or device-revocation UI.
- **Data isolation:** Row-Level-Security scoped to `auth.uid()` is the entire authorization model (Section 9). No roles, no admin bypass.
- **File access:** private buckets, short-lived signed URLs (Section 10) — never a permanent public link.
- **Explicitly not included:** rate limiting beyond Supabase's platform defaults, audit logging, IP allow-listing, multi-factor authentication, device management. None are required by Section 21's Definition of Done.

---

## 16. Synchronization Rules

**No merge logic in V1 (locked).** Every synchronization decision resolves at the level of the whole Learning Instance, never at the level of an individual field or item. This is a deliberate simplification: it trades away the ability to combine two devices' independent offline edits, in exchange for a system with exactly one rule to reason about and zero ambiguity in what will happen.

### 16.1 The deterministic rule

On every pull (Section 16.2 lists triggers):

```
IF no cloud Learning Instance exists:
    → local becomes the cloud copy (push in full)

ELSE (a cloud Learning Instance already exists):
    → cloud is authoritative
    → download it
    → replace the local copy, in full
```

There is no timestamp comparison, no "newer side wins," and no field-by-field reconciliation. Once a cloud Learning Instance exists, it is unconditionally authoritative on every pull — full stop. This is the literal, unqualified rule, not a simplification of a more nuanced one.

**Pending local writes are not discarded by this rule.** If a local change has been made but has not yet reached the cloud (still inside the push debounce window, or made offline) at the moment a pull occurs, that change is queued and re-applied on top of the newly-pulled cloud state, then pushed normally on the next push cycle. This is not merge logic — no two authoritative states are ever reconciled field-by-field — it is simply not throwing away a write that is still in flight to the server. Section 16.2 defines the exact ordering.

**Known, accepted trade-off:** if the same account is used offline on two devices at once and both make real changes before reconnecting, whichever device's changes reach the cloud first becomes authoritative — the other device's offline changes are fully discarded the next time it pulls, regardless of which changes were made more recently in wall-clock time. This is the explicit cost of "cloud is unconditionally authoritative, no merge logic," and is intentionally accepted for V1. Advanced merge behavior is reserved for a future phase (Section 20).

### 16.2 Push and pull triggers

- **Push:** debounced **4 seconds** after the most recent local change, plus an immediate flush when the tab becomes hidden and before the page unloads — so closing the device doesn't lose the last few seconds of work.
- **Pull:** on app boot (if a verified session exists), on regaining browser focus, and on reconnecting after being offline. Pull always runs and resolves via Section 16.1's rule first. Any local edit made while a pull is in flight, or already queued and unpushed at that moment, is held and re-applied immediately after the pull completes (Section 16.1) rather than being overwritten by it — this is what keeps "cloud is unconditionally authoritative" from also discarding the local device's own not-yet-synced work.

There is no persistent live connection or real-time subscription in V1 — only these three pull triggers.

### 16.3 What "automatic saving" covers

Per the locked decision, there is no save button anywhere. Every meaningful learner action triggers the push cycle above: completing a step, completing a mission, marking a resource, saving a reflection, saving a note, submitting proof, updating a setting.

### 16.4 Sync status

The frontend surfaces sync state using the **existing** `StatusBanner` / `InlineStatus` components — no new visual pattern. States: `Saving…`, `Syncing…`, `Synced`, `Offline`.

---

## 17. Error Handling

No browser `alert()`/`confirm()`/`prompt()` — consistent with the app's existing, fully-honored discipline. All errors surface through the existing `StatusBanner`/`InlineStatus` components.

| Error | Handling |
|---|---|
| Register with an already-registered email | Rejected by Supabase Auth; frontend shows an inline message directing the learner to log in or reset their password instead |
| Push fails (network error) | Change stays queued locally (already saved to `localStorage`); status shows `Offline`; retried automatically on the next push trigger or reconnect |
| Pull fails (network error) | App continues on last-known local state; status shows `Offline`; retried on the next pull trigger |
| Login with unverified email | Rejected by Supabase; frontend shows an inline message directing the learner to check their verification email — never a silent failure |
| Expired/invalid session | Frontend routes to login; local data is untouched (it remains usable in guest/local-only mode per Section 5) |
| File upload rejected (size/type) | Rejected client-side before any network call, with an inline message stating the limit (Section 10) |
| File upload interrupted mid-transfer | Treated as a failed upload; the Proof row is not updated until the upload completes successfully; learner can retry |
| Curriculum import confirmation declined | No state changes at all (Section 4.1) |

No error in this table requires a special-cased recovery path beyond "retry using the same deterministic mechanism that runs anyway" (Section 16, Section 18).

---

## 18. Offline Behaviour

The app behaves exactly as it does today while offline: every write lands in `localStorage` instantly, regardless of connectivity. Nothing about the local-first experience changes.

- Local writes continue uninterrupted; there is no "offline mode" toggle or degraded UI state beyond the sync-status indicator.
- Queued pushes accumulate behind the debounce/flush rules (Section 16.2) and simply wait for connectivity.
- The sync-status indicator shows `Offline` for the duration.
- No merge concerns arise from being offline on a single device — Section 16's rule only resolves when a pull actually happens, which requires connectivity in the first place.

---

## 19. Recovery Behaviour

Every push is a **whole-instance upsert**, not a multi-step transaction, so there is no intermediate state to leave corrupted:

- A push interrupted mid-flight (tab closed, connection dropped) simply did not happen — the next push trigger (Section 16.2) re-sends the full current local state, which is idempotent by construction (an upsert of the same or newer data produces the same or a more current result).
- A pull interrupted mid-flight leaves local state unchanged; the next pull trigger retries from scratch.
- There is no scenario in this design where a partial sync leaves the Learning Instance in a state that is neither the old value nor the new value — the whole-instance replacement rule (Section 16.1) guarantees the result is always one complete, valid state or the other.

---

## 20. Future Reserved Capabilities

Named for planning continuity only — none are designed, scaffolded, or partially built in Phase 9:

AI / Mentor System · XP · Badges · Achievements · Certificates · Analytics (admin-facing) · Admin Dashboard · Curriculum Assignment · Notifications · Marketplace · Payments · Teams · Gamification · Multiple Simultaneous Learning Instances · Curriculum Editing · **Per-item merge-based conflict resolution** (the direct successor to Section 16's V1 trade-off, once it's justified by real multi-device concurrent-offline usage).

The only concrete reservation Phase 9 makes for any future capability is the empty `src/ai/` folder (Section 12) — a location, not an implementation.

---

## 21. Definition of Done

Phase 9 is complete if, and only if, this scenario succeeds end-to-end:

- [ ] A user registers.
- [ ] The user verifies their email (and cannot reach the dashboard before doing so).
- [ ] The user logs in on Laptop A.
- [ ] The user loads (imports) a curriculum.
- [ ] The user completes several missions — including submitting proof of work as a file upload.
- [ ] The user closes Laptop A.
- [ ] The user logs in on Phone B for the first time.
- [ ] Everything appears exactly where they stopped — no manual import, no manual export, no merge prompt.
- [ ] The user completes another mission on Phone B.
- [ ] The user returns to Laptop A and reopens the app.
- [ ] Progress has already synchronized automatically — the mission completed on Phone B is visible on Laptop A with no manual action.

No additional feature, however small, is required or expected beyond making this scenario true.
