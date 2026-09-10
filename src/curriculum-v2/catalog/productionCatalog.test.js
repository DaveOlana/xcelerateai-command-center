import assert from 'node:assert/strict';
import test from 'node:test';
import { curriculumCatalog } from './catalog.js';
import publishedRuntime from './published/pythonAgentEngineering.js';

test('production catalog publishes only the validated PYAE runtime and keeps Golden out of learner choices', () => {
  assert.deepEqual(curriculumCatalog.listPublished(), [{
    curriculumId: 'PYAE',
    revision: publishedRuntime.revision,
    title: 'Python Agent Engineering',
    shortTitle: 'Python Agent Engineering',
    professionalOutcome: 'Design, build, evaluate, secure, and operate a local-first Python personal agent with replaceable providers, bounded tools, durable state, grounded answers, and human control.',
    estimatedWeeks: 24,
    status: 'published',
  }]);
  assert.equal(curriculumCatalog.has('PYAE'), true);
  assert.equal(curriculumCatalog.has('GOLDEN'), false);
  assert.equal(curriculumCatalog.getLatest('PYAE'), publishedRuntime);
  assert.equal(publishedRuntime.weeks.length, 24);
});
