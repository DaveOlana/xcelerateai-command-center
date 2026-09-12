export const EVIDENCE_CACHE_PREFIX = 'xca_evidence_cache_v1:';
export const EVIDENCE_OUTBOX_PREFIX = 'xca_evidence_outbox_v1:';
export const EVIDENCE_FILE_LIMIT = 6 * 1024 * 1024;
export const EVIDENCE_TOTAL_FILE_LIMIT = 10 * 1024 * 1024;
export const EVIDENCE_MAX_FILES = 2;
export const EVIDENCE_MIME_TYPES = Object.freeze(['application/zip', 'application/x-zip-compressed', 'text/plain', 'application/json']);

export const emptyEvidenceCache = (userId = null) => ({ version: 1, userId, histories: {}, stagedAssets: {} });
export const emptyEvidenceOutbox = (userId = null) => ({ version: 1, userId, operations: [] });
export const evidenceProofKey = ({ curriculumId, curriculumRevision, proofId }) => `${curriculumId}:${curriculumRevision}:${proofId}`;

export function readEvidenceStore(prefix, userId, fallback, storage = globalThis.localStorage) {
  if (!userId || !storage) return fallback(userId);
  try {
    const parsed = JSON.parse(storage.getItem(`${prefix}${userId}`));
    return parsed?.version === 1 && parsed.userId === userId
      ? { ...fallback(userId), ...parsed, histories: parsed.histories || {}, stagedAssets: parsed.stagedAssets || {}, operations: parsed.operations || [] }
      : fallback(userId);
  } catch { return fallback(userId); }
}

export function writeEvidenceStore(key, value, storage = globalThis.localStorage) {
  try { storage?.setItem(key, JSON.stringify(value)); } catch { /* Storage exhaustion must not crash learning. */ }
}

export function withoutCurriculumEvidence(cache, curriculumId) {
  return {
    ...cache,
    histories: Object.fromEntries(Object.entries(cache.histories || {}).filter(([key]) => !key.startsWith(`${curriculumId}:`))),
    stagedAssets: Object.fromEntries(Object.entries(cache.stagedAssets || {}).filter(([key]) => !key.startsWith(`${curriculumId}:`))),
  };
}

export function normalizeEvidenceFile(file) {
  const extension = file?.name?.split('.').pop()?.toLowerCase();
  let mimeType = null;
  if (extension === 'zip' && ['application/zip', 'application/x-zip-compressed', ''].includes(file?.type || '')) mimeType = file?.type || 'application/zip';
  if (extension === 'json' && ['application/json', 'text/plain', ''].includes(file?.type || '')) mimeType = 'application/json';
  if (['txt', 'md', 'log'].includes(extension) && ['text/plain', 'text/markdown', ''].includes(file?.type || '')) mimeType = 'text/plain';
  if (!mimeType || !EVIDENCE_MIME_TYPES.includes(mimeType)) throw new Error('Choose a ZIP, TXT, Markdown, log, or JSON file.');
  if (!Number.isInteger(file.size) || file.size <= 0 || file.size > EVIDENCE_FILE_LIMIT) throw new Error('Evidence files must be no larger than 6 MiB.');
  return { mimeType, extension, byteSize: file.size };
}
