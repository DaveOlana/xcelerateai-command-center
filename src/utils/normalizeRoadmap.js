// =============================================
// ROADMAP NORMALIZER
// Single adapter that converts any valid imported
// roadmap JSON into the internal app format.
//
// Flow:
//   Raw JSON → validateRoadmapJSON() → normalizeRoadmap() → importRoadmap()
//
// Supports:
//   - Elliot / Mobile / Backend JSON  (months[].weeks with embedded week objects)
//   - One Piece Backend Sprint         (months[].weeks + programStats)
//   - Cloud Engineering JSON           (flat weeks[] with month: number + weekIds in months)
//   - Future: months[].modules, months[].topics, months[].sessions, etc.
//   - Month-level roadmaps             (no week children → generate 4 synthetic weeks per month)
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
 */
export function getRoadmapId(raw) {
  if (!raw) return 'default-roadmap';

  const title =
    raw.bootcamp?.bootcampTitle ||
    raw.bootcamp?.title ||
    raw.bootcampTitle ||
    raw.title ||
    raw.id ||
    'roadmap';

  const version = raw.version || raw.schemaVersion || '1.0';
  const date = raw.generatedOn || raw.createdAt || '';

  return slugify(`${title}-${version}${date ? '-' + date.slice(0, 10) : ''}`);
}

// ─── getDerivedDuration ──────────────────────────────────────────────────────
/**
 * Derive duration metadata from any roadmap JSON.
 */
export function getDerivedDuration(raw, normalizedWeeks) {
  const stats = raw?.programStats || {};
  const opProfile = raw?.operatorProfile || {};

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
  if (!totalWeeks || totalWeeks < 1) totalWeeks = 24;

  // Total months
  let totalMonths = null;
  if (typeof stats.totalMonths === 'number') {
    totalMonths = stats.totalMonths;
  } else if (typeof opProfile.expectedDurationMonths === 'number') {
    totalMonths = opProfile.expectedDurationMonths;
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
    (totalMonths > 1 ? `${totalMonths} months` : `${totalWeeks} weeks`);
  const durationLabel = rawLabel;

  const weeklyHours =
    raw?.bootcamp?.weeklyHours ||
    raw?.weeklyHours ||
    opProfile.recommendedWeeklyHours ||
    (stats.weeklyHoursMin && stats.weeklyHoursMax
      ? `${stats.weeklyHoursMin}-${stats.weeklyHoursMax} hours`
      : '15-20 hours');

  return { totalWeeks, totalMonths, totalDays, durationLabel, weeklyHours };
}

// ─── Learner fallback helper ─────────────────────────────────────────────────
export function getLearnerFallback() {
  if (typeof localStorage !== 'undefined') {
    try {
      const profile = JSON.parse(localStorage.getItem('xca_profile') || localStorage.getItem('profile') || '{}');
      if (profile.displayName) return profile.displayName;
      if (profile.name) return profile.name;
    } catch (e) {}
    try {
      const settings = JSON.parse(localStorage.getItem('xca_settings') || '{}');
      if (settings.learnerName) return settings.learnerName;
      if (settings.name) return settings.name;
    } catch (e) {}
  }
  return 'Student';
}

// ─── Resource resolution helpers ─────────────────────────────────────────────
/**
 * Resolve a study resources array from any raw week/item.
 * Handles:
 *   - Array of resource objects  (One Piece / Elliot style)
 *   - Array of resource ID strings (Cloud Engineering style — resolved via catalogue)
 *   - Various field name aliases
 */
function resolveStudyResources(item, resourceCatalogue) {
  const raw =
    Array.isArray(item.studyResources)       ? item.studyResources :
    Array.isArray(item.resources)            ? item.resources :
    Array.isArray(item.resourcesBeforeTask)  ? item.resourcesBeforeTask :
    Array.isArray(item.learningResources)    ? item.learningResources :
    Array.isArray(item.materials)            ? item.materials :
    Array.isArray(item.links)               ? item.links :
    Array.isArray(item.readings)             ? item.readings :
    Array.isArray(item.videos)              ? item.videos :
    Array.isArray(item.recommendedResources) ? item.recommendedResources :
    Array.isArray(item.study)               ? item.study :
    [];

  if (raw.length === 0) return [];

  // If items are strings, try to resolve them from the resource catalogue
  return raw.map((r, idx) => {
    if (typeof r === 'string') {
      // It's a resource ID — look it up in catalogue
      const found = resourceCatalogue[r];
      if (found) return { ...found, id: r, title: found.title || found.name || r };
      // No match — create a stub
      return { id: r, title: r, type: 'Reference', url: '#' };
    }
    if (typeof r === 'object' && r !== null) {
      return {
        ...r,
        title: r.title || r.name || r.label || `Resource ${idx + 1}`,
        type: r.type || r.resourceType || r.kind || 'Resource',
        url: r.url || r.link || r.href || '#',
      };
    }
    return { title: String(r), type: 'Reference', url: '#' };
  });
}

/**
 * Resolve a skill check array from any raw week/item.
 */
function resolveSkillCheck(item) {
  const raw =
    Array.isArray(item.skillCheck)    ? item.skillCheck :
    item.skillCheck                   ? [item.skillCheck] :
    Array.isArray(item.skillChecks)   ? item.skillChecks :
    Array.isArray(item.quiz)          ? item.quiz :
    item.quiz                         ? [item.quiz] :
    Array.isArray(item.quizzes)       ? item.quizzes :
    Array.isArray(item.questions)     ? item.questions :
    Array.isArray(item.checkQuestions) ? item.checkQuestions :
    Array.isArray(item.checkpoint)    ? item.checkpoint :
    item.checkpoint                   ? [{ question: typeof item.checkpoint === 'string' ? item.checkpoint : (item.checkpoint?.prompt || '') }] :
    // Cloud Engineering uses outcomes as skill check prompts
    Array.isArray(item.outcomes)      ? item.outcomes.map(o => ({ question: o })) :
    [];

  return raw.map(q => {
    if (typeof q === 'string') return { question: q };
    if (typeof q === 'object' && q !== null) return q;
    return { question: String(q) };
  });
}

/**
 * Resolve a practical missions array from any raw week/item.
 */
function resolvePracticalMissions(item, weekId) {
  const raw =
    Array.isArray(item.practicalMissions) ? item.practicalMissions :
    Array.isArray(item.missions)          ? item.missions :
    Array.isArray(item.buildTasks)        ? item.buildTasks :
    Array.isArray(item.practicalTasks)    ? item.practicalTasks :
    Array.isArray(item.assignments)       ? item.assignments :
    Array.isArray(item.exercises)         ? item.exercises :
    Array.isArray(item.labs)              ? item.labs :
    Array.isArray(item.builds)            ? item.builds :
    // Cloud Engineering: synthesize from proofOfWork string + outcomes
    [];

  // If still empty and we have a proofOfWork string, create a synthetic mission
  if (raw.length === 0 && item.proofOfWork && typeof item.proofOfWork === 'string') {
    return [{
      missionId: `${weekId}-pm-0`,
      title: 'Weekly Proof Mission',
      objective: item.proofOfWork,
      difficulty: 'Main Build',
      required: true,
      evidenceRequired: true,
    }];
  }

  return raw.map((m, idx) => {
    if (typeof m === 'string') {
      return {
        missionId: `${weekId}-pm-${idx}`,
        title: m,
        objective: m,
        difficulty: 'Standard',
      };
    }
    return {
      ...m,
      missionId: m.missionId || m.id || `${weekId}-pm-${idx}`,
    };
  });
}

/**
 * Resolve proof of work array from any raw week/item.
 * Normalises both string and array variants.
 */
function resolveProofOfWork(item) {
  if (Array.isArray(item.proofOfWork))   return item.proofOfWork;
  if (typeof item.proofOfWork === 'string' && item.proofOfWork.trim()) {
    return [item.proofOfWork];
  }
  if (Array.isArray(item.proof))         return item.proof;
  if (typeof item.proof === 'string' && item.proof.trim()) return [item.proof];
  if (Array.isArray(item.deliverables))  return item.deliverables;
  if (Array.isArray(item.submission))    return item.submission;
  if (Array.isArray(item.evidence))      return item.evidence;
  return [];
}

/**
 * Resolve reflection prompts from any raw week/item.
 */
function resolveReflectionPrompts(item) {
  if (Array.isArray(item.reflectionPrompts)) return item.reflectionPrompts;
  if (Array.isArray(item.reflection))        return item.reflection;
  if (Array.isArray(item.reflections))       return item.reflections;
  if (item.reflectionPrompt)                 return [item.reflectionPrompt];
  if (Array.isArray(item.reviewQuestions))   return item.reviewQuestions;
  return [];
}

/**
 * Resolve scheduled sessions from any raw week/item.
 */
function resolveScheduledSessions(item) {
  if (Array.isArray(item.scheduledSessions)) return item.scheduledSessions;
  if (Array.isArray(item.sessions))          return item.sessions;
  if (Array.isArray(item.studySessions))     return item.studySessions;
  if (Array.isArray(item.timeBlocks))        return item.timeBlocks;
  if (Array.isArray(item.focusBlocks))       return item.focusBlocks;
  return [];
}

/**
 * Resolve unlock criteria (object or array).
 */
function resolveUnlockCriteria(item) {
  if (Array.isArray(item.unlockCriteria))     return item.unlockCriteria;
  if (item.unlockCriteria && typeof item.unlockCriteria === 'object') {
    return [item.unlockCriteria];
  }
  if (Array.isArray(item.unlock))             return item.unlock;
  if (Array.isArray(item.completionCriteria)) return item.completionCriteria;
  return [];
}

// ─── normalizeWeek ───────────────────────────────────────────────────────────
/**
 * Normalize a single raw week/module/topic/session object into the canonical
 * internal shape, resolving field name variations across JSON schemas.
 *
 * @param {object} rawWeek        - Raw week/item from JSON
 * @param {object} parentMonth    - The parent month context (optional)
 * @param {object} resourceCatalogue - Map of resourceId → resource object (optional)
 * @returns {object} Normalized week
 */
export function normalizeWeek(rawWeek, parentMonth, resourceCatalogue = {}) {
  if (!rawWeek || typeof rawWeek !== 'object') return null;

  const weekIdRaw = rawWeek.weekId || rawWeek.id || null;
  const weekNumRaw = rawWeek.weekNumber || rawWeek.weekNum || rawWeek.number || null;
  const weekId = weekIdRaw || `w${weekNumRaw}`;

  // ── Month association ─────────────────────────────────────────────────────
  // Cloud Engineering uses `month` (number), not monthId/monthNumber
  const monthNumber =
    parentMonth?.monthNumber ||
    rawWeek.monthNumber ||
    (typeof rawWeek.month === 'number' ? rawWeek.month : null) ||
    (typeof rawWeek.monthNum === 'number' ? rawWeek.monthNum : null) ||
    null;
  const monthId = parentMonth?.id || parentMonth?.monthId || rawWeek.monthId || null;

  // ── Title / goal ──────────────────────────────────────────────────────────
  const title =
    rawWeek.title ||
    rawWeek.name ||
    rawWeek.topic ||
    rawWeek.moduleTitle ||
    rawWeek.weekTitle ||
    `Week ${weekNumRaw || '?'}`;

  const goal =
    rawWeek.goal ||
    rawWeek.objective ||
    rawWeek.description ||
    rawWeek.summary ||
    rawWeek.outcome ||
    rawWeek.briefing ||
    rawWeek.minimumMission ||
    '';

  // ── Canonical learning data ───────────────────────────────────────────────
  const studyResources = resolveStudyResources(rawWeek, resourceCatalogue);
  const skillCheck     = resolveSkillCheck(rawWeek);
  const proofOfWork    = resolveProofOfWork(rawWeek);
  const rawReflectionPrompts = resolveReflectionPrompts(rawWeek);
  const rawScheduledSessions = resolveScheduledSessions(rawWeek);
  const unlockCriteria = resolveUnlockCriteria(rawWeek);
  const practicalMissions = resolvePracticalMissions(rawWeek, weekId);

  let reflectionPrompts = rawReflectionPrompts;
  let generatedReflectionPrompts = false;
  if (reflectionPrompts.length === 0) {
    reflectionPrompts = [
      "What did you study this week?",
      "What did you build or practice this week?",
      "What confused you or slowed you down?",
      "What proof of work did you produce?",
      "What should you improve next week?"
    ];
    generatedReflectionPrompts = true;
  }

  let scheduledSessions = rawScheduledSessions;
  let generatedScheduledSessions = false;
  if (scheduledSessions.length === 0) {
    let studyMin = 120;
    if (studyResources.length > 4) {
      studyMin += (studyResources.length - 4) * 20;
    }
    const sessions = [
      {
        title: "Study Resources",
        durationMinutes: studyMin
      },
      {
        title: "Skill Check",
        durationMinutes: 45
      }
    ];
    if (practicalMissions.length > 0) {
      sessions.push({
        title: "Practical Mission",
        durationMinutes: 180
      });
    }
    sessions.push({
      title: "Proof of Work and Reflection",
      durationMinutes: 90
    });
    scheduledSessions = sessions;
    generatedScheduledSessions = true;
  }

  // ── Unified tasks for backward-compat progress tracking ───────────────────
  const existingTasks = Array.isArray(rawWeek.tasks) ? rawWeek.tasks : [];
  const missionAsTasks = practicalMissions.map((m) => ({
    text: m.title || m.objective || `Mission ${m.missionId}`,
    missionId: m.missionId,
    type: 'practicalMission',
  }));
  const existingTexts = new Set(existingTasks.map(t =>
    typeof t === 'string' ? t : (t?.text || t?.title || '')
  ));
  const uniqueMissionTasks = missionAsTasks.filter(m => !existingTexts.has(m.text));
  const unifiedTasks = [...existingTasks, ...uniqueMissionTasks];

  // ── Frontend integration (Elliot-specific pass-through) ───────────────────
  const frontendIntegration =
    Array.isArray(rawWeek.frontendIntegration) ? rawWeek.frontendIntegration :
    rawWeek.frontendIntegration                ? [rawWeek.frontendIntegration] :
    [];

  return {
    // Identity
    id: weekId,
    weekId,
    weekNumber: weekNumRaw,
    monthId,
    monthNumber,

    // Display
    title,
    displayLabel: rawWeek.displayLabel || `Week ${weekNumRaw || '?'}`,
    goal,
    objective: rawWeek.objective || rawWeek.goal || rawWeek.description || goal,
    summary: rawWeek.summary || goal,

    // Time metadata
    timeEstimate: rawWeek.timeEstimate || rawWeek.estimatedHours || rawWeek.hours || null,
    estimatedHours: rawWeek.estimatedHours || rawWeek.timeEstimate || null,
    estimatedData: rawWeek.estimatedData || rawWeek.dataEstimate || rawWeek.data || null,

    // Skills (Cloud Engineering specific, passes through for display)
    skills: Array.isArray(rawWeek.skills) ? rawWeek.skills : [],

    // ── Canonical fields ────────────────────────────────────────────────────
    studyResources,
    skillCheck,
    practicalMissions,
    proofOfWork,
    reflectionPrompts,
    generatedReflectionPrompts,
    unlockCriteria,
    scheduledSessions,
    generatedScheduledSessions,
    frontendIntegration,

    // ── Backward-compatible aliases ─────────────────────────────────────────
    resources: studyResources,
    sessions: scheduledSessions,
    tasks: unifiedTasks,
    checkpoint: skillCheck[0] || rawWeek.checkpoint || null,

    // ── Pass-through display fields ─────────────────────────────────────────
    briefing: rawWeek.briefing || goal,
    deliverable: rawWeek.deliverable || null,
    elliotConnection: rawWeek.elliotConnection || null,
    required: rawWeek.required,
    status: rawWeek.status || 'active',

    // Raw reference (for "Additional Week Data" accordion)
    _raw: rawWeek,
  };
}

// ─── extractMonthChildren ────────────────────────────────────────────────────
/**
 * Extract week-like children from a month using all supported field names.
 * Returns { items, fieldUsed, conversionType }
 *
 * conversionType values:
 *   'embedded-weeks'  - month.weeks had embedded week objects
 *   'id-references'   - month.weekIds references flat weeks (resolved externally)
 *   'alternate-field' - month.modules / .topics / .sessions / etc.
 *   'generated'       - month had no week children; synthetic weeks were generated
 *   'none'            - month had no usable learning data
 */
function extractMonthChildren(month) {
  // 1. Standard embedded weeks
  if (Array.isArray(month.weeks) && month.weeks.length > 0) {
    return { items: month.weeks, fieldUsed: 'weeks', conversionType: 'embedded-weeks' };
  }
  // 2. ID references (Cloud Engineering: weekIds) — signal to resolve from flat weeks[]
  if (Array.isArray(month.weekIds) && month.weekIds.length > 0) {
    return { items: [], fieldUsed: 'weekIds', conversionType: 'id-references', weekIds: month.weekIds };
  }
  // 3. Alternate week-like child arrays
  const alternates = [
    'weeklyPlan', 'weeklySchedule', 'curriculumWeeks', 'learningWeeks',
    'modules', 'units', 'lessons', 'topics', 'sessions', 'milestones',
  ];
  for (const field of alternates) {
    if (Array.isArray(month[field]) && month[field].length > 0) {
      return { items: month[field], fieldUsed: field, conversionType: 'alternate-field' };
    }
  }
  return { items: [], fieldUsed: null, conversionType: 'none' };
}

/**
 * Generate synthetic weeks from a month's top-level learning data
 * when the month has no week-like children.
 * Creates 4 canonical phase-based weeks.
 */
function generateSyntheticWeeks(month, monthNumber, baseWeekNumber, resourceCatalogue) {
  const phases = [
    { label: 'Foundation',      goal: 'Learn and explore foundational concepts.' },
    { label: 'Core Practice',   goal: 'Practice core skills with hands-on exercises.' },
    { label: 'Build / Apply',   goal: 'Build and apply knowledge through projects.' },
    { label: 'Proof / Review',  goal: 'Produce proof of work and review progress.' },
  ];

  // Gather all resources / tasks at the month level
  const allResources = resolveStudyResources(month, resourceCatalogue);
  const allProof = resolveProofOfWork(month);
  const allReflections = resolveReflectionPrompts(month);

  const chunked = (arr, n) => {
    if (!arr.length) return Array(n).fill([]);
    const size = Math.ceil(arr.length / n);
    return Array.from({ length: n }, (_, i) => arr.slice(i * size, (i + 1) * size));
  };

  const resourceChunks = chunked(allResources, 4);
  const proofChunks    = chunked(allProof, 4);

  return phases.map((phase, pi) => {
    const weekNumber = baseWeekNumber + pi;
    const weekId = `${month.id || `m${monthNumber}`}-gen-w${pi + 1}`;
    const proofItems = proofChunks[pi].length > 0
      ? proofChunks[pi]
      : (pi === 3 ? allProof : []);

    const practicalMissions = proofItems.length > 0 ? [{
      missionId: `${weekId}-pm-0`,
      title: `${phase.label} Mission`,
      objective: typeof proofItems[0] === 'string' ? proofItems[0] : (month.summary || phase.goal),
      difficulty: pi === 3 ? 'Main Build' : 'Standard',
      required: pi >= 2,
      evidenceRequired: pi === 3,
    }] : [];

    return normalizeWeek({
      id: weekId,
      weekNumber,
      month: monthNumber,
      title: `${month.title} — ${phase.label}`,
      summary: month.summary || '',
      goal: phase.goal,
      studyResources: resourceChunks[pi],
      proofOfWork: proofItems,
      reflectionPrompts: pi === 3 ? allReflections : [],
      practicalMissions,
      unlockCriteria: pi > 0 ? [{ requiresPreviousWeekComplete: true }] : [],
    }, { monthNumber, id: month.id, monthId: month.id }, resourceCatalogue);
  });
}

// ─── normalizeRoadmap ────────────────────────────────────────────────────────
/**
 * Transform any valid raw roadmap JSON into the canonical internal format.
 * This is the single entry point used after validateRoadmapJSON() passes.
 */
export function normalizeRoadmap(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('normalizeRoadmap: input must be a non-null object');
  }

  const bootcamp = raw.bootcamp || {};

  // ── Title resolution ──────────────────────────────────────────────────────
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

  const learner  = bootcamp.learner  || raw.learner  || getLearnerFallback();
  const mentorLabel = bootcamp.mentorLabel || raw.mentorLabel || 'Mentor';
  const track    = bootcamp.track    || raw.track    || raw.roadmapType || 'General';
  const difficulty = bootcamp.difficulty || raw.difficulty || null;

  const schemaVersion = raw.schemaVersion || 'xcelerate-bootcamp-schema-v1';
  const fileRole      = raw.fileRole || 'main-importable-bootcamp-data';
  const version       = raw.version || '1.0';
  const generatedOn   = raw.generatedOn || raw.createdAt || null;

  const id = getRoadmapId(raw);

  const defaultWeekFlow = Array.isArray(raw.defaultWeekFlow)
    ? raw.defaultWeekFlow
    : ['Study Resources', 'Skill Check', 'Practical Missions', 'Proof of Work', 'Reflection', 'Unlock Next Week'];

  const localStorageKeys = raw.localStorageKeys || {};

  // ── Build resource catalogue from top-level or nested sources ────────────
  // Cloud Engineering uses a top-level resource catalogue referenced by ID.
  // Keys: resourceId → resource object
  const resourceCatalogue = {};

  // Try various catalogue field names
  const rawCatalogue =
    raw.resourceCatalogue ||
    raw.resources ||
    raw.resourceLibrary ||
    raw.resourceDatabase ||
    null;

  if (Array.isArray(rawCatalogue)) {
    rawCatalogue.forEach(r => {
      if (r && (r.id || r.resourceId)) {
        resourceCatalogue[r.id || r.resourceId] = r;
      }
    });
  } else if (rawCatalogue && typeof rawCatalogue === 'object') {
    Object.assign(resourceCatalogue, rawCatalogue);
  }

  // ── Build flat weeks map from top-level weeks[] (e.g., Cloud Engineering) ─
  // Key: week.id or week.weekId → raw week
  const flatWeekById = new Map();
  if (Array.isArray(raw.weeks)) {
    raw.weeks.forEach(w => {
      if (w && (w.id || w.weekId)) {
        flatWeekById.set(w.id || w.weekId, w);
      }
    });
  }

  // ── Process months and extract / assign weeks ─────────────────────────────
  let rawMonths = Array.isArray(raw.months) ? [...raw.months] : [];
  if (rawMonths.length === 0 && flatWeekById.size > 0) {
    const monthCount = Math.ceil(flatWeekById.size / 4);
    for (let m = 1; m <= monthCount; m++) {
      rawMonths.push({
        id: `m${m}`,
        monthNumber: m,
        title: `Month ${m}`,
        summary: `Month ${m} study plans and objectives.`,
        weekIds: Array.from(flatWeekById.keys()).slice((m - 1) * 4, m * 4),
      });
    }
  }
  const weekMap = new Map(); // keyed by weekId for deduplication
  let generatedWeekOffset = 0; // track base week number for generated weeks
  const monthConversionLog = []; // for diagnostics

  rawMonths.forEach((month, mi) => {
    const monthNumber = month.monthNumber || (mi + 1);
    const m = { ...month, monthNumber };

    const { items, fieldUsed, conversionType, weekIds } = extractMonthChildren(month);

    if (conversionType === 'id-references') {
      // Cloud Engineering: month has weekIds[] that reference flat weeks[]
      const baseWeekNum = (mi * 4) + 1;
      let resolved = 0;
      weekIds.forEach((wid, wi) => {
        const rawWeek = flatWeekById.get(wid);
        if (rawWeek) {
          flatWeekById.delete(wid); // mark as "claimed by a month"
          const weekNumber = rawWeek.weekNumber || (baseWeekNum + wi);
          const w = normalizeWeek(
            { ...rawWeek, weekNumber },
            m,
            resourceCatalogue
          );
          if (w && !weekMap.has(w.weekId)) {
            weekMap.set(w.weekId, w);
            resolved++;
          }
        }
      });
      monthConversionLog.push({
        monthNumber,
        title: month.title,
        conversionType,
        weeksFound: resolved,
        fieldUsed: 'weekIds',
        note: `Resolved ${resolved}/${weekIds.length} weeks from flat weeks[] by ID.`,
      });

    } else if (conversionType === 'embedded-weeks') {
      items.forEach((rawWeek, wi) => {
        const weekNumber = rawWeek.weekNumber || ((mi * 4) + wi + 1);
        const w = normalizeWeek({ ...rawWeek, weekNumber }, m, resourceCatalogue);
        if (w && !weekMap.has(w.weekId)) {
          weekMap.set(w.weekId, w);
        }
      });
      monthConversionLog.push({
        monthNumber, title: month.title, conversionType,
        weeksFound: items.length, fieldUsed,
        note: `${items.length} embedded weeks extracted from month.${fieldUsed}.`,
      });

    } else if (conversionType === 'alternate-field') {
      items.forEach((item, wi) => {
        const weekNumber = item.weekNumber || item.number || ((mi * 4) + wi + 1);
        const w = normalizeWeek({ ...item, weekNumber }, m, resourceCatalogue);
        if (w && !weekMap.has(w.weekId)) {
          weekMap.set(w.weekId, w);
        }
      });
      monthConversionLog.push({
        monthNumber, title: month.title,
        conversionType: 'alternate-field',
        weeksFound: items.length, fieldUsed,
        note: `Month ${monthNumber} converted from month.${fieldUsed} into ${items.length} weeks.`,
      });

    } else {
      // No week-like children — generate 4 synthetic weeks from month-level data
      const baseWeekNum = (mi * 4) + 1 + generatedWeekOffset;
      const hasLearningData = (
        resolveStudyResources(month, resourceCatalogue).length > 0 ||
        resolveProofOfWork(month).length > 0 ||
        month.summary || month.description || month.objective
      );

      if (hasLearningData) {
        const syntheticWeeks = generateSyntheticWeeks(month, monthNumber, baseWeekNum, resourceCatalogue);
        syntheticWeeks.forEach(w => {
          if (w && !weekMap.has(w.weekId)) weekMap.set(w.weekId, w);
        });
        monthConversionLog.push({
          monthNumber, title: month.title,
          conversionType: 'generated',
          weeksFound: syntheticWeeks.length, fieldUsed: null,
          note: `Month ${monthNumber} had no week children. Generated ${syntheticWeeks.length} synthetic weeks from month-level data.`,
        });
      } else {
        monthConversionLog.push({
          monthNumber, title: month.title,
          conversionType: 'none',
          weeksFound: 0, fieldUsed: null,
          note: `Month ${monthNumber} has no weeks/modules/topics/sessions that can be converted into weeks.`,
        });
      }
    }
  });

  // ── Add any remaining flat weeks not claimed by a month ───────────────────
  flatWeekById.forEach((rawWeek, wid) => {
    const weekNumber = rawWeek.weekNumber || weekMap.size + 1;

    // Find the matching month by the `month` field (Cloud Engineering uses this)
    const monthNum =
      rawWeek.monthNumber ||
      (typeof rawWeek.month === 'number' ? rawWeek.month : null) ||
      null;
    const parentM = monthNum
      ? rawMonths.find(m => (m.monthNumber || 0) === monthNum) || null
      : null;
    const parentMonthCtx = parentM
      ? { ...parentM, monthNumber: parentM.monthNumber || monthNum }
      : null;

    const w = normalizeWeek({ ...rawWeek, weekNumber }, parentMonthCtx, resourceCatalogue);
    if (w && !weekMap.has(w.weekId)) {
      weekMap.set(w.weekId, w);
    }
  });

  // ── Sort weeks by weekNumber ──────────────────────────────────────────────
  const weeks = Array.from(weekMap.values()).sort(
    (a, b) => (a.weekNumber || 0) - (b.weekNumber || 0)
  );

  // ── Rebuild months with normalized weeks attached ─────────────────────────
  const months = rawMonths.map((month, mi) => {
    const monthNumber = month.monthNumber || (mi + 1);
    const monthWeeks = weeks.filter(w => w.monthNumber === monthNumber);
    return {
      ...month,
      monthNumber,
      weeks: monthWeeks.length > 0 ? monthWeeks : [],
    };
  });

  // ── Duration metadata ─────────────────────────────────────────────────────
  const duration = getDerivedDuration(raw, weeks);

  // ── Readiness categories ──────────────────────────────────────────────────
  const readinessCategories = Array.isArray(raw.readinessCategories)
    ? raw.readinessCategories
    : [];

  // ── Projects ──────────────────────────────────────────────────────────────
  const projects = Array.isArray(raw.projects) ? raw.projects :
    Array.isArray(raw.certificationTargets) ? raw.certificationTargets :
    [];

  // ── Checkpoints ───────────────────────────────────────────────────────────
  const checkpoints = Array.isArray(raw.checkpoints) ? raw.checkpoints :
    Array.isArray(raw.certificationTargets) ? raw.certificationTargets :
    [];

  const finalScope = raw.finalBackendScope || raw.finalScope || null;
  const programStats = raw.programStats || {};

  return {
    // Identity
    id,
    schemaVersion,
    fileRole,
    version,
    generatedOn,

    // Labels
    title,
    shortTitle,
    track,
    learner,
    mentorLabel,
    difficulty,
    coreMission,
    finalProductDefinition,

    // Duration
    ...duration,

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

    // Diagnostics
    _conversionLog: monthConversionLog,

    // Source type
    sourceType: raw.schemaVersion ? 'xcelerate-schema' : 'custom',

    // Backward-compat aliases
    bootcampTitle: title,
    duration: duration.durationLabel,
    sideQuestLocks: raw.sideQuestLocks || {},
    uiHints: raw.uiHints || {},
    bootcamp: raw.bootcamp || null,
  };
}
