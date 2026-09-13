import { afterEach, describe, expect, test, vi } from 'vitest';
import type { BackendEnvironment } from '../src/config/env.js';
import { createVerificationResolver } from '../src/plugins/auth.js';

const userId = '123e4567-e89b-42d3-a456-426614174000';
const config: BackendEnvironment = {
  NODE_ENV: 'test', HOST: '127.0.0.1', PORT: 3001,
  DATABASE_URL: 'postgresql://example.invalid/database',
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'public-test-key',
  CORS_ORIGINS: ['http://localhost:5173'],
};
const identity = { userId, email: 'learner@example.test', claims: {} };

afterEach(() => vi.unstubAllGlobals());

describe('Supabase verified-user resolution', () => {
  test('uses the Auth user record as the confirmed-email authority', async () => {
    vi.stubGlobal('fetch', vi.fn(async (_url, options) => {
      expect(options.headers.apikey).toBe('public-test-key');
      expect(options.headers.authorization).toBe('Bearer signed-token');
      return new Response(JSON.stringify({
        id: userId,
        email_confirmed_at: '2026-09-11T00:00:00.000Z',
        user_metadata: { display_name: 'Olana' },
      }), { status: 200 });
    }));
    await expect(createVerificationResolver(config)('signed-token', identity)).resolves.toEqual({
      verified: true,
      displayName: 'Olana',
    });
  });

  test('keeps an unconfirmed identity out of cloud profile capabilities', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ id: userId, email_confirmed_at: null }), { status: 200 })));
    await expect(createVerificationResolver(config)('signed-token', identity)).resolves.toEqual({ verified: false });
  });

  test('rejects mismatched users and hides provider failures', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ id: '523e4567-e89b-42d3-a456-426614174999', email_confirmed_at: 'yes' }), { status: 200 })));
    await expect(createVerificationResolver(config)('signed-token', identity)).rejects.toMatchObject({ statusCode: 401, code: 'AUTH_INVALID' });
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('private provider detail'); }));
    await expect(createVerificationResolver(config)('signed-token', identity)).rejects.toMatchObject({ name: 'IdentityProviderUnavailableError' });
  });
});
