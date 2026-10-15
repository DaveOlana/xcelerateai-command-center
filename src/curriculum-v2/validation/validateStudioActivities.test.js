import assert from 'node:assert/strict';
import test from 'node:test';
import { validateStudioActivities } from './validateStudioActivities.js';

const fixture = () => ({
  source: {
    curriculumId: 'TEST', revision: 1,
    resources: [{ id: 'R1', provider: 'MDN', format: 'course', url: 'https://developer.mozilla.org/example' }],
    weeks: [{
      id: 'W1', study: { resources: [{ resourceId: 'R1' }] },
      builds: [{ id: 'B1', required: true, steps: [{ id: 'S1', text: 'Create index.html and open it in a browser.' }] }],
    }],
  },
  studio: {
    schemaVersion: '1.1', activities: [{
      weekId: 'W1', title: 'Guided Build plan', placement: { stage: 'build', buildId: 'B1' },
      contract: { doing: 'Create the page.', why: 'See the file work.', output: 'A working index.html file.', tools: 'Editor and browser.', estimatedMinutes: 30, prerequisites: 'None.', finished: 'The page opens.', submission: 'Use the Proof field.' },
      steps: ['Create index.html and open it in a browser.'], checklist: ['The page opens.'], stuck: 'Check the filename and browser address.',
      prerequisiteReview: { unresolvedTerms: [] },
    }],
  },
});

test('schema 1.1 keeps guided activity inside and aligned with Build', () => {
  const { source, studio } = fixture();
  assert.equal(validateStudioActivities(studio, source).status, 'PASS');
});

test('schema 1.1 rejects a separate Study Studio and mismatched Build steps', () => {
  const { source, studio } = fixture();
  source.resources[0] = { id: 'R1', provider: 'XcelerateAI', format: 'lab', url: '/curriculum/test-studio.html' };
  studio.activities[0].steps[0] = 'Complete a different task.';
  const report = validateStudioActivities(studio, source);
  assert.equal(report.status, 'FAIL');
  assert.ok(report.findings.some((finding) => finding.code === 'V021-B011'));
  assert.ok(report.findings.some((finding) => finding.code === 'V021-B012'));
});

test('schema 1.1 does not mistake external Visual Studio documentation for a Study Studio', () => {
  const { source, studio } = fixture();
  source.resources[0] = {
    id: 'R1',
    provider: 'Microsoft',
    format: 'documentation',
    url: 'https://code.visualstudio.com/docs/setup/windows',
  };
  assert.equal(validateStudioActivities(studio, source).status, 'PASS');
});
