import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { createCatalogEntry, createCurriculumCatalog } from '../catalog/publishCurriculum.js';
import { compileCurriculum } from '../compiler/compileCurriculum.js';
import { getV2WeekProgress } from '../runtime/progression.js';
import { createSubmittedAttempt } from '../../utils/skillCheckUtils.js';
import { createV2BackupSlice, restoreV2BackupSlice } from './backupReconciliation.js';
import {
  completeV2Resource,
  EMPTY_V2_STATE_STORE,
  getCurriculumState,
  reconcileCurriculumState,
  recordV2ResourceOpened,
  setV2BuildCompleted,
  submitV2SkillCheckAttempt,
} from './learnerState.js';

const revisionTwoPath = new URL('../test-fixtures/pyae-revision-2/curriculum-source.json', import.meta.url);
const revisionThreePath = new URL('../../../XcelerateAI Curriculum System/v2/curricula/python-agent-engineering/curriculum-source.json', import.meta.url);
const productionCatalogPath = new URL('../catalog/catalog.js', import.meta.url);
const readJson = (url) => JSON.parse(fs.readFileSync(url, 'utf8'));
const at = (minute) => `2026-09-09T09:${String(minute).padStart(2, '0')}:00.000Z`;

function passingAttempt(runtime, weekId) {
  const definition = runtime.indexes.weeksById[weekId].skillCheck;
  const answers = Object.fromEntries(definition.questions.map((question) => [question.id, question.correctOptionId]));
  return createSubmittedAttempt({
    definition,
    answers,
    attemptNumber: 1,
    attemptId: 'pyae-r2-passing-attempt',
    submittedAt: at(5),
  });
}

test('the isolated PYAE R2 fixture reconciles into the authored R3 candidate without a new namespace', () => {
  const r2Source = readJson(revisionTwoPath);
  const r3Source = readJson(revisionThreePath);
  assert.equal(r2Source.curriculumId, 'PYAE');
  assert.equal(r2Source.revision, 2);
  assert.equal(r3Source.curriculumId, 'PYAE');
  assert.equal(r3Source.revision, 3);

  const r2 = compileCurriculum(r2Source);
  const r3 = compileCurriculum(r3Source);
  const r2WeekIds = r2.weeks.map((week) => week.id);
  assert.deepEqual(r3.weeks.map((week) => week.id), r2WeekIds);
  r2WeekIds.forEach((weekId) => {
    const before = r2.indexes.weeksById[weekId];
    const after = r3.indexes.weeksById[weekId];
    assert.equal(after.skillCheck.id, before.skillCheck.id, `${weekId} Skill Check identity`);
    assert.deepEqual(after.skillCheck.questions.map((question) => question.id), before.skillCheck.questions.map((question) => question.id), `${weekId} question identities`);
    assert.deepEqual(after.builds.map((build) => build.id), before.builds.map((build) => build.id), `${weekId} Build identities`);
    assert.equal(after.proof.id, before.proof.id, `${weekId} Proof identity`);
    assert.deepEqual(after.reflection.prompts.map((prompt) => prompt.id), before.reflection.prompts.map((prompt) => prompt.id), `${weekId} Reflection identities`);
  });

  let store = reconcileCurriculumState(EMPTY_V2_STATE_STORE, r2);
  const r2WeekOne = r2.indexes.weeksById['PYAE-W01'];
  for (const assignment of r2WeekOne.study.resources.filter((entry) => entry.role === 'core')) {
    store = recordV2ResourceOpened(store, r2, 'PYAE-W01', assignment.resourceId, { openedAt: at(1) });
    store = completeV2Resource(store, r2, 'PYAE-W01', assignment.resourceId, at(2));
  }
  store = submitV2SkillCheckAttempt(
    store,
    r2,
    'PYAE-W01',
    r2WeekOne.skillCheck.id,
    passingAttempt(r2, 'PYAE-W01'),
  );
  store = setV2BuildCompleted(store, r2, 'PYAE-W01', r2WeekOne.builds[0].id, true, at(6));

  const r2State = getCurriculumState(store, 'PYAE');
  assert.equal(getV2WeekProgress(r2, r2State, 'PYAE-W01').study.done, true);
  assert.equal(getV2WeekProgress(r2, r2State, 'PYAE-W01').skillCheck.done, true);
  assert.equal(getV2WeekProgress(r2, r2State, 'PYAE-W01').builds.done, true);

  const backup = JSON.parse(JSON.stringify(createV2BackupSlice(store, 'PYAE')));
  const serializedBackup = JSON.stringify(backup);
  assert.equal(serializedBackup.includes('test-fixtures'), false);
  assert.equal(serializedBackup.includes('Python Workspace and First CLI'), false, 'backup contains learner state, not curriculum content');
  const catalog = createCurriculumCatalog([createCatalogEntry(r3)]);
  const restored = restoreV2BackupSlice(backup, catalog);
  const r3State = getCurriculumState(restored.stateStore, 'PYAE');
  const progress = getV2WeekProgress(r3, r3State, 'PYAE-W01');

  assert.equal(restored.activeCurriculumId, 'PYAE');
  assert.equal(Object.keys(restored.stateStore.curricula).length, 1);
  assert.equal(r3State.lastSeenRevision, 3);
  assert.equal(progress.study.done, true, 'past satisfied Study survives newly added Core resources');
  assert.equal(progress.skillCheck.done, true, 'past passing attempt survives repaired question content');
  assert.equal(progress.builds.done, true, 'past completed stable-ID Build remains complete');
  assert.equal(r3State.skillChecks[r2WeekOne.skillCheck.id].attempts.length, 1);
  assert.ok(r3State.resources['PYAE-W01']['PYAE-R-W01-01'].openedAt);

  const fresh = getCurriculumState(reconcileCurriculumState(EMPTY_V2_STATE_STORE, r3), 'PYAE');
  const freshProgress = getV2WeekProgress(r3, fresh, 'PYAE-W01');
  assert.equal(freshProgress.study.done, false);
  assert.equal(freshProgress.study.required, r3.indexes.weeksById['PYAE-W01'].study.coreMinimum);
  assert.ok(freshProgress.study.required > r2WeekOne.study.coreMinimum, 'new learners receive the complete R3 Study set');
});

test('the R2 fixture is isolated from production catalog imports', () => {
  const catalogModule = fs.readFileSync(productionCatalogPath, 'utf8');
  assert.equal(catalogModule.includes('test-fixtures'), false);
  assert.equal(catalogModule.includes('pyae-revision-2'), false);
});
