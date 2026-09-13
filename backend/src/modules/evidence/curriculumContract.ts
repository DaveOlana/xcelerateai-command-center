export const EVIDENCE_SCHEMA_VERSION = 1;
export const EVIDENCE_CURRICULA = Object.freeze({ PYAE: { revision: 3, weeks: 24 } });

export type EvidenceKind = 'text' | 'url' | 'repository' | 'file' | 'self_attestation';

export interface EvidenceContext {
  curriculumId: string;
  curriculumRevision: number;
  weekId: string;
  buildId: string;
  proofId: string;
}

export interface EvidenceRequirementContract {
  id: string;
  acceptedKinds: readonly EvidenceKind[];
}

export function getEvidenceContract(context: EvidenceContext): readonly EvidenceRequirementContract[] | null {
  if (context.curriculumId !== 'PYAE' || context.curriculumRevision !== 3) return null;
  const match = /^PYAE-W(0[1-9]|1[0-9]|2[0-4])$/.exec(context.weekId);
  if (!match) return null;
  const sequence = match[1];
  if (context.buildId !== `PYAE-B-W${sequence}-01` || context.proofId !== `PYAE-PR-W${sequence}`) return null;
  return [
    { id: `PYAE-PR-W${sequence}-E01`, acceptedKinds: ['text', 'url', 'repository', 'file'] },
    { id: `PYAE-PR-W${sequence}-E02`, acceptedKinds: ['text', 'file'] },
    { id: `PYAE-PR-W${sequence}-E03`, acceptedKinds: ['self_attestation'] },
  ];
}
