import test from 'node:test';
import assert from 'node:assert/strict';
import { aggregateWorkspaceProof, normalizeWorkspaceNote, normalizeWorkspaceProblem } from './workspaceAdapters.js';

test('problem status normalization is learner-facing without mutating records', () => {
  for (const status of ['Solved', 'Closed', 'Resolved']) {
    const source = { id: status, status, title: 'Issue' };
    const before = structuredClone(source);
    assert.equal(normalizeWorkspaceProblem(source).workspaceStatus, 'Resolved');
    assert.deepEqual(source, before);
  }
  assert.equal(normalizeWorkspaceProblem({ status: 'Investigating' }).workspaceStatus, 'Open');
});

test('heterogeneous notes receive safe summaries and Study insights remain natural', () => {
  const insight = normalizeWorkspaceNote({ noteType: 'study_insight', content: 'Objects group related values.', insightScope: 'study' });
  assert.equal(insight.noteType, 'study_insight');
  assert.equal(insight.whatLearned, 'Objects group related values.');
  assert.equal(insight.title, 'Learning note');
  const legacy = normalizeWorkspaceNote({ type: 'Resource Summary', whatILearned: 'A useful idea', week: 4 });
  assert.equal(legacy.noteType, 'resource_summary');
  assert.equal(legacy.linkedWeek, 4);
  assert.equal(legacy.whatLearned, 'A useful idea');
});

test('proof aggregation keeps source semantics, unique IDs, reliable date ordering, and source immutability', () => {
  const input = {
    roadmap: {
      months: [{ weeks: [{ weekNumber: 1, title: 'Week one', practicalMissions: [{ missionId: 'build-1', title: 'First build' }] }] }],
      projects: [{ title: 'Portfolio', milestones: ['One'] }],
    },
    weekProofs: { 1: { githubRepoLink: 'https://github.com/week', githubCommitLink: 'https://github.com/week/commit/1', readmeCompleted: true, submittedDate: '2026-02-03T00:00:00.000Z' } },
    practicalMissions: { 'build-1': { status: 'Completed', completedAt: '2026-02-04T00:00:00.000Z', proof: { githubRepoLink: 'https://github.com/build' } } },
    progress: { projectGithubLinks: { 0: 'https://github.com/project' }, projectLiveDemoLinks: {}, projectNotes: {}, completedProjectMilestones: { 0: [] } },
  };
  const before = structuredClone(input);
  const result = aggregateWorkspaceProof(input);
  assert.equal(result.length, 3);
  assert.equal(new Set(result.map((item) => item.id)).size, 3);
  assert.equal(result[0].source, 'Practical Mission');
  assert.equal(result.at(-1).source, 'Project');
  assert.deepEqual(input, before);
});

test('proof aggregation omits empty evidence records and tolerates missing metadata', () => {
  const result = aggregateWorkspaceProof({ roadmap: {}, weekProofs: { 2: {} }, practicalMissions: { unknown: { proof: {} } }, progress: {} });
  assert.deepEqual(result, []);
});
