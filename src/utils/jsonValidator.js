// =============================================
// JSON VALIDATOR
// Validates that an imported JSON file matches
// the expected XcelerateAI roadmap structure.
// Supports both simple and rich schema formats,
// normalizes inputs, and returns normalized data.
// =============================================

/**
 * Validate and normalize the imported roadmap JSON.
 * Returns { valid, errors, warnings, summary, normalizedData }
 */
export function validateRoadmapJSON(data) {
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      errors: ['Imported file is not a valid JSON object.'],
      warnings: [],
      summary: null,
      normalizedData: null
    };
  }

  const errors = [];
  const warnings = [];

  // ── Schema Version Check ──────────────────
  if (!data.schemaVersion || data.schemaVersion !== 'xcelerate-bootcamp-schema-v1') {
    warnings.push('Schema version missing or unexpected. Attempting compatibility import.');
  }

  // ── Bootcamp & Learner Extraction & Normalization ──
  let bootcampTitle = data.bootcampTitle || '';
  let learner = data.learner || '';

  // Extract from nested bootcamp object if present
  if (data.bootcamp && typeof data.bootcamp === 'object') {
    bootcampTitle = data.bootcamp.title || data.bootcamp.bootcampTitle || data.bootcamp.name || bootcampTitle;
    learner = data.bootcamp.learner || data.bootcamp.learnerName || data.bootcamp.operator || data.bootcamp.name || learner;
  }
  // Extract from metadata object if present
  if (data.metadata && typeof data.metadata === 'object') {
    bootcampTitle = data.metadata.bootcampTitle || data.metadata.title || bootcampTitle;
    learner = data.metadata.learner || data.metadata.learnerName || data.metadata.operator || learner;
  }

  // Handle fallbacks
  if (!bootcampTitle || typeof bootcampTitle !== 'string' || bootcampTitle.trim() === '') {
    bootcampTitle = 'XcelerateAI Bootcamp';
    warnings.push('Bootcamp title missing. Using default: XcelerateAI Bootcamp.');
  }
  if (!learner || typeof learner !== 'string' || learner.trim() === '') {
    learner = 'Dave';
    warnings.push('Learner name missing. Using default: Dave.');
  }

  // ── Month & Week Validation (Core Structure Check) ──
  const months = data.months;
  if (!Array.isArray(months) || months.length === 0) {
    errors.push('Missing or empty "months" array. The file has no usable bootcamp structure.');
    return {
      valid: false,
      errors,
      warnings,
      summary: {
        bootcampTitle,
        learner,
        months: 0,
        weeks: 0,
        resources: 0,
        sessions: 0,
        practicalMissions: 0,
        projects: 0,
        checkpoints: 0,
        readinessCategories: 0,
      },
      normalizedData: null
    };
  }

  let totalWeeks = 0;
  let totalTasks = 0;
  let totalResources = 0;
  let totalSessions = 0;
  let totalPracticalMissions = 0;

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
    } else {
      month.weeks.forEach((week, wi) => {
        totalWeeks++;
        const wNum = week.weekNumber || totalWeeks;
        if (!week.weekNumber) {
          warnings.push(`Month ${mNum}, Week ${wi + 1}: Missing "weekNumber". Assigned: ${wNum}`);
        }
        if (!week.title) {
          warnings.push(`Month ${mNum}, Week ${wi + 1}: Missing "title".`);
        }

        // Count resources
        if (Array.isArray(week.resources)) {
          totalResources += week.resources.length;
        }
        // Count sessions
        if (Array.isArray(week.sessions)) {
          totalSessions += week.sessions.length;
        }
        // Count practical missions
        if (Array.isArray(week.practicalMissions)) {
          totalPracticalMissions += week.practicalMissions.length;
        }
        // Count tasks
        if (Array.isArray(week.tasks)) {
          totalTasks += week.tasks.length;
        }
      });
    }
  });

  // ── Projects ──────────────────────────────
  const projects = Array.isArray(data.projects) ? data.projects : [];
  let totalMilestones = 0;
  projects.forEach((p) => {
    if (Array.isArray(p.milestones)) {
      totalMilestones += p.milestones.length;
    }
  });

  // ── Checkpoints ───────────────────────────
  const checkpoints = Array.isArray(data.checkpoints) ? data.checkpoints : [];

  // ── Readiness Categories ──────────────────
  const readinessCategories = Array.isArray(data.readinessCategories) ? data.readinessCategories : [];

  // ── Construct Summary ─────────────────────
  const summary = {
    bootcampTitle,
    learner,
    months: months.length,
    weeks: totalWeeks,
    resources: totalResources,
    sessions: totalSessions,
    practicalMissions: totalPracticalMissions,
    projects: projects.length,
    checkpoints: checkpoints.length,
    readinessCategories: readinessCategories.length,
  };

  // ── Construct Normalized Data for Safe App Utilization ──
  const normalizedData = {
    schemaVersion: data.schemaVersion || 'xcelerate-bootcamp-schema-v1',
    bootcampTitle,
    learner,
    duration: data.duration || `${months.length} months`,
    weeklyHours: data.weeklyHours || data.bootcamp?.weeklyHours || '15-20 hours',
    months: months.map((m, mi) => ({
      ...m,
      monthNumber: m.monthNumber || (mi + 1),
      weeks: Array.isArray(m.weeks) ? m.weeks.map((w, wi) => ({
        ...w,
        weekNumber: w.weekNumber || (wi + 1),
        resources: Array.isArray(w.resources) ? w.resources : [],
        tasks: Array.isArray(w.tasks) ? w.tasks : [],
        practicalMissions: Array.isArray(w.practicalMissions) ? w.practicalMissions : [],
        sessions: Array.isArray(w.sessions) ? w.sessions : [],
      })) : []
    })),
    projects,
    checkpoints,
    readinessCategories,
    sideQuestLocks: data.sideQuestLocks || {},
    uiHints: data.uiHints || {},
  };

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary,
    normalizedData
  };
}
