import {
  SignJWT,
  createLocalJWKSet,
  exportJWK,
  generateKeyPair,
} from 'jose';
import { beforeAll, describe, expect, test } from 'vitest';
import { createAccessTokenVerifier } from '../src/plugins/auth.js';

const issuer = 'https://example.supabase.co/auth/v1';
const userId = '123e4567-e89b-42d3-a456-426614174000';
let privateKey: Awaited<ReturnType<typeof generateKeyPair>>['privateKey'];
let verifier: ReturnType<typeof createAccessTokenVerifier>;

beforeAll(async () => {
  const keys = await generateKeyPair('ES256');
  privateKey = keys.privateKey;
  const publicJwk = await exportJWK(keys.publicKey);
  publicJwk.kid = 'test-key';
  publicJwk.alg = 'ES256';
  verifier = createAccessTokenVerifier('https://example.supabase.co', createLocalJWKSet({ keys: [publicJwk] }));
});

async function token(overrides: { subject?: string; expiresIn?: string | number; role?: string } = {}) {
  return new SignJWT({ role: overrides.role ?? 'authenticated', email: 'learner@example.test' })
    .setProtectedHeader({ alg: 'ES256', kid: 'test-key' })
    .setIssuer(issuer)
    .setAudience('authenticated')
    .setSubject(overrides.subject ?? userId)
    .setIssuedAt()
    .setExpirationTime(overrides.expiresIn ?? '5m')
    .sign(privateKey);
}

describe('Supabase access-token verification', () => {
  test('accepts a valid asymmetric token and returns its subject', async () => {
    await expect(verifier(await token())).resolves.toMatchObject({ userId, email: 'learner@example.test' });
  });

  test('rejects an expired token', async () => {
    await expect(verifier(await token({ expiresIn: -1 }))).rejects.toThrow();
  });

  test('rejects a malformed token', async () => {
    await expect(verifier('not-a-token')).rejects.toThrow();
  });

  test('rejects an invalid signature', async () => {
    const otherKeys = await generateKeyPair('ES256');
    const invalid = await new SignJWT({ role: 'authenticated' })
      .setProtectedHeader({ alg: 'ES256', kid: 'test-key' })
      .setIssuer(issuer)
      .setAudience('authenticated')
      .setSubject(userId)
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(otherKeys.privateKey);
    await expect(verifier(invalid)).rejects.toThrow();
  });

  test('rejects non-authenticated roles and invalid subjects', async () => {
    await expect(verifier(await token({ role: 'anon' }))).rejects.toThrow();
    await expect(verifier(await token({ subject: 'not-a-uuid' }))).rejects.toThrow();
  });
});
