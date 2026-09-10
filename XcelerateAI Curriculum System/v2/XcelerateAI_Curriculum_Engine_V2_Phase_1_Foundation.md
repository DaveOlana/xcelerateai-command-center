# XcelerateAI Curriculum Engine V2 — Phase 1 Foundation

## 1. Purpose

XcelerateAI Curriculum Engine V2 exists to generate complete, high-quality professional curricula that can be run directly inside XcelerateAI.

V2 is a clean-slate system. V1 may be consulted for lessons and ideas, but no V1 schema, workflow, field, or assumption is authoritative.

The goal is not to make curriculum creation complicated. The goal is to make one curriculum-generation run produce something structurally sound, educationally coherent, and ready to pilot.

---

## 2. Learner Experience

The curriculum engine is not learner-facing.

Learners choose from curricula that have already been created and published.

The learner experience remains:

**Study → Skill Check → Build → Proof → Reflect → Complete**

The curriculum engine exists behind the scenes to create the content and structure that powers those stages.

---

## 3. Curriculum Creation Brief

A curriculum generation run begins with a short authoring brief created by the XcelerateAI team.

Required inputs:

- **Profession / target role**
- **Target learner**
- **Professional outcome**
- **Expected weekly study capacity**
- **Important constraints or preferences**
- **Special graduation goals, if any**

Example:

```text
Profession:
Python Agent Engineer

Target learner:
Programming beginner

Professional outcome:
Capable of independently building practical Python AI agents.

Study capacity:
20–25 hours per week

Constraints / preferences:
- Prefer free resources
- Practical-first learning
- Windows-friendly
- Local-first where appropriate
- Duration should emerge from required competence

Special graduation goals:
- Conversations
- Memory
- Tools
- Files
- Tasks
- APIs
- Controlled actions
- Scheduling
- Inspectability
```

The brief does **not** define the syllabus.

It does not need to specify:

- number of weeks
- number of months
- topic order
- projects
- resources
- assessments
- mission count

Those are responsibilities of the curriculum-generation process.

---

## 4. Generation Responsibility

From the creation brief, the engine must determine:

1. What the target professional actually needs to be capable of.
2. What competencies produce that capability.
3. Which competencies depend on others.
4. Which competencies the target learner must be taught.
5. What resources best teach those competencies.
6. How each competency becomes practical ability.
7. How learning should be sequenced.
8. How much time the complete path realistically requires.
9. What Skill Checks are necessary.
10. What practical work and projects prove ability.
11. What evidence is required.
12. Where reinforcement is necessary.
13. Whether the final curriculum plausibly produces the promised professional outcome.

Curriculum duration is **derived from competence and workload**, not imposed first.

---

## 5. Internal Generation Pipeline

A single curriculum-generation operation may contain multiple internal stages.

The intended flow is:

```text
Creation Brief
    ↓
Profession Blueprint
    ↓
Competency Map
    ↓
Resource Discovery
    ↓
Learning Experience Design
    ↓
Curriculum Design
    ↓
Curriculum Source
    ↓
Validation + Critique
    ↓
Repair
    ↓
Compilation
    ↓
Runtime Curriculum
    ↓
Final Validation
```

From the operator's perspective, this is still one curriculum-generation run.

The engine may iterate internally until all blocking validation failures are resolved.

---

## 6. Build Artifacts

A generation run should preserve enough intermediate information to explain and improve the curriculum later.

Recommended build package:

```text
curriculum-build/
├── profession.json
├── competencies.json
├── resources.json
├── learning-design.json
├── curriculum-source.json
├── coverage.json
├── curriculum.json
└── validation-report.json
```

### profession.json
Defines the professional capability target.

### competencies.json
Contains atomic competencies and their dependencies.

### resources.json
Contains researched and selected learning resources.

### learning-design.json
Defines how competencies become learner ability.

### curriculum-source.json
Contains the complete educational curriculum before runtime compilation.

### coverage.json
Shows how competencies are taught, practiced, applied, assessed, and reinforced.

### curriculum.json
The final runtime curriculum consumed by XcelerateAI.

### validation-report.json
Records structural and educational validation results.

---

## 7. Curriculum Source Principle

The Curriculum Source is the educational truth.

It should be designed for curriculum reasoning, not around React component implementation details.

The source should express concepts such as:

- curriculum identity
- professional outcome
- competencies
- learning sequence
- weeks
- study resources
- study requirements
- Skill Checks
- practical missions
- projects
- proof
- reflection
- reinforcement
- workload
- graduation capability

The application runtime format may be different.

A compiler transforms Curriculum Source into the exact runtime structure expected by XcelerateAI.

### Governing rule

**Educational design must not depend on frontend serialization details.**

---

## 8. Competency Model

The competency map should use stable identifiers.

Example:

```text
PY-FUNC-01
HTTP-REQ-01
AGENT-TOOLS-02
```

Competencies should be:

- specific
- observable
- teachable
- testable where appropriate
- dependency-aware

A competency should describe something the learner can understand, perform, diagnose, explain, or build.

Broad topic labels such as `Python`, `APIs`, or `Agents` are not sufficient as atomic competencies.

---

## 9. Learning Experience Design

The engine should not stop at finding resources.

For each important competency, it should decide how the learner turns information into ability.

The design lens is:

**UNDERSTAND → IMPLEMENT → BREAK → DEBUG → TEST → EXPLAIN → IMPROVE**

This is not a mandatory seven-step learner ritual.

The engine uses whichever elements are appropriate for the competency.

Guidance should depend primarily on familiarity:

- New knowledge receives appropriate teaching and support.
- Previously taught knowledge may require less scaffolding.
- Independent research should only be expected when the learner has the required foundation or when research itself is the competency.

---

## 10. Resource Principles

Resources are selected for competencies, not because a platform is famous.

The engine should:

1. Discover broadly.
2. Inspect the actual resource.
3. Confirm competency match.
4. Prefer the smallest sufficient set.
5. Distinguish Core from optional/reinforcement resources.
6. Record exact sections, timestamps, chapters, or stop points where useful.
7. Prefer free resources when quality remains high.
8. Avoid requiring paid resources unless explicitly allowed.
9. Avoid redundant resource overload.
10. Use official documentation when it is genuinely the best learning resource, not automatically.

A resource registry may guide discovery but must not become a closed whitelist.

---

## 11. Skill Check Standard

For the first V2 implementation:

- Skill Check mode is graded multiple choice.
- Exactly 10 questions.
- Exactly 4 options per question.
- Normal authored passing score: 70%.
- Passing score remains curriculum-configurable.
- Every newly authored question must include an explanation.
- Questions must assess material already taught.
- Required assessment knowledge cannot exist only in optional resources.
- Application, prediction, debugging, interpretation, and reasoning questions are preferred over trivia.
- Material changes to an assessment require a new stable assessment identity.

The runtime may support only one assessment type initially. Future assessment types can be added when there is a demonstrated learning need.

---

## 12. Build

Build is where the learner uses knowledge to produce working output.

A build should:

- require competencies already introduced or intentionally being integrated
- have a clear objective
- define what success means
- avoid hidden prerequisites
- include enough support for genuinely new concepts
- reduce scaffolding when the learner is reusing familiar skills
- encourage debugging and testing where appropriate
- connect to realistic professional work

Builds should not exist merely to make the curriculum look practical.

They must materially develop capability.

---

## 13. Proof

Proof exists to present sufficient evidence that the learner completed or demonstrated the intended work.

**Build = produce the work.**

**Proof = present evidence of the work.**

Proof must not duplicate evidence unnecessarily.

The first V2 evidence vocabulary should remain deliberately small:

- `link`
- `text`
- `confirmation`

More evidence types should be added only when a real curriculum requires them.

Example:

```json
{
  "required": true,
  "prompt": "Show that your API client works.",
  "evidence": [
    {
      "id": "repository",
      "type": "link",
      "label": "Repository"
    },
    {
      "id": "inspection-note",
      "type": "text",
      "label": "What should be inspected?"
    }
  ]
}
```

Proof must be profession-neutral. GitHub must not be hard-coded as a universal requirement.

---

## 14. Reflection

Reflection should help the learner consolidate understanding, identify mistakes, or articulate decisions.

Reflection is not paperwork.

Prompts should be specific to the week's learning when possible.

---

## 15. Coverage

The engine must track curriculum coverage.

Conceptually:

| Competency | Taught | Practiced | Applied/Built | Assessed | Reinforced |
|---|---|---|---|---|---|
| Example A | Yes | Yes | Yes | Yes | Yes |
| Example B | Yes | Yes | Yes | No | Yes |

Not every competency must be assessed in exactly the same way, but unexplained gaps are not acceptable.

The generator must be able to justify why a competency is or is not assessed, built, or reinforced.

Critical professional competencies should receive stronger coverage than minor supporting knowledge.

---

## 16. Validation Philosophy

A curriculum is not production-ready merely because its JSON is valid.

Validation must cover both structure and educational coherence.

### Structural validation

Examples:

- unique stable IDs
- valid references
- no missing required fields
- valid Skill Checks
- valid proof requirements
- valid resource references
- valid week ordering
- no impossible gates
- no malformed projects

### Dependency validation

- no competency appears before required prerequisites
- builds do not require untaught knowledge
- projects do not depend on future competencies

### Resource validation

- Core resources exist and are accessible at generation time
- Core resources teach the intended competency
- Core minimums are achievable
- obvious redundancy is rejected
- exact sections are provided when needed

### Assessment validation

- no untaught knowledge
- no optional-only required knowledge
- no invalid answer keys
- no duplicate question IDs
- no obvious trivia-only assessment
- explanations included

### Workload validation

- weekly workload should be credible
- curriculum duration should match total required work
- no week should become overloaded merely to satisfy an arbitrary duration

### Capability validation

The finished curriculum must plausibly develop the professional capability promised in the creation brief.

---

## 17. Adversarial Review

The same generation system may perform multiple internal review roles:

- Curriculum Critic
- Dependency Auditor
- Resource Auditor
- Assessment Auditor
- Workload Auditor
- Professional Capability Auditor
- Structural Validator

These are review passes, not separate learner-facing systems.

When a blocking issue is discovered:

```text
FAIL
  ↓
Repair
  ↓
Revalidate
```

The curriculum may ship only when blocking failures reach zero.

---

## 18. Production-Ready Standard

A curriculum is ready for pilot only when:

- the professional outcome is explicitly defined
- required capabilities are represented
- competencies are dependency-correct
- Core resources are justified and verified
- learning activities correspond to competencies
- assessments test taught material
- builds use taught competencies
- proof requirements are meaningful
- workload is plausible
- stable identities are valid
- all references resolve
- structural validation passes
- educational validation passes
- there are zero known blocking failures

Pilot testing is for discovering real learner experience issues, not obvious generation mistakes.

---

## 19. First Curriculum

The first production curriculum generated with V2 will be:

**Python Agent Engineering**

Target learner:

**Programming beginner**

Expected study capacity:

**20–25 hours per week**

The curriculum should culminate in the learner being capable of building a practical local-first Python agent with, where professionally appropriate:

- conversations
- memory
- tools
- files
- tasks
- APIs
- controlled actions
- scheduling
- inspectability

The exact curriculum duration must be derived from the professional competency scope and realistic workload.

---

## 20. Phase 1 Boundary

This document establishes the foundation.

It does **not** yet authorize implementation of:

- the compiler
- runtime schema
- generation scripts
- validators
- app integration
- the Python Agent Engineering curriculum itself

The next design task is to define the **Curriculum Source contract** clearly enough that Codex can implement it without inventing educational architecture.

The guiding principle for all subsequent work is:

> **Keep the learner experience simple while making curriculum generation rigorous.**
