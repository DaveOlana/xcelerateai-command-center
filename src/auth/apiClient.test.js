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

test('progress client encodes curriculum identity and retains conflict payloads', async () => {
  const calls = [];
  const client = createApiClient({
    baseUrl: 'http://localhost:3001',
    getAccessToken: async () => 'token',
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      if (options?.method === 'PUT') return new Response(JSON.stringify({ error: { code: 'SYNC_VERSION_CONFLICT', message: 'Conflict' }, instance: { version: 2 } }), { status: 409 });
      return new Response(JSON.stringify({ instance: { version: 1 } }), { status: 200 });
    },
  });
  assert.equal((await client.getLearningInstance('PYAE')).instance.version, 1);
  await assert.rejects(
    () => client.putLearningInstance('PYAE', { expectedVersion: 1 }),
    (error) => error instanceof ApiClientError && error.status === 409 && error.payload.instance.version === 2,
  );
  assert.equal(calls[1].options.headers.Authorization, 'Bearer token');
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

test('evidence client uses purpose-specific routes and preserves server-owned identifiers', async () => {
  const calls = [];
  const client = createApiClient({
    baseUrl: 'http://localhost:3001',
    getAccessToken: async () => 'evidence-token',
    fetchImpl: async (url, options = {}) => {
      calls.push({ url, options });
      return new Response(JSON.stringify({ outcome: 'created', submission: { id: 'server-submission-id' }, submissions: [] }), { status: 200 });
    },
  });
  await client.listEvidenceSubmissions({ curriculumId: 'PYAE', revision: 3, proofId: 'PYAE-PR-W01' });
  await client.createEvidenceSubmission({ clientSubmissionId: 'client-id', items: [] });
  await client.withdrawEvidenceSubmission('submission/id', 'mutation-id');
  assert.equal(calls[0].url, 'http://localhost:3001/api/v1/evidence/proofs/PYAE-PR-W01/submissions?curriculumId=PYAE&revision=3');
  assert.equal(calls[1].url, 'http://localhost:3001/api/v1/evidence/submissions');
  assert.equal(calls[1].options.method, 'POST');
  assert.deepEqual(JSON.parse(calls[1].options.body), { clientSubmissionId: 'client-id', items: [] });
  assert.equal(calls[2].url, 'http://localhost:3001/api/v1/evidence/submissions/submission%2Fid/withdraw');
  assert.equal(calls[2].options.headers.Authorization, 'Bearer evidence-token');
});

test('verification client sends only structured results and a source fingerprint', async () => {
  const calls = [];
  const client = createApiClient({
    baseUrl: 'http://localhost:3001', getAccessToken: async () => 'token',
    fetchImpl: async (url, options = {}) => { calls.push({ url, options }); return new Response(JSON.stringify({ outcome: 'created', result: {} }), { status: 200 }); },
  });
  const payload = { evidenceSubmissionId: 'submission', requirementId: 'requirement', sourceSha256: 'a'.repeat(64), checks: [] };
  await client.createBrowserPythonVerification(payload);
  await client.createStructuralVerification({ evidenceSubmissionId: 'submission', requirementId: 'requirement' });
  await client.listVerificationResults('submission/id');
  assert.equal(calls[0].url, 'http://localhost:3001/api/v1/verifications/browser-python');
  assert.deepEqual(JSON.parse(calls[0].options.body), payload);
  assert.equal(Object.hasOwn(JSON.parse(calls[0].options.body), 'source'), false);
  assert.equal(calls[1].url, 'http://localhost:3001/api/v1/verifications/structural');
  assert.equal(calls[2].url, 'http://localhost:3001/api/v1/evidence/submissions/submission%2Fid/verifications');
});
