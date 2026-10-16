import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { compileCurriculum } from '../compiler/compileCurriculum.js';
import { getV2WeekProgress } from '../runtime/progression.js';
import {
  completeV2Resource,
  EMPTY_V2_STATE_STORE,
  getCurriculumState,
  reconcileCurriculumState,
} from './learnerState.js';

const readSource = (relativePath) => JSON.parse(fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8'));
const revision1 = compileCurriculum(readSource('../../../XcelerateAI Curriculum System/v2/curricula/introductory-computer-science/java-introduction/curriculum-source.json'));
const revision2 = compileCurriculum(readSource('../../../XcelerateAI Curriculum System/v2/curricula/introductory-computer-science/java-introduction-r2/curriculum-source.json'));

test('JAVA R1 progress remains archived but cannot satisfy or unlock R2 Week stages', () => {
  let store = reconcileCurriculumState(EMPTY_V2_STATE_STORE, revision1);
  store = completeV2Resource(store, revision1, 'JAVA-W01', 'JAVA-R-W01-01', '2026-10-01T10:00:00.000Z');

  const oldState = store.curricula.JAVA;
  oldState.completedWeekIds.push('JAVA-W01');
  oldState.stageSatisfaction['JAVA-W01'] = {
    study: { satisfied: true, satisfiedAt: '2026-10-01T10:00:00.000Z' },
    skillCheck: { satisfied: true, satisfiedAt: '2026-10-01T10:05:00.000Z' },
    builds: { satisfied: true, satisfiedAt: '2026-10-01T10:10:00.000Z' },
    proof: { satisfied: true, satisfiedAt: '2026-10-01T10:15:00.000Z' },
    reflection: { satisfied: true, satisfiedAt: '2026-10-01T10:20:00.000Z' },
  };

  store = reconcileCurriculumState(store, revision2);
  const state = getCurriculumState(store, 'JAVA');
  const progress = getV2WeekProgress(revision2, state, 'JAVA-R2-W01');

  assert.equal(state.lastSeenRevision, 2);
  assert.equal(state.activeWeekId, 'JAVA-R2-W01');
  assert.equal(state.completedWeekIds.includes('JAVA-W01'), true);
  assert.equal(state.completedWeekIds.includes('JAVA-R2-W01'), false);
  assert.equal(progress.completed, false);
  assert.equal(progress.study.done, false);
  assert.equal(progress.study.unlocked, true);
  assert.equal(progress.study.completedCore, 0);
  assert.equal(progress.study.required, revision2.weeks[0].study.coreMinimum);
  assert.equal(progress.skillCheck.done, false);
  assert.equal(progress.skillCheck.unlocked, false);
  assert.equal(progress.builds.unlocked, false);
  assert.equal(progress.proof.unlocked, false);
  assert.equal(progress.reflection.unlocked, false);
  assert.equal(progress.complete.unlocked, false);
});

test('every JAVA R2 Week and progression latch uses the revision-specific namespace', () => {
  assert.equal(revision1.weeks.every((week) => /^JAVA-W\d{2}$/.test(week.id)), true);
  assert.equal(revision2.weeks.every((week) => /^JAVA-R2-W\d{2}$/.test(week.id)), true);
  assert.equal(revision2.weeks.some((week) => revision1.indexes.weeksById[week.id]), false);
});
