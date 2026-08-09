# JSON Regeneration Process

## Purpose

This is the operator's manual for the XcelerateAI Curriculum System. The other guides each govern one stage; this document ties them into one runnable end-to-end process — both for building a brand-new track and for regenerating an existing one.

If you only read one document before running a build, read this one; it points to the others in order.

---

## The pipeline (and which guide governs each stage)

| Stage | Produces | Governed by |
|------|----------|-------------|
| 1. Profession Blueprint | ProfessionBlueprint.docx | PROFESSION_BLUEPRINT_GUIDE.md |
| 2. Knowledge Mapping | KnowledgeMap.docx | KNOWLEDGE_MAP_GUIDE.md |
| 3. Resource Discovery | Resources.docx | RESOURCE_TAXONOMY.md |
| 4. Learning Experience Design | (folded into 3 and 5) | — |
| 5–6. Curriculum + JSON | production-dialect JSON | CURRICULUM_CREATION_GUIDE.md + JSON_AUTHORING_STANDARD.md |
| 7. Validation | validation report | JSON_VALIDATION_GUIDE.md |
| 8. Pilot testing | learner feedback | (human) |
| 9. Regeneration | improved track | this document |

Each stage's output is the next stage's input. The seams matter as much as the stages: Stage 3 and Stage 5 both read competencies from the **Knowledge Map**, not from Blueprint prose. Stage 5 outputs the **production dialect**; the progress-merge is a Validation concern, not an authoring one.

---

## Path A — building a NEW track (new profession)

Run stages 1→7 in order. Each is a separate step with a checkable artifact; do not skip ahead.

1. **Blueprint** — give the profession name; produce ProfessionBlueprint.docx. Checkpoint: every required section present, mastery clearly defined.
2. **Knowledge Map** — from the Blueprint, produce the atomic, dependency-ordered competency list. Checkpoint: every competency atomic, IDs authored (not tokenized), dependency graph valid.
3. **Resource Discovery** — from the Knowledge Map, produce the tiered Resources.docx. Checkpoint: every competency has resources, format-diverse, official docs scored not defaulted, every URL verified, per-concept cap respected.
4. **Curriculum + JSON** — from the Map + Resources, author the curriculum. Checkpoint: sequence walks the dependency graph, every mission authored (no tokenized concepts), scope contracts present.
5. **Validation** — run the full checklist. Checkpoint: zero failures, all flags resolved, report produced.

Between each stage, the operator (or a check-in) confirms the checkpoint before proceeding. A flaw caught at stage N is cheap; the same flaw discovered at stage N+3 is expensive.

---

## Path B — regenerating an EXISTING track (e.g. improving the prototype)

Regeneration is not a rebuild from zero. Preserve what works; change deliberately.

1. **Identify what's changing** — new resources? re-authored missions? corrected competencies? Scope it before touching anything.
2. **Author against the production dialect**, never the lossy progress export.
3. **If a learner has progress in this track**, the changed content is merged into the progress dialect via an additive, halt-on-violation script — never by hand. All progress-keyed fields (missionId, step indices, task indices, studied resource titles) stay byte-identical. See JSON_VALIDATION_GUIDE.md.
4. **Validate** against the live progress: structural + content-quality + progress-safety checklist.
5. **Ship one re-importable file** that carries the new content and the untouched progress. Keep the prior file as rollback.

---

## The lessons this process encodes (do not relearn them the hard way)

These came from prototype testing. They are already fixed in the individual guides; this list exists so the *reasons* survive:

- **Author against the clean production dialect, never the app's lossy export.** The original curriculum was once authored against an export and quietly lost narrative content.
- **Merge with a halt-on-violation script, never by hand.** This is what makes it safe to change a curriculum a learner already has progress in.
- **Never tokenize titles into competency IDs or `conceptsUsed`.** That single mechanism caused missions to blur together and mis-scope.
- **Score official docs; don't default to them.** Defaulting produced a resource library that was ~90% reference docs and poor for first-exposure learning.
- **Verify every resource; flag the unverifiable.** An unverified link claimed as verified is worse than an honestly-flagged gap. Even the most stable sources move URLs (link rot is real and observed).
- **Capture discipline in documents, not sessions.** Session reasoning does not persist between runs; anything that must survive has to live in these guides.

---

## What the operator hands a build session

- For a new track: this document + all stage guides + the profession name.
- For regeneration: this document + JSON_VALIDATION_GUIDE.md + the relevant stage guide(s) + the live production/progress files.
- Recommended: a capable model with extended thinking for stages involving per-competency or per-mission judgment (Knowledge Mapping, Curriculum authoring, Resource scoring). Watch usage — these are large jobs.
- Ask for stage-by-stage check-ins at the checkpoints above, and a validation report before anything ships.

---

## Definition of done

A track is production-ready when: every competency is covered, the sequence honors the dependency graph, every mission is individually authored with a scope contract, every resource is tiered and verified, validation passes with zero failures, and — for regenerations — the learner's progress is confirmed byte-identical. Not before.
