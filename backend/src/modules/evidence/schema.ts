import { z } from 'zod';
import { getEvidenceContract, type EvidenceContext } from './curriculumContract.js';

export const MAX_EVIDENCE_FILE_BYTES = 6 * 1024 * 1024;
export const MAX_SUBMISSION_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_SUBMISSION_ASSETS = 2;
export const EVIDENCE_BUCKET_DEFAULT = 'learner-evidence';
export const ALLOWED_EVIDENCE_MIME_TYPES = Object.freeze([
  'application/zip', 'application/x-zip-compressed', 'text/plain', 'application/json',
]);

const identifier = z.string().trim().min(1).max(160).regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/);
const uuid = z.uuid();
const safeUrl = z.string().trim().max(2048).superRefine((value, context) => {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) context.addIssue({ code: 'custom', message: 'Only credential-free HTTP(S) URLs are accepted.' });
  } catch {
    context.addIssue({ code: 'custom', message: 'Invalid URL.' });
  }
});
const contextFields = {
  curriculumId: identifier,
  curriculumRevision: z.number().int().positive(),
  weekId: identifier,
  buildId: identifier,
  proofId: identifier,
};

export const textItemSchema = z.object({ evidenceRequirementId: identifier, kind: z.literal('text'), text: z.string().trim().min(1).max(50_000) }).strict();
export const urlItemSchema = z.object({ evidenceRequirementId: identifier, kind: z.literal('url'), url: safeUrl }).strict();
export const repositoryItemSchema = z.object({
  evidenceRequirementId: identifier,
  kind: z.literal('repository'),
  repositoryUrl: safeUrl,
  provider: z.enum(['github', 'gitlab', 'bitbucket', 'other']).nullable().optional(),
  commitSha: z.string().trim().regex(/^[0-9a-f]{7,64}$/i).nullable().optional(),
  branch: z.string().trim().min(1).max(255).nullable().optional(),
}).strict();
export const fileItemSchema = z.object({ evidenceRequirementId: identifier, kind: z.literal('file'), assetId: uuid }).strict();
export const attestationItemSchema = z.object({ evidenceRequirementId: identifier, kind: z.literal('self_attestation'), attested: z.literal(true) }).strict();
export const evidenceItemSchema = z.discriminatedUnion('kind', [textItemSchema, urlItemSchema, repositoryItemSchema, fileItemSchema, attestationItemSchema]);
export type EvidenceItemInput = z.infer<typeof evidenceItemSchema>;

export const submissionSchema = z.object({
  clientSubmissionId: uuid,
  expectedCurrentSubmissionId: uuid.nullable(),
  ...contextFields,
  items: z.array(evidenceItemSchema).min(1).max(10),
}).strict().superRefine((value, validation) => {
  const contract = getEvidenceContract(value);
  if (!contract) return validation.addIssue({ code: 'custom', path: ['curriculumId'], message: 'Unsupported curriculum evidence context.' });
  const byId = new Map(value.items.map((item) => [item.evidenceRequirementId, item]));
  if (byId.size !== value.items.length) validation.addIssue({ code: 'custom', path: ['items'], message: 'Evidence requirement IDs must be unique.' });
  for (const requirement of contract) {
    const item = byId.get(requirement.id);
    if (!item) validation.addIssue({ code: 'custom', path: ['items'], message: `Missing required evidence ${requirement.id}.` });
    else if (!requirement.acceptedKinds.includes(item.kind)) validation.addIssue({ code: 'custom', path: ['items'], message: `Evidence kind is not accepted for ${requirement.id}.` });
  }
  if ([...byId.keys()].some((id) => !contract.some((requirement) => requirement.id === id))) validation.addIssue({ code: 'custom', path: ['items'], message: 'Submission contains an unknown evidence requirement.' });
  const fileCount = value.items.filter((item) => item.kind === 'file').length;
  if (fileCount > MAX_SUBMISSION_ASSETS) validation.addIssue({ code: 'custom', path: ['items'], message: `At most ${MAX_SUBMISSION_ASSETS} files are allowed.` });
});
export type EvidenceSubmissionInput = z.infer<typeof submissionSchema>;

export const uploadIntentSchema = z.object({
  clientAssetId: uuid,
  ...contextFields,
  evidenceRequirementId: identifier,
  originalFilename: z.string().trim().min(1).max(255).refine((value) => !/[\\/\x00-\x1f\x7f]/.test(value), 'Filename contains unsafe characters.'),
  mimeType: z.enum(ALLOWED_EVIDENCE_MIME_TYPES),
  byteSize: z.number().int().positive().max(MAX_EVIDENCE_FILE_BYTES),
}).strict().superRefine((value, validation) => {
  const contract = getEvidenceContract(value);
  const requirement = contract?.find((item) => item.id === value.evidenceRequirementId);
  if (!requirement?.acceptedKinds.includes('file')) validation.addIssue({ code: 'custom', path: ['evidenceRequirementId'], message: 'File evidence is not accepted for this requirement.' });
});
export type UploadIntentInput = z.infer<typeof uploadIntentSchema>;

export const evidenceIdParamsSchema = z.object({ id: uuid }).strict();
export const proofParamsSchema = z.object({ proofId: identifier }).strict();
export const submissionListQuerySchema = z.object({ curriculumId: identifier, revision: z.coerce.number().int().positive() }).strict();
export const mutationIdSchema = z.object({ clientMutationId: uuid }).strict();

export function itemPayload(item: EvidenceItemInput): Record<string, unknown> {
  if (item.kind === 'text') return { text: item.text };
  if (item.kind === 'url') return { url: item.url };
  if (item.kind === 'repository') return { repositoryUrl: item.repositoryUrl, provider: item.provider ?? null, commitSha: item.commitSha ?? null, branch: item.branch ?? null };
  if (item.kind === 'file') return { assetId: item.assetId };
  return { attested: true };
}

export function evidenceContextOf(value: EvidenceContext): EvidenceContext {
  return { curriculumId: value.curriculumId, curriculumRevision: value.curriculumRevision, weekId: value.weekId, buildId: value.buildId, proofId: value.proofId };
}
