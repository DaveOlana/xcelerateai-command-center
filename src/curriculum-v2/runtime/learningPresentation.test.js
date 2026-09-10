import assert from 'node:assert/strict';
import test from 'node:test';
import {
  formatEstimatedEffort,
  formatMinutes,
  formatResourceFormat,
  getLearningRolePresentation,
  resolveBuildSessions,
  resolveConceptReferences,
  resolvePriorKnowledge,
} from './learningPresentation.js';

test('presentation helpers format roles, resource formats, and effort without inventing sessions', () => {
  assert.equal(getLearningRolePresentation('practice').label, 'Practice');
  assert.equal(getLearningRolePresentation(undefined), null);
  assert.equal(formatResourceFormat('documentation'), 'Documentation');
  assert.equal(formatResourceFormat('guided_lab'), 'Guided Lab');
  assert.equal(formatMinutes(90), '1h 30m');
  assert.deepEqual(formatEstimatedEffort(480, 3), { primary: 'About 8 hours', secondary: 'Across 3 focused sessions', exact: '480 minutes' });
  assert.equal(formatEstimatedEffort(480, 0).secondary, null);
});

test('presentation helpers resolve only authored curriculum references', () => {
  const competencies = { C1: { id: 'C1', name: 'Known skill' } };
  const concepts = { X1: { id: 'X1', term: 'Known term' } };
  assert.deepEqual(resolvePriorKnowledge(['C1', 'MISSING'], competencies), [competencies.C1]);
  assert.deepEqual(resolveConceptReferences([{ conceptId: 'X1', relevance: 'Used here.' }, { conceptId: 'MISSING', relevance: 'No.' }], concepts), [{ ...concepts.X1, relevance: 'Used here.' }]);
  assert.deepEqual(resolveBuildSessions([{ id: 'S1', stepIds: ['STEP-1'] }], [{ id: 'STEP-1', text: 'Do it.' }])[0].steps, [{ id: 'STEP-1', text: 'Do it.' }]);
});
