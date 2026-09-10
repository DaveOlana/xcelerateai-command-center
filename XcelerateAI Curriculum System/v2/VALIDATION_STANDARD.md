# XcelerateAI Curriculum Engine V2 — Validation Standard

## 1. Purpose

This document defines the pass/fail quality contract for XcelerateAI Curriculum Engine V2.

A curriculum is not production-ready because it is syntactically valid.

It must also be structurally coherent, educationally defensible, professionally relevant, resource-valid, workload-realistic, and runnable inside XcelerateAI.

### Governing rule

> **A curriculum ships only when all blocking validation failures are zero.**

Validation exists to prevent predictable curriculum-generation mistakes from reaching the learner.

---

# 2. Validation Layers

V2 validation has four layers:

```text
LAYER 1 — STRUCTURAL VALIDATION
Does the curriculum satisfy the source contract?

LAYER 2 — EDUCATIONAL VALIDATION
Does the curriculum make sense as a learning journey?

LAYER 3 — PROFESSIONAL VALIDATION
Does the curriculum plausibly produce the promised capability?

LAYER 4 — RUNTIME VALIDATION
Does the compiled curriculum behave correctly inside XcelerateAI?
```

Layers 1–3 validate `curriculum-source.json`.

Layer 4 validates the compiled runtime curriculum.

A final production PASS requires all applicable layers to pass.

---

# 3. Validation Severity

Every finding is one of:

```text
BLOCKER
WARNING
NOTE
```

## BLOCKER

A known defect that makes the curriculum unfit for production.

A single unresolved Blocker means:

```text
FAIL — NOT PRODUCTION READY
```

## WARNING

A meaningful quality concern that does not necessarily make the curriculum unusable.

Warnings should normally be repaired before shipment.

Any Warning left unresolved must include:

- affected entity IDs
- reason it remains
- why it does not compromise the learner outcome

## NOTE

A non-defect observation recorded for traceability.

Notes never prevent shipment.

---

# 4. Validation Result

The final validation result is:

```json
{
  "status": "PASS",
  "blockingFailures": 0,
  "warnings": 0,
  "notes": 0
}
```

or:

```json
{
  "status": "FAIL",
  "blockingFailures": 3,
  "warnings": 2,
  "notes": 1
}
```

The status must never be derived from subjective confidence.

It is determined by explicit validation results.

---

# 5. Validation Philosophy

Validation must be:

- strict on correctness
- conservative about hidden knowledge gaps
- transparent
- reproducible where possible
- evidence-based
- curriculum-wide, not only week-by-week
- capable of identifying the exact entities involved

Whenever a rule can be validated deterministically, code should validate it.

AI judgment should be reserved for things that require educational or professional reasoning.

---

# 6. Validator Categories

The V2 validator suite contains these categories:

```text
V001 Structure
V002 Identity
V003 References
V004 Competency Graph
V005 Study
V006 Skill Check
V007 Build
V008 Proof
V009 Reflection
V010 Project
V011 Coverage
V012 Resource Quality
V013 Dependency Order
V014 Workload
V015 Curriculum Coherence
V016 Professional Capability
V017 Generation Integrity
V018 Runtime
```

Each category may contain multiple checks.

---

# 7. V001 — Structural Validation

## Purpose

Confirm that `curriculum-source.json` follows the canonical V2 source structure.

### BLOCKER checks

- required top-level fields exist
- fields use the expected data type
- arrays are present where required
- objects are present where required
- unsupported legacy aliases are rejected
- unsupported obsolete structures are rejected
- every week contains:
  - Study
  - Skill Check
  - Builds
  - Proof
  - Reflection
- malformed entities are rejected
- unknown critical enum values are rejected

### Examples of failures

```text
V001-B001
weeks is missing

V001-B002
study.resources must be an array

V001-B003
monthNumber is not part of Curriculum Source V2

V001-B004
week.proof must be an object
```

---

# 8. V002 — Identity Validation

## Purpose

Ensure all learner-state and reference identities are stable and unambiguous.

### BLOCKER checks

- `curriculumId` exists and is non-empty
- every Phase has an ID
- every Competency has an ID
- every Resource has an ID
- every Week has an ID
- every Skill Check has an ID
- every Skill Check Question has an ID
- every Build has an ID
- every Build acceptance criterion has an ID
- every Proof has an ID
- every Proof evidence item has an ID
- every Reflection prompt has an ID
- every Project has an ID
- every Project Milestone has an ID
- every Template has an ID
- IDs are unique across their intended namespace
- duplicate IDs are rejected
- array index is never accepted as identity
- display title is never accepted as identity

### Material-change rule

A materially changed Skill Check must receive a new Skill Check ID.

Material changes include:

- question-set replacement
- change in assessment intent
- change in answer key
- major change in assessed competency coverage
- meaningful scoring change

Wording-only clarification does not necessarily require a new ID.

---

# 9. V003 — Reference Validation

## Purpose

Ensure every explicit reference resolves to a valid entity.

### BLOCKER checks

- every `phaseId` resolves
- every `competencyId` resolves
- every `resourceId` resolves
- every `buildId` resolves
- every project `weekId` resolves
- every project `buildId` belongs to the referenced week
- every graduation competency resolves
- every graduation project resolves
- every prerequisite competency resolves
- every resource competency resolves
- every Skill Check competency resolves
- every question competency resolves
- every Build competency resolves

No dangling references are allowed.

---

# 10. V004 — Competency Graph Validation

## Purpose

Ensure the competency map is usable as a learning dependency graph.

### BLOCKER checks

- dependency graph contains no cycles
- no competency depends on itself
- all prerequisite references resolve
- every Core professional capability has competency coverage
- every graduation competency is present in the curriculum path
- no Core competency is orphaned from all teaching and application

### AI-reviewed quality checks

The validator should also inspect for:

- competencies that are too broad
- duplicated competencies under different names
- competencies that are purely topical labels
- false prerequisites
- missing prerequisite steps
- unnecessary decomposition

### WARNING examples

- two competencies appear substantially overlapping
- a supporting competency may be excessively granular
- one competency description is too vague to assess

---

# 11. V005 — Study Validation

## Purpose

Ensure Study actually prepares the learner for the week's expectations.

### BLOCKER checks

- every Study resource reference resolves
- every Study resource maps to at least one week competency
- `coreMinimum` is an integer
- `coreMinimum` is non-negative
- `coreMinimum` does not exceed Core resource count
- a week with assessed new competencies has sufficient Core teaching
- required assessment knowledge is not supported only by Optional resources
- a Core resource cannot be inaccessible at generation time
- Core Study cannot be empty when the week introduces new knowledge that requires teaching

### Quality checks

The validator should inspect:

- whether Core resources are excessive
- whether assigned sections are too broad
- whether the learner is sent into irrelevant material
- whether multiple Core resources are substantially redundant
- whether Optional resources have a clear reason to exist

### BLOCKER example

```text
Skill Check question PYAE-Q-W07-04 tests competency PYAE-C052,
but no Core Study resource in or before Week 7 teaches that competency.
```

---

# 12. V006 — Skill Check Validation

## Purpose

Ensure Skill Checks are structurally correct and educationally fair.

### Deterministic BLOCKER checks

Each Skill Check must have:

- stable Skill Check ID
- passing score from 1–100
- exactly 10 questions

Each question must have:

- stable question ID
- non-empty prompt
- at least one competency mapping
- exactly 4 answer options
- unique option IDs
- exactly one `correctOptionId`
- valid correct option reference
- non-empty explanation

### Educational BLOCKER checks

- no question assesses an untaught competency
- no required answer depends only on Optional material
- no question has multiple defensible correct answers
- no answer key contradicts the explanation
- no question requires future-week knowledge

### Quality checks

The Skill Check should favor:

- application
- interpretation
- reasoning
- prediction
- debugging

over trivia.

A Skill Check that is overwhelmingly vocabulary recall should normally produce a Warning or Blocker depending on severity.

### Duplicate-question detection

The auditor should detect questions that differ only superficially while testing the same fact in effectively the same way.

---

# 13. V007 — Build Validation

## Purpose

Ensure Builds turn learning into actual ability.

### BLOCKER checks

- every required Build has a stable ID
- every Build has a clear outcome
- every Build maps to at least one competency
- every required Build has at least one acceptance criterion
- acceptance criteria have stable IDs
- Build competencies have been introduced by the time the Build occurs
- Build does not rely on a future prerequisite
- required Builds are distinguishable from optional Builds
- project-linked Builds exist

### Educational BLOCKER checks

- a Build cannot require a tool or concept that has never been taught or intentionally scaffolded
- a Build cannot be only a disguised tutorial-copying task if it is intended to demonstrate independent ability
- a Build must have a meaningful relationship to the week's competencies

### Quality checks

Inspect for:

- vague instructions
- overly prescriptive steps on already familiar skills
- insufficient support for genuinely new skills
- unrealistic build size
- meaningless stretch tasks
- acceptance criteria that are not observable

---

# 14. V008 — Proof Validation

## Purpose

Ensure Proof is meaningful, profession-neutral, and non-duplicative.

### Supported initial evidence types

```text
link
text
confirmation
```

### BLOCKER checks

- every Proof has a stable ID
- every evidence item has a stable ID
- every evidence type is supported
- required flags are valid
- at least one required evidence item exists for a required Proof stage
- required evidence labels are non-empty
- Proof does not contain hard-coded universal GitHub requirements
- Proof does not require unsupported file types
- Proof does not duplicate separate Build evidence state

### Quality checks

The validator should inspect:

- whether the evidence is sufficient to show the work
- whether the evidence demand is excessive
- whether the learner is being asked to re-enter information unnecessarily
- whether Proof matches the nature of the Build

### Governing distinction

> **Build produces the work. Proof presents sufficient evidence of the work.**

---

# 15. V009 — Reflection Validation

## Purpose

Ensure Reflection consolidates learning without becoming bureaucracy.

### BLOCKER checks

- `minimumResponses` is an integer
- `minimumResponses` is non-negative
- `minimumResponses` does not exceed prompt count
- prompt IDs are unique
- required prompts are non-empty

### Quality checks

Reflection prompts should:

- relate to the week's actual learning
- encourage explanation, diagnosis, comparison, or improvement
- avoid generic filler

Example weak prompt:

```text
What did you learn this week?
```

Example stronger prompt:

```text
What failure did you deliberately create, and how did you diagnose it?
```

Generic prompts are not always invalid, but repeated generic reflection should trigger a Warning.

---

# 16. V010 — Project Validation

## Purpose

Ensure projects represent real integrated work rather than duplicate progress systems.

### BLOCKER checks

- every Project has a stable ID
- every Milestone has a stable ID
- every Milestone references a valid Week
- every Milestone references a valid Build
- the referenced Build belongs to the referenced Week
- Project competencies resolve
- graduation-required projects exist
- no project milestone references future work incorrectly relative to project sequencing

### Governing rule

Project milestone completion is derived from the referenced Build.

There is no separate duplicate milestone completion state.

### Quality checks

The validator should inspect whether:

- the project genuinely integrates important competencies
- milestones build toward a meaningful whole
- the project is large only in name
- the final project is credible evidence for the promised professional outcome

---

# 17. V011 — Coverage Validation

## Purpose

Ensure important competencies receive enough learning exposure to become ability.

Coverage is derived, not manually claimed.

For each competency, derive:

```text
Taught
Practiced
Assessed
Applied
Reinforced
```

### BLOCKER examples

A Core professional competency:

- is never taught
- is assessed before teaching
- is never practiced
- is never applied where application is necessary
- is graduation-required but has no credible curriculum evidence

### Supporting competencies

Supporting competencies may have lighter coverage.

The validator should judge coverage relative to professional importance.

### Coverage matrix

`coverage.json` should expose exact curriculum evidence for every coverage claim.

Example:

```json
{
  "competencyId": "PYAE-C014",
  "taughtIn": ["PYAE-W04"],
  "practicedIn": ["PYAE-W04"],
  "assessedIn": ["PYAE-SC-W04"],
  "appliedIn": ["PYAE-B-W04-01"],
  "reinforcedIn": ["PYAE-W08"]
}
```

---

# 18. V012 — Resource Quality Validation

## Purpose

Prevent fake, inaccessible, irrelevant, or weak resources from becoming curriculum dependencies.

### Required research evidence for each Core resource

- valid URL
- provider
- access status
- date checked
- competency mapping
- relevant section or location where useful
- why selected
- estimated learner time

### BLOCKER checks

- Core URL cannot be missing
- Core resource cannot be inaccessible at generation time
- Core resource cannot have unverified competency fit
- required paid access cannot violate the Creation Brief
- selected section cannot omit the knowledge later assessed
- obviously outdated material cannot be Core when current behavior matters

### AI-reviewed quality

Resource Auditor should inspect:

- correctness
- clarity for target learner
- practical usefulness
- excessive scope
- redundancy
- relevance
- unnecessary data/time burden
- whether the exact selected section is actually enough

### Resource reputation rule

A famous provider is not automatically a PASS.

The exact resource must earn selection.

---

# 19. V013 — Dependency Order Validation

## Purpose

Ensure the curriculum never demands knowledge before the learner has a reasonable path to acquire it.

### BLOCKER checks

- week order respects competency prerequisites
- Skill Check questions do not require future competencies
- Builds do not require future competencies
- Projects do not require future competencies
- reinforcement does not masquerade as first instruction
- independent research tasks do not hide untaught prerequisites

### Hidden-prerequisite audit

The auditor should inspect natural-language Build instructions and questions for concepts that are not explicitly declared in competency mappings.

Example:

A Build mapped only to:

```text
HTTP requests
JSON parsing
```

but its brief suddenly requires:

```text
environment variables
async programming
Docker
OAuth
```

That is a hidden-prerequisite failure unless those capabilities are already taught.

---

# 20. V014 — Workload Validation

## Purpose

Ensure workload is realistic for the target learner and study capacity.

Weekly workload includes:

```text
resource consumption
hands-on practice
Skill Check
Build
debugging/testing
Proof
Reflection
```

### BLOCKER checks

- estimated weekly hours are positive
- total estimated hours reconcile reasonably with weekly estimates
- curriculum duration is consistent with weekly study capacity
- no week is dramatically overloaded without educational justification
- no essential content is visibly compressed to force a preferred duration

### WARNING checks

- unusually light week
- unusually heavy week
- excessive passive-resource time
- excessive number of major Builds in one week

### Important rule

Resource playback or reading duration is not equal to total learning time.

Beginner workload should account for pausing, reproducing, experimenting, debugging, and repetition.

---

# 21. V015 — Curriculum Coherence Validation

## Purpose

Review the curriculum as one learning journey rather than isolated valid weeks.

This is primarily an AI-reviewed validator.

It inspects:

- pacing
- progression
- cognitive load
- practical momentum
- repetition
- reinforcement
- learner independence
- variety of learning activity
- consistency of difficulty
- relationship between Study, Skill Check, Build, Proof, and Reflection

### BLOCKER examples

- major learning gap between phases
- repeated weeks that mechanically stamp the same format without serving learning
- large project jump with insufficient preparation
- curriculum architecture that cannot plausibly reach the graduation target

### WARNING examples

- monotonous activity pattern
- too much passive study
- weak reinforcement
- several consecutive weeks without meaningful application

---

# 22. V016 — Professional Capability Validation

## Purpose

Determine whether completion of the curriculum plausibly supports the promised professional outcome.

This validator compares:

```text
profession.json
        vs.
competencies.json
        vs.
curriculum-source.json
        vs.
coverage.json
```

### Core question

> **If a diligent target learner successfully completed this curriculum, would the promised professional outcome be credible?**

### BLOCKER checks

- required professional capability missing from competency map
- Core capability mapped but not meaningfully developed
- graduation project too weak for the graduation claim
- special graduation goal absent from the curriculum
- excessive focus on peripheral knowledge while major capability remains shallow

### Scope-control check

The validator should also detect unnecessary profession expansion.

The curriculum should produce the promised capability, not attempt to teach every adjacent profession.

---

# 23. V017 — Generation Integrity Validation

## Purpose

Confirm that the final curriculum was actually produced through a traceable generation process rather than patched into apparent correctness.

### Required artifacts

A production generation package must contain:

```text
profession.json
competencies.json
resources.json
learning-design.json
curriculum-source.json
coverage.json
validation-report.json
generation-summary.md
```

After compiler implementation:

```text
curriculum.json
```

### BLOCKER checks

- required build artifact missing
- final curriculum cannot be traced to competencies
- Core resources lack research evidence
- coverage claims have no source evidence
- validation report is missing
- final blocker count is not zero
- generation summary falsely reports PASS when validation report does not

### Traceability requirement

The system must be able to trace:

```text
Professional outcome
→ capability
→ competency
→ learning design
→ resource/practice
→ assessment
→ Build
→ project
```

where relevant.

---

# 24. V018 — Runtime Validation

## Purpose

Confirm the compiled curriculum behaves correctly in XcelerateAI.

This validator becomes active after the compiler and V2 runtime contract are implemented.

### Required runtime tests

At minimum:

- curriculum loads successfully
- learner can enter Week 1
- Study Core gating works
- Optional Study does not incorrectly block
- Skill Check accepts exactly the authored assessment
- passing-score logic works
- failure and recovery behavior works as designed
- required Builds gate progression
- optional Builds do not gate progression
- Proof renders authored evidence requirements
- required Proof evidence gates progression
- Reflection minimum works
- Complete becomes available only when requirements are satisfied
- completing a week advances progression correctly
- Project milestones derive from Build completion
- Progress skills derive from stable competency evidence
- stable IDs preserve unchanged learner progress across non-material revisions
- display renames do not orphan learner progress

### Runtime PASS

The curriculum must successfully execute the full learner journey:

```text
Study
→ Skill Check
→ Build
→ Proof
→ Reflect
→ Complete
```

---

# 25. Cross-Layer Invariants

Some rules span several validator categories.

These are especially important.

## A. Assessment-to-Study invariant

Every required concept assessed in a Skill Check must have a valid teaching path through Core Study or previous required learning.

## B. Build-to-Competency invariant

Every required capability used by a Build must already exist in the learner's taught competency path.

## C. Project-to-Build invariant

Every Project Milestone must point to real weekly work.

## D. Graduation-to-Coverage invariant

Every graduation-required Core competency must have sufficient evidence of learning and application.

## E. Workload-to-Duration invariant

The published duration must reconcile with the actual designed workload.

## F. Resource-to-Assessment invariant

A Skill Check cannot depend on knowledge that exists only outside assigned Core boundaries.

---

# 26. Validation Ordering

Recommended validation order:

```text
1. Structure
2. Identity
3. References
4. Competency graph
5. Study
6. Skill Check
7. Build
8. Proof
9. Reflection
10. Projects
11. Coverage
12. Dependency order
13. Resource quality
14. Workload
15. Curriculum coherence
16. Professional capability
17. Generation integrity
18. Runtime
```

Earlier deterministic failures should be fixed before expensive semantic audits.

---

# 27. Repair Ownership

Each finding should identify the stage responsible for repair.

Examples:

| Finding | Owning stage |
|---|---|
| Missing professional capability | Profession Blueprint |
| Missing prerequisite | Competency Map |
| Weak Core resource | Resource Discovery |
| No practice path | Learning Experience Design |
| Overloaded week | Curriculum Architecture |
| Bad question | Curriculum Source Authoring |
| Invalid ID | Curriculum Source Authoring |
| Coverage hole | Relevant upstream stage |
| Runtime mapping failure | Compiler / runtime integration |

The repair system should modify the smallest necessary scope.

---

# 28. Global Repair Loop

Recommended V2 behavior:

```text
Validate
  ↓
Blockers / Warnings
  ↓
Repair
  ↓
Revalidate affected areas
  ↓
Revalidate globally
```

Maximum initial global repair cycles:

```text
5
```

If Blockers remain after five global cycles:

```text
FAIL — NOT PRODUCTION READY
```

The system must return the unresolved blockers rather than silently lowering standards.

---

# 29. Warning Policy

Warnings are not a loophole for shipping defects.

A Warning may remain only when:

- the issue is genuinely non-blocking
- repair would introduce greater harm or unjustified complexity
- the warning is explicitly justified

The report should include:

```text
warning code
affected IDs
description
reason retained
expected learner impact
```

A large number of unresolved Warnings should itself trigger curriculum review.

---

# 30. No Silent Repair

The strict validator must never silently mutate the curriculum to make it pass.

Examples of prohibited silent repair:

- adding a missing ID
- deleting a broken resource
- lowering Core minimum
- changing a correct answer
- removing a prerequisite
- fabricating a missing competency
- replacing a URL
- changing week order

The validator reports.

The generation repair step edits.

Then validation reruns.

---

# 31. Deterministic vs AI Validation

V2 should deliberately separate what code can prove from what AI must judge.

## Deterministic validation examples

- JSON structure
- required fields
- enums
- IDs
- reference resolution
- duplicate IDs
- exact question count
- exact option count
- correct option existence
- competency DAG cycles
- Core minimum arithmetic
- project reference integrity
- workload arithmetic
- supported Proof evidence types

## AI-reviewed validation examples

- whether a competency is sufficiently atomic
- whether a resource actually teaches the mapped competency
- whether a Build has a hidden prerequisite
- whether a question is ambiguous
- whether scaffolding is appropriate
- whether workload is credible for a beginner
- whether the curriculum feels mechanically generated
- whether the graduation claim is professionally credible

### Governing rule

> **Use deterministic code for facts. Use AI review for judgment.**

---

# 32. Validation Report Format

Recommended structure:

```json
{
  "status": "PASS",
  "curriculumId": "PYAE",
  "revision": 1,
  "validatedAt": "ISO-8601 timestamp",
  "blockingFailures": 0,
  "warningCount": 0,
  "noteCount": 2,
  "passes": [
    {
      "validator": "V001",
      "name": "Structure",
      "status": "PASS",
      "findings": []
    }
  ],
  "repairs": [
    {
      "cycle": 1,
      "findingCode": "V013-B004",
      "affectedIds": ["PYAE-B-W09-01"],
      "action": "Removed untaught async requirement and moved it to Week 14."
    }
  ],
  "remainingWarnings": []
}
```

---

# 33. Generation Summary PASS Language

A generation summary may state:

```text
Validation: PASS
Blocking failures: 0
Warnings: 0
```

It must not say:

```text
Perfect curriculum
Guaranteed learning outcome
Guaranteed professional competence
```

Validation proves that known design and structural standards were satisfied.

Actual learner effectiveness is still calibrated through pilot use.

---

# 34. Production Gate

A curriculum may be marked **PRODUCTION READY FOR PILOT** only when:

```text
Structural Validation       PASS
Identity Validation         PASS
Reference Validation        PASS
Competency Validation       PASS
Study Validation            PASS
Skill Check Validation      PASS
Build Validation            PASS
Proof Validation            PASS
Reflection Validation       PASS
Project Validation          PASS
Coverage Validation         PASS
Resource Validation         PASS
Dependency Validation       PASS
Workload Validation         PASS
Curriculum Coherence        PASS
Professional Capability     PASS
Generation Integrity        PASS
Runtime Validation          PASS
Blocking Failures           0
```

Before runtime implementation exists, the best possible status is:

```text
EDUCATIONALLY VALIDATED — AWAITING RUNTIME COMPILATION TEST
```

Once the runtime/compiler exists, the final status becomes:

```text
PRODUCTION READY FOR PILOT
```

---

# 35. Golden Curriculum Requirement

Before Python Agent Engineering is generated as the first real production curriculum, the engine implementation should pass a small Golden Curriculum.

The Golden Curriculum should be:

- 1–2 weeks
- intentionally small
- structurally complete
- representative of every learner stage
- equipped with stable IDs
- equipped with Core and Optional Study
- equipped with a valid Skill Check
- equipped with required and optional Build behavior
- equipped with Proof
- equipped with Reflection
- equipped with at least one Project relationship

The Golden Curriculum exists to prove:

```text
Source
→ Validate
→ Compile
→ Load
→ Run learner journey
```

It is not a substitute for the Python Agent Engineering curriculum.

---

# 36. Pilot Boundary

Validation should catch:

- missing prerequisite
- invalid assessment
- fake or dead Core resource
- impossible progression
- broken project relationship
- workload arithmetic failure
- missing professional capability
- hidden required knowledge

Pilot testing should discover things such as:

- a resource explanation did not click as well as expected
- a Build took longer than estimated
- a prompt was confusing to a real learner
- a week felt mentally heavy despite correct workload estimates
- reinforcement should happen sooner

### Governing rule

> **Pilot testing calibrates learning. It does not excuse preventable generation defects.**

---

# 37. Phase 1 Completion

With these four V2 documents:

```text
1. XcelerateAI Curriculum Engine V2 — Phase 1 Foundation
2. CURRICULUM_SOURCE_SPEC.md
3. GENERATION_PROTOCOL.md
4. VALIDATION_STANDARD.md
```

Phase 1 design is complete.

The next phase is implementation.

Codex should then be given one coordinated implementation task to build:

- the V2 source schema
- deterministic source validator
- coverage generator
- compiler boundary
- new V2 runtime contract
- required learner-state identity updates
- Proof runtime support
- Project-to-Build derivation
- competency-based Progress derivation
- Golden Curriculum
- automated tests
- end-to-end validation

The implementation must use these documents as V2 authority.

V1 remains historical reference only.

---

# 38. V020 — Learning Content Integrity Audit

V020 validates the evidence artifact for a production learning-content revision. V019 remains the source/runtime learning-presentation contract validator.

Deterministic BLOCKER checks include:

- every selected production resource has matching inspected research evidence;
- every Study assignment has an explicit `learningRole` and learner-facing purpose;
- every production question has exactly one A/B/C/D audit record;
- D, meaning an untaught factual dependency, equals zero;
- every Week contains at least seven questions classified A or B;
- every required Build has a separate dependency audit and no remaining hidden prerequisite;
- every required Build has an authored learner guide, finished result, and valid session plan;
- all concept and prior-knowledge references resolve under source/runtime validation;
- all Week readiness judgments are evidence-backed YES results;
- audit IDs and revision metadata exactly match the candidate Curriculum Source.

Semantic review must inspect what deterministic code cannot judge, including beginner clarity, factual framing, realistic distractors, meaningful resource assignments, appropriate terminology, and whether Study genuinely prepares the learner to begin the Build. A script may validate the presence and internal consistency of this evidence; it may not invent the judgment or declare semantic PASS merely because fields exist.

The content audit is non-runtime. It is retained for traceability and review but must not be compiled into learner curriculum data, learner state, backup/export payloads, or catalog metadata.

For a curriculum revision, production publication is an atomic final action. Any failed educational, deterministic, reconciliation, runtime, test, or build gate leaves the prior published revision active.
