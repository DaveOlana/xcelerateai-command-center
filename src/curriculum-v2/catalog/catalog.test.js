import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { compileCurriculum } from '../compiler/compileCurriculum.js';
import { createCatalogEntry, createCurriculumCatalog } from './publishCurriculum.js';
import { getCurriculumLaunchLabel, resolveActiveCurriculumId } from '../state/curriculumSelection.js';
import { completeV2Resource, EMPTY_V2_STATE_STORE, reconcileCurriculumState } from '../state/learnerState.js';

const sourcePath = new URL('../../../XcelerateAI Curriculum System/v2/examples/golden-curriculum/curriculum-source.json', import.meta.url);
const fixture = () => JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

test('catalog exposes only latest published revision and excludes drafts', () => {
  const first = compileCurriculum(fixture());
  const revisionSource = fixture();
  revisionSource.revision = 2;
  const second = compileCurriculum(revisionSource);
  const catalog = createCurriculumCatalog([
    createCatalogEntry(first, 'published'),
    createCatalogEntry(second, 'published'),
    createCatalogEntry({ ...second, curriculumId: 'DRAFT' }, 'draft'),
  ]);
  assert.deepEqual(catalog.listPublished().map((item) => item.curriculumId), ['GOLDEN']);
  assert.equal(catalog.getLatest('GOLDEN').revision, 2);
});
test('duplicate curriculum revision and invalid runtime cannot enter catalog', () => {
  const runtime = compileCurriculum(fixture());
  const entry = createCatalogEntry(runtime);
  assert.throws(() => createCurriculumCatalog([entry, entry]), /Duplicate catalog entry/);
  assert.throws(() => createCatalogEntry({ ...runtime, weeks: [] }), /validation failed/i);
});

test('Start and Continue derive from curriculum-specific state', () => {
  const runtime = compileCurriculum(fixture());
  let store = reconcileCurriculumState(EMPTY_V2_STATE_STORE, runtime);
  assert.equal(getCurriculumLaunchLabel(store, 'GOLDEN'), 'Start');
  store = completeV2Resource(store, runtime, 'GOLDEN-W01', 'GOLDEN-R001', '2026-01-01T00:00:00.000Z');
  assert.equal(getCurriculumLaunchLabel(store, 'GOLDEN'), 'Continue');
});

test('current selection restores only when still published', () => {
  const runtime = compileCurriculum(fixture());
  const catalog = createCurriculumCatalog([createCatalogEntry(runtime)]);
  assert.equal(resolveActiveCurriculumId(catalog, 'GOLDEN'), 'GOLDEN');
  assert.equal(resolveActiveCurriculumId(catalog, 'REMOVED'), null);
});
