import { createHash, randomUUID } from 'node:crypto';
import type { QueryResult, QueryResultRow } from 'pg';
import { afterEach, describe, expect, test } from 'vitest';
import { buildApp } from '../src/app.js';
import type { BackendEnvironment } from '../src/config/env.js';
import type { Database, TransactionDatabase } from '../src/db/database.js';
import type {
  EvidenceAsset,
  EvidenceRepository,
  EvidenceSubmission,
  SubmissionResult,
  UploadIntentResult,
  WithdrawResult,
} from '../src/modules/evidence/repository.js';
import type { EvidenceSubmissionInput, UploadIntentInput } from '../src/modules/evidence/schema.js';
import type { EvidenceStorage, InspectedEvidenceObject } from '../src/modules/evidence/storage.js';

const config: BackendEnvironment = {
  NODE_ENV: 'test', HOST: '127.0.0.1', PORT: 3001,
  DATABASE_URL: 'postgresql://example.invalid/database',
  SUPABASE_URL: 'https://example.supabase.co', SUPABASE_PUBLISHABLE_KEY: 'test-public-key',
  CORS_ORIGINS: ['http://localhost:5173'],
};
const userA = '123e4567-e89b-42d3-a456-426614174000';
const userB = '523e4567-e89b-42d3-a456-426614174999';
const auth = { authorization: 'Bearer test-token' };

class EmptyDatabase implements Database {
  async query<Row extends QueryResultRow = QueryResultRow>(text: string): Promise<QueryResult<Row>> {
    return result(text === 'SELECT 1' ? [{ '?column?': 1 }] : []) as QueryResult<Row>;
  }
  async transaction<T>(work: (database: TransactionDatabase) => Promise<T>): Promise<T> { return work(this); }
  async close(): Promise<void> {}
}

class MemoryEvidenceRepository implements EvidenceRepository {
  assets = new Map<string, { userId: string; asset: EvidenceAsset }>();
  submissions = new Map<string, { userId: string; requestHash: string; withdrawalId: string | null; submission: EvidenceSubmission }>();

  async list(userId: string, curriculumId: string, revision: number, proofId: string) {
    return [...this.submissions.values()].filter((entry) => entry.userId === userId && entry.submission.curriculumId === curriculumId && entry.submission.curriculumRevision === revision && entry.submission.proofId === proofId).map((entry) => entry.submission).sort((a, b) => b.submissionRevision - a.submissionRevision);
  }
  async get(userId: string, id: string) { const entry = this.submissions.get(id); return entry?.userId === userId ? entry.submission : null; }
  async getAsset(userId: string, id: string) { const entry = this.assets.get(id); return entry?.userId === userId ? entry.asset : null; }
  async createUploadIntent(userId: string, input: UploadIntentInput, bucketId: string, objectKey: string, requestHash: string, expiresAt: string): Promise<UploadIntentResult> {
    const prior = [...this.assets.values()].find((entry) => entry.userId === userId && entry.asset.clientAssetId === input.clientAssetId);
    if (prior) return prior.asset.intentRequestHash === requestHash ? { kind: 'duplicate', asset: prior.asset } : { kind: 'idempotency_key_reused' };
    const now = new Date().toISOString();
    const asset: EvidenceAsset = {
      id: randomUUID(), userId, clientAssetId: input.clientAssetId, curriculumId: input.curriculumId,
      curriculumRevision: input.curriculumRevision, proofId: input.proofId, evidenceRequirementId: input.evidenceRequirementId,
      status: 'upload_pending', bucketId, objectKey, originalFilename: input.originalFilename,
      declaredMimeType: input.mimeType, detectedMimeType: null, declaredByteSize: input.byteSize, byteSize: null,
      sha256: null, intentRequestHash: requestHash, evidenceItemId: null, intentExpiresAt: expiresAt,
      readyAt: null, abandonedAt: null, createdAt: now, updatedAt: now,
    };
    this.assets.set(asset.id, { userId, asset });
    return { kind: 'created', asset };
  }
  async markAssetReady(userId: string, id: string, details: InspectedEvidenceObject) {
    const entry = this.assets.get(id);
    if (!entry || entry.userId !== userId || entry.asset.status === 'abandoned') return null;
    entry.asset = { ...entry.asset, status: 'ready', detectedMimeType: details.mimeType, byteSize: details.byteSize, sha256: details.sha256, readyAt: entry.asset.readyAt ?? new Date().toISOString(), updatedAt: new Date().toISOString() };
    return entry.asset;
  }
  async abandonAsset(userId: string, id: string) {
    const entry = this.assets.get(id);
    if (!entry || entry.userId !== userId || entry.asset.evidenceItemId) return null;
    entry.asset = { ...entry.asset, status: 'abandoned', abandonedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    return entry.asset;
  }
  async createSubmission(userId: string, input: EvidenceSubmissionInput, requestHash: string): Promise<SubmissionResult> {
    const duplicate = [...this.submissions.values()].find((entry) => entry.userId === userId && entry.submission.clientSubmissionId === input.clientSubmissionId);
    if (duplicate) return duplicate.requestHash === requestHash ? { kind: 'duplicate', submission: duplicate.submission } : { kind: 'idempotency_key_reused' };
    const current = [...this.submissions.values()].find((entry) => entry.userId === userId && entry.submission.curriculumId === input.curriculumId && entry.submission.proofId === input.proofId && entry.submission.status === 'submitted');
    if ((current?.submission.id ?? null) !== input.expectedCurrentSubmissionId) return { kind: 'current_submission_conflict' };
    const fileAssets: EvidenceAsset[] = [];
    for (const item of input.items) {
      if (item.kind !== 'file') continue;
      const entry = this.assets.get(item.assetId);
      if (!entry || entry.userId !== userId || entry.asset.status !== 'ready' || entry.asset.evidenceItemId || entry.asset.evidenceRequirementId !== item.evidenceRequirementId) return { kind: 'asset_unavailable' };
      fileAssets.push(entry.asset);
    }
    if (fileAssets.reduce((sum, asset) => sum + (asset.byteSize ?? 0), 0) > 10 * 1024 * 1024) return { kind: 'asset_unavailable' };
    if (current) current.submission = { ...current.submission, status: 'superseded', statusChangedAt: new Date().toISOString() };
    const now = new Date().toISOString();
    const submission: EvidenceSubmission = {
      id: randomUUID(), curriculumId: input.curriculumId, curriculumRevision: input.curriculumRevision,
      evidenceSchemaVersion: 1, weekId: input.weekId, buildId: input.buildId, proofId: input.proofId,
      submissionRevision: (current?.submission.submissionRevision ?? 0) + 1, supersedesSubmissionId: current?.submission.id ?? null,
      status: 'submitted', clientSubmissionId: input.clientSubmissionId, submittedAt: now, statusChangedAt: now,
      items: input.items.map((item) => {
        const id = randomUUID();
        const asset = item.kind === 'file' ? this.assets.get(item.assetId)!.asset : null;
        if (asset) {
          this.assets.get(asset.id)!.asset = { ...asset, evidenceItemId: id, updatedAt: now };
        }
        const payload = item.kind === 'text' ? { text: item.text }
          : item.kind === 'url' ? { url: item.url }
            : item.kind === 'repository' ? { repositoryUrl: item.repositoryUrl, provider: item.provider ?? null, commitSha: item.commitSha ?? null, branch: item.branch ?? null }
              : item.kind === 'file' ? { assetId: item.assetId } : { attested: true };
        return { id, evidenceRequirementId: item.evidenceRequirementId, kind: item.kind, payload, assets: asset ? [this.assets.get(asset.id)!.asset] : [] };
      }),
    };
    this.submissions.set(submission.id, { userId, requestHash, withdrawalId: null, submission });
    return { kind: 'created', submission };
  }
  async withdraw(userId: string, id: string, mutationId: string): Promise<WithdrawResult> {
    const reused = [...this.submissions.values()].find((entry) => entry.userId === userId && entry.withdrawalId === mutationId);
    if (reused && reused.submission.id !== id) return { kind: 'idempotency_key_reused' };
    const entry = this.submissions.get(id);
    if (!entry || entry.userId !== userId) return { kind: 'not_found' };
    if (entry.submission.status === 'withdrawn') return entry.withdrawalId === mutationId ? { kind: 'duplicate', submission: entry.submission } : { kind: 'idempotency_key_reused' };
    if (entry.submission.status !== 'submitted') return { kind: 'not_current' };
    entry.withdrawalId = mutationId;
    entry.submission = { ...entry.submission, status: 'withdrawn', statusChangedAt: new Date().toISOString() };
    return { kind: 'withdrawn', submission: entry.submission };
  }
}

class MemoryEvidenceStorage implements EvidenceStorage {
  objects = new Map<string, { bytes: Buffer; mimeType: string }>();
  async createUploadAuthorization(path: string) { return { path, token: `token:${path}`, expiresAt: new Date(Date.now() + 1000).toISOString() }; }
  async inspect(path: string): Promise<InspectedEvidenceObject> {
    const object = this.objects.get(path);
    if (!object) throw new Error('missing');
    return { byteSize: object.bytes.byteLength, mimeType: object.mimeType, sha256: createHash('sha256').update(object.bytes).digest('hex') };
  }
  async createDownloadUrl(path: string) { return { url: `https://private.example/${encodeURIComponent(path)}?signed=1`, expiresAt: new Date(Date.now() + 1000).toISOString() }; }
  async remove(path: string) { this.objects.delete(path); }
}

const apps: Awaited<ReturnType<typeof buildApp>>[] = [];
afterEach(async () => Promise.all(apps.splice(0).map((app) => app.close())));

async function setup(userId = userA, verified = true, repository = new MemoryEvidenceRepository(), storage: MemoryEvidenceStorage | null = new MemoryEvidenceStorage()) {
  const app = await buildApp({ config, database: new EmptyDatabase(), evidenceRepository: repository, evidenceStorage: storage, verifyAccessToken: async () => ({ userId, claims: {} }), resolveVerification: async () => ({ verified }) });
  apps.push(app);
  return { app, repository, storage };
}

function context() { return { curriculumId: 'PYAE', curriculumRevision: 3, weekId: 'PYAE-W01', buildId: 'PYAE-B-W01-01', proofId: 'PYAE-PR-W01' }; }
function textSubmission(overrides: Record<string, unknown> = {}) {
  return {
    clientSubmissionId: randomUUID(), expectedCurrentSubmissionId: null, ...context(),
    items: [
      { evidenceRequirementId: 'PYAE-PR-W01-E01', kind: 'text', text: 'artifact summary' },
      { evidenceRequirementId: 'PYAE-PR-W01-E02', kind: 'text', text: 'validation transcript' },
      { evidenceRequirementId: 'PYAE-PR-W01-E03', kind: 'self_attestation', attested: true },
    ],
    ...overrides,
  };
}

describe('Phase 3 evidence API', () => {
  test('requires verified identity', async () => {
    const unverified = await setup(userA, false);
    expect((await unverified.app.inject({ method: 'POST', url: '/api/v1/evidence/submissions', headers: auth, payload: textSubmission() })).statusCode).toBe(403);
  });

  test('never trusts a user ID in the payload', async () => {
    const verified = await setup();
    expect((await verified.app.inject({ method: 'POST', url: '/api/v1/evidence/submissions', headers: auth, payload: { ...textSubmission(), userId: userB } })).statusCode).toBe(400);
  });

  test('creates a server-acknowledged submission without inventing verification', async () => {
    const { app } = await setup();
    const response = await app.inject({ method: 'POST', url: '/api/v1/evidence/submissions', headers: auth, payload: textSubmission() });
    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({ outcome: 'created', submission: { status: 'submitted', submissionRevision: 1, evidenceSchemaVersion: 1 } });
    expect(response.body).not.toContain('verified');
  });

  test('validates the fixed PYAE R3 evidence contract and safe URLs', async () => {
    const { app } = await setup();
    const missing = textSubmission({ items: [{ evidenceRequirementId: 'PYAE-PR-W01-E03', kind: 'self_attestation', attested: true }] });
    expect((await app.inject({ method: 'POST', url: '/api/v1/evidence/submissions', headers: auth, payload: missing })).statusCode).toBe(400);
    const unsafe = textSubmission();
    unsafe.items[0] = { evidenceRequirementId: 'PYAE-PR-W01-E01', kind: 'url', url: 'https://user:secret@example.com/private' } as never;
    expect((await app.inject({ method: 'POST', url: '/api/v1/evidence/submissions', headers: auth, payload: unsafe })).statusCode).toBe(400);
  });

  test('treats exact retries as duplicates and rejects changed idempotency reuse', async () => {
    const { app } = await setup();
    const payload = textSubmission();
    expect((await app.inject({ method: 'POST', url: '/api/v1/evidence/submissions', headers: auth, payload })).statusCode).toBe(201);
    expect((await app.inject({ method: 'POST', url: '/api/v1/evidence/submissions', headers: auth, payload })).json().outcome).toBe('duplicate');
    payload.items[0]!.text = 'different';
    const changed = await app.inject({ method: 'POST', url: '/api/v1/evidence/submissions', headers: auth, payload });
    expect(changed.statusCode).toBe(409);
    expect(changed.json().error.code).toBe('IDEMPOTENCY_KEY_REUSED');
  });

  test('creates immutable revisions only against the expected current submission', async () => {
    const { app } = await setup();
    const first = (await app.inject({ method: 'POST', url: '/api/v1/evidence/submissions', headers: auth, payload: textSubmission() })).json().submission;
    const stale = await app.inject({ method: 'POST', url: '/api/v1/evidence/submissions', headers: auth, payload: textSubmission() });
    expect(stale.statusCode).toBe(409);
    const second = (await app.inject({ method: 'POST', url: '/api/v1/evidence/submissions', headers: auth, payload: textSubmission({ expectedCurrentSubmissionId: first.id }) })).json().submission;
    expect(second).toMatchObject({ submissionRevision: 2, supersedesSubmissionId: first.id, status: 'submitted' });
    const history = (await app.inject({ method: 'GET', url: '/api/v1/evidence/proofs/PYAE-PR-W01/submissions?curriculumId=PYAE&revision=3', headers: auth })).json().submissions;
    expect(history.map((entry: EvidenceSubmission) => entry.status)).toEqual(['submitted', 'superseded']);
  });

  test('returns 404 rather than exposing another account submission', async () => {
    const repository = new MemoryEvidenceRepository();
    const owner = await setup(userA, true, repository);
    const id = (await owner.app.inject({ method: 'POST', url: '/api/v1/evidence/submissions', headers: auth, payload: textSubmission() })).json().submission.id;
    const other = await setup(userB, true, repository);
    expect((await other.app.inject({ method: 'GET', url: `/api/v1/evidence/submissions/${id}`, headers: auth })).statusCode).toBe(404);
  });

  test('enforces file type and size policy before issuing private upload authorization', async () => {
    const { app } = await setup();
    const base = { clientAssetId: randomUUID(), ...context(), evidenceRequirementId: 'PYAE-PR-W01-E01', originalFilename: 'proof.exe', mimeType: 'application/octet-stream', byteSize: 10 };
    expect((await app.inject({ method: 'POST', url: '/api/v1/evidence/upload-intents', headers: auth, payload: base })).statusCode).toBe(415);
    expect((await app.inject({ method: 'POST', url: '/api/v1/evidence/upload-intents', headers: auth, payload: { ...base, originalFilename: 'proof.zip', mimeType: 'application/zip', byteSize: 6 * 1024 * 1024 + 1 } })).statusCode).toBe(413);
  });

  test('finalizes only matching bytes and permits access only after submission', async () => {
    const { app, repository, storage } = await setup();
    const bytes = Buffer.from('evidence text');
    const intentPayload = { clientAssetId: randomUUID(), ...context(), evidenceRequirementId: 'PYAE-PR-W01-E01', originalFilename: 'proof.txt', mimeType: 'text/plain', byteSize: bytes.byteLength };
    const intent = (await app.inject({ method: 'POST', url: '/api/v1/evidence/upload-intents', headers: auth, payload: intentPayload })).json();
    storage!.objects.set(intent.upload.path, { bytes, mimeType: 'text/plain' });
    expect((await app.inject({ method: 'POST', url: `/api/v1/evidence/assets/${intent.asset.id}/finalize`, headers: auth })).statusCode).toBe(200);
    expect((await app.inject({ method: 'POST', url: `/api/v1/evidence/assets/${intent.asset.id}/access`, headers: auth })).statusCode).toBe(409);
    const submission = textSubmission({ items: [
      { evidenceRequirementId: 'PYAE-PR-W01-E01', kind: 'file', assetId: intent.asset.id },
      { evidenceRequirementId: 'PYAE-PR-W01-E02', kind: 'text', text: 'validation transcript' },
      { evidenceRequirementId: 'PYAE-PR-W01-E03', kind: 'self_attestation', attested: true },
    ] });
    expect((await app.inject({ method: 'POST', url: '/api/v1/evidence/submissions', headers: auth, payload: submission })).statusCode).toBe(201);
    const access = await app.inject({ method: 'POST', url: `/api/v1/evidence/assets/${intent.asset.id}/access`, headers: auth });
    expect(access.statusCode).toBe(200);
    expect(access.json().download.url).toContain('signed=1');
    expect(repository.assets.get(intent.asset.id)!.asset.evidenceItemId).not.toBeNull();
  });

  test('rejects uploaded bytes that do not match declared metadata', async () => {
    const { app, storage } = await setup();
    const payload = { clientAssetId: randomUUID(), ...context(), evidenceRequirementId: 'PYAE-PR-W01-E01', originalFilename: 'proof.json', mimeType: 'application/json', byteSize: 2 };
    const intent = (await app.inject({ method: 'POST', url: '/api/v1/evidence/upload-intents', headers: auth, payload })).json();
    storage!.objects.set(intent.upload.path, { bytes: Buffer.from('not json'), mimeType: 'text/plain' });
    const finalized = await app.inject({ method: 'POST', url: `/api/v1/evidence/assets/${intent.asset.id}/finalize`, headers: auth });
    expect(finalized.statusCode).toBe(409);
    expect(finalized.json().error.code).toBe('EVIDENCE_FILE_MISMATCH');
  });

  test('withdraws the current revision while preserving its history', async () => {
    const { app } = await setup();
    const submission = (await app.inject({ method: 'POST', url: '/api/v1/evidence/submissions', headers: auth, payload: textSubmission() })).json().submission;
    const payload = { clientMutationId: randomUUID() };
    const first = await app.inject({ method: 'POST', url: `/api/v1/evidence/submissions/${submission.id}/withdraw`, headers: auth, payload });
    expect(first.json()).toMatchObject({ outcome: 'withdrawn', submission: { status: 'withdrawn' } });
    expect((await app.inject({ method: 'POST', url: `/api/v1/evidence/submissions/${submission.id}/withdraw`, headers: auth, payload })).json().outcome).toBe('duplicate');
  });

  test('supports text-only submissions when binary storage is not configured', async () => {
    const { app } = await setup(userA, true, new MemoryEvidenceRepository(), null);
    expect((await app.inject({ method: 'POST', url: '/api/v1/evidence/submissions', headers: auth, payload: textSubmission() })).statusCode).toBe(201);
    const upload = await app.inject({ method: 'POST', url: '/api/v1/evidence/upload-intents', headers: auth, payload: {} });
    expect(upload.statusCode).toBe(503);
    expect(upload.json().error.code).toBe('EVIDENCE_STORAGE_UNAVAILABLE');
  });
});

function result(rows: Record<string, unknown>[]): QueryResult<QueryResultRow> {
  return { command: 'SELECT', rowCount: rows.length, oid: 0, fields: [], rows };
}
