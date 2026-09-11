import assert from 'node:assert/strict';
import test from 'node:test';
import {
  VERIFIED_DEVICE_KEY,
  claimDeviceOwnership,
  deriveLearnerEntitlement,
  markDeviceSignedOut,
  readDeviceOwnership,
} from './deviceOwnership.js';

function storageFixture(entries = {}) {
  const values = new Map(Object.entries(entries));
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

test('first verified account claims the device without modifying existing learner data', () => {
  const learnerState = JSON.stringify({ curricula: { PYAE: { completedWeekIds: ['PYAE-W01'] } } });
  const notes = JSON.stringify([{ id: 'note-1', content: 'Private' }]);
  const storage = storageFixture({ xca_v2_learner_state_v1: learnerState, xcelerate_notes: notes });
  const result = claimDeviceOwnership('user-a', '2026-09-10T00:00:00Z', storage);
  assert.equal(result.status, 'claimed');
  assert.deepEqual(readDeviceOwnership(storage), { userId: 'user-a', verifiedAt: '2026-09-10T00:00:00Z', access: 'active' });
  assert.equal(storage.getItem('xca_v2_learner_state_v1'), learnerState);
  assert.equal(storage.getItem('xcelerate_notes'), notes);
});

test('same verified account restores access and a different account cannot reassign or delete the owner', () => {
  const storage = storageFixture();
  claimDeviceOwnership('user-a', '2026-09-10T00:00:00Z', storage);
  assert.equal(claimDeviceOwnership('user-a', 'later', storage).status, 'restored');
  const before = storage.getItem(VERIFIED_DEVICE_KEY);
  const conflict = claimDeviceOwnership('user-b', '2026-09-11T00:00:00Z', storage);
  assert.equal(conflict.status, 'conflict');
  assert.equal(conflict.ownership.userId, 'user-a');
  assert.equal(storage.getItem(VERIFIED_DEVICE_KEY), before);
});

test('explicit logout ends learner entitlement but preserves both ownership and learning records', () => {
  const storage = storageFixture({ xca_v2_learner_state_v1: 'preserved' });
  claimDeviceOwnership('user-a', '2026-09-10T00:00:00Z', storage);
  const ownership = markDeviceSignedOut('user-a', storage);
  assert.equal(ownership.access, 'signed-out');
  assert.equal(storage.getItem('xca_v2_learner_state_v1'), 'preserved');
  assert.equal(deriveLearnerEntitlement({ configured: true, user: null, verified: false, ownership, networkUnavailable: false }).allowed, false);
});

test('only an active previously verified device receives offline local learner access', () => {
  const active = { userId: 'user-a', verifiedAt: '2026-09-10T00:00:00Z', access: 'active' };
  const signedOut = { ...active, access: 'signed-out' };
  assert.deepEqual(deriveLearnerEntitlement({ configured: true, user: null, verified: false, ownership: active, networkUnavailable: true }), { allowed: true, mode: 'offline-verified', ownershipConflict: false });
  assert.equal(deriveLearnerEntitlement({ configured: true, user: null, verified: false, ownership: active, networkUnavailable: false }).allowed, false);
  assert.equal(deriveLearnerEntitlement({ configured: true, user: null, verified: false, ownership: signedOut, networkUnavailable: true }).allowed, false);
});

test('unverified and different verified accounts cannot receive learner access', () => {
  const ownership = { userId: 'user-a', verifiedAt: '2026-09-10T00:00:00Z', access: 'active' };
  assert.equal(deriveLearnerEntitlement({ configured: true, user: { id: 'user-a' }, verified: false, ownership, networkUnavailable: false }).mode, 'unverified');
  assert.deepEqual(deriveLearnerEntitlement({ configured: true, user: { id: 'user-b' }, verified: true, ownership, networkUnavailable: false }), { allowed: false, mode: 'account-conflict', ownershipConflict: true });
});
