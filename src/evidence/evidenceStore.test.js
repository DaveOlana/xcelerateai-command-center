import assert from 'node:assert/strict';
import test from 'node:test';
import {
  EVIDENCE_CACHE_PREFIX,
  emptyEvidenceCache,
  evidenceProofKey,
  normalizeEvidenceFile,
  readEvidenceStore,
  withoutCurriculumEvidence,
  writeEvidenceStore,
} from './evidenceStore.js';

function memoryStorage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), values };
}

test('evidence cache is account namespaced and never adopts another learner cache', () => {
  const storage = memoryStorage();
  const learnerA = { ...emptyEvidenceCache('A'), histories: { 'PYAE:3:proof': [{ id: 'private-A' }] } };
  writeEvidenceStore(`${EVIDENCE_CACHE_PREFIX}A`, learnerA, storage);
  assert.equal(readEvidenceStore(EVIDENCE_CACHE_PREFIX, 'A', emptyEvidenceCache, storage).histories['PYAE:3:proof'][0].id, 'private-A');
  assert.deepEqual(readEvidenceStore(EVIDENCE_CACHE_PREFIX, 'B', emptyEvidenceCache, storage), emptyEvidenceCache('B'));
  storage.setItem(`${EVIDENCE_CACHE_PREFIX}B`, JSON.stringify(learnerA));
  assert.deepEqual(readEvidenceStore(EVIDENCE_CACHE_PREFIX, 'B', emptyEvidenceCache, storage), emptyEvidenceCache('B'));
});

test('curriculum reset removes only its receipt and staged-asset metadata', () => {
  const cache = {
    ...emptyEvidenceCache('A'),
    histories: { 'PYAE:3:P1': [{}], 'OTHER:1:P1': [{}] },
    stagedAssets: { 'PYAE:3:P1:E1': { id: 'asset-a' }, 'OTHER:1:P1:E1': { id: 'asset-b' } },
  };
  const reset = withoutCurriculumEvidence(cache, 'PYAE');
  assert.deepEqual(Object.keys(reset.histories), ['OTHER:1:P1']);
  assert.deepEqual(Object.keys(reset.stagedAssets), ['OTHER:1:P1:E1']);
});

test('proof keys bind receipts to curriculum revision and requirement context', () => {
  assert.equal(evidenceProofKey({ curriculumId: 'PYAE', curriculumRevision: 3, proofId: 'PYAE-PR-W01' }), 'PYAE:3:PYAE-PR-W01');
  assert.notEqual(evidenceProofKey({ curriculumId: 'PYAE', curriculumRevision: 2, proofId: 'PYAE-PR-W01' }), evidenceProofKey({ curriculumId: 'PYAE', curriculumRevision: 3, proofId: 'PYAE-PR-W01' }));
});

test('safe file metadata normalizes browser MIME gaps without accepting disguised files', () => {
  assert.deepEqual(normalizeEvidenceFile({ name: 'notes.md', type: '', size: 100 }), { mimeType: 'text/plain', extension: 'md', byteSize: 100 });
  assert.deepEqual(normalizeEvidenceFile({ name: 'result.json', type: 'text/plain', size: 25 }), { mimeType: 'application/json', extension: 'json', byteSize: 25 });
  assert.throws(() => normalizeEvidenceFile({ name: 'program.exe', type: 'text/plain', size: 100 }), /Choose a ZIP/);
  assert.throws(() => normalizeEvidenceFile({ name: 'too-big.zip', type: 'application/zip', size: 6 * 1024 * 1024 + 1 }), /6 MiB/);
});
