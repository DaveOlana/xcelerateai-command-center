import type { EvidenceSubmission } from '../evidence/repository.js';

export const BROWSER_PYTHON_SPEC = Object.freeze({
  id: 'PYAE-W03-E01-service-structure',
  version: '1.0.0',
  curriculumId: 'PYAE',
  curriculumRevision: 3,
  weekId: 'PYAE-W03',
  proofId: 'PYAE-PR-W03',
  requirementId: 'PYAE-PR-W03-E01',
  verifierType: 'browser_python' as const,
  trustLevel: 'client_advisory' as const,
  checkIds: ['python-syntax', 'create-task-function', 'complete-task-function', 'filter-priority-function', 'explicit-returns', 'service-io-separation'] as const,
});

export function browserPythonSpecFor(submission: EvidenceSubmission, requirementId: string) {
  return submission.curriculumId === BROWSER_PYTHON_SPEC.curriculumId
    && submission.curriculumRevision === BROWSER_PYTHON_SPEC.curriculumRevision
    && submission.weekId === BROWSER_PYTHON_SPEC.weekId
    && submission.proofId === BROWSER_PYTHON_SPEC.proofId
    && requirementId === BROWSER_PYTHON_SPEC.requirementId
    ? BROWSER_PYTHON_SPEC
    : null;
}

export const FUTURE_VERIFIERS = Object.freeze([
  { verifierType: 'future_server_sandbox', status: 'unavailable', configured: false },
  { verifierType: 'future_ai_rubric', status: 'unavailable', configured: false },
]);
