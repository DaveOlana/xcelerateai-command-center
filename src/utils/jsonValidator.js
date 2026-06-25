// =============================================
// JSON VALIDATOR
// Validates that an imported JSON file matches
// the expected XcelerateAI roadmap structure.
// Produces validation summary and per-week/month warnings/info.
// Runs normalizeRoadmap to validate the standard internal shape.
// =============================================

import { normalizeRoadmap } from './normalizeRoadmap';

/**
 * Validate the imported roadmap JSON.
 * Returns { valid, errors, warnings, info, summary, normalizedData }
 */
export function validateRoadmapJSON(data) {
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      errors: ['Imported file is not a valid JSON object.'],
      warnings: [],
      info: [],
      summary: null,
      normalizedData: null,
    };
  }

  const errors = [];
  const warnings = [];
  const info = [];

  // ── 1. Normalize the roadmap ──────────────────────────────────────────────
  let normalized = null;
  try {
    normalized = normalizeRoadmap(data);
  } catch (err) {
    errors.push(`Failed to normalize roadmap schema: ${err.message}`);
    return {
      valid: false,
      errors,
      warnings,
      info,
      summary: null,
      normalizedData: null,
    };
  }

  // ── 2. Error Checks (Block Import) ────────────────────────────────────────
  const bootcampTitle = normalized.title || '';
  if (!bootcampTitle.trim()) {
    errors.push('Roadmap title is missing or empty.');
  }

  if (normalized.weeks.length === 0) {
    errors.push('No weeks could be found or synthesized from this roadmap.');
  }

  // If there are errors, return immediately
  if (errors.length > 0) {
    return {
      valid: false,
      errors,
      warnings,
      info,
      summary: null,
      normalizedData: null,
    };
  }

  // ── 3. Warnings and Info Checks ──────────────────────────────────────────
  // Warn if schema version is unexpected
  if (!data.schemaVersion || data.schemaVersion !== 'xcelerate-bootcamp-schema-v1') {
    info.push('Schema version is missing or custom. Auto-compatibility mapping applied.');
  }

  // Count items across weeks
  let totalStudyResources = 0;
  let totalSkillCheckQuestions = 0;
  let totalPracticalMissions = 0;
  let totalProofItems = 0;
  let totalReflectionPrompts = 0;
  let totalScheduledSessions = 0;

  let weeksWithMissingStudy = 0;
  let weeksWithMissingPractical = 0;
  let weeksWithGeneratedReflection = 0;
  let weeksWithGeneratedSessions = 0;

  normalized.weeks.forEach(w => {
    totalStudyResources += w.studyResources?.length || 0;
    totalSkillCheckQuestions += w.skillCheck?.length || 0;
    totalPracticalMissions += w.practicalMissions?.length || 0;
    totalProofItems += w.proofOfWork?.length || 0;
    totalReflectionPrompts += w.reflectionPrompts?.length || 0;
    totalScheduledSessions += w.scheduledSessions?.length || 0;

    if (!w.studyResources || w.studyResources.length === 0) {
      weeksWithMissingStudy++;
    }
    if (!w.practicalMissions || w.practicalMissions.length === 0) {
      weeksWithMissingPractical++;
    }
    if (w.generatedReflectionPrompts) {
      weeksWithGeneratedReflection++;
    }
    if (w.generatedScheduledSessions) {
      weeksWithGeneratedSessions++;
    }
  });

  // Month-level diagnostics
  if (normalized._conversionLog && Array.isArray(normalized._conversionLog)) {
    normalized._conversionLog.forEach(log => {
      if (log.conversionType === 'id-references') {
        info.push(`Month ${log.monthNumber} ("${log.title}"): Resolved ${log.weeksFound} weeks from flat weeks[] by ID reference.`);
      } else if (log.conversionType === 'embedded-weeks' || log.conversionType === 'alternate-field') {
        info.push(`Month ${log.monthNumber} ("${log.title}"): Extracted ${log.weeksFound} weeks successfully.`);
      } else if (log.conversionType === 'generated') {
        info.push(`Month ${log.monthNumber} ("${log.title}"): Generated ${log.weeksFound} synthetic weeks from month-level data.`);
      } else if (log.conversionType === 'none') {
        warnings.push(`Month ${log.monthNumber} ("${log.title}"): No weeks/modules found inside.`);
      }
    });
  }

  // Learner name fallback check
  const learner = normalized.learner || 'Student';
  const isCustomLearner = (data.bootcamp?.learner || data.learner);
  if (!isCustomLearner) {
    warnings.push(`Learner name missing from roadmap. Using fallback: "${learner}".`);
  }

  // Aggregate repeated warnings
  if (weeksWithMissingStudy > 0) {
    warnings.push(`${weeksWithMissingStudy} week(s) have no study resources.`);
  }
  if (weeksWithMissingPractical > 0) {
    warnings.push(`${weeksWithMissingPractical} week(s) have no practical missions.`);
  }

  if (weeksWithGeneratedReflection > 0) {
    info.push(`Generated default reflection prompts for ${weeksWithGeneratedReflection} week(s).`);
  }
  if (weeksWithGeneratedSessions > 0) {
    info.push(`Generated default scheduled sessions for ${weeksWithGeneratedSessions} week(s).`);
  }

  // Project deliverables warning
  const projects = normalized.projects || [];
  let projectsWithNoDeliverables = 0;
  projects.forEach(p => {
    const deliverables = p.deliverables || p.milestones || [];
    if (deliverables.length === 0) {
      projectsWithNoDeliverables++;
    }
  });
  if (projectsWithNoDeliverables > 0) {
    warnings.push(`${projectsWithNoDeliverables} project(s) have no milestones/deliverables configured.`);
  }

  if (projects.length === 0) {
    warnings.push('No projects defined in this roadmap.');
  }

  const readinessCategories = normalized.readinessCategories || [];
  if (readinessCategories.length === 0) {
    warnings.push('No readinessCategories defined. Dashboard readiness will show empty tracks.');
  }

  // Summary
  const summary = {
    bootcampTitle,
    learner,
    months: normalized.months?.length || 0,
    weeks: normalized.weeks.length,
    studyResources: totalStudyResources,
    skillCheckQuestions: totalSkillCheckQuestions,
    practicalMissions: totalPracticalMissions,
    proofItems: totalProofItems,
    reflectionPrompts: totalReflectionPrompts,
    scheduledSessions: totalScheduledSessions,
    projects: projects.length,
    checkpoints: normalized.checkpoints?.length || 0,
    readinessCategories: readinessCategories.length,
    // Legacy aliases
    resources: totalStudyResources,
    sessions: totalScheduledSessions,
    reflectionPromptsGenerated: weeksWithGeneratedReflection,
    scheduledSessionsGenerated: weeksWithGeneratedSessions,
  };

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
    summary,
    normalizedData: normalized,
  };
}
