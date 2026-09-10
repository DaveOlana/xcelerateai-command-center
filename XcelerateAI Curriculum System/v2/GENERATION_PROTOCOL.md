# XcelerateAI Curriculum Engine V2 — Generation Protocol

## 1. Purpose

This document defines how one XcelerateAI curriculum-generation run turns a short curriculum creation brief into one production-ready curriculum.

The operator should not have to manually walk the AI through each stage.

From the operator's point of view:

```text
Creation Brief
      ↓
Generate Curriculum
      ↓
Production-Ready Curriculum Package
```

Internally, the generator performs several deliberate stages so that professional research, competency design, resource selection, learning design, assessment, workload, and validation are not collapsed into one uncontrolled act of writing.

### Governing rule

> **One run may contain many internal passes. The operator should still receive one coherent finished result.**

---

# 2. Input

Every generation run begins from an approved Curriculum Creation Brief.

For the first real curriculum:

```text
Profession / role:
Python Agent Engineer

Target learner:
Programming beginner

Professional outcome:
Independently design, build, test and operate practical Python AI agents.

Expected study capacity:
20–25 hours per week

Constraints / preferences:
- Prefer free resources
- Practical-first learning
- Windows-friendly
- Local-first where appropriate
- No paid resource required for progression
- Duration emerges from required competence

Special graduation goals:
- conversations
- memory
- tools
- files
- tasks
- APIs
- controlled actions
- scheduling
- inspectability
```

The creation brief expresses intent.

It does not prescribe topic order, duration, number of weeks, number of resources, number of projects, specific libraries, specific resources, or specific assessments.

Those are generation decisions.

---

# 3. Output

A successful run produces one Curriculum Build Package.

Recommended output:

```text
curriculum-build/
├── profession.json
├── competencies.json
├── resources.json
├── learning-design.json
├── curriculum-source.json
├── coverage.json
├── validation-report.json
└── generation-summary.md
```

After the compiler exists, the package also contains:

```text
├── curriculum.json
```

`curriculum-source.json` is the canonical educational source.

`curriculum.json` is compiled runtime output.

The supporting files exist so the curriculum can be inspected, defended, improved, and regenerated without losing the reasoning that created it.

---

# 4. Success and Failure

A generation run has only two valid final states:

```text
PASS
```

or:

```text
FAIL — NOT PRODUCTION READY
```

There is no "mostly valid", "good enough", "90% complete", or "ship with warnings" state for known blocking defects.

A curriculum may be returned as production-ready only when there are **zero blocking failures**.

If blocking failures cannot be repaired within the run, generation fails and the curriculum does not ship.

---

# 5. Pipeline Overview

The complete internal pipeline is:

```text
0. Preflight
      ↓
1. Profession Blueprint
      ↓
2. Competency Map
      ↓
3. Resource Discovery
      ↓
4. Learning Experience Design
      ↓
5. Curriculum Architecture
      ↓
6. Curriculum Source Authoring
      ↓
7. Derived Coverage Analysis
      ↓
8. Adversarial Validation
      ↓
9. Repair Loop
      ↓
10. Final Validation
      ↓
11. Compile Runtime Curriculum
      ↓
12. Runtime Validation
      ↓
PASS
```

Until the compiler is implemented, Stages 11–12 remain future execution stages but are still part of the final V2 protocol.

---

# 6. Stage 0 — Preflight

## Goal

Turn the creation brief into a precise generation mission before research begins.

The generator must establish:

- target profession or role
- target learner
- promised professional outcome
- study-capacity range
- hard constraints
- preferences
- special graduation goals
- important assumptions

If a term is broad, new, or industry-dependent, the generator should resolve its working definition through profession research rather than silently assume one meaning.

No syllabus is designed yet.

---

# 7. Stage 1 — Profession Blueprint

## Goal

Determine what a competent practitioner must actually be able to do.

The generator starts with the profession, not tutorials or course topics.

> **What must someone be capable of doing for the promised professional outcome to be credible?**

For contemporary or fast-changing professions, profession research must use current evidence.

Useful evidence classes include:

- official platform and framework documentation
- current engineering documentation and technical standards
- representative job descriptions
- high-quality practitioner material
- open-source production projects
- respected technical curricula where useful
- current architectural examples
- professional workflows and tooling

No single source defines the profession. The generator triangulates.

The Blueprint must define:

### A. Professional capability domains

Examples might include programming foundations, Python engineering, APIs, testing, LLM application fundamentals, tool use, state and memory, orchestration, controlled actions, scheduling, persistence, evaluation, security, integration, and operation.

These are examples only. The real set is determined by research.

### B. Observable professional capabilities

Not:

```text
Understand APIs
Know Python
Learn agents
```

Instead:

```text
Build a Python program that consumes an external API and handles failure safely.
Design a tool interface with validated arguments and predictable outputs.
Persist agent state and restore it across sessions.
Trace an agent action from model decision through tool execution and result.
Test agent behavior under successful, failed, and malformed tool responses.
```

### C. Graduation boundary

The Blueprint must distinguish:

```text
Required for the promised professional outcome
vs.
Useful but beyond the graduation boundary
```

### D. Exclusions

The Blueprint should explicitly record what the curriculum does not attempt to make the learner proficient in.

## Stage 1 output

`profession.json`

## Gate 1 — Profession Validity

Stage 1 passes only if:

- the role has a clear working definition
- the professional outcome is concrete
- capability domains are identified
- required professional capabilities are observable
- the graduation boundary is defensible
- scope exclusions exist where necessary
- the result does not merely copy another course syllabus

---

# 8. Stage 2 — Competency Map

## Goal

Decompose professional capabilities into teachable, atomic competencies.

The generator asks:

> **What must the learner know how to do before they can perform each professional capability?**

Each professional capability is broken down until the resulting competencies are:

- specific
- teachable
- observable
- reasonably assessable
- dependency-aware

Example:

```text
Professional capability:
Build a reliable Python client for an external API.

Possible competency chain:

Recognize the structure of a URL
→ understand request/response
→ interpret HTTP status codes
→ make a GET request in Python
→ parse JSON response data
→ handle request exceptions
→ handle unsuccessful status responses
→ validate expected response structure
→ test success and failure behavior
```

The point is not to create the maximum number of competencies.

The point is to create the **smallest sufficiently precise competency graph**.

Every competency declares prerequisite competencies.

The generator must detect cycles, missing prerequisites, false prerequisites, competencies that are too broad, and duplicated competencies under different wording.

Each competency is classified as:

```text
core
supporting
```

## Stage 2 output

`competencies.json`

It should preserve links from professional capabilities to the competencies that realize them.

## Gate 2 — Competency Integrity

Stage 2 passes only if:

- every required professional capability has competency coverage
- competencies are sufficiently atomic
- dependencies resolve
- the dependency graph is acyclic
- obvious duplicates are removed
- no unexplained professional capability is left unmapped
- scope has not expanded beyond the Profession Blueprint without justification

---

# 9. Stage 3 — Resource Discovery

## Goal

Find the smallest sufficient set of high-quality resources capable of teaching the competency graph.

Resource discovery begins from competencies, not websites.

> **Do not ask “What should the learner watch?” Ask “What does this competency require the learner to understand or observe?”**

The generator may cluster closely related competencies when one resource genuinely teaches them well.

A resource source registry may provide strong starting points. It is never a whitelist.

The generator may inspect:

- official documentation
- structured courses
- articles
- videos
- exercises
- labs
- repositories
- books
- interactive practice
- high-quality examples

A candidate is not selected because its title sounds relevant, the provider is famous, search results recommend it, or another curriculum uses it.

The actual resource or relevant section must be inspected sufficiently to establish competency match.

Candidate evaluation considers:

- correctness
- exact competency match
- clarity for the target learner
- practical usefulness
- current relevance
- accessibility
- unnecessary scope
- cost
- data burden where relevant

There is no mandatory resource quota.

Selected resources ultimately become:

```text
Core
Optional
```

Internally, the research artifact may also record purposes such as primary explanation, worked example, practice, reference, reinforcement, debugging, or deep dive. These internal purposes need not become learner-facing runtime fields.

When useful, record exact timestamps, chapters, sections, exercise ranges, relevant pages, repository files, or explicit stop instructions.

A learner should not be sent into a six-hour resource when only 35 useful minutes are required.

## Verification rule

Every selected Core resource must be verifiably accessible at generation time.

A Core resource whose content cannot be inspected or whose accessibility cannot be confirmed does not pass.

Optional resources should also be verified when selected.

## Stage 3 output

`resources.json`

This research artifact may contain richer evaluation metadata than the final Curriculum Source.

## Gate 3 — Resource Sufficiency

Stage 3 passes only if:

- every competency needing external teaching has adequate support
- Core resources have been inspected
- Core resources are accessible at generation time
- resource-to-competency mappings are explicit
- required knowledge is not supported only by Optional resources
- obvious redundant Core resources are removed
- exact locations are recorded where useful
- paid resources are not required when the brief prohibits them

---

# 10. Stage 4 — Learning Experience Design

## Goal

Decide how each important competency becomes usable learner ability.

Finding a resource is not learning design.

The generator uses the design lens:

```text
UNDERSTAND
→ IMPLEMENT
→ BREAK
→ DEBUG
→ TEST
→ EXPLAIN
→ IMPROVE
```

This is not a mandatory seven-step ritual.

For each competency or competency cluster, decide:

### Teaching need

Is this new, previously introduced, reinforcement, or integration?

Guidance decreases based on familiarity, not simply because the curriculum is later.

A newly introduced concept in Week 20 still receives proper teaching.

### Learning action

Examples include:

- predict program output
- trace execution
- modify working code
- write a small implementation
- break an implementation deliberately
- diagnose a failure
- write tests
- compare alternatives
- explain a decision
- integrate the skill into a larger build

### Assessment need

Decide whether the competency should be directly assessed in a Skill Check, evaluated through a Build, evaluated through both, or reinforced without direct weekly assessment.

Not every supporting competency requires equal assessment weight.

### Build opportunity

Determine where the competency should be applied in realistic work.

### Reinforcement

Determine when it should reappear later so learning is not one-and-done.

## Research-heavy tasks

Independent research is appropriate only when:

- prerequisite knowledge has already been taught, or
- research itself is the competency being developed

The generator must not replace teaching with “figure it out yourself.”

## Stage 4 output

`learning-design.json`

## Gate 4 — Learning Design Integrity

Stage 4 passes only if:

- important competencies have a credible path from information to ability
- new concepts receive appropriate scaffolding
- familiar concepts can use reduced scaffolding
- critical competencies are practiced and applied
- assessments are not substitutes for teaching
- independent research does not hide missing instruction
- reinforcement exists where forgetting risk is meaningful

---

# 11. Stage 5 — Curriculum Architecture

## Goal

Transform the competency graph and learning design into a coherent sequence of phases, weeks, builds, and projects.

This stage designs the curriculum skeleton before writing every detailed question and instruction.

### Sequence competencies

Use dependencies and learning logic.

Optimize for prerequisite correctness, manageable cognitive load, meaningful integration, repeated application, increasing independence, and momentum toward professional work.

### Define phases

Create meaningful educational phases, not calendar months.

### Form weeks

A week should represent a coherent learning mission.

Group competencies that belong together, fit a realistic weekly workload, support a meaningful Skill Check, and can culminate in useful practical work.

### Estimate workload

Estimate Study, practice, Skill Check, Build, Proof, and Reflection.

The target is credible workload within the creation brief's weekly study capacity.

### Design project progression

Identify major professional projects.

Projects should grow from real weekly Builds.

### Derive duration

After the week architecture exists:

```text
Total workload
÷
sustainable weekly capacity
=
realistic curriculum duration
```

Duration is a result.

## Gate 5 — Architecture Integrity

Stage 5 passes only if:

- week order respects prerequisites
- weekly workloads are credible
- no week is overloaded to meet an arbitrary duration
- each phase has a meaningful purpose
- builds increase in integration and independence
- projects are connected to real Builds
- the final sequence plausibly reaches the graduation outcome

---

# 12. Stage 6 — Curriculum Source Authoring

## Goal

Author the complete `curriculum-source.json` defined by `CURRICULUM_SOURCE_SPEC.md`.

At this stage, major educational decisions should already exist.

Recommended authoring order:

```text
1. Metadata / target / workload / assumptions
2. Phases
3. Competencies
4. Resource library
5. Week skeletons
6. Study assignments
7. Skill Checks
8. Builds
9. Proof
10. Reflection
11. Projects
12. Graduation
```

Every week must receive Study, Skill Check, Builds, Proof, and Reflection.

Skill Check question quality should favor reasoning, prediction, interpretation, debugging, and application over trivial recall where possible.

Each Build needs:

- outcome
- competency mapping
- realistic brief
- acceptance criteria
- suitable scaffolding
- estimated time
- templates only where useful

Proof collects only the minimum evidence needed to demonstrate the week's work.

Reflection asks learner-relevant questions grounded in what was actually studied or built.

## Internal consistency rule

A week must tell one coherent story:

```text
Study prepares the learner
        ↓
Skill Check checks understanding
        ↓
Build requires that understanding
        ↓
Proof demonstrates the work
        ↓
Reflection consolidates it
```

If those stages feel unrelated, the week fails authoring quality.

## Stage 6 output

`curriculum-source.json`

---

# 13. Stage 7 — Derived Coverage Analysis

## Goal

Derive a competency coverage matrix from the completed Curriculum Source.

The generator does not manually invent coverage claims.

For each competency, identify:

```text
Taught
Practiced
Assessed
Applied
Reinforced
```

Possible evidence includes Study assignments, Skill Check questions, required Builds, project milestones, later reuse, and reinforcement resources or Builds.

## Stage 7 output

`coverage.json`

Example:

```json
{
  "competencyId": "PYAE-C014",
  "taughtIn": ["PYAE-W04"],
  "practicedIn": ["PYAE-W04"],
  "assessedIn": ["PYAE-W04"],
  "appliedIn": ["PYAE-B-W04-01"],
  "reinforcedIn": ["PYAE-W08"]
}
```

## Gate 7 — Coverage Integrity

Blocking examples:

- a Core professional competency is never taught
- a competency is assessed before being taught
- a critical competency is taught but never practiced or applied
- a graduation competency has no credible curriculum evidence
- a Build requires a competency absent from the learner's path

Not every supporting competency needs all five coverage categories.

---

# 14. Stage 8 — Adversarial Validation

The curriculum is now attacked rather than admired.

The same AI system may perform separate internal review passes.

## A. Structural Validator

Checks IDs, references, required fields, duplicate entities, valid Skill Checks, evidence requirements, and phase/week/project links.

Whenever possible, this should eventually be deterministic code rather than AI judgment.

## B. Dependency Auditor

Attempts to find concepts used before introduction, hidden prerequisites, circular dependencies, project requirements from future weeks, and unexplained knowledge jumps.

## C. Resource Auditor

Attempts to find dead or inaccessible Core resources, wrong sections, weak competency match, redundant Core resources, resources too advanced for the learner, and paid dependencies that violate the brief.

## D. Assessment Auditor

Attempts to find untaught questions, ambiguity, invalid answers, multiple defensible answers, trivia-heavy assessment, unsupported questions, duplicates, and explanations that contradict answer keys.

## E. Build Auditor

Attempts to find vague builds, hidden prerequisites, unverifiable acceptance criteria, tutorial copying, weak competency alignment, inappropriate scaffolding, and duplicate evidence demands.

## F. Workload Auditor

Attempts to find overloaded weeks, implausible estimates, too many major builds at once, artificial duration compression, and long low-value assignments.

## G. Curriculum Critic

Reviews pacing, progression, repetition, gaps, motivation, practical relevance, balance between learning and building, and whether weeks feel designed rather than mechanically stamped.

## H. Professional Capability Auditor

Asks:

> **If a diligent beginner completed this curriculum successfully, would the promised professional outcome be credible?**

It compares the finished curriculum back to `profession.json`.

---

# 15. Severity Model

Every validation finding is classified as:

```text
BLOCKER
WARNING
NOTE
```

## BLOCKER

The curriculum cannot ship.

Examples:

- untaught prerequisite
- broken reference
- missing Core professional capability
- invalid Skill Check answer
- inaccessible required resource
- impossible Study gate
- critical competency never applied
- project requires future knowledge
- workload fundamentally incompatible with the design

## WARNING

The curriculum may technically work but deserves repair if reasonably possible.

Warnings should normally be repaired during generation.

A remaining Warning must include an explicit justification in the validation report.

## NOTE

Useful information that does not indicate a curriculum defect.

---

# 16. Stage 9 — Repair Loop

A failed audit does not immediately terminate generation.

```text
Findings
   ↓
Identify owning stage
   ↓
Repair smallest necessary area
   ↓
Re-run affected validation
   ↓
Re-run global validation
```

Examples:

```text
Missing professional capability
→ Profession Blueprint / Competency Map

Hidden prerequisite
→ Competency Map / Curriculum Architecture

Weak resource
→ Resource Discovery

Poor learning progression
→ Learning Experience Design

Bad question
→ Curriculum Source authoring

Broken ID
→ Curriculum Source authoring

Overloaded week
→ Curriculum Architecture
```

A repair should not casually rewrite unrelated parts of the curriculum.

Stable IDs are preserved for unchanged educational entities.

### Repair limit

Recommended initial limit:

```text
Maximum 5 global repair cycles
```

If Blockers remain after the limit:

```text
FAIL — NOT PRODUCTION READY
```

Do not ship the curriculum merely because the loop limit was reached.

---

# 17. Stage 10 — Final Validation

Final validation starts from a clean review perspective after repair.

It reruns:

- structural validation
- dependency validation
- resource validation
- assessment validation
- build validation
- workload validation
- curriculum critique
- professional capability validation
- coverage validation

Final PASS requires:

```text
BLOCKERS: 0
```

Warnings should be zero where practical.

Any remaining Warning must be explicitly justified.

---

# 18. Stage 11 — Compilation

After the compiler is implemented:

```text
valid curriculum-source.json
          ↓
Curriculum Compiler
          ↓
curriculum.json
```

Compilation is mechanical.

The compiler must not make educational decisions.

If the source violates the contract, compilation fails.

---

# 19. Stage 12 — Runtime Validation

The compiled curriculum must then pass runtime-oriented validation.

This includes:

- application schema validity
- route/data loading
- Study requirements
- Skill Check progression
- Build completion
- Proof evidence
- Reflection
- Complete progression
- project relationships
- Progress derivation
- stable identity behavior

A curriculum is not production-ready until both educational validation and runtime validation pass.

---

# 20. Resource Research Evidence

For every selected resource, `resources.json` should preserve research metadata such as:

```text
resource ID
URL
provider
access status
date checked
competencies supported
relevant section
estimated learner time
why selected
candidate alternatives considered
```

This richer research evidence does not all need to appear in `curriculum-source.json`.

---

# 21. Generation Traceability

Every major curriculum decision should be traceable backward.

```text
Graduation outcome
    ↓
Professional capability
    ↓
Competency
    ↓
Learning design
    ↓
Resource / practice
    ↓
Skill Check
    ↓
Build
    ↓
Project
```

The generator should be able to answer questions such as:

> Which Build proves competency `PYAE-C114`?

or:

> Which Core resource teaches the concept tested by question `PYAE-Q-W16-07`?

from artifacts rather than inventing an explanation after generation.

---

# 22. Workload Estimation

Workload must include more than video duration.

For each week, estimate:

```text
Resource consumption
Hands-on practice
Skill Check
Build work
Debugging/testing
Proof
Reflection
```

The estimate should account for the target learner.

A 60-minute coding tutorial does not equal 60 minutes of learner workload if a beginner must pause, reproduce, experiment, and debug.

Pilot data may later calibrate estimates.

---

# 23. Curriculum Variety Without Randomness

A high-quality curriculum should not feel like every week was generated from one template.

The generator should vary learning activity according to the competency.

Examples:

- code tracing
- prediction
- implementation
- debugging
- test writing
- refactoring
- API exploration
- repository reading
- controlled research
- comparison
- integration
- project work

Variation must serve learning, not novelty.

---

# 24. Avoiding AI Curriculum Failure Modes

The generator must actively guard against:

### Topic-list curriculum
A sequence of broad topics without competency-level reasoning.

### Resource dumping
Large piles of tutorials because quantity looks impressive.

### Tutorial cloning
Builds that merely copy the resource.

### Knowledge jumps
Builds that require concepts never taught.

### Mechanical weekly repetition
Every week using the same activity pattern regardless of subject.

### Premature independence
Research-heavy work before the learner has the foundation.

### Endless scaffolding
Step-by-step guidance for competencies already practiced repeatedly.

### Fake professional projects
Large project names without integrated professional competence.

### Trivia assessment
Memorization-heavy Skill Checks disconnected from practical reasoning.

### Artificial duration
Removing or compressing required learning to satisfy a preselected number of weeks.

---

# 25. Human Review

The goal is not to require manual reconstruction after generation.

A production-ready run should be good enough to begin pilot learning immediately.

Human review is still useful for inspecting the generation summary, reviewing unusual warnings, confirming intended professional scope, and approving publication.

Human review should not consist of manually fixing dozens of predictable generation defects.

If that happens, the generation system has failed.

---

# 26. Generation Summary

Every successful run produces `generation-summary.md`.

Recommended contents:

```text
Curriculum
Target learner
Professional outcome
Derived duration
Estimated total workload
Number of phases
Number of weeks
Number of competencies
Number of Core resources
Number of Optional resources
Number of Builds
Number of Projects
Major graduation capabilities
Validation result
Warnings, if any
```

---

# 27. Validation Report

`validation-report.json` should contain:

```text
generation status
validation timestamp
validator passes
findings
severity
affected entity IDs
repairs performed
remaining warnings
final blocker count
```

A successful production run must end with:

```text
status: PASS
blockingFailures: 0
```

---

# 28. One-Run Execution Rule

The final generation system should support an operator experience equivalent to:

```text
Generate this curriculum from this approved Creation Brief.
```

The generator may internally research, write artifacts, critique, revise, search again, replace resources, restructure weeks, rewrite assessments, and rerun validation without requiring the operator to manually approve every internal stage.

The process stops for human input only when:

1. the creation brief contains a genuine unresolved product decision, or
2. the generator cannot resolve a blocking conflict without changing the promised professional outcome or hard constraints.

Routine curriculum design decisions belong to the generator.

---

# 29. First Production Use

The first full production use of this protocol will be:

**Python Agent Engineering**

The generator must not begin from the old V1 syllabus.

It may consult V1 at its discretion for lessons, but the new Profession Blueprint and Competency Map must be established from the V2 Creation Brief and current professional evidence.

This first curriculum is also the first serious validation of Curriculum Engine V2.

---

# 30. Phase 1 Status After This Document

With:

```text
1. Phase 1 Foundation
2. Curriculum Source Specification
3. Generation Protocol
```

the V2 conceptual architecture is mostly defined.

The remaining Phase 1 design document is:

> **VALIDATION_STANDARD.md**

That document should turn the quality rules in this protocol into a precise pass/fail contract for implementation.

After that, Phase 1 design can be handed to Codex for implementation of the engine foundation, schema, validator, compiler, and golden test curriculum.

---

# 31. Evidence-Backed Content Revision and Publication

A learning-content revision is not a clean-slate regeneration. It begins from the current published curriculum, preserves stable IDs for materially unchanged educational objects, and repairs only demonstrated resource, assessment, dependency, workload, or explanation defects.

The generation run must produce a non-runtime `content-integrity-audit.json` artifact containing:

- resource retain, replace, add, and remove decisions with inspected candidates;
- one A/B/C/D readiness classification for every production Skill Check question;
- a separate dependency and beginner-readiness audit for every required Build;
- one evidence-backed beginner-readiness judgment for every Week;
- the findings reviewed during semantic/adversarial validation.

Skill Check readiness and Build readiness are separate gates. Passing questions must not be treated as proof that a learner understands a Build specification. New professional terminology must be taught or contextually explained, and a learner who completes required Study must not need outside research merely to decode the assignment.

Long Builds should be decomposed into learner-visible planning sessions. Sessions organize authored steps and approximate effort; they do not create learner-state events or verified micro-progress.

Compilation remains mechanical. It may copy and index authored concepts, learning roles, learner guides, and sessions, but it must never generate their educational meaning. Likewise, a pipeline must never manufacture semantic approval. Semantic PASS is accepted only from a complete, inspectable audit artifact whose evidence satisfies the applicable production gates.

Publication of a revised curriculum is atomic:

```text
candidate source and research
→ assessment and Build audits
→ semantic validation
→ deterministic validation
→ revision reconciliation
→ runtime validation
→ maintained tests
→ production build
→ publish
```

Until every required gate passes, the current published revision remains active and the candidate must not enter the learner catalog.
