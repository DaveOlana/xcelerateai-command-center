# XcelerateAI Curriculum Engine V2 — Curriculum Source Specification

## 1. Purpose

`curriculum-source.json` is the canonical educational source for one XcelerateAI curriculum.

It is not the application runtime format. It exists so curriculum generation can describe the learning experience clearly without being coupled to React components, localStorage keys, route structure, or historical V1 JSON fields.

The compiler will later transform this source into the runtime curriculum consumed by XcelerateAI.

> **Generation artifacts may explain the curriculum, but only `curriculum-source.json` is compiled.**

Files such as `profession.json`, `competencies.json`, `resources.json`, and `learning-design.json` are supporting generation artifacts. Once the source is finalized, the compiler must not need them to build the runtime curriculum.

---

## 2. Design Goals

The Curriculum Source must be:

- educationally readable
- strict enough to validate
- stable across curriculum revisions
- profession-neutral
- suitable for AI generation
- suitable for deterministic compilation
- expressive enough for the learner journey
- small enough that authors do not fight the schema

The learner journey remains:

**Study → Skill Check → Build → Proof → Reflect → Complete**

---

## 3. Top-Level Structure

```text
curriculum-source.json
├── schemaVersion
├── curriculumId
├── revision
├── title
├── shortTitle
├── target
├── workload
├── assumptions
├── phases[]
├── competencies[]
├── resources[]
├── weeks[]
├── projects[]
└── graduation
```

There are no legacy aliases.

There are no `months`. Months are calendar units, not educational structure. If the interface later wants month-like grouping, it can derive presentation groupings from ordered weeks.

`phases` remain because they represent meaningful educational progression.

---

## 4. Identity Rules

Every authored entity that may be referenced or hold learner progress receives a stable ID.

Recommended prefixes:

```text
Curriculum        PYAE
Phase             PYAE-PH01
Competency        PYAE-C001
Resource          PYAE-R001
Week              PYAE-W01
Skill Check       PYAE-SC-W01
Question          PYAE-Q-W01-01
Build             PYAE-B-W01-01
Proof             PYAE-PR-W01
Reflection        PYAE-RF-W01-01
Project           PYAE-PJ01
Project Milestone PYAE-PJ01-M01
Template          PYAE-T001
```

Rules:

1. IDs must be unique within the curriculum.
2. IDs must not be derived from display text at runtime.
3. Renaming a title does not create a new ID.
4. Reordering weeks does not require changing unchanged week IDs.
5. Replacing an entity with a materially different educational entity requires a new ID.
6. A materially changed Skill Check requires a new Skill Check ID.
7. Timestamps, titles, revision numbers, and array positions are never curriculum identity.

`curriculumId` is the canonical curriculum namespace.

`revision` describes a version of that curriculum, not a new curriculum identity.

---

## 5. Curriculum Metadata

```json
{
  "schemaVersion": "2.0",
  "curriculumId": "PYAE",
  "revision": 1,
  "title": "Python Agent Engineering",
  "shortTitle": "Python Agent Engineering"
}
```

`schemaVersion` identifies the Curriculum Source specification.

`curriculumId` is the stable curriculum identity.

`revision` is a positive integer incremented when the curriculum is intentionally revised.

Revision changes must not automatically invalidate progress for unchanged stable IDs.

---

## 6. Target

```json
{
  "target": {
    "role": "Python Agent Engineer",
    "learner": "Programming beginner",
    "professionalOutcome": "Independently design, build, test and operate practical Python AI agents.",
    "specialGoals": [
      "conversations",
      "memory",
      "tools",
      "files",
      "tasks",
      "APIs",
      "controlled actions",
      "scheduling",
      "inspectability"
    ]
  }
}
```

This section records who the curriculum is for and what it promises.

It must not contain syllabus decisions or arbitrary duration constraints.

---

## 7. Workload

```json
{
  "workload": {
    "weeklyHours": {
      "min": 20,
      "max": 25
    },
    "estimatedTotalHours": 640,
    "estimatedWeeks": 28
  }
}
```

`estimatedTotalHours` and `estimatedWeeks` are derived during curriculum generation.

They must be credible results of the designed workload, not targets used to force content into an arbitrary duration.

---

## 8. Assumptions

Important assumptions are explicit.

```json
{
  "assumptions": [
    "The learner can use a Windows laptop.",
    "No Python knowledge is assumed.",
    "No command-line knowledge is assumed.",
    "No prior AI-agent knowledge is assumed."
  ]
}
```

---

## 9. Phases

```json
{
  "phases": [
    {
      "id": "PYAE-PH01",
      "title": "Programming Foundations",
      "outcome": "Develop the Python and problem-solving foundations needed for agent engineering."
    },
    {
      "id": "PYAE-PH02",
      "title": "Applied Agent Systems",
      "outcome": "Use Python to build reliable tool-using agent systems."
    }
  ]
}
```

A phase does not own learner progress separately.

Weeks reference the phase they belong to.

---

## 10. Competencies

A competency is an atomic professional ability.

```json
{
  "id": "PYAE-C014",
  "name": "Handle HTTP failure responses",
  "description": "Recognize unsuccessful HTTP responses and implement appropriate handling instead of assuming every request succeeds.",
  "domain": "HTTP and APIs",
  "importance": "core",
  "prerequisiteIds": [
    "PYAE-C011",
    "PYAE-C012"
  ]
}
```

Required fields:

- `id`
- `name`
- `description`
- `domain`
- `importance`
- `prerequisiteIds`

`importance` is either:

```text
core
supporting
```

A competency must be specific, observable, teachable, dependency-aware, and usable in learning design.

Avoid topic-only entries such as `Python`, `APIs`, `Functions`, or `Agents`.

Dependencies must form an acyclic graph.

---

## 11. Resources

Resources live in one curriculum-wide library and are referenced by ID from weeks.

```json
{
  "id": "PYAE-R021",
  "title": "HTTP Requests in Python",
  "url": "https://example.com/resource",
  "provider": "Example Provider",
  "format": "video",
  "cost": "free",
  "estimatedMinutes": 42,
  "location": {
    "start": "12:40",
    "stop": "29:10",
    "note": "Stop before the framework-specific deployment section."
  },
  "competencyIds": [
    "PYAE-C011",
    "PYAE-C014"
  ],
  "whySelected": "Explains request construction and failure handling clearly with practical Python examples."
}
```

Initial `format` values:

```text
video
article
documentation
course
lab
exercise
book
repository
other
```

Initial `cost` values:

```text
free
paid
mixed
```

Resource rules:

1. Every resource has a stable ID.
2. Every selected resource supports at least one curriculum competency.
3. Core resources must be verified during generation.
4. `location` may use timestamps, sections, chapters, exercises, or natural-language boundaries.
5. The smallest sufficient Core set is preferred over resource quantity.
6. Resource quality matters more than source prestige.

---

## 12. Weeks

Weeks are the primary progression units.

```json
{
  "id": "PYAE-W04",
  "sequence": 4,
  "phaseId": "PYAE-PH01",
  "title": "Working with APIs",
  "outcome": "Call external APIs, interpret their responses, and handle common failures.",
  "competencyIds": [
    "PYAE-C011",
    "PYAE-C012",
    "PYAE-C014"
  ],
  "estimatedHours": 22,
  "study": {},
  "skillCheck": {},
  "builds": [],
  "proof": {},
  "reflection": {}
}
```

Required fields:

- `id`
- `sequence`
- `phaseId`
- `title`
- `outcome`
- `competencyIds`
- `estimatedHours`
- `study`
- `skillCheck`
- `builds`
- `proof`
- `reflection`

`sequence` is ordering, not identity.

Each week should represent a coherent learning unit, not simply an arbitrary seven-day slice.

---

## 13. Study

```json
{
  "study": {
    "objective": "Understand HTTP requests, JSON responses, and common failure conditions.",
    "coreMinimum": 2,
    "resources": [
      {
        "resourceId": "PYAE-R021",
        "role": "core",
        "competencyIds": [
          "PYAE-C011",
          "PYAE-C014"
        ],
        "purpose": "Primary explanation and worked examples."
      },
      {
        "resourceId": "PYAE-R022",
        "role": "core",
        "competencyIds": [
          "PYAE-C012"
        ],
        "purpose": "Practice reading JSON response structures."
      },
      {
        "resourceId": "PYAE-R023",
        "role": "optional",
        "competencyIds": [
          "PYAE-C014"
        ],
        "purpose": "Additional explanation if error handling is still unclear."
      }
    ]
  }
}
```

`role` is:

```text
core
optional
```

Rules:

1. `coreMinimum` must be a non-negative integer.
2. `coreMinimum` cannot exceed the number of Core resources.
3. Required assessment knowledge cannot depend only on Optional resources.
4. A resource assignment declares which week competencies it supports.
5. Optional resources exist for reinforcement, alternative explanation, or reference.

---

## 14. Skill Check

The first V2 Skill Check contract is deliberately narrow.

```json
{
  "skillCheck": {
    "id": "PYAE-SC-W04",
    "title": "API Fundamentals Check",
    "instructions": "Answer all questions based on what you studied and practiced this week.",
    "passingScore": 70,
    "competencyIds": [
      "PYAE-C011",
      "PYAE-C012",
      "PYAE-C014"
    ],
    "questions": []
  }
}
```

Canonical question:

```json
{
  "id": "PYAE-Q-W04-01",
  "competencyIds": [
    "PYAE-C014"
  ],
  "prompt": "A request returns HTTP 404. What is the best interpretation?",
  "options": [
    {
      "id": "a",
      "label": "The requested resource was not found."
    },
    {
      "id": "b",
      "label": "The request definitely succeeded."
    },
    {
      "id": "c",
      "label": "Python failed to parse the source file."
    },
    {
      "id": "d",
      "label": "The network always disconnected."
    }
  ],
  "correctOptionId": "a",
  "explanation": "HTTP 404 indicates that the server could not find the requested resource."
}
```

Rules:

1. Exactly 10 questions.
2. Exactly 4 options per question.
3. One correct option.
4. Every question has a stable ID.
5. Every option has an ID unique within that question.
6. Every question maps to at least one week competency.
7. Every question includes an explanation.
8. Skill Checks cannot assess competencies that have not been taught.
9. Required knowledge cannot exist only in Optional resources.
10. Application, interpretation, prediction, debugging, and reasoning are preferred over trivia.
11. `passingScore` is configurable from 1–100; normal authoring default is 70.
12. Material changes to assessment intent, answers, question set, or scoring require a new Skill Check ID.

---

## 15. Builds

A week may contain one or more builds.

```json
{
  "builds": [
    {
      "id": "PYAE-B-W04-01",
      "title": "Resilient API Client",
      "required": true,
      "outcome": "Build a Python program that calls an API and handles both successful and unsuccessful responses.",
      "competencyIds": [
        "PYAE-C011",
        "PYAE-C012",
        "PYAE-C014"
      ],
      "estimatedMinutes": 240,
      "brief": "Create a small command-line program that fetches data from an API and responds clearly to success, not-found, and server-error cases.",
      "steps": [
        {
          "id": "PYAE-B-W04-01-S01",
          "text": "Make a successful request and inspect the response."
        },
        {
          "id": "PYAE-B-W04-01-S02",
          "text": "Handle at least two unsuccessful response cases."
        }
      ],
      "acceptanceCriteria": [
        {
          "id": "PYAE-B-W04-01-A01",
          "text": "The program does not treat every response as successful."
        },
        {
          "id": "PYAE-B-W04-01-A02",
          "text": "The learner can explain how the program distinguishes success from failure."
        }
      ],
      "hints": [],
      "templates": [],
      "stretch": null
    }
  ]
}
```

Build rules:

1. Required builds block weekly progression.
2. Optional builds do not block progression and may appear as Side Quests.
3. Every build maps to competencies.
4. Builds may integrate previously taught competencies.
5. A build must not rely on an untaught prerequisite.
6. Steps are guidance, not the definition of success.
7. `acceptanceCriteria` define success.
8. Build evidence is not collected inside Build.
9. Proof is the single evidence stage after Build.
10. Templates are scaffolding, not learner progress.

Template shape:

```json
{
  "id": "PYAE-T007",
  "label": "Starter README",
  "content": "# Project\n\n..."
}
```

---

## 16. Proof

Proof is the single weekly evidence stage.

The source does not create separate practical-mission proof systems.

```json
{
  "proof": {
    "id": "PYAE-PR-W04",
    "prompt": "Provide enough evidence to show that your API client works and that you understand its failure handling.",
    "evidence": [
      {
        "id": "PYAE-PR-W04-E01",
        "type": "link",
        "label": "Project or repository link",
        "required": true
      },
      {
        "id": "PYAE-PR-W04-E02",
        "type": "text",
        "label": "What should be inspected?",
        "required": true
      },
      {
        "id": "PYAE-PR-W04-E03",
        "type": "confirmation",
        "label": "I tested both success and failure cases.",
        "required": true
      }
    ]
  }
}
```

Initial evidence types:

```text
link
text
confirmation
```

Rules:

1. Proof requirements are authored by the curriculum.
2. GitHub is never a universal hard-coded requirement.
3. Proof collects the minimum sufficient evidence.
4. Proof must not ask the learner to re-enter evidence already collected elsewhere.
5. Builds create work; Proof presents evidence.
6. Every required evidence item must be completed before weekly completion can continue.
7. Evidence item IDs are stable learner-state identities.

---

## 17. Reflection

```json
{
  "reflection": {
    "minimumResponses": 1,
    "prompts": [
      {
        "id": "PYAE-RF-W04-01",
        "prompt": "What failure did you deliberately create, and how did you diagnose it?"
      },
      {
        "id": "PYAE-RF-W04-02",
        "prompt": "What would you change in your API client before using it inside an agent?"
      }
    ]
  }
}
```

Rules:

1. Every prompt has a stable ID.
2. Prompts should relate to actual learning or work from the week.
3. `minimumResponses` cannot exceed the number of prompts.
4. At least one meaningful reflection response is normally required.
5. Reflection should not compensate for weak assessment or weak builds.

---

## 18. Complete

There is no authored `unlockCriteria` object.

Weekly completion is derived from the fixed learner journey:

```text
Study requirement satisfied
        ↓
Skill Check passed
        ↓
All required Builds completed
        ↓
All required Proof evidence completed
        ↓
Reflection minimum satisfied
        ↓
Complete
```

The source controls requirements by declaring:

- Core Study requirements
- passing score
- required Builds
- required Proof evidence
- minimum Reflection responses

There is one completion model.

---

## 19. Projects

Projects are meaningful long-running bodies of work composed from actual weekly Builds.

Project progress should not be maintained separately from the work that creates it.

```json
{
  "projects": [
    {
      "id": "PYAE-PJ01",
      "title": "Personal Agent V1",
      "outcome": "Build a local-first Python agent that can hold conversations and perform controlled actions through tools.",
      "competencyIds": [
        "PYAE-C101",
        "PYAE-C112",
        "PYAE-C130"
      ],
      "milestones": [
        {
          "id": "PYAE-PJ01-M01",
          "title": "Conversation Loop",
          "weekId": "PYAE-W12",
          "buildId": "PYAE-B-W12-01"
        },
        {
          "id": "PYAE-PJ01-M02",
          "title": "Tool Execution",
          "weekId": "PYAE-W16",
          "buildId": "PYAE-B-W16-01"
        }
      ]
    }
  ]
}
```

Rules:

1. Every milestone references one actual weekly Build.
2. Milestone completion is derived from referenced Build completion.
3. The project system does not maintain duplicate completion state.
4. Reordering project arrays does not affect progress.
5. Project competency coverage is explicit.
6. A project may span phases.

---

## 20. Graduation

```json
{
  "graduation": {
    "outcome": "Independently design, build, test and operate practical Python AI agents.",
    "requiredCompetencyIds": [
      "PYAE-C001",
      "PYAE-C002"
    ],
    "requiredProjectIds": [
      "PYAE-PJ01"
    ]
  }
}
```

In the real curriculum, `requiredCompetencyIds` should include the complete set of competencies mandatory for the promised professional outcome.

Graduation must not depend on a separate self-confidence checkpoint system.

---

## 21. Progress and Skills

V2 should not author free-floating checkpoint strings merely to populate Progress.

Skill progress should be derived from stable curriculum competencies and learner completion evidence.

Conceptually, the application may determine that a competency has been:

- introduced
- practiced
- assessed
- applied
- reinforced

from the curriculum coverage graph and learner progress.

This avoids maintaining a second, disconnected skill taxonomy.

---

## 22. Coverage Is Derived

`coverage.json` is generated from Curriculum Source. It is not manually authored.

For every competency, the generator/validator should be able to identify:

```text
Where is it taught?
Where is it practiced?
Where is it assessed?
Where is it applied?
Where is it reinforced?
```

A missing category is not automatically a failure in every case. The validator evaluates the gap based on competency importance and learning intent.

Core professional competencies require strong coverage.

---

## 23. Curriculum Source Invariants

The strict V2 validator must eventually enforce at least these invariants.

### Identity
- `curriculumId` exists
- all entity IDs are non-empty
- IDs are unique
- all references resolve

### Structure
- phase references resolve
- week sequences are unique and ordered
- every week belongs to a phase
- every week contains all learner stages
- every project milestone resolves to an existing week and build

### Competencies
- dependency graph contains no cycles
- every week competency exists
- every assessment competency exists
- every build competency exists
- every resource competency exists
- graduation competencies exist

### Study
- all resource references exist
- Core minimum is achievable
- Skill Check required knowledge is not Optional-only

### Skill Check
- exactly 10 questions
- exactly 4 options each
- valid answer IDs
- explanation present
- question competency mapping present
- assessed competencies have already been taught

### Build
- required builds are identifiable
- acceptance criteria exist
- build competencies have been introduced in time
- project milestone build references are valid

### Proof
- evidence types are supported
- evidence IDs are unique
- at least one required evidence item exists
- required fields are coherent

### Reflection
- prompt IDs are unique
- minimum response count is valid

### Workload
- weekly estimates are positive and plausible
- total estimated workload reconciles with week estimates
- estimated duration is consistent with weekly study capacity

### Graduation
- required competencies exist
- required projects exist
- required professional capabilities receive sufficient curriculum coverage

---

## 24. What Is Intentionally Not In V2 Source

The first V2 Curriculum Source deliberately excludes:

- legacy aliases
- `months`
- arbitrary `unlockCriteria`
- Boss Mission objects
- separate mission-proof state
- self-confidence checkpoint strings
- weighted mastery scores
- array-index progress identities
- title-keyed learner state
- hard-coded GitHub evidence
- adaptive AI tutoring rules
- multi-select quizzes
- timed quizzes
- partial-credit grading
- hidden curriculum defaults that silently repair invalid authoring

These may be reconsidered later only if actual learning needs justify them.

---

## 25. Compiler Boundary

The future compiler receives only a valid `curriculum-source.json`.

Its responsibilities are mechanical:

```text
Valid Curriculum Source
        ↓
Transform fields
        ↓
Generate runtime structures
        ↓
Emit runtime curriculum
```

The compiler must not:

- invent missing competencies
- choose resources
- rewrite educational sequencing
- generate quiz questions
- decide proof requirements
- infer hidden prerequisites
- silently repair invalid source

If the source is invalid, compilation fails.

> **Generation makes educational decisions. Compilation makes structural transformations.**

---

## 26. Result

With this source contract, curriculum generation can reason about education in a clean representation while XcelerateAI remains free to evolve its runtime implementation.

The next Phase 1 design task is:

> **Define the generation pipeline that creates this source reliably in one end-to-end curriculum generation run.**

---

## 27. Learning Presentation Authoring Contract

A Curriculum Source may include a root `concepts` registry. Each concept has a stable `id`, professional `term`, concise `simpleMeaning`, small `example`, and practical `commonMistake`. Builds reference concepts through `conceptRefs`, where `relevance` explains why that concept matters in the specific Build.

Every production Study assignment authors `learningRole` as `learn`, `practice`, or `reference`. This value describes how the curriculum uses the resource and is independent of both resource format and the `core` / `optional` progress role.

Every required production Build authors `learnerGuide` containing:

- `summary`;
- `whyItMatters`;
- `priorKnowledgeCompetencyIds`;
- `finishedResult`;
- `conceptRefs`;
- `sessions`.

Prior-knowledge references must name competencies legitimately available before the Build begins. Sessions are authored planning groups whose step IDs cover the professional Build exactly once and whose total estimate remains within the governed tolerance. They are not completion state.

The separate `content-integrity-audit.json` file is deliberately outside Curriculum Source. It records research and semantic-review evidence, is never compiled into runtime curriculum, and cannot become learner-facing or learner-state data.
