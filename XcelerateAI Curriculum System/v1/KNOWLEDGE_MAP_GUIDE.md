# Knowledge Map Guide

## Purpose

The Knowledge Map is Stage 2 of the XcelerateAI Curriculum System. It sits between the Profession Blueprint (Stage 1) and Resource Discovery (Stage 3).

The Blueprint describes a profession in prose — what it is, what mastery looks like, what tools and workflows matter. That prose is not directly buildable: its topics are too broad to attach a single resource or a single mission to. The Knowledge Map's job is to convert that prose into a **discrete, ordered, dependency-linked list of atomic competencies** — the units that every later stage actually attaches to.

Without this stage, curriculum topics stay coarse (e.g. "Conditionals and Functions" as one lump), and downstream missions blur into each other because nothing in the data distinguishes one competency from the next. This is a known, observed failure from the prototype track — the Knowledge Map exists specifically to prevent it.

---

## Inputs

Required:

- ProfessionBlueprint.docx

Optional:

- Target learning duration (e.g. 6 months) — used to sanity-check competency count against available time, not to cut competencies.

---

## Output

Generate exactly one document.

KnowledgeMap.docx

**This document is a required input to BOTH Stage 3 (Resource Discovery) and Stage 5 (Curriculum Creation).** Neither stage should read competencies directly from the Blueprint prose; both read the atomic competency list from here. (This closes a seam that was previously broken: Resource Discovery formerly attached resources to broad Blueprint topics rather than atomic competencies.)

---

## What an "atomic competency" is

A competency is atomic when it is small enough that **one mission can target it and demonstrate it**. Test each entry against these:

- **Single-idea:** it teaches one thing, not a cluster. "Conditionals" and "Functions" are two competencies, never one.
- **Demonstrable:** you can state what a learner would build or do to prove they have it.
- **Named plainly:** the name describes the skill, not a week or a project. "Array iteration with map/filter" — not "Week 4" and not "Month 1 Boss."

If a candidate competency can't pass these three, split it until each piece can.

---

## Required fields per competency

Each competency in the map must carry:

- **ID** — a stable identifier (e.g. `JS-COND-01`). This ID travels downstream; resources and missions reference it. It must never be derived by tokenizing a title or a week name — it is authored, once, here.
- **Name** — plain-language skill name.
- **Description** — one or two sentences: what it is, what having it lets a learner do.
- **Prerequisites** — the IDs of competencies that must be learned first. This is what makes the map *ordered* rather than just a list.
- **Depth level** — Foundational / Intermediate / Advanced.
- **Demonstration** — one line: what a learner does to prove they have this competency. (This later seeds mission design.)

---

## Dependency ordering

The map is not a flat list — it is a dependency graph. Every competency names its prerequisites, and no competency may list a prerequisite that comes "after" it.

The point of this ordering: Stage 5 (Curriculum Creation) sequences weeks by walking this graph, so a concept can never appear in the curriculum before the things it depends on. If the graph is right, correct sequencing downstream is nearly automatic. If the graph is wrong or missing, every downstream stage has to re-guess the order — which is how prerequisite-violations and blurred missions creep in.

---

## Required deliverables

The completed KnowledgeMap.docx must:

- List every competency implied by the Blueprint — omit none because it seems "advanced."
- Give each an authored ID, never a tokenized one.
- State prerequisites for each, forming a valid dependency graph (no cycles, no forward references).
- Mark depth level.
- Give a demonstration line for each.
- Be granular enough that no single competency would need to be split again to fit one mission.

---

## Quality standards

- Atomic, not coarse. When in doubt, split.
- Complete coverage of the Blueprint's competencies.
- A valid, acyclic dependency graph.
- Plain skill names, never week/project/title-derived names.
- Every ID authored deliberately.

---

## Master Prompt

Using the supplied ProfessionBlueprint.docx, produce a Knowledge Map: a complete, atomic, dependency-ordered list of every competency required for professional mastery of this profession.

Break the profession down until each competency is small enough that a single learning mission could teach and demonstrate it. Split any competency that bundles more than one idea.

For each competency, author a stable ID, a plain-language name, a one-to-two-sentence description, its prerequisite competency IDs, a depth level, and a one-line demonstration of mastery.

Do not tokenize names or weeks into IDs. Author every ID deliberately.

Ensure the prerequisites form a valid dependency graph with no cycles and no forward references, so that a later stage can sequence the curriculum simply by walking the graph.

Produce exactly one document named KnowledgeMap.docx.

---

## Internal Validation Checklist

Before returning the document, verify that:

✓ Every Blueprint competency is represented.

✓ Every competency is atomic (would not need splitting to fit one mission).

✓ Every competency has an authored ID (not tokenized from a title or week).

✓ Every competency lists prerequisites.

✓ The dependency graph has no cycles and no forward references.

✓ Depth levels are assigned.

✓ Every competency has a demonstration line.

---

## Common Failure Modes

Avoid:

- Restating the Blueprint in a new format without atomizing it. (This stage adds value only if it breaks things down further than the Blueprint did.)
- Bundling multiple ideas into one competency.
- Deriving IDs by tokenizing names or week titles — the exact mechanism that caused blurred, indistinguishable missions in the prototype.
- Omitting advanced competencies.
- Leaving prerequisites unspecified, forcing later stages to re-guess ordering.
- Creating a flat list with no dependency structure.
