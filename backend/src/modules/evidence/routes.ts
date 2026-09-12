import type { FastifyInstance, preHandlerHookHandler } from 'fastify';
import { sha256Canonical } from '../progress/canonical.js';
import { HttpError } from '../../types/errors.js';
import type { EvidenceAsset, EvidenceRepository, EvidenceSubmission } from './repository.js';
import {
  ALLOWED_EVIDENCE_MIME_TYPES,
  EVIDENCE_BUCKET_DEFAULT,
  MAX_EVIDENCE_FILE_BYTES,
  evidenceIdParamsSchema,
  mutationIdSchema,
  proofParamsSchema,
  submissionListQuerySchema,
  submissionSchema,
  uploadIntentSchema,
} from './schema.js';
import { evidenceObjectKey, extensionFor, type EvidenceStorage } from './storage.js';

const SUBMISSION_BODY_LIMIT = 192 * 1024;

export async function registerEvidenceRoutes(
  app: FastifyInstance,
  repository: EvidenceRepository,
  storage: EvidenceStorage | null,
  requireVerifiedIdentity: preHandlerHookHandler,
  bucket = EVIDENCE_BUCKET_DEFAULT,
): Promise<void> {
  app.get('/api/v1/evidence/proofs/:proofId/submissions', { preHandler: requireVerifiedIdentity }, async (request, reply) => {
    const params = proofParamsSchema.safeParse(request.params);
    const query = submissionListQuerySchema.safeParse(request.query);
    if (!params.success || !query.success) return validationError(reply, 'The evidence history request is invalid.');
    const submissions = await repository.list(request.identity!.userId, query.data.curriculumId, query.data.revision, params.data.proofId);
    return { submissions: submissions.map(publicSubmission) };
  });

  app.get('/api/v1/evidence/submissions/:id', { preHandler: requireVerifiedIdentity }, async (request, reply) => {
    const params = evidenceIdParamsSchema.safeParse(request.params);
    if (!params.success) return notFound(reply, 'EVIDENCE_SUBMISSION_NOT_FOUND', 'Evidence submission not found.');
    const submission = await repository.get(request.identity!.userId, params.data.id);
    if (!submission) return notFound(reply, 'EVIDENCE_SUBMISSION_NOT_FOUND', 'Evidence submission not found.');
    return { submission: publicSubmission(submission) };
  });

  app.post('/api/v1/evidence/upload-intents', { preHandler: requireVerifiedIdentity }, async (request, reply) => {
    if (!storage) throw new HttpError(503, 'EVIDENCE_STORAGE_UNAVAILABLE', 'Private evidence storage is not configured.');
    const parsed = uploadIntentSchema.safeParse(request.body);
    if (!parsed.success) return uploadValidationError(reply, request.body);
    let extension: string;
    try {
      extension = extensionFor(parsed.data.originalFilename, parsed.data.mimeType);
    } catch {
      return reply.status(415).send({ error: { code: 'UNSUPPORTED_EVIDENCE_FILE', message: 'The filename extension does not match the declared evidence file type.' } });
    }
    const requestHash = sha256Canonical(parsed.data);
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const result = await repository.createUploadIntent(
      request.identity!.userId,
      parsed.data,
      bucket,
      evidenceObjectKey(request.identity!.userId, extension),
      requestHash,
      expiresAt,
    );
    if (result.kind === 'idempotency_key_reused') return conflict(reply, 'IDEMPOTENCY_KEY_REUSED', 'This asset identifier was already used for different content.');
    if (result.asset.status === 'ready') return reply.status(200).send({ outcome: 'duplicate', asset: publicAsset(result.asset) });
    try {
      const upload = await storage.createUploadAuthorization(result.asset.objectKey);
      return reply.status(result.kind === 'created' ? 201 : 200).send({ outcome: result.kind, asset: publicAsset(result.asset), upload: { ...upload, bucket } });
    } catch {
      throw new HttpError(503, 'EVIDENCE_STORAGE_UNAVAILABLE', 'Private evidence storage is temporarily unavailable.');
    }
  });

  app.post('/api/v1/evidence/assets/:id/finalize', { preHandler: requireVerifiedIdentity }, async (request, reply) => {
    if (!storage) throw new HttpError(503, 'EVIDENCE_STORAGE_UNAVAILABLE', 'Private evidence storage is not configured.');
    const params = evidenceIdParamsSchema.safeParse(request.params);
    if (!params.success) return notFound(reply, 'EVIDENCE_ASSET_NOT_FOUND', 'Evidence asset not found.');
    const asset = await repository.getAsset(request.identity!.userId, params.data.id);
    if (!asset) return notFound(reply, 'EVIDENCE_ASSET_NOT_FOUND', 'Evidence asset not found.');
    if (asset.status === 'abandoned') return conflict(reply, 'EVIDENCE_ASSET_ABANDONED', 'This evidence asset was abandoned.');
    if (asset.status === 'ready') return { outcome: 'duplicate', asset: publicAsset(asset) };
    let inspected;
    try {
      inspected = await storage.inspect(asset.objectKey, asset.declaredMimeType);
    } catch {
      return conflict(reply, 'EVIDENCE_OBJECT_UNAVAILABLE', 'The uploaded evidence object is not available for finalization.');
    }
    if (inspected.byteSize !== asset.declaredByteSize
      || inspected.byteSize > MAX_EVIDENCE_FILE_BYTES
      || !mimeTypesMatch(asset.declaredMimeType, inspected.mimeType)) {
      return conflict(reply, 'EVIDENCE_FILE_MISMATCH', 'The uploaded evidence file does not match its declared size or type.');
    }
    const finalized = await repository.markAssetReady(request.identity!.userId, asset.id, inspected);
    if (!finalized) return conflict(reply, 'EVIDENCE_ASSET_UNAVAILABLE', 'This evidence asset cannot be finalized.');
    return { outcome: 'finalized', asset: publicAsset(finalized) };
  });

  app.post('/api/v1/evidence/submissions', { preHandler: requireVerifiedIdentity, bodyLimit: SUBMISSION_BODY_LIMIT }, async (request, reply) => {
    const parsed = submissionSchema.safeParse(request.body);
    if (!parsed.success) return validationError(reply, 'The evidence submission is invalid.');
    const result = await repository.createSubmission(request.identity!.userId, parsed.data, sha256Canonical(parsed.data));
    if (result.kind === 'idempotency_key_reused') return conflict(reply, 'IDEMPOTENCY_KEY_REUSED', 'This submission identifier was already used for different content.');
    if (result.kind === 'current_submission_conflict') return conflict(reply, 'CURRENT_SUBMISSION_CONFLICT', 'Evidence history changed after this submission was prepared.');
    if (result.kind === 'asset_unavailable') return conflict(reply, 'EVIDENCE_ASSET_UNAVAILABLE', 'A selected evidence asset is unavailable, incomplete, or already attached.');
    return reply.status(result.kind === 'created' ? 201 : 200).send({ outcome: result.kind, submission: publicSubmission(result.submission) });
  });

  app.post('/api/v1/evidence/submissions/:id/withdraw', { preHandler: requireVerifiedIdentity }, async (request, reply) => {
    const params = evidenceIdParamsSchema.safeParse(request.params);
    const mutation = mutationIdSchema.safeParse(request.body);
    if (!params.success) return notFound(reply, 'EVIDENCE_SUBMISSION_NOT_FOUND', 'Evidence submission not found.');
    if (!mutation.success) return validationError(reply, 'A valid withdrawal mutation identifier is required.');
    const result = await repository.withdraw(request.identity!.userId, params.data.id, mutation.data.clientMutationId);
    if (result.kind === 'not_found') return notFound(reply, 'EVIDENCE_SUBMISSION_NOT_FOUND', 'Evidence submission not found.');
    if (result.kind === 'not_current') return conflict(reply, 'EVIDENCE_SUBMISSION_NOT_CURRENT', 'Only the current evidence submission can be withdrawn.');
    if (result.kind === 'idempotency_key_reused') return conflict(reply, 'IDEMPOTENCY_KEY_REUSED', 'This withdrawal identifier was already used for a different operation.');
    return { outcome: result.kind, submission: publicSubmission(result.submission) };
  });

  app.post('/api/v1/evidence/assets/:id/access', { preHandler: requireVerifiedIdentity }, async (request, reply) => {
    if (!storage) throw new HttpError(503, 'EVIDENCE_STORAGE_UNAVAILABLE', 'Private evidence storage is not configured.');
    const params = evidenceIdParamsSchema.safeParse(request.params);
    if (!params.success) return notFound(reply, 'EVIDENCE_ASSET_NOT_FOUND', 'Evidence asset not found.');
    const asset = await repository.getAsset(request.identity!.userId, params.data.id);
    if (!asset) return notFound(reply, 'EVIDENCE_ASSET_NOT_FOUND', 'Evidence asset not found.');
    if (asset.status !== 'ready' || !asset.evidenceItemId) return conflict(reply, 'EVIDENCE_ASSET_UNAVAILABLE', 'Only submitted evidence files can be accessed.');
    try {
      return { download: await storage.createDownloadUrl(asset.objectKey) };
    } catch {
      throw new HttpError(503, 'EVIDENCE_STORAGE_UNAVAILABLE', 'Private evidence storage is temporarily unavailable.');
    }
  });

  app.post('/api/v1/evidence/assets/:id/abandon', { preHandler: requireVerifiedIdentity }, async (request, reply) => {
    if (!storage) throw new HttpError(503, 'EVIDENCE_STORAGE_UNAVAILABLE', 'Private evidence storage is not configured.');
    const params = evidenceIdParamsSchema.safeParse(request.params);
    if (!params.success) return notFound(reply, 'EVIDENCE_ASSET_NOT_FOUND', 'Evidence asset not found.');
    const asset = await repository.getAsset(request.identity!.userId, params.data.id);
    if (!asset) return notFound(reply, 'EVIDENCE_ASSET_NOT_FOUND', 'Evidence asset not found.');
    if (asset.evidenceItemId) return conflict(reply, 'EVIDENCE_ASSET_ATTACHED', 'Submitted evidence files cannot be abandoned.');
    if (asset.status === 'abandoned') return { outcome: 'duplicate', asset: publicAsset(asset) };
    try {
      await storage.remove(asset.objectKey);
    } catch {
      throw new HttpError(503, 'EVIDENCE_STORAGE_UNAVAILABLE', 'Private evidence storage is temporarily unavailable.');
    }
    const abandoned = await repository.abandonAsset(request.identity!.userId, asset.id);
    if (!abandoned) return conflict(reply, 'EVIDENCE_ASSET_UNAVAILABLE', 'This evidence asset cannot be abandoned.');
    return { outcome: 'abandoned', asset: publicAsset(abandoned) };
  });
}

function publicSubmission(submission: EvidenceSubmission) {
  return {
    ...submission,
    items: submission.items.map((item) => ({
      ...item,
      assets: item.assets.map(publicAsset),
    })),
  };
}

function publicAsset(asset: EvidenceAsset) {
  return {
    id: asset.id,
    clientAssetId: asset.clientAssetId,
    curriculumId: asset.curriculumId,
    curriculumRevision: asset.curriculumRevision,
    proofId: asset.proofId,
    evidenceRequirementId: asset.evidenceRequirementId,
    status: asset.status,
    originalFilename: asset.originalFilename,
    declaredMimeType: asset.declaredMimeType,
    detectedMimeType: asset.detectedMimeType,
    declaredByteSize: asset.declaredByteSize,
    byteSize: asset.byteSize,
    sha256: asset.sha256,
    readyAt: asset.readyAt,
    abandonedAt: asset.abandonedAt,
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt,
  };
}

function mimeTypesMatch(declared: string, detected: string): boolean {
  if (declared === 'application/zip' || declared === 'application/x-zip-compressed') return detected === 'application/zip';
  return declared === detected;
}

function uploadValidationError(reply: Reply, body: unknown) {
  const candidate = body && typeof body === 'object' ? body as Record<string, unknown> : {};
  if (typeof candidate.byteSize === 'number' && candidate.byteSize > MAX_EVIDENCE_FILE_BYTES) {
    return reply.status(413).send({ error: { code: 'EVIDENCE_FILE_TOO_LARGE', message: 'Evidence files cannot exceed 6 MiB.' } });
  }
  if (typeof candidate.mimeType === 'string' && !ALLOWED_EVIDENCE_MIME_TYPES.includes(candidate.mimeType as never)) {
    return reply.status(415).send({ error: { code: 'UNSUPPORTED_EVIDENCE_FILE', message: 'This evidence file type is not supported.' } });
  }
  return validationError(reply, 'The evidence upload request is invalid.');
}

type Reply = { status(code: number): { send(payload: unknown): unknown } };
function validationError(reply: Reply, message: string) { return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message } }); }
function conflict(reply: Reply, code: string, message: string) { return reply.status(409).send({ error: { code, message } }); }
function notFound(reply: Reply, code: string, message: string) { return reply.status(404).send({ error: { code, message } }); }
