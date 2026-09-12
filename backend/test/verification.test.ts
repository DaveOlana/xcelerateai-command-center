import { describe, expect, test } from 'vitest';
import type { EvidenceSubmission } from '../src/modules/evidence/repository.js';
import { BROWSER_PYTHON_SPEC, FUTURE_VERIFIERS, browserPythonSpecFor } from '../src/modules/verification/registry.js';
import { structuralChecks } from '../src/modules/verification/structural.js';

const submission: EvidenceSubmission = {
  id: '00000000-0000-4000-8000-000000000001', curriculumId: 'PYAE', curriculumRevision: 3,
  evidenceSchemaVersion: 1, weekId: 'PYAE-W03', buildId: 'PYAE-B-W03-01', proofId: 'PYAE-PR-W03',
  submissionRevision: 1, supersedesSubmissionId: null, status: 'submitted', clientSubmissionId: '00000000-0000-4000-8000-000000000002',
  submittedAt: new Date(0).toISOString(), statusChangedAt: new Date(0).toISOString(),
  items: [
    { id: 'i1', evidenceRequirementId: 'PYAE-PR-W03-E01', kind: 'text', payload: { text: 'source' }, assets: [] },
    { id: 'i2', evidenceRequirementId: 'PYAE-PR-W03-E02', kind: 'text', payload: { text: 'explanation' }, assets: [] },
    { id: 'i3', evidenceRequirementId: 'PYAE-PR-W03-E03', kind: 'self_attestation', payload: { attested: true }, assets: [] },
  ],
};

describe('Backend V1 verification foundation', () => {
  test('selects browser Python only for the explicit stable PYAE requirement', () => {
    expect(browserPythonSpecFor(submission, 'PYAE-PR-W03-E01')).toBe(BROWSER_PYTHON_SPEC);
    expect(browserPythonSpecFor({ ...submission, weekId: 'PYAE-W04' }, 'PYAE-PR-W03-E01')).toBeNull();
  });
  test('browser results are permanently client advisory', () => {
    expect(BROWSER_PYTHON_SPEC.trustLevel).toBe('client_advisory');
    expect(BROWSER_PYTHON_SPEC).not.toHaveProperty('authoritative', true);
  });
  test('future paid verifier adapters remain unavailable', () => {
    expect(FUTURE_VERIFIERS).toEqual([
      { verifierType: 'future_server_sandbox', status: 'unavailable', configured: false },
      { verifierType: 'future_ai_rubric', status: 'unavailable', configured: false },
    ]);
  });
  test('structural checks pass only for present contract-compatible evidence', () => {
    expect(structuralChecks(submission, 'PYAE-PR-W03-E01')?.every((check) => check.passed)).toBe(true);
    const missing = { ...submission, items: submission.items.filter((item) => item.evidenceRequirementId !== 'PYAE-PR-W03-E01') };
    expect(structuralChecks(missing, 'PYAE-PR-W03-E01')?.some((check) => !check.passed)).toBe(true);
  });
  test('unknown requirements have no manufactured structural approval', () => {
    expect(structuralChecks(submission, 'PYAE-PR-W03-UNKNOWN')).toBeNull();
  });
});
