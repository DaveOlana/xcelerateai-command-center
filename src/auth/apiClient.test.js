import assert from 'node:assert/strict';
import test from 'node:test';
import { ApiClientError, createApiClient } from './apiClient.js';

test('API client attaches the current bearer token and sends only display_name', async () => {
  let captured;
  const client = createApiClient({
    baseUrl: 'http://localhost:3001/',
    getAccessToken: async () => 'access-token',
    fetchImpl: async (url, options) => {
      captured = { url, options };
      return new Response(JSON.stringify({ profile: { displayName: 'Olana' } }), { status: 200 });
    },
  });
  await client.updateProfile('Olana');
  assert.equal(captured.url, 'http://localhost:3001/api/v1/profile/me');
  assert.equal(captured.options.headers.Authorization, 'Bearer access-token');
  assert.deepEqual(JSON.parse(captured.options.body), { display_name: 'Olana' });
});

test('anonymous API calls omit Authorization', async () => {
  let headers;
  const client = createApiClient({
    baseUrl: 'http://localhost:3001',
    getAccessToken: async () => null,
    fetchImpl: async (_url, options) => { headers = options.headers; return new Response('{}', { status: 200 }); },
  });
  await client.getProfile();
  assert.equal(Object.hasOwn(headers, 'Authorization'), false);
});

test('API errors are normalized and network internals are not exposed', async () => {
  const serverErrorClient = createApiClient({
    baseUrl: 'http://localhost:3001',
    getAccessToken: async () => null,
    fetchImpl: async () => new Response(JSON.stringify({ error: { code: 'EMAIL_VERIFICATION_REQUIRED', message: 'Email verification is required.' } }), { status: 403 }),
  });
  await assert.rejects(serverErrorClient.getProfile(), (error) => error instanceof ApiClientError && error.code === 'EMAIL_VERIFICATION_REQUIRED' && error.status === 403);

  const networkClient = createApiClient({
    baseUrl: 'http://localhost:3001', getAccessToken: async () => null, fetchImpl: async () => { throw new Error('private network detail'); },
  });
  await assert.rejects(networkClient.getProfile(), (error) => error.message === 'Cloud services are currently unreachable.' && !error.message.includes('private'));
});
