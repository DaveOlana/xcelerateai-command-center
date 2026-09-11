import assert from 'node:assert/strict';
import test from 'node:test';
import { GUEST_SAFE_PATHS, getCurriculumAction } from './accessPolicy.js';

test('guest-safe routes contain root entry, auth, catalog, and settings but exclude private learner routes', () => {
  for (const path of ['/', '/auth/login', '/auth/register', '/auth/recover', '/curricula', '/settings']) assert.ok(GUEST_SAFE_PATHS.includes(path));
  for (const path of ['/missions', '/progress', '/workspace', '/import']) assert.equal(GUEST_SAFE_PATHS.includes(path), false);
});

test('catalog browsing never grants guest or unverified enrollment mutation', () => {
  assert.deepEqual(getCurriculumAction({ allowed: false, mode: 'guest' }), { allowed: false, label: 'Create account to start', destination: '/auth/register' });
  assert.deepEqual(getCurriculumAction({ allowed: false, mode: 'unverified' }), { allowed: false, label: 'Verify email to start', destination: '/auth/verify' });
  assert.equal(getCurriculumAction({ allowed: true, mode: 'verified' }).allowed, true);
});

test('different-account catalog action routes to safe ownership resolution', () => {
  assert.deepEqual(getCurriculumAction({ allowed: false, mode: 'account-conflict' }), { allowed: false, label: 'Resolve device access', destination: '/settings' });
});
