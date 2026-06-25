// =============================================
// ROADMAP NORMALIZER
// Single adapter that converts any valid imported
// roadmap JSON into the internal app format.
//
// Flow:
//   Raw JSON → validateRoadmapJSON() → normalizeRoadmap() → importRoadmap()
//
// Supports:
//   - Elliot JSON (months[].weeks)
//   - Mobile Dev JSON (months[].weeks)
//   - Backend Dev JSON (months[].weeks)
//   - One Piece Backend Sprint (months[].weeks + programStats)
//   - Future JSON with flat weeks[] array
// =============================================

// ─── Slug helper ─────────────────────────────────────────────────────────────
function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

// ─── getRoadmapId ────────────────────────────────────────────────────────────
/**
 * Generate a deterministic, stable roadmap ID from identifying fields.
 * Used to namespace all per-roadmap progress keys in localStorage.
 *
 * @param {object} raw - Raw or partially normalised roadmap JSON
 * @returns {string} e.g. "one-piece-figure-vending-backend-sprint-1-0-0"
 */
export function getRoadmapId(raw) {
  if (!raw) return 'default-roadmap';

  const title =
    raw.bootcamp?.bootcampTitle ||
    raw.bootcamp?.title ||
    raw.bootcampTitle ||
    raw.title ||
    'roadmap';

  const version = raw.version || raw.schemaVersion || '1.0';
  const date = raw.generatedOn || '';

  return slugify(`${title}-${version}${date ? '-' + date : ''}`);
}

// ─── getDerivedDuration ──────────────────────────────────────────────────────
/**
 * Derive duration metadata from any roadmap JSON.
 * Priority:
 *   1. programStats.totalWeeks / programStats.totalMonths
 *   2. Length of normalized weeks array
 *   3. Count weeks inside months[].weeks
 *   4. durationDays if explicit
 *   5. totalDays = totalWeeks * 7 as fallback
 *
 * @param {object} raw - Raw roadmap JSON
 * @param {Array}  normalizedWeeks - Already-merged weeks array (optional)
 * @returns {{ totalWeeks, totalMonths, totalDays, durationLabel, weeklyHours }}
 */
export function getDerivedDuration(raw, normalizedWeeks) {
  const stats = raw?.programStats || {};

  // Total weeks
  let totalWeeks = null;
  if (typeof stats.totalWeeks === 'number') {
    totalWeeks = stats.totalWeeks;
  } else if (Array.isArray(normalizedWeeks) && normalizedWeeks.length > 0) {
    totalWeeks = normalizedWeeks.length;
  } else if (Array.isArray(raw?.months)) {
    totalWeeks = raw.months.reduce((acc, m) => acc + (m.weeks?.length || 0), 0);
  } else if (Array.isArray(raw?.weeks)) {
    totalWeeks = raw.weeks.length;
  }
  if (!totalWeeks || totalWeeks < 1) totalWeeks = 24; // final fallback

  // Total months
  let totalMonths = null;
  if (typeof stats.totalMonths === 'number') {
    totalMonths = stats.totalMonths;
  } else if (Array.isArray(raw?.months)) {
    totalMonths = raw.months.length;
  } else {
    totalMonths = Math.ceil(totalWeeks / 4);
  }

  // Total days
  let totalDays = null;
  if (typeof raw?.durationDays === 'number') {
    totalDays = raw.durationDays;
  } else {
    totalDays = totalWeeks * 7;
  }

  // Human label
  const rawLabel =
    raw?.bootcamp?.duration ||
    raw?.duration ||
    `${totalWeeks} week${totalWeeks !== 1 ? 's' : ''}`;
  const durationLabel = rawLabel;

  const weeklyHours =
    raw?.bootcamp?.weeklyHours ||
    raw?.weeklyHours ||
    (stats.weeklyHoursMin && stats.weeklyHoursMax
      ? `${stats.weeklyHoursMin}-${stats.weeklyHoursMax} hours`
      : '15-20 hours');

  return { totalWeeks, totalMonths, totalDays, durationLabel, weeklyHours };
}

// ─── normalizeWeek ───────────────────────────────────────────────────────────
/**
 * Normalize a single raw week object into the canonical internal shape.
 * Supports any field name variation across different JSON schemas.
 *
 * Canonical output fields:
 *   studyResources, skillCheck, practicalMissions, proofOfWork,
 *   reflectionPrompts, unlockCriteria, scheduledSessions, tasks
 *
 * Also sets backward-compatible aliases:
 *   resources = studyResources
 *   sessions  = scheduledSessions
 *
 * @param {object} rawWeek - Raw week object from JSON
 * @param {object} parentMonth - The month this week belongs to
 * @returns {object} Normalized week
 */
export function normalizeWeek(rawWeek, parentMonth) {
  if (!rawWeek || typeof rawWeek !== 'object') return rawWeek;

  // ── Study Resources ───────────────────────────────────────────────────────
  const studyResources =
    Array.isArray(rawWeek.studyResources) ? rawWeek.studyResources :
    Array.isArray(rawWeek.resources)       ? rawWeek.resources :
    Array.isArray(rawWeek.resourcesBeforeTask) ? rawWeek.resourcesBeforeTask :
    Array.isArray(rawWeek.study)           ? rawWeek.study :
    [];

  // ── Skill Check ───────────────────────────────────────────────────────────
  // May be: an array of {question, ...} or a single object or a plain string
  const skillCheck =
    Array.isArray(rawWeek.skillCheck)  ? rawWeek.skillCheck :
    rawWeek.skillCheck                 ? [rawWeek.skillCheck] :
    Array.isArray(rawWeek.checkpoint)  ? rawWeek.checkpoint :
    rawWeek.checkpoint                 ? [{ question: rawWeek.checkpoint }] :
    [];

  // ── Practical Missions ────────────────────────────────────────────────────
  const practicalMissions =
    Array.isArray(rawWeek.practicalMissions) ? rawWeek.practicalMissions :
    Array.isArray(rawWeek.missions)          ? rawWeek.missions :
    Array.isArray(rawWeek.buildTasks)        ? rawWeek.buildTasks :
    Array.isArray(rawWeek.practicalTasks)    ? rawWeek.practicalTasks :
    [];

  // Ensure each mission has a stable missionId
  const normalizedMissions = practicalMissions.map((m, idx) => {
    if (!m || typeof m !== 'object') return m;
    return {
      ...m,
      missionId: m.missionId || m.id || `${rawWeek.weekId || rawWeek.weekNumber}-pm-${idx}`,
    };
  });

  // ── Proof of Work ─────────────────────────────────────────────────────────
  const proofOfWork =
    Array.isArray(rawWeek.proofOfWork)     ? rawWeek.proofOfWork :
    Array.isArray(rawWeek.proof)           ? rawWeek.proof :
    Array.isArray(rawWeek.deliverables)    ? rawWeek.deliverables :
    [];

  // ── Reflection Prompts ────────────────────────────────────────────────────
  const reflectionPrompts =
    Array.isArray(rawWeek.reflectionPrompts) ? rawWeek.reflectionPrompts :
    Array.isArray(rawWeek.reflection)        ? rawWeek.reflection :
    Array.isArray(rawWeek.reflections)       ? rawWeek.reflections :
    rawWeek.reflectionPrompt                 ? [rawWeek.reflectionPrompt] :
    [];

  // ── Unlock Criteria ───────────────────────────────────────────────────────
  const unlockCriteria =
    Array.isArray(rawWeek.unlockCriteria)      ? rawWeek.unlockCriteria :
    Array.isArray(rawWeek.unlock)              ? rawWeek.unlock :
    Array.isArray(rawWeek.completionCriteria)  ? rawWeek.completionCriteria :
    [];

  // ── Scheduled Sessions ────────────────────────────────────────────────────
  const scheduledSessions =
    Array.isArray(rawWeek.scheduledSessions) ? rawWeek.scheduledSessions :
    Array.isArray(rawWeek.sessions)          ? rawWeek.sessions :
    [];

  // ── Frontend Integration ──────────────────────────────────────────────────
  const frontendIntegration =
    Array.isArray(rawWeek.frontendIntegration) ? rawWeek.frontendIntegration :
    rawWeek.frontendIntegration                ? [rawWeek.frontendIntegration] :
    [];

  // ── Unified tasks array for backward-compatible progress tracking ─────────
  // Generates week.tasks by merging existing tasks + practical missions.
  // This fixes the 0/0 task count for JSON files that use practicalMissions
  // instead of a flat tasks[] array.
  const existingTasks = Array.isArray(rawWeek.tasks) ? rawWeek.tasks : [];

  // Represent each practical mission as a "task" stub for legacy progress tracking
  const missionAsTasks = normalizedMissions.map((m) => ({
    text: m.title || m.objective || `Mission ${m.missionId}`,
    missionId: m.missionId,
    type: 'practicalMission',
  }));

  // Deduplicate: if a task text already matches a mission title, skip
  const existingTaskTexts = new Set(existingTasks.map((t) =>
    typeof t === 'string' ? t : (t?.text || t?.title || '')
  ));
  const uniqueMissionTasks = missionAsTasks.filter(
    (m) => !existingTaskTexts.has(m.text)
  );

  const unifiedTasks = [...existingTasks, ...uniqueMissionTasks];

  // ── Preserved display fields ───────────────────────────────────────────────
  const goal =
    rawWeek.goal ||
    rawWeek.objective ||
    rawWeek.briefing ||
    rawWeek.minimumMission ||
    '';

  const displayLabel =
    rawWeek.displayLabel ||
    (rawWeek.weekNumber ? `Week ${rawWeek.weekNumber}` : '');

  const monthId = parentMonth?.monthId || rawWeek.monthId || null;
  const monthNumber = parentMonth?.monthNumber || rawWeek.monthNumber || null;

  return {
    // Identity
    id: rawWeek.weekId || rawWeek.id || `w${rawWeek.weekNumber}`,
    weekId: rawWeek.weekId || rawWeek.id || `w${rawWeek.weekNumber}`,
    weekNumber: rawWeek.weekNumber,
    monthId,
    monthNumber,

    // Display
    title: rawWeek.title || `Week ${rawWeek.weekNumber}`,
    displayLabel,
    goal,
    objective: rawWeek.objective || rawWeek.goal || rawWeek.briefing || '',

    // Time metadata
    timeEstimate: rawWeek.timeEstimate || rawWeek.estimatedHours || rawWeek.hours || null,
    estimatedHours: rawWeek.estimatedHours || rawWeek.timeEstimate || null,
    estimatedData: rawWeek.estimatedData || rawWeek.dataEstimate || rawWeek.data || null,

    // ── Canonical fields (new JSON format) ───────────────────────────────────
    studyResources,
    skillCheck,
    practicalMissions: normalizedMissions,
    proofOfWork,
    reflectionPrompts,
    unlockCriteria,
    scheduledSessions,
    frontendIntegration,

    // ── Backward-compatible aliases ──────────────────────────────────────────
    resources: studyResources,       // old components read week.resources
    sessions: scheduledSessions,     // old components read week.sessions
    tasks: unifiedTasks,             // old progress tracking reads week.tasks
    checkpoint: skillCheck[0] || rawWeek.checkpoint || null, // old single-check readers

    // ── Preserved original fields (pass-through for unknown field display) ───
    briefing: rawWeek.briefing || goal,
    deliverable: rawWeek.deliverable || null,
    elliotConnection: rawWeek.elliotConnection || null,
    required: rawWeek.required,

    // Keep any extra fields for the "Additional Week Data" accordion
    _raw: rawWeek,
  };
}

// ─── normalizeRoadmap ────────────────────────────────────────────────────────
/**
 * Transform any valid raw roadmap JSON into the canonical internal format.
 * This is the single entry point used after validateRoadmapJSON() passes.
 *
 * Resulting shape:
 *   activeRoadmap = {
 *     id, schemaVersion, fileRole, version, title, shortTitle, track,
 *     learner, mentorLabel, durationLabel, weeklyHours, difficulty,
 *     coreMission, finalProductDefinition,
 *     totalWeeks, totalMonths, totalDays,
 *     months, weeks, projects, readinessCategories,
 *     defaultWeekFlow, localStorageKeys, sourceType,
 *     // backward-compat
 *     bootcampTitle, checkpoints, sideQuestLocks, uiHints
 *   }
 *
 * @param {object} raw - Raw imported JSON (already parsed)
 * @returns {object} Normalized roadmap object
 */
export function normalizeRoadmap(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('normalizeRoadmap: input must be a non-null object');
  }

  const bootcamp = raw.bootcamp || {};

  // ── Title resolution (priority order per spec) ────────────────────────────
  const title =
    bootcamp.bootcampTitle ||
    bootcamp.title ||
    raw.bootcampTitle ||
    raw.title ||
    raw.shortTitle ||
    'Imported Roadmap';

  const shortTitle =
    bootcamp.shortTitle ||
    raw.shortTitle ||
    bootcamp.bootcampTitle ||
    title ||
    'Command Center';

  // Final product / card title
  const finalProductDefinition =
    bootcamp.finalProductDefinition ||
    bootcamp.coreMission ||
    (Array.isArray(raw.projects) && raw.projects[0]?.title) ||
    bootcamp.bootcampTitle ||
    title ||
    'Active Roadmap';

  const coreMission =
    bootcamp.coreMission ||
    bootcamp.finalProductDefinition ||
    finalProductDefinition;

  // ── Learner / mentor fields ───────────────────────────────────────────────
  const learner =
    bootcamp.learner ||
    raw.learner ||
    'Student';

  const mentorLabel =
    bootcamp.mentorLabel ||
    raw.mentorLabel ||
    'Mentor';

  // ── Track / difficulty ────────────────────────────────────────────────────
  const track =
    bootcamp.track ||
    raw.track ||
    'General';

  const difficulty =
    bootcamp.difficulty ||
    raw.difficulty ||
    null;

  // ── Schema / version fields ───────────────────────────────────────────────
  const schemaVersion = raw.schemaVersion || 'xcelerate-bootcamp-schema-v1';
  const fileRole = raw.fileRole || 'main-importable-bootcamp-data';
  const version = raw.version || '1.0';
  const generatedOn = raw.generatedOn || null;

  // ── Roadmap ID (deterministic slug) ──────────────────────────────────────
  const id = getRoadmapId(raw);

  // ── defaultWeekFlow ───────────────────────────────────────────────────────
  const defaultWeekFlow = Array.isArray(raw.defaultWeekFlow)
    ? raw.defaultWeekFlow
    : [
        'Study Resources',
        'Skill Check',
        'Practical Missions',
        'Proof of Work',
        'Reflection',
        'Unlock Next Week',
      ];

  // ── localStorageKeys ──────────────────────────────────────────────────────
  const localStorageKeys = raw.localStorageKeys || {};

  // ── Flatten and merge weeks ───────────────────────────────────────────────
  // Priority: months[].weeks first, then flat weeks[], deduplicate by weekId
  const weekMap = new Map(); // keyed by weekId or weekNumber

  // 1. From months[].weeks
  const rawMonths = Array.isArray(raw.months) ? raw.months : [];
  rawMonths.forEach((month, mi) => {
    const m = {
      ...month,
      monthNumber: month.monthNumber || (mi + 1),
    };
    if (Array.isArray(month.weeks)) {
      month.weeks.forEach((rawWeek, wi) => {
        const w = normalizeWeek(
          { ...rawWeek, weekNumber: rawWeek.weekNumber || (wi + 1) },
          m
        );
        const key = w.weekId || `w${w.weekNumber}`;
        if (!weekMap.has(key)) {
          weekMap.set(key, w);
        }
      });
    }
  });

  // 2. From flat weeks[] (add only if not already present)
  if (Array.isArray(raw.weeks)) {
    raw.weeks.forEach((rawWeek, wi) => {
      const w = normalizeWeek(
        { ...rawWeek, weekNumber: rawWeek.weekNumber || (wi + 1) },
        null
      );
      const key = w.weekId || `w${w.weekNumber}`;
      if (!weekMap.has(key)) {
        weekMap.set(key, w);
      }
    });
  }

  // 3. Sort by weekNumber
  const weeks = Array.from(weekMap.values()).sort(
    (a, b) => (a.weekNumber || 0) - (b.weekNumber || 0)
  );

  // ── Normalize months (attach normalized weeks back) ───────────────────────
  const months = rawMonths.map((month, mi) => {
    const monthNumber = month.monthNumber || (mi + 1);
    const monthWeeks = weeks.filter((w) => w.monthNumber === monthNumber);
    return {
      ...month,
      monthNumber,
      weeks: monthWeeks.length > 0 ? monthWeeks : (month.weeks || []),
    };
  });

  // ── Duration metadata ─────────────────────────────────────────────────────
  const duration = getDerivedDuration(raw, weeks);

  // ── Readiness categories ──────────────────────────────────────────────────
  const readinessCategories = Array.isArray(raw.readinessCategories)
    ? raw.readinessCategories
    : [];

  // ── Projects ──────────────────────────────────────────────────────────────
  const projects = Array.isArray(raw.projects) ? raw.projects : [];

  // ── Checkpoints (old schema compat) ──────────────────────────────────────
  const checkpoints = Array.isArray(raw.checkpoints) ? raw.checkpoints : [];

  // ── Final backend scope / additional top-level data ───────────────────────
  const finalScope = raw.finalBackendScope || raw.finalScope || null;
  const programStats = raw.programStats || {};

  // ── Assembled normalized roadmap ──────────────────────────────────────────
  return {
    // Identity
    id,
    schemaVersion,
    fileRole,
    version,
    generatedOn,

    // Human-readable labels
    title,
    shortTitle,
    track,
    learner,
    mentorLabel,
    difficulty,
    coreMission,
    finalProductDefinition,

    // Duration (dynamic, not hardcoded)
    ...duration,  // totalWeeks, totalMonths, totalDays, durationLabel, weeklyHours

    // Data
    months,
    weeks,
    projects,
    readinessCategories,
    checkpoints,

    // Config
    defaultWeekFlow,
    localStorageKeys,
    programStats,
    finalScope,

    // Source type for debugging
    sourceType: raw.schemaVersion ? 'xcelerate-schema' : 'custom',

    // ── Backward-compat aliases ──────────────────────────────────────────────
    // Old components read roadmap.bootcampTitle directly
    bootcampTitle: title,
    // Old components read roadmap.learner directly
    // (learner already set above)
    duration: duration.durationLabel,
    sideQuestLocks: raw.sideQuestLocks || {},
    uiHints: raw.uiHints || {},

    // Expose the raw bootcamp sub-object for components that may need it
    bootcamp: raw.bootcamp || null,
  };
}
