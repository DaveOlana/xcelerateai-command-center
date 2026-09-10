# XcelerateAI Curriculum Engine V2 — Phase 2 Implementation Prompt

You are working inside the XcelerateAI repository.

This task begins **Phase 2: implementation** of Curriculum Engine V2.

The V2 authority documents already exist under:

```text
XcelerateAI Curriculum System/v2/
├── XcelerateAI_Curriculum_Engine_V2_Phase_1_Foundation.md
├── CURRICULUM_SOURCE_SPEC.md
├── GENERATION_PROTOCOL.md
├── VALIDATION_STANDARD.md
└── RESOURCE_CURATION_STANDARD.md
```

Treat those documents as the design authority for V2.

The historical V1 system exists under:

```text
XcelerateAI Curriculum System/v1/
```

V1 is historical reference only.

Do not preserve V1 compatibility unless a current runtime dependency makes it unavoidable.

The objective is to implement the V2 engine foundation in one coordinated sweep so that the repository can:

1. represent a V2 Curriculum Source,
2. validate it strictly,
3. derive coverage,
4. compile it into one clean runtime curriculum contract,
5. run that curriculum through the current learner journey,
6. preserve learner progress using stable IDs,
7. support authored Proof requirements,
8. derive Projects from real Builds,
9. derive Progress skills from competencies,
10. prove the pipeline with a small Golden Curriculum.

Do **not** generate the real Python Agent Engineering curriculum in this task.

---

# 1. PRE-BUILD AUDIT FIRST

Before modifying files:

1. Read all five V2 authority documents completely.
2. Inspect the current curriculum loading, normalization, validation, progress, Projects, Missions, Proof, Skill Check, and Progress code.
3. Inspect all existing tests related to curriculum behavior.
4. Capture `git status`.
5. Identify the smallest implementation architecture that satisfies V2 without unnecessary abstraction.

Return a short pre-build audit before implementation.

The audit must include:

- current files/components/utilities that will be affected
- proposed new V2 engine files
- proposed runtime contract
- learner-state keys that must change
- any V2 design requirement that cannot be implemented safely in this sweep
- any unresolved product decision

If there is a genuine unresolved product decision, STOP and report it.

If there is no unresolved product decision, continue only when instructed with `BUILD`.

Do not edit files during the pre-build audit.

---

# 2. IMPLEMENTATION PRINCIPLES

Use these principles throughout:

## A. V2 is clean-slate

Do not shape V2 around historical aliases.

Do not add compatibility branches merely because V1 once supported them.

## B. Curriculum Source is educational truth

The compiler consumes only valid V2 Curriculum Source.

It does not invent educational content.

## C. Compilation is mechanical

The compiler may transform structure, rename fields, derive indexes/maps, and emit runtime-ready objects.

It must not:

- choose resources
- generate questions
- infer prerequisites
- repair invalid source
- create missing educational content

## D. Strict validation precedes compilation

Invalid source must fail.

Do not silently normalize structural mistakes into valid curriculum.

## E. Stable IDs own learner state

Learner state must not depend on:

- titles
- exact display wording
- array indexes
- timestamps
- generated dates

## F. One learner journey

The runtime must implement:

```text
Study
→ Skill Check
→ Build
→ Proof
→ Reflect
→ Complete
```

Do not introduce alternative progression systems.

---

# 3. V2 ENGINE DIRECTORY

Create a clear implementation area.

Preferred structure:

```text
src/curriculum-v2/
├── schema/
├── validation/
├── compiler/
├── coverage/
├── runtime/
└── index.js
```

Use the repository's existing conventions if a nearby location is materially better.

Do not create architecture for architecture's sake.

The final report must explain the chosen structure.

---

# 4. V2 SOURCE SCHEMA

Implement a strict machine-readable V2 source schema matching:

```text
XcelerateAI Curriculum System/v2/CURRICULUM_SOURCE_SPEC.md
```

Use the project's current dependency environment.

Do not install a new schema library unless clearly necessary.

If no suitable dependency already exists, implement explicit deterministic validation in JavaScript.

The implementation must validate at minimum:

- top-level required fields
- supported enums
- required arrays/objects
- stable IDs
- unique IDs
- references
- phases
- competencies
- resources
- weeks
- Study
- Skill Check
- Builds
- Proof
- Reflection
- Projects
- Graduation

Reject legacy-only fields that would make the V2 source ambiguous.

Do not silently accept V1 dialects as V2.

---

# 5. DETERMINISTIC VALIDATOR

Implement deterministic checks from `VALIDATION_STANDARD.md` wherever code can prove correctness.

At minimum implement:

## Structure
- required fields
- data types
- allowed enums

## Identity
- all required IDs
- uniqueness

## References
- all referenced entities resolve

## Competency graph
- prerequisite references
- self-dependency rejection
- cycle detection

## Study
- resource refs resolve
- Core/Optional roles valid
- `coreMinimum` valid and achievable

## Skill Check
- exactly 10 questions
- exactly 4 options
- unique question IDs
- unique option IDs per question
- valid `correctOptionId`
- non-empty explanation
- question competency mappings

## Build
- stable IDs
- competency refs
- acceptance criteria
- required flag

## Proof
- stable IDs
- supported evidence types:
  - `link`
  - `text`
  - `confirmation`
- evidence IDs unique
- required evidence valid

## Reflection
- prompt IDs unique
- valid `minimumResponses`

## Projects
- project IDs
- milestone IDs
- week/build references
- referenced Build belongs to referenced Week

## Graduation
- required competency refs
- required project refs

## Workload arithmetic
- positive week estimates
- total workload reconciliation within a documented tolerance
- estimated weeks consistent with declared weekly capacity within a documented tolerance

Return structured findings.

Recommended finding shape:

```js
{
  code: "V006-B003",
  severity: "BLOCKER",
  message: "...",
  affectedIds: [...]
}
```

The exact codes may follow the Validation Standard categories.

---

# 6. COVERAGE GENERATOR

Implement derived coverage from Curriculum Source.

Output should conceptually answer for every competency:

```text
taughtIn
practicedIn
assessedIn
appliedIn
reinforcedIn
```

Do not require authors to manually write `coverage.json`.

At minimum derive:

## Taught
From Study resource assignment mappings.

## Assessed
From Skill Check question competency mappings.

## Applied
From required/optional Build competency mappings.

## Project use
From project milestone Builds.

## Reinforced
A competency appearing in later Study/Build/assessment after its initial teaching point may count as reinforcement.

## Practiced
Use explicit learning evidence available in the V2 source.

If the current source contract does not provide enough deterministic information to distinguish "taught" from "practiced" in every case:

- implement the strongest defensible derivation,
- document the limitation,
- do not invent unsupported claims.

Coverage generation must use stable IDs.

---

# 7. V2 RUNTIME CONTRACT

Design one clean runtime curriculum representation for the React application.

The runtime contract should be derived from V2 source and optimized for application consumption.

Do not preserve V1 aliases.

The runtime contract must support:

- curriculum metadata
- phases
- ordered weeks
- competency lookup
- resource lookup
- Study
- Skill Check
- Builds
- Proof
- Reflection
- Projects
- Graduation
- derived coverage where useful

The compiler should emit deterministic output from valid source.

Add a runtime contract version if useful.

---

# 8. V2 COMPILER

Implement:

```text
valid curriculum-source.json
        ↓
compile
        ↓
runtime curriculum
```

Compilation must be deterministic.

The compiler may:

- build maps
- normalize ordering
- transform educational source shapes into UI-friendly shapes
- derive runtime indexes
- attach compiled relationships

The compiler must not silently repair invalid curriculum.

Invalid source must fail before or during compilation with structured errors.

---

# 9. CURRICULUM LOADING

Introduce a V2 loading path.

The application should be able to load a compiled V2 curriculum cleanly.

Do not keep a giant compatibility normalizer in the V2 path.

If the existing application currently expects old normalized data:

- adapt the application to the new V2 runtime contract,
- do not distort V2 source to mimic the old format.

Keep changes focused.

---

# 10. STABLE LEARNER STATE

Move V2 learner state to stable IDs.

At minimum ensure V2 state is not keyed by:

- resource title
- project array index
- milestone array index
- checkpoint skill text
- generated roadmap identity
- week display title

Use:

```text
curriculumId
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

where appropriate.

Do not build a V1 migration layer unless current tests or runtime behavior require a temporary isolation mechanism.

The goal is correct V2 behavior.

---

# 11. STUDY RUNTIME

Implement V2 Study behavior from the authored source.

Requirements:

- Core vs Optional
- `coreMinimum`
- Core completion uses stable resource IDs
- Optional resources do not block progression
- new resource completion behavior should remain explicit/manual
- resource detail should retain exact location/stop information
- resource progress must be curriculum-scoped

Do not key resource completion by title.

---

# 12. SKILL CHECK RUNTIME

Implement the V2 graded Skill Check contract.

Requirements:

- exactly authored 10 questions
- four options
- configurable `passingScore`
- one-question-at-a-time UX may remain if already implemented
- unanswered questions count incorrect
- explanations shown according to existing approved pass/fail behavior
- attempts stored under stable curriculum + Skill Check identity
- recovery lock behavior remains intact if it is part of the current approved learner experience
- manual override must not bypass recovery behavior

Do not support V1 readiness checks in the V2 path.

---

# 13. BUILD RUNTIME

Use V2 `builds[]`.

Requirements:

- required Builds gate progression
- optional Builds do not gate progression
- Build completion uses stable Build ID
- steps remain guidance
- acceptance criteria are learner-visible where useful
- templates remain curriculum content, not learner state
- Builds no longer own a separate evidence/proof subsystem

If current practical-mission components are reusable, adapt them rather than rebuilding the UI unnecessarily.

Learner wording should remain "Build" where already approved.

---

# 14. PROOF RUNTIME

Replace the current hard-coded weekly GitHub proof contract for V2 with authored Proof.

Support initial evidence types only:

```text
link
text
confirmation
```

Requirements:

- render evidence items from curriculum
- required evidence gates progression
- optional evidence does not
- store evidence by stable `proofId` + `evidenceId`
- no universal repository/commit requirement
- no duplicate mission-proof system in V2
- preserve learner-entered values safely
- Proof should remain simple and polished

Do not add file uploads in this task.

---

# 15. REFLECTION RUNTIME

Implement V2 Reflection using prompt IDs.

Requirements:

- render authored prompts
- store responses by stable prompt ID
- enforce `minimumResponses`
- progression should not depend on exact prompt wording
- retain a reasonable meaningful-response minimum if the product already uses one, but make the rule explicit and testable

Do not use free-floating generated default prompts for valid V2 curriculum.

---

# 16. COMPLETE / PROGRESSION

V2 weekly progression is:

```text
Study requirement satisfied
→ Skill Check passed
→ all required Builds completed
→ all required Proof evidence completed
→ Reflection minimum satisfied
→ Complete available
```

There is no authored `unlockCriteria`.

Implement one canonical progression helper for V2.

Dashboard, Missions, and Progress should derive next action from the same V2 progression source of truth where practical.

Avoid duplicating progression logic.

---

# 17. PROJECTS

Refactor V2 Projects so milestones point to actual weekly Builds.

Requirements:

- milestone identity uses `milestoneId`
- milestone completion is derived from referenced Build completion
- project completion is derived from milestones
- no separate duplicate milestone progress state
- array order must not define identity
- Project pages should show the real relationship to weekly work

Use stable project IDs.

---

# 18. PROGRESS / SKILLS

For V2, remove dependence on free-floating checkpoint skill strings.

Progress skills should derive from curriculum competencies plus learner evidence.

Do not invent "mastery" percentages.

Use defensible states only.

Possible internal states include:

```text
introduced
practiced
assessed
applied
reinforced
```

The exact display should fit the current Progress UI.

Do not overcomplicate the interface.

The source of truth is competency IDs and derived coverage + learner completion.

---

# 19. GOLDEN CURRICULUM

Create a tiny V2 Golden Curriculum under:

```text
XcelerateAI Curriculum System/v2/examples/golden-curriculum/
```

Recommended files:

```text
curriculum-source.json
curriculum.json
coverage.json
validation-report.json
```

The Golden Curriculum should be 1–2 weeks and intentionally small.

It must exercise:

- curriculum metadata
- at least one Phase
- multiple Competencies with at least one prerequisite
- Core and Optional resources
- `coreMinimum`
- one valid 10-question Skill Check per week
- at least one required Build
- at least one optional Build if practical
- authored Proof with:
  - link
  - text
  - confirmation
- authored Reflection
- at least one Project with milestone → Build relationship
- Graduation

Use placeholder/example resource URLs only if network verification is outside task scope.

If placeholder URLs are used, clearly mark the Golden Curriculum as structural and configure resource verification tests accordingly.

Do not pretend fake URLs are verified learning resources.

---

# 20. TESTS

Add strong automated tests.

At minimum:

## Validator tests
- valid Golden Source passes
- missing required field fails
- duplicate IDs fail
- dangling reference fails
- competency cycle fails
- invalid Core minimum fails
- 9-question Skill Check fails
- 11-question Skill Check fails
- 3-option question fails
- invalid correct option fails
- missing explanation fails
- unsupported Proof type fails
- invalid Reflection minimum fails
- bad Project milestone reference fails

## Compiler tests
- deterministic compile
- valid source compiles
- invalid source does not compile
- stable IDs preserved

## Coverage tests
- taught mapping
- assessed mapping
- Build application mapping
- later reinforcement mapping

## Progression tests
- Study blocks correctly
- Optional Study does not block
- Skill Check gates
- required Build gates
- optional Build does not gate
- Proof required evidence gates
- Reflection minimum gates
- Complete unlocks only at the end

## Stable identity tests
- renaming a Resource title does not orphan V2 resource progress
- reordering Projects does not orphan progress
- renaming competency display text does not orphan competency evidence
- curriculum revision change does not create a new curriculum namespace

## Project tests
- milestone completion derives from Build completion
- no duplicate milestone state required

---

# 21. RUNTIME INTEGRATION TEST

The Golden Curriculum should be loadable by the application.

Verify the real user flow at least programmatically:

```text
Load Golden Curriculum
→ Week 1
→ complete required Study
→ pass Skill Check
→ complete required Build
→ complete Proof
→ answer Reflection
→ Complete Week
→ advance
```

If browser automation infrastructure already exists and is lightweight, use it.

Do not introduce a large new E2E framework solely for this task.

---

# 22. EXISTING UI

Do not redesign the application.

Preserve the approved product architecture:

```text
Dashboard
Missions
Workspace
Progress
Settings
```

Preserve the learner language:

```text
Learner
Missions
Problems
Projects
Notes
Complete
```

Only make UI changes required for the V2 contract.

The major expected UI change is authored Proof.

Everything else should reuse existing polished components where practical.

---

# 23. DOCUMENTATION

Update V2 README with:

- implemented directory structure
- how to validate a V2 source
- how to compile it
- how to run Golden Curriculum tests
- what status is currently implemented
- what remains for AI-driven generation orchestration

Do not rewrite the Phase 1 authority documents.

They are specifications.

If implementation reveals a genuine contradiction in them:

STOP and report before changing authority documents.

---

# 24. RESOURCE CURATION IMPLEMENTATION BOUNDARY

This Phase 2 sweep must establish the **data contract and validation hooks** required for resource curation.

It does NOT need to build a standalone autonomous internet crawler.

Implement support for resource research metadata where required by V2 artifacts and validation.

The actual live research/curation run for Python Agent Engineering belongs to Phase 3.

If useful, provide a small pure function or module for validating selected resource records.

Do not overbuild a general search platform.

---

# 25. AI REVIEW BOUNDARY

Deterministic validation belongs in code.

Semantic validators such as:

- Resource Auditor
- Curriculum Critic
- Professional Capability Auditor
- hidden-prerequisite review

do not need to be hard-coded as fake heuristics.

Instead:

- define their expected input/output contract if needed,
- leave them to the Phase 3 generation orchestration,
- ensure `validation-report.json` can record their findings.

Do not pretend deterministic code can reliably judge educational quality when it cannot.

---

# 26. DATA SAFETY

The repository already has unrelated dirty work.

Before implementation:

- capture `git status`
- do not discard unrelated changes
- do not restore unrelated files
- do not reset
- do not checkout
- do not stash
- do not stage
- do not commit
- do not push

Do not install packages unless explicitly necessary and approved.

Prefer existing dependencies.

---

# 27. BUILD / TEST COMMANDS

After implementation run the repository's appropriate tests plus:

```text
npm run build
git diff --check
```

Run the existing pure Node test suite.

Run new V2 tests.

Do not run unrelated destructive commands.

If lint is known to be noisy or not part of the current project workflow, do not make lint cleanup part of this task.

---

# 28. SUCCESS CONDITION

Phase 2 succeeds when:

1. V2 Source has a strict executable contract.
2. Valid V2 source can be validated deterministically.
3. Invalid V2 source fails with structured findings.
4. Coverage can be derived.
5. Valid source can be compiled into one clean runtime contract.
6. The application can load the V2 runtime curriculum.
7. V2 learner state uses stable IDs.
8. Study works from V2.
9. Skill Check works from V2.
10. Build works from V2.
11. Proof is authored and profession-neutral.
12. Reflection uses authored prompt IDs.
13. Complete uses one canonical V2 progression chain.
14. Projects derive milestones from Builds.
15. Progress skills derive from competencies rather than checkpoint strings.
16. Golden Curriculum validates.
17. Golden Curriculum compiles.
18. Golden Curriculum can execute the complete learner journey.
19. Automated tests pass.
20. Existing application build still passes.
21. V1 remains historical and untouched.
22. The real Python Agent Engineering curriculum has NOT been generated yet.

---

# 29. FINAL REPORT

After BUILD, return:

1. Executive summary.
2. Files created.
3. Files modified.
4. Final V2 engine directory tree.
5. Exact V2 runtime contract implemented.
6. Source validation implemented.
7. Validation checks not yet machine-implementable and why.
8. Coverage derivation implemented.
9. Compiler behavior.
10. Learner-state identity changes.
11. Study implementation.
12. Skill Check implementation.
13. Build implementation.
14. Proof implementation.
15. Reflection implementation.
16. Progression implementation.
17. Project/Build relationship implementation.
18. Progress/competency implementation.
19. Golden Curriculum summary.
20. Test coverage added.
21. Test results.
22. `npm run build` result.
23. `git diff --check` result.
24. Any pre-existing dirty files left untouched.
25. Any remaining blockers before Phase 3.
26. Whether the repository is ready to generate Python Agent Engineering.

STOP AFTER THE REPORT.

DO NOT BEGIN PHASE 3.

DO NOT GENERATE THE PYTHON AGENT ENGINEERING CURRICULUM.
