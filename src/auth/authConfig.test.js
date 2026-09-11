import assert from 'node:assert/strict';
import test from 'node:test';
import { authRedirect, resolveAuthConfig } from './authConfig.js';

test('missing Supabase environment degrades to an explicit unconfigured state', () => {
  const config = resolveAuthConfig({ VITE_API_BASE_URL: 'http://localhost:3001' });
  assert.equal(config.configured, false);
  assert.deepEqual(config.missing, ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY']);
});

test('complete auth configuration is normalized without exposing private database configuration', () => {
  const config = resolveAuthConfig({
    VITE_SUPABASE_URL: 'https://example.supabase.co/',
    VITE_SUPABASE_PUBLISHABLE_KEY: 'public-test-key',
    VITE_API_BASE_URL: 'http://localhost:3001/',
  });
  assert.equal(config.configured, true);
  assert.equal(config.supabaseUrl, 'https://example.supabase.co');
  assert.equal(config.apiBaseUrl, 'http://localhost:3001');
  assert.equal(Object.hasOwn(config, 'DATABASE_URL'), false);
});

test('auth redirect routes follow the current deployment origin', () => {
  assert.equal(authRedirect('http://localhost:5173', '/auth/verify'), 'http://localhost:5173/auth/verify');
  assert.equal(authRedirect('https://xcelerate.example', '/auth/update-password'), 'https://xcelerate.example/auth/update-password');
});
