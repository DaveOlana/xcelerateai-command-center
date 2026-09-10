import {
  applyRecoveryInsight,
  applyRecoveryResourceReview,
  applySubmittedAttempt,
} from '../../utils/skillCheckUtils.js';
import { getV2WeekProgress, isMeaningfulReflection, isProofEvidenceComplete } from '../runtime/progression.js';

export const V2_LEARNER_STATE_VERSION = 1;
export const EMPTY_V2_STATE_STORE = Object.freeze({ version: V2_LEARNER_STATE_VERSION, curricula: {} });

const clone = (value) => structuredClone(value);
const nowIso = (value) => value || new Date().toISOString();
const asArray = (value) => Array.isArray(value) ? value : [];

export function createCurriculumLearnerState(runtime) {
  return {
    curriculumId: runtime.curriculumId,
    lastSeenRevision: runtime.revision,
    activeWeekId: runtime.weeks[0]?.id || null,
    completedWeekIds: [],
    stageSatisfaction: {},
    resources: {},
    skillChecks: {},
    builds: {},
    proofs: {},
    reflections: {},
  };
}

export function reconcileCurriculumState(storeValue, runtime) {
  const store = normalizeV2StateStore(storeValue);
  const existing = store.curricula[runtime.curriculumId];
  const state = existing ? clone(existing) : createCurriculumLearnerState(runtime);
  state.curriculumId = runtime.curriculumId;
  state.lastSeenRevision = runtime.revision;
  const activeStillExists = runtime.indexes.weeksById[state.activeWeekId];
  if (!activeStillExists) {
    state.activeWeekId = runtime.weeks.find((week) => !asArray(state.completedWeekIds).includes(week.id))?.id || runtime.weeks[0]?.id || null;
  }
  return {
    ...store,
    curricula: { ...store.curricula, [runtime.curriculumId]: state },
  };
}

export function normalizeV2StateStore(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return clone(EMPTY_V2_STATE_STORE);
  return {
    version: V2_LEARNER_STATE_VERSION,
    curricula: value.curricula && typeof value.curricula === 'object' && !Array.isArray(value.curricula) ? clone(value.curricula) : {},
  };
}

export function getCurriculumState(store, curriculumId) {
  return normalizeV2StateStore(store).curricula[curriculumId] || null;
}

export function hasCurriculumProgress(state) {
  if (!state) return false;
  return asArray(state.completedWeekIds).length > 0 ||
    Object.keys(state.resources || {}).length > 0 ||
    Object.keys(state.skillChecks || {}).length > 0 ||
    Object.keys(state.builds || {}).length > 0 ||
    Object.keys(state.proofs || {}).length > 0 ||
    Object.keys(state.reflections || {}).length > 0;
}

export function setActiveWeek(storeValue, runtime, weekId) {
  if (!runtime.indexes.weeksById[weekId]) return normalizeV2StateStore(storeValue);
  return updateCurriculum(storeValue, runtime, (state) => ({ ...state, activeWeekId: weekId }));
}

export function recordV2ResourceOpened(storeValue, runtime, weekId, resourceId, options = {}) {
  return updateCurriculum(storeValue, runtime, (state) => {
    const openedAt = nowIso(options.openedAt);
    const next = clone(state);
    next.resources[weekId] = next.resources[weekId] || {};
    next.resources[weekId][resourceId] = { ...(next.resources[weekId][resourceId] || {}), openedAt };
    if (options.skillCheckId && next.skillChecks[options.skillCheckId]) {
      next.skillChecks[options.skillCheckId] = applyRecoveryResourceReview(next.skillChecks[options.skillCheckId], { resourceId, reviewedAt: openedAt });
    }
    return next;
  });
}

export function completeV2Resource(storeValue, runtime, weekId, resourceId, completedAt) {
  return updateCurriculum(storeValue, runtime, (state) => {
    const next = clone(state);
    const timestamp = nowIso(completedAt);
    const assignment = runtime.indexes.weeksById[weekId]?.study.resources.find((item) => item.resourceId === resourceId);
    next.resources[weekId] = next.resources[weekId] || {};
    next.resources[weekId][resourceId] = {
      ...(next.resources[weekId][resourceId] || {}),
      openedAt: next.resources[weekId][resourceId]?.openedAt || timestamp,
      completedAt: timestamp,
      competencyIds: [...(assignment?.competencyIds || [])],
    };
    return latchStageIfSatisfied(runtime, next, weekId, 'study', timestamp);
  });
}

export function submitV2SkillCheckAttempt(storeValue, runtime, weekId, skillCheckId, attempt) {
  return updateCurriculum(storeValue, runtime, (state) => {
    const next = clone(state);
    const current = next.skillChecks[skillCheckId] || { attempts: [], consecutiveFailures: 0, recovery: null };
    next.skillChecks[skillCheckId] = applySubmittedAttempt(current, attempt);
    if (attempt.passed) latchStage(next, weekId, 'skillCheck', attempt.submittedAt, {
      skillCheckId,
      competencyIds: [...(runtime.indexes.weeksById[weekId]?.skillCheck.competencyIds || [])],
    });
    return next;
  });
}

export function recordV2RecoveryInsight(storeValue, runtime, skillCheckId, note) {
  return updateCurriculum(storeValue, runtime, (state) => {
    if (!state.skillChecks[skillCheckId]) return state;
    const next = clone(state);
    next.skillChecks[skillCheckId] = applyRecoveryInsight(next.skillChecks[skillCheckId], note);
    return next;
  });
}

export function setV2BuildCompleted(storeValue, runtime, weekId, buildId, completed, timestamp) {
  return updateCurriculum(storeValue, runtime, (state) => {
    const next = clone(state);
    const build = runtime.indexes.buildsById[buildId];
    if (completed) next.builds[buildId] = { completedAt: nowIso(timestamp), competencyIds: [...(build?.competencyIds || [])] };
    else delete next.builds[buildId];
    return latchStageIfSatisfied(runtime, next, weekId, 'builds', nowIso(timestamp));
  });
}

export function setV2ProofEvidence(storeValue, runtime, weekId, proofId, evidenceId, value, timestamp) {
  return updateCurriculum(storeValue, runtime, (state) => {
    const next = clone(state);
    next.proofs[proofId] = next.proofs[proofId] || { evidence: {} };
    next.proofs[proofId].evidence[evidenceId] = { value, updatedAt: nowIso(timestamp) };
    return latchStageIfSatisfied(runtime, next, weekId, 'proof', nowIso(timestamp));
  });
}

export function setV2ReflectionResponse(storeValue, runtime, weekId, promptId, response, timestamp) {
  return updateCurriculum(storeValue, runtime, (state) => {
    const next = clone(state);
    next.reflections[weekId] = next.reflections[weekId] || {};
    next.reflections[weekId][promptId] = { response, savedAt: nowIso(timestamp) };
    return latchStageIfSatisfied(runtime, next, weekId, 'reflection', nowIso(timestamp));
  });
}

export function completeV2Week(storeValue, runtime, weekId, completedAt) {
  return updateCurriculum(storeValue, runtime, (state) => {
    const status = getV2WeekProgress(runtime, state, weekId);
    if (!status?.complete.unlocked) return state;
    const next = clone(state);
    if (!next.completedWeekIds.includes(weekId)) next.completedWeekIds.push(weekId);
    const currentIndex = runtime.weeks.findIndex((week) => week.id === weekId);
    next.activeWeekId = runtime.weeks[currentIndex + 1]?.id || weekId;
    latchStage(next, weekId, 'complete', nowIso(completedAt));
    return next;
  });
}

export function resetCurriculumState(storeValue, curriculumId) {
  const store = normalizeV2StateStore(storeValue);
  const curricula = { ...store.curricula };
  delete curricula[curriculumId];
  return { ...store, curricula };
}

function updateCurriculum(storeValue, runtime, updater) {
  const reconciled = reconcileCurriculumState(storeValue, runtime);
  const current = reconciled.curricula[runtime.curriculumId];
  const updated = updater(current);
  return { ...reconciled, curricula: { ...reconciled.curricula, [runtime.curriculumId]: updated } };
}

function latchStageIfSatisfied(runtime, state, weekId, stage, timestamp) {
  if (state.stageSatisfaction?.[weekId]?.[stage]?.satisfied) return state;
  const week = runtime.indexes.weeksById[weekId];
  if (!week) return state;
  let satisfied = false;
  if (stage === 'study') {
    const core = week.study.resources.filter((item) => item.role === 'core');
    satisfied = core.filter((item) => state.resources?.[weekId]?.[item.resourceId]?.completedAt).length >= week.study.coreMinimum;
  } else if (stage === 'builds') {
    satisfied = week.builds.filter((item) => item.required).every((item) => state.builds[item.id]?.completedAt);
  } else if (stage === 'proof') {
    const records = state.proofs?.[week.proof.id]?.evidence || {};
    satisfied = week.proof.evidence.filter((item) => item.required).every((item) => isProofEvidenceComplete(item, records[item.id]));
  } else if (stage === 'reflection') {
    const records = state.reflections?.[weekId] || {};
    satisfied = week.reflection.prompts.filter((item) => isMeaningfulReflection(records[item.id]?.response)).length >= week.reflection.minimumResponses;
  }
  let details = {};
  if (stage === 'study') {
    const completedCore = week.study.resources.filter((item) => item.role === 'core' && state.resources?.[weekId]?.[item.resourceId]?.completedAt);
    details = { competencyIds: [...new Set(completedCore.flatMap((item) => item.competencyIds))] };
  } else if (stage === 'builds') {
    const requiredBuilds = week.builds.filter((item) => item.required);
    details = {
      completedBuildIds: requiredBuilds.map((item) => item.id),
      competencyIds: [...new Set(requiredBuilds.flatMap((item) => item.competencyIds))],
    };
  }
  if (satisfied) latchStage(state, weekId, stage, timestamp, details);
  return state;
}

function latchStage(state, weekId, stage, timestamp, details = {}) {
  state.stageSatisfaction = state.stageSatisfaction || {};
  state.stageSatisfaction[weekId] = state.stageSatisfaction[weekId] || {};
  if (!state.stageSatisfaction[weekId][stage]?.satisfied) {
    state.stageSatisfaction[weekId][stage] = { satisfied: true, satisfiedAt: nowIso(timestamp), ...details };
  }
}
