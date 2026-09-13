import assert from 'node:assert/strict';
import test from 'node:test';
import runtime from '../curriculum-v2/catalog/published/pythonAgentEngineering.js';
import { createCurriculumLearnerState } from '../curriculum-v2/state/learnerState.js';
import { canonicalStringify, sha256Canonical } from './canonicalJson.js';
import { hasMeaningfulProgress, hydrateFromCloud, projectForCloud } from './cloudState.js';
import { mergeCloudStates } from './threeWayMerge.js';

const empty = () => createCurriculumLearnerState(runtime);
const envelope = (curriculumState = empty()) => ({ curriculumState, notes: { records: [], tombstones: [] }, blockers: { records: [], tombstones: [] } });

test('canonical serialization sorts nested object keys while preserving array order', async () => {
  const first = { z: [{ b: 2, a: 1 }], a: true };
  const second = { a: true, z: [{ a: 1, b: 2 }] };
  assert.equal(canonicalStringify(first), canonicalStringify(second));
  assert.equal(await sha256Canonical(first), await sha256Canonical(second));
  assert.equal(await sha256Canonical({ z: { b: 2, a: 1 }, a: true }), '825cce5775e992c17886545fb7e26450fd51ddbb8644da4c765fdcdd63e3f3be');
  assert.notEqual(await sha256Canonical(first), await sha256Canonical({ ...second, a: false }));
});

test('cloud projection strips curriculum question snapshots and keeps linked artifacts only', () => {
  const state = empty();
  state.skillChecks['PYAE-SC-W01'] = { attempts: [{ attemptId: 'a1', questionIds: ['PYAE-Q-W01-01'], questionSnapshot: [{ prompt: 'secret curriculum content' }] }], consecutiveFailures: 0, recovery: null };
  const projected = projectForCloud({
    curriculumState: state,
    curriculumId: 'PYAE',
    notes: [{ id: 'n1', roadmapId: 'PYAE', whatLearned: 'keep' }, { id: 'n2', whatLearned: 'local only' }],
    blockers: [{ id: 'b1', roadmapId: 'OTHER', title: 'local only' }],
  });
  assert.equal('questionSnapshot' in projected.curriculumState.skillChecks['PYAE-SC-W01'].attempts[0], false);
  assert.deepEqual(projected.notes.records.map((note) => note.id), ['n1']);
  assert.equal(projected.blockers.records.length, 0);
});

test('hydration preserves a locally retained historical question snapshot', () => {
  const local = empty();
  local.skillChecks['PYAE-SC-W01'] = { attempts: [{ attemptId: 'a1', questionIds: ['old-id'], questionSnapshot: [{ id: 'old-id', prompt: 'Historical prompt' }] }], consecutiveFailures: 0, recovery: null };
  const cloud = projectForCloud({ curriculumState: local, curriculumId: 'PYAE' });
  const hydrated = hydrateFromCloud({ localCurriculumState: local, cloudState: cloud, runtime });
  assert.equal(hydrated.curriculumState.skillChecks['PYAE-SC-W01'].attempts[0].questionSnapshot[0].prompt, 'Historical prompt');
});

test('old note IDs and recovery insightNoteId survive projection and hydration unchanged', () => {
  const local = empty();
  local.skillChecks['PYAE-SC-W01'] = {
    attempts: [],
    consecutiveFailures: 2,
    recovery: {
      lockedAt: '2026-01-01T00:00:00.000Z', afterAttemptId: 'attempt-2', resourceId: null,
      resourceReviewedAt: null, insightNoteId: '1700000000000', insightCreatedAt: '2026-01-01T00:01:00.000Z', recoveredAt: null,
    },
  };
  const note = { id: '1700000000000', roadmapId: 'PYAE', whatLearned: 'legacy-compatible', updatedAt: '2026-01-01T00:01:00.000Z' };
  const cloud = projectForCloud({ curriculumState: local, curriculumId: 'PYAE', notes: [note] });
  const hydrated = hydrateFromCloud({ localCurriculumState: local, cloudState: cloud, runtime, notes: [note] });
  assert.equal(hydrated.notes[0].id, '1700000000000');
  assert.equal(hydrated.curriculumState.skillChecks['PYAE-SC-W01'].recovery.insightNoteId, '1700000000000');
});

test('a representative three-attempt-per-week PYAE cloud projection stays below one MiB', () => {
  const state = empty();
  for (const week of runtime.weeks) {
    const questions = week.skillCheck.questions.slice(0, 10);
    state.skillChecks[week.skillCheck.id] = {
      attempts: Array.from({ length: 3 }, (_, index) => ({
        attemptId: `${week.id}-attempt-${index + 1}`,
        attemptNumber: index + 1,
        questionIds: questions.map((question) => question.id),
        answers: Object.fromEntries(questions.map((question) => [question.id, String(question.correctOptionId)])),
        score: questions.length,
        total: questions.length,
        percentage: 100,
        passed: true,
        submittedAt: '2026-01-01T00:00:00.000Z',
        questionSnapshot: questions,
      })),
      consecutiveFailures: 0,
      recovery: null,
    };
  }
  const projected = projectForCloud({
    curriculumState: state,
    curriculumId: 'PYAE',
    notes: Array.from({ length: 120 }, (_, index) => ({ id: `n-${index}`, roadmapId: 'PYAE', whatLearned: 'Representative learner note.' })),
    blockers: Array.from({ length: 48 }, (_, index) => ({ id: `b-${index}`, roadmapId: 'PYAE', whatWentWrong: 'Representative learner problem.' })),
  });
  assert.ok(Buffer.byteLength(JSON.stringify(projected), 'utf8') < 1024 * 1024);
  assert.equal(JSON.stringify(projected).includes('questionSnapshot'), false);
});

test('meaningful progress ignores navigation but recognizes every learner activity family', () => {
  const clean = empty();
  clean.activeWeekId = runtime.weeks[1].id;
  assert.equal(hasMeaningfulProgress(clean, envelope(clean)), false);
  for (const field of ['stageSatisfaction', 'resources', 'skillChecks', 'builds', 'proofs', 'reflections']) {
    const state = empty();
    state[field] = { evidence: {} };
    assert.equal(hasMeaningfulProgress(state), true, field);
  }
  assert.equal(hasMeaningfulProgress(clean, { notes: { records: [{ id: 'n1' }] }, blockers: { records: [] } }), true);
});

test('three-way merge unions monotonic progress and conflicts on incompatible reflection text', () => {
  const base = envelope();
  const local = envelope();
  const remote = envelope();
  local.curriculumState.completedWeekIds = ['PYAE-W01'];
  remote.curriculumState.completedWeekIds = ['PYAE-W02'];
  base.curriculumState.reflections = { 'PYAE-W01': { p1: { response: 'base', savedAt: '2026-01-01T00:00:00Z' } } };
  local.curriculumState.reflections = { 'PYAE-W01': { p1: { response: 'local', savedAt: '2026-01-02T00:00:00Z' } } };
  remote.curriculumState.reflections = { 'PYAE-W01': { p1: { response: 'remote', savedAt: '2026-01-03T00:00:00Z' } } };
  const result = mergeCloudStates({ base, local, remote, baseGeneration: 0, localGeneration: 0, remoteGeneration: 0 });
  assert.deepEqual(result.mergedState.curriculumState.completedWeekIds, ['PYAE-W01', 'PYAE-W02']);
  assert.equal(result.mergedState.curriculumState.reflections['PYAE-W01'].p1.response, 'local');
  assert.equal(result.unresolvedConflicts.some((item) => item.path.endsWith('.p1')), true);
});

test('three-way merge enforces reset generation barrier', () => {
  const result = mergeCloudStates({ base: envelope(), local: envelope(), remote: envelope(), baseGeneration: 0, localGeneration: 0, remoteGeneration: 1 });
  assert.equal(result.metadata.resetBarrier, true);
  assert.equal(result.unresolvedConflicts[0].type, 'reset_generation_barrier');
});

test('stage satisfaction and completed resources cannot regress inside one generation', () => {
  const base = envelope();
  const local = envelope();
  const remote = envelope();
  local.curriculumState.stageSatisfaction = { 'PYAE-W01': { study: { satisfied: true, satisfiedAt: '2026-01-03T00:00:00Z', competencyIds: ['c1'] } } };
  remote.curriculumState.stageSatisfaction = { 'PYAE-W01': { study: { satisfied: true, satisfiedAt: '2026-01-02T00:00:00Z', competencyIds: ['c2'] } } };
  local.curriculumState.resources = { 'PYAE-W01': { r1: { openedAt: '2026-01-03T00:00:00Z', completedAt: '2026-01-03T00:00:00Z', competencyIds: ['c1'] } } };
  remote.curriculumState.resources = { 'PYAE-W01': { r1: { openedAt: '2026-01-04T00:00:00Z' } } };
  const result = mergeCloudStates({ base, local, remote, baseGeneration: 0, localGeneration: 0, remoteGeneration: 0 });
  const stage = result.mergedState.curriculumState.stageSatisfaction['PYAE-W01'].study;
  assert.equal(stage.satisfied, true);
  assert.equal(stage.satisfiedAt, '2026-01-02T00:00:00Z');
  assert.deepEqual(stage.competencyIds, ['c1', 'c2']);
  assert.equal(result.mergedState.curriculumState.resources['PYAE-W01'].r1.completedAt, '2026-01-03T00:00:00Z');
});

test('attempts union by identity and conflicting duplicate content is preserved as conflict', () => {
  const base = envelope();
  const local = envelope();
  const remote = envelope();
  const record = (attempts, recovery = null) => ({ attempts, consecutiveFailures: attempts.length, recovery });
  local.curriculumState.skillChecks.sc1 = record([{ attemptId: 'a1', score: 4 }]);
  remote.curriculumState.skillChecks.sc1 = record([{ attemptId: 'a2', score: 5 }]);
  let result = mergeCloudStates({ base, local, remote, baseGeneration: 0, localGeneration: 0, remoteGeneration: 0 });
  assert.deepEqual(result.mergedState.curriculumState.skillChecks.sc1.attempts.map((item) => item.attemptId), ['a1', 'a2']);
  local.curriculumState.skillChecks.sc1 = record([{ attemptId: 'same', score: 4 }]);
  remote.curriculumState.skillChecks.sc1 = record([{ attemptId: 'same', score: 5 }]);
  result = mergeCloudStates({ base, local, remote, baseGeneration: 0, localGeneration: 0, remoteGeneration: 0 });
  const collision = result.unresolvedConflicts.find((item) => item.type === 'attempt_identity_collision');
  assert.equal(collision.skillCheckId, 'sc1');
  assert.equal(collision.attemptId, 'same');
});

test('identical duplicate attempts are retained once without a conflict', () => {
  const base = envelope();
  const local = envelope();
  const remote = envelope();
  const attempt = { attemptId: 'same-attempt', score: 7, total: 10 };
  const record = { attempts: [attempt], consecutiveFailures: 0, recovery: null };
  local.curriculumState.skillChecks.sc1 = structuredClone(record);
  remote.curriculumState.skillChecks.sc1 = structuredClone(record);
  const result = mergeCloudStates({ base, local, remote, baseGeneration: 0, localGeneration: 0, remoteGeneration: 0 });
  assert.deepEqual(result.mergedState.curriculumState.skillChecks.sc1.attempts, [attempt]);
  assert.equal(result.unresolvedConflicts.length, 0);
});

test('recovery, individual builds, proof, and reflection use field-specific three-way rules', () => {
  const base = envelope();
  const local = envelope();
  const remote = envelope();
  base.curriculumState.builds.b1 = { completedAt: '2026-01-01T00:00:00Z' };
  remote.curriculumState.builds.b1 = base.curriculumState.builds.b1;
  local.curriculumState.proofs.p1 = { evidence: { e1: { value: 'local', updatedAt: '2026-01-02T00:00:00Z' } } };
  remote.curriculumState.proofs.p1 = { evidence: { e2: { value: 'remote', updatedAt: '2026-01-02T00:00:00Z' } } };
  const result = mergeCloudStates({ base, local, remote, baseGeneration: 0, localGeneration: 0, remoteGeneration: 0 });
  assert.equal('b1' in result.mergedState.curriculumState.builds, false);
  assert.equal(result.mergedState.curriculumState.proofs.p1.evidence.e1.value, 'local');
  assert.equal(result.mergedState.curriculumState.proofs.p1.evidence.e2.value, 'remote');

  const recoveryBase = envelope();
  const recoveryLocal = envelope();
  const recoveryRemote = envelope();
  recoveryBase.curriculumState.skillChecks.sc1 = { attempts: [], consecutiveFailures: 0, recovery: null };
  recoveryLocal.curriculumState.skillChecks.sc1 = { attempts: [], consecutiveFailures: 1, recovery: { lockedAt: '2026-01-01', afterAttemptId: 'a1' } };
  recoveryRemote.curriculumState.skillChecks.sc1 = { attempts: [], consecutiveFailures: 1, recovery: { lockedAt: '2026-01-02', afterAttemptId: 'a2' } };
  const recoveryResult = mergeCloudStates({ base: recoveryBase, local: recoveryLocal, remote: recoveryRemote, baseGeneration: 0, localGeneration: 0, remoteGeneration: 0 });
  assert.equal(recoveryResult.unresolvedConflicts.some((item) => item.path.endsWith('.recovery')), true);
});

test('artifact tombstones propagate against unchanged base and conflict with an edit', () => {
  const base = envelope();
  base.notes.records = [{ id: 'old-id', roadmapId: 'PYAE', whatLearned: 'base' }];
  const local = structuredClone(base);
  local.notes = { records: [], tombstones: [{ id: 'old-id', recordType: 'note', curriculumId: 'PYAE', deletedAt: '2026-01-02T00:00:00Z' }] };
  const remote = structuredClone(base);
  let result = mergeCloudStates({ base, local, remote, baseGeneration: 0, localGeneration: 0, remoteGeneration: 0 });
  assert.equal(result.mergedState.notes.records.length, 0);
  assert.equal(result.mergedState.notes.tombstones[0].id, 'old-id');
  remote.notes.records[0].whatLearned = 'remote edit';
  result = mergeCloudStates({ base, local, remote, baseGeneration: 0, localGeneration: 0, remoteGeneration: 0 });
  assert.equal(result.unresolvedConflicts.some((item) => item.path === 'notes.old-id'), true);
});

test('three-way artifacts propagate deletion only when the other branch is unchanged', () => {
  const base = envelope();
  const local = envelope();
  const remote = envelope();
  const note = { id: '1', roadmapId: 'PYAE', whatLearned: 'base' };
  base.notes.records = [note];
  local.notes.tombstones = [{ id: '1', recordType: 'note', curriculumId: 'PYAE', deletedAt: '2026-01-02T00:00:00Z' }];
  remote.notes.records = [note];
  const deletion = mergeCloudStates({ base, local, remote, baseGeneration: 0, localGeneration: 0, remoteGeneration: 0 });
  assert.equal(deletion.mergedState.notes.records.length, 0);
  assert.equal(deletion.mergedState.notes.tombstones.length, 1);
  remote.notes.records = [{ ...note, whatLearned: 'remote edit' }];
  const conflict = mergeCloudStates({ base, local, remote, baseGeneration: 0, localGeneration: 0, remoteGeneration: 0 });
  assert.equal(conflict.unresolvedConflicts.some((item) => item.path === 'notes.1'), true);
});

test('an absent artifact is never inferred to be a deletion without a tombstone', () => {
  const base = envelope();
  const note = { id: 'legacy-id', roadmapId: 'PYAE', whatLearned: 'keep me' };
  base.notes.records = [note];
  const local = structuredClone(base);
  local.notes.records = [];
  const remote = structuredClone(base);
  const result = mergeCloudStates({ base, local, remote, baseGeneration: 0, localGeneration: 0, remoteGeneration: 0 });
  assert.deepEqual(result.mergedState.notes.records, [note]);
  assert.equal(result.mergedState.notes.tombstones.length, 0);
});

test('proof collisions conflict, one-sided note edits propagate, and active week stays local', () => {
  const base = envelope();
  const local = envelope();
  const remote = envelope();
  base.curriculumState.proofs.p1 = { evidence: { e1: { value: 'base', updatedAt: '2026-01-01T00:00:00Z' } } };
  local.curriculumState.proofs.p1 = { evidence: { e1: { value: 'local', updatedAt: '2026-01-02T00:00:00Z' } } };
  remote.curriculumState.proofs.p1 = { evidence: { e1: { value: 'remote', updatedAt: '2026-01-03T00:00:00Z' } } };
  base.notes.records = [{ id: 'n1', roadmapId: 'PYAE', whatLearned: 'base' }];
  local.notes.records = [{ id: 'n1', roadmapId: 'PYAE', whatLearned: 'local edit' }];
  remote.notes.records = structuredClone(base.notes.records);
  local.curriculumState.activeWeekId = 'PYAE-W02';
  remote.curriculumState.activeWeekId = 'PYAE-W03';
  const result = mergeCloudStates({ base, local, remote, baseGeneration: 0, localGeneration: 0, remoteGeneration: 0 });
  assert.equal(result.mergedState.curriculumState.activeWeekId, 'PYAE-W02');
  assert.equal(result.mergedState.notes.records[0].whatLearned, 'local edit');
  assert.equal(result.unresolvedConflicts.some((item) => item.path.endsWith('.e1')), true);
});

test('blocker tombstones propagate and conflict with independent edits', () => {
  const base = envelope();
  const blocker = { id: 'b1', roadmapId: 'PYAE', whatWentWrong: 'base' };
  base.blockers.records = [blocker];
  const local = structuredClone(base);
  local.blockers = { records: [], tombstones: [{ id: 'b1', recordType: 'blocker', curriculumId: 'PYAE', deletedAt: '2026-01-02T00:00:00Z' }] };
  const remote = structuredClone(base);
  let result = mergeCloudStates({ base, local, remote, baseGeneration: 0, localGeneration: 0, remoteGeneration: 0 });
  assert.equal(result.mergedState.blockers.tombstones[0].id, 'b1');
  remote.blockers.records[0].whatWentWrong = 'remote edit';
  result = mergeCloudStates({ base, local, remote, baseGeneration: 0, localGeneration: 0, remoteGeneration: 0 });
  assert.equal(result.unresolvedConflicts.some((item) => item.path === 'blockers.b1'), true);
});
