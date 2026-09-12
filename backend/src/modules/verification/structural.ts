import { getEvidenceContract } from '../evidence/curriculumContract.js';
import type { EvidenceSubmission } from '../evidence/repository.js';

export interface VerificationCheck { id: string; passed: boolean; message: string }

export function structuralChecks(submission: EvidenceSubmission, requirementId: string): VerificationCheck[] | null {
  const contract = getEvidenceContract(submission);
  const requirement = contract?.find((entry) => entry.id === requirementId);
  if (!requirement) return null;
  const item = submission.items.find((entry) => entry.evidenceRequirementId === requirementId);
  const checks: VerificationCheck[] = [
    { id: 'required-item-present', passed: Boolean(item), message: item ? 'Required evidence item is present.' : 'Required evidence item is missing.' },
    { id: 'evidence-kind-allowed', passed: Boolean(item && requirement.acceptedKinds.includes(item.kind)), message: item && requirement.acceptedKinds.includes(item.kind) ? 'Evidence method matches the curriculum contract.' : 'Evidence method does not match the curriculum contract.' },
  ];
  if (item?.kind === 'file') {
    const asset = item.assets[0];
    checks.push(
      { id: 'private-file-finalized', passed: asset?.status === 'ready', message: asset?.status === 'ready' ? 'Private file was finalized by the server.' : 'Private file is not finalized.' },
      { id: 'file-metadata-confirmed', passed: Boolean(asset?.sha256 && asset.byteSize && asset.detectedMimeType), message: asset?.sha256 && asset.byteSize && asset.detectedMimeType ? 'Server-confirmed size, MIME, and checksum are recorded.' : 'Server-confirmed file metadata is incomplete.' },
    );
  }
  return checks;
}
