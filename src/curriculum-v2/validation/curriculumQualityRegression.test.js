import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { compileCurriculum } from '../compiler/compileCurriculum.js';
import { generateCoverage } from '../coverage/generateCoverage.js';
import { validateCurriculumSource } from './validateCurriculumSource.js';
import { validateRuntimeCurriculum } from './validateRuntimeCurriculum.js';
import {
  EMPTY_V2_STATE_STORE,
  reconcileCurriculumState,
  getCurriculumState,
  completeV2Resource,
  setV2BuildCompleted,
  submitV2SkillCheckAttempt
} from '../state/learnerState.js';
import { createSubmittedAttempt } from '../../utils/skillCheckUtils.js';
import { getV2WeekProgress } from '../runtime/progression.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const artifactDir = path.join(root, 'XcelerateAI Curriculum System', 'v2', 'curricula', 'python-agent-engineering');
const source = JSON.parse(fs.readFileSync(path.join(artifactDir, 'curriculum-source.json'), 'utf8'));
const revisionTwoFixtureDir = path.join(root, 'src', 'curriculum-v2', 'test-fixtures', 'pyae-revision-2');
const revisionTwoSource = JSON.parse(fs.readFileSync(path.join(revisionTwoFixtureDir, 'curriculum-source.json'), 'utf8'));
const revisionTwoRuntimeFixture = JSON.parse(fs.readFileSync(path.join(revisionTwoFixtureDir, 'curriculum.json'), 'utf8'));

// 1. Skill Check answer positions are not a fixed exploitable sequence.
test('Regression 1: Skill Check answer positions are not a fixed exploitable sequence', () => {
  const allQuestions = source.weeks.flatMap((w) => w.skillCheck.questions);
  assert.equal(allQuestions.length, 240);

  // Check curriculum-wide distribution
  const counts = { A: 0, B: 0, C: 0, D: 0 };
  allQuestions.forEach((q) => {
    const key = q.correctOptionId.toUpperCase();
    counts[key] = (counts[key] || 0) + 1;
  });

  const total = allQuestions.length;
  for (const [opt, count] of Object.entries(counts)) {
    const pct = (count / total) * 100;
    assert.ok(pct >= 15 && pct <= 35, `Option ${opt} count ${count} (${pct.toFixed(1)}%) outside expected 15-35% range`);
  }

  // Verify no long alternating or repeating streaks
  source.weeks.forEach((week) => {
    const keys = week.skillCheck.questions.map((q) => q.correctOptionId.toUpperCase());
    let streak = 1;
    for (let i = 1; i < keys.length; i++) {
      if (keys[i] === keys[i - 1]) {
        streak++;
        assert.ok(streak <= 3, `${week.id} has suspicious identical answer streak of ${streak}`);
      } else {
        streak = 1;
      }
    }
  });
});

// 2. All four option positions can legitimately be correct.
test('Regression 2: All four option positions can legitimately be correct', () => {
  const counts = { A: 0, B: 0, C: 0, D: 0 };
  source.weeks.flatMap((w) => w.skillCheck.questions).forEach((q) => {
    const key = q.correctOptionId.toUpperCase();
    counts[key] = (counts[key] || 0) + 1;
  });

  assert.ok(counts.A > 40, `A count: ${counts.A}`);
  assert.ok(counts.B > 40, `B count: ${counts.B}`);
  assert.ok(counts.C > 40, `C count: ${counts.C}`);
  assert.ok(counts.D > 40, `D count: ${counts.D}`);

  // Every single week has at least 3 distinct correct option positions
  source.weeks.forEach((week) => {
    const distinct = new Set(week.skillCheck.questions.map((q) => q.correctOptionId.toUpperCase()));
    assert.ok(distinct.size >= 3, `${week.id} has fewer than 3 distinct correct options: ${[...distinct]}`);
  });
});

// 3. No generator automatically creates positive/negative clone pairs.
test('Regression 3: No generator automatically creates positive/negative clone pairs', () => {
  const report = validateCurriculumSource(source);
  const cloneFindings = report.findings.filter((f) => f.code === 'V006-B012');
  assert.equal(cloneFindings.length, 0, `Found positive/negative clone pairs: ${JSON.stringify(cloneFindings)}`);

  // Verify across questions that prompts do not invert with identical options
  source.weeks.forEach((week) => {
    const questions = week.skillCheck.questions;
    for (let i = 0; i < questions.length; i++) {
      for (let j = i + 1; j < questions.length; j++) {
        const q1 = questions[i];
        const q2 = questions[j];
        const q1Opts = q1.options.map((o) => o.label).sort().join('|');
        const q2Opts = q2.options.map((o) => o.label).sort().join('|');
        assert.notEqual(q1Opts, q2Opts, `${week.id} has identical option sets between questions ${q1.id} and ${q2.id}`);
      }
    }
  });
});

// 4. Repeated question stems are detected above a suspicious threshold.
test('Regression 4: Repeated question stems are detected above a suspicious threshold', () => {
  const report = validateCurriculumSource(source);
  const stemFindings = report.findings.filter((f) => f.code === 'V006-B013');
  assert.equal(stemFindings.length, 0, `Found repeated question stems in source: ${JSON.stringify(stemFindings)}`);

  // Test that validator actually flags repeated stems if injected
  const badSource = JSON.parse(JSON.stringify(source));
  badSource.weeks[0].skillCheck.questions.forEach((q, idx) => {
    if (idx < 5) {
      q.prompt = `Scenario ${idx}: An unexpected condition occurred. Which choice most directly created this failure?`;
    }
  });
  const badReport = validateCurriculumSource(badSource);
  const detected = badReport.findings.filter((f) => f.code === 'V006-B013');
  assert.ok(detected.length > 0, 'Validator should flag when repeated stems exceed threshold');
});

// 5. Week 1 does not require automated testing before testing is taught.
test('Regression 5: Week 1 does not require automated testing before testing is taught', () => {
  const week1 = source.weeks.find((w) => w.id === 'PYAE-W01');
  const week1Text = JSON.stringify(week1).toLowerCase();

  assert.ok(!week1Text.includes('pytest'), 'Week 1 must not reference pytest');
  assert.ok(!week1Text.includes('automated test'), 'Week 1 must not require automated test suites');

  // Verify build uses manual/console verification
  const w1Build = week1.builds[0];
  assert.ok(
    w1Build.acceptanceCriteria.some((ac) => ac.text.includes('PowerShell') || ac.text.includes('locally') || ac.text.includes('terminal')),
    'Week 1 acceptance criteria must use local CLI/shell execution'
  );

  // Test that validator flags premature pytest before Week 6
  const badSource = JSON.parse(JSON.stringify(source));
  badSource.weeks[0].builds[0].acceptanceCriteria.push({
    id: 'PYAE-B-W01-01-BAD',
    text: 'Run pytest tests/test_env.py and verify all pass.'
  });
  const badReport = validateCurriculumSource(badSource);
  const detected = badReport.findings.filter((f) => f.code === 'V007-B008');
  assert.ok(detected.length > 0, 'Validator should detect automated testing prerequisite before Week 6');
});

// 6. Build prerequisite audit catches an intentionally injected untaught dependency.
test('Regression 6: Build prerequisite audit catches an intentionally injected untaught dependency', () => {
  const badSource = JSON.parse(JSON.stringify(source));
  // Inject PYAE-C021 (agent loop, taught in W13) into Week 2 build
  badSource.weeks[1].builds[0].competencyIds.push('PYAE-C021');
  const report = validateCurriculumSource(badSource);
  const prereqFindings = report.findings.filter((f) => f.code === 'V007-B007');
  assert.ok(prereqFindings.length > 0, 'Validator must catch untaught competency applied in early build');
});

// 7. Resource count is not globally forced to 3.
test('Regression 7: Resource count is not globally forced to 3', () => {
  // The evidence-backed selection determines each count; there is no global quota.
  const coreCounts = new Set(source.weeks.map((week) => week.study.resources.filter((item) => item.role === 'core').length));
  assert.ok(coreCounts.size > 1, `Expected evidence-driven Core counts, received only ${[...coreCounts].join(', ')}`);
  assert.ok(source.weeks.some((week) => week.study.resources.some((item) => item.role === 'optional')));

  // Verify validator passes when another week has 2 or 4 resources
  const testSource = JSON.parse(JSON.stringify(source));
  testSource.weeks[0].study.resources.pop(); // reduce to 2
  testSource.weeks[0].study.coreMinimum = 2;
  const testReport = validateCurriculumSource(testSource);
  const countBlockers = testReport.findings.filter((f) => f.message.includes('exactly 3'));
  assert.equal(countBlockers.length, 0, 'Validator must not enforce hardcoded 3 resources');
});

// 8. Weekly estimatedHours is not globally forced to 22.
test('Regression 8: Weekly estimatedHours is not globally forced to 22', () => {
  const hours = source.weeks.map((w) => w.estimatedHours);
  const distinctHours = new Set(hours);
  assert.ok(distinctHours.size >= 4, `Weekly hours must vary; found distinct values: ${[...distinctHours]}`);

  assert.equal(Math.min(...hours), 14, 'Minimum weekly workload is 14h in Week 1');
  assert.equal(Math.max(...hours), 28, 'Maximum weekly workload is 28h in Week 24');
  assert.equal(source.workload.estimatedTotalHours, 520);
  assert.equal(hours.reduce((sum, h) => sum + h, 0), 520);
});

// 9. Project boundaries are not globally forced to 8-week spans.
test('Regression 9: Project boundaries are not globally forced to 8-week spans', () => {
  assert.equal(source.projects.length, 3);
  const p1 = source.projects[0];
  const p2 = source.projects[1];
  const p3 = source.projects[2];

  assert.equal(p1.milestones.length, 6, 'Project 1 has 6 milestones');
  assert.equal(p2.milestones.length, 7, 'Project 2 has 7 milestones');
  assert.equal(p3.milestones.length, 9, 'Project 3 has 9 milestones');

  // Verify project week spans vary (not all 8 weeks)
  const getSpan = (proj) => {
    const seqs = proj.milestones.map((m) => parseInt(m.weekId.replace('PYAE-W', ''), 10));
    return Math.max(...seqs) - Math.min(...seqs) + 1;
  };
  const spans = source.projects.map(getSpan);
  assert.deepEqual(spans, [8, 7, 9], 'Project spans are 8, 7, and 9 weeks respectively');
});

// 10. Build scaffolding is not selected from absolute week-number bands.
test('Regression 10: Build scaffolding is not selected from absolute week-number bands', () => {
  // Scaffolding policy is based on domain familiarity, not week number bands
  // Late weeks introducing brand-new technology (e.g. W19 asyncio, W21 MCP) retain full steps and templates
  const w19 = source.weeks.find((w) => w.id === 'PYAE-W19');
  const w21 = source.weeks.find((w) => w.id === 'PYAE-W21');

  assert.ok(w19.builds[0].steps.length >= 4, 'Week 19 retains comprehensive steps for unfamiliar async concepts');
  assert.ok(w19.builds[0].templates.length >= 1, 'Week 19 provides templates for async runner');

  assert.ok(w21.builds[0].steps.length >= 4, 'Week 21 retains comprehensive steps for unfamiliar MCP protocol');
  assert.ok(w21.builds[0].templates.length >= 1, 'Week 21 provides templates for MCP client');
});

// 11. Coverage distinguishes intermediate reinforcement from capstone-only use.
test('Regression 11: Coverage distinguishes intermediate reinforcement from capstone-only use', () => {
  const coverage = generateCoverage(source);
  const coreCompetencies = source.competencies.filter((c) => c.importance === 'core');

  coreCompetencies.forEach((comp) => {
    const record = coverage.find((r) => r.competencyId === comp.id);
    assert.ok(record, `Missing coverage record for ${comp.id}`);
    assert.ok(Array.isArray(record.intermediateReinforcedIn), `${comp.id} missing intermediateReinforcedIn array`);
    assert.ok(Array.isArray(record.capstoneIntegration), `${comp.id} missing capstoneIntegration array`);

    // Every core competency except C033 (taught in W23 immediately before capstone W24) must have intermediate reinforcement in W01-W23
    if (comp.id !== 'PYAE-C033') {
      assert.ok(
        record.intermediateReinforcedIn.length > 0,
        `${comp.id} (${comp.title}) lacks genuine intermediate reinforcement between introduction and capstone`
      );
    }
  });
});

// 12. PYAE revision 2 compiles and loads.
test('Regression 12: isolated PYAE revision 2 fixture compiles and loads', () => {
  const runtime = compileCurriculum(revisionTwoSource);
  const runtimeReport = validateRuntimeCurriculum(runtime);
  assert.equal(runtimeReport.status, 'PASS');
  assert.equal(runtimeReport.blockingFailures, 0);

  assert.equal(runtime.curriculumId, 'PYAE');
  assert.equal(runtime.revision, 2);
  const revisionTwoCompatible = structuredClone(runtime);
  assert.deepEqual(revisionTwoCompatible.concepts, []);
  assert.deepEqual(revisionTwoCompatible.indexes.conceptsById, {});
  delete revisionTwoCompatible.concepts;
  delete revisionTwoCompatible.indexes.conceptsById;
  assert.deepEqual(revisionTwoRuntimeFixture, revisionTwoCompatible);
});

// 13. Update safety remains intact.
test('Regression 13: Update safety remains intact when reconciling learner state from revision 1 to revision 2', () => {
  // Construct a simulated learner state on revision 1
  const rev1Source = JSON.parse(JSON.stringify(revisionTwoSource));
  rev1Source.revision = 1;
  const rev1Runtime = compileCurriculum(rev1Source);

  let store = reconcileCurriculumState(EMPTY_V2_STATE_STORE, rev1Runtime);

  // Learner completes Week 1 study resource and build on revision 1
  const w1ResId = revisionTwoSource.weeks[0].study.resources[0].resourceId;
  store = completeV2Resource(store, rev1Runtime, 'PYAE-W01', w1ResId, '2026-09-05T10:00:00.000Z');
  store = setV2BuildCompleted(store, rev1Runtime, 'PYAE-W01', 'PYAE-B-W01-01', true, '2026-09-05T12:00:00.000Z');

  // Submit passing skill check for Week 1
  const w1Answers = Object.fromEntries(revisionTwoSource.weeks[0].skillCheck.questions.map((q) => [q.id, q.correctOptionId]));
  store = submitV2SkillCheckAttempt(
    store,
    rev1Runtime,
    'PYAE-W01',
    revisionTwoSource.weeks[0].skillCheck.id,
    createSubmittedAttempt({
      definition: revisionTwoSource.weeks[0].skillCheck,
      answers: w1Answers,
      attemptNumber: 1,
      attemptId: 'att-1',
      submittedAt: '2026-09-05T11:00:00.000Z'
    })
  );

  // Now reconcile the learner store against the compiled revision 2 runtime
  const rev2Runtime = compileCurriculum(revisionTwoSource);
  const updatedStore = reconcileCurriculumState(store, rev2Runtime);
  const learnerState = getCurriculumState(updatedStore, 'PYAE');

  assert.equal(learnerState.lastSeenRevision, 2, 'Curriculum state must track revision 2');
  assert.ok(learnerState.resources['PYAE-W01'][w1ResId]?.completedAt, 'Completed resource must remain preserved');
  assert.ok(learnerState.builds['PYAE-B-W01-01']?.completedAt, 'Completed build must remain preserved');
  assert.equal(getV2WeekProgress(rev2Runtime, learnerState, 'PYAE-W01').skillCheck.done, true, 'Skill check pass must be preserved');
});
