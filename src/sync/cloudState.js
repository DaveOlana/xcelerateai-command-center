import {
  getCurriculumState,
  reconcileCurriculumState,
  V2_LEARNER_STATE_VERSION,
} from '../curriculum-v2/state/learnerState.js';

export const CLOUD_STATE_SCHEMA_VERSION = V2_LEARNER_STATE_VERSION;
export const V2_ARTIFACT_TOMBSTONES_KEY = 'xca_v2_artifact_tombstones_v1';

const NOTE_FIELDS = new Set([
  'id', 'roadmapId', 'createdAt', 'updatedAt', 'date', 'title', 'name', 'subject', 'noteType', 'type',
  'insightScope', 'content', 'body', 'text', 'linkedWeek', 'weekNumber', 'week', 'linkedMission',
  'missionId', 'missionTitle', 'linkedResource', 'resourceTitle', 'resourceId', 'linkedProject',
  'projectId', 'projectIndex', 'linkedBlocker', 'blockerId', 'problemId', 'focusStage', 'stageLabel',
  'stage', 'skillArea', 'focusSessionId', 'sessionId', 'selectedFocusBlock', 'whatLearned',
  'whatILearned', 'whatConfused', 'whatConfusedMe', 'whatBuilt', 'buildNotes', 'questionsForMentor',
  'mentorQuestion', 'nextAction', 'nextStep',
]);
const BLOCKER_FIELDS = new Set([
  'id', 'roadmapId', 'createdAt', 'updatedAt', 'dateCreated', 'dateSolved', 'resolvedAt', 'closedAt',
  'date', 'timestamp', 'title', 'status', 'solutionNotes', 'resolution', 'solution', 'whatFixedIt',
  'weekNumber', 'linkedWeek', 'week', 'focusStage', 'stage', 'skillArea', 'missionTitle', 'missionId',
  'linkedMission', 'resourceTitle', 'linkedResource', 'projectTitle', 'projectId', 'linkedProject',
  'whatTryingToDo', 'taskTitle', 'currentTask', 'whatWentWrong', 'description', 'errorMessage',
  'whatAlreadyTried', 'whatTried', 'attempts',
]);

const clone = (value) => structuredClone(value);
const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

function selectFields(record, allowed) {
  return Object.fromEntries(Object.entries(record || {}).filter(([key, value]) => allowed.has(key) && value !== undefined));
}

export function isV2LinkedRecord(record, curriculumId) {
  return record?.roadmapId === curriculumId;
}

export function projectForCloud({ curriculumState, notes = [], blockers = [], tombstones = [], curriculumId }) {
  if (!curriculumState || curriculumState.curriculumId !== curriculumId) throw new Error('Curriculum state does not match projection identity.');
  const projected = clone(curriculumState);
  for (const skillCheck of Object.values(projected.skillChecks || {})) {
    for (const attempt of skillCheck.attempts || []) delete attempt.questionSnapshot;
  }
  return {
    curriculumState: projected,
    notes: {
      records: notes.filter((record) => isV2LinkedRecord(record, curriculumId)).map((record) => selectFields(record, NOTE_FIELDS)),
      tombstones: tombstones.filter((record) => record.curriculumId === curriculumId && record.recordType === 'note').map(clone),
    },
    blockers: {
      records: blockers.filter((record) => isV2LinkedRecord(record, curriculumId)).map((record) => selectFields(record, BLOCKER_FIELDS)),
      tombstones: tombstones.filter((record) => record.curriculumId === curriculumId && record.recordType === 'blocker').map(clone),
    },
  };
}

function questionIndex(runtime) {
  return new Map(runtime.weeks.flatMap((week) => week.skillCheck.questions.map((question) => [question.id, question])));
}

function restoreAttemptSnapshots(cloudState, localState, runtime) {
  const restored = clone(cloudState);
  const currentQuestions = questionIndex(runtime);
  for (const [skillCheckId, record] of Object.entries(restored.skillChecks || {})) {
    const localAttempts = new Map((localState?.skillChecks?.[skillCheckId]?.attempts || []).map((attempt) => [attempt.attemptId, attempt]));
    for (const attempt of record.attempts || []) {
      const localSnapshot = localAttempts.get(attempt.attemptId)?.questionSnapshot;
      if (Array.isArray(localSnapshot) && localSnapshot.length) {
        attempt.questionSnapshot = clone(localSnapshot);
        continue;
      }
      const questions = (attempt.questionIds || []).map((id) => currentQuestions.get(id)).filter(Boolean);
      if (questions.length !== (attempt.questionIds || []).length) continue;
      attempt.questionSnapshot = questions.map((question) => ({
        id: question.id,
        prompt: question.prompt,
        options: question.options.map((option) => ({ id: option.id, label: option.label })),
        correctOptionId: String(question.correctOptionId),
        explanation: question.explanation || null,
      }));
    }
  }
  return restored;
}

function hydrateArtifacts(localRecords, cloudGroup, curriculumId) {
  const localOther = localRecords.filter((record) => !isV2LinkedRecord(record, curriculumId));
  const localById = new Map(localRecords.filter((record) => isV2LinkedRecord(record, curriculumId)).map((record) => [record.id, record]));
  const deleted = new Set((cloudGroup?.tombstones || []).map((item) => item.id));
  const restored = (cloudGroup?.records || [])
    .filter((record) => !deleted.has(record.id))
    .map((record) => ({ ...(localById.get(record.id) || {}), ...clone(record) }));
  return [...restored, ...localOther];
}

export function hydrateFromCloud({ localCurriculumState, cloudState, runtime, notes = [], blockers = [] }) {
  if (!isObject(cloudState?.curriculumState) || cloudState.curriculumState.curriculumId !== runtime.curriculumId) {
    throw new Error('Cloud state does not match the current curriculum.');
  }
  const withSnapshots = restoreAttemptSnapshots(cloudState.curriculumState, localCurriculumState, runtime);
  const reconciledStore = reconcileCurriculumState({
    version: V2_LEARNER_STATE_VERSION,
    curricula: { [runtime.curriculumId]: withSnapshots },
  }, runtime);
  return {
    curriculumState: getCurriculumState(reconciledStore, runtime.curriculumId),
    notes: hydrateArtifacts(notes, cloudState.notes, runtime.curriculumId),
    blockers: hydrateArtifacts(blockers, cloudState.blockers, runtime.curriculumId),
    tombstones: [
      ...(cloudState.notes?.tombstones || []),
      ...(cloudState.blockers?.tombstones || []),
    ].map(clone),
  };
}

export function hasMeaningfulProgress(curriculumState, cloudState = null) {
  if (!curriculumState) return false;
  const hasMapValues = (value) => isObject(value) && Object.keys(value).length > 0;
  return (curriculumState.completedWeekIds || []).length > 0
    || hasMapValues(curriculumState.stageSatisfaction)
    || hasMapValues(curriculumState.resources)
    || hasMapValues(curriculumState.skillChecks)
    || hasMapValues(curriculumState.builds)
    || hasMapValues(curriculumState.proofs)
    || hasMapValues(curriculumState.reflections)
    || (cloudState?.notes?.records || []).length > 0
    || (cloudState?.notes?.tombstones || []).length > 0
    || (cloudState?.blockers?.records || []).length > 0
    || (cloudState?.blockers?.tombstones || []).length > 0;
}
