import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import Fastify, { type FastifyInstance } from 'fastify';
import type { BackendEnvironment } from './config/env.js';
import type { Database } from './db/database.js';
import {
  createAccessTokenVerifier,
  createRequireVerifiedIdentity,
  createVerificationResolver,
  type AccessTokenVerifier,
  type VerificationResolver,
} from './plugins/auth.js';
import { registerHealthRoutes } from './modules/health/routes.js';
import { ProfileRepository } from './modules/profile/repository.js';
import { registerProfileRoutes } from './modules/profile/routes.js';
import { LearningInstanceRepository } from './modules/progress/repository.js';
import { registerProgressRoutes } from './modules/progress/routes.js';
import { PostgresEvidenceRepository, type EvidenceRepository } from './modules/evidence/repository.js';
import { registerEvidenceRoutes } from './modules/evidence/routes.js';
import { EVIDENCE_BUCKET_DEFAULT } from './modules/evidence/schema.js';
import { SupabaseEvidenceStorage, type EvidenceStorage } from './modules/evidence/storage.js';
import { HttpError, IdentityProviderUnavailableError } from './types/errors.js';

export interface AppDependencies {
  config: BackendEnvironment;
  database: Database;
  verifyAccessToken?: AccessTokenVerifier;
  resolveVerification?: VerificationResolver;
  evidenceRepository?: EvidenceRepository;
  evidenceStorage?: EvidenceStorage | null;
  logger?: boolean;
}

export async function buildApp(dependencies: AppDependencies): Promise<FastifyInstance> {
  const app = Fastify({
    logger: dependencies.logger
      ? { redact: ['req.headers.authorization', 'request.headers.authorization'] }
      : false,
    bodyLimit: 64 * 1024,
    requestTimeout: 15_000,
  });
  app.decorateRequest('identity', null);

  await app.register(helmet);
  await app.register(cors, {
    origin: dependencies.config.CORS_ORIGINS,
    credentials: true,
    methods: ['GET', 'PATCH', 'PUT', 'POST', 'OPTIONS'],
  });

  const verifyAccessToken = dependencies.verifyAccessToken
    ?? createAccessTokenVerifier(dependencies.config.SUPABASE_URL);
  const resolveVerification = dependencies.resolveVerification
    ?? createVerificationResolver(dependencies.config);
  const requireVerifiedIdentity = createRequireVerifiedIdentity(verifyAccessToken, resolveVerification);

  await registerHealthRoutes(app, dependencies.database);
  await registerProfileRoutes(app, new ProfileRepository(dependencies.database), requireVerifiedIdentity);
  await registerProgressRoutes(app, new LearningInstanceRepository(dependencies.database), requireVerifiedIdentity);
  const evidenceRepository = dependencies.evidenceRepository ?? new PostgresEvidenceRepository(dependencies.database);
  const evidenceStorage = dependencies.evidenceStorage !== undefined
    ? dependencies.evidenceStorage
    : dependencies.config.SUPABASE_SECRET_KEY
      ? new SupabaseEvidenceStorage(
        dependencies.config.SUPABASE_URL,
        dependencies.config.SUPABASE_SECRET_KEY,
        dependencies.config.EVIDENCE_BUCKET ?? EVIDENCE_BUCKET_DEFAULT,
      )
      : null;
  await registerEvidenceRoutes(
    app,
    evidenceRepository,
    evidenceStorage,
    requireVerifiedIdentity,
    dependencies.config.EVIDENCE_BUCKET ?? EVIDENCE_BUCKET_DEFAULT,
  );

  app.setErrorHandler((error, request, reply) => {
    if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 413) {
      const progressSync = request.method === 'PUT' && request.url.startsWith('/api/v1/v2/learning-instances/');
      return reply.status(413).send({ error: progressSync
        ? { code: 'STATE_TOO_LARGE', message: 'The cloud progress payload exceeds the allowed size.' }
        : { code: 'PAYLOAD_TOO_LARGE', message: 'The request payload exceeds the allowed size.' } });
    }
    if (error instanceof HttpError) {
      return reply.status(error.statusCode).send({ error: { code: error.code, message: error.message } });
    }
    if (error instanceof IdentityProviderUnavailableError) {
      return reply.status(503).send({
        error: { code: 'IDENTITY_PROVIDER_UNAVAILABLE', message: 'Identity verification is temporarily unavailable.' },
      });
    }
    app.log.error(error);
    return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'The request could not be completed.' } });
  });

  app.addHook('onClose', async () => {
    await dependencies.database.close();
  });

  return app;
}
