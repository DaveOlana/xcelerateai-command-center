# Resource Discovery Guide

# Purpose

The purpose of this guide is to discover, evaluate, organize, and document the highest-quality learning resources required to master a profession.

The objective is not to gather as many resources as possible.

Instead, the objective is to identify the most valuable learning materials that collectively provide complete coverage of every concept, skill, workflow, and competency identified in the Profession Blueprint.

The resulting document becomes the official resource database used during curriculum generation.

---

# Inputs

Required:

- ProfessionBlueprint.docx

Optional:

- Preferred Learning Style
- Budget Constraints
- Preferred Language
- Region

---

# Output

Generate exactly one document.

Resources.docx

This document becomes the official resource library used by the Curriculum Generator.

**Resources.docx must arrive with selection already done.** It is not a raw candidate pool for a later step to sort through — the primary/secondary/backup decision described in Learning Philosophy below happens inside this step, by this guide, before the document is delivered. No downstream step is assumed to revisit this decision.

---

# Research Principles

The AI must:

- Prefer quality over quantity.
- Never recommend a resource simply because it is popular.
- Prefer actively maintained resources.
- Prefer resources recommended by experienced professionals.
- Cover every competency identified in the Profession Blueprint.
- Avoid duplicate resources unless they provide significantly different value.
- Never invent ratings or information.
- Distinguish between beginner, intermediate, and advanced resources.

**On official documentation specifically:** official docs are a reference layer, not a default teaching layer. They win a Primary slot only when they score highest for a given concept against the full evaluation criteria below — the same bar every other candidate has to clear. They do not win by virtue of being official. In practice, official documentation is usually the right choice for *looking something up after you already understand the shape of a concept*, and rarely the best choice for *meeting a concept for the first time*. Score accordingly. If, after honest scoring, no reading resource, video, course, or interactive tutorial beats the official docs for a given concept, official docs may still win the Primary slot — but that should be the exception the scores produced, not the default the search settled on.

---

# Resource Collection Framework

For every competency, concept, or skill identified in the Profession Blueprint, collect resources from as many relevant categories as genuinely apply.

Possible categories include:

- Official Documentation
- Books
- Courses
- Video Tutorials
- Interactive Tutorials
- Interactive Labs
- Coding Playgrounds
- Practice Platforms
- Cheat Sheets
- Reference Material
- Technical Blogs
- Open Source Projects (including curated repositories and "awesome-x" style lists on GitHub)
- Sample Projects
- Research Papers
- Community Discussions
- Podcasts
- Conferences
- Workshops

Not every topic requires every category.

Only recommend categories that genuinely improve learning.

**Widen the search deliberately, not just the category list.** GitHub and YouTube are fully searchable and should be checked for every competency, not treated as a fallback below official docs and established course platforms. Signup-gated platforms (Coursera, edX, freeCodeCamp, Exercism, Frontend Mentor, Scrimba, and similar) are fair game and should not be down-ranked for requiring an account — only for requiring payment. Live community spaces (Discord servers, Telegram groups, and similar) are excluded from Resources.docx entirely and do not receive scores under this framework — see "Community Pointers" below for why and where they belong instead.

---

# Community Pointers (separate from Resources.docx)

Live community spaces change too fast and depend on external moderation too much to be scored, gated, or relied on for mission completion. Invite links expire, servers get archived, channels get purged, and a learner blocked on a dead Discord invite is worse off than one with no community pointer at all.

If a genuinely good, currently active community exists for the profession, list it in a short, separately-labeled section of Resources.docx — clearly marked as unscored, informational, and due for revalidation at each curriculum refresh. Never let a mission's completion or unlock criteria depend on it.

---

# Resource Metadata

Every collected resource must include:

- Resource Name
- Resource Type
- URL
- Author or Organization
- Cost (Free/Paid)
- Difficulty Level
- Estimated Completion Time
- Last Updated (if available)
- Knowledge Coverage Score (0–100)
- Practical Value Score (0–100)
- Beginner Friendliness Score (0–100)
- **Format Type** (Reading / Video / Interactive / Practice)
- **Tier** (Primary / Backup / Backup-of-Backup)
- **Exact Location** — the specific chapter, module, lesson, or timestamp a learner should start at. Never the bare root URL of a large course, repo, or platform.
- **Stop Point** — where the relevant coverage ends, so the assignment stays the size of the concept it teaches rather than the size of the platform it lives on.
- **Why Chosen** — one line: what this beat, and why, for this specific concept. This is the record a future author (human or AI) needs so the choice doesn't have to be re-derived.
- **Free-Tier Verified Date** — the date the cost/access claim was last actually checked. Signup-gated platforms shift their free/paid boundaries more often than official docs or GitHub content do; a resource logged as free a year ago is a claim, not a fact, until re-verified.

---

# Resource Evaluation

Every resource should be evaluated based on:

## Accuracy

How technically correct is the information?

## Depth

How completely does it explain the topic — matched to the size of the topic. A single concept does not need a marathon; length should be proportional to what's actually being taught.

## Practicality

Does it teach real-world skills?

## Clarity

How easy is it to understand?

## Currency

Is the content up to date? Does it teach current, non-deprecated syntax and patterns?

## Community Reputation

Is it widely trusted by professionals?

**Verification note:** scoring on Accuracy, Depth, and Clarity requires actually reading or watching the resource, not inferring quality from its reputation or source type. For JavaScript-heavy platforms that don't render cleanly to a simple fetch, a browser-rendering fetch tool is worth using here — the goal is the same either way: judge the actual content, not the platform it sits on.

---

# Learning Philosophy

When multiple resources teach the same topic, they should not all become mandatory.

Instead, provide learners with choices — but a bounded, curated set of choices, not an open pool.

**Per-concept selection cap:** for any single concept, select no more than one to two Reading resources, one Video resource (comprehensive enough to stand alone, not a multi-hour marathon), and optionally one Interactive/Practice resource. This is a hard cap, not a suggestion — if scoring produces more strong candidates than this, the extras become Backup or Backup-of-Backup tier, not additional Primary resources.

Example:

Official Documentation

Knowledge Coverage:
95/100

Practical Value:
90/100

Beginner Friendliness:
60/100

Tier: Backup (a Video and Interactive Tutorial scored higher on Beginner Friendliness and Practical Value for this concept)

---

Video Course

Knowledge Coverage:
88/100

Practical Value:
92/100

Beginner Friendliness:
95/100

Tier: Primary

---

Interactive Tutorial

Knowledge Coverage:
80/100

Practical Value:
97/100

Beginner Friendliness:
98/100

Tier: Primary

The selection into Primary, Backup, and Backup-of-Backup happens here, inside this step — see the note under Output above.

---

# Required Deliverables

The completed Resources document must:

- Cover every competency identified in the Profession Blueprint.
- Organize resources by topic.
- Include metadata for every resource, including Format Type, Tier, Exact Location, Stop Point, Why Chosen, and Free-Tier Verified Date.
- Include quality ratings.
- Include estimated learning value.
- Clearly distinguish Primary from Backup and Backup-of-Backup resources — not defer this distinction to a later step.
- Clearly identify official resources, and clearly state why each one earned its tier rather than assuming official status justifies it.
- Avoid duplicate recommendations.
- Respect the per-concept selection cap.

---

# Quality Standards

The resource collection must:

- Cover the entire profession.
- Score official sources on the same criteria as everything else, rather than preferring them by default.
- Prefer actively maintained resources.
- Avoid outdated material.
- Balance theoretical and practical learning.
- Support multiple learning styles.
- Include beginner-friendly alternatives where appropriate.
- Include advanced references where necessary.
- Provide a precise entry point into every resource, not a link to its root.

---

# Master Prompt

Using the supplied ProfessionBlueprint.docx, build a comprehensive resource library covering every competency, concept, workflow, and practical skill required for professional mastery.

Search broadly — official documentation, established course platforms (signup-gated is fine, paywalled is not), GitHub (including curated lists and specific standout sections of larger repositories, linked directly rather than at the repo root), and YouTube — for the highest-quality learning materials available for each concept.

Evaluate each resource based on technical accuracy, depth, clarity, practical value, currency, and reputation. Score official documentation on these same criteria rather than defaulting to it.

Do not collect resources simply for quantity. For each concept, select the best one to two Reading resources, one comprehensive Video resource, and optionally one Interactive/Practice resource — no more — and mark any additional strong candidates as Backup or Backup-of-Backup rather than adding them as further Primary material.

For every selected resource, identify the exact chapter, module, lesson, or timestamp a learner should start at, and where the relevant coverage ends.

Produce exactly one document named:

Resources.docx

---

# Internal Validation Checklist

Before returning the document, verify that:

✓ Every competency has learning resources.

✓ Official documentation was scored against the same criteria as every other candidate, not defaulted to.

✓ Resources are categorized correctly, including Format Type.

✓ Metadata is complete, including Tier, Exact Location, Stop Point, Why Chosen, and Free-Tier Verified Date.

✓ Ratings are included.

✓ Duplicate resources have been removed.

✓ Each concept respects the per-concept selection cap, with excess strong candidates demoted to Backup or Backup-of-Backup rather than left as additional Primary resources.

✓ Beginner alternatives exist where appropriate.

✓ Advanced references exist where appropriate.

✓ No outdated resources dominate the recommendations.

✓ No resource is linked at its root when a precise section is what's actually relevant.

✓ Every recommendation has educational value.

✓ Live community spaces, if included, are clearly separated from Resources.docx's scored content and marked as unscored and due for revalidation.

---

# Common Failure Modes

Avoid the following:

- Collecting resources without evaluating quality.
- Treating popularity as quality.
- **Defaulting to official documentation because it is the lowest-risk choice, rather than because it scored highest.**
- Recommending outdated material.
- Providing duplicate resources that teach identical content.
- Omitting beginner-friendly alternatives.
- Omitting advanced reference material.
- Recommending incomplete courses.
- Ignoring practical learning opportunities.
- Collecting resources that do not directly support mastery.
- **Linking to the root of a large course, repository, or platform when a specific section is what's actually needed.**
- **Selecting more Primary resources per concept than the cap allows, rather than tiering the extras down.**
- **Including a live community space as if it were a stable, scoreable resource.**
- **Logging a signup-gated resource as free without a Free-Tier Verified Date, or without a plan to re-check it.**
