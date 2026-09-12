import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import {
  EVIDENCE_CACHE_PREFIX,
  EVIDENCE_OUTBOX_PREFIX,
  emptyEvidenceCache,
  emptyEvidenceOutbox,
  evidenceProofKey,
  normalizeEvidenceFile,
  readEvidenceStore,
  withoutCurriculumEvidence,
  writeEvidenceStore,
} from '../evidence/evidenceStore.js';

const EvidenceContext = createContext(null);
const proofKey = evidenceProofKey;

export function EvidenceProvider({ children }) {
  const auth = useAuth();
  const userId = auth.user?.id ?? null;
  const enabled = ['verified', 'offline-verified'].includes(auth.accessMode) && Boolean(userId && auth.evidenceApi);
  const cloudAvailable = auth.accessMode === 'verified' && Boolean(userId && auth.evidenceApi);
  const [cache, setCache] = useState(() => readEvidenceStore(EVIDENCE_CACHE_PREFIX, userId, emptyEvidenceCache));
  const [outbox, setOutbox] = useState(() => readEvidenceStore(EVIDENCE_OUTBOX_PREFIX, userId, emptyEvidenceOutbox));
  const [loadingKeys, setLoadingKeys] = useState({});
  const [syncing, setSyncing] = useState(false);
  const flushing = useRef(false);

  useEffect(() => {
    setCache(readEvidenceStore(EVIDENCE_CACHE_PREFIX, userId, emptyEvidenceCache));
    setOutbox(readEvidenceStore(EVIDENCE_OUTBOX_PREFIX, userId, emptyEvidenceOutbox));
    setLoadingKeys({});
  }, [userId]);

  useEffect(() => {
    if (!userId || cache.userId !== userId) return;
    writeEvidenceStore(`${EVIDENCE_CACHE_PREFIX}${userId}`, cache);
  }, [cache, userId]);

  useEffect(() => {
    if (!userId || outbox.userId !== userId) return;
    writeEvidenceStore(`${EVIDENCE_OUTBOX_PREFIX}${userId}`, outbox);
  }, [outbox, userId]);

  const mergeHistory = useCallback((context, submissions) => {
    const key = proofKey(context);
    setCache((current) => ({ ...current, histories: { ...current.histories, [key]: submissions } }));
  }, []);

  const mergeSubmission = useCallback((submission) => {
    const key = proofKey(submission);
    setCache((current) => {
      const prior = current.histories[key] || [];
      const next = [submission, ...prior.filter((item) => item.id !== submission.id)]
        .map((item) => item.id === submission.supersedesSubmissionId && item.status === 'submitted' ? { ...item, status: 'superseded' } : item)
        .sort((left, right) => right.submissionRevision - left.submissionRevision);
      const attachedIds = new Set(submission.items.flatMap((item) => item.assets || []).map((asset) => asset.id));
      return {
        ...current,
        histories: { ...current.histories, [key]: next },
        stagedAssets: Object.fromEntries(Object.entries(current.stagedAssets || {}).filter(([, asset]) => !attachedIds.has(asset.id))),
      };
    });
  }, []);

  const loadHistory = useCallback(async (context) => {
    if (!cloudAvailable) return cache.histories[proofKey(context)] || [];
    const key = proofKey(context);
    setLoadingKeys((current) => ({ ...current, [key]: true }));
    try {
      const result = await auth.evidenceApi.listSubmissions({ curriculumId: context.curriculumId, revision: context.curriculumRevision, proofId: context.proofId });
      mergeHistory(context, result.submissions || []);
      return result.submissions || [];
    } finally {
      setLoadingKeys((current) => ({ ...current, [key]: false }));
    }
  }, [auth.evidenceApi, cache.histories, cloudAvailable, mergeHistory]);

  const queueOperation = useCallback((operation) => {
    setOutbox((current) => current.operations.some((item) => item.id === operation.id)
      ? current
      : { ...current, operations: [...current.operations, operation] });
  }, []);

  const executeOperation = useCallback(async (operation) => {
    if (operation.type === 'submit') {
      const result = await auth.evidenceApi.createSubmission(operation.payload);
      mergeSubmission(result.submission);
      return result;
    }
    if (operation.type === 'withdraw') {
      const result = await auth.evidenceApi.withdrawSubmission(operation.submissionId, operation.clientMutationId);
      mergeSubmission(result.submission);
      return result;
    }
    if (operation.type === 'reset') {
      const histories = await Promise.all(operation.proofs.map(async (entry) => ({
        entry,
        submissions: (await auth.evidenceApi.listSubmissions({ curriculumId: operation.curriculumId, revision: operation.curriculumRevision, proofId: entry.proofId })).submissions || [],
      })));
      const current = histories.map(({ entry, submissions }) => ({ entry, submission: submissions.find((item) => item.status === 'submitted') })).filter((item) => item.submission);
      histories.forEach(({ entry, submissions }) => mergeHistory({ curriculumId: operation.curriculumId, curriculumRevision: operation.curriculumRevision, proofId: entry.proofId }, submissions));
      const withdrawn = await Promise.all(current.map(({ entry, submission }) => auth.evidenceApi.withdrawSubmission(submission.id, entry.clientMutationId)));
      await Promise.all(operation.assetIds.map((assetId) => auth.evidenceApi.abandonAsset(assetId)));
      withdrawn.forEach((result) => mergeSubmission(result.submission));
      return { outcome: 'reset', withdrawn: withdrawn.length, abandonedAssets: operation.assetIds.length };
    }
    throw new Error('Unsupported evidence outbox operation.');
  }, [auth.evidenceApi, mergeHistory, mergeSubmission]);

  const flushOutbox = useCallback(async () => {
    if (!cloudAvailable || flushing.current || typeof navigator !== 'undefined' && !navigator.onLine) return;
    flushing.current = true;
    setSyncing(true);
    try {
      for (const operation of outbox.operations) {
        if (operation.error) continue;
        try {
          await executeOperation(operation);
          setOutbox((current) => ({ ...current, operations: current.operations.filter((item) => item.id !== operation.id) }));
        } catch (error) {
          if (isNetworkError(error)) break;
          setOutbox((current) => ({ ...current, operations: current.operations.map((item) => item.id === operation.id ? { ...item, error: error.message || 'Evidence synchronization failed.' } : item) }));
        }
      }
    } finally {
      flushing.current = false;
      setSyncing(false);
    }
  }, [cloudAvailable, executeOperation, outbox.operations]);

  useEffect(() => {
    if (cloudAvailable && outbox.operations.some((operation) => !operation.error)) void flushOutbox();
  }, [cloudAvailable, flushOutbox, outbox.operations]);

  useEffect(() => {
    const reconnect = () => void flushOutbox();
    window.addEventListener('online', reconnect);
    return () => window.removeEventListener('online', reconnect);
  }, [flushOutbox]);

  const submitEvidence = useCallback(async (payload) => {
    if (!enabled) throw new Error('A verified account is required to submit evidence.');
    const operation = { id: payload.clientSubmissionId, type: 'submit', payload, createdAt: new Date().toISOString() };
    if (!cloudAvailable || typeof navigator !== 'undefined' && !navigator.onLine) {
      queueOperation(operation);
      return { outcome: 'queued' };
    }
    try {
      return await executeOperation(operation);
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      queueOperation(operation);
      return { outcome: 'queued' };
    }
  }, [cloudAvailable, enabled, executeOperation, queueOperation]);

  const uploadFile = useCallback(async ({ context, evidenceRequirementId, file }) => {
    if (!cloudAvailable || typeof navigator !== 'undefined' && !navigator.onLine) throw new Error('Connect to the internet before attaching a file.');
    const metadata = normalizeEvidenceFile(file);
    const intent = await auth.evidenceApi.createUploadIntent({
      clientAssetId: createId(), ...context, evidenceRequirementId,
      originalFilename: file.name, mimeType: metadata.mimeType, byteSize: metadata.byteSize,
    });
    await auth.evidenceApi.uploadSignedAsset({ ...intent.upload, file, contentType: metadata.mimeType });
    const result = await auth.evidenceApi.finalizeAsset(intent.asset.id);
    return result.asset;
  }, [auth.evidenceApi, cloudAvailable]);

  const abandonAsset = useCallback(async (assetId) => {
    if (!cloudAvailable) throw new Error('Connect to the internet before removing a staged file.');
    await auth.evidenceApi.abandonAsset(assetId);
  }, [auth.evidenceApi, cloudAvailable]);

  const accessAsset = useCallback(async (assetId) => {
    if (!cloudAvailable) throw new Error('Connect to the internet to access private evidence.');
    return auth.evidenceApi.accessAsset(assetId);
  }, [auth.evidenceApi, cloudAvailable]);

  const loadVerificationResults = useCallback(async (submissionId) => {
    if (!cloudAvailable) return [];
    const result = await auth.evidenceApi.listVerificationResults(submissionId);
    return result.results || [];
  }, [auth.evidenceApi, cloudAvailable]);

  const recordStructuralVerification = useCallback(async (payload) => {
    if (!cloudAvailable) throw new Error('Connect to the internet to run structural checks.');
    return auth.evidenceApi.createStructuralVerification(payload);
  }, [auth.evidenceApi, cloudAvailable]);

  const recordBrowserPythonVerification = useCallback(async (payload) => {
    if (!cloudAvailable) throw new Error('Connect to the internet to record automated checks.');
    return auth.evidenceApi.createBrowserPythonVerification(payload);
  }, [auth.evidenceApi, cloudAvailable]);

  const stageAsset = useCallback((context, evidenceRequirementId, asset) => {
    const key = `${proofKey(context)}:${evidenceRequirementId}`;
    setCache((current) => ({ ...current, stagedAssets: { ...(current.stagedAssets || {}), [key]: asset } }));
  }, []);

  const removeStagedAsset = useCallback(async (context, evidenceRequirementId) => {
    const key = `${proofKey(context)}:${evidenceRequirementId}`;
    const asset = cache.stagedAssets?.[key];
    if (asset) await abandonAsset(asset.id);
    setCache((current) => ({ ...current, stagedAssets: Object.fromEntries(Object.entries(current.stagedAssets || {}).filter(([entryKey]) => entryKey !== key)) }));
  }, [abandonAsset, cache.stagedAssets]);

  const withdrawSubmission = useCallback(async (submissionId) => {
    const operation = { id: createId(), type: 'withdraw', submissionId, clientMutationId: createId(), createdAt: new Date().toISOString() };
    if (!enabled) throw new Error('A verified account is required to withdraw evidence.');
    if (!cloudAvailable || typeof navigator !== 'undefined' && !navigator.onLine) {
      queueOperation(operation);
      return { outcome: 'queued' };
    }
    try { return await executeOperation(operation); }
    catch (error) {
      if (!isNetworkError(error)) throw error;
      queueOperation(operation);
      return { outcome: 'queued' };
    }
  }, [cloudAvailable, enabled, executeOperation, queueOperation]);

  const resetCurriculumEvidence = useCallback(async (runtime) => {
    if (!runtime) return { outcome: 'none' };
    const operation = {
      id: createId(), type: 'reset', curriculumId: runtime.curriculumId, curriculumRevision: runtime.revision,
      proofs: runtime.weeks.map((week) => ({ proofId: week.proof.id, clientMutationId: createId() })),
      assetIds: Object.entries(cache.stagedAssets || {}).filter(([key]) => key.startsWith(`${runtime.curriculumId}:`)).map(([, asset]) => asset.id),
      createdAt: new Date().toISOString(),
    };
    if (!enabled) return { outcome: 'none' };
    if (!cloudAvailable || typeof navigator !== 'undefined' && !navigator.onLine) {
      queueOperation(operation);
      clearCurriculumCache(runtime.curriculumId, setCache);
      return { outcome: 'queued' };
    }
    try {
      const result = await executeOperation(operation);
      clearCurriculumCache(runtime.curriculumId, setCache);
      return result;
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      queueOperation(operation);
      clearCurriculumCache(runtime.curriculumId, setCache);
      return { outcome: 'queued' };
    }
  }, [cache.stagedAssets, cloudAvailable, enabled, executeOperation, queueOperation]);

  const currentByProof = useMemo(() => Object.fromEntries(Object.values(cache.histories).map((history) => {
    const current = history.find((item) => item.status === 'submitted');
    return current ? [current.proofId, current] : null;
  }).filter(Boolean)), [cache.histories]);

  const value = useMemo(() => ({
    enabled, cache, outbox, syncing, currentByProof,
    isHistoryLoading: (context) => Boolean(loadingKeys[proofKey(context)]),
    getHistory: (context) => cache.histories[proofKey(context)] || [],
    getCurrentSubmission: (proofId) => currentByProof[proofId] || null,
    getStagedAsset: (context, evidenceRequirementId) => cache.stagedAssets?.[`${proofKey(context)}:${evidenceRequirementId}`] || null,
    loadHistory, submitEvidence, uploadFile, stageAsset, removeStagedAsset, abandonAsset, accessAsset, withdrawSubmission, resetCurriculumEvidence, flushOutbox,
    loadVerificationResults, recordStructuralVerification, recordBrowserPythonVerification,
    retryOutbox: () => setOutbox((current) => ({ ...current, operations: current.operations.map(({ error: _error, ...operation }) => operation) })),
  }), [abandonAsset, accessAsset, cache, currentByProof, enabled, flushOutbox, loadHistory, loadVerificationResults, loadingKeys, outbox, recordBrowserPythonVerification, recordStructuralVerification, removeStagedAsset, resetCurriculumEvidence, stageAsset, submitEvidence, syncing, uploadFile, withdrawSubmission]);

  return <EvidenceContext.Provider value={value}>{children}</EvidenceContext.Provider>;
}

export function useEvidence() {
  const context = useContext(EvidenceContext);
  if (!context) throw new Error('useEvidence must be used within EvidenceProvider');
  return context;
}

function createId() { return globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function isNetworkError(error) { return error?.code === 'NETWORK_ERROR' || error?.status === 0; }
function clearCurriculumCache(curriculumId, setCache) {
  setCache((current) => withoutCurriculumEvidence(current, curriculumId));
}
