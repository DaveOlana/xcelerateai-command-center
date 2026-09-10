# XcelerateAI Curriculum Engine V2 — Phase 2 Addendum
## Embedded Curriculum Catalog + Safe Curriculum Updates

This addendum modifies the previously audited Phase 2 implementation plan.

Do NOT begin implementation yet.

Read this addendum together with:

```text
XcelerateAI Curriculum System/v2/
├── XcelerateAI_Curriculum_Engine_V2_Phase_1_Foundation.md
├── CURRICULUM_SOURCE_SPEC.md
├── GENERATION_PROTOCOL.md
├── VALIDATION_STANDARD.md
├── RESOURCE_CURATION_STANDARD.md
└── PHASE_2_IMPLEMENTATION_PROMPT.md
```

The following decisions are now authoritative for Phase 2.

---

# 1. PRODUCT DELIVERY MODEL

The normal learner experience is NOT file import.

Curricula are published with the application and presented to learners through an embedded curriculum catalog.

Learner flow:

```text
Open XcelerateAI
    ↓
Choose curriculum
    ↓
Start / Continue
```

Examples may eventually include:

```text
Python Agent Engineering
Cybersecurity
Data Analysis
...
```

The learner should not need to understand JSON, Curriculum Source, compilation, or imports.

---

# 2. EMBEDDED CURRICULUM CATALOG

Implement a V2 curriculum catalog.

The catalog must expose published curricula to the application using stable curriculum metadata.

Conceptually:

```js
[
  {
    curriculumId: "PYAE",
    revision: 3,
    title: "Python Agent Engineering",
    shortTitle: "Python Agent Engineering",
    status: "published"
  }
]
```

The exact implementation may use static imports, generated modules, or another simple build-time mechanism that fits the current Vite/React application.

Prefer the simplest reliable architecture.

Do not introduce a server, database, CMS, or remote curriculum service in this task.

The catalog should support:

- listing available curricula
- selecting a curriculum
- identifying the currently active curriculum
- showing Start vs Continue based on learner state
- loading the latest published revision
- preserving progress for the same `curriculumId`

---

# 3. PUBLISH PIPELINE

The official V2 production path is:

```text
curriculum-source.json
        ↓
strict V2 source validation
        ↓
coverage generation
        ↓
compile
        ↓
runtime validation
        ↓
publish to curriculum catalog
        ↓
available to learner
```

A curriculum must not become visible in the learner catalog unless the source validates and the compiled runtime curriculum passes runtime validation.

The application should never treat raw source as learner runtime.

---

# 4. IMPORT SCREEN IS NOT THE PRIMARY PRODUCTION PATH

Do not design V2 around the existing Import screen.

The normal production path is the embedded catalog.

If keeping V2 import capability is useful for development or administration, treat it only as an advanced/dev utility.

For any V2 import that remains:

```text
Curriculum Source
→ strict validate
→ compile
→ runtime validate
→ activate
```

Do not allow normal V2 production import to bypass compilation by directly activating arbitrary compiled runtime JSON.

V1 import behavior may remain isolated.

---

# 5. CURRICULUM IDENTITY

`curriculumId` is the permanent identity of one learning path.

Example:

```text
PYAE
revision 1
revision 2
revision 3
```

All of those are the same curriculum.

`revision` is metadata describing the published revision.

It must NOT become a learner-state namespace.

Do not create progress storage under:

```text
PYAE@revision-3
```

or equivalent.

Learner state remains under:

```text
curriculumId
```

Stable entity IDs preserve progress across revisions.

---

# 6. WHEN A NEW CURRICULUM ID IS REQUIRED

A new revision is appropriate when improving the same educational promise.

Examples:

- replacing a weak resource
- rewriting explanations
- improving Build instructions
- adding reinforcement
- improving a future Skill Check
- renaming a week
- rearranging future material while preserving stable unchanged entities

A new `curriculumId` is required when the educational promise materially changes.

Examples:

- different target learner
- materially different professional outcome
- different prerequisite level
- fundamentally different learning path

Do not attempt to automatically infer this in runtime code.

This is an authoring/publishing decision.

---

# 7. NON-REGRESSION UPDATE SEMANTICS

Curriculum updates must never punish a learner for work already completed.

Authoritative rule:

> **Past achievement is preserved. Future learning receives improvements.**

Implement this rule explicitly.

---

# 8. COMPLETED WEEKS

If a learner completed a week under an earlier revision:

```text
PYAE-W05 = completed
```

and the published curriculum later changes:

```text
revision 2 → revision 3
```

then:

```text
PYAE-W05 remains completed
```

Do not automatically reopen completed weeks.

Do not revoke completed-week status because:

- resources changed
- titles changed
- requirements changed
- questions changed
- Builds changed
- Proof changed

A completed week remains completed unless a future explicit product feature intentionally allows administrative invalidation.

Do not build invalidation in Phase 2.

---

# 9. ALREADY-SATISFIED STAGES

For the learner's active/incomplete week, already-satisfied stages must remain satisfied after a curriculum update.

Example:

```text
Study satisfied
Skill Check satisfied
Build current
```

After a new revision:

```text
Study remains satisfied
Skill Check remains satisfied
Build uses latest applicable content
```

Do not push the learner backward.

This applies to:

```text
Study
Skill Check
required Builds already completed
Proof already satisfied
Reflection already satisfied
```

where the corresponding stable entity/stage achievement already exists.

---

# 10. FUTURE / UNSATISFIED WORK

Incomplete future work should use the newest published curriculum revision.

Example:

```text
Learner has not started Week 9
Revision 4 changes Week 9
→ learner receives Revision 4 Week 9
```

Example:

```text
Learner is in Week 7
Study satisfied
Skill Check not yet attempted
Revision 4 replaces Skill Check with a materially new Skill Check ID
→ learner receives the new Skill Check
```

The general rule is:

```text
Satisfied past requirement
→ preserve

Unsatisfied current/future requirement
→ use latest published curriculum
```

---

# 11. STAGE SATISFACTION

The proposed V2 learner state must explicitly support non-regression.

Extend the previously proposed state model with durable stage-satisfaction information.

Conceptually:

```js
{
  [curriculumId]: {
    lastSeenRevision: 3,
    activeWeekId: "PYAE-W07",
    completedWeekIds: ["PYAE-W01", "PYAE-W02"],

    stageSatisfaction: {
      "PYAE-W07": {
        study: {
          satisfied: true,
          satisfiedAt: "..."
        },
        skillCheck: {
          satisfied: true,
          satisfiedAt: "...",
          skillCheckId: "PYAE-SC-W07"
        },
        builds: {
          satisfied: false
        },
        proof: {
          satisfied: false
        },
        reflection: {
          satisfied: false
        }
      }
    },

    resources: {},
    skillChecks: {},
    builds: {},
    proofs: {},
    reflections: {}
  }
}
```

The exact implementation may differ, but it must support the semantics above.

Do not rely only on recomputing old stage satisfaction from the newest curriculum requirements.

That would allow new requirements to revoke old achievements.

---

# 12. `lastSeenRevision`

Store the most recent curriculum revision encountered by the learner.

Purpose:

- detect that curriculum content changed
- reconcile state safely
- support future lightweight "Course updated" messaging
- provide debugging/backup traceability

`lastSeenRevision` does not determine curriculum identity.

Updating it must not reset progress.

---

# 13. STABLE ENTITY IDs ACROSS REVISIONS

Preserve V2 learner progress by stable IDs.

Examples:

```text
weekId
resourceId
skillCheckId
buildId
proofId
proofEvidenceId
reflectionPromptId
projectId
milestoneId
competencyId
```

Display text must never be used to reconcile updates.

Array positions must never be used to reconcile updates.

---

# 14. MATERIAL ENTITY CHANGES

If an educational entity changes materially, authoring should assign a new stable ID.

Example:

```text
Old Skill Check:
PYAE-SC-W08

Materially redesigned Skill Check:
PYAE-SC-W08-R2
```

Runtime behavior:

- learner who already satisfied the Skill Check stage keeps that satisfaction
- learner who has not satisfied it receives the new Skill Check
- completed Week 8 remains completed

The same principle should apply to materially replaced Builds or other learner-state-bearing entities.

---

# 15. RESOURCE UPDATES

Resource updates must follow stable-ID semantics.

Minor changes such as:

- title cleanup
- note correction
- timestamp clarification

may preserve the same `resourceId`.

Replacing one learning resource with a materially different resource should use a new `resourceId`.

If Study was already satisfied, the new resource must not make that learner repeat Study.

If Study is unsatisfied, the learner receives the newest requirement.

---

# 16. PROJECT UPDATE SEMANTICS

Projects remain derived from Build completion.

Because Build IDs are stable:

- unchanged milestones remain correctly completed
- reordered project arrays do not affect state
- title changes do not affect state
- new future milestones can appear without disrupting completed milestone-derived state

Do not create duplicate project progress merely to handle revisions.

---

# 17. COMPETENCY / PROGRESS UPDATE SEMANTICS

Progress skill evidence is competency-ID based.

Renaming a competency must not lose evidence.

If a competency is materially replaced, use a new competency ID.

Do not retroactively claim achievement of a newly introduced competency merely because an older similarly named competency was completed.

---

# 18. BACKUP / RESTORE

V2 backup and restore must include:

- learner state
- `lastSeenRevision`
- stage satisfaction
- stable-ID activity records

Restoring a backup into a newer published curriculum revision must preserve past achievement and then apply the normal non-regression update semantics.

Do not bind backups to one exact revision unless needed as diagnostic metadata.

---

# 19. RESET

Resetting learner progress for a curriculum must reset only that curriculum's V2 learner state unless the user explicitly selects a wider reset.

Do not reset other curricula in the catalog.

---

# 20. MULTIPLE CURRICULA

The state architecture must allow learners to:

```text
start Curriculum A
start Curriculum B
switch between them
return later
continue independently
```

Each curriculum is isolated by `curriculumId`.

The curriculum selector should determine whether to show:

```text
Start
```

or:

```text
Continue
```

from that curriculum's learner state.

Do not assume only one curriculum will ever exist.

---

# 21. CURRENT CURRICULUM SELECTION

Persist the learner's active curriculum selection separately from the curriculum content itself.

If the selected curriculum remains in the catalog, returning to XcelerateAI should restore it.

If it no longer exists in the catalog, fail safely and return the learner to curriculum selection.

Do not delete its stored learner state automatically.

---

# 22. CATALOG STATUS

Support at least:

```text
published
```

internally.

If convenient and nearly free, the catalog may also support:

```text
draft
```

for development, but draft curricula must not appear in the normal learner selector.

Do not overbuild publishing workflows.

---

# 23. GOLDEN CURRICULUM UPDATE TESTS

Extend the Phase 2 Golden Curriculum tests to prove revision safety.

At minimum add tests for:

### Test A — title rename

```text
revision 1
resource R1 completed

revision 2
same R1 ID
different title

Expected:
resource progress preserved
```

### Test B — completed week

```text
W1 completed under revision 1

revision 2 changes W1 requirements

Expected:
W1 remains completed
```

### Test C — satisfied Study stage

```text
Study satisfied in active W2

revision 2 adds/replaces Core Study requirement

Expected:
Study remains satisfied
```

### Test D — future updated assessment

```text
Skill Check not yet satisfied
revision 2 replaces old Skill Check with new ID

Expected:
learner receives new Skill Check
```

### Test E — already-satisfied assessment

```text
Skill Check already satisfied
revision 2 replaces Skill Check

Expected:
Skill Check stage remains satisfied
```

### Test F — Project reorder

```text
Projects reordered in revision 2

Expected:
project/milestone derived state remains correct
```

### Test G — curriculum revision

```text
revision 1 → revision 2

Expected:
same curriculum state namespace
```

### Test H — multiple curricula

```text
Curriculum A progress
Curriculum B progress

Expected:
independent state and Start/Continue behavior
```

---

# 24. CATALOG TESTS

Add tests proving:

- only published curricula appear in learner catalog
- catalog entries have unique `curriculumId`
- selecting a curriculum loads its latest published runtime revision
- Start vs Continue is derived correctly
- switching curricula does not lose state
- current selection restores safely
- invalid published runtime curriculum cannot enter the catalog

---

# 25. REVISED PHASE 2 SUCCESS CONDITIONS

In addition to the original Phase 2 success conditions, Phase 2 now also requires:

1. An embedded V2 curriculum catalog exists.
2. The learner can select an available published curriculum.
3. The catalog supports Start / Continue.
4. Multiple curriculum states are isolated by `curriculumId`.
5. V2 publication follows validate → compile → runtime validate → catalog.
6. `revision` is not used as a learner-state namespace.
7. `lastSeenRevision` is recorded.
8. Completed weeks survive curriculum revisions.
9. Already-satisfied active-week stages survive curriculum revisions.
10. Unsatisfied current/future work uses the newest curriculum revision.
11. Stable entity IDs preserve progress through display changes and reordering.
12. Materially replaced entities can use new IDs without revoking already-satisfied stages.
13. Golden Curriculum tests prove revision-safe behavior.
14. Backup/restore preserves V2 update-safe state.

---

# 26. PRIOR AUDIT DECISIONS

Apply these decisions from the audit review:

## Workload tolerance

Use:

```text
abs(estimatedTotalHours - sum(week.estimatedHours)) <= 1 hour
```

For estimated duration:

```text
minimum plausible weeks
= ceil(totalHours / maximumWeeklyHours)

maximum plausible weeks
= ceil(totalHours / minimumWeeklyHours)
```

`estimatedWeeks` must fall within that inclusive range.

Do not force a midpoint.

## Import

The production architecture is the embedded curriculum catalog.

Any retained advanced V2 import path accepts Curriculum Source and must still validate → compile → runtime validate before activation.

Do not make direct compiled-runtime import the normal V2 path.

## Manual override

Treat override as inspection access only.

It may expose locked stages for operator/developer inspection.

It must not:

- mark requirements satisfied
- unlock Complete
- advance progression
- bypass recovery

Normal learner progression remains strictly gated.

---

# 27. IMPLEMENTATION BOUNDARY

Do not generate the real Python Agent Engineering curriculum in this task.

The only embedded V2 curriculum required during Phase 2 is the small Golden Curriculum used to prove the engine, catalog, update semantics, and runtime flow.

Do not create remote curriculum syncing, cloud updates, accounts, servers, or background download systems.

"Push updates to users" in the current architecture means:

```text
publish a newer curriculum revision with an app release/update
→ same curriculumId
→ learner receives latest curriculum content
→ stable state preserves past progress
```

Design the architecture so a remote delivery mechanism could be introduced later without changing learner-state semantics, but do not implement one now.

---

# 28. REQUIRED RESPONSE

This addendum introduces product requirements that were not explicit during the original audit.

Before BUILD:

1. Review this addendum against your proposed Phase 2 architecture.
2. State whether the proposed architecture still works.
3. List any implementation changes caused by:
   - embedded catalog
   - multiple curricula
   - stage satisfaction
   - revision reconciliation
   - backup/restore
4. Identify any new unresolved product decision.

If there are no unresolved product decisions, explicitly state:

```text
READY FOR BUILD
```

Do not modify files yet.

STOP after the addendum review.

Do not begin implementation until `BUILD` is sent.
