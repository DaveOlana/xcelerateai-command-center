# XcelerateAI Curriculum System V2

V2 is the clean-slate curriculum-generation and runtime system for XcelerateAI. The legacy V1 system is preserved under `../v1` for historical reference only and is not authoritative for V2.

## Authority

- `XcelerateAI_Curriculum_Engine_V2_Phase_1_Foundation.md`
- `CURRICULUM_SOURCE_SPEC.md`
- `GENERATION_PROTOCOL.md`
- `VALIDATION_STANDARD.md`
- `RESOURCE_CURATION_STANDARD.md`
- `PHASE_2_IMPLEMENTATION_PROMPT.md`
- `PHASE_2_CATALOG_UPDATE_ADDENDUM.md`

## Implemented engine

```text
src/curriculum-v2/
├── schema/       Machine-readable contract and enums
├── validation/   Deterministic source/runtime/resource checks
├── coverage/     Stable-ID competency coverage derivation
├── compiler/     Deterministic Source → runtime compilation
├── catalog/      Validated embedded publication catalog
├── state/        Curriculum-scoped, revision-safe learner state
└── runtime/      Progression, Projects, and competency evidence
```

The runtime implements one learner journey:

```text
Study → Skill Check → Build → Proof → Reflect → Complete
```

## Golden Curriculum

`examples/golden-curriculum/` contains the small structural fixture used to prove validation, compilation, coverage, catalog publication, stable learner identity, revision reconciliation, and the complete learner journey.

Its `example.com` resource URLs are deliberate placeholders. They are not verified learning recommendations and the fixture is not a production curriculum.

Rebuild its generated artifacts:

```text
npm run curriculum:v2:golden
```

Run all V2 tests:

```powershell
$tests = Get-ChildItem .\src\curriculum-v2 -Recurse -Filter *.test.js
node --test $tests.FullName
```

Programmatic entry points are exported from `src/curriculum-v2/index.js`:

- `validateCurriculumSource(source)` validates strict V2 Source and returns structured findings.
- `generateCoverage(source)` derives the competency coverage record.
- `compileCurriculum(source)` rejects invalid Source and emits the runtime contract.
- `validateRuntimeCurriculum(runtime)` checks the compiled application contract.
- `publishCurriculumSource(source)` performs the validated publication transformation.

## Current status

Implemented in Phase 2:

- strict V2 Source validation
- deterministic coverage and compilation
- runtime validation
- embedded published curriculum catalog
- multiple curriculum state namespaces
- revision-safe stage satisfaction
- stable-ID Study, Skill Check, Build, Proof, Reflection, Projects, and Progress
- update-safe backup, restore, selection, and curriculum-specific reset
- Golden Curriculum artifacts and automated tests

Still reserved for Phase 3:

- AI-driven profession research and curriculum generation orchestration
- live resource discovery and verification
- semantic Curriculum Critic, Resource Auditor, hidden-prerequisite review, and Professional Capability Auditor passes
- the real Python Agent Engineering curriculum

Deterministic validation records facts. Semantic educational judgment remains an explicit AI review contract; it is not simulated with keyword heuristics.
