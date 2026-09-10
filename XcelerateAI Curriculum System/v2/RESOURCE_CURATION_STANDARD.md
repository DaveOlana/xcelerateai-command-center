# XcelerateAI Curriculum Engine V2 — Resource Curation Standard

## 1. Purpose

This document defines how XcelerateAI researches, evaluates, selects, arranges, verifies, and records learning resources for a curriculum.

Resource curation is a first-class part of curriculum generation.

It is not:

```text
search for good tutorials
→ choose familiar websites
→ paste links into weeks
```

It is:

```text
Competency need
      ↓
Resource need
      ↓
Candidate discovery
      ↓
Inspection
      ↓
Evaluation
      ↓
Selection
      ↓
Section curation
      ↓
Learning-role assignment
      ↓
Week placement
      ↓
Verification
      ↓
Audit
```

### Governing rule

> **Resources are selected for competencies and learning needs, not because a platform is famous.**

---

# 2. Position in the Generation Pipeline

Resource curation occurs after the Competency Map and before final Learning Experience Design.

```text
Profession Blueprint
      ↓
Competency Map
      ↓
RESOURCE CURATION
      ↓
Learning Experience Design
      ↓
Curriculum Architecture
      ↓
Curriculum Source
```

Resource curation depends on knowing:

- the target learner
- the professional outcome
- the competency graph
- prerequisite relationships
- hard constraints
- resource preferences

It should not begin from a prewritten syllabus.

---

# 3. Inputs

The Resource Curator receives:

```text
Creation Brief
profession.json
competencies.json
constraints
preferences
```

For each competency it should know:

- competency ID
- competency description
- importance
- prerequisites
- whether the learner is expected to encounter it as new knowledge or reinforcement
- any important environment or cost constraints

---

# 4. Outputs

The Resource Curator produces:

```text
resources.json
```

and enough evidence for later validation.

Recommended research record for each selected resource:

```json
{
  "id": "PYAE-R021",
  "title": "Example Resource",
  "url": "https://example.com",
  "provider": "Example Provider",
  "format": "video",
  "cost": "free",
  "accessStatus": "verified",
  "checkedAt": "ISO-8601 timestamp",
  "estimatedMinutes": 42,
  "competencyIds": [
    "PYAE-C011",
    "PYAE-C014"
  ],
  "location": {
    "start": "12:40",
    "stop": "29:10",
    "note": "Stop before the deployment section."
  },
  "purpose": [
    "primary explanation",
    "worked example"
  ],
  "whySelected": "Clear beginner-level explanation with practical Python examples.",
  "alternativesConsidered": [
    {
      "title": "Alternative Resource",
      "url": "https://example.org",
      "reasonNotSelected": "Assumes async programming before it is taught."
    }
  ]
}
```

Not every research field must appear in learner runtime.

The research artifact exists so selection can be defended and later improved.

---

# 5. Resource Need Before Resource Search

The curator must first determine what kind of learning support a competency needs.

For each competency or tightly related competency cluster, identify the resource need.

Possible needs include:

```text
first explanation
visual explanation
worked example
guided practice
reference
debugging example
code-reading example
exercise
lab
reinforcement
deep dive
professional example
```

This prevents the system from searching generically for:

```text
"best Python tutorial"
```

when the actual need is:

```text
"beginner explanation of Python exceptions with a small example
showing why catching Exception broadly is usually a bad idea"
```

---

# 6. Competency Clustering

The curator may group competencies for research when one resource genuinely teaches them together.

Example:

```text
HTTP request
HTTP response
HTTP status
JSON response parsing
```

may be researched as one coherent cluster.

Do not force unrelated competencies into one resource just to reduce count.

### Good clustering

Competencies naturally taught together.

### Bad clustering

Grouping by broad topic label only.

Example:

```text
"Everything about APIs"
```

is usually too broad.

---

# 7. Discovery Strategy

Discovery should be broad and quality-driven.

Possible source families:

- official documentation
- official tutorials
- structured courses
- university course material
- technical articles
- videos
- interactive exercises
- labs
- repositories
- examples from real projects
- books
- reference material
- practice platforms

A Resource Source Registry may exist as a discovery aid.

It is never a whitelist.

The curator may search outside the registry whenever a better resource exists.

---

# 8. Source Registry

A future registry may include strong starting points such as:

```text
freeCodeCamp
CS50
Microsoft Learn
MDN
GitHub Skills
Exercism
Khan Academy
MIT OpenCourseWare
DeepLearning.AI
Coursera
edX
YouTube
official Python documentation
official framework documentation
high-quality GitHub repositories
```

The registry should record source tendencies, not absolute rankings.

Example:

```text
Official documentation
Strength:
precise reference

Weakness:
may be poor as first explanation for beginners
```

Example:

```text
Exercism
Strength:
practice and feedback

Weakness:
not necessarily sufficient as primary conceptual instruction
```

The exact resource must still be evaluated.

---

# 9. Candidate Discovery

For each resource need, the curator should find multiple plausible candidates when practical.

The purpose is comparison.

A candidate should not be selected merely because:

- it ranked first in search
- the provider is famous
- another course uses it
- the title appears perfect
- the creator has many subscribers

Search result metadata is discovery evidence, not selection evidence.

---

# 10. Candidate Inspection

The curator must inspect the actual candidate sufficiently to judge the relevant section.

Inspection should determine:

- what it actually teaches
- assumed prerequisites
- learner level
- practical examples
- teaching clarity
- whether the relevant content is current
- where the useful section begins
- where it stops being useful
- whether required information is hidden behind payment or login
- whether the resource is needlessly long
- whether code or tooling shown is obsolete

### Governing rule

> **Do not select from the title. Select from inspected content.**

---

# 11. Candidate Evaluation Rubric

The curator should evaluate exact resources, not provider reputation.

Recommended internal scoring dimensions:

```text
Correctness                 30
Exact competency match      25
Clarity for target learner  20
Practical usefulness        10
Current relevance           10
Accessibility                5
                           ----
Total                      100
```

This score is internal guidance.

It is not a learner-facing rating.

A high numerical score does not automatically override an obvious educational mismatch.

---

# 12. Correctness

A resource must not be Core if it teaches materially incorrect or misleading information.

For fast-changing subjects, correctness includes current behavior.

Examples:

- outdated API usage
- deprecated libraries presented as current best practice
- obsolete framework architecture
- old model/tool interfaces represented as current
- insecure professional patterns

Historical material may still be useful when explicitly presented as historical context.

---

# 13. Exact Competency Match

A resource should teach what the competency actually requires.

Example competency:

```text
Handle unsuccessful HTTP responses safely.
```

Weak match:

```text
A 3-hour overview of web development that mentions status codes once.
```

Strong match:

```text
A focused section explaining HTTP status handling with Python request examples.
```

The Resource Curator should prefer focused sufficiency over impressive breadth.

---

# 14. Clarity for Target Learner

Resource quality is relative to the learner.

A technically excellent document may be a poor first explanation for a complete beginner.

The curator should consider:

- terminology load
- assumed prerequisites
- explanation sequence
- example quality
- pace
- abstraction level

The same resource can be:

```text
Optional reference in Week 3
```

and later:

```text
Core professional documentation in Week 15
```

because learner familiarity has changed.

---

# 15. Practical Usefulness

Resources should help the learner do something with the knowledge.

Strong practical usefulness may include:

- executable examples
- guided exercises
- debugging examples
- realistic scenarios
- useful diagrams
- code to inspect
- tasks that require prediction or modification

This does not mean every resource must be a tutorial.

Reference material may still be Core when documentation literacy itself is being developed.

---

# 16. Current Relevance

For contemporary technical curricula, the curator must consider freshness.

A resource may remain valid for foundational material even if old.

Age alone is not a failure.

The question is:

> **Does the learner need current behavior here?**

Examples requiring current verification:

- LLM APIs
- agent frameworks
- model tool interfaces
- authentication flows
- deployment services
- package/tooling behavior

Examples often less sensitive to age:

- loops
- functions
- basic algorithmic reasoning
- HTTP fundamentals

---

# 17. Accessibility

The curator must verify that Core material is realistically accessible.

Check where relevant:

- public access
- free vs paid
- account requirement
- geographical restriction
- broken links
- removed videos
- paywalled chapters
- unusually high data burden

If the Creation Brief says:

```text
No paid resource required for progression
```

then a paid-only Core resource is a Blocker.

---

# 18. Exact Section Curation

The curator should not assign entire resources when only a portion is needed.

Possible boundaries:

```text
video timestamps
chapter numbers
heading names
lesson numbers
exercise ranges
documentation sections
repository files
specific examples
explicit stop instructions
```

Example:

```text
Start:
18:22 — Handling Exceptions

Stop:
37:10 — Before Async Requests
```

or:

```text
Read:
"Making a Request"
through
"Response Status Codes"

Skip:
Authentication section for now
```

### Governing rule

> **Assign the smallest coherent section that satisfies the learning need.**

---

# 19. Core vs Optional

The final learner-facing assignment uses:

```text
Core
Optional
```

## Core

Core means the resource is part of the required teaching path.

Use Core when:

- the learner needs it to understand required competencies
- Skill Check knowledge depends on it
- Build success reasonably depends on it
- it provides necessary practice or explanation

## Optional

Optional means useful but not required for progression.

Use Optional for:

- alternative explanation
- reinforcement
- deeper reference
- extra practice
- stretch learning
- professional reference that is not yet required

### Important rule

Optional resources cannot carry knowledge required to pass the Skill Check.

---

# 20. Core Minimum

A week may include several Core resources but require only a minimum subset when they provide equivalent pathways.

Example:

```text
Core A — video explanation
Core B — article explanation
Core C — interactive practice

coreMinimum: 2
```

This should only be used when the learning requirement genuinely allows choice.

Do not use `coreMinimum` to let learners skip complementary material that is required for competence.

Example:

```text
Core A teaches HTTP fundamentals
Core B teaches JSON parsing
```

If both are necessary, `coreMinimum` should not be 1.

---

# 21. Learning Role vs Progress Role

Resource role has two dimensions.

### Progress role

```text
Core
Optional
```

This affects learner progression.

### Educational purpose

Examples:

```text
primary explanation
worked example
guided practice
reference
debugging
reinforcement
deep dive
professional example
```

Educational purpose is authoring information.

It should guide resource ordering and Learning Experience Design.

It does not need to become a complex learner-facing taxonomy.

---

# 22. Resource Ordering Within Study

Resources should be ordered intentionally.

Typical sequence:

```text
Explanation
→ Example
→ Practice
→ Reference / Reinforcement
```

But this is not universal.

Possible alternatives:

```text
Prediction task
→ Explanation
→ Implementation
```

or:

```text
Real example
→ Concept explanation
→ Debugging exercise
```

Ordering should be selected according to the competency and learner familiarity.

---

# 23. Resource Arrangement Across Weeks

Resource placement follows the competency graph.

A resource should appear where it contributes to an actual learning need.

A resource may be reused later when:

- the learner needs reinforcement
- a later competency requires revisiting a section
- professional reference use is intentional

Repeated resource use should have a clear purpose.

Do not duplicate the same resource across weeks merely because it is generally useful.

---

# 24. Documentation Literacy

Documentation is not automatically Core and not automatically Optional.

The learner should gradually become capable of using professional documentation.

Early curriculum:

```text
docs may be supporting reference
```

Later curriculum:

```text
docs may become Core
```

when documentation reading itself becomes part of professional independence.

The transition should be deliberate.

---

# 25. Repository-Based Learning

GitHub repositories and real codebases are valid learning resources.

They may be used for:

- code reading
- architecture inspection
- test reading
- issue investigation
- README analysis
- configuration study
- comparison with learner implementations

A repository assignment must identify the relevant file, directory, commit, or inspection task when practical.

Do not simply say:

```text
Explore this repository.
```

unless open-ended repository research is itself the competency.

---

# 26. Video Curation

For video resources, record when useful:

- exact start timestamp
- exact stop timestamp
- playback-independent estimated learner time
- sections to skip
- expected learner activity

Learner time should account for:

```text
watching
pausing
coding along
testing
replaying
taking notes where useful
```

A 30-minute video section may represent 60–90 minutes of learner workload.

---

# 27. Course Curation

A structured course may be used selectively.

The curriculum is not obligated to assign the entire course.

Example:

```text
CS50 Week X:
assign lecture section A
assign problem set B
skip unrelated section C
```

The Resource Curator should treat courses as collections of potentially useful learning assets.

XcelerateAI owns the curriculum sequence.

The external course does not.

---

# 28. Practice Resources

Practice resources should be selected when they materially improve ability.

Examples:

- Exercism exercises
- coding challenges
- labs
- debugging tasks
- interactive environments

Practice should map to competencies.

Avoid generic challenge quotas such as:

```text
Do 20 LeetCode problems.
```

unless the competency genuinely requires that kind of practice.

---

# 29. Resource Redundancy

More resources do not automatically mean better teaching.

The curator should detect Core resources that repeat the same explanation without adding meaningful value.

Redundancy is justified when resources provide genuinely different benefits.

Example:

```text
Resource A:
clear explanation

Resource B:
hands-on exercise
```

Useful.

Example:

```text
Resource A:
beginner explanation

Resource B:
same beginner explanation in different words

Resource C:
same explanation again
```

Usually wasteful.

---

# 30. Alternatives

`resources.json` may record strong rejected alternatives.

This improves traceability and future regeneration.

Record:

- title
- URL
- reason not selected

Useful reasons include:

```text
too advanced
outdated
paywalled
too broad
weaker explanation
redundant
poor practice
assumes untaught prerequisite
```

Do not record every rejected search result.

Only record meaningful alternatives when useful.

---

# 31. Resource Replacement

If a selected resource later becomes unavailable or materially outdated:

```text
Resource failure
      ↓
Identify competency need
      ↓
Re-run discovery for that need
      ↓
Evaluate replacement
      ↓
Preserve curriculum competency structure
      ↓
Assign new resource ID if the educational resource changes
      ↓
Revalidate affected weeks
```

Do not regenerate an entire curriculum merely because one link changed.

---

# 32. Stable Resource Identity

A resource ID identifies the selected educational resource within one curriculum.

Changing only:

```text
display title
minor note
location clarification
```

does not necessarily require a new resource ID.

Replacing:

```text
one video with a different video
one article with a different article
one course section with a materially different resource
```

does require a new resource ID.

Learner progress must never be keyed only by resource title.

---

# 33. Search Efficiency

Resource curation must be thorough without becoming endless.

Recommended approach:

```text
1. Define exact need
2. Search strong likely sources
3. Build candidate set
4. Inspect strongest candidates
5. Stop when one or more resources clearly satisfy the need
6. Continue only if quality is inadequate or comparison remains uncertain
```

The goal is not:

```text
Find every resource on the internet.
```

The goal is:

```text
Find the best sufficient resource set with defensible evidence.
```

---

# 34. Resource Curation Failure Modes

The curator must guard against:

## Famous-source bias

Selecting a resource because the platform is respected.

## Search-snippet selection

Selecting without inspecting content.

## Resource dumping

Too many assigned materials.

## Entire-course outsourcing

Letting an external course become the real curriculum.

## Wrong learner level

Excellent resource, wrong learner.

## Hidden prerequisites

Resource assumes knowledge not yet taught.

## Stale technical material

Old behavior taught as current.

## Optional-only knowledge

Required assessment content exists only in Optional resources.

## Bad section boundaries

Assigned stop point excludes required knowledge.

## Passive overload

Too much watching/reading, too little doing.

## Duplicate Core resources

Several items provide essentially the same learning value.

## Fake precision

Invented timestamps or sections that were not verified.

---

# 35. Resource Auditor

After selection and placement, a Resource Auditor reviews the final assignments.

For every Core resource ask:

```text
Does it exist?
Can the learner access it?
Was the actual relevant content inspected?
Does it teach the mapped competency?
Is it suitable for this learner at this point?
Is the assigned section sufficient?
Is it unnecessarily long?
Does it violate cost/environment constraints?
Does the Skill Check depend on anything outside the assigned Core path?
Is there unnecessary Core duplication?
```

If a Core resource fails a critical question:

```text
BLOCKER
→ Resource Discovery repair
→ Revalidation
```

---

# 36. Relationship to Learning Experience Design

Resource curation answers:

> **What material can teach or reinforce this competency well?**

Learning Experience Design answers:

> **How should the learner use that material and what should they do with the knowledge afterward?**

Example:

```text
Resource Curator:
Select section on HTTP error handling.

Learning Experience Design:
1. Study explanation.
2. Predict outcomes for several status codes.
3. Make a request that intentionally fails.
4. Diagnose it.
5. Implement handling.
6. Test success and failure paths.
```

Do not collapse these responsibilities.

---

# 37. Relationship to Curriculum Source

The rich research artifact may contain information that does not need to appear in the final Curriculum Source.

`resources.json` may preserve:

```text
candidate scores
alternatives considered
date checked
access evidence
research notes
```

`curriculum-source.json` should carry only the information needed for the educational curriculum:

```text
resource ID
title
URL
provider
format
cost
estimated time
location
competency mapping
why selected
```

The exact final field set remains governed by `CURRICULUM_SOURCE_SPEC.md`.

---

# 38. Relationship to Validation

This standard works with:

```text
VALIDATION_STANDARD.md
```

especially:

```text
V005 Study Validation
V011 Coverage Validation
V012 Resource Quality Validation
V013 Dependency Order Validation
V014 Workload Validation
```

Resource selection is not considered complete until those validations pass.

---

# 39. First Production Resource Curation

The first full use of this system will be for:

**Python Agent Engineering**

The curator should begin from the new V2 competency graph.

It must not automatically reuse V1 resources.

V1 resources may be reconsidered as candidates.

They receive no special authority.

Every selected resource must earn inclusion under this standard.

---

# 40. Result

The intended output is not a giant resource list.

It is a deliberately curated learning path in which each resource has a reason to exist.

The learner should experience:

```text
the right resource
at the right time
for the right competency
at the right depth
followed by the right learning activity
```

### Final governing principle

> **Curate the smallest sufficient set of excellent resources, then make the learner do something meaningful with what they learned.**

---

# 41. Learning Content Integrity Amendments

For a new or foundational concept, candidate selection must evaluate in this order:

```text
best explanation for the target learner
→ best guided practice
→ best authoritative reference
```

Authority is a quality dimension, not a selection trump card. Official documentation is not Core merely because it is official, and a less formal source is not selected merely because it feels approachable. The selected set must combine correct teaching, useful action, and reliable consultation at the depth the learner needs now.

For every new or questionable learning need, the audit record must preserve evidence that multiple viable candidates were opened, inspected, and compared. A successful HTTP response or a search-result title is not pedagogical inspection.

Every production Study assignment must author one explicit learning role:

- `learn` — the primary explanation or demonstration;
- `practice` — active implementation, experimentation, modification, or debugging;
- `reference` — precise information for consultation or verification.

Learning role is independent of both format and the `core` / `optional` progress role.

Knowledge required by a Skill Check, required Build step, or acceptance criterion must not live only in Optional material. Every assignment must state what the learner should do and the observable point at which the assignment is complete. Exact headings, timestamps, exercises, examples, stop points, and intentional skips are preferred over “read this” or “review this page.”

Resource count, format, and provider distribution are not quotas. Provider concentration is an audit signal: reviewers must challenge whether discovery stopped too early, then retain the concentration when the evidence shows those resources are still the strongest coherent set.

A Core video must be freely accessible without making an account part of the learning gate, provide usable captions or transcript support, and identify the exact segment or activity assigned. If it cannot satisfy those conditions, select or pair a suitable text or guided-practice route.
