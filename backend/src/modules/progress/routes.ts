import type { FastifyInstance, preHandlerHookHandler } from 'fastify';
import { LearningInstanceRepository } from './repository.js';
import { sha256Canonical } from './canonical.js';
import {
  CLOUD_ENABLED_CURRICULA,
  isCloudEnabledCurriculum,
  SUPPORTED_STATE_SCHEMA_VERSION,
  SYNC_BODY_LIMIT,
  syncMutationSchema,
  syncParamsSchema,
} from './schema.js';

export async function registerProgressRoutes(
  app: FastifyInstance,
  repository: LearningInstanceRepository,
  requireVerifiedIdentity: preHandlerHookHandler,
): Promise<void> {
  app.get('/api/v1/v2/learning-instances/:curriculumId', { preHandler: requireVerifiedIdentity }, async (request, reply) => {
    const params = syncParamsSchema.safeParse(request.params);
    if (!params.success || !isCloudEnabledCurriculum(params.data.curriculumId)) {
      return reply.status(404).send({ error: { code: 'CLOUD_CURRICULUM_NOT_FOUND', message: 'This curriculum is not enabled for cloud synchronization.' } });
    }
    const instance = await repository.get(request.identity!.userId, params.data.curriculumId);
    if (!instance) return reply.status(404).send({ error: { code: 'LEARNING_INSTANCE_NOT_FOUND', message: 'No cloud learning progress exists for this curriculum.' } });
    return { instance };
  });

  app.put('/api/v1/v2/learning-instances/:curriculumId', {
    preHandler: requireVerifiedIdentity,
    bodyLimit: SYNC_BODY_LIMIT,
  }, async (request, reply) => {
    const params = syncParamsSchema.safeParse(request.params);
    if (!params.success || !isCloudEnabledCurriculum(params.data.curriculumId)) {
      return reply.status(404).send({ error: { code: 'CLOUD_CURRICULUM_NOT_FOUND', message: 'This curriculum is not enabled for cloud synchronization.' } });
    }
    const parsed = syncMutationSchema.safeParse(request.body);
    if (!parsed.success) return validationError(reply, 'The progress synchronization payload is invalid.');
    const mutation = parsed.data;
    if (mutation.stateSchemaVersion !== SUPPORTED_STATE_SCHEMA_VERSION) return validationError(reply, 'The learner-state schema version is not supported.', 'UNSUPPORTED_STATE_SCHEMA');
    if (mutation.learnerState.curriculumState.curriculumId !== params.data.curriculumId
      || mutation.learnerState.curriculumState.lastSeenRevision !== mutation.curriculumRevision
      || mutation.curriculumRevision !== CLOUD_ENABLED_CURRICULA[params.data.curriculumId].revision) {
      return validationError(reply, 'Curriculum metadata does not match the cloud-enabled learner state.', 'CURRICULUM_METADATA_MISMATCH');
    }
    if (mutation.expectedVersion === 0 && mutation.expectedGeneration !== 0) return validationError(reply, 'A new learning instance must begin at generation zero.');

    const stateHash = sha256Canonical(mutation.learnerState);
    const requestHash = sha256Canonical({
      expectedVersion: mutation.expectedVersion,
      expectedGeneration: mutation.expectedGeneration,
      mutationType: mutation.mutationType,
      curriculumRevision: mutation.curriculumRevision,
      stateSchemaVersion: mutation.stateSchemaVersion,
      learnerState: mutation.learnerState,
    });
    const result = await repository.mutate(request.identity!.userId, params.data.curriculumId, mutation, requestHash, stateHash);
    if (result.kind === 'reset_without_instance') {
      return reply.status(409).send({ error: { code: 'SYNC_VERSION_CONFLICT', message: 'Cloud progress must be fetched before this mutation can be applied.' } });
    }
    if (result.kind === 'idempotency_key_reused') {
      return reply.status(409).send({ error: { code: 'IDEMPOTENCY_KEY_REUSED', message: 'This mutation identifier was already used for different content.' }, instance: result.instance });
    }
    if (result.kind === 'generation_conflict') {
      return reply.status(409).send({ error: { code: 'RESET_GENERATION_CONFLICT', message: 'A curriculum reset occurred after this device last synchronized.' }, instance: result.instance });
    }
    if (result.kind === 'version_conflict') {
      return reply.status(409).send({ error: { code: 'SYNC_VERSION_CONFLICT', message: 'Cloud progress changed after this device last synchronized.' }, instance: result.instance });
    }
    if (result.kind === 'duplicate') {
      return {
        outcome: 'duplicate',
        clientMutationId: mutation.clientMutationId,
        acknowledgedVersion: result.acknowledgedVersion,
        acknowledgedGeneration: result.acknowledgedGeneration,
        instance: result.instance,
      };
    }
    return reply.status(result.kind === 'created' ? 201 : 200).send({
      outcome: result.kind === 'no_change' ? 'no_change' : 'applied',
      clientMutationId: mutation.clientMutationId,
      instance: result.instance,
    });
  });
}

function validationError(reply: { status(code: number): { send(payload: unknown): unknown } }, message: string, code = 'VALIDATION_ERROR') {
  return reply.status(400).send({ error: { code, message } });
}
