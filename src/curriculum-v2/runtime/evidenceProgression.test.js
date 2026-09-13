import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { compileCurriculum } from '../compiler/compileCurriculum.js';
import { getV2WeekProgress } from './progression.js';
import { EMPTY_V2_STATE_STORE, getCurriculumState, reconcileCurriculumState, setV2ProofEvidence } from '../state/learnerState.js';

const sourcePath = new URL('../../../XcelerateAI Curriculum System/v2/curricula/python-agent-engineering/curriculum-source.json', import.meta.url);
const runtime = compileCurriculum(JSON.parse(fs.readFileSync(sourcePath, 'utf8')));
const week = runtime.weeks[0];

function readyForProof() {
  const store = reconcileCurriculumState(EMPTY_V2_STATE_STORE, runtime);
  const state = store.curricula[runtime.curriculumId];
  state.stageSatisfaction[week.id] = {
    study: { satisfied: true }, skillCheck: { satisfied: true }, builds: { satisfied: true },
  };
  return { store, state };
}

test('PYAE R3 Proof requires a current server-acknowledged submission, not draft content or an old latch', () => {
  const { store } = readyForProof();
  let next = store;
  for (const item of week.proof.evidence) {
    const value = item.type === 'confirmation' ? true : item.type === 'link' ? 'https://example.com/proof' : 'local draft';
    next = setV2ProofEvidence(next, runtime, week.id, week.proof.id, item.id, value, '2026-09-11T00:00:00.000Z');
  }
  const state = getCurriculumState(next, runtime.curriculumId);
  state.stageSatisfaction[week.id].proof = { satisfied: true, satisfiedAt: '2026-09-10T00:00:00.000Z' };
  assert.equal(getV2WeekProgress(runtime, state, week.id).proof.done, false);
  const receipt = { currentByProof: { [week.proof.id]: { id: 'server-id', status: 'submitted' } } };
  assert.equal(getV2WeekProgress(runtime, state, week.id, receipt).proof.done, true);
  assert.equal(getV2WeekProgress(runtime, state, week.id, receipt).reflection.unlocked, true);
});

test('a completed week remains durable even if its historical evidence receipt is not cached', () => {
  const { state } = readyForProof();
  state.completedWeekIds.push(week.id);
  const progress = getV2WeekProgress(runtime, state, week.id);
  assert.equal(progress.completed, true);
  assert.equal(progress.proof.done, true);
});
