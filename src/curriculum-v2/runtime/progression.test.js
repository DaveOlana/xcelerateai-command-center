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
} from '../state/learnerState.js';
import { getV2ProjectProgress } from './projects.js';
import { getV2WeekProgress } from './progression.js';
import { createSubmittedAttempt } from '../../utils/skillCheckUtils.js';

const sourcePath = new URL('../../../XcelerateAI Curriculum System/v2/examples/golden-curriculum/curriculum-source.json', import.meta.url);
const sourceFixture = () => JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const answerKey = (skillCheck) => Object.fromEntries(skillCheck.questions.map((question) => [question.id, question.correctOptionId]));

function setup() {
  const runtime = compileCurriculum(sourceFixture());
  const store = reconcileCurriculumState(EMPTY_V2_STATE_STORE, runtime);
  return { runtime, store };
}

test('complete V2 learner journey enforces every canonical gate', () => {
  let { runtime, store } = setup();
  const week = runtime.weeks[0];
  let state = getCurriculumState(store, runtime.curriculumId);
  assert.equal(getV2WeekProgress(runtime, state, week.id).skillCheck.unlocked, false);

  store = completeV2Resource(store, runtime, week.id, 'GOLDEN-R001', '2026-01-01T00:00:00.000Z');
  state = getCurriculumState(store, runtime.curriculumId);
  assert.equal(getV2WeekProgress(runtime, state, week.id).study.done, false);
  store = completeV2Resource(store, runtime, week.id, 'GOLDEN-R002', '2026-01-01T00:01:00.000Z');
  state = getCurriculumState(store, runtime.curriculumId);
  assert.equal(getV2WeekProgress(runtime, state, week.id).skillCheck.unlocked, true);

  const attempt = createSubmittedAttempt({ definition: week.skillCheck, answers: answerKey(week.skillCheck), attemptNumber: 1, attemptId: 'attempt-1', submittedAt: '2026-01-01T00:02:00.000Z' });
  store = submitV2SkillCheckAttempt(store, runtime, week.id, week.skillCheck.id, attempt);
  state = getCurriculumState(store, runtime.curriculumId);
  assert.equal(getV2WeekProgress(runtime, state, week.id).builds.unlocked, true);

  store = setV2BuildCompleted(store, runtime, week.id, 'GOLDEN-B-W01-02', true, '2026-01-01T00:03:00.000Z');
  state = getCurriculumState(store, runtime.curriculumId);
  assert.equal(getV2WeekProgress(runtime, state, week.id).proof.unlocked, false, 'optional Build must not satisfy required Build gate');
  store = setV2BuildCompleted(store, runtime, week.id, 'GOLDEN-B-W01-01', true, '2026-01-01T00:04:00.000Z');

  for (const evidence of week.proof.evidence) {
    const value = evidence.type === 'confirmation' ? true : evidence.type === 'link' ? 'https://example.com/proof' : 'Inspect the before and after observations.';
    store = setV2ProofEvidence(store, runtime, week.id, week.proof.id, evidence.id, value, '2026-01-01T00:05:00.000Z');
  }
  state = getCurriculumState(store, runtime.curriculumId);
  assert.equal(getV2WeekProgress(runtime, state, week.id).reflection.unlocked, true);
  store = setV2ReflectionResponse(store, runtime, week.id, week.reflection.prompts[0].id, 'I separated observations from conclusions.', '2026-01-01T00:06:00.000Z');
  state = getCurriculumState(store, runtime.curriculumId);
  assert.equal(getV2WeekProgress(runtime, state, week.id).complete.unlocked, true);
  store = completeV2Week(store, runtime, week.id, '2026-01-01T00:07:00.000Z');
  state = getCurriculumState(store, runtime.curriculumId);
  assert.ok(state.completedWeekIds.includes(week.id));
  assert.equal(state.activeWeekId, 'GOLDEN-W02');
});

test('Project milestone completion derives only from referenced Build completion', () => {
  let { runtime, store } = setup();
  let state = getCurriculumState(store, runtime.curriculumId);
  assert.equal(getV2ProjectProgress(runtime, state, 'GOLDEN-PJ01').completedCount, 0);
  store = setV2BuildCompleted(store, runtime, 'GOLDEN-W01', 'GOLDEN-B-W01-01', true, '2026-01-01T00:00:00.000Z');
  state = getCurriculumState(store, runtime.curriculumId);
  assert.equal(getV2ProjectProgress(runtime, state, 'GOLDEN-PJ01').completedCount, 1);
});

test('two failed V2 attempts activate recovery and canonical progression cannot bypass it', () => {
  let { runtime, store } = setup();
  const week = runtime.weeks[0];
  store = completeV2Resource(store, runtime, week.id, 'GOLDEN-R001', '2026-01-01T00:00:00.000Z');
  store = completeV2Resource(store, runtime, week.id, 'GOLDEN-R002', '2026-01-01T00:01:00.000Z');
  for (let number = 1; number <= 2; number += 1) {
    const attempt = createSubmittedAttempt({ definition: week.skillCheck, answers: {}, attemptNumber: number, attemptId: `failed-${number}`, submittedAt: `2026-01-01T00:0${number + 1}:00.000Z` });
    store = submitV2SkillCheckAttempt(store, runtime, week.id, week.skillCheck.id, attempt);
  }
  const status = getV2WeekProgress(runtime, getCurriculumState(store, runtime.curriculumId), week.id);
  assert.equal(status.recoveryLocked, true);
  assert.equal(status.skillCheck.unlocked, false);
  assert.equal(status.complete.unlocked, false);
});
