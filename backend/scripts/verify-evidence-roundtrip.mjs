import { randomBytes, randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { buildApp } from '../dist/app.js';
import { parseBackendEnvironment } from '../dist/config/env.js';
import { createPostgresDatabase } from '../dist/db/postgres.js';

const config = parseBackendEnvironment(process.env);
if (!config.SUPABASE_SECRET_KEY) throw new Error('Private evidence storage is not configured.');

const bucket = config.EVIDENCE_BUCKET ?? 'learner-evidence';
const admin = createClient(config.SUPABASE_URL, config.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
const publicStorage = createClient(config.SUPABASE_URL, config.SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
const users = [];
const objectKeys = [];
let app;
let verificationReport;
let verificationFailure;

const context = {
  curriculumId: 'PYAE',
  curriculumRevision: 3,
  weekId: 'PYAE-W01',
  buildId: 'PYAE-B-W01-01',
  proofId: 'PYAE-PR-W01',
};

function invariant(value, message) {
  if (!value) throw new Error(message);
}

async function createTestIdentity(label) {
  const suffix = `${Date.now()}-${randomUUID()}`;
  const email = `xcelerate-evidence-${label}-${suffix}@example.com`;
  const password = `Aa1!${randomBytes(24).toString('base64url')}`;
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: `Evidence test ${label}` },
  });
  if (created.error || !created.data.user) throw new Error(`Temporary ${label} identity could not be created.`);
  users.push(created.data.user.id);

  const authClient = createClient(config.SUPABASE_URL, config.SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const signedIn = await authClient.auth.signInWithPassword({ email, password });
  if (signedIn.error || !signedIn.data.session?.access_token) throw new Error(`Temporary ${label} identity could not sign in.`);
  return signedIn.data.session.access_token;
}

async function request(baseUrl, token, method, path, body, expectedStatuses) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const payload = await response.json().catch(() => null);
  invariant(expectedStatuses.includes(response.status), `${method} ${path} returned unexpected HTTP ${response.status}.`);
  return { status: response.status, payload };
}

async function createIntent(baseUrl, token, filename, bytes) {
  const result = await request(baseUrl, token, 'POST', '/api/v1/evidence/upload-intents', {
    clientAssetId: randomUUID(),
    ...context,
    evidenceRequirementId: 'PYAE-PR-W01-E01',
    originalFilename: filename,
    mimeType: 'text/plain',
    byteSize: bytes.byteLength,
  }, [201]);
  invariant(result.payload?.asset?.id && result.payload?.upload?.path && result.payload?.upload?.token, 'Upload intent response is incomplete.');
  objectKeys.push(result.payload.upload.path);
  return result.payload;
}

async function upload(intent, bytes) {
  const result = await publicStorage.storage
    .from(bucket)
    .uploadToSignedUrl(intent.upload.path, intent.upload.token, bytes, { contentType: 'text/plain' });
  if (result.error) throw new Error('Signed evidence upload failed.');
}

try {
  const ownerToken = await createTestIdentity('owner');
  const otherToken = await createTestIdentity('other');

  app = await buildApp({ config, database: createPostgresDatabase(config), logger: false });
  const address = await app.listen({ host: '127.0.0.1', port: 0 });
  const baseUrl = address.replace(/\/$/, '');

  const health = await fetch(`${baseUrl}/healthz`);
  const readiness = await fetch(`${baseUrl}/readyz`);
  invariant(health.status === 200 && readiness.status === 200, 'Health or readiness check failed.');

  const firstSubmissionBody = {
    clientSubmissionId: randomUUID(),
    expectedCurrentSubmissionId: null,
    ...context,
    items: [
      { evidenceRequirementId: 'PYAE-PR-W01-E01', kind: 'url', url: 'https://example.com/evidence' },
      { evidenceRequirementId: 'PYAE-PR-W01-E02', kind: 'text', text: 'Temporary live evidence round-trip verification.' },
      { evidenceRequirementId: 'PYAE-PR-W01-E03', kind: 'self_attestation', attested: true },
    ],
  };
  const first = await request(baseUrl, ownerToken, 'POST', '/api/v1/evidence/submissions', firstSubmissionBody, [201]);
  const firstId = first.payload?.submission?.id;
  invariant(firstId && first.payload?.submission?.status === 'submitted', 'Text/URL submission was not acknowledged.');
  const duplicateSubmission = await request(baseUrl, ownerToken, 'POST', '/api/v1/evidence/submissions', firstSubmissionBody, [200]);
  invariant(duplicateSubmission.payload?.outcome === 'duplicate', 'Submission retry was not idempotent.');
  await request(baseUrl, otherToken, 'GET', `/api/v1/evidence/submissions/${firstId}`, undefined, [404]);

  await request(baseUrl, ownerToken, 'POST', '/api/v1/evidence/upload-intents', {
    clientAssetId: randomUUID(), ...context, evidenceRequirementId: 'PYAE-PR-W01-E01',
    originalFilename: 'too-large.txt', mimeType: 'text/plain', byteSize: 6 * 1024 * 1024 + 1,
  }, [413]);
  await request(baseUrl, ownerToken, 'POST', '/api/v1/evidence/upload-intents', {
    clientAssetId: randomUUID(), ...context, evidenceRequirementId: 'PYAE-PR-W01-E01',
    originalFilename: 'unsafe.exe', mimeType: 'application/octet-stream', byteSize: 4,
  }, [415]);

  const fileBytes = new TextEncoder().encode('XcelerateAI private evidence integration fixture.\n');
  const intent = await createIntent(baseUrl, ownerToken, 'evidence.txt', fileBytes);
  await request(baseUrl, ownerToken, 'POST', `/api/v1/evidence/assets/${intent.asset.id}/finalize`, undefined, [409]);
  await upload(intent, fileBytes);
  const finalized = await request(baseUrl, ownerToken, 'POST', `/api/v1/evidence/assets/${intent.asset.id}/finalize`, undefined, [200]);
  invariant(finalized.payload?.outcome === 'finalized' && finalized.payload?.asset?.sha256, 'Uploaded asset was not independently finalized.');
  const duplicateFinalize = await request(baseUrl, ownerToken, 'POST', `/api/v1/evidence/assets/${intent.asset.id}/finalize`, undefined, [200]);
  invariant(duplicateFinalize.payload?.outcome === 'duplicate', 'Finalize retry was not idempotent.');

  const secondSubmissionBody = {
    clientSubmissionId: randomUUID(),
    expectedCurrentSubmissionId: firstId,
    ...context,
    items: [
      { evidenceRequirementId: 'PYAE-PR-W01-E01', kind: 'file', assetId: intent.asset.id },
      { evidenceRequirementId: 'PYAE-PR-W01-E02', kind: 'text', text: 'The private file replaces the URL evidence revision.' },
      { evidenceRequirementId: 'PYAE-PR-W01-E03', kind: 'self_attestation', attested: true },
    ],
  };
  const second = await request(baseUrl, ownerToken, 'POST', '/api/v1/evidence/submissions', secondSubmissionBody, [201]);
  invariant(second.payload?.submission?.submissionRevision === 2, 'Evidence revision did not supersede safely.');
  await request(baseUrl, otherToken, 'POST', `/api/v1/evidence/assets/${intent.asset.id}/access`, undefined, [404]);
  const access = await request(baseUrl, ownerToken, 'POST', `/api/v1/evidence/assets/${intent.asset.id}/access`, undefined, [200]);
  invariant(typeof access.payload?.download?.url === 'string', 'Authorized private download was not issued.');
  const download = await fetch(access.payload.download.url);
  const downloadedBytes = new Uint8Array(await download.arrayBuffer());
  invariant(download.ok && Buffer.from(downloadedBytes).equals(Buffer.from(fileBytes)), 'Private download bytes did not round-trip.');

  const abandonedBytes = new TextEncoder().encode('Temporary staged object.\n');
  const abandonedIntent = await createIntent(baseUrl, ownerToken, 'abandoned.txt', abandonedBytes);
  await upload(abandonedIntent, abandonedBytes);
  const abandoned = await request(baseUrl, ownerToken, 'POST', `/api/v1/evidence/assets/${abandonedIntent.asset.id}/abandon`, undefined, [200]);
  invariant(abandoned.payload?.outcome === 'abandoned', 'Staged asset was not abandoned.');
  const duplicateAbandon = await request(baseUrl, ownerToken, 'POST', `/api/v1/evidence/assets/${abandonedIntent.asset.id}/abandon`, undefined, [200]);
  invariant(duplicateAbandon.payload?.outcome === 'duplicate', 'Abandon retry was not idempotent.');

  const anonymousList = await publicStorage.storage.from(bucket).list('v1', { limit: 1 });
  invariant(Boolean(anonymousList.error) || anonymousList.data.length === 0, 'Private bucket was anonymously enumerable.');

  verificationReport = {
    health: true,
    readiness: true,
    authenticatedSubmission: true,
    textAndUrlEvidence: true,
    signedUpload: true,
    preUploadFinalizeRejected: true,
    serverMetadataAndChecksumConfirmed: true,
    immutableSupersedingRevision: true,
    authorizedPrivateDownload: true,
    crossAccountAccessDenied: true,
    duplicateSubmissionAndFinalizeSafe: true,
    stagedAssetAbandonmentSafe: true,
    sizeAndMimeRejections: true,
    anonymousEnumerationDenied: true,
  };
} catch (error) {
  verificationFailure = error;
} finally {
  let cleanupFailures = 0;
  for (const objectKey of objectKeys) {
    const result = await admin.storage.from(bucket).remove([objectKey]).catch(() => ({ error: true }));
    if (result.error) cleanupFailures += 1;
  }
  for (const userId of users) {
    const result = await admin.auth.admin.deleteUser(userId).catch(() => ({ error: true }));
    if (result.error) cleanupFailures += 1;
  }
  if (app) await app.close().catch(() => { cleanupFailures += 1; });
  if (cleanupFailures > 0) throw new Error(`Evidence integration cleanup failed for ${cleanupFailures} temporary resource(s).`);
}

if (verificationFailure) throw verificationFailure;
console.log(JSON.stringify(verificationReport, null, 2));
