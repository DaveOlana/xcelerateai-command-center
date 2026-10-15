import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { compileCurriculum } from '../compiler/compileCurriculum.js';
import { EMPTY_V2_STATE_STORE, getCurriculumState, reconcileCurriculumState, setV2ProofEvidence } from '../state/learnerState.js';
import { getV2WeekProgress, requiresServerProofSubmission } from './progression.js';
import { getLocalProofEntries } from './proofPresentation.js';

const goldenPath = new URL('../../../XcelerateAI Curriculum System/v2/examples/golden-curriculum/curriculum-source.json', import.meta.url);
const pyaePath = new URL('../../../XcelerateAI Curriculum System/v2/curricula/python-agent-engineering/curriculum-source.json', import.meta.url);

test('only PYAE revision 3 and later use the server Proof submission experience', () => {
  assert.equal(requiresServerProofSubmission({ curriculumId: 'PYAE', revision: 3 }), true);
  assert.equal(requiresServerProofSubmission({ curriculumId: 'PYAE', revision: 4 }), true);
  assert.equal(requiresServerProofSubmission({ curriculumId: 'PYAE', revision: 2 }), false);
  assert.equal(requiresServerProofSubmission({ curriculumId: 'JSIN', revision: 2 }), false);
  assert.equal(requiresServerProofSubmission({ curriculumId: 'FEWE', revision: 1 }), false);
  assert.equal(requiresServerProofSubmission(null), false);
});

test('local Proof records unlock Reflection and appear as ready for human review without a server receipt', () => {
  const runtime = compileCurriculum(JSON.parse(fs.readFileSync(goldenPath, 'utf8')));
  const week = runtime.weeks[0];
  let store = reconcileCurriculumState(EMPTY_V2_STATE_STORE, runtime);
  store.curricula[runtime.curriculumId].stageSatisfaction[week.id] = { study: { satisfied: true }, skillCheck: { satisfied: true }, builds: { satisfied: true } };

  for (const item of week.proof.evidence) {
    const value = item.type === 'confirmation' ? true : item.type === 'link' ? 'https://example.com/proof' : 'A reproducible result and the repair I made.';
    store = setV2ProofEvidence(store, runtime, week.id, week.proof.id, item.id, value, '2026-10-14T10:00:00.000Z');
  }

  const learner = getCurriculumState(store, runtime.curriculumId);
  const progress = getV2WeekProgress(runtime, learner, week.id);
  const entries = getLocalProofEntries(runtime, learner);
  assert.equal(progress.proof.done, true);
  assert.equal(progress.reflection.unlocked, true);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].complete, true);
  assert.equal(entries[0].items.length, week.proof.evidence.length);
  assert.equal(entries[0].updatedAt, '2026-10-14T10:00:00.000Z');
});

test('PYAE R3 remains receipt-gated even when all local draft fields are complete', () => {
  const runtime = compileCurriculum(JSON.parse(fs.readFileSync(pyaePath, 'utf8')));
  const week = runtime.weeks[0];
  let store = reconcileCurriculumState(EMPTY_V2_STATE_STORE, runtime);
  store.curricula[runtime.curriculumId].stageSatisfaction[week.id] = { study: { satisfied: true }, skillCheck: { satisfied: true }, builds: { satisfied: true } };
  for (const item of week.proof.evidence) {
    const value = item.type === 'confirmation' ? true : item.type === 'link' ? 'https://example.com/proof' : 'local draft';
    store = setV2ProofEvidence(store, runtime, week.id, week.proof.id, item.id, value, '2026-10-14T10:00:00.000Z');
  }
  const progress = getV2WeekProgress(runtime, getCurriculumState(store, runtime.curriculumId), week.id);
  assert.equal(progress.proof.done, false);
  assert.equal(progress.reflection.unlocked, false);
});
