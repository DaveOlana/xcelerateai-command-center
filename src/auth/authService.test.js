import assert from 'node:assert/strict';
import test from 'node:test';
import { createAuthService, deriveIdentityState, isEmailVerified } from './authService.js';

function fakeClient(calls) {
  const success = (name) => async (payload) => { calls.push([name, payload]); return { data: {}, error: null }; };
  return { auth: {
    getSession: success('getSession'),
    onAuthStateChange: (listener) => { calls.push(['subscribe', listener]); return { data: { subscription: { unsubscribe() {} } } }; },
    signInWithPassword: success('login'),
    signUp: success('signup'),
    signOut: success('logout'),
    resend: success('resend'),
    resetPasswordForEmail: success('recover'),
    updateUser: success('updatePassword'),
  } };
}

test('Auth service initializes and subscribes through Supabase session APIs', async () => {
  const calls = [];
  const service = createAuthService(fakeClient(calls), 'http://localhost:5173');
  await service.initialize();
  service.subscribe(() => {});
  assert.deepEqual(calls.map(([name]) => name), ['getSession', 'subscribe']);
});

test('signup carries display name and environment-aware email redirect without touching learner state', async () => {
  const calls = [];
  const learnerState = JSON.stringify({ curricula: { PYAE: { completedWeekIds: ['PYAE-W01'] } } });
  const storage = new Map([['xca_v2_learner_state_v1', learnerState]]);
  globalThis.localStorage = { getItem: (key) => storage.get(key), setItem: (key, value) => storage.set(key, value) };
  const service = createAuthService(fakeClient(calls), 'https://app.example');
  await service.signup('Olana', 'olana@example.test', 'password8');
  assert.deepEqual(calls[0], ['signup', {
    email: 'olana@example.test',
    password: 'password8',
    options: { data: { display_name: 'Olana' }, emailRedirectTo: 'https://app.example/auth/verify' },
  }]);
  assert.equal(storage.get('xca_v2_learner_state_v1'), learnerState);
  delete globalThis.localStorage;
});

test('logout delegates only to Supabase and preserves local learner state', async () => {
  const calls = [];
  const storage = new Map([['xca_v2_learner_state_v1', 'preserved']]);
  globalThis.localStorage = { getItem: (key) => storage.get(key), setItem: (key, value) => storage.set(key, value) };
  await createAuthService(fakeClient(calls), 'http://localhost:5173').logout();
  assert.equal(storage.get('xca_v2_learner_state_v1'), 'preserved');
  assert.equal(calls[0][0], 'logout');
  delete globalThis.localStorage;
});

test('anonymous and unverified identity cannot activate learner access', () => {
  assert.deepEqual(deriveIdentityState(true, null), {
    mode: 'anonymous', localLearningAvailable: false, cloudProfileAvailable: false, verified: false,
  });
  assert.deepEqual(deriveIdentityState(true, { email: 'pending@example.test' }), {
    mode: 'unverified', localLearningAvailable: false, cloudProfileAvailable: false, verified: false,
  });
  assert.equal(isEmailVerified({ email_confirmed_at: '2026-09-10T00:00:00Z' }), true);
  assert.equal(deriveIdentityState(true, { email_confirmed_at: '2026-09-10T00:00:00Z' }).localLearningAvailable, true);
});
