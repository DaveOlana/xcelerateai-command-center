import { isRecoveryLocked } from '../../utils/skillCheckUtils.js';

export const V2_STAGES = Object.freeze(['study', 'skillCheck', 'builds', 'proof', 'reflection', 'complete']);
export const REFLECTION_MEANINGFUL_MIN_LENGTH = 11;

const asArray = (value) => Array.isArray(value) ? value : [];
const stageRecord = (state, weekId, stage) => state?.stageSatisfaction?.[weekId]?.[stage] || null;

export function isProofEvidenceComplete(definition, record) {
  const value = record?.value;
  if (definition.type === 'confirmation') return value === true;
  if (definition.type === 'link') {
    if (typeof value !== 'string' || !value.trim()) return false;
    try {
      const url = new URL(value.trim());
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }
  return typeof value === 'string' && value.trim().length > 0;
}
export function isMeaningfulReflection(value) {
  return typeof value === 'string' && value.trim().length >= REFLECTION_MEANINGFUL_MIN_LENGTH;
}

export function getV2WeekProgress(runtime, curriculumState, weekId) {
  const week = runtime?.indexes?.weeksById?.[weekId];
  if (!week) return null;
  const completed = asArray(curriculumState?.completedWeekIds).includes(weekId);
  if (completed) return completedProgress(week);

  const durable = curriculumState?.stageSatisfaction?.[weekId] || {};
  const completedResources = curriculumState?.resources?.[weekId] || {};
  const coreAssignments = asArray(week.study.resources).filter((item) => item.role === 'core');
  const completedCore = coreAssignments.filter((item) => Boolean(completedResources[item.resourceId]?.completedAt)).length;
  const studyDone = durable.study?.satisfied === true || completedCore >= week.study.coreMinimum;

  const assessmentRecord = curriculumState?.skillChecks?.[week.skillCheck.id];
  const recoveryLocked = isRecoveryLocked(assessmentRecord);
  const assessmentPassed = asArray(assessmentRecord?.attempts).some((attempt) => attempt.passed);
  const skillCheckDone = durable.skillCheck?.satisfied === true || assessmentPassed;

  const requiredBuilds = asArray(week.builds).filter((build) => build.required);
  const buildsDone = durable.builds?.satisfied === true || requiredBuilds.every((build) => curriculumState?.builds?.[build.id]?.completedAt);

  const requiredEvidence = asArray(week.proof.evidence).filter((item) => item.required);
  const proofRecord = curriculumState?.proofs?.[week.proof.id]?.evidence || {};
  const proofDone = durable.proof?.satisfied === true || requiredEvidence.every((item) => isProofEvidenceComplete(item, proofRecord[item.id]));

  const responseRecords = curriculumState?.reflections?.[week.id] || {};
  const meaningfulResponses = asArray(week.reflection.prompts).filter((prompt) => isMeaningfulReflection(responseRecords[prompt.id]?.response)).length;
  const reflectionDone = durable.reflection?.satisfied === true || meaningfulResponses >= week.reflection.minimumResponses;

  return {
    weekId,
    completed: false,
    recoveryLocked,
    study: { done: studyDone, unlocked: true, completedCore, required: week.study.coreMinimum },
    skillCheck: { done: skillCheckDone, unlocked: studyDone && !recoveryLocked },
    builds: { done: buildsDone, unlocked: studyDone && skillCheckDone && !recoveryLocked },
    proof: { done: proofDone, unlocked: studyDone && skillCheckDone && buildsDone && !recoveryLocked },
    reflection: { done: reflectionDone, unlocked: studyDone && skillCheckDone && buildsDone && proofDone && !recoveryLocked, meaningfulResponses, required: week.reflection.minimumResponses },
    complete: { done: false, unlocked: studyDone && skillCheckDone && buildsDone && proofDone && reflectionDone && !recoveryLocked },
  };
}

function completedProgress(week) {
  return {
    weekId: week.id,
    completed: true,
    recoveryLocked: false,
    study: { done: true, unlocked: true, completedCore: week.study.coreMinimum, required: week.study.coreMinimum },
    skillCheck: { done: true, unlocked: true },
    builds: { done: true, unlocked: true },
    proof: { done: true, unlocked: true },
    reflection: { done: true, unlocked: true, meaningfulResponses: week.reflection.minimumResponses, required: week.reflection.minimumResponses },
    complete: { done: true, unlocked: true },
  };
}

export function getV2NextAction(runtime, curriculumState) {
  const firstIncomplete = runtime.weeks.find((week) => !asArray(curriculumState?.completedWeekIds).includes(week.id));
  const week = runtime.indexes.weeksById[curriculumState?.activeWeekId] || firstIncomplete || runtime.weeks[0];
  if (!week) return null;
  const status = getV2WeekProgress(runtime, curriculumState, week.id);
  const ordered = [
    ['study', 'Study'],
    ['skillCheck', 'Skill Check'],
    ['builds', 'Build'],
    ['proof', 'Proof'],
    ['reflection', 'Reflect'],
    ['complete', 'Complete'],
  ];
  const entry = ordered.find(([key]) => !status[key].done) || ordered[ordered.length - 1];
  return {
    curriculumId: runtime.curriculumId,
    weekId: week.id,
    weekSequence: week.sequence,
    stage: entry[0],
    label: entry[1],
    title: `${entry[1]}: ${week.title}`,
    locked: !status[entry[0]].unlocked,
  };
}

export function getSatisfiedStageRecord(state, weekId, stage) {
  return stageRecord(state, weekId, stage);
}
