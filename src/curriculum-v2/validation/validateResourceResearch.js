import { createFinding, createValidationReport, SEVERITIES } from './findings.js';

const REQUIRED_FIELDS = ['id', 'url', 'provider', 'accessStatus', 'checkedAt', 'competencyIds', 'estimatedMinutes', 'whySelected'];

export function validateResourceResearch(records) {
  const findings = [];
  const add = (code, message, ids = []) => findings.push(createFinding(code, SEVERITIES.BLOCKER, message, ids));
  if (!Array.isArray(records)) {
    add('V012-B001', 'Resource research artifact must be an array.');
    return createValidationReport(null, findings);
  }
  records.forEach((record, index) => {
    const label = `resources[${index}]`;
    REQUIRED_FIELDS.forEach((field) => {
      if (record?.[field] === undefined || record?.[field] === null || record?.[field] === '') add('V012-B002', `${label}.${field} is required.`, [record?.id]);
    });
    if (record?.accessStatus !== 'verified') add('V012-B003', `${label}.accessStatus must be "verified" for a selected Core resource.`, [record?.id]);
    if (typeof record?.checkedAt !== 'string' || Number.isNaN(Date.parse(record.checkedAt))) add('V012-B004', `${label}.checkedAt must be a valid ISO-compatible date.`, [record?.id]);
    if (!Array.isArray(record?.competencyIds) || record.competencyIds.length === 0) add('V012-B005', `${label}.competencyIds must be non-empty.`, [record?.id]);
  });
  return createValidationReport(null, findings);
}
