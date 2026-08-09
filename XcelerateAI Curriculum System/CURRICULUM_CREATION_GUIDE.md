# Curriculum Creation Guide

## Purpose

This guide is Stage 5–6 of the XcelerateAI Curriculum System. It transforms a Knowledge Map and a Resource Library into a complete, buildable curriculum JSON for the XcelerateAI Command Bootcamp Center.

The output is not a list of lessons. It is a designed educational journey that takes a beginner to professional competence through structured learning, practical application, reflection, and progressive mastery — delivered in a JSON the app can run without manual editing.

This guide was rewritten after prototype testing exposed three failure modes in its earlier version. Those fixes are baked in below and called out where they apply, so a future session cannot silently reintroduce them.

---

## Inputs

Required:

- KnowledgeMap.docx (Stage 2) — the atomic, dependency-ordered competency list. **Sequencing comes from here, not from Blueprint prose.**
- Resources.docx (Stage 3) — the tiered, per-competency resource library.

Reference:

- README.md
- KNOWLEDGE_MAP_GUIDE.md
- JSON_AUTHORING_STANDARD.md
- JSON_VALIDATION_GUIDE.md

---

## Output

Generate one curriculum JSON in the **production dialect** — the clean, non-lossy shape defined in JSON_AUTHORING_STANDARD.md (top-level `bootcamp`, `resourceLibrary`, `projects`, `checkpoints`, full narrative fields).

**Do NOT output a bare `roadmap-data.json` with no awareness of the progress dialect.** (Fix #1: the earlier guide did this, which reproduced the "importing resets progress" bug.) The production dialect is the authoring source; if this curriculum is replacing content for a learner who already has progress, it is then merged into the progress dialect per JSON_VALIDATION_GUIDE.md — never authored directly against the lossy export.

---

## How sequencing works (the core method)

Do not invent an order. **Walk the Knowledge Map's dependency graph.** A competency may enter the curriculum only after all its prerequisites have. This makes correct prerequisite ordering nearly automatic — if the map is right, the sequence is right.

Group the ordered competencies into weeks and months by natural clustering and available time, but never at the cost of the dependency order. One week may cover a small cluster of closely related competencies; it must not bundle unrelated ones just to fill time.

---

## Per-mission authoring rules (Fix #2 — the big one)

Every mission must be **authored**, not stamped. The earlier guide ended with "return only JSON, no explanations," which at 70+ missions forces mechanical templating — the exact cause of the prototype's blurred, indistinguishable missions. That instruction is removed. In its place, every mission must satisfy:

- **`conceptsUsed` is authored from what the mission actually builds** — taken from the Knowledge Map competency IDs the mission targets. It is NEVER derived by tokenizing the week title. Two missions in the same week must not carry identical concepts unless they genuinely target the identical competency.

- **Declared concepts match the build.** A mission's `conceptsUsed` / `skillFocus` must agree with what its `stepByStepInstructions` and `requiredFeatures` actually ask the learner to do. If the steps use no functions, "Functions" is not a concept of that mission.

- **Each mission carries a scope contract.** Include an `approachOutline` (what to do conceptually, without giving away exact ordering or thresholds where those are part of the lesson) and, where a mission's shape differs from the immediately preceding one, an explicit `scopeNote` saying so (e.g. "the previous mission used a single script; this one needs separate functions — do not carry the previous structure over"). This is what prevents a learner (or an assisting AI) from mis-scoping the task.

- **Each mission carries a copyable scope prompt** (`scopePromptTemplate`) bundling its in-scope concepts and an instruction to any assisting AI to stay within that scope. This travels with the learner to external tools.

---

## Curriculum philosophy

Learners must understand before memorizing, practice before progressing, build before claiming mastery, and reflect before moving on. No concept before its prerequisites. No stage skipped. Practical work dominates passive consumption.

---

## Curriculum structure

Months → Weeks → Practical Missions → Boss Missions. Every level has a clear educational purpose. Each practical mission targets one or a small number of Knowledge Map competencies and produces evidence (proof-of-work).

---

## Mission design

Every mission answers: what will the learner understand, why it matters, how it's used professionally, what they'll build, and how mastery is shown. Every mission has a measurable outcome tied to a competency.

---

## Boss missions

Boss Missions verify genuine competence: they combine several previously learned competencies, require independent thinking, produce a meaningful artifact, and simulate professional work. They should feel like real projects, never exams.

---

## Resource assignment

Assign resources per mission from Resources.docx by the competency the mission targets — using the tier structure already decided there (Primary / Backup / Backup-of-Backup). Do not re-select or re-rank; that decision was made in Stage 3. Present alternatives across formats so different learning styles coexist. Never overwhelm a mission with more than the per-concept cap allows.

---

## Educational Experience Engine

Provide educational support per mission, only where it genuinely helps, grouped by when the learner needs it:

- **Before building:** Mission Brief, Scenario, Learning Objectives, Expected Outcome, `approachOutline`, `scopeNote`
- **While building / stuck:** Resource Cards, Hints, Common Mistakes, Debug Checklist, Thinking Prompts, copyable help prompts
- **After building:** Reflection Prompts, Knowledge Check, Mission Review, Summary, Next Mission Preview

Never duplicate information across layers unnecessarily.

---

## Required deliverables

Complete roadmap structure; learning objectives; practical missions; boss missions; per-mission resource assignments; reflection and reinforcement; professional projects; mastery progression. Complete — no placeholders, no missing stages.

---

## Master Prompt

Using the supplied KnowledgeMap.docx and Resources.docx, design a complete professional curriculum for the XcelerateAI Command Bootcamp Center, output as one JSON file in the production dialect defined in JSON_AUTHORING_STANDARD.md.

Sequence the curriculum by walking the Knowledge Map's dependency graph: no competency appears before its prerequisites. Group competencies into weeks and months by natural clustering without breaking that order.

Author every mission individually. Derive each mission's `conceptsUsed` from the Knowledge Map competencies it actually targets — never by tokenizing the week title, and never identical across a week's missions unless they target the identical competency. Ensure each mission's declared concepts match what its steps actually build. Give each mission a scope contract (`approachOutline`, a `scopeNote` where its shape differs from the previous mission, and a copyable `scopePromptTemplate`).

Assign resources per mission from Resources.docx using the tiers already decided there. Integrate practical work, reflection, and reinforcement throughout. Include Boss Missions that verify genuine competence.

Produce a complete curriculum with no placeholders. You may include a short build summary alongside the JSON; do not suppress reasoning at the cost of authoring quality.

---

## Internal Validation Checklist

✓ Every Knowledge Map competency is covered by at least one mission.

✓ Every prerequisite appears before its dependents (sequence honors the graph).

✓ No mission's `conceptsUsed` was tokenized from a week title.

✓ No week has identical concepts across all missions (unless genuinely identical).

✓ Each mission's declared concepts match its actual build steps.

✓ Every mission has a scope contract (approachOutline; scopeNote where shape changes).

✓ Resources assigned per mission at the correct tier, within the per-concept cap.

✓ Boss Missions verify mastery, not memory.

✓ Output is in the production dialect; progress-merge (if any) deferred to Validation.

✓ No placeholder content.

---

## Common Failure Modes

Avoid:

- Sequencing by intuition instead of the dependency graph.
- **Tokenizing week titles into `conceptsUsed`** (the prototype's root cause of blurred missions).
- Declaring concepts a mission doesn't actually use.
- **Suppressing authoring reasoning to "return only JSON"** — this forces stamping. (Removed from this guide deliberately.)
- Outputting a bare roadmap with no regard for the progress dialect.
- Re-ranking resources that Stage 3 already tiered.
- Boss Missions that test memory.
- Overloading missions with resources beyond the cap.
- Any placeholder or missing stage.
