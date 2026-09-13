import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, test } from 'vitest';
import { parseBackendEnvironment } from '../src/config/env.js';

const completeEnvironment = {
  NODE_ENV: 'test',
  HOST: '127.0.0.1',
  PORT: '3001',
  DATABASE_URL: 'postgresql://example.invalid/database',
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'test-public-key',
  CORS_ORIGINS: 'http://localhost:5173,https://example.test',
};

const productionEnvironment = {
  ...completeEnvironment,
  NODE_ENV: 'production',
  HOST: '0.0.0.0',
  PORT: '10000',
  DATABASE_URL: 'postgresql://example.invalid/database?sslmode=verify-full',
  DATABASE_SSL_CA_FILE: path.resolve('deployment', 'supabase-ca.pem'),
};

describe('backend environment', () => {
  test('accepts complete configuration and parses typed values', () => {
    const parsed = parseBackendEnvironment(completeEnvironment);
    expect(parsed.PORT).toBe(3001);
    expect(parsed.CORS_ORIGINS).toEqual(['http://localhost:5173', 'https://example.test']);
  });

  test('rejects missing values and reports names without secret values', () => {
    const sensitiveValue = 'never-echo-this-secret';
    expect(() => parseBackendEnvironment({
      ...completeEnvironment,
      DATABASE_URL: sensitiveValue,
      SUPABASE_URL: '',
    })).toThrowError(/SUPABASE_URL/);

    try {
      parseBackendEnvironment({ ...completeEnvironment, DATABASE_URL: '', SUPABASE_PUBLISHABLE_KEY: sensitiveValue });
    } catch (error) {
      expect(String(error)).toContain('DATABASE_URL');
      expect(String(error)).not.toContain(sensitiveValue);
    }
  });

  test('rejects wildcard and malformed CORS origins', () => {
    expect(() => parseBackendEnvironment({ ...completeEnvironment, CORS_ORIGINS: '*' })).toThrowError(/CORS_ORIGINS/);
    expect(() => parseBackendEnvironment({ ...completeEnvironment, CORS_ORIGINS: 'not-an-origin' })).toThrowError(/CORS_ORIGINS/);
  });

  test('accepts only the current server-only Supabase secret-key format for evidence storage', () => {
    expect(parseBackendEnvironment({ ...completeEnvironment, SUPABASE_SECRET_KEY: 'sb_secret_test-value', EVIDENCE_BUCKET: 'learner-evidence' }).EVIDENCE_BUCKET).toBe('learner-evidence');
    expect(() => parseBackendEnvironment({ ...completeEnvironment, SUPABASE_SECRET_KEY: 'public-or-legacy-key' })).toThrowError(/SUPABASE_SECRET_KEY/);
  });

  test('accepts only an explicit verify-full PostgreSQL URL and absolute CA path in production', () => {
    const parsed = parseBackendEnvironment(productionEnvironment);
    expect(parsed.HOST).toBe('0.0.0.0');
    expect(parsed.PORT).toBe(10_000);
    expect(parsed.DATABASE_SSL_CA_FILE).toBe(productionEnvironment.DATABASE_SSL_CA_FILE);
  });

  test.each([
    ['missing mode', 'postgresql://example.invalid/database'],
    ['require', 'postgresql://example.invalid/database?sslmode=require'],
    ['verify-ca', 'postgresql://example.invalid/database?sslmode=verify-ca'],
    ['disable', 'postgresql://example.invalid/database?sslmode=disable'],
    ['prefer', 'postgresql://example.invalid/database?sslmode=prefer'],
    ['duplicate mode', 'postgresql://example.invalid/database?sslmode=verify-full&sslmode=verify-full'],
    ['non-PostgreSQL protocol', 'https://example.invalid/database?sslmode=verify-full'],
  ])('rejects production DATABASE_URL with %s', (_description, databaseUrl) => {
    expect(() => parseBackendEnvironment({ ...productionEnvironment, DATABASE_URL: databaseUrl }))
      .toThrowError(/DATABASE_URL/);
  });

  test.each([
    'ssl=true',
    'sslcert=client.pem',
    'sslkey=client.key',
    'sslrootcert=root.pem',
    'uselibpqcompat=true',
    'SSLMODE=verify-full',
  ])('rejects ambiguous production TLS option %s', (option) => {
    expect(() => parseBackendEnvironment({
      ...productionEnvironment,
      DATABASE_URL: `${productionEnvironment.DATABASE_URL}&${option}`,
    })).toThrowError(/DATABASE_URL/);
  });

  test('requires an absolute CA-file path in production', () => {
    expect(() => parseBackendEnvironment({ ...productionEnvironment, DATABASE_SSL_CA_FILE: undefined }))
      .toThrowError(/DATABASE_SSL_CA_FILE/);
    expect(() => parseBackendEnvironment({ ...productionEnvironment, DATABASE_SSL_CA_FILE: 'relative/ca.pem' }))
      .toThrowError(/DATABASE_SSL_CA_FILE/);
  });

  test('reports only invalid field names for rejected production TLS configuration', () => {
    const secretMarker = 'never-print-this';
    try {
      parseBackendEnvironment({
        ...productionEnvironment,
        DATABASE_URL: `postgresql://owner:${secretMarker}@example.invalid/database?sslmode=require`,
        DATABASE_SSL_CA_FILE: path.resolve(secretMarker, 'ca.pem'),
      });
      throw new Error('Expected production TLS validation to fail.');
    } catch (error) {
      expect(String(error)).toContain('DATABASE_URL');
      expect(String(error)).not.toContain(secretMarker);
    }
  });

  test('keeps local development compatible without forcing production TLS policy', () => {
    expect(parseBackendEnvironment({ ...completeEnvironment, NODE_ENV: 'development' }).DATABASE_URL)
      .toBe(completeEnvironment.DATABASE_URL);
  });

  test('package commands keep production startup provider-safe and backend tests in stable mode', async () => {
    const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')) as {
      scripts?: Record<string, string>;
    };
    expect(packageJson.scripts?.start).toBe('node dist/server.js');
    expect(packageJson.scripts?.test).toBe('vitest run --maxWorkers=1 --isolate=false');
  });
});
