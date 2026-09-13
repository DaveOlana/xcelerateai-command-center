export const PYODIDE_VERSION = '314.0.6';
export const PYODIDE_MODULE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.mjs`;

export const browserPythonSpecs = Object.freeze({
  'PYAE:3:PYAE-W03:PYAE-PR-W03:PYAE-PR-W03-E01': Object.freeze({
    id: 'PYAE-W03-E01-service-structure',
    version: '1.0.0',
    verifierType: 'browser_python',
    trustLevel: 'client_advisory',
    label: 'Service module checks',
    filenameHint: 'Choose service.py',
    checkIds: Object.freeze(['python-syntax', 'create-task-function', 'complete-task-function', 'filter-priority-function', 'explicit-returns', 'service-io-separation']),
  }),
});

export function browserPythonSpecFor({ curriculumId, curriculumRevision, weekId, proofId, requirementId }) {
  return browserPythonSpecs[`${curriculumId}:${curriculumRevision}:${weekId}:${proofId}:${requirementId}`] || null;
}

export function verificationAvailability(context) {
  return {
    structural: 'available',
    browserPython: browserPythonSpecFor(context) ? 'available' : 'unsupported',
    futureServerSandbox: 'unavailable',
    futureAiRubric: 'unavailable',
  };
}
