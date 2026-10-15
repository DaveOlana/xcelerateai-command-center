import assert from 'node:assert/strict';
import test from 'node:test';
import { curriculumCatalog } from './catalog.js';
import frontEndWebEngineeringRuntime from './published/frontEndWebEngineering.js';
import javascriptProgrammingFoundationsRuntime from './published/javascriptProgrammingFoundations.js';
import productDesignRuntime from './published/productDesign.js';
import publishedRuntime from './published/pythonAgentEngineering.js';

test('production catalog contains only established curricula while withdrawn introductory R1 courses stay out of learner choices', () => {
  const runtimes = [
    frontEndWebEngineeringRuntime,
    javascriptProgrammingFoundationsRuntime,
    productDesignRuntime,
    publishedRuntime,
  ];
  const expectedIds = runtimes
    .toSorted((left, right) => left.metadata.title.localeCompare(right.metadata.title))
    .map((runtime) => runtime.curriculumId);

  assert.deepEqual(curriculumCatalog.listPublished().map((entry) => entry.curriculumId), expectedIds);
  runtimes.forEach((runtime) => {
    assert.equal(curriculumCatalog.has(runtime.curriculumId), true);
    assert.equal(curriculumCatalog.getLatest(runtime.curriculumId), runtime);
  });
  assert.equal(curriculumCatalog.has('GOLDEN'), false);
  assert.equal(curriculumCatalog.has('QBAS'), false);
  ['CLNG', 'CPPL', 'JAVA', 'PYIN', 'WEBD'].forEach((curriculumId) => {
    assert.equal(curriculumCatalog.has(curriculumId), false, `${curriculumId} is withdrawn`);
  });
  assert.equal(frontEndWebEngineeringRuntime.weeks.length, 33);
  assert.equal(javascriptProgrammingFoundationsRuntime.weeks.length, 8);
  assert.equal(javascriptProgrammingFoundationsRuntime.revision, 2);
  assert.equal(productDesignRuntime.weeks.length, 28);
  assert.equal(publishedRuntime.weeks.length, 24);
});
