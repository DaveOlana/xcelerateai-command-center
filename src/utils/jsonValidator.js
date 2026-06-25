// =============================================
// JSON VALIDATOR
// Validates that an imported JSON file matches
// the expected XcelerateAI roadmap structure.
// Produces validation summary and per-week/month warnings.
// Normalization is handled by normalizeRoadmap.js
// =============================================

// ── Resource resolvers (mirrored from normalizeRoadmap for validation) ───────
function resolveStudyResources(week) {
  const raw =
    Array.isArray(week.studyResources)        ? week.studyResources :
    Array.isArray(week.resources)             ? week.resources :
    Array.isArray(week.resourcesBeforeTask)   ? week.resourcesBeforeTask :
    Array.isArray(week.learningResources)     ? week.learningResources :
    Array.isArray(week.materials)             ? week.materials :
    Array.isArray(week.links)                ? week.links :
    Array.isArray(week.readings)              ? week.readings :
    Array.isArray(week.videos)               ? week.videos :
    Array.isArray(week.recommendedResources)  ? week.recommendedResources :
    Array.isArray(week.study)                ? week.study :
    [];
  return raw;
}

function resolveSkillCheck(week) {
  if (Array.isArray(week.skillCheck) && week.skillCheck.length)   return week.skillCheck;
  if (week.skillCheck)                                              return [week.skillCheck];
  if (Array.isArray(week.skillChecks) && week.skillChecks.length) return week.skillChecks;
  if (Array.isArray(week.quiz) && week.quiz.length)               return week.quiz;
  if (week.quiz)                                                    return [week.quiz];
  if (Array.isArray(week.quizzes) && week.quizzes.length)         return week.quizzes;
  if (Array.isArray(week.questions) && week.questions.length)     return week.questions;
  if (Array.isArray(week.checkQuestions) && week.checkQuestions.length) return week.checkQuestions;
  if (Array.isArray(week.outcomes) && week.outcomes.length)       return week.outcomes; // Cloud Engineering
  if (week.checkpoint)                                              return [week.checkpoint];
  return [];
}

function resolvePracticalMissions(week) {
  if (Array.isArray(week.practicalMissions) && week.practicalMissions.length) return week.practicalMissions;
  if (Array.isArray(week.missions) && week.missions.length)        return week.missions;
  if (Array.isArray(week.buildTasks) && week.buildTasks.length)    return week.buildTasks;
  if (Array.isArray(week.practicalTasks) && week.practicalTasks.length) return week.practicalTasks;
  if (Array.isArray(week.assignments) && week.assignments.length)  return week.assignments;
  if (Array.isArray(week.exercises) && week.exercises.length)      return week.exercises;
  if (Array.isArray(week.labs) && week.labs.length)                return week.labs;
  if (Array.isArray(week.builds) && week.builds.length)            return week.builds;
  // Cloud Engineering: proofOfWork string → synthetic mission
  if (typeof week.proofOfWork === 'string' && week.proofOfWork.trim()) return [week.proofOfWork];
  return [];
}

function resolveProofOfWork(week) {
  if (Array.isArray(week.proofOfWork) && week.proofOfWork.length) return week.proofOfWork;
  if (typeof week.proofOfWork === 'string' && week.proofOfWork.trim()) return [week.proofOfWork];
  if (Array.isArray(week.proof) && week.proof.length)              return week.proof;
  if (typeof week.proof === 'string' && week.proof.trim())         return [week.proof];
  if (Array.isArray(week.deliverables) && week.deliverables.length) return week.deliverables;
  if (Array.isArray(week.submission) && week.submission.length)    return week.submission;
  if (Array.isArray(week.evidence) && week.evidence.length)        return week.evidence;
  return [];
}

function resolveReflectionPrompts(week) {
  if (Array.isArray(week.reflectionPrompts) && week.reflectionPrompts.length) return week.reflectionPrompts;
  if (Array.isArray(week.reflection) && week.reflection.length)    return week.reflection;
  if (Array.isArray(week.reflections) && week.reflections.length)  return week.reflections;
  if (week.reflectionPrompt)                                        return [week.reflectionPrompt];
  if (Array.isArray(week.reviewQuestions) && week.reviewQuestions.length) return week.reviewQuestions;
  return [];
}

function resolveScheduledSessions(week) {
  if (Array.isArray(week.scheduledSessions) && week.scheduledSessions.length) return week.scheduledSessions;
  if (Array.isArray(week.sessions) && week.sessions.length)        return week.sessions;
  if (Array.isArray(week.studySessions) && week.studySessions.length) return week.studySessions;
  if (Array.isArray(week.timeBlocks) && week.timeBlocks.length)    return week.timeBlocks;
  if (Array.isArray(week.focusBlocks) && week.focusBlocks.length)  return week.focusBlocks;
  return [];
}

// ── Month children detection (mirrors normalizeRoadmap logic) ─────────────────
function detectMonthChildType(month) {
  if (Array.isArray(month.weeks) && month.weeks.length > 0)
    return { type: 'embedded-weeks', count: month.weeks.length, field: 'weeks' };
  if (Array.isArray(month.weekIds) && month.weekIds.length > 0)
    return { type: 'id-references', count: month.weekIds.length, field: 'weekIds' };

  const alternates = ['weeklyPlan','weeklySchedule','curriculumWeeks','learningWeeks',
    'modules','units','lessons','topics','sessions','milestones'];
  for (const f of alternates) {
    if (Array.isArray(month[f]) && month[f].length > 0)
      return { type: 'alternate-field', count: month[f].length, field: f };
  }
  return { type: 'none', count: 0, field: null };
}

// ─────────────────────────────────────────────────────────────────────────────
/**
 * Validate the imported roadmap JSON.
 * Returns { valid, errors, warnings, summary }
 */
export function validateRoadmapJSON(data) {
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      errors: ['Imported file is not a valid JSON object.'],
      warnings: [], summary: null, normalizedData: null,
    };
  }

  const errors = [];
  const warnings = [];

  // ── Schema Version ─────────────────────────────────────────────────────────
  if (!data.schemaVersion || data.schemaVersion !== 'xcelerate-bootcamp-schema-v1') {
    warnings.push('Schema version missing or unexpected. Attempting compatibility import.');
  }

  // ── Title / Learner ────────────────────────────────────────────────────────
  let bootcampTitle =
    data.bootcamp?.bootcampTitle ||
    data.bootcamp?.title ||
    data.bootcampTitle ||
    data.title ||
    data.id ||
    '';
  let learner =
    data.bootcamp?.learner ||
    data.learner ||
    data.createdFor ||
    '';

  if (!bootcampTitle.trim()) {
    bootcampTitle = 'XcelerateAI Bootcamp';
    warnings.push('Bootcamp title missing. Using default.');
  }
  if (!learner.trim()) {
    learner = 'Student';
    warnings.push('Learner name missing. Using default.');
  }

  // ── Core Structure ─────────────────────────────────────────────────────────
  const months    = Array.isArray(data.months) ? data.months : [];
  const flatWeeks = Array.isArray(data.weeks)  ? data.weeks  : [];

  if (months.length === 0 && flatWeeks.length === 0) {
    errors.push('Missing both "months" array and "weeks" array. The file has no usable bootcamp structure.');
    return {
      valid: false, errors, warnings,
      summary: {
        bootcampTitle, learner, months: 0, weeks: 0,
        studyResources: 0, skillCheckQuestions: 0, practicalMissions: 0,
        proofItems: 0, reflectionPrompts: 0, scheduledSessions: 0,
        projects: 0, checkpoints: 0, readinessCategories: 0,
      },
      normalizedData: null,
    };
  }

  // ── Count resources from flat weeks (for reference-based schemas) ──────────
  let totalWeeks = 0;
  let totalStudyResources = 0;
  let totalSkillCheckQuestions = 0;
  let totalPracticalMissions = 0;
  let totalProofItems = 0;
  let totalReflectionPrompts = 0;
  let totalScheduledSessions = 0;
  const perWeekWarnings = [];
  const monthDiagnostics = [];

  // ── Process months ─────────────────────────────────────────────────────────
  months.forEach((month, mi) => {
    const mNum = month.monthNumber || (mi + 1);
    if (!month.title) warnings.push(`Month ${mNum}: Missing "title".`);

    const { type, count, field } = detectMonthChildType(month);
    let monthWeeksToCount = [];

    if (type === 'id-references') {
      // Resolve from flat weeks by ID
      const weekIds = month.weekIds || [];
      weekIds.forEach(wid => {
        const fw = flatWeeks.find(w => w.id === wid || w.weekId === wid);
        if (fw) monthWeeksToCount.push(fw);
      });
      if (monthWeeksToCount.length > 0) {
        monthDiagnostics.push(
          `Month ${mNum} ("${month.title}"): Resolved ${monthWeeksToCount.length}/${weekIds.length} weeks from flat weeks[] by ID reference.`
        );
      } else {
        monthDiagnostics.push(
          `Month ${mNum} ("${month.title}"): Contains weekId references but no matching weeks found in flat weeks[].`
        );
      }
    } else if (type === 'embedded-weeks' || type === 'alternate-field') {
      monthWeeksToCount = month[field] || [];
      if (type === 'alternate-field') {
        monthDiagnostics.push(
          `Month ${mNum} ("${month.title}"): Converted from month.${field} into ${count} weeks.`
        );
      }
    } else {
      // No week-like children detected
      // Check if month has top-level learning data (can generate weeks)
      const hasTopLevelData = (
        resolveStudyResources(month).length > 0 ||
        resolveProofOfWork(month).length > 0 ||
        month.summary || month.description || month.objective
      );
      if (hasTopLevelData) {
        monthDiagnostics.push(
          `Month ${mNum} ("${month.title}"): Contains learning data but no week children. The adapter will generate 4 synthetic weeks from month-level data.`
        );
        // Count month-level as 4 weeks for summary purposes
        totalWeeks += 4;
      } else {
        perWeekWarnings.push(
          `Month ${mNum} ("${month.title}"): Has no weeks/modules/topics/sessions that can be converted into weeks.`
        );
      }
      return; // skip per-week counting for this month
    }

    // Count per-week field completeness
    monthWeeksToCount.forEach((week, wi) => {
      totalWeeks++;
      const wNum = week.weekNumber || (wi + 1);
      const wLabel = `Week ${wNum} (Month ${mNum})`;

      const sr  = resolveStudyResources(week);
      const sc  = resolveSkillCheck(week);
      const pm  = resolvePracticalMissions(week);
      const pow = resolveProofOfWork(week);
      const rp  = resolveReflectionPrompts(week);
      const ss  = resolveScheduledSessions(week);

      totalStudyResources      += sr.length;
      totalSkillCheckQuestions += sc.length;
      totalPracticalMissions   += pm.length;
      totalProofItems          += pow.length;
      totalReflectionPrompts   += rp.length;
      totalScheduledSessions   += ss.length;

      if (sr.length  === 0) perWeekWarnings.push(`${wLabel}: No study resources found.`);
      if (sc.length  === 0) perWeekWarnings.push(`${wLabel}: No skill check questions found.`);
      if (pm.length  === 0) perWeekWarnings.push(`${wLabel}: No practical missions found.`);
      if (pow.length === 0) perWeekWarnings.push(`${wLabel}: No proof of work requirements found.`);
      if (rp.length  === 0) perWeekWarnings.push(`${wLabel}: No reflection prompts found.`);
      if (ss.length  === 0) perWeekWarnings.push(`${wLabel}: No scheduled sessions found.`);
    });
  });

  // ── Also count from any unclaimed flat weeks ───────────────────────────────
  // (flat weeks not referenced by any month's weekIds)
  const claimedWeekIds = new Set();
  months.forEach(m => (m.weekIds || []).forEach(id => claimedWeekIds.add(id)));

  flatWeeks.forEach((week, wi) => {
    const wid = week.id || week.weekId;
    // Skip if already counted via month weekIds
    if (wid && claimedWeekIds.has(wid)) return;
    // Only count if not from months[] either
    if (months.length > 0) return; // already counted above via id-references

    totalWeeks++;
    const sr  = resolveStudyResources(week);
    const sc  = resolveSkillCheck(week);
    const pm  = resolvePracticalMissions(week);
    const pow = resolveProofOfWork(week);
    const rp  = resolveReflectionPrompts(week);
    const ss  = resolveScheduledSessions(week);

    totalStudyResources      += sr.length;
    totalSkillCheckQuestions += sc.length;
    totalPracticalMissions   += pm.length;
    totalProofItems          += pow.length;
    totalReflectionPrompts   += rp.length;
    totalScheduledSessions   += ss.length;
  });

  // Add month diagnostics as informational warnings
  monthDiagnostics.forEach(d => warnings.push(d));
  perWeekWarnings.forEach(w => warnings.push(w));

  // ── Supplementary counts ──────────────────────────────────────────────────
  const projects = Array.isArray(data.projects) ? data.projects :
    Array.isArray(data.certificationTargets) ? data.certificationTargets : [];
  const checkpoints = Array.isArray(data.checkpoints) ? data.checkpoints :
    Array.isArray(data.certificationTargets) ? data.certificationTargets : [];
  const readinessCategories = Array.isArray(data.readinessCategories)
    ? data.readinessCategories : [];

  if (projects.length === 0) warnings.push('No projects defined in this roadmap.');
  if (readinessCategories.length === 0) warnings.push('No readinessCategories defined. Dashboard readiness will show empty tracks.');

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
    // Legacy aliases
    resources: totalStudyResources,
    sessions: totalScheduledSessions,
  };

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary,
    normalizedData: data, // raw JSON; call normalizeRoadmap(normalizedData) next
  };
}
