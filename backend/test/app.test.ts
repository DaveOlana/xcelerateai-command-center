import type { QueryResult, QueryResultRow } from 'pg';
import { afterEach, describe, expect, test } from 'vitest';
import { buildApp } from '../src/app.js';
import type { BackendEnvironment } from '../src/config/env.js';
import type { Database } from '../src/db/database.js';

const config: BackendEnvironment = {
  NODE_ENV: 'test',
  HOST: '127.0.0.1',
  PORT: 3001,
  DATABASE_URL: 'postgresql://example.invalid/database',
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'test-public-key',
  CORS_ORIGINS: ['http://localhost:5173'],
};
const userId = '123e4567-e89b-42d3-a456-426614174000';
const otherUserId = '523e4567-e89b-42d3-a456-426614174999';

class FakeDatabase implements Database {
  closed = false;
  failReadiness = false;
  failProfiles = false;
  profile: Record<string, unknown> | null = null;
  calls: Array<{ text: string; values?: readonly unknown[] }> = [];

  async query<Row extends QueryResultRow = QueryResultRow>(text: string, values?: readonly unknown[]): Promise<QueryResult<Row>> {
    this.calls.push({ text, ...(values ? { values } : {}) });
    if (text === 'SELECT 1') {
      if (this.failReadiness) throw new Error('private database detail');
      return result([{ '?column?': 1 }]) as QueryResult<Row>;
    }
    if (this.failProfiles) throw new Error('private database detail');
    if (text.includes('INSERT INTO public.profiles')) {
      this.profile ??= {
        user_id: values?.[0],
        display_name: values?.[1],
        created_at: '2026-09-10T00:00:00.000Z',
        updated_at: '2026-09-10T00:00:00.000Z',
      };
      return result([]) as QueryResult<Row>;
    }
    if (text.includes('UPDATE public.profiles')) {
      if (!this.profile) return result([]) as QueryResult<Row>;
      this.profile = {
        ...this.profile,
        user_id: values?.[0],
        display_name: values?.[1],
        updated_at: '2026-09-10T00:01:00.000Z',
      };
      return result([this.profile]) as QueryResult<Row>;
    }
    if (text.includes('FROM public.profiles')) return result(this.profile ? [this.profile] : []) as QueryResult<Row>;
    return result([]) as QueryResult<Row>;
  }

  async close(): Promise<void> {
    this.closed = true;
  }
}

const apps: Awaited<ReturnType<typeof buildApp>>[] = [];
afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

async function setup(options: { database?: FakeDatabase; verified?: boolean; tokenValid?: boolean } = {}) {
  const database = options.database ?? new FakeDatabase();
  const app = await buildApp({
    config,
    database,
    verifyAccessToken: async () => {
      if (options.tokenValid === false) throw new Error('invalid');
      return { userId, email: 'learner@example.test', claims: {} };
    },
    resolveVerification: async () => ({
      verified: options.verified !== false,
      displayName: 'Olana',
    }),
  });
  apps.push(app);
  return { app, database };
}

function auth() {
  return { authorization: 'Bearer test-token' };
}

describe('health and lifecycle', () => {
  test('/healthz reports process liveness without authentication', async () => {
    const { app } = await setup();
    const response = await app.inject({ method: 'GET', url: '/healthz' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });

  test('/readyz reports database readiness without leaking errors', async () => {
    const database = new FakeDatabase();
    database.failReadiness = true;
    const { app } = await setup({ database });
    const response = await app.inject({ method: 'GET', url: '/readyz' });
    expect(response.statusCode).toBe(503);
    expect(response.body).not.toContain('private database detail');
    expect(response.json()).toEqual({ status: 'not_ready', dependency: 'database' });
  });

  test('/readyz reports success when PostgreSQL responds', async () => {
    const { app } = await setup();
    const response = await app.inject({ method: 'GET', url: '/readyz' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ready' });
  });

  test('closing Fastify closes the PostgreSQL boundary', async () => {
    const { app, database } = await setup();
    await app.close();
    apps.splice(apps.indexOf(app), 1);
    expect(database.closed).toBe(true);
  });
});

describe('verified profile API', () => {
  test('missing, malformed, and invalid bearer credentials return 401', async () => {
    const { app } = await setup({ tokenValid: false });
    expect((await app.inject({ method: 'GET', url: '/api/v1/profile/me' })).statusCode).toBe(401);
    expect((await app.inject({ method: 'GET', url: '/api/v1/profile/me', headers: { authorization: 'Basic abc' } })).statusCode).toBe(401);
    expect((await app.inject({ method: 'GET', url: '/api/v1/profile/me', headers: auth() })).statusCode).toBe(401);
  });

  test('unverified identity cannot use cloud profile capability', async () => {
    const { app } = await setup({ verified: false });
    const response = await app.inject({ method: 'GET', url: '/api/v1/profile/me', headers: auth() });
    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe('EMAIL_VERIFICATION_REQUIRED');
  });

  test('verified identity receives a deterministic create-on-first profile', async () => {
    const { app } = await setup();
    const response = await app.inject({ method: 'GET', url: '/api/v1/profile/me', headers: auth() });
    expect(response.statusCode).toBe(200);
    expect(response.json().profile).toMatchObject({ userId, displayName: 'Olana' });
  });

  test('display name update is validated and scoped only to JWT subject', async () => {
    const { app, database } = await setup();
    const invalid = await app.inject({
      method: 'PATCH',
      url: '/api/v1/profile/me',
      headers: auth(),
      payload: { display_name: '', user_id: otherUserId },
    });
    expect(invalid.statusCode).toBe(400);
    const tooLong = await app.inject({
      method: 'PATCH', url: '/api/v1/profile/me', headers: auth(), payload: { display_name: 'x'.repeat(101) },
    });
    expect(tooLong.statusCode).toBe(400);

    const updated = await app.inject({
      method: 'PATCH',
      url: '/api/v1/profile/me',
      headers: auth(),
      payload: { display_name: 'New name' },
    });
    expect(updated.statusCode).toBe(200);
    const updateCall = database.calls.find((call) => call.text.includes('UPDATE public.profiles'));
    expect(updateCall?.values).toEqual([userId, 'New name']);
    expect(updated.json().profile.displayName).toBe('New name');
  });

  test('CORS does not authorize an origin outside the configured allowlist', async () => {
    const { app } = await setup();
    const response = await app.inject({ method: 'GET', url: '/healthz', headers: { origin: 'https://untrusted.example' } });
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  test('database failures return a safe generic response', async () => {
    const database = new FakeDatabase();
    database.failProfiles = true;
    const { app } = await setup({ database });
    const response = await app.inject({ method: 'GET', url: '/api/v1/profile/me', headers: auth() });
    expect(response.statusCode).toBe(500);
    expect(response.body).not.toContain('private database detail');
    expect(response.json().error.code).toBe('INTERNAL_ERROR');
  });
});

function result(rows: Record<string, unknown>[]): QueryResult<QueryResultRow> {
  return {
    command: 'SELECT',
    rowCount: rows.length,
    oid: 0,
    fields: [],
    rows,
  };
}
