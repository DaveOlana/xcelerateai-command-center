import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { rootCertificates } from 'node:tls';
import { afterEach, describe, expect, test } from 'vitest';
import type { BackendEnvironment } from '../src/config/env.js';
import { createPostgresConnectionConfig } from '../src/db/connectionConfig.js';

const temporaryDirectories: string[] = [];

const baseConfig: BackendEnvironment = {
  NODE_ENV: 'test',
  HOST: '127.0.0.1',
  PORT: 3001,
  DATABASE_URL: 'postgresql://example.invalid/database',
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'test-public-key',
  CORS_ORIGINS: ['http://localhost:5173'],
};

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe('PostgreSQL verified TLS connection configuration', () => {
  test('loads a CA file and creates strict connection-scoped TLS without URL overrides', async () => {
    const caFile = await createTemporaryCaFile(rootCertificates[0] ?? '');
    const config = createPostgresConnectionConfig({
      ...baseConfig,
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://example.invalid/database?application_name=test&sslmode=verify-full',
      DATABASE_SSL_CA_FILE: caFile,
    });

    expect(config.connectionString).toContain('application_name=test');
    expect(config.connectionString).not.toContain('sslmode');
    expect(config.ssl).toEqual({ ca: rootCertificates[0], rejectUnauthorized: true });
    expect(config.ssl).not.toHaveProperty('checkServerIdentity');
  });

  test('fails closed when the CA file cannot be read without exposing its path', () => {
    const secretPath = path.resolve(tmpdir(), 'do-not-print-this', 'missing.pem');
    expect(() => createPostgresConnectionConfig({
      ...baseConfig,
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://example.invalid/database?sslmode=verify-full',
      DATABASE_SSL_CA_FILE: secretPath,
    })).toThrowError('Invalid backend environment variables: DATABASE_SSL_CA_FILE');

    try {
      createPostgresConnectionConfig({
        ...baseConfig,
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://example.invalid/database?sslmode=verify-full',
        DATABASE_SSL_CA_FILE: secretPath,
      });
    } catch (error) {
      expect(String(error)).not.toContain(secretPath);
    }
  });

  test('fails closed for malformed or unusable CA content', async () => {
    const caFile = await createTemporaryCaFile('not a certificate');
    expect(() => createPostgresConnectionConfig({
      ...baseConfig,
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://example.invalid/database?sslmode=verify-full',
      DATABASE_SSL_CA_FILE: caFile,
    })).toThrowError('Invalid backend environment variables: DATABASE_SSL_CA_FILE');
  });

  test('leaves non-production database connection behavior unchanged', () => {
    expect(createPostgresConnectionConfig(baseConfig)).toEqual({
      connectionString: baseConfig.DATABASE_URL,
    });
  });
});

async function createTemporaryCaFile(contents: string): Promise<string> {
  const directory = await mkdtemp(path.join(tmpdir(), 'xcelerateai-db-tls-'));
  temporaryDirectories.push(directory);
  const caFile = path.join(directory, 'ca.pem');
  await writeFile(caFile, contents, 'utf8');
  return caFile;
}
