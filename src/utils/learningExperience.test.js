import assert from 'node:assert/strict';
import test from 'node:test';
import { curriculumCatalog } from '../curriculum-v2/catalog/catalog.js';
import {
  activateCurriculumSelection,
  getCurriculumLaunchLabel,
} from '../curriculum-v2/state/curriculumSelection.js';
import {
  completeV2Resource,
  EMPTY_V2_STATE_STORE,
} from '../curriculum-v2/state/learnerState.js';
import {
  getCurrentCourseDefinition,
  ONBOARDING_DESTINATION,
  resolveCurriculumMode,
  shouldRenderExclusiveOnboarding,
} from './learningExperience.js';

const staleLegacyRoadmap = {
  id: 'legacy-javascript',
  bootcampTitle: 'XcelerateAI 6-Month JavaScript Mobile Ops Bootcamp',
  months: [{ weeks: [{}, {}] }],
};

test('incomplete onboarding owns the whole screen and completion routes to the catalog', () => {
  assert.equal(shouldRenderExclusiveOnboarding(false), true);
  assert.equal(shouldRenderExclusiveOnboarding(true), false);
  assert.equal(ONBOARDING_DESTINATION, '/curricula');
});

test('no selected V2 curriculum resolves to catalog mode and ignores stale bundled V1 display data', () => {
  const mode = resolveCurriculumMode({ activeV2Curriculum: null, usingCustomRoadmap: false });
  assert.equal(mode, 'catalog');
  assert.equal(getCurrentCourseDefinition({ curriculumMode: mode, activeV2Curriculum: null, roadmap: staleLegacyRoadmap }), null);
  assert.deepEqual(curriculumCatalog.listPublished().map((item) => item.title), ['Python Agent Engineering']);
  assert.equal(curriculumCatalog.listPublished().some((item) => item.title.includes('JavaScript')), false);
});

test('selecting PYAE establishes the V2 course even when stale V1 state exists', () => {
  const runtime = curriculumCatalog.getLatest('PYAE');
  const selection = activateCurriculumSelection(curriculumCatalog, EMPTY_V2_STATE_STORE, 'PYAE');
  const mode = resolveCurriculumMode({ activeV2Curriculum: runtime, usingCustomRoadmap: true });
  const current = getCurrentCourseDefinition({ curriculumMode: mode, activeV2Curriculum: runtime, roadmap: staleLegacyRoadmap });

  assert.equal(selection.accepted, true);
  assert.equal(selection.activeCurriculumId, 'PYAE');
  assert.equal(mode, 'v2');
  assert.equal(current.title, 'Python Agent Engineering');
  assert.equal(current.title.includes('JavaScript'), false);
});

test('explicitly imported V1 curricula remain available only in legacy mode', () => {
  const mode = resolveCurriculumMode({ activeV2Curriculum: null, usingCustomRoadmap: true });
  const current = getCurrentCourseDefinition({ curriculumMode: mode, activeV2Curriculum: null, roadmap: staleLegacyRoadmap });
  assert.equal(mode, 'legacy');
  assert.equal(current.title, staleLegacyRoadmap.bootcampTitle);
});

test('Start and Continue remain curriculum-specific without changing V2 learner progress', () => {
  const runtime = curriculumCatalog.getLatest('PYAE');
  const selection = activateCurriculumSelection(curriculumCatalog, EMPTY_V2_STATE_STORE, 'PYAE');
  const before = structuredClone(selection.stateStore);
  assert.equal(getCurriculumLaunchLabel(before, 'PYAE'), 'Start');

  const progressed = completeV2Resource(before, runtime, 'PYAE-W01', 'PYAE-R-W01-01', '2026-09-05T00:00:00.000Z');
  assert.equal(getCurriculumLaunchLabel(progressed, 'PYAE'), 'Continue');
  assert.deepEqual(selection.stateStore, before);
  assert.equal(progressed.curricula.PYAE.resources['PYAE-W01']['PYAE-R-W01-01'].completedAt, '2026-09-05T00:00:00.000Z');
});
