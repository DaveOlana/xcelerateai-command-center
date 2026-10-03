import assert from 'node:assert/strict';
import test from 'node:test';
import { curriculumCatalog } from './catalog.js';
import frontEndWebEngineeringRuntime from './published/frontEndWebEngineering.js';
import productDesignRuntime from './published/productDesign.js';
import publishedRuntime from './published/pythonAgentEngineering.js';

test('production catalog publishes Front-End Web Engineering, Product Design, and PYAE while keeping Golden out of learner choices', () => {
  assert.deepEqual(curriculumCatalog.listPublished(), [{
    curriculumId: 'FEWE',
    revision: frontEndWebEngineeringRuntime.revision,
    title: 'Front-End Web Engineering',
    shortTitle: 'Front-End Web Engineering',
    professionalOutcome: 'Independently build, debug, test, optimize, and deploy responsive, accessible web interfaces from product requirements, visual designs, and API contracts under appropriate junior supervision.',
    estimatedWeeks: 33,
    status: 'published',
  }, {
    curriculumId: 'PDES',
    revision: productDesignRuntime.revision,
    title: 'Product Design',
    shortTitle: 'Product Design',
    professionalOutcome: 'Take a reasonably scoped digital-product problem from research and problem definition through interaction and visual design, responsive prototyping, usability testing, iteration, accessibility review, developer handoff, and professional case-study presentation under normal junior supervision.',
    estimatedWeeks: 28,
    status: 'published',
  }, {
    curriculumId: 'PYAE',
    revision: publishedRuntime.revision,
    title: 'Python Agent Engineering',
    shortTitle: 'Python Agent Engineering',
    professionalOutcome: 'Design, build, evaluate, secure, and operate a local-first Python personal agent with replaceable providers, bounded tools, durable state, grounded answers, and human control.',
    estimatedWeeks: 24,
    status: 'published',
  }]);
  assert.equal(curriculumCatalog.has('FEWE'), true);
  assert.equal(curriculumCatalog.has('PDES'), true);
  assert.equal(curriculumCatalog.has('PYAE'), true);
  assert.equal(curriculumCatalog.has('GOLDEN'), false);
  assert.equal(curriculumCatalog.getLatest('FEWE'), frontEndWebEngineeringRuntime);
  assert.equal(curriculumCatalog.getLatest('PDES'), productDesignRuntime);
  assert.equal(curriculumCatalog.getLatest('PYAE'), publishedRuntime);
  assert.equal(frontEndWebEngineeringRuntime.weeks.length, 33);
  assert.equal(productDesignRuntime.weeks.length, 28);
  assert.equal(publishedRuntime.weeks.length, 24);
});
