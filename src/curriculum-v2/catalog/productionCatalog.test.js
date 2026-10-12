import assert from 'node:assert/strict';
import test from 'node:test';
import { curriculumCatalog } from './catalog.js';
import cIntroductionRuntime from './published/cIntroduction.js';
import cppIntroductionRuntime from './published/cppIntroduction.js';
import frontEndWebEngineeringRuntime from './published/frontEndWebEngineering.js';
import javaIntroductionRuntime from './published/javaIntroduction.js';
import javascriptIntroductionRuntime from './published/javascriptIntroduction.js';
import productDesignRuntime from './published/productDesign.js';
import publishedRuntime from './published/pythonAgentEngineering.js';
import pythonIntroductionRuntime from './published/pythonIntroduction.js';
import webDevelopmentIntroductionRuntime from './published/webDevelopmentIntroduction.js';

test('production catalog publishes every owner-approved curriculum while keeping Golden and QBASIC out of learner choices', () => {
  const runtimes = [
    frontEndWebEngineeringRuntime,
    productDesignRuntime,
    publishedRuntime,
    cIntroductionRuntime,
    cppIntroductionRuntime,
    javaIntroductionRuntime,
    javascriptIntroductionRuntime,
    pythonIntroductionRuntime,
    webDevelopmentIntroductionRuntime,
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
  assert.equal(frontEndWebEngineeringRuntime.weeks.length, 33);
  assert.equal(productDesignRuntime.weeks.length, 28);
  assert.equal(publishedRuntime.weeks.length, 24);
  [
    cIntroductionRuntime,
    cppIntroductionRuntime,
    javaIntroductionRuntime,
    javascriptIntroductionRuntime,
    pythonIntroductionRuntime,
    webDevelopmentIntroductionRuntime,
  ].forEach((runtime) => assert.equal(runtime.weeks.length, 8));
});
