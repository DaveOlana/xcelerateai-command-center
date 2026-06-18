// =============================================
// UNLOCK CHECKER UTILITY
// Centralized logic for determining whether
// a week's steps are accessible based on
// JSON-defined requirements and user progress.
// =============================================

/**
 * Known week-level fields (used to detect unknown/extra JSON fields)
 */
export const KNOWN_WEEK_FIELDS = [
  'weekNumber', 'title', 'briefing', 'minimumMission', 'fullMission',
  'resources', 'tasks', 'checkpoint', 'deliverable', 'practicalMissions',
  'sessions', 'skillCheck', 'unlockCriteria', 'required'
];

/**
 * Known resource-level fields
 */
export const KNOWN_RESOURCE_FIELDS = [
  'title', 'url', 'type', 'difficulty', 'whatToExpect', 'missionObjective',
  'required', 'timeEstimate', 'dataEstimate', 'lowData'
];

/**
 * Get all required resources for a week.
 * A resource is considered "required" if:
 * - It has required: true explicitly
 * - OR the week has no explicit required flags (all resources implicitly required)
 */
export function getRequiredResources(week) {
  if (!week) return [];
  const resources = Array.isArray(week.resources) ? week.resources : [];
  const hasAnyExplicit = resources.some(r => r && r.required === true);
  if (hasAnyExplicit) {
    return resources.filter(r => r && r.required === true);
  }
  // If no explicit required flags, treat all resources as implicitly required
  return resources;
}

/**
 * Check if all required resources for a week have been studied.
 * @param {object} week - The week data from the roadmap JSON
 * @param {object} resourcesStatus - { [resourceTitle]: 'Not Started'|'Studying'|'Studied' }
 */
export function areRequiredResourcesStudied(week, resourcesStatus) {
  if (!week) return true;
  const required = getRequiredResources(week);
  if (required.length === 0) return true;
  const status = resourcesStatus || {};
  return required.every(r => {
    if (!r) return true;
    const title = typeof r === 'string' ? r : (r.title || r.name || r.label || '');
    return !title || status[title] === 'Studied';
  });
}

/**
 * Check if the skill check for a week is completed.
 * @param {number|string} weekNum
 * @param {object} skillChecks - { [weekNum]: { confirmed: boolean, confidence: number } }
 */
export function isSkillCheckComplete(weekNum, skillChecks) {
  if (weekNum === undefined || weekNum === null) return false;
  const checks = skillChecks || {};
  // Check both string and number keys defensively
  const check = checks[weekNum] || checks[String(weekNum)] || checks[Number(weekNum)];
  return !!(check && check.confirmed);
}

/**
 * Get required practical missions for a week.
 * A practical is required if it has required: true, or evidenceRequired: true,
 * or has proofOfWork items, or is a Boss/Final/Assessment type.
 */
export function getRequiredPracticals(week) {
  if (!week) return [];
  const practicals = Array.isArray(week.practicalMissions) ? week.practicalMissions : [];
  return practicals.filter(m => {
    if (!m) return false;
    const isExplicitlyRequired = m.required === true || m.evidenceRequired === true;
    const hasProofOfWork = Array.isArray(m.proofOfWork) && m.proofOfWork.length > 0;
    const isHardDifficulty = typeof m.difficulty === 'string' && 
      ['Boss Mission', 'Main Build', 'Final Project', 'Assessment'].includes(m.difficulty);
    return isExplicitlyRequired || hasProofOfWork || isHardDifficulty;
  });
}

/**
 * Check if all required practical missions are completed.
 */
export function areRequiredPracticalsComplete(week, practicalMissions) {
  if (!week) return true;
  const required = getRequiredPracticals(week);
  if (required.length === 0) return true;
  const pm = practicalMissions || {};
  return required.every(m => {
    if (!m) return true;
    const mId = m.missionId || m.id || (m.title ? `pm_${m.title}` : null);
    if (!mId) return true;
    const record = pm[mId] || pm[String(mId)] || pm[Number(mId)];
    return record && record.status === 'Completed';
  });
}

/**
 * Check if week proof has been submitted.
 */
export function isWeekProofSubmitted(weekNum, weekProofs) {
  if (weekNum === undefined || weekNum === null) return false;
  const proofs = weekProofs || {};
  const proof = proofs[weekNum] || proofs[String(weekNum)] || proofs[Number(weekNum)];
  if (!proof) return false;
  return !!(proof.githubRepoLink && proof.submittedDate);
}

/**
 * Check if week reflection has been written.
 */
export function isWeekReflectionWritten(weekNum, weekReflections) {
  if (weekNum === undefined || weekNum === null) return false;
  const reflections = weekReflections || {};
  const ref = reflections[weekNum] || reflections[String(weekNum)] || reflections[Number(weekNum)];
  return !!(ref && ref.explanation && typeof ref.explanation === 'string' && ref.explanation.trim().length > 10);
}

/**
 * Check if all required tasks are completed.
 * Commander Mode tasks should NOT block progress.
 */
export function areRequiredTasksComplete(weekNum, monthNum, week, progress) {
  if (!week) return true;
  const key = `m${monthNum}_w${weekNum}`;
  const completed = progress?.completedTasks?.[key] || [];
  const tasks = Array.isArray(week.tasks) ? week.tasks : [];

  const requiredIndices = tasks
    .map((t, i) => ({ task: t, index: i }))
    .filter(({ task }) => {
      if (!task) return false;
      let text = '';
      let isCommanderFlag = false;
      if (typeof task === 'string') {
        text = task;
      } else if (typeof task === 'object') {
        text = task.text || task.title || task.label || '';
        isCommanderFlag = task.commanderMode === true || task.required === false;
      }
      const isCommander = text.toLowerCase().includes('[commander]') ||
                          text.toLowerCase().includes('(optional)') ||
                          isCommanderFlag;
      return !isCommander;
    })
    .map(({ index }) => index);

  if (requiredIndices.length === 0) return true;
  return requiredIndices.every(i => completed.includes(i));
}

/**
 * Main unlock check for what a user can currently access in a given week.
 * Returns an object describing which steps are unlocked and why.
 */
export function getWeekStepStatus({
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
}) {
  const defaultStatus = {
    resourcesUnlocked: true,
    skillCheckUnlocked: false,
    practicalsUnlocked: false,
    proofUnlocked: false,
    reflectionUnlocked: false,
    weekCompleteUnlocked: false,
    resourcesDone: false,
    skillCheckDone: false,
    practicalsDone: false,
    proofDone: false,
    reflectionDone: false,
  };

  if (!week) return defaultStatus;

  // With override, everything is unlocked
  if (settings?.manualOverrideEnabled) {
    return {
      resourcesUnlocked: true,
      skillCheckUnlocked: true,
      practicalsUnlocked: true,
      proofUnlocked: true,
      reflectionUnlocked: true,
      weekCompleteUnlocked: true,
      resourcesDone: areRequiredResourcesStudied(week, resourcesStatus),
      skillCheckDone: isSkillCheckComplete(weekNum, skillChecks),
      practicalsDone: areRequiredPracticalsComplete(week, practicalMissions),
      proofDone: isWeekProofSubmitted(weekNum, weekProofs),
      reflectionDone: isWeekReflectionWritten(weekNum, weekReflections),
    };
  }

  const resourcesDone = areRequiredResourcesStudied(week, resourcesStatus);
  const skillCheckDone = isSkillCheckComplete(weekNum, skillChecks);
  const practicalsDone = areRequiredPracticalsComplete(week, practicalMissions);
  const proofDone = isWeekProofSubmitted(weekNum, weekProofs);
  const reflectionDone = isWeekReflectionWritten(weekNum, weekReflections);

  const hasResources = Array.isArray(week.resources) && week.resources.length > 0;
  const hasSkillCheck = !!(week.skillCheck || week.checkpoint);
  const hasPracticals = Array.isArray(week.practicalMissions) && week.practicalMissions.length > 0;

  // Step unlock logic: each step requires previous step done
  const resourcesUnlocked = true; // always open
  const skillCheckUnlocked = !hasResources || resourcesDone;
  const practicalsUnlocked = (!hasSkillCheck || skillCheckDone) && (!hasResources || resourcesDone);
  const proofUnlocked = practicalsUnlocked && (!hasPracticals || practicalsDone);
  const reflectionUnlocked = proofDone || !hasPracticals;
  const weekCompleteUnlocked = reflectionDone || (!hasPracticals && !hasResources);

  return {
    resourcesUnlocked,
    skillCheckUnlocked,
    practicalsUnlocked,
    proofUnlocked,
    reflectionUnlocked,
    weekCompleteUnlocked,
    resourcesDone,
    skillCheckDone,
    practicalsDone,
    proofDone,
    reflectionDone,
  };
}

/**
 * Check whether a given week number is accessible at all
 * (i.e., not future-locked relative to activeWeek).
 */
export function isWeekAccessible(weekNum, activeWeek, manualOverrideEnabled) {
  if (manualOverrideEnabled) return true;
  const wNum = Number(weekNum);
  const aWeek = Number(activeWeek);
  if (isNaN(wNum) || isNaN(aWeek)) return true; // fallback to accessible if invalid
  return wNum <= aWeek;
}

/**
 * Get the unknown fields from a week object (for the "Additional Data" accordion).
 */
export function getUnknownWeekFields(week) {
  if (!week) return {};
  const unknown = {};
  Object.keys(week).forEach(key => {
    if (!KNOWN_WEEK_FIELDS.includes(key)) {
      unknown[key] = week[key];
    }
  });
  return unknown;
}

/**
 * Determine if a practical mission requires evidence before completion.
 * Boss/Final/Assessment missions always require it.
 */
export function missionRequiresEvidence(mission) {
  if (!mission) return false;
  return (
    mission.required === true ||
    mission.evidenceRequired === true ||
    (Array.isArray(mission.proofOfWork) && mission.proofOfWork.length > 0) ||
    (typeof mission.difficulty === 'string' && ['Boss Mission', 'Main Build', 'Final Project', 'Assessment'].includes(mission.difficulty))
  );
}

/**
 * Check if evidence form is complete.
 */
export function isEvidenceComplete(proof) {
  if (!proof) return false;
  return !!(proof.githubRepoLink && proof.githubCommitLink && proof.readmeCompleted && proof.testCasesPassed);
}
