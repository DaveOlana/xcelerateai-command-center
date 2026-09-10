# XcelerateAI Curriculum Engine V2 — Phase 2 Update-Safety Verification

This is a **focused verification task only**.

Do not begin Phase 3. Do not generate Python Agent Engineering. Do not redesign V2. Do not modify production code unless explicitly authorized later.

The goal is to verify, with explicit evidence, that Phase 2 safely supports embedded curricula, multiple curricula, and curriculum revisions without disrupting learner progress.

## 1. Read V2 authority first

Read:

```text
XcelerateAI Curriculum System/v2/
├── XcelerateAI_Curriculum_Engine_V2_Phase_1_Foundation.md
├── CURRICULUM_SOURCE_SPEC.md
├── GENERATION_PROTOCOL.md
├── VALIDATION_STANDARD.md
├── RESOURCE_CURATION_STANDARD.md
├── PHASE_2_IMPLEMENTATION_PROMPT.md
└── PHASE_2_CATALOG_UPDATE_ADDENDUM.md
```

Treat them as V2 authority. V1 remains historical reference only.

## 2. Task mode

This task is:

```text
READ
INSPECT
RUN TESTS
REPORT
```

Do not change production code, authority documents, or generate a real curriculum. Do not stage, commit, push, reset, restore, or stash.

If you discover missing tests or behavior, report the gap clearly. Do not repair it in this task.

## 3. Worktree safety

Before verification:

1. Capture `git status`.
2. Record pre-existing dirty state.
3. Do not modify unrelated files.
4. Confirm at the end that nothing was staged, committed, pushed, reset, restored, or stashed.

## 4. Verify the catalog model

Prove each of the following:

- Only published curricula appear in the learner-facing catalog.
- Duplicate `curriculumId` values are rejected or prevented.
- If multiple published revisions exist, the latest valid revision is selected.
- No meaningful state → `Start`.
- Existing learner state → `Continue`.
- Curriculum A state cannot overwrite Curriculum B.
- If a previously selected curriculum disappears from the catalog, selection fails safely without deleting its stored learner state.

For each item provide:
- implementation file(s)
- relevant function(s)
- exact test name(s), if present
- PASS/FAIL result

## 5. Verify revision namespace

Prove that `curriculumId` is the learner-state namespace and `revision` is not.

Required behavior:

```text
PYAE revision 1
→ PYAE revision 2

Expected:
same learner-state namespace
```

Identify:
- storage key
- state object shape
- where `revision` is recorded
- where `lastSeenRevision` is recorded
- how revision reconciliation is invoked

PASS only if revision increments do not create a new progress namespace.

## 6. Verify completed-week non-regression

Identify an automated test proving:

```text
Revision 1:
W1 completed

Revision 2:
W1 gains new Study / Build / Proof requirements

Expected:
W1 remains completed
```

Report:
- exact test name
- implementation path
- PASS/FAIL
- state field protecting the achievement

## 7. Verify active-week stage satisfaction

Verify every stage.

### Study
Study satisfied under revision 1; revision 2 changes/adds Core resources.

Expected: Study remains satisfied.

### Skill Check
A. Skill Check satisfied; revision 2 replaces it with a new ID.

Expected: Skill Check stage remains satisfied.

B. Skill Check NOT satisfied; revision 2 replaces it.

Expected: learner receives the new Skill Check.

### Builds
Required Builds satisfied; revision 2 adds/replaces a required Build.

Expected: Build stage remains satisfied.

If Build stage was not satisfied, latest requirements apply.

### Proof
Proof satisfied; revision 2 changes evidence requirements.

Expected: Proof remains satisfied.

If unsatisfied, latest evidence requirements apply.

### Reflection
Reflection satisfied; revision 2 changes prompts/minimum.

Expected: Reflection remains satisfied.

If unsatisfied, latest requirements apply.

For each stage report:
- exact test(s)
- exact implementation function
- PASS/FAIL
- state used to preserve satisfaction

## 8. Verify stable-entity update behavior

Explicitly verify:

- Resource title rename with same `resourceId` preserves completion.
- Material resource replacement with a new ID applies only to unsatisfied Study; satisfied Study stays satisfied.
- Competency rename with same `competencyId` preserves evidence.
- Material competency replacement does not inherit old evidence merely because wording is similar.
- Project reorder does not alter derived completion.
- Build title rename with same Build ID preserves completion.

Report exact tests and PASS/FAIL for each.

## 9. Verify project derivation

Prove:

```text
Build incomplete
→ milestone incomplete

Build complete
→ milestone complete
```

Then prove project/milestone reorder does not alter the result.

Confirm there is no duplicate V2 learner-state field storing milestone completion separately.

## 10. Verify backup / restore

Verify V2 backup includes:
- all curriculum-specific learner states
- `lastSeenRevision`
- stage satisfaction
- resource activity
- Skill Check attempts/recovery
- Build completion
- Proof evidence
- Reflection responses
- active curriculum selection

Then test:

```text
Create progress under revision 1
create backup
publish/use revision 2
restore backup
run normal reconciliation
```

Expected:
- past achievements preserved
- `lastSeenRevision` reconciled
- unsatisfied current/future requirements use revision 2
- other curriculum states remain intact

Report test names, paths, PASS/FAIL.

## 11. Verify curriculum-specific reset

Test:

```text
Curriculum A has progress
Curriculum B has progress
reset Curriculum A
```

Expected:

```text
A reset
B untouched
```

Confirm wider/global reset only occurs through an explicitly broader action.

## 12. Verify multiple-curriculum switching

Test:

```text
Start Curriculum A
make progress
switch to Curriculum B
make progress
switch back to A
```

Expected:
- A resumes its own progress
- B retains its own progress
- active selection changes independently
- curriculum content is not unnecessarily copied into learner state

## 13. Verify progression after revision

Use this combined scenario:

```text
Revision 1:
W2 Study satisfied
W2 Skill Check satisfied
W2 Build not yet complete

Revision 2:
Study requirements changed
Skill Check replaced
Build changed
Proof changed
```

Expected:

```text
Study remains satisfied
Skill Check remains satisfied
Build uses latest unsatisfied requirement
Proof uses latest unsatisfied requirement
learner is not pushed backward
```

This proves:

> Past achievement is preserved. Future learning receives improvements.

If no automated test proves this combined scenario, report that as a test-coverage gap. Do not add it in this task.

## 14. Verify publish pipeline

Prove production path is:

```text
Curriculum Source
→ strict source validation
→ coverage generation
→ deterministic compile
→ runtime validation
→ published catalog entry
```

Confirm:
- invalid source cannot publish
- invalid runtime cannot publish
- arbitrary compiled JSON is not the normal production input
- raw source is not directly rendered

## 15. Update-safety test matrix

List whether tests exist and pass for:

1. resource title rename
2. completed week preservation
3. satisfied Study preservation
4. replaced unsatisfied Skill Check
5. replaced satisfied Skill Check
6. required Build satisfaction preservation
7. Proof satisfaction preservation
8. Reflection satisfaction preservation
9. Project reorder
10. revision namespace stability
11. multiple curricula isolation
12. backup/restore reconciliation
13. curriculum-specific reset
14. Start vs Continue
15. safe missing-selection recovery

Use:

| Requirement | Test exists? | Test name | Result |
|---|---|---|---|

Do not hide missing coverage behind aggregate counts.

## 16. Run verification

Run:
- all V2 tests
- complete repository pure Node tests
- Golden artifact regeneration check
- `npm run build`
- `git diff --check`

Run targeted V2 test files directly when available so individual outcomes are visible.

Do not install dependencies.

Do not retry the same blocked browser/sandbox action more than twice.

## 17. Optional local visual check

If the local dev server can be started normally, do a lightweight sanity check only:

```text
catalog
→ choose Golden Curriculum
→ Start/Continue visibility
→ Missions page loads
```

Do not make browser automation a blocker if the environment prevents it.

## 18. Verdict

Return one of:

```text
UPDATE SAFETY: PASS
```

```text
UPDATE SAFETY: INCOMPLETE VERIFICATION
```

or:

```text
UPDATE SAFETY: FAIL
```

PASS requires:
- no known behavior contradicts non-regression rules
- all critical update-safety scenarios have automated test evidence
- all relevant tests pass

If a required scenario has no automated coverage, do not call it a full PASS.

## 19. Final report format

Return:

1. Executive verdict.
2. Catalog verification.
3. State namespace verification.
4. Completed-week preservation.
5. Stage-satisfaction preservation by stage.
6. Stable-entity behavior.
7. Project derivation.
8. Backup/restore behavior.
9. Curriculum-specific reset.
10. Multiple-curriculum switching.
11. Combined revision scenario.
12. Publish-pipeline verification.
13. Full update-safety test matrix.
14. V2 test results.
15. Full repository test results.
16. Golden deterministic regeneration result.
17. Production build result.
18. `git diff --check` result.
19. Browser/visual verification result, if possible.
20. Missing tests or behavioral gaps.
21. Exact blockers before Phase 3.
22. Final status.
23. Confirmation that no files were modified, staged, committed, or pushed.

STOP AFTER THIS REPORT.

DO NOT REPAIR ANYTHING.
DO NOT BEGIN PHASE 3.
DO NOT GENERATE PYTHON AGENT ENGINEERING.
