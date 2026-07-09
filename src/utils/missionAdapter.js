// =============================================
// MISSION ADAPTER  (Phase 8C — Milestone 1: Foundation, extended in Milestones 2-6,
// compatibility patch after Milestone 8's handoff)
//
// COMPATIBILITY PATCH (post-handoff): XcelerateAI Curriculum System/
// JSON_AUTHORING_STANDARD.md specifies `debuggingChecklist` and
// `stretchChallenge` as the authoritative field names — names that predate
// this standard's existence (`debugChecklist`, `stretchGoals`/`stretchGoal`/
// `bonusChallenges`) are still recognized and still take effect exactly as
// before. Neither old name was removed or renamed; the new names were added
// as higher-priority aliases in resolveDebugChecklist()/resolveStretchGoals().
// See those functions for the exact resolution order.
//
// Flow:
//   Raw JSON → normalizeRoadmap() → buildMissionObject() → Standard Mission Object
//
// RESPONSIBILITY
// ---------------
// Converts an already-normalized week/practical-mission (as produced by
// normalizeRoadmap.js) into one standardized mission object for the future
// Educational Experience Engine. This is the single source of truth every
// future EEE component will receive as its `mission` prop, so that no
// component has to know which of the app's supported bootcamp JSON dialects
// (or field-name aliases) the data originally came from.
//
// WHAT THIS NORMALIZES
// ---------------------
// - Mission content fields not yet resolved by normalizeRoadmap.js: scenario,
//   learningObjectives, expectedOutcome, hints, commonMistakes, stretchGoals,
//   prerequisites, debugChecklist, thinkingPrompts, recallPrompts,
//   missionReview, progressNotes, missionDebrief, commanderNotes,
//   nextMissionTeaser. All of the fields after prerequisites are genuinely
//   new concepts with no existing field to reuse (Milestones 4-6) — see
//   resolveRecallPrompts() for why recallPrompts was kept separate from the
//   pre-existing skillCheck/reflectionPrompts fields, and
//   resolveMissionDebrief() for why missionDebrief was kept separate from
//   the pre-existing missionReview field.
//   Each is read from the practical mission first, then the raw week, and
//   defaults to null/[] (never undefined) when absent from the source JSON.
// - `summary`, which maps to `objective` today and will prefer a dedicated
//   `summary` field the moment a future JSON provides one (Milestone 2).
// - `estimatedTime`/`estimatedData`, sourced from fields normalizeRoadmap.js
//   already resolves at the week level (`timeEstimate`/`estimatedHours`/
//   `estimatedData`) but that Milestone 1's mission object didn't yet expose.
// - `scenario` additionally falls back to the existing, already-normalized
//   `elliotConnection` week field (Milestone 2) — see resolveScenario() for
//   why.
// - Resource types, onto the canonical taxonomy agreed in the Phase 8C
//   architecture review (phase8c_analysis.md §5d), via normalizeResource()/
//   normalizeResourceType().
//
// WHAT THIS DELIBERATELY DOES NOT DO
// ------------------------------------
// - Does NOT modify normalizeRoadmap.js. A practical mission entry already
//   passes through unknown raw fields via `{ ...m }` in normalizeRoadmap.js's
//   resolvePracticalMissions(), and normalizeWeek() preserves the original
//   raw week under `_raw`. This adapter reads both of those pass-throughs, so
//   a future regenerated bootcamp JSON can add `scenario`, `hints`,
//   `commonMistakes`, `stretchGoals`, `learningObjectives`, or
//   `expectedOutcome` fields today and they will surface here with zero
//   further code changes — forward-compatibility without touching the
//   existing, already-relied-upon normalizer.
// - Does NOT re-derive unlock/progression logic. Status is computed
//   separately, in attachMissionStatus() (see below for why).
//
// CONSUMPTION STATUS (updated Milestone 8 — this note was stale since
// Milestone 2 and is corrected here): buildMissionObject() IS consumed today
// — WeeklyMissions.jsx imports it directly and every Layer 1-5 component
// receives its output as their `mission` prop. attachMissionStatus(),
// however, remains genuinely unconsumed by any page or component as of
// Milestone 8 — it was built in Milestone 1 as deliberate, documented
// scaffolding for a future milestone that needs live unlock/progress status
// inside an EEE component, and intentionally has no caller yet. That is a
// forward-compatible design choice, not dead code.
//
// WHY PROGRESSION LOGIC IS DELEGATED TO unlockChecker.js
// ---------------------------------------------------------
// Unlock/completion status depends on live learner state (progress,
// resourcesStatus, skillChecks, weekProofs, weekReflections, settings — all
// sourced from AppContext/localStorage at render time), not on the JSON
// alone. unlockChecker.js already owns this logic and is the only place it
// should live: reimplementing any part of it here would create two
// divergent sources of truth for "is this step unlocked," which is exactly
// the kind of duplicated-logic risk the Phase 8C review flagged. That's also
// why attachMissionStatus() is a separate function from buildMissionObject():
// the latter stays a pure, stateless JSON-shape transform, while the former
// is the one place runtime state is allowed to enter the picture.
//
// WHY ONE buildMissionObject() FOR BOTH WEEK-LEVEL AND
// PRACTICAL-MISSION-LEVEL INPUT (INSTEAD OF TWO ADAPTERS)
// -----------------------------------------------------------
// The app already has two established mental models for "what counts as a
// mission": WeeklyMissions.jsx treats an entire week as one mission, while
// PracticalMissionView.jsx treats one specific entry in a week's
// practicalMissions[] as its own mission. Maintaining two separate adapter
// functions would mean two field-resolution paths to keep in sync as the
// schema evolves. Instead, buildMissionObject(week, month, practicalMission)
// takes an optional third argument: called without it, mission-level fields
// fall back to the week's own fields (the WeeklyMissions.jsx model); called
// with it, the specific mission's fields take precedence (the
// PracticalMissionView.jsx model). One resolution path, two call sites.
//
// WHY RESOURCES PRESERVE BOTH `type` (CANONICAL) AND `rawType` (ORIGINAL)
// ----------------------------------------------------------------------
// normalizeResource() never overwrites a resource's original `type` value —
// it adds `type` as the canonical-taxonomy value and keeps the untouched
// original under `rawType`. This is deliberate for two reasons: (1) nothing
// a JSON author wrote is ever silently discarded, which matters because the
// alias map (§ below) is best-effort and will not cover every future bootcamp
// dialect's vocabulary on day one; (2) this mission object is an entirely
// separate data structure from the one normalizeRoadmap.js already produces
// and ResourceVault.jsx already renders — so there is no risk of this
// renaming breaking that page — but preserving `rawType` regardless means
// future debugging or a future migration never has to guess what the
// original author-supplied value was.
// =============================================

import {
  getWeekStepStatus,
  missionRequiresEvidence,
  isEvidenceComplete,
} from './unlockChecker';

// ─── Canonical Resource Taxonomy ─────────────────────────────────────────────
// Agreed during the Phase 8C architecture review (see phase8c_analysis.md
// §5d). "Resource Types" describe what the learner is consuming; kept
// deliberately broad and domain-neutral so the same list works for every
// current and future bootcamp field (Software Engineering, Cybersecurity,
// Cloud, AI, UI/UX, Data Science, Writing, Mathematics, etc.).
export const CANONICAL_RESOURCE_TYPES = [
  'Official Documentation',
  'Video',
  'Interactive Practice',
  'Playground / Lab',
  'Project',
  'Course',
  'Book',
  'Article',
  'Cheat Sheet',
  'Reference',
  'Tool',
];

// Aliases from the app's current vocabulary (confirmed in use today: Docs,
// Tutorial, Video, Tool — see ResourceVault.jsx / sampleRoadmap.js) and other
// common JSON-author phrasing, mapped onto the canonical list above. Extend
// this map as new bootcamp JSON dialects introduce new type strings — never
// rename the canonical list itself to match an alias.
const RESOURCE_TYPE_ALIASES = {
  docs: 'Official Documentation',
  doc: 'Official Documentation',
  documentation: 'Official Documentation',
  'official docs': 'Official Documentation',
  video: 'Video',
  videos: 'Video',
  tutorial: 'Interactive Practice',
  tutorials: 'Interactive Practice',
  'interactive exercise': 'Interactive Practice',
  'interactive exercises': 'Interactive Practice',
  exercise: 'Interactive Practice',
  lab: 'Playground / Lab',
  labs: 'Playground / Lab',
  playground: 'Playground / Lab',
  sandbox: 'Playground / Lab',
  project: 'Project',
  'sample project': 'Project',
  course: 'Course',
  book: 'Book',
  books: 'Book',
  article: 'Article',
  articles: 'Article',
  reading: 'Article',
  'cheat sheet': 'Cheat Sheet',
  cheatsheet: 'Cheat Sheet',
  'cheat-sheet': 'Cheat Sheet',
  reference: 'Reference',
  tool: 'Tool',
  tools: 'Tool',
};

/**
 * Map a raw, free-text resource `type` value (from any supported bootcamp
 * JSON dialect) onto the canonical resource taxonomy. Unknown/unrecognised
 * values fall back to "Reference" rather than being dropped — the original
 * value is preserved separately as `rawType` by normalizeResource(), never
 * overwritten here, so nothing a JSON author wrote is silently lost.
 */
export function normalizeResourceType(rawType) {
  if (!rawType) return 'Reference';
  const key = String(rawType).trim().toLowerCase();
  if (RESOURCE_TYPE_ALIASES[key]) return RESOURCE_TYPE_ALIASES[key];
  const exactMatch = CANONICAL_RESOURCE_TYPES.find((t) => t.toLowerCase() === key);
  return exactMatch || 'Reference';
}

/**
 * Normalize a single resource (already produced by normalizeRoadmap.js's
 * resolveStudyResources()) into the canonical shape: Resource Type kept
 * separate from Resource Metadata, per the Phase 8C architecture review.
 * This is a NEW, additional shape — it does not replace or alter the
 * resource objects normalizeRoadmap.js already produces, so ResourceVault.jsx
 * (which reads those directly) is entirely unaffected.
 */
export function normalizeResource(rawResource) {
  const r = rawResource || {};
  return {
    title: r.title || 'Untitled resource',
    url: r.url || '#',
    type: normalizeResourceType(r.type),
    rawType: r.type || null,
    metadata: {
      provider: r.provider || r.publisher || r.source || null,
      difficulty: r.difficulty || null,
      estimatedDuration: r.estimatedDuration || r.timeEstimate || r.estimatedTime || null,
      // Milestone 3 addition: distinct from estimatedDuration (time), this is
      // data/bandwidth cost — same raw field names ResourceVault.jsx already
      // reads (r.dataEstimate / r.estimatedData), now also surfaced here.
      estimatedData: r.dataEstimate || r.estimatedData || null,
      required: r.required === true,
      tags: Array.isArray(r.tags) ? r.tags : Array.isArray(r.teaches) ? r.teaches : [],
      // Per JSON_AUTHORING_STANDARD.md §9.4 — an integer 0-100 representing
      // overall educational quality (distinct from knowledgeScore, which this
      // adapter does not yet surface since no UI consumes it). Not populated
      // by any current sample/production JSON — null until curriculum
      // authors start supplying it, at which point ResourceMetadata renders
      // it automatically with no further code changes.
      qualityScore: typeof r.qualityScore === 'number' ? r.qualityScore : null,
    },
    // Pass-through fields already used by the current ResourceVault.jsx page.
    // Priority order (purpose before whatToExpect) matches WeeklyMissions.jsx's
    // existing inline resolution (`res.purpose || res.whatToExpect`) exactly,
    // corrected here in Milestone 3 — the original Milestone 1 version omitted
    // the `purpose` fallback, which had no visible effect until this milestone
    // became the first consumer of this field for real rendering.
    whatToExpect: r.purpose || r.whatToExpect || null,
    missionObjective: r.missionObjective || null,
  };
}

// ─── Field resolvers ─────────────────────────────────────────────────────────
// Mission-level values take precedence over week-level ones. Everything
// defaults to null/[] rather than undefined, satisfying "expose a stable
// mission object even when optional fields are absent."

function firstDefined(...values) {
  for (const v of values) {
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return null;
}

function firstArray(...values) {
  for (const v of values) {
    if (Array.isArray(v) && v.length > 0) return v;
  }
  return [];
}

function resolveScenario(mission, week, rawWeek) {
  return firstDefined(
    mission?.scenario,
    mission?.context,
    mission?.narrative,
    rawWeek?.scenario,
    rawWeek?.context,
    // elliotConnection is already a normalized, named field on `week` today
    // (normalizeRoadmap.js) and is exactly what BOOTCAMP_SPECIFICATION.md's
    // "Context" concept describes — how this mission connects to the wider
    // story — so it's included as a lower-priority fallback source.
    week?.elliotConnection
  );
}

function resolveLearningObjectives(mission, week, rawWeek) {
  return firstArray(
    mission?.learningObjectives,
    mission?.objectives,
    mission?.concepts,
    rawWeek?.learningObjectives,
    rawWeek?.concepts,
    week?.skills
  );
}

function resolveExpectedOutcome(mission, week, rawWeek) {
  return firstDefined(
    mission?.expectedOutcome,
    mission?.outcome,
    mission?.successCriteria,
    rawWeek?.expectedOutcome,
    rawWeek?.successCriteria,
    week?.deliverable
  );
}

function resolveHints(mission, rawWeek) {
  return firstArray(mission?.hints, rawWeek?.hints);
}

function resolveCommonMistakes(mission, rawWeek) {
  return firstArray(mission?.commonMistakes, mission?.pitfalls, rawWeek?.commonMistakes, rawWeek?.pitfalls);
}

// Milestone 4 addition: the underlying field/resolver keeps the name
// "commonMistakes" (unchanged from Milestone 1) even though the Layer 3
// component that reads it is named LearningBottlenecks — see
// LearningBottlenecks.jsx's own header comment for why this is a deliberate,
// low-risk choice rather than a renamed field.

// Compatibility patch: XcelerateAI Curriculum System/JSON_AUTHORING_STANDARD.md
// specifies `debuggingChecklist` as the authoritative field name. The
// original Milestone 4 resolver only recognized `debugChecklist`/`debugSteps`
// (authored before that standard existed). Both are kept — the new
// authoritative name is checked first, the legacy name(s) remain as
// fallbacks — so existing JSON keeps working unmodified and new JSON
// following the standard also works, with no rename of any existing data.
function resolveDebugChecklist(mission, rawWeek) {
  return firstArray(
    mission?.debuggingChecklist,
    rawWeek?.debuggingChecklist,
    mission?.debugChecklist,
    mission?.debugSteps,
    rawWeek?.debugChecklist,
    rawWeek?.debugSteps
  );
}

function resolveThinkingPrompts(mission, rawWeek) {
  return firstArray(
    mission?.thinkingPrompts,
    mission?.coachingPrompts,
    rawWeek?.thinkingPrompts,
    rawWeek?.coachingPrompts
  );
}

// Milestone 5 additions. These are deliberately kept distinct from the
// pre-existing, superficially-similar fields rather than reusing them:
//   - recallPrompts vs. skillCheck: skillCheck is the formal, tracked,
//     progression-gating assessment (Stage 2, submitSkillCheck/skillChecks
//     in AppContext). recallPrompts is a non-gating, non-tracked, pure
//     memory-retrieval nudge for Layer 4 — conflating the two would mix a
//     gating mechanic into a presentational-only component.
//   - recallPrompts vs. reflectionPrompts: reflectionPrompts asks the
//     learner to write about their week; recallPrompts asks them to recall
//     a concept from memory without looking anything up. Related, not the
//     same question.
function resolveRecallPrompts(mission, rawWeek) {
  return firstArray(
    mission?.recallPrompts,
    mission?.knowledgeCheckPrompts,
    rawWeek?.recallPrompts,
    rawWeek?.knowledgeCheckPrompts
  );
}

function resolveMissionReview(mission, rawWeek) {
  return firstDefined(mission?.missionReview, mission?.review, rawWeek?.missionReview, rawWeek?.review);
}

function resolveProgressNotes(mission, rawWeek) {
  return firstArray(mission?.progressNotes, mission?.behaviorNotes, rawWeek?.progressNotes, rawWeek?.behaviorNotes);
}

// Milestone 6 additions (Layer 5 — Mission Completion & Transition).
//
// missionDebrief is deliberately a separate field from missionReview
// (Layer 4, Milestone 5) even though both are single-string "look back at
// what happened" text. missionReview is written to prompt reflection
// (Reflection Stage, before the learner has necessarily finished);
// missionDebrief is the closing statement shown only once the week is
// actually complete (Unlock Stage) — a genuinely later moment in the flow.
// Keeping them separate fields means a JSON author can supply either, both,
// or neither without one silently duplicating the other on screen — the
// milestone's "do not repeat earlier explanations" instruction is a content-
// authoring concern this separation makes possible, not something code
// alone can enforce.
function resolveMissionDebrief(mission, rawWeek) {
  return firstDefined(mission?.missionDebrief, mission?.debrief, rawWeek?.missionDebrief, rawWeek?.debrief);
}

// commanderNotes accepts either an array (commanderNotes) or a single
// string (commanderNote, wrapped into a 1-element array) — the same
// singular/plural dual-acceptance pattern normalizeRoadmap.js already uses
// for reflectionPrompt(s).
function resolveCommanderNotes(mission, rawWeek) {
  const arrayCandidates = [mission?.commanderNotes, rawWeek?.commanderNotes];
  for (const c of arrayCandidates) {
    if (Array.isArray(c) && c.length > 0) return c;
  }
  const singular = mission?.commanderNote || rawWeek?.commanderNote;
  if (typeof singular === 'string' && singular.trim()) return [singular];
  return [];
}

// nextMissionTeaser is intentionally a plain, JSON-authored string, not a
// value the adapter computes by looking up the roadmap's actual next week.
// buildMissionObject() only receives one week/month/practicalMission — it
// has no reference to the roadmap's other weeks — and the milestone's own
// example ("Next you'll discover how functions allow you to organise
// everything you've built today.") reads as hand-written curiosity copy,
// not an auto-generated blurb from a raw title. Auto-deriving this from the
// next week's real title/objective would require extending
// buildMissionObject()'s signature to accept the full roadmap — a larger,
// separate architectural change, not something to fold in here.
function resolveNextMissionTeaser(mission, rawWeek) {
  return firstDefined(
    mission?.nextMissionTeaser,
    mission?.nextMissionPreview,
    rawWeek?.nextMissionTeaser,
    rawWeek?.nextMissionPreview
  );
}

// Compatibility patch: XcelerateAI Curriculum System/JSON_AUTHORING_STANDARD.md
// specifies `stretchChallenge` as the authoritative field name. The original
// Milestone 1 resolver only recognized `stretchGoals`/`stretchGoal`/
// `bonusChallenges` (authored before that standard existed). Both are kept —
// the new authoritative name is checked first, every legacy name remains as
// a fallback — so existing JSON keeps working unmodified and new JSON
// following the standard also works, with no rename of any existing data.
function resolveStretchGoals(mission, rawWeek) {
  return firstArray(
    mission?.stretchChallenge,
    rawWeek?.stretchChallenge,
    mission?.stretchGoals,
    mission?.stretchGoal,
    mission?.bonusChallenges,
    rawWeek?.stretchGoals,
    rawWeek?.bonusChallenges
  );
}

function resolvePrerequisites(mission, rawWeek) {
  return firstArray(mission?.prerequisites, rawWeek?.prerequisites);
}

// ─── buildMissionObject ──────────────────────────────────────────────────────
/**
 * Build one standardized mission object from an already-normalized `week`
 * (as returned by normalizeRoadmap.js), its parent `month`, and — optionally —
 * one specific entry from week.practicalMissions[].
 *
 * Called with only `week`, this represents "the week as one mission" (the
 * mental model WeeklyMissions.jsx already uses). Called with a
 * `practicalMission` too, it represents one specific mission within that week
 * (the mental model PracticalMissionView.jsx already uses). Both are
 * supported by one function so future components can consume either
 * granularity without a different adapter per page.
 *
 * Pure function: no localStorage/AppContext access, no side effects, and no
 * unlock/progression computation — see attachMissionStatus() for that.
 */
export function buildMissionObject(week, month = null, practicalMission = null) {
  if (!week) return null;

  const rawWeek = week._raw || {};
  const mission = practicalMission || null;
  const objective = firstDefined(mission?.objective, week.objective, week.goal);

  return {
    // Identity
    id: mission?.missionId || week.weekId || week.id || null,
    weekId: week.weekId,
    weekNumber: week.weekNumber,
    monthNumber: week.monthNumber || month?.monthNumber || null,

    // Layer 1 — Mission Context
    title: firstDefined(mission?.title, week.title),
    objective,
    // "summary" maps directly to objective today, since no current bootcamp
    // JSON has a dedicated summary field. A future JSON that does add one
    // will be picked up automatically (summary -> falls back to objective),
    // with no further code change required.
    summary: firstDefined(mission?.summary, rawWeek?.summary, objective),
    scenario: resolveScenario(mission, week, rawWeek),
    learningObjectives: resolveLearningObjectives(mission, week, rawWeek),
    expectedOutcome: resolveExpectedOutcome(mission, week, rawWeek),
    estimatedTime: firstDefined(mission?.estimatedTime, mission?.timeEstimate, week.timeEstimate, week.estimatedHours),
    estimatedData: firstDefined(mission?.estimatedData, mission?.dataEstimate, week.estimatedData),
    prerequisites: resolvePrerequisites(mission, rawWeek),

    // Layer 2 — Learn
    resources: (week.studyResources || []).map(normalizeResource),

    // Layer 3 — Build
    difficulty: mission?.difficulty || null,
    tasks: week.tasks || [],
    hints: resolveHints(mission, rawWeek),
    commonMistakes: resolveCommonMistakes(mission, rawWeek),
    stretchGoals: resolveStretchGoals(mission, rawWeek),
    debugChecklist: resolveDebugChecklist(mission, rawWeek),
    thinkingPrompts: resolveThinkingPrompts(mission, rawWeek),

    // Layer 4 — Reflection
    skillCheck: week.skillCheck || [],
    reflectionPrompts: week.reflectionPrompts || [],
    recallPrompts: resolveRecallPrompts(mission, rawWeek),
    missionReview: resolveMissionReview(mission, rawWeek),
    progressNotes: resolveProgressNotes(mission, rawWeek),

    // Layer 5 — Completion
    proofOfWork: week.proofOfWork || [],
    deliverable: week.deliverable || null,
    missionDebrief: resolveMissionDebrief(mission, rawWeek),
    commanderNotes: resolveCommanderNotes(mission, rawWeek),
    nextMissionTeaser: resolveNextMissionTeaser(mission, rawWeek),

    // Diagnostics / traceability — mirrors normalizeRoadmap.js's own
    // _normalizedSchemaVersion convention so future adapter-shape changes
    // don't silently break already-built consumers.
    _missionAdapterVersion: 1,
    _sourceGranularity: mission ? 'practical-mission' : 'week',
  };
}

// ─── attachMissionStatus ─────────────────────────────────────────────────────
/**
 * Layer live unlock/progression status onto an already-built mission object.
 * Kept separate from buildMissionObject() because status depends on runtime
 * learner state (AppContext), not the JSON alone — buildMissionObject() stays
 * a pure JSON-shape transform.
 *
 * Delegates entirely to unlockChecker.js. Never recomputes gating logic here.
 */
export function attachMissionStatus(
  missionObject,
  {
    week,
    weekNum,
    monthNum,
    progress,
    resourcesStatus,
    skillChecks,
    practicalMissions,
    weekProofs,
    weekReflections,
    settings,
  } = {}
) {
  if (!missionObject || !week) return missionObject;

  const stepStatus = getWeekStepStatus({
    week,
    weekNum,
    monthNum,
    progress,
    resourcesStatus,
    skillChecks,
    practicalMissions,
    weekProofs,
    weekReflections,
    settings,
  });

  const missionEntry =
    missionObject._sourceGranularity === 'practical-mission'
      ? (week.practicalMissions || []).find((m) => m.missionId === missionObject.id)
      : null;

  return {
    ...missionObject,
    status: {
      ...stepStatus,
      requiresEvidence: missionEntry ? missionRequiresEvidence(missionEntry) : null,
      evidenceComplete: missionEntry ? isEvidenceComplete((weekProofs || {})[weekNum]) : null,
    },
  };
}
