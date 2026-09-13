import { canonicalStringify } from './canonicalJson.js';

const clone = (value) => structuredClone(value);
const equal = (left, right) => {
  if (left === undefined || right === undefined) return left === right;
  return canonicalStringify(left) === canonicalStringify(right);
};
const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

function changed(base, value) {
  return !equal(base, value);
}

function chooseThreeWay(base, local, remote, path, conflicts) {
  const localChanged = changed(base, local);
  const remoteChanged = changed(base, remote);
  if (!localChanged) return clone(remote);
  if (!remoteChanged || equal(local, remote)) return clone(local);
  conflicts.push({ path, type: 'incompatible_edit', base: clone(base), local: clone(local), remote: clone(remote) });
  return clone(local);
}

function mergeMap(base = {}, local = {}, remote = {}, path, conflicts, mergeEntry = chooseThreeWay) {
  const merged = {};
  const keys = new Set([...Object.keys(base || {}), ...Object.keys(local || {}), ...Object.keys(remote || {})]);
  for (const key of keys) {
    const value = mergeEntry(base?.[key], local?.[key], remote?.[key], `${path}.${key}`, conflicts, key);
    if (value !== undefined) merged[key] = value;
  }
  return merged;
}

function earliest(left, right) {
  if (!left) return right;
  if (!right) return left;
  return Date.parse(left) <= Date.parse(right) ? left : right;
}

function latest(left, right) {
  if (!left) return right;
  if (!right) return left;
  return Date.parse(left) >= Date.parse(right) ? left : right;
}

function unionStable(left = [], right = []) {
  return [...new Set([...left, ...right])];
}

function mergeStageRecord(base, local, remote, path, conflicts) {
  if (local?.satisfied === true || remote?.satisfied === true) {
    const records = [local, remote].filter((item) => item?.satisfied === true);
    const result = { satisfied: true, satisfiedAt: records.reduce((value, item) => earliest(value, item.satisfiedAt), null) };
    for (const key of new Set(records.flatMap((item) => Object.keys(item)))) {
      if (key === 'satisfied' || key === 'satisfiedAt') continue;
      const values = records.map((item) => item[key]).filter((value) => value !== undefined);
      if (values.every(Array.isArray)) result[key] = values.reduce((all, value) => unionStable(all, value), []);
      else result[key] = values[0];
    }
    return result;
  }
  return chooseThreeWay(base, local, remote, path, conflicts);
}

function mergeStages(base = {}, local = {}, remote = {}, path, conflicts) {
  return mergeMap(base, local, remote, path, conflicts, (baseWeek = {}, localWeek = {}, remoteWeek = {}, weekPath) => (
    mergeMap(baseWeek, localWeek, remoteWeek, weekPath, conflicts, mergeStageRecord)
  ));
}

function mergeResource(base, local, remote, path, conflicts) {
  if (!changed(base, local)) return clone(remote);
  if (!changed(base, remote) || equal(local, remote)) return clone(local);
  if (isObject(local) && isObject(remote)) {
    return {
      ...clone(base || {}),
      ...clone(remote),
      ...clone(local),
      openedAt: latest(local.openedAt, remote.openedAt),
      completedAt: earliest(local.completedAt, remote.completedAt),
      competencyIds: unionStable(local.competencyIds, remote.competencyIds),
    };
  }
  return chooseThreeWay(base, local, remote, path, conflicts);
}

function mergeResources(base = {}, local = {}, remote = {}, path, conflicts) {
  return mergeMap(base, local, remote, path, conflicts, (baseWeek = {}, localWeek = {}, remoteWeek = {}, weekPath) => (
    mergeMap(baseWeek, localWeek, remoteWeek, weekPath, conflicts, mergeResource)
  ));
}

function mergeAttempts(base = [], local = [], remote = [], path, conflicts, skillCheckId) {
  const byId = new Map();
  for (const attempt of [...base, ...local, ...remote]) {
    const existing = byId.get(attempt.attemptId);
    if (existing && !equal(existing, attempt)) {
      conflicts.push({
        path: `${path}.${attempt.attemptId}`,
        type: 'attempt_identity_collision',
        skillCheckId,
        attemptId: attempt.attemptId,
        base: null,
        local: clone(existing),
        remote: clone(attempt),
      });
      continue;
    }
    if (!existing) byId.set(attempt.attemptId, clone(attempt));
  }
  return [...byId.values()];
}

function mergeSkillCheck(base = {}, local = {}, remote = {}, path, conflicts, skillCheckId) {
  if (!changed(base, local)) return clone(remote);
  if (!changed(base, remote) || equal(local, remote)) return clone(local);
  const recovery = chooseThreeWay(base?.recovery ?? null, local?.recovery ?? null, remote?.recovery ?? null, `${path}.recovery`, conflicts);
  return {
    attempts: mergeAttempts(base?.attempts, local?.attempts, remote?.attempts, `${path}.attempts`, conflicts, skillCheckId),
    consecutiveFailures: chooseThreeWay(base?.consecutiveFailures ?? 0, local?.consecutiveFailures ?? 0, remote?.consecutiveFailures ?? 0, `${path}.consecutiveFailures`, conflicts),
    recovery,
  };
}

function artifactMap(group = {}) {
  const map = new Map();
  for (const record of group.records || []) map.set(record.id, { record, tombstone: null });
  for (const tombstone of group.tombstones || []) map.set(tombstone.id, { record: null, tombstone });
  return map;
}

function mergeArtifacts(base = {}, local = {}, remote = {}, path, conflicts) {
  const baseMap = artifactMap(base);
  const localMap = artifactMap(local);
  const remoteMap = artifactMap(remote);
  const records = [];
  const tombstones = [];
  const ids = new Set([...baseMap.keys(), ...localMap.keys(), ...remoteMap.keys()]);
  for (const id of ids) {
    const baseValue = baseMap.get(id) || null;
    // Absence is not a delete. Only an explicit tombstone can remove a synchronized artifact.
    const localValue = localMap.has(id) ? localMap.get(id) : baseValue;
    const remoteValue = remoteMap.has(id) ? remoteMap.get(id) : baseValue;
    const value = chooseThreeWay(baseValue, localValue, remoteValue, `${path}.${id}`, conflicts);
    if (value?.record) records.push(value.record);
    if (value?.tombstone) tombstones.push(value.tombstone);
  }
  return { records, tombstones };
}

export function mergeCloudStates({ base, local, remote, baseGeneration, localGeneration, remoteGeneration }) {
  if (localGeneration !== remoteGeneration || baseGeneration !== localGeneration) {
    return {
      mergedState: clone(local),
      unresolvedConflicts: [{
        path: '$',
        type: 'reset_generation_barrier',
        baseGeneration,
        localGeneration,
        remoteGeneration,
      }],
      metadata: { resetBarrier: true },
    };
  }
  const conflicts = [];
  const baseState = base.curriculumState || {};
  const localState = local.curriculumState || {};
  const remoteState = remote.curriculumState || {};
  const mergedCurriculum = {
    curriculumId: chooseThreeWay(baseState.curriculumId, localState.curriculumId, remoteState.curriculumId, 'curriculumState.curriculumId', conflicts),
    lastSeenRevision: chooseThreeWay(baseState.lastSeenRevision, localState.lastSeenRevision, remoteState.lastSeenRevision, 'curriculumState.lastSeenRevision', conflicts),
    activeWeekId: clone(localState.activeWeekId ?? remoteState.activeWeekId ?? null),
    completedWeekIds: unionStable(localState.completedWeekIds, remoteState.completedWeekIds),
    stageSatisfaction: mergeStages(baseState.stageSatisfaction, localState.stageSatisfaction, remoteState.stageSatisfaction, 'curriculumState.stageSatisfaction', conflicts),
    resources: mergeResources(baseState.resources, localState.resources, remoteState.resources, 'curriculumState.resources', conflicts),
    skillChecks: mergeMap(baseState.skillChecks, localState.skillChecks, remoteState.skillChecks, 'curriculumState.skillChecks', conflicts, mergeSkillCheck),
    builds: mergeMap(baseState.builds, localState.builds, remoteState.builds, 'curriculumState.builds', conflicts),
    proofs: mergeMap(baseState.proofs, localState.proofs, remoteState.proofs, 'curriculumState.proofs', conflicts, (baseProof = {}, localProof = {}, remoteProof = {}, proofPath) => ({
      evidence: mergeMap(baseProof.evidence, localProof.evidence, remoteProof.evidence, `${proofPath}.evidence`, conflicts),
    })),
    reflections: mergeMap(baseState.reflections, localState.reflections, remoteState.reflections, 'curriculumState.reflections', conflicts, (baseWeek = {}, localWeek = {}, remoteWeek = {}, weekPath) => (
      mergeMap(baseWeek, localWeek, remoteWeek, weekPath, conflicts)
    )),
  };
  return {
    mergedState: {
      curriculumState: mergedCurriculum,
      notes: mergeArtifacts(base.notes, local.notes, remote.notes, 'notes', conflicts),
      blockers: mergeArtifacts(base.blockers, local.blockers, remote.blockers, 'blockers', conflicts),
    },
    unresolvedConflicts: conflicts,
    metadata: { resetBarrier: false, safelyMerged: conflicts.length === 0 },
  };
}
