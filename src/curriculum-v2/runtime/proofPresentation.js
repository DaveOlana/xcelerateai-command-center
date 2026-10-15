import { isProofEvidenceComplete } from './progression.js';

export function getLocalProofEntries(curriculum, learner) {
  return curriculum.weeks.flatMap((week) => {
    const records = learner?.proofs?.[week.proof.id]?.evidence || {};
    if (Object.keys(records).length === 0) return [];
    const required = week.proof.evidence.filter((item) => item.required);
    const complete = required.every((item) => isProofEvidenceComplete(item, records[item.id]));
    const items = week.proof.evidence
      .filter((item) => Object.prototype.hasOwnProperty.call(records, item.id))
      .map((item) => ({ definition: item, record: records[item.id] }));
    const updatedAt = items.map(({ record }) => record?.updatedAt).filter(Boolean).sort().at(-1) || null;
    return [{ week, items, complete, updatedAt }];
  });
}
