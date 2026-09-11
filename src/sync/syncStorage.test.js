import assert from 'node:assert/strict';
import test from 'node:test';
import { createCurriculumLearnerState } from '../curriculum-v2/state/learnerState.js';
import runtime from '../curriculum-v2/catalog/published/pythonAgentEngineering.js';
import { decideBootstrap } from './syncDecision.js';
import { claimSyncLease, readSyncMetadata, readSyncStore, releaseSyncLease, writeSyncMetadata } from './syncStorage.js';

class MemoryStorage {
  values = new Map();
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

const cloud = () => ({
  curriculumState: createCurriculumLearnerState(runtime),
  notes: { records: [], tombstones: [] },
  blockers: { records: [], tombstones: [] },
});

test('sync metadata is account and curriculum scoped', () => {
  const storage = new MemoryStorage();
  writeSyncMetadata('user-a', 'PYAE', { baseVersion: 2 }, storage);
  writeSyncMetadata('user-b', 'PYAE', { baseVersion: 7 }, storage);
  assert.equal(readSyncMetadata('user-a', 'PYAE', storage).baseVersion, 2);
  assert.equal(readSyncMetadata('user-b', 'PYAE', storage).baseVersion, 7);
  assert.equal(readSyncStore(storage).version, 1);
});

test('the exact in-flight mutation survives a storage reload', () => {
  const storage = new MemoryStorage();
  const metadata = { baseVersion: 3, baseGeneration: 1, dirty: true, inFlight: { clientMutationId: 'm1', requestHash: 'hash', stateSnapshot: { value: 'exact' } } };
  writeSyncMetadata('user-a', 'PYAE', metadata, storage);
  assert.deepEqual(readSyncMetadata('user-a', 'PYAE', storage).inFlight, metadata.inFlight);
});

test('short lease admits one tab, expires, and releases only for its owner', () => {
  const storage = new MemoryStorage();
  assert.equal(claimSyncLease({ userId: 'u', curriculumId: 'PYAE', tabId: 'a', now: 10, ttlMs: 10, storage }), true);
  assert.equal(claimSyncLease({ userId: 'u', curriculumId: 'PYAE', tabId: 'b', now: 15, ttlMs: 10, storage }), false);
  releaseSyncLease({ userId: 'u', curriculumId: 'PYAE', tabId: 'b', storage });
  assert.equal(claimSyncLease({ userId: 'u', curriculumId: 'PYAE', tabId: 'b', now: 21, ttlMs: 10, storage }), true);
});

test('bootstrap cases A, B, C, G, I, and J are deterministic', () => {
  const empty = cloud();
  const progressed = cloud();
  progressed.curriculumState.completedWeekIds = ['PYAE-W01'];
  assert.equal(decideBootstrap({ local: progressed, remote: null, localMeaningful: true, remoteMeaningful: false }).action, 'upload');
  assert.equal(decideBootstrap({ local: empty, remote: progressed, localMeaningful: false, remoteMeaningful: true }).action, 'adopt_remote');
  assert.equal(decideBootstrap({ local: empty, remote: empty, localMeaningful: false, remoteMeaningful: false }).action, 'record_base');
  assert.equal(decideBootstrap({ local: empty, remote: null, localMeaningful: false, remoteMeaningful: false }).action, 'idle');
  assert.equal(decideBootstrap({ local: progressed, remote: empty, localMeaningful: true, remoteMeaningful: false }).reason, 'unknown_base');
  assert.equal(decideBootstrap({ local: progressed, remote: empty, metadata: { baseState: empty, baseGeneration: 0 }, localMeaningful: true, remoteMeaningful: false, remoteGeneration: 1 }).reason, 'reset_generation_barrier');
});

test('bootstrap cases D, E, and F use the retained base', () => {
  const base = cloud();
  const local = structuredClone(base);
  local.curriculumState.completedWeekIds = ['PYAE-W01'];
  const remote = structuredClone(base);
  remote.curriculumState.resources = { 'PYAE-W01': { r1: { openedAt: '2026-01-01T00:00:00Z' } } };
  const metadata = { baseState: base, baseGeneration: 0 };
  assert.equal(decideBootstrap({ local, remote: base, metadata, localMeaningful: true, remoteMeaningful: false, remoteVersion: 2 }).action, 'upload');
  assert.equal(decideBootstrap({ local: base, remote, metadata, localMeaningful: false, remoteMeaningful: true, remoteVersion: 3 }).action, 'adopt_remote');
  assert.equal(decideBootstrap({ local, remote, metadata, localMeaningful: true, remoteMeaningful: true, remoteVersion: 3 }).action, 'merge_and_upload');
});
