import type { QueryResult, QueryResultRow } from 'pg';
import { afterEach, describe, expect, test } from 'vitest';
import { buildApp } from '../src/app.js';
import type { BackendEnvironment } from '../src/config/env.js';
import type { Database, TransactionDatabase } from '../src/db/database.js';
import { canonicalStringify, sha256Canonical } from '../src/modules/progress/canonical.js';

const config: BackendEnvironment = {
  NODE_ENV: 'test', HOST: '127.0.0.1', PORT: 3001,
  DATABASE_URL: 'postgresql://example.invalid/database',
  SUPABASE_URL: 'https://example.supabase.co', SUPABASE_PUBLISHABLE_KEY: 'public-test-key',
  CORS_ORIGINS: ['http://localhost:5173'],
};
const userA = '123e4567-e89b-42d3-a456-426614174000';
const userB = '523e4567-e89b-42d3-a456-426614174999';
const auth = () => ({ authorization: 'Bearer test-token' });
const emptyCloudState = () => ({
  curriculumState: {
    curriculumId: 'PYAE', lastSeenRevision: 3, activeWeekId: 'PYAE-W01', completedWeekIds: [] as string[],
    stageSatisfaction: {}, resources: {}, skillChecks: {}, builds: {}, proofs: {}, reflections: {},
  },
  notes: { records: [] as Record<string, unknown>[], tombstones: [] },
  blockers: { records: [] as Record<string, unknown>[], tombstones: [] },
});
const mutation = (overrides: Record<string, unknown> = {}) => ({
  expectedVersion: 0,
  expectedGeneration: 0,
  clientMutationId: crypto.randomUUID(),
  mutationType: 'sync',
  curriculumRevision: 3,
  stateSchemaVersion: 1,
  learnerState: emptyCloudState(),
  ...overrides,
});

interface StoredInstance extends QueryResultRow {
  id: string; user_id: string; curriculum_id: string; curriculum_revision: number; state_schema_version: number;
  learner_state: unknown; state_hash: string; version: number; generation: number; created_at: string; updated_at: string;
}

class ProgressMemoryDatabase implements Database {
  instances = new Map<string, StoredInstance>();
  mutations = new Map<string, Record<string, unknown>>();
  closed = false;
  private tail: Promise<void> = Promise.resolve();

  async transaction<T>(work: (database: TransactionDatabase) => Promise<T>): Promise<T> {
    let release!: () => void;
    const prior = this.tail;
    this.tail = new Promise<void>((resolve) => { release = resolve; });
    await prior;
    const instanceBackup = structuredClone(this.instances);
    const mutationBackup = structuredClone(this.mutations);
    try {
      return await work(this);
    } catch (error) {
      this.instances = instanceBackup;
      this.mutations = mutationBackup;
      throw error;
    } finally {
      release();
    }
  }

  async query<Row extends QueryResultRow = QueryResultRow>(text: string, values: readonly unknown[] = []): Promise<QueryResult<Row>> {
    if (text === 'SELECT 1') return result([{ '?column?': 1 }]) as QueryResult<Row>;
    if (text.includes('public.profiles')) return result([]) as QueryResult<Row>;
    if (text.includes('FROM public.learning_instances')) {
      const key = `${values[0]}:${values[1]}`;
      const stored = this.instances.get(key);
      return result(stored ? [stored] : []) as QueryResult<Row>;
    }
    if (text.includes('INSERT INTO public.learning_instances')) {
      const key = `${values[0]}:${values[1]}`;
      if (this.instances.has(key)) return result([]) as QueryResult<Row>;
      const now = new Date().toISOString();
      const stored: StoredInstance = {
        id: crypto.randomUUID(), user_id: String(values[0]), curriculum_id: String(values[1]),
        curriculum_revision: Number(values[2]), state_schema_version: Number(values[3]),
        learner_state: JSON.parse(String(values[4])), state_hash: String(values[5]), version: 1, generation: 0,
        created_at: now, updated_at: now,
      };
      this.instances.set(key, stored);
      return result([stored]) as QueryResult<Row>;
    }
    if (text.includes('FROM public.learning_instance_mutations')) {
      const stored = this.mutations.get(`${values[0]}:${values[1]}`);
      return result(stored ? [stored] : []) as QueryResult<Row>;
    }
    if (text.includes('INSERT INTO public.learning_instance_mutations')) {
      this.mutations.set(`${values[0]}:${values[1]}`, {
        request_hash: values[2], resulting_version: values[3], resulting_generation: values[4], outcome: values[5],
      });
      return result([]) as QueryResult<Row>;
    }
    if (text.includes('UPDATE public.learning_instances')) {
      const key = `${values[0]}:${values[1]}`;
      const stored = this.instances.get(key);
      if (!stored || stored.version !== Number(values[7]) || stored.generation !== Number(values[8])) return result([]) as QueryResult<Row>;
      const updated: StoredInstance = {
        ...stored,
        curriculum_revision: Number(values[2]), state_schema_version: Number(values[3]), learner_state: JSON.parse(String(values[4])),
        state_hash: String(values[5]), version: stored.version + 1, generation: Number(values[6]), updated_at: new Date().toISOString(),
      };
      this.instances.set(key, updated);
      return result([updated]) as QueryResult<Row>;
    }
    return result([]) as QueryResult<Row>;
  }

  async close(): Promise<void> { this.closed = true; }
}

const apps: Awaited<ReturnType<typeof buildApp>>[] = [];
afterEach(async () => Promise.all(apps.splice(0).map((app) => app.close())));

async function setup(database = new ProgressMemoryDatabase(), userId = userA, verified = true) {
  const app = await buildApp({
    config,
    database,
    verifyAccessToken: async () => ({ userId, claims: {} }),
    resolveVerification: async () => ({ verified }),
  });
  apps.push(app);
  return { app, database };
}

async function put(app: Awaited<ReturnType<typeof buildApp>>, payload: object) {
  return await app.inject({ method: 'PUT', url: '/api/v1/v2/learning-instances/PYAE', headers: auth(), payload });
}

describe('deterministic progress hashing', () => {
  test('sorts nested keys and changes when logical content changes', () => {
    expect(canonicalStringify({ z: { b: 2, a: 1 }, a: true })).toBe(canonicalStringify({ a: true, z: { a: 1, b: 2 } }));
    expect(sha256Canonical({ z: { b: 2, a: 1 }, a: true })).toBe('825cce5775e992c17886545fb7e26450fd51ddbb8644da4c765fdcdd63e3f3be');
    expect(sha256Canonical({ b: 2, a: 1 })).toBe(sha256Canonical({ a: 1, b: 2 }));
    expect(sha256Canonical({ a: 1 })).not.toBe(sha256Canonical({ a: 2 }));
  });
});

describe('V2 progress synchronization API', () => {
  test('creates and fetches an instance for the JWT subject', async () => {
    const database = new ProgressMemoryDatabase();
    const { app } = await setup(database);
    const created = await put(app, mutation());
    expect(created.statusCode).toBe(201);
    expect(created.json().instance).toMatchObject({ curriculumId: 'PYAE', version: 1, generation: 0 });
    expect((await app.inject({ method: 'GET', url: '/api/v1/v2/learning-instances/PYAE', headers: auth() })).statusCode).toBe(200);
  });

  test('allows exactly one winner in a create/create race', async () => {
    const database = new ProgressMemoryDatabase();
    const left = await setup(database);
    const right = await setup(database);
    const responses = await Promise.all([put(left.app, mutation()), put(right.app, mutation())]);
    expect(responses.map((response) => response.statusCode).sort()).toEqual([201, 409]);
    expect(database.instances.size).toBe(1);
  });

  test('does not expose another JWT subject instance', async () => {
    const database = new ProgressMemoryDatabase();
    const owner = await setup(database);
    expect((await put(owner.app, mutation())).statusCode).toBe(201);
    const other = await setup(database, userB);
    expect((await other.app.inject({ method: 'GET', url: '/api/v1/v2/learning-instances/PYAE', headers: auth() })).statusCode).toBe(404);
  });

  test('applies one conditional writer and rejects the stale writer', async () => {
    const { app } = await setup();
    await put(app, mutation());
    const left = mutation({ expectedVersion: 1, learnerState: { ...emptyCloudState(), notes: { records: [{ id: 'n1', roadmapId: 'PYAE', whatLearned: 'left' }], tombstones: [] } } });
    const right = mutation({ expectedVersion: 1, learnerState: { ...emptyCloudState(), notes: { records: [{ id: 'n2', roadmapId: 'PYAE', whatLearned: 'right' }], tombstones: [] } } });
    const responses = await Promise.all([put(app, left), put(app, right)]);
    expect(responses.map((response) => response.statusCode).sort()).toEqual([200, 409]);
    expect(responses.find((response) => response.statusCode === 409)?.json().error.code).toBe('SYNC_VERSION_CONFLICT');
  });

  test('recognizes an exact retry and rejects mutation ID reuse with different content', async () => {
    const { app } = await setup();
    const request = mutation();
    expect((await put(app, request)).statusCode).toBe(201);
    const retry = await put(app, request);
    expect(retry.statusCode).toBe(200);
    expect(retry.json()).toMatchObject({ outcome: 'duplicate', acknowledgedVersion: 1, acknowledgedGeneration: 0 });
    const changed = structuredClone(request);
    changed.learnerState.curriculumState.activeWeekId = 'PYAE-W02';
    const reused = await put(app, changed);
    expect(reused.statusCode).toBe(409);
    expect(reused.json().error.code).toBe('IDEMPOTENCY_KEY_REUSED');
  });

  test('does not increment version for an equivalent state with a new mutation ID', async () => {
    const { app } = await setup();
    await put(app, mutation());
    const response = await put(app, mutation({ expectedVersion: 1 }));
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ outcome: 'no_change', instance: { version: 1, generation: 0 } });
  });

  test('reset advances version and generation and blocks the old generation', async () => {
    const { app } = await setup();
    await put(app, mutation());
    const reset = await put(app, mutation({ expectedVersion: 1, mutationType: 'reset' }));
    expect(reset.json().instance).toMatchObject({ version: 2, generation: 1 });
    const stale = await put(app, mutation({ expectedVersion: 1, expectedGeneration: 0 }));
    expect(stale.statusCode).toBe(409);
    expect(stale.json().error.code).toBe('RESET_GENERATION_CONFLICT');
  });

  test('accepts new progress after a completed reset without crossing generations', async () => {
    const { app } = await setup();
    await put(app, mutation());
    expect((await put(app, mutation({ expectedVersion: 1, mutationType: 'reset' }))).statusCode).toBe(200);
    const afterReset = emptyCloudState();
    afterReset.curriculumState.completedWeekIds.push('PYAE-W01');
    const response = await put(app, mutation({ expectedVersion: 2, expectedGeneration: 1, learnerState: afterReset }));
    expect(response.statusCode).toBe(200);
    expect(response.json().instance).toMatchObject({ version: 3, generation: 1 });
  });

  test('serializes a reset/update race without allowing stale progress to overwrite a reset', async () => {
    const { app } = await setup();
    await put(app, mutation());
    const reset = mutation({ expectedVersion: 1, mutationType: 'reset' });
    const updateState = emptyCloudState();
    updateState.curriculumState.completedWeekIds.push('PYAE-W01');
    const update = mutation({ expectedVersion: 1, learnerState: updateState });
    const responses = await Promise.all([put(app, reset), put(app, update)]);
    expect(responses.map((response) => response.statusCode).sort()).toEqual([200, 409]);
    const stored = (await app.inject({ method: 'GET', url: '/api/v1/v2/learning-instances/PYAE', headers: auth() })).json().instance;
    if (responses[0].statusCode === 200) {
      expect(stored).toMatchObject({ generation: 1, version: 2 });
      expect(stored.learnerState.curriculumState.completedWeekIds).toEqual([]);
    } else {
      expect(stored).toMatchObject({ generation: 0, version: 2 });
      expect(stored.learnerState.curriculumState.completedWeekIds).toEqual(['PYAE-W01']);
    }
  });

  test('rejects curriculum content, unsupported metadata, and unverified access', async () => {
    const { app } = await setup();
    const content = mutation();
    content.learnerState.curriculumState.skillChecks = {
      'PYAE-SC-W01': { attempts: [{ attemptId: 'a1', attemptNumber: 1, questionIds: ['q1'], answers: { q1: 'a' }, score: 1, total: 1, percentage: 100, passed: true, submittedAt: new Date().toISOString(), questionSnapshot: [] }], consecutiveFailures: 0, recovery: null },
    };
    expect((await put(app, content)).statusCode).toBe(400);
    expect((await put(app, { ...mutation(), stateHash: 'browser-must-not-be-trusted' })).statusCode).toBe(400);
    expect((await put(app, { ...mutation(), user_id: userB })).statusCode).toBe(400);
    expect((await put(app, mutation({ stateSchemaVersion: 99 }))).json().error.code).toBe('UNSUPPORTED_STATE_SCHEMA');
    expect((await put(app, mutation({ curriculumRevision: 4 }))).json().error.code).toBe('CURRICULUM_METADATA_MISMATCH');
    const wrongArtifactScope = mutation();
    wrongArtifactScope.learnerState.notes.records.push({ id: 'n1', roadmapId: 'OTHER' });
    expect((await put(app, wrongArtifactScope)).statusCode).toBe(400);
    expect((await app.inject({ method: 'GET', url: '/api/v1/v2/learning-instances/CUSTOM', headers: auth() })).statusCode).toBe(404);
    const unverified = await setup(new ProgressMemoryDatabase(), userA, false);
    expect((await put(unverified.app, mutation())).statusCode).toBe(403);
  });

  test('keeps the global limit and returns an explicit 413 only for oversized sync payloads', async () => {
    const { app } = await setup();
    const oversized = mutation({ filler: 'x'.repeat((1024 * 1024) + 1) });
    const response = await put(app, oversized);
    expect(response.statusCode).toBe(413);
    expect(response.json().error.code).toBe('STATE_TOO_LARGE');
  });

  test('does not expose a collection/enumeration endpoint', async () => {
    const { app } = await setup();
    const response = await app.inject({ method: 'GET', url: '/api/v1/v2/learning-instances', headers: auth() });
    expect(response.statusCode).toBe(404);
  });
});

function result(rows: Record<string, unknown>[]): QueryResult<QueryResultRow> {
  return { command: 'SELECT', rowCount: rows.length, oid: 0, fields: [], rows };
}
