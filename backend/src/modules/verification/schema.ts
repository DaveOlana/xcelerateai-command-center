import { z } from 'zod';

const uuid = z.uuid();
const identifier = z.string().trim().min(1).max(160).regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/);
export const verificationSubmissionParamsSchema = z.object({ id: uuid }).strict();
export const structuralVerificationSchema = z.object({ evidenceSubmissionId: uuid, requirementId: identifier, clientRunId: uuid }).strict();
export const browserVerificationSchema = z.object({
  evidenceSubmissionId: uuid,
  requirementId: identifier,
  clientRunId: uuid,
  verifierSpecId: identifier,
  verifierVersion: z.string().trim().min(1).max(32),
  sourceSha256: z.string().regex(/^[0-9a-f]{64}$/),
  outcome: z.enum(['passed', 'failed', 'error']),
  checks: z.array(z.object({ id: identifier, passed: z.boolean(), message: z.string().trim().min(1).max(500) }).strict()).min(1).max(20),
}).strict();
export type BrowserVerificationInput = z.infer<typeof browserVerificationSchema>;
