import assert from 'node:assert/strict';
import test from 'node:test';
import { validateResourceResearch } from './validateResourceResearch.js';

test('resource research hook accepts complete verified Core research metadata', () => {
  const report = validateResourceResearch([{
    id: 'R1',
    url: 'https://example.com',
    provider: 'Example',
    accessStatus: 'verified',
    checkedAt: '2026-09-05T00:00:00.000Z',
    competencyIds: ['C1'],
    estimatedMinutes: 30,
    whySelected: 'Exact competency match.',
  }]);
  assert.equal(report.status, 'PASS');
});

test('resource research hook rejects unverified selected Core records', () => {
  const report = validateResourceResearch([{ id: 'R1', accessStatus: 'unknown' }]);
  assert.equal(report.status, 'FAIL');
  assert.ok(report.findings.some((finding) => finding.code === 'V012-B003'));
});
