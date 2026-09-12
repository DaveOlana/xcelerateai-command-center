import type { FastifyInstance, preHandlerHookHandler } from 'fastify';
import type { EvidenceRepository } from '../evidence/repository.js';
import { browserPythonSpecFor, BROWSER_PYTHON_SPEC, FUTURE_VERIFIERS } from './registry.js';
import { VerificationRepository } from './repository.js';
import { browserVerificationSchema, structuralVerificationSchema, verificationSubmissionParamsSchema } from './schema.js';
import { structuralChecks } from './structural.js';

export async function registerVerificationRoutes(app: FastifyInstance, repository: VerificationRepository, evidence: EvidenceRepository, requireIdentity: preHandlerHookHandler) {
  app.get('/api/v1/verifications/capabilities', { preHandler: requireIdentity }, async () => ({ browserPython: { ...BROWSER_PYTHON_SPEC }, future: FUTURE_VERIFIERS }));
  app.get('/api/v1/evidence/submissions/:id/verifications', { preHandler: requireIdentity }, async (request, reply) => {
    const params = verificationSubmissionParamsSchema.safeParse(request.params);
    if (!params.success || !await evidence.get(request.identity!.userId, params.data.id)) return reply.status(404).send({ error: { code: 'EVIDENCE_SUBMISSION_NOT_FOUND', message: 'Evidence submission not found.' } });
    return { results: await repository.list(request.identity!.userId, params.data.id) };
  });
  app.post('/api/v1/verifications/structural', { preHandler: requireIdentity }, async (request, reply) => {
    const parsed = structuralVerificationSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: 'Structural verification request is invalid.' } });
    const submission = await evidence.get(request.identity!.userId, parsed.data.evidenceSubmissionId);
    if (!submission || submission.status !== 'submitted') return reply.status(404).send({ error: { code: 'EVIDENCE_SUBMISSION_NOT_FOUND', message: 'Current evidence submission not found.' } });
    const checks = structuralChecks(submission, parsed.data.requirementId);
    if (!checks) return reply.status(400).send({ error: { code: 'UNSUPPORTED_VERIFIER', message: 'No structural verifier exists for this requirement.' } });
    const created = await repository.create(request.identity!.userId, { ...parsed.data, verifierType: 'structural', verifierVersion: '1.0.0', trustLevel: 'server_structural', outcome: checks.every((check) => check.passed) ? 'passed' : 'failed', criteria: checks, sourceSha256: null });
    return reply.status(created.outcome === 'created' ? 201 : 200).send(created);
  });
  app.post('/api/v1/verifications/browser-python', { preHandler: requireIdentity }, async (request, reply) => {
    const parsed = browserVerificationSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: 'Browser Python result is malformed.' } });
    const submission = await evidence.get(request.identity!.userId, parsed.data.evidenceSubmissionId);
    if (!submission || submission.status !== 'submitted') return reply.status(404).send({ error: { code: 'EVIDENCE_SUBMISSION_NOT_FOUND', message: 'Current evidence submission not found.' } });
    const spec = browserPythonSpecFor(submission, parsed.data.requirementId);
    const suppliedIds = parsed.data.checks.map((check) => check.id);
    if (!spec || parsed.data.verifierSpecId !== spec.id || parsed.data.verifierVersion !== spec.version || suppliedIds.length !== spec.checkIds.length || suppliedIds.some((id, index) => id !== spec.checkIds[index])) return reply.status(400).send({ error: { code: 'UNSUPPORTED_VERIFIER', message: 'Browser Python verifier specification is unsupported.' } });
    const expectedOutcome = parsed.data.checks.every((check) => check.passed) ? 'passed' : parsed.data.outcome === 'error' ? 'error' : 'failed';
    if (parsed.data.outcome !== expectedOutcome) return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: 'Browser Python outcome does not match its checks.' } });
    const created = await repository.create(request.identity!.userId, { clientRunId: parsed.data.clientRunId, evidenceSubmissionId: parsed.data.evidenceSubmissionId, requirementId: parsed.data.requirementId, verifierType: 'browser_python', verifierVersion: spec.version, trustLevel: 'client_advisory', outcome: parsed.data.outcome, criteria: parsed.data.checks, sourceSha256: parsed.data.sourceSha256 });
    return reply.status(created.outcome === 'created' ? 201 : 200).send(created);
  });
}
