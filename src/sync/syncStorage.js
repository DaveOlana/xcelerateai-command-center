export const V2_SYNC_METADATA_KEY = 'xca_v2_sync_metadata_v1';
export const V2_SYNC_METADATA_VERSION = 1;
const LEASE_PREFIX = 'xca_v2_sync_lease_v1';

const emptyStore = () => ({ version: V2_SYNC_METADATA_VERSION, accounts: {} });
const targetStorage = (storage) => storage || (typeof window === 'undefined' ? null : window.localStorage);

export function readSyncStore(storage) {
  const target = targetStorage(storage);
  if (!target) return emptyStore();
  try {
    const parsed = JSON.parse(target.getItem(V2_SYNC_METADATA_KEY));
    if (parsed?.version !== V2_SYNC_METADATA_VERSION || !parsed.accounts || typeof parsed.accounts !== 'object') return emptyStore();
    return structuredClone(parsed);
  } catch {
    return emptyStore();
  }
}
export function readSyncMetadata(userId, curriculumId, storage) {
  return readSyncStore(storage).accounts?.[userId]?.[curriculumId] || null;
}

export function writeSyncMetadata(userId, curriculumId, metadata, storage) {
  const target = targetStorage(storage);
  if (!target || !userId || !curriculumId) return null;
  const store = readSyncStore(target);
  store.accounts[userId] = store.accounts[userId] || {};
  store.accounts[userId][curriculumId] = structuredClone(metadata);
  target.setItem(V2_SYNC_METADATA_KEY, JSON.stringify(store));
  return metadata;
}

export function removeSyncMetadata(userId, curriculumId, storage) {
  const target = targetStorage(storage);
  if (!target) return;
  const store = readSyncStore(target);
  if (store.accounts[userId]) delete store.accounts[userId][curriculumId];
  target.setItem(V2_SYNC_METADATA_KEY, JSON.stringify(store));
}

export function leaseKey(userId, curriculumId) {
  return `${LEASE_PREFIX}:${userId}:${curriculumId}`;
}

export function claimSyncLease({ userId, curriculumId, tabId, now = Date.now(), ttlMs = 5000, storage }) {
  const target = targetStorage(storage);
  if (!target) return false;
  const key = leaseKey(userId, curriculumId);
  try {
    const current = JSON.parse(target.getItem(key));
    if (current?.tabId && current.tabId !== tabId && Number(current.expiresAt) > now) return false;
  } catch {
    // A malformed lease is treated as expired.
  }
  const candidate = { tabId, expiresAt: now + ttlMs };
  target.setItem(key, JSON.stringify(candidate));
  try {
    return JSON.parse(target.getItem(key))?.tabId === tabId;
  } catch {
    return false;
  }
}

export function releaseSyncLease({ userId, curriculumId, tabId, storage }) {
  const target = targetStorage(storage);
  if (!target) return;
  const key = leaseKey(userId, curriculumId);
  try {
    if (JSON.parse(target.getItem(key))?.tabId === tabId) target.removeItem(key);
  } catch {
    target.removeItem(key);
  }
}
