import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ApiClientError } from '../auth/apiClient.js';
import { useAuth } from './AuthContext.jsx';
import { useApp } from './AppContext.jsx';
import { createCurriculumLearnerState, getCurriculumState } from '../curriculum-v2/state/learnerState.js';
import { canonicalStringify, sha256Canonical } from '../sync/canonicalJson.js';
import { hasMeaningfulProgress, hydrateFromCloud, projectForCloud } from '../sync/cloudState.js';
import { decideBootstrap } from '../sync/syncDecision.js';
import {
  claimSyncLease,
  readSyncMetadata,
  releaseSyncLease,
  V2_SYNC_METADATA_KEY,
  writeSyncMetadata,
} from '../sync/syncStorage.js';

const SyncContext = createContext(null);
const CHANNEL_NAME = 'xcelerate-v2-sync-v1';
const DEBOUNCE_MS = 1200;

const labelFor = (status) => ({
  device: 'Saved on this device', syncing: 'Syncing…', synced: 'Synced', offline: 'Offline — saved locally',
  conflict: 'Sync conflict — Review', error: 'Cloud sync needs attention', update_required: 'App update required to sync',
}[status] || 'Saved on this device');

function newMetadata(overrides = {}) {
  return {
    baseVersion: 0, baseGeneration: 0, baseHash: null, baseState: null,
    dirty: false, inFlight: null, pendingReset: null, conflict: null,
    blockedState: null, blockedStatus: null, blockedDetail: null, ...overrides,
  };
}

function setPathValue(target, path, value) {
  const parts = path.split('.');
  let cursor = target;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = parts[index];
    cursor[part] = cursor[part] && typeof cursor[part] === 'object' ? cursor[part] : {};
    cursor = cursor[part];
  }
  const final = parts[parts.length - 1];
  if (value === undefined) delete cursor[final];
  else cursor[final] = structuredClone(value);
}

function setArtifactValue(target, groupName, id, value) {
  const group = target[groupName];
  group.records = (group.records || []).filter((record) => record.id !== id);
  group.tombstones = (group.tombstones || []).filter((record) => record.id !== id);
  if (value?.record) group.records.push(structuredClone(value.record));
  if (value?.tombstone) group.tombstones.push(structuredClone(value.tombstone));
}

function setAttemptValue(target, skillCheckId, attemptId, value) {
  const skillCheck = target.curriculumState?.skillChecks?.[skillCheckId];
  if (!skillCheck) return;
  skillCheck.attempts = (skillCheck.attempts || []).filter((attempt) => attempt.attemptId !== attemptId);
  if (value) skillCheck.attempts.push(structuredClone(value));
}

export function SyncProvider({ children }) {
  const auth = useAuth();
  const app = useApp();
  const [state, setState] = useState({ status: 'device', curriculumId: null, conflict: null, detail: null });
  const tabId = useRef(globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`);
  const timer = useRef(null);
  const running = useRef(false);
  const syncRunner = useRef(null);
  const bootstrapped = useRef(new Set());
  const latest = useRef(null);
  const channel = useRef(null);

  latest.current = { auth, app };

  const snapshot = useCallback((runtime) => {
    const current = latest.current.app;
    const curriculumState = getCurriculumState(current.v2LearnerState, runtime.curriculumId) || createCurriculumLearnerState(runtime);
    return projectForCloud({
      curriculumState,
      curriculumId: runtime.curriculumId,
      notes: current.notes,
      blockers: current.blockers,
      tombstones: current.v2ArtifactTombstones,
    });
  }, []);

  const normalizeCloudState = useCallback((runtime, cloudState) => {
    const current = latest.current.app;
    const localCurriculumState = getCurriculumState(current.v2LearnerState, runtime.curriculumId) || createCurriculumLearnerState(runtime);
    const hydrated = hydrateFromCloud({
      localCurriculumState,
      cloudState,
      runtime,
      notes: current.notes,
      blockers: current.blockers,
    });
    return {
      hydrated,
      projected: projectForCloud({ ...hydrated, curriculumId: runtime.curriculumId }),
    };
  }, []);

  const applyCloudState = useCallback((runtime, cloudState) => {
    const normalized = normalizeCloudState(runtime, cloudState);
    latest.current.app.applyV2CloudHydration({ curriculumId: runtime.curriculumId, ...normalized.hydrated });
    return normalized.projected;
  }, [normalizeCloudState]);

  const saveBase = useCallback(async (userId, curriculumId, instance, baseState, extra = {}) => {
    const metadata = newMetadata({
      baseVersion: instance.version,
      baseGeneration: instance.generation,
      baseHash: await sha256Canonical(baseState),
      baseState,
      ...extra,
    });
    writeSyncMetadata(userId, curriculumId, metadata);
    return metadata;
  }, []);

  const preserveConflict = useCallback((userId, curriculumId, details) => {
    const current = readSyncMetadata(userId, curriculumId) || newMetadata();
    const conflict = { createdAt: new Date().toISOString(), ...details };
    writeSyncMetadata(userId, curriculumId, { ...current, dirty: true, inFlight: null, conflict });
    setState({ status: 'conflict', curriculumId, conflict, detail: conflict.reason });
  }, []);

  const sendMutation = useCallback(async (runtime, requestedState, options = {}) => {
    const currentAuth = latest.current.auth;
    const userId = currentAuth.user?.id;
    const api = currentAuth.progressApi;
    if (!userId || !api || currentAuth.accessMode !== 'verified') return false;
    const curriculumId = runtime.curriculumId;
    if (!claimSyncLease({ userId, curriculumId, tabId: tabId.current })) {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => void syncRunner.current?.(runtime), 5200);
      return false;
    }
    try {
      let metadata = readSyncMetadata(userId, curriculumId) || newMetadata();
      let inFlight = metadata.inFlight;
      if (!inFlight) {
        const stateSnapshot = structuredClone(requestedState);
        const mutation = {
          expectedVersion: options.expectedVersion ?? metadata.baseVersion,
          expectedGeneration: options.expectedGeneration ?? metadata.baseGeneration,
          clientMutationId: globalThis.crypto.randomUUID(),
          mutationType: options.mutationType || 'sync',
          curriculumRevision: runtime.revision,
          stateSchemaVersion: 1,
          learnerState: stateSnapshot,
        };
        inFlight = {
          mutation,
          requestHash: await sha256Canonical(mutation),
          stateSnapshot,
          ...(options.recoveryBranch ? { recoveryBranch: structuredClone(options.recoveryBranch) } : {}),
        };
        metadata = { ...metadata, dirty: true, inFlight };
        writeSyncMetadata(userId, curriculumId, metadata);
      }
      setState({ status: 'syncing', curriculumId, conflict: null, detail: null });
      const response = await api.putLearningInstance(curriculumId, inFlight.mutation);
      const acknowledgedVersion = response.acknowledgedVersion ?? response.instance.version;
      const acknowledgedGeneration = response.acknowledgedGeneration ?? response.instance.generation;
      const currentState = snapshot(runtime);
      const localChangedDuringFlight = canonicalStringify(currentState) !== canonicalStringify(inFlight.stateSnapshot);
      const acknowledgedInstance = {
        ...response.instance,
        version: acknowledgedVersion,
        generation: acknowledgedGeneration,
      };
      const serverAdvanced = response.instance.version > acknowledgedVersion
        || response.instance.generation !== acknowledgedGeneration;
      await saveBase(userId, curriculumId, acknowledgedInstance, inFlight.stateSnapshot, {
        dirty: localChangedDuringFlight || serverAdvanced,
      });
      const followUpRequired = localChangedDuringFlight || serverAdvanced;
      setState({ status: followUpRequired ? 'syncing' : 'synced', curriculumId, conflict: null, detail: null });
      channel.current?.postMessage({ type: 'synced', userId, curriculumId });
      if (followUpRequired) {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => void syncRunner.current?.(runtime), DEBOUNCE_MS);
      }
      return !serverAdvanced;
    } catch (error) {
      const metadata = readSyncMetadata(userId, curriculumId) || newMetadata();
      if (error instanceof ApiClientError && error.status === 409 && error.payload?.instance) {
        const remote = error.payload.instance;
        const localState = snapshot(runtime);
        const recoveryBranch = inFlight?.recoveryBranch || null;
        const remoteState = normalizeCloudState(runtime, remote.learnerState).projected;
        const reason = error.code === 'RESET_GENERATION_CONFLICT' ? 'reset_generation_barrier' : error.code;
        if (error.code === 'IDEMPOTENCY_KEY_REUSED') {
          preserveConflict(userId, curriculumId, {
            reason: error.code,
            base: metadata.baseState,
            local: localState,
            remote: remoteState,
            proposedState: localState,
            unresolvedConflicts: [{ path: '$', type: error.code, local: localState, remote: remoteState }],
            recoveryBranch,
            remoteVersion: remote.version,
            remoteGeneration: remote.generation,
          });
        } else if (inFlight.mutation.mutationType !== 'reset' && reason !== 'reset_generation_barrier' && metadata.baseState) {
          const decision = decideBootstrap({
            local: localState,
            remote: remoteState,
            metadata,
            localMeaningful: hasMeaningfulProgress(localState.curriculumState, localState),
            remoteMeaningful: hasMeaningfulProgress(remoteState.curriculumState, remoteState),
            remoteVersion: remote.version,
            remoteGeneration: remote.generation,
          });
          if (decision.action === 'merge_and_upload' || decision.action === 'upload') {
            const proposed = decision.proposedState || localState;
            if (decision.proposedState) applyCloudState(runtime, proposed);
            await saveBase(userId, curriculumId, remote, remoteState, { dirty: true });
            setState({ status: 'syncing', curriculumId, conflict: null, detail: null });
            clearTimeout(timer.current);
            timer.current = setTimeout(() => void syncRunner.current?.(runtime), DEBOUNCE_MS);
            return false;
          }
          if (decision.action === 'adopt_remote' || decision.action === 'record_base') {
            const adopted = applyCloudState(runtime, remoteState);
            await saveBase(userId, curriculumId, remote, adopted);
            setState({ status: 'synced', curriculumId, conflict: null, detail: null });
            return true;
          }
          preserveConflict(userId, curriculumId, {
            reason: decision.reason,
            base: metadata.baseState,
            local: localState,
            remote: remoteState,
            proposedState: decision.proposedState || localState,
            unresolvedConflicts: decision.conflicts || [{ path: '$', type: decision.reason, local: localState, remote: remoteState }],
            recoveryBranch,
            remoteVersion: remote.version,
            remoteGeneration: remote.generation,
          });
        } else {
          preserveConflict(userId, curriculumId, {
            reason,
            base: metadata.baseState,
            local: localState,
            remote: remoteState,
            proposedState: localState,
            unresolvedConflicts: [{ path: '$', type: error.code, local: localState, remote: remoteState }],
            recoveryBranch,
            remoteVersion: remote.version,
            remoteGeneration: remote.generation,
          });
        }
      } else if (error instanceof ApiClientError && error.status === 0) {
        setState({ status: 'offline', curriculumId, conflict: null, detail: null });
      } else if (error instanceof ApiClientError && error.status >= 400 && error.status < 500) {
        const updateRequired = error.code === 'UNSUPPORTED_STATE_SCHEMA' || error.code === 'CURRICULUM_METADATA_MISMATCH';
        writeSyncMetadata(userId, curriculumId, {
          ...metadata,
          inFlight: null,
          dirty: true,
          blockedState: snapshot(runtime),
          blockedStatus: updateRequired ? 'update_required' : 'error',
          blockedDetail: error.message,
        });
        setState({
          status: updateRequired ? 'update_required' : 'error',
          curriculumId,
          conflict: null,
          detail: error.message,
        });
      } else {
        setState({ status: 'error', curriculumId, conflict: null, detail: error.message });
      }
      return false;
    } finally {
      releaseSyncLease({ userId, curriculumId, tabId: tabId.current });
    }
  }, [applyCloudState, normalizeCloudState, preserveConflict, saveBase, snapshot]);

  const synchronize = useCallback(async (runtime, force = false) => {
    const currentAuth = latest.current.auth;
    const userId = currentAuth.user?.id;
    const api = currentAuth.progressApi;
    if (!userId || !api || currentAuth.accessMode !== 'verified' || running.current) return;
    const curriculumId = runtime.curriculumId;
    const metadata = readSyncMetadata(userId, curriculumId);
    if (metadata?.conflict) {
      setState({ status: 'conflict', curriculumId, conflict: metadata.conflict, detail: metadata.conflict.reason });
      return;
    }
    if (metadata?.blockedState && !force) {
      setState({
        status: metadata.blockedStatus || 'error',
        curriculumId,
        conflict: null,
        detail: metadata.blockedDetail || 'Cloud synchronization is paused until local progress changes or you retry.',
      });
      return;
    }
    running.current = true;
    try {
      if (metadata?.inFlight) {
        await sendMutation(runtime, metadata.inFlight.stateSnapshot);
        return;
      }
      if (metadata?.pendingReset) {
        const pendingReset = metadata.pendingReset.stateSnapshot
          ? metadata.pendingReset
          : { stateSnapshot: metadata.pendingReset, recoveryBranch: null };
        let currentInstance = null;
        try {
          currentInstance = (await api.getLearningInstance(curriculumId)).instance;
        } catch (error) {
          if (!(error instanceof ApiClientError && error.code === 'LEARNING_INSTANCE_NOT_FOUND')) throw error;
        }
        if (!currentInstance) {
          await saveBase(userId, curriculumId, { version: 0, generation: 0 }, pendingReset.stateSnapshot);
          setState({ status: 'device', curriculumId, conflict: null, detail: null });
          return;
        }
        writeSyncMetadata(userId, curriculumId, { ...metadata, pendingReset: null });
        await sendMutation(runtime, pendingReset.stateSnapshot, {
          mutationType: 'reset', expectedVersion: currentInstance.version, expectedGeneration: currentInstance.generation,
          recoveryBranch: pendingReset.recoveryBranch,
        });
        return;
      }
      const localState = snapshot(runtime);
      let remoteInstance = null;
      try {
        remoteInstance = (await api.getLearningInstance(curriculumId)).instance;
      } catch (error) {
        if (!(error instanceof ApiClientError && error.code === 'LEARNING_INSTANCE_NOT_FOUND')) throw error;
      }
      let remoteState = null;
      if (remoteInstance) {
        if (remoteInstance.curriculumRevision > runtime.revision) {
          writeSyncMetadata(userId, curriculumId, {
            ...(metadata || newMetadata()),
            dirty: true,
            blockedState: localState,
            blockedStatus: 'update_required',
            blockedDetail: 'Cloud progress was created by a newer curriculum revision.',
          });
          setState({ status: 'update_required', curriculumId, conflict: null, detail: null });
          return;
        }
        remoteState = normalizeCloudState(runtime, remoteInstance.learnerState).projected;
      }
      const localMeaningful = hasMeaningfulProgress(localState.curriculumState, localState);
      const remoteMeaningful = remoteState ? hasMeaningfulProgress(remoteState.curriculumState, remoteState) : false;
      const decision = decideBootstrap({
        local: localState,
        remote: remoteState,
        metadata,
        localMeaningful,
        remoteMeaningful,
        remoteVersion: remoteInstance?.version || 0,
        remoteGeneration: remoteInstance?.generation || 0,
      });
      if (decision.action === 'idle') {
        await saveBase(userId, curriculumId, { version: 0, generation: 0 }, localState);
        setState({ status: 'device', curriculumId, conflict: null, detail: null });
      } else if (decision.action === 'record_base') {
        await saveBase(userId, curriculumId, remoteInstance || { version: 0, generation: 0 }, remoteState || localState);
        setState({ status: remoteInstance ? 'synced' : 'device', curriculumId, conflict: null, detail: null });
      } else if (decision.action === 'adopt_remote') {
        const adopted = applyCloudState(runtime, remoteState);
        await saveBase(userId, curriculumId, remoteInstance, adopted);
        setState({ status: 'synced', curriculumId, conflict: null, detail: null });
      } else if (decision.action === 'upload') {
        await sendMutation(runtime, localState, decision);
      } else if (decision.action === 'merge_and_upload') {
        const merged = applyCloudState(runtime, decision.proposedState);
        await sendMutation(runtime, merged, decision);
      } else {
        preserveConflict(userId, curriculumId, {
          reason: decision.reason,
          base: metadata?.baseState || null,
          local: localState,
          remote: remoteState,
          proposedState: decision.proposedState,
          unresolvedConflicts: decision.conflicts || [{ path: '$', type: decision.reason }],
          remoteVersion: remoteInstance?.version || 0,
          remoteGeneration: remoteInstance?.generation || 0,
        });
      }
      if (force) channel.current?.postMessage({ type: 'refresh', userId, curriculumId });
    } catch (error) {
      setState({
        status: error instanceof ApiClientError && error.status === 0 ? 'offline' : 'error',
        curriculumId,
        conflict: null,
        detail: error.message,
      });
    } finally {
      running.current = false;
      const pending = readSyncMetadata(userId, curriculumId);
      if (pending?.dirty && !pending.conflict && !pending.inFlight && !pending.blockedState) {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => void syncRunner.current?.(runtime), DEBOUNCE_MS);
      }
    }
  }, [applyCloudState, normalizeCloudState, preserveConflict, saveBase, sendMutation, snapshot]);

  syncRunner.current = synchronize;

  const schedule = useCallback((runtime, delay = DEBOUNCE_MS) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void synchronize(runtime), delay);
  }, [synchronize]);

  useEffect(() => {
    if (typeof BroadcastChannel === 'function') channel.current = new BroadcastChannel(CHANNEL_NAME);
    const refresh = (event) => {
      const message = event?.data;
      if (!message || message.userId !== latest.current.auth.user?.id) return;
      const runtime = latest.current.app.curriculumCatalog.getLatest(message.curriculumId);
      if (runtime) schedule(runtime, 100);
    };
    const storageRefresh = (event) => {
      if (event.key !== V2_SYNC_METADATA_KEY) return;
      for (const entry of latest.current.app.publishedV2Curricula) {
        const runtime = latest.current.app.curriculumCatalog.getLatest(entry.curriculumId);
        if (runtime) schedule(runtime, 100);
      }
    };
    channel.current?.addEventListener('message', refresh);
    window.addEventListener('storage', storageRefresh);
    return () => {
      clearTimeout(timer.current);
      channel.current?.close();
      window.removeEventListener('storage', storageRefresh);
    };
  }, [schedule]);

  useEffect(() => {
    if (auth.accessMode !== 'verified' || !auth.user?.id) {
      setState({ status: auth.accessMode === 'offline-verified' ? 'offline' : 'device', curriculumId: null, conflict: null, detail: null });
      return;
    }
    for (const entry of app.publishedV2Curricula) {
      const key = `${auth.user.id}:${entry.curriculumId}`;
      if (bootstrapped.current.has(key)) continue;
      bootstrapped.current.add(key);
      const runtime = app.curriculumCatalog.getLatest(entry.curriculumId);
      if (runtime) schedule(runtime, 0);
    }
  }, [app.curriculumCatalog, app.publishedV2Curricula, auth.accessMode, auth.user?.id, schedule]);

  useEffect(() => {
    if (auth.accessMode !== 'verified' || !auth.user?.id) return;
    for (const entry of app.publishedV2Curricula) {
      const key = `${auth.user.id}:${entry.curriculumId}`;
      if (!bootstrapped.current.has(key)) continue;
      const metadata = readSyncMetadata(auth.user.id, entry.curriculumId);
      if (metadata?.conflict) continue;
      const runtime = app.curriculumCatalog.getLatest(entry.curriculumId);
      if (!runtime) continue;
      const localState = snapshot(runtime);
      if (!metadata?.baseState || canonicalStringify(localState) !== canonicalStringify(metadata.baseState)) {
        const blockedUnchanged = metadata?.blockedState
          && canonicalStringify(localState) === canonicalStringify(metadata.blockedState);
        if (!blockedUnchanged) {
          writeSyncMetadata(auth.user.id, entry.curriculumId, {
            ...(metadata || newMetadata()),
            dirty: true,
            blockedState: null,
            blockedStatus: null,
            blockedDetail: null,
          });
          schedule(runtime);
        }
      }
    }
  }, [app.blockers, app.notes, app.v2ArtifactTombstones, app.v2LearnerState, app.curriculumCatalog, app.publishedV2Curricula, auth.accessMode, auth.user?.id, schedule, snapshot]);

  useEffect(() => {
    const online = () => {
      for (const entry of latest.current.app.publishedV2Curricula) {
        const runtime = latest.current.app.curriculumCatalog.getLatest(entry.curriculumId);
        if (runtime) schedule(runtime, 0);
      }
    };
    window.addEventListener('online', online);
    return () => window.removeEventListener('online', online);
  }, [schedule]);

  const requestCurriculumReset = useCallback(async () => {
    const curriculumId = latest.current.app.activeV2CurriculumId;
    const runtime = curriculumId ? latest.current.app.curriculumCatalog.getLatest(curriculumId) : null;
    if (!runtime) return false;
    const recoveryBranch = snapshot(runtime);
    const cleanState = projectForCloud({
      curriculumState: createCurriculumLearnerState(runtime),
      curriculumId,
      notes: latest.current.app.notes,
      blockers: latest.current.app.blockers,
      tombstones: latest.current.app.v2ArtifactTombstones,
    });
    applyCloudState(runtime, cleanState);
    const userId = latest.current.auth.user?.id;
    if (!userId || latest.current.auth.accessMode !== 'verified') {
      setState({ status: 'device', curriculumId, conflict: null, detail: null });
      return true;
    }
    let metadata = readSyncMetadata(userId, curriculumId) || newMetadata();
    if (metadata.baseVersion === 0) {
      try {
        const remote = await latest.current.auth.progressApi.getLearningInstance(curriculumId);
        metadata = await saveBase(userId, curriculumId, remote.instance, remote.instance.learnerState);
      } catch (error) {
        if (error instanceof ApiClientError && error.code === 'LEARNING_INSTANCE_NOT_FOUND') {
          await saveBase(userId, curriculumId, { version: 0, generation: 0 }, cleanState);
          return true;
        }
        writeSyncMetadata(userId, curriculumId, {
          ...metadata,
          dirty: true,
          pendingReset: { stateSnapshot: cleanState, recoveryBranch },
        });
        setState({
          status: error instanceof ApiClientError && error.status === 0 ? 'offline' : 'error',
          curriculumId,
          conflict: null,
          detail: error instanceof Error ? error.message : 'Cloud reset is pending.',
        });
        return true;
      }
    }
    return sendMutation(runtime, cleanState, {
      mutationType: 'reset', expectedVersion: metadata.baseVersion, expectedGeneration: metadata.baseGeneration,
      recoveryBranch,
    });
  }, [applyCloudState, sendMutation, snapshot]);

  const reviewConflict = useCallback(() => setState((current) => ({ ...current, status: 'conflict' })), []);
  const resolveConflict = useCallback(async (index, choice, manualValue = null) => {
    const currentAuth = latest.current.auth;
    const userId = currentAuth.user?.id;
    const curriculumId = state.curriculumId;
    const runtime = curriculumId ? latest.current.app.curriculumCatalog.getLatest(curriculumId) : null;
    if (!userId || !runtime) return false;
    const metadata = readSyncMetadata(userId, curriculumId);
    const conflictState = metadata?.conflict;
    const conflict = conflictState?.unresolvedConflicts?.[index];
    if (!conflict) return false;
    let proposed = structuredClone(conflictState.proposedState || conflictState.local);
    const selected = choice === 'remote' ? conflict.remote : conflict.local;
    if (conflict.path === '$') {
      proposed = structuredClone(choice === 'remote' ? conflictState.remote : conflictState.local);
    } else if (conflict.path.startsWith('notes.') || conflict.path.startsWith('blockers.')) {
      const groupName = conflict.path.startsWith('notes.') ? 'notes' : 'blockers';
      const id = conflict.path.slice(groupName.length + 1);
      const resolvedArtifact = structuredClone(selected);
      if (manualValue?.field && resolvedArtifact?.record) resolvedArtifact.record[manualValue.field] = manualValue.value;
      setArtifactValue(proposed, groupName, id, resolvedArtifact);
    } else if (conflict.type === 'attempt_identity_collision') {
      setAttemptValue(proposed, conflict.skillCheckId, conflict.attemptId, selected);
    } else {
      let resolvedValue = selected;
      if (manualValue?.field && selected && typeof selected === 'object') {
        resolvedValue = { ...selected };
        resolvedValue[manualValue.field] = manualValue.value;
      }
      setPathValue(proposed, conflict.path, resolvedValue);
    }
    const remaining = conflictState.unresolvedConflicts.filter((_, itemIndex) => itemIndex !== index);
    if (remaining.length) {
      const nextConflict = { ...conflictState, proposedState: proposed, unresolvedConflicts: remaining };
      writeSyncMetadata(userId, curriculumId, { ...metadata, conflict: nextConflict });
      setState({ status: 'conflict', curriculumId, conflict: nextConflict, detail: nextConflict.reason });
      return true;
    }
    const hydratedProjection = applyCloudState(runtime, proposed);
    writeSyncMetadata(userId, curriculumId, newMetadata({
      baseVersion: conflictState.remoteVersion,
      baseGeneration: conflictState.remoteGeneration,
      baseState: conflictState.remote,
      baseHash: await sha256Canonical(conflictState.remote),
      dirty: true,
    }));
    setState({ status: 'syncing', curriculumId, conflict: null, detail: null });
    return sendMutation(runtime, hydratedProjection, {
      expectedVersion: conflictState.remoteVersion,
      expectedGeneration: conflictState.remoteGeneration,
    });
  }, [applyCloudState, sendMutation, state.curriculumId]);
  const value = useMemo(() => ({
    ...state,
    label: labelFor(state.status),
    requestCurriculumReset,
    reviewConflict,
    resolveConflict,
    retry: () => {
      const curriculumId = state.curriculumId || latest.current.app.activeV2CurriculumId;
      const runtime = curriculumId ? latest.current.app.curriculumCatalog.getLatest(curriculumId) : null;
      if (runtime) synchronize(runtime, true);
    },
  }), [requestCurriculumReset, resolveConflict, reviewConflict, state, synchronize]);

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) throw new Error('useSync must be used within SyncProvider');
  return context;
}
