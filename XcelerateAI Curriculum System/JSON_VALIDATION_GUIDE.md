# JSON Validation Guide

## Purpose

This guide defines Stage 7 of the XcelerateAI Curriculum System: verifying that a generated or regenerated curriculum JSON is correct, complete, and — critically — safe to ship to a learner who already has recorded progress.

This discipline is the reason the prototype track succeeded through multiple regenerations without ever corrupting a learner's progress. It previously existed only in the reasoning of individual build sessions, which do not persist. This document makes it durable, so any future session reconstructs the same rigor rather than improvising it.

---

## Inputs

- The candidate curriculum JSON (newly generated, or a regenerated/enriched file).
- Where applicable: the live learner progress export the new file must be compatible with.
- KnowledgeMap.docx and Resources.docx (to confirm coverage).

---

## The two dialects (read this first)

The system has two JSON shapes, and confusing them is the single most expensive mistake in this project's history:

1. **The authored/production dialect** — the clean, non-lossy curriculum (top-level `bootcamp`, `resourceLibrary`, `projects`, `checkpoints`, full narrative fields). Author and edit against this.
2. **The exported/progress dialect** (`xca-progress-*`) — what the app produces after normalization, with the learner's progress embedded. It is slightly lossy. **Never author content against this file.** It is a compatibility target and a validation reference only.

A new curriculum for a fresh learner ships in a form the app imports cleanly. A regenerated curriculum for an *existing* learner must merge new content into the progress dialect while leaving every progress field byte-identical. See the merge rules below.

---

## Core rule: additive merge with halt-on-violation

When changing an existing curriculum that a learner has progress in, changes are applied by a **script**, never by hand, and the script must **halt the entire build if any existing protected field's value changes**.

- Additive changes (new fields, new optional resources) are allowed.
- Mutations to existing content are allowed **only** when the field is confirmed not progress-keyed, and the change is deliberate and logged (e.g. correcting tokenized `conceptsUsed`).
- Any unplanned change to a protected field is a build failure, not a warning.

Hand-editing is prohibited for merges because it cannot guarantee this property. The assertion is the safety net; trusting careful editing is not.

---

## What "progress-keyed" means

The app tracks a learner's progress using specific keys. These must survive any regeneration byte-for-byte:

- `missionId`
- `stepByStepInstructions` indices (progress references steps by position)
- `tasks` indices
- resource **titles** marked "studied" (the app keys studied-status on the title string)

Before changing or removing any of these on a week a learner has already completed, check it against the live progress. Prefer **adding and re-tiering** over **renaming or removing** anything progress points to. Flag any unavoidable change for the operator rather than applying it silently.

Fields that are safe to correct in place (not progress-keyed) include `conceptsUsed`, `skillFocus`, and enrichment fields — but only after confirming this against the current app code, not assuming it.

---

## Validation checklist (run every time)

**Structural**

✓ JSON parses; schema matches the target dialect.

✓ Every competency in KnowledgeMap.docx is covered by at least one mission.

✓ No prerequisite appears after a dependent concept (sequence honors the dependency graph).

✓ No placeholder or empty content; no orphaned references.

**Content quality (the prototype's hard-won lessons)**

✓ No mission's `conceptsUsed` was tokenized from its week title.

✓ No week has identical `conceptsUsed` across all its missions.

✓ Each mission's declared concepts match what its steps actually build.

✓ Every resource has a live, link-checked URL (no unresolved 404s), plus its full taxonomy-v2 metadata (tier, exactLocation, stopPoint, whyChosen, freeTierVerifiedDate).

**Progress safety (only when merging into an existing learner's file)**

✓ All progress keys byte-identical to the live export.

✓ Every completed mission's step array still covers every recorded index.

✓ Every studied resource title still present.

✓ `tasks` byte-identical for completed weeks.

✓ No orphaned "studied" references introduced.

**Report**

✓ Produce a validation report stating: number of checks run, number passed, number failed, and every flagged item. Nothing ships until failures are zero and flags are resolved or accepted by the operator.

---

## Master Prompt

Validate the supplied curriculum JSON against this guide.

First, identify which dialect the file is in and whether it must be compatible with an existing learner's progress. If it must, treat all progress-keyed fields as immutable and verify them byte-for-byte after any merge.

Run the full structural, content-quality, and (where applicable) progress-safety checklist. Apply all changes to existing files via an additive merge that halts on any unplanned change to a protected field — never by hand.

Produce a validation report: checks run, passed, failed, and all flagged items. Do not declare the file shippable unless failures are zero and every flag is resolved or explicitly accepted.

---

## Common Failure Modes

Avoid:

- Authoring or editing against the lossy exported dialect instead of the production dialect.
- Hand-editing a merge instead of scripting it with a halt-on-violation assertion.
- Assuming a field is safe to change without confirming it isn't progress-keyed against the current app code.
- Renaming or removing a resource title a completed week recorded as studied.
- Shipping without a validation report.
- Treating a 404 or an unverified resource as acceptable because the rest passed.
