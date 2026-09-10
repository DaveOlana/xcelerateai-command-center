import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { compileCurriculum } from '../compiler/compileCurriculum.js';
import {
  completeV2Resource,
  completeV2Week,
  EMPTY_V2_STATE_STORE,
  getCurriculumState,
  reconcileCurriculumState,
  setV2BuildCompleted,
  setV2ProofEvidence,
  setV2ReflectionResponse,
  submitV2SkillCheckAttempt,
  resetCurriculumState,
} from './learnerState.js';
import { createSubmittedAttempt } from '../../utils/skillCheckUtils.js';
import { getV2ProjectProgress } from '../runtime/projects.js';
import { getV2WeekProgress } from '../runtime/progression.js';
import { deriveV2CompetencyProgress } from '../runtime/competencyProgress.js';

const sourcePath = new URL('../../../XcelerateAI Curriculum System/v2/examples/golden-curriculum/curriculum-source.json', import.meta.url);
const fixture = () => JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

function revision2(mutator) {
  const source = fixture();
  source.revision = 2;
  mutator?.(source);
  return compileCurriculum(source);
}

function satisfyStudy(store, runtime, weekId = 'GOLDEN-W01') {
  store = completeV2Resource(store, runtime, weekId, runtime.indexes.weeksById[weekId].study.resources[0].resourceId, '2026-01-01T00:00:00.000Z');
  return completeV2Resource(store, runtime, weekId, runtime.indexes.weeksById[weekId].study.resources[1].resourceId, '2026-01-01T00:01:00.000Z');
}

test('resource title rename preserves ID-keyed progress and same curriculum namespace', () => {
  const first = compileCurriculum(fixture());
  let store = reconcileCurriculumState(EMPTY_V2_STATE_STORE, first);
  store = completeV2Resource(store, first, 'GOLDEN-W01', 'GOLDEN-R001', '2026-01-01T00:00:00.000Z');
  const second = revision2((source) => { source.resources[0].title = 'Renamed observable problem notes'; });
  store = reconcileCurriculumState(store, second);
  const state = getCurriculumState(store, 'GOLDEN');
  assert.ok(state.resources['GOLDEN-W01']['GOLDEN-R001'].completedAt);
  assert.equal(Object.keys(store.curricula).length, 1);
  assert.equal(state.lastSeenRevision, 2);
});

test('satisfied Study remains satisfied when a revision replaces Core requirements', () => {
  const first = compileCurriculum(fixture());
  let store = reconcileCurriculumState(EMPTY_V2_STATE_STORE, first);
  store = satisfyStudy(store, first);
  const second = revision2((source) => {
    source.resources[0].id = 'GOLDEN-R001-R2';
    source.weeks[0].study.resources[0].resourceId = 'GOLDEN-R001-R2';
  });
  store = reconcileCurriculumState(store, second);
  assert.equal(getV2WeekProgress(second, getCurriculumState(store, 'GOLDEN'), 'GOLDEN-W01').study.done, true);
});

test('unsatisfied assessment receives new ID while satisfied assessment remains durable', () => {
  const first = compileCurriculum(fixture());
  let unsatisfiedStore = reconcileCurriculumState(EMPTY_V2_STATE_STORE, first);
  unsatisfiedStore = satisfyStudy(unsatisfiedStore, first);
  const satisfiedAnswers = Object.fromEntries(first.weeks[0].skillCheck.questions.map((q) => [q.id, q.correctOptionId]));
  const attempt = createSubmittedAttempt({ definition: first.weeks[0].skillCheck, answers: satisfiedAnswers, attemptNumber: 1, attemptId: 'a1', submittedAt: '2026-01-01T00:02:00.000Z' });
  let satisfiedStore = submitV2SkillCheckAttempt(unsatisfiedStore, first, 'GOLDEN-W01', first.weeks[0].skillCheck.id, attempt);
  const second = revision2((source) => { source.weeks[0].skillCheck.id = 'GOLDEN-SC-W01-R2'; });
  unsatisfiedStore = reconcileCurriculumState(unsatisfiedStore, second);
  satisfiedStore = reconcileCurriculumState(satisfiedStore, second);
  assert.equal(getV2WeekProgress(second, getCurriculumState(unsatisfiedStore, 'GOLDEN'), 'GOLDEN-W01').skillCheck.done, false);
  assert.equal(getV2WeekProgress(second, getCurriculumState(satisfiedStore, 'GOLDEN'), 'GOLDEN-W01').skillCheck.done, true);
});

test('completed Week remains complete after requirements change', () => {
  const first = compileCurriculum(fixture());
  let store = reconcileCurriculumState(EMPTY_V2_STATE_STORE, first);
  store = satisfyStudy(store, first);
  const answers = Object.fromEntries(first.weeks[0].skillCheck.questions.map((q) => [q.id, q.correctOptionId]));
  store = submitV2SkillCheckAttempt(store, first, 'GOLDEN-W01', first.weeks[0].skillCheck.id, createSubmittedAttempt({ definition: first.weeks[0].skillCheck, answers, attemptNumber: 1, attemptId: 'a1', submittedAt: '2026-01-01T00:02:00.000Z' }));
  store = setV2BuildCompleted(store, first, 'GOLDEN-W01', 'GOLDEN-B-W01-01', true, '2026-01-01T00:03:00.000Z');
  for (const evidence of first.weeks[0].proof.evidence) store = setV2ProofEvidence(store, first, 'GOLDEN-W01', first.weeks[0].proof.id, evidence.id, evidence.type === 'confirmation' ? true : evidence.type === 'link' ? 'https://example.com' : 'Sufficient evidence text', '2026-01-01T00:04:00.000Z');
  store = setV2ReflectionResponse(store, first, 'GOLDEN-W01', 'GOLDEN-RF-W01-01', 'A meaningful reflection response.', '2026-01-01T00:05:00.000Z');
  store = completeV2Week(store, first, 'GOLDEN-W01', '2026-01-01T00:06:00.000Z');
  const second = revision2((source) => { source.weeks[0].title = 'Changed completed week'; });
  store = reconcileCurriculumState(store, second);
  assert.equal(getV2WeekProgress(second, getCurriculumState(store, 'GOLDEN'), 'GOLDEN-W01').completed, true);
});

test('Project reorder does not orphan Build-derived milestones', () => {
  const first = compileCurriculum(fixture());
  let store = reconcileCurriculumState(EMPTY_V2_STATE_STORE, first);
  store = setV2BuildCompleted(store, first, 'GOLDEN-W01', 'GOLDEN-B-W01-01', true, '2026-01-01T00:00:00.000Z');
  const second = revision2((source) => source.projects.reverse());
  store = reconcileCurriculumState(store, second);
  assert.equal(getV2ProjectProgress(second, getCurriculumState(store, 'GOLDEN'), 'GOLDEN-PJ01').completedCount, 1);
});

test('multiple curriculum states remain independent', () => {
  const golden = compileCurriculum(fixture());
  const otherSource = fixture();
  otherSource.curriculumId = 'OTHER';
  const replace = (value) => typeof value === 'string' ? value.replaceAll('GOLDEN', 'OTHER') : value;
  const deepReplace = (value) => Array.isArray(value) ? value.map(deepReplace) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, deepReplace(v)])) : replace(value);
  const other = compileCurriculum(deepReplace(otherSource));
  let store = reconcileCurriculumState(EMPTY_V2_STATE_STORE, golden);
  store = completeV2Resource(store, golden, 'GOLDEN-W01', 'GOLDEN-R001', '2026-01-01T00:00:00.000Z');
  store = reconcileCurriculumState(store, other);
  assert.ok(getCurriculumState(store, 'GOLDEN').resources['GOLDEN-W01']);
  assert.deepEqual(getCurriculumState(store, 'OTHER').resources, {});
});

test('curriculum-specific reset removes only the selected curriculum namespace', () => {
  const golden = compileCurriculum(fixture());
  const deepReplace = (value) => Array.isArray(value)
    ? value.map(deepReplace)
    : value && typeof value === 'object'
      ? Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, deepReplace(entry)]))
      : typeof value === 'string' ? value.replaceAll('GOLDEN', 'OTHER') : value;
  const other = compileCurriculum(deepReplace({ ...fixture(), curriculumId: 'OTHER' }));
  let store = reconcileCurriculumState(EMPTY_V2_STATE_STORE, golden);
  store = completeV2Resource(store, golden, 'GOLDEN-W01', 'GOLDEN-R001', '2026-01-01T00:00:00.000Z');
  store = reconcileCurriculumState(store, other);
  store = completeV2Resource(store, other, 'OTHER-W01', 'OTHER-R001', '2026-01-01T00:00:00.000Z');
  store = resetCurriculumState(store, 'GOLDEN');
  assert.equal(getCurriculumState(store, 'GOLDEN'), null);
  assert.ok(getCurriculumState(store, 'OTHER').resources['OTHER-W01']);
});

test('competency display rename preserves ID-based evidence', () => {
  const first = compileCurriculum(fixture());
  let store = reconcileCurriculumState(EMPTY_V2_STATE_STORE, first);
  store = satisfyStudy(store, first);
  const second = revision2((source) => { source.competencies[0].name = 'Renamed observation competency'; });
  store = reconcileCurriculumState(store, second);
  const evidence = deriveV2CompetencyProgress(second, getCurriculumState(store, 'GOLDEN')).find((item) => item.competencyId === 'GOLDEN-C001');
  assert.equal(evidence.name, 'Renamed observation competency');
  assert.notEqual(evidence.status, 'not_started');
});

test('V2 learner state survives JSON backup round-trip before revision reconciliation', () => {
  const first = compileCurriculum(fixture());
  let store = reconcileCurriculumState(EMPTY_V2_STATE_STORE, first);
  store = satisfyStudy(store, first);
  const restored = JSON.parse(JSON.stringify(store));
  const second = revision2();
  const reconciled = reconcileCurriculumState(restored, second);
  const state = getCurriculumState(reconciled, 'GOLDEN');
  assert.equal(state.lastSeenRevision, 2);
  assert.equal(state.stageSatisfaction['GOLDEN-W01'].study.satisfied, true);
});
