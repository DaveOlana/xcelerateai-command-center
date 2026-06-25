// =============================================
// JSON VALIDATOR
// Validates that an imported JSON file matches
// the expected XcelerateAI roadmap structure.
// Produces validation summary and warnings.
// Normalization is handled by normalizeRoadmap.js
// =============================================

/**
 * Validate the imported roadmap JSON.
 * Returns { valid, errors, warnings, summary }
 *
 * NOTE: normalizedData is no longer produced here.
 *   Call normalizeRoadmap(raw) separately for the normalized shape.
 */
export function validateRoadmapJSON(data) {
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      errors: ['Imported file is not a valid JSON object.'],
      warnings: [],
      summary: null,
      normalizedData: null,
    };
  }

  const errors = [];
  const warnings = [];

  // ── Schema Version Check ──────────────────────────────────────────────────
  if (!data.schemaVersion || data.schemaVersion !== 'xcelerate-bootcamp-schema-v1') {
    warnings.push('Schema version missing or unexpected. Attempting compatibility import.');
  }

  // ── Bootcamp Title Extraction ─────────────────────────────────────────────
  let bootcampTitle =
    data.bootcamp?.bootcampTitle ||
    data.bootcamp?.title ||
    data.bootcampTitle ||
    data.title ||
    '';

  let learner =
    data.bootcamp?.learner ||
    data.learner ||
    '';

  if (data.metadata && typeof data.metadata === 'object') {
    bootcampTitle = data.metadata.bootcampTitle || data.metadata.title || bootcampTitle;
    learner = data.metadata.learner || data.metadata.learnerName || learner;
  }

  if (!bootcampTitle || bootcampTitle.trim() === '') {
    bootcampTitle = 'XcelerateAI Bootcamp';
    warnings.push('Bootcamp title missing. Using default: XcelerateAI Bootcamp.');
  }
  if (!learner || learner.trim() === '') {
    learner = 'Student';
    warnings.push('Learner name missing. Using default: Student.');
  }

  // ── Core Structure Check ──────────────────────────────────────────────────
  const months = Array.isArray(data.months) ? data.months : [];
  const flatWeeks = Array.isArray(data.weeks) ? data.weeks : [];

  if (months.length === 0 && flatWeeks.length === 0) {
    errors.push('Missing both "months" array and "weeks" array. The file has no usable bootcamp structure.');
    return {
      valid: false,
      errors,
      warnings,
      summary: {
        bootcampTitle, learner,
        months: 0, weeks: 0,
        studyResources: 0, skillCheckQuestions: 0,
        practicalMissions: 0, proofItems: 0, reflectionPrompts: 0,
        scheduledSessions: 0, projects: 0, checkpoints: 0, readinessCategories: 0,
      },
      normalizedData: null,
    };
  }

  // ── Counters ──────────────────────────────────────────────────────────────
  let totalWeeks = 0;
  let totalStudyResources = 0;
  let totalSkillCheckQuestions = 0;
  let totalPracticalMissions = 0;
  let totalProofItems = 0;
  let totalReflectionPrompts = 0;
  let totalScheduledSessions = 0;
  const perWeekWarnings = [];

  // Helper to resolve study resources from any field name
  const resolveStudyResources = (week) => {
    if (Array.isArray(week.studyResources)) return week.studyResources;
    if (Array.isArray(week.resources)) return week.resources;
    if (Array.isArray(week.resourcesBeforeTask)) return week.resourcesBeforeTask;
    if (Array.isArray(week.study)) return week.study;
    return [];
  };

  const resolveSkillCheck = (week) => {
    if (Array.isArray(week.skillCheck)) return week.skillCheck;
    if (week.skillCheck) return [week.skillCheck];
    if (Array.isArray(week.checkpoint)) return week.checkpoint;
    if (week.checkpoint) return [week.checkpoint];
    return [];
  };

  const resolvePracticalMissions = (week) => {
    if (Array.isArray(week.practicalMissions)) return week.practicalMissions;
    if (Array.isArray(week.missions)) return week.missions;
    if (Array.isArray(week.buildTasks)) return week.buildTasks;
    if (Array.isArray(week.practicalTasks)) return week.practicalTasks;
    return [];
  };

  const resolveProofOfWork = (week) => {
    if (Array.isArray(week.proofOfWork)) return week.proofOfWork;
    if (Array.isArray(week.proof)) return week.proof;
    if (Array.isArray(week.deliverables)) return week.deliverables;
    return [];
  };

  const resolveReflectionPrompts = (week) => {
    if (Array.isArray(week.reflectionPrompts)) return week.reflectionPrompts;
    if (Array.isArray(week.reflection)) return week.reflection;
    if (Array.isArray(week.reflections)) return week.reflections;
    if (week.reflectionPrompt) return [week.reflectionPrompt];
    return [];
  };

  const resolveScheduledSessions = (week) => {
    if (Array.isArray(week.scheduledSessions)) return week.scheduledSessions;
    if (Array.isArray(week.sessions)) return week.sessions;
    return [];
  };

  // ── Validate weeks from months ────────────────────────────────────────────
  months.forEach((month, mi) => {
    const mNum = month.monthNumber || (mi + 1);
    if (!month.monthNumber) {
      warnings.push(`Month ${mi + 1}: Missing "monthNumber". Assigned: ${mNum}`);
    }
    if (!month.title) {
      warnings.push(`Month ${mi + 1}: Missing "title".`);
    }
    if (!Array.isArray(month.weeks) || month.weeks.length === 0) {
      warnings.push(`Month ${mNum} ("${month.title || 'Unnamed'}"): No weeks found.`);
      return;
    }

    month.weeks.forEach((week, wi) => {
      totalWeeks++;
      const wNum = week.weekNumber || totalWeeks;
      const wLabel = `Week ${wNum} (Month ${mNum})`;

      if (!week.weekNumber) {
        warnings.push(`${wLabel}: Missing "weekNumber". Assigned: ${wNum}`);
      }
      if (!week.title) {
        warnings.push(`${wLabel}: Missing "title".`);
      }

      const sr = resolveStudyResources(week);
      const sc = resolveSkillCheck(week);
      const pm = resolvePracticalMissions(week);
      const pow = resolveProofOfWork(week);
      const rp = resolveReflectionPrompts(week);
      const ss = resolveScheduledSessions(week);

      totalStudyResources += sr.length;
      totalSkillCheckQuestions += sc.length;
      totalPracticalMissions += pm.length;
      totalProofItems += pow.length;
      totalReflectionPrompts += rp.length;
      totalScheduledSessions += ss.length;

      // Per-week warnings
      if (sr.length === 0) perWeekWarnings.push(`${wLabel}: No study resources found.`);
      if (sc.length === 0) perWeekWarnings.push(`${wLabel}: No skill check questions found.`);
      if (pm.length === 0) perWeekWarnings.push(`${wLabel}: No practical missions found.`);
      if (pow.length === 0) perWeekWarnings.push(`${wLabel}: No proof of work requirements found.`);
      if (rp.length === 0) perWeekWarnings.push(`${wLabel}: No reflection prompts found.`);
      if (ss.length === 0) perWeekWarnings.push(`${wLabel}: No scheduled sessions found.`);
    });
  });

  // ── Validate flat weeks (if no months) ────────────────────────────────────
  if (months.length === 0 && flatWeeks.length > 0) {
    flatWeeks.forEach((week, wi) => {
      totalWeeks++;
      const wNum = week.weekNumber || (wi + 1);
      const wLabel = `Week ${wNum}`;

      const sr = resolveStudyResources(week);
      const sc = resolveSkillCheck(week);
      const pm = resolvePracticalMissions(week);
      const pow = resolveProofOfWork(week);
      const rp = resolveReflectionPrompts(week);
      const ss = resolveScheduledSessions(week);

      totalStudyResources += sr.length;
      totalSkillCheckQuestions += sc.length;
      totalPracticalMissions += pm.length;
      totalProofItems += pow.length;
      totalReflectionPrompts += rp.length;
      totalScheduledSessions += ss.length;
    });
  }

  // Push per-week warnings into main warnings (they're optional info)
  perWeekWarnings.forEach((w) => warnings.push(w));

  // ── Projects / Checkpoints / Readiness ───────────────────────────────────
  const projects = Array.isArray(data.projects) ? data.projects : [];
  const checkpoints = Array.isArray(data.checkpoints) ? data.checkpoints : [];
  const readinessCategories = Array.isArray(data.readinessCategories)
    ? data.readinessCategories
    : [];

  if (projects.length === 0) warnings.push('No projects defined in this roadmap.');
  if (readinessCategories.length === 0) warnings.push('No readinessCategories defined. Dashboard readiness will show empty tracks.');

  // ── Summary ───────────────────────────────────────────────────────────────
  const summary = {
    bootcampTitle,
    learner,
    months: months.length || (flatWeeks.length > 0 ? 1 : 0),
    weeks: totalWeeks,
    studyResources: totalStudyResources,
    skillCheckQuestions: totalSkillCheckQuestions,
    practicalMissions: totalPracticalMissions,
    proofItems: totalProofItems,
    reflectionPrompts: totalReflectionPrompts,
    scheduledSessions: totalScheduledSessions,
    projects: projects.length,
    checkpoints: checkpoints.length,
    readinessCategories: readinessCategories.length,
    // Legacy field kept for backward compat with old ImportRoadmap summary grid
    resources: totalStudyResources,
    sessions: totalScheduledSessions,
  };

  // ── Legacy normalizedData for backward compat ─────────────────────────────
  // ImportRoadmap.jsx previously used result.normalizedData directly.
  // We now set it to the raw data so the caller can pass it to normalizeRoadmap().
  // This prevents breaking the import flow during migration.
  const normalizedData = data;

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary,
    normalizedData, // raw data; call normalizeRoadmap(normalizedData) next
  };
}
