# Phase 8C — Educational Experience Engine (Architecture Review Only)

**Analysis and planning only.** No code was written, no components were created, no files were renamed, nothing was committed. This document is the sole deliverable.

---

## 0. Sources Read

**Treated as authoritative project philosophy (read in full this session):** `ARCHITECTURE.md`, `Project_Guide.md`, `AI_CONSTITUTION.md`, `LEARNING_PHILOSOPHY.md`, `BOOTCAMP_SPECIFICATION.md`, `PHASES.md`, `EXPERIENCE_PRINCIPLES.md` (newly added this session — 19 numbered philosophies distinct from `LEARNING_PHILOSOPHY.md`; more about mentor voice, momentum, and atmosphere than pedagogical structure).

**Treated as historical context only, per this task's explicit instruction:** `CLAUDE_ANALYSIS.md` (my own earlier repo analysis). Its factual findings (e.g., mission-schema gaps) are cited below as prior evidence, not as governing philosophy.

**Repository evidence gathered this session (read-only):** full reads of `TodaysFocus.jsx`, `WeeklyMissions.jsx`, `PracticalMissionView.jsx`, `Checkpoints.jsx`, `NotesJournal.jsx`, `ProofOfWork.jsx`, `BootcampTimeline.jsx`, `UIComponents.jsx`, `src/components/ui/*`, `ImportRequiredCard.jsx`, `ErrorBoundary.jsx`, `DataGuard.jsx`, `src/components/features/*`, plus prior-session full reads of `normalizeRoadmap.js`, `jsonValidator.js`, `unlockChecker.js`, `progressCalculator.js`, `ResourceVault.jsx`, `sampleRoadmap.js`, `public/roadmap-data.json`.

Where current code conflicts with the philosophy documents, this report treats the documents as the intended future direction, per instruction.

---

## 1. Current Architecture Assessment

| Page | Lines | Layer 1 (Context) | Layer 2 (Learn) | Layer 3 (Build) | Layer 4 (Reflect) | Layer 5 (Complete) | Extraction priority |
|---|---|---|---|---|---|---|---|
| `TodaysFocus.jsx` | 2,019 | partial, scattered across 5 session-states | partial | high, fragmented | high | full | **Critical** — most value, most risk |
| `WeeklyMissions.jsx` | 1,320 | full (dedicated stage) | full (dedicated stage) | full (dedicated stage) | full (dedicated stage) | full (dedicated stage) | **High** — best structural match, recommended pilot |
| `PracticalMissionView.jsx` | 828 | full (Mission Scenario tab) | partial | full (steps/tests/debug tabs) | full (reflection tab) | partial | **High** |
| `ProofOfWork.jsx` | 655 | context only | — | — | — | full (gallery) | Low — already well-scoped |
| `NotesJournal.jsx` | 572 | — | — | — | partial | — | Low — already well-scoped |
| `Checkpoints.jsx` | 327 | — | — | — | full, high quality | — | Low — reference implementation |
| `BootcampTimeline.jsx` | 199 | minimal | — | — | — | minimal | Low — already excellent |

**Key conclusion:** `WeeklyMissions.jsx` already organizes its UI into six sequential stages (Study → Skill Check → Build → Proof → Reflection → Unlock) that map almost 1:1 onto the proposed five-layer model. This is the strongest evidence in the repository that the EEE's mental model is *already the app's mental model* — Phase 8C is formalizing an existing intuition, not imposing a foreign one. `TodaysFocus.jsx` mixes every layer across five session-states and two focus modes in one 2,019-line file — the most value to extract, and the most regression risk if done first.

`Checkpoints.jsx`'s three-state confidence system (Not yet / Learning / Confident) at lines 187–210, plus its evidence-capture modal (explanation + link + project proof) at lines 247–320, is a fully-formed, bootcamp-agnostic Layer 4 implementation already — it should be treated as the *reference pattern* for `KnowledgeCheck`/`SelfAssessment`, not rebuilt from scratch.

---

## 2. Integration Strategy

**Principle: extraction-first, not construction-first.** Most of Layers 1–4 already exist as working, duplicated code. The safest path is consolidating what already works, not designing new components against a blank page.

1. **Extract the three patterns already repeated verbatim across 2–3 pages**, with no schema changes required:
   - `ResourceCard` ← `WeeklyMissions.jsx:631-723` (the most complete existing implementation: type badge, difficulty, required flag, purpose/teaches tags, status, actions).
   - A reflection-prompt-and-textarea component ← `WeeklyMissions.jsx:1087-1106`, `TodaysFocus.jsx:1362-1437`, `PracticalMissionView.jsx:699-731`.
   - A step-checklist component ← `PracticalMissionView.jsx:440-469`, `TodaysFocus.jsx:1012-1057`.
   This step carries the lowest risk in the entire plan: it is literally deduplication of already-shipped, already-tested behavior.
2. **Pilot on `WeeklyMissions.jsx`** — refactor it to consume the extracted components plus the Mission Adapter (§4). This is the proving ground for the `mission` object contract before the highest-risk file is touched.
3. **Extend to `PracticalMissionView.jsx`** — structurally similar to `WeeklyMissions.jsx` (tab-per-layer), so the same components should transfer with modest adjustment.
4. **Extend to `TodaysFocus.jsx` last** — by this point the adapter and every Layer 1–4 component will have been validated twice already, minimizing the risk of the single highest-regression-risk file in the repository.
5. **Layer 5 only after Layers 1–4 are stable** — see §1 and the prompt's own instruction; `CompletionSummary`/`NextMissionPreview`/`CommanderNotes` have no existing pattern to de-risk them, so they should not be built concurrently with the higher-certainty extraction work.
6. **Leave `Checkpoints.jsx`, `BootcampTimeline.jsx`, `NotesJournal.jsx`, `ProofOfWork.jsx` largely alone initially** — they are not causing duplication pain today. Adopting EEE components there is optional, opportunistic, later work, not a Phase 8C dependency.

At every step: the old inline JSX in a page should be removed once the new component is verified in place — not left dormant "just in case." Partial migrations that leave both versions alive would reproduce the exact `Dashboard.jsx`-vs-`DashboardNew.jsx` dead-code pattern already flagged in `CLAUDE_ANALYSIS.md`.

---

## 3. Component Placement

New dedicated folder, organized by layer, matching the prompt's framing that this is a distinct architectural layer rather than generic UI:

```
src/components/education/
├── mission-context/   (Layer 1: MissionBrief, MissionScenario, LearningObjectives, ExpectedOutcome)
├── learn/             (Layer 2: LearningKit, ResourceCard, ConceptCard, GlossaryCard)
├── build/              (Layer 3: MissionTasks, DebugChecklist, CommonMistakes, Hints)
├── reflection/         (Layer 4: ReflectionCard, KnowledgeCheck, SelfAssessment)
└── completion/         (Layer 5: CompletionSummary, CommanderNotes, NextMissionPreview)
```

Every component receives one `mission` object (produced by the Mission Adapter, §4) — e.g. `<MissionBrief mission={mission} />` — never a scattered prop list, per the architectural principle already specified.

**Composition mapping onto the existing shared kit** (confirmed by direct read of `UIComponents.jsx` and `src/components/ui/*`):

| EEE Component | Composes | Rationale |
|---|---|---|
| `MissionBrief` | `SectionCard` + `InfoPill` + `StatusBadge` | structured header + metadata tags + status |
| `MissionScenario` | `SectionCard` + `EmptyState` (fallback) | structured content block with a defined empty state |
| `LearningObjectives` | `SectionCard` + `InfoPill` | list of tagged objectives |
| `ExpectedOutcome` | `SectionCard` + `IconBadge` | structured outcome statement |
| `LearningKit` | container of `LearningCard` children | `LearningCard` already exists for "missions, lessons, checkpoints, resources" |
| `ResourceCard` | extends `LearningCard` + `InfoPill` + `StatusIcon` | specializes the generic card for a typed resource |
| `ConceptCard` | `SectionCard` + `InfoPill` + `ProgressBar` (optional) | mini content block, optional mastery indicator |
| `GlossaryCard` | `SectionCard` | term/definition key-value structure |
| `MissionTasks` | container of `ActionCard`/`LearningCard` + `ProgressBar` + `StatusBadge` | per-task action items with completion state |
| `DebugChecklist` | `SectionCard` + `StatusIcon` + `InlineStatus` | stateful checklist |
| `CommonMistakes` | `SectionCard` + `InfoPill` (danger/warning tone) | warning-styled list |
| `Hints` | `InfoPill` (blue/cyan) or `SectionCard` for multi-line | secondary, low-emphasis info |
| `ReflectionCard` (EEE) | **composes the existing `UIComponents.jsx:123-129` `ReflectionCard`** internally (imported under an alias, e.g. `SoftCard`), plus the reflection-prompt/textarea/teach-back pattern | see §8 risk 1 — do not rename the existing component |
| `KnowledgeCheck` | `SectionCard` + `ActionCard` (per option) + `StatusBadge` | modeled directly on `Checkpoints.jsx`'s proven pattern |
| `SelfAssessment` | `SectionCard` + `ProgressBar` + `MetricCard` | modeled directly on `Checkpoints.jsx`'s confidence system |
| `CompletionSummary` | `SectionCard` + `MetricCard` + `StatusBadge` + `ProgressBar` | stats + status display |
| `CommanderNotes` | composes the existing generic `ReflectionCard` (journal styling) + `CommandButton` | mentor-voice note, static author content (see §5c) |
| `NextMissionPreview` | `LearningCard` (preview/disabled variant) + `InfoPill` + `StatusIcon` | teaser card, reuses the "locked" visual language already used elsewhere |

This satisfies the "compose, don't reinvent" decision: every EEE component has a concrete, justified anchor in the existing kit rather than a parallel visual system.

---

## 4. Mission Adapter Evaluation

Proposed flow: `JSON → normalizeRoadmap() → Mission Adapter → Standard Mission Object → Educational Components`.

**Recommendation: `src/utils/missionAdapter.js`**, sibling to `normalizeRoadmap.js`, `jsonValidator.js`, `progressCalculator.js`, and `unlockChecker.js` — all four are pure, non-React data-transformation functions, and this is the same shape of function. Placing it inside `components/education/` would blur the existing components-vs-utils separation the project's own folder philosophy already establishes.

**What it should do:** take a `(week, month, practicalMission)` triple — already produced by `normalizeRoadmap()` — plus the live progress/status maps already read by `unlockChecker.js`, and return one flattened, standardized object every EEE component can consume via a single `mission` prop. Concretely, it should pre-resolve:
- Everything already available today: title/goal/objective/briefing, studyResources, skillCheck, proofOfWork, reflectionPrompts, tasks, deliverable.
- Everything not yet resolved anywhere (§5): explicitly default to `null`/`[]` rather than `undefined`, so every component has one documented "no data" contract instead of eighteen different defensive-fallback implementations.
- Unlock/completion flags, **by calling `unlockChecker.js`'s existing functions** (`getWeekStepStatus`, `areRequiredPracticalsComplete`, etc.) rather than re-deriving them. This is the single most important implementation constraint: reimplementing gating logic inside the adapter would create two divergent sources of truth for "is this step unlocked," directly reproducing the kind of duplication risk this task explicitly asks to watch for.

**Risks identified:**
1. **Duplicated logic** if the adapter re-derives unlock/gating rules instead of delegating to `unlockChecker.js` — must be an explicit implementation constraint, not an assumption.
2. **Silent "no data" ambiguity** — if the adapter doesn't define one consistent contract for missing fields (e.g., `context: null`), each of the 18 components may invent its own empty-state behavior, undermining the "premium, consistent" visual language.
3. **Schema-shape churn** — as the JSON Regeneration stage (per `PHASES.md`) eventually adds `context`/`concepts`/`stretchGoals` resolvers to `normalizeRoadmap.js`, the adapter's output shape will need to grow. Recommend versioning it (`_missionAdapterVersion: 1`), mirroring the existing `_normalizedSchemaVersion` field already present in `normalizeRoadmap.js` — cheap now, prevents silent breakage later.
4. **Performance** — negligible; this is small object construction per rendered mission, not a hot loop.

---

## 5. JSON Evolution Requirements

### 5a. Buildable now with the existing schema

| Component | Data source (already resolved) |
|---|---|
| `MissionBrief` | `week.title` / `goal` / `objective` / `briefing` |
| `ExpectedOutcome` | `week.deliverable`, mission `objective` |
| `LearningKit` / `ResourceCard` | `week.studyResources` (once the canonical taxonomy in §5b is mapped onto the existing free-text `type` field) |
| `MissionTasks` | `week.tasks` / `practicalMissions` |
| `ReflectionCard` (EEE) | `week.reflectionPrompts` (including the generated fallback — see §9.2 for a content gap) |
| `KnowledgeCheck` / `SelfAssessment` | `week.skillCheck`, `roadmap.checkpoints`, `checkpointStatuses` — proven already by `Checkpoints.jsx` |
| `CompletionSummary` | unlock/completion flags via `unlockChecker.js`, `progress` state |
| `NextMissionPreview` | the next `weekNumber`'s title/objective — purely a "read one week ahead" operation, no new field needed |

### 5b. Requires future JSON schema evolution (no resolver exists in `normalizeRoadmap.js` today)

- `MissionScenario` — needs a `context`/`scenario` field (confirmed absent; closest existing analog is `PracticalMissionView.jsx:375-377`'s "Mission Scenario" card, which is page-authored, not JSON-sourced).
- `LearningObjectives` / `ConceptCard` — needs a per-*mission* concepts field (today `skills` exists only at week level, and only for the Cloud-Engineering schema dialect).
- `GlossaryCard` — no existing field or page pattern at all.
- `CommonMistakes` — no existing field or page pattern at all.
- `Hints` — no existing field or page pattern at all; also requires authoring guidance, not just a schema field (§5c, §9.4).
- `DebugChecklist` — `PracticalMissionView.jsx:549-580` has an inline "debugging exercises" block, but it is page-authored prose, not a normalized JSON field — needs promotion to a real, generalized field.
- Stretch Goals (feeds `MissionTasks` optionality and `CompletionSummary`) — no resolver today; per `BOOTCAMP_SPECIFICATION.md` it must never block progression once it exists.

### 5c. Backend-dependent / postponed

- **`CommanderNotes`**, if envisioned as dynamic, personalized mentor commentary, depends on infrastructure explicitly excluded from Phase 8C (AI Mentor, backend). **Recommendation: build it in Phase 8C only as static, author-written JSON content** (a `commanderNote` field per week/mission), and treat any adaptive/generated version as post-Phase-9 scope.
- The "Memory/stories" idea from `EXPERIENCE_PRINCIPLES.md` Philosophy 12 (first project, hardest week, biggest comeback, longest streak) has no data store today beyond `streak`/`timerHistory` in `AppContext`. A durable, "revisit years later" version of this is naturally a Phase 9 (cloud persistence) concern; a local-only v1 is possible sooner but is explicitly out of this document's component list — flagged as a suggestion (§9), not a requirement.

### 5d. Canonical Resource Taxonomy

Per your direction, this reconciles four previously-inconsistent lists (`BOOTCAMP_SPECIFICATION.md`, `LEARNING_PHILOSOPHY.md`, `EXPERIENCE_PRINCIPLES.md` Philosophy 17, and the actual `ResourceVault.jsx` code) into one canonical, extensible contract.

**Resource Types** (what the learner is consuming — a closed-ish but extensible enum):
- Official Documentation
- Video
- Interactive Practice
- Playground / Lab
- Project
- Course
- Book
- Article
- Cheat Sheet
- Reference
- Tool

**Resource Metadata** (descriptive information about a resource, independent of its type):
- Provider
- Difficulty
- Estimated Duration
- Required / Optional
- Tags (optional)

**Reasoning:** separating *type* (what it fundamentally is) from *metadata* (how it's described) is what makes the taxonomy extensible — a new bootcamp field (e.g., Cybersecurity's "Cyber Range Simulation" from `BOOTCAMP_SPECIFICATION.md`'s Boss Mission examples) doesn't need a new resource *type*, it's a `Playground / Lab` with different metadata. This directly satisfies `AI_CONSTITUTION.md`'s "Extensibility" principle ("avoid hardcoded assumptions... support new learning models without architectural rewrites") and `BOOTCAMP_SPECIFICATION.md`'s "must adapt to the bootcamp" mandate, since the eleven types are domain-neutral by construction — none of them assume Software Engineering, Mobile, or any specific field.

**`Mission` is explicitly excluded from this taxonomy, per your instruction** — a mission is a learning *activity* (Layer 3: Build), not a learning *resource* (Layer 2: Learn). Structurally this also resolves a latent ambiguity in `EXPERIENCE_PRINCIPLES.md` Philosophy 17's list, which included "Mission" alongside genuine resource types — this document's taxonomy corrects that by keeping the two concerns cleanly separated, consistent with the Layer 2/Layer 3 boundary the EEE itself proposes.

**Follow-up implication:** `ResourceVault.jsx`'s current `TYPE_COLORS` map (`Docs`, `Tutorial`, `Video`, `Tool`, `Course` — confirmed at lines 15-21) does not match this list one-for-one (`Docs`→`Official Documentation`, `Tutorial` has no clean equivalent — closest is `Interactive Practice` or `Course` depending on the specific resource). This reconciliation is a small, low-risk, schema/content-only task (§10 step 1) that can and should happen independently of, and before, any EEE component work — it unblocks `LearningKit`/`ResourceCard` sooner and is not gated on the Mission Adapter.

---

## 6. Extraction Map

```
MissionBrief
  ← WeeklyMissions.jsx:517-523, 1268-1282   (week briefing / "Week Objective" section)
  ← TodaysFocus.jsx:724-736, 1452-1456       ("Today's Objective" card)

MissionScenario
  ← PracticalMissionView.jsx:375-377          ("Mission Scenario" card — closest existing analog)
  ← BLOCKED on §5b `context` schema field for full realization

LearningObjectives
  ← PracticalMissionView.jsx:388-394          (concepts used as contextual tags — partial)
  ← BLOCKED on §5b per-mission concepts field

ExpectedOutcome
  ← ProofOfWork.jsx:335-353                   ("Week Deliverable" context section)
  ← TodaysFocus.jsx (briefing sections reference deliverable)

LearningKit
  ← WeeklyMissions.jsx:589-729                (full Study Stage — most complete existing implementation)

ResourceCard
  ← WeeklyMissions.jsx:631-723                (resource card grid — most complete existing implementation)
  ← TodaysFocus.jsx:1149-1170, 930-977         (Learn-phase resource display)

ConceptCard
  ← PracticalMissionView.jsx:388-394          (concepts tags — partial only)
  ← BLOCKED on §5b concepts schema field

GlossaryCard
  ← No existing pattern found — net-new construction, no schema field, lowest evidence of need (see §8 risk 10)

MissionTasks
  ← TodaysFocus.jsx:1012-1057, 1210-1253       (practical build task lists)
  ← WeeklyMissions.jsx:894-944                 (mission cards grid)

DebugChecklist
  ← PracticalMissionView.jsx:549-580          (debugging exercises / drill format — needs generalization + schema field)

CommonMistakes
  ← No existing pattern found — net-new; needs schema field

Hints
  ← No existing pattern found — net-new; needs schema field + authoring guidance (§9.4)

ReflectionCard (EEE)
  ← WeeklyMissions.jsx:1057-1109               (Reflection Stage)
  ← TodaysFocus.jsx:1362-1437, 1834-1917        (Reflect phase + after-session reflection)
  ← PracticalMissionView.jsx:699-731            (Reflection tab)
  ← composes UIComponents.jsx:123-129 (existing generic ReflectionCard — retained, not renamed)

KnowledgeCheck
  ← Checkpoints.jsx:187-210                    (three-state confidence system — reference implementation)

SelfAssessment
  ← Checkpoints.jsx:247-320                    (evidence modal: explanation, link, project proof — reference implementation)

CompletionSummary
  ← TodaysFocus.jsx:1838-1850                  (session recap panel)
  ← WeeklyMissions.jsx:1159-1187                ("Week Completed Successfully" panel)
  ← ProofOfWork.jsx:549-624                     (evidence gallery)

CommanderNotes
  ← No existing pattern found — net-new; conceptual lineage from EXPERIENCE_PRINCIPLES.md Philosophy 5 (Mentor)
    and the existing "Commander Mode" naming convention in unlockChecker.js (different mechanism, shared naming)

NextMissionPreview
  ← No existing pattern found — net-new construction, data already available (§5a)
```

This table is intended to directly serve as the implementation roadmap for whichever build phase follows this analysis.

---

## 7. Reusability Opportunities

- The Mission Adapter is the single lever that makes every EEE component bootcamp-agnostic "for free" — `normalizeRoadmap.js` already reconciles 3+ real JSON dialects (Elliot/Mobile, One Piece, Cloud Engineering) into one shape, so cross-bootcamp reuse compounds rather than requiring new normalization work per future bootcamp (Cybersecurity, AI Engineering, etc., per `BOOTCAMP_SPECIFICATION.md`'s named examples).
- The canonical resource taxonomy (§5d) is itself a reuse enabler: one shared enum drives `ResourceCard` styling, `ResourceVault.jsx`'s existing type-filter UI (already built, just needs the new vocabulary wired in), and future authoring guidance — a single change point instead of three.
- `Checkpoints.jsx`'s confidence-based self-assessment model is already domain-neutral (nothing about "Not yet / Learning / Confident" assumes a specific field) — it should be the reused foundation for `KnowledgeCheck`/`SelfAssessment` rather than a new design.
- Layer boundaries double as reuse boundaries across future non-JS bootcamps: none of the 18 proposed components reference JavaScript/Mobile-specific concepts, so the reuse this task is optimizing for is structural, not just code-level.

---

## 8. Risks

1. **`ReflectionCard` naming ambiguity** (resolved architecturally per your instruction — compose, don't rename — but the risk of a future contributor confusing the two components remains; recommend a one-line code comment at the point of composition making the relationship explicit).
2. **Building UI ahead of data.** Six of eighteen components (`MissionScenario`, `LearningObjectives`, `ConceptCard`, `GlossaryCard`, `CommonMistakes`, `Hints`) have no resolved schema field today (§5b). Building their presentational shells before schema work risks either dead/empty components or speculative field-guessing — which would reproduce the exact alias-chain fragility already flagged in `normalizeRoadmap.js` by `CLAUDE_ANALYSIS.md`.
3. **Duplicated logic** if the Mission Adapter reimplements unlock/gating rules instead of delegating to `unlockChecker.js` (§4).
4. **Prop drilling avoidance only works if adopted everywhere.** The single-`mission`-object principle only prevents prop drilling if every EEE component actually uses it; if any component takes a shortcut and reaches into raw `roadmap`/`week` objects directly (as current inline code does), the benefit is lost silently.
5. **Routing** — none expected; all proposed components are presentational and render within existing page routes.
6. **Parser/JSON compatibility** — the canonical resource taxonomy (§5d) changes the effective contract for the `type` field. Existing code (`ResourceVault.jsx` TYPE_COLORS) and existing sample data (`roadmap-data.json`, `sampleRoadmap.js`) do not yet match it — a concrete reconciliation task, not an abstract risk (§10 step 1).
7. **Performance** — negligible; all proposed components are small and presentational, and the adapter's object construction is cheap at current data volumes.
8. **Maintainability regression if extraction is partial.** If old inline JSX is left alongside new extracted components "just in case" rather than fully replaced, this recreates the `Dashboard.jsx`/`DashboardNew.jsx` dead-code pattern already flagged in `CLAUDE_ANALYSIS.md`.
9. **`TodaysFocus.jsx` regression risk** — the single highest-risk file in the plan (2,019 lines, 5 session-states, 2 modes); mitigated by sequencing it last (§2), after the component contracts are proven twice elsewhere.
10. **Scope creep against `EXPERIENCE_PRINCIPLES.md` Philosophy 18 ("Preserve Focus").** Applying its three-question filter ("Does it improve capability? Does it reduce friction or create motivation? Would learners miss it if it disappeared?") to `GlossaryCard` specifically: it has no existing page usage, no schema field, and its purpose substantially overlaps `ConceptCard`. Recommend treating it as a candidate for deferral or merging into `ConceptCard`, rather than building it as an eighteenth, separately-justified component.

---

## 9. Suggested Improvements

1. Apply Philosophy 18's three-question filter explicitly, not implicitly, to each of the 18 components before committing to build all of them uniformly — §8 risk 10 already surfaces one likely casualty (`GlossaryCard`).
2. **Content-only, zero-risk improvement available today:** the auto-generated reflection-prompt fallback in `normalizeRoadmap.js` (5 generic prompts) does not include a teach-back question, despite `EXPERIENCE_PRINCIPLES.md` Philosophy 13 explicitly calling for "How would I explain this concept to another learner?" This can be fixed independently of all EEE work.
3. Version the Mission Adapter's output shape (`_missionAdapterVersion`), mirroring the existing `_normalizedSchemaVersion` convention in `normalizeRoadmap.js` (§4).
4. Add author-facing documentation (not just code) for two content-authoring constraints no component can enforce alone: "Hints should guide thinking, not reveal answers" (explicitly noted in the originating prompt) and the existing Commander/optional-task text convention already shown to be fragile in `unlockChecker.js`.
5. Reconcile the resource-type taxonomy in code (§5d, §10 step 1) as an immediate, independent first step — it de-risks `LearningKit`/`ResourceCard` before any component work begins and requires no architectural decisions, only data/content alignment.

---

## 10. Recommended Phase 8C Implementation Order

1. **Canonical resource taxonomy reconciliation** (§5d) — update `ResourceVault.jsx`'s type vocabulary and sample data to the new eleven-type list. Content/data-only, no component work yet, unblocks Layer 2.
2. **Build the Mission Adapter** (`src/utils/missionAdapter.js`), explicitly delegating to `unlockChecker.js` for all gating logic (§4).
3. **Extract the three already-proven, repeated patterns** (`ResourceCard`, the reflection-prompt component, the step-checklist component) into `src/components/education/` (§2 step 1, §3).
4. **Pilot: refactor `WeeklyMissions.jsx`** to consume the Mission Adapter and the extracted Layer 2–4 components.
5. **Extend to `PracticalMissionView.jsx`.**
6. **Extend to `TodaysFocus.jsx` last** (highest risk, sequenced after two successful validations).
7. **Build the Layer 1 components with data available today** (`MissionBrief`, `ExpectedOutcome`); explicitly hold `MissionScenario`/`LearningObjectives` as blocked pending the JSON Regeneration stage's schema work (§5b), unless a deliberately-scoped "no context yet" placeholder state is wanted sooner.
8. **Build `KnowledgeCheck`/`SelfAssessment`** directly on `Checkpoints.jsx`'s proven pattern (§1, §7).
9. **Defer Layer 5** until Layers 1–4 are stable across all three major pages. Within Layer 5, build `CompletionSummary`/`NextMissionPreview` first (data already exists, §5a) and `CommanderNotes` last (requires the static-content decision in §5c).
10. **Defer `GlossaryCard`, `CommonMistakes`, `Hints`, and the schema-driven version of `DebugChecklist`** until the JSON Regeneration stage adds their needed fields — build presentational shells only if visual scaffolding ahead of data is explicitly wanted; otherwise sequence them after schema work lands.

This order directly follows the "minimize risk, minimize regressions, avoid unnecessary rewrites" mandate: every step either consolidates already-proven code, builds on already-available data, or is explicitly deferred with a stated reason rather than assumed.

---

*This document is analysis and planning only. No code was written, no components were created, and no existing files were modified or renamed. Awaiting explicit approval before any implementation begins.*
