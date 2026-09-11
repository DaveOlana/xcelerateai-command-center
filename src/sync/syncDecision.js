import { canonicalStringify } from './canonicalJson.js';
import { mergeCloudStates } from './threeWayMerge.js';

const equal = (left, right) => canonicalStringify(left) === canonicalStringify(right);

export function decideBootstrap({ local, remote, metadata, localMeaningful, remoteMeaningful, remoteVersion = 0, remoteGeneration = 0 }) {
  if (!remote) return localMeaningful ? { action: 'upload', expectedVersion: 0, expectedGeneration: 0 } : { action: 'idle' };
  if (!localMeaningful && remoteMeaningful) return { action: 'adopt_remote' };
  if (!localMeaningful && !remoteMeaningful) return { action: 'record_base' };
  if (equal(local, remote)) return { action: 'record_base' };
  if (!metadata?.baseState) return { action: 'conflict', reason: 'unknown_base', proposedState: local };
  if (metadata.baseGeneration !== remoteGeneration) return { action: 'conflict', reason: 'reset_generation_barrier', proposedState: local };

  const localChanged = !equal(local, metadata.baseState);
  const remoteChanged = !equal(remote, metadata.baseState);
  if (localChanged && !remoteChanged) return { action: 'upload', expectedVersion: remoteVersion, expectedGeneration: remoteGeneration };
  if (!localChanged && remoteChanged) return { action: 'adopt_remote' };
  if (!localChanged && !remoteChanged) return { action: 'record_base' };
  const merge = mergeCloudStates({
    base: metadata.baseState,
    local,
    remote,
    baseGeneration: metadata.baseGeneration,
    localGeneration: metadata.baseGeneration,
    remoteGeneration,
  });
  return merge.unresolvedConflicts.length
    ? { action: 'conflict', reason: 'diverged', proposedState: merge.mergedState, conflicts: merge.unresolvedConflicts }
    : { action: 'merge_and_upload', proposedState: merge.mergedState, expectedVersion: remoteVersion, expectedGeneration: remoteGeneration };
}
