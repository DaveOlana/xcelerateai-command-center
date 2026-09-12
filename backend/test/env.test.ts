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
});
