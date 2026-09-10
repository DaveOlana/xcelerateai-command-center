export const SEVERITIES = Object.freeze({
  BLOCKER: 'BLOCKER',
  WARNING: 'WARNING',
  NOTE: 'NOTE',
});

export function createFinding(code, severity, message, affectedIds = []) {
  return {
    code,
    severity,
    message,
    affectedIds: [...new Set((affectedIds || []).filter(Boolean).map(String))],
  };
}
export function createValidationReport(source, findings, extra = {}) {
  const blockers = findings.filter((finding) => finding.severity === SEVERITIES.BLOCKER).length;
  const warnings = findings.filter((finding) => finding.severity === SEVERITIES.WARNING).length;
  const notes = findings.filter((finding) => finding.severity === SEVERITIES.NOTE).length;
  return {
    status: blockers === 0 ? 'PASS' : 'FAIL',
    curriculumId: source?.curriculumId || null,
    revision: source?.revision || null,
    blockingFailures: blockers,
    warningCount: warnings,
    noteCount: notes,
    findings,
    ...extra,
  };
}

export class CurriculumValidationError extends Error {
  constructor(report) {
    super(`Curriculum validation failed with ${report.blockingFailures} blocker(s).`);
    this.name = 'CurriculumValidationError';
    this.report = report;
  }
}
