import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { compileCurriculum } from '../compiler/compileCurriculum.js';
import { generateCoverage } from '../coverage/generateCoverage.js';
import { validateCurriculumSource } from '../validation/validateCurriculumSource.js';
import { validateContentIntegrityAudit } from '../validation/validateContentIntegrityAudit.js';
import { validateResourceResearch } from '../validation/validateResourceResearch.js';
import { validateRuntimeCurriculum } from '../validation/validateRuntimeCurriculum.js';
import publishedRuntime from './published/pythonAgentEngineering.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const artifactDir = path.join(root, 'XcelerateAI Curriculum System', 'v2', 'curricula', 'python-agent-engineering');
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(artifactDir, name), 'utf8'));
const source = readJson('curriculum-source.json');
const research = readJson('resources.json');
const coverage = readJson('coverage.json');
const contentAudit = readJson('content-integrity-audit.json');

test('PYAE R3 candidate source, research, content evidence, runtime, and derived coverage pass their contracts', () => {
  assert.equal(validateCurriculumSource(source).status, 'PASS');
  assert.equal(validateResourceResearch(research).status, 'PASS');
  const contentReport = validateContentIntegrityAudit(contentAudit, source, research);
  assert.equal(contentReport.status, 'PASS');
  assert.deepEqual(contentReport.summary.classificationTotals, { A: 179, B: 32, C: 29, D: 0 });
  assert.equal(contentReport.summary.questionAudits, 240);
  assert.equal(contentReport.summary.buildAudits, 24);
  assert.equal(contentReport.summary.weekReadiness, 24);
  const compiled = compileCurriculum(source);
  assert.equal(validateRuntimeCurriculum(compiled).status, 'PASS');
  assert.ok(compiled.concepts.length > 0);
  assert.equal(Object.keys(compiled.indexes.conceptsById).length, compiled.concepts.length);
  assert.deepEqual(coverage, generateCoverage(source));
});

test('the live PYAE catalog remains valid while candidate validation is independent of publication', () => {
  assert.equal(validateRuntimeCurriculum(publishedRuntime).status, 'PASS');
  assert.equal(publishedRuntime.curriculumId, 'PYAE');
  assert.ok(publishedRuntime.revision <= source.revision);
  if (publishedRuntime.revision === source.revision) assert.deepEqual(publishedRuntime, compileCurriculum(source));
});

test('PYAE architecture matches the approved duration, workload, and assessment design', () => {
  assert.equal(source.curriculumId, 'PYAE');
  assert.equal(source.revision, 3);
  assert.equal(source.phases.length, 6);
  assert.equal(source.weeks.length, 24);
  assert.equal(source.workload.estimatedTotalHours, 520);
  assert.equal(source.weeks.reduce((total, week) => total + week.estimatedHours, 0), 520);
  source.weeks.forEach((week) => {
    assert.equal(week.skillCheck.questions.length, 10, week.id);
    assert.equal(week.skillCheck.passingScore, 70, week.id);
    assert.ok(week.skillCheck.questions.every((question) => question.options.length === 4), week.id);
    assert.equal(week.study.coreMinimum, week.study.resources.filter((item) => item.role === 'core').length, week.id);
    assert.ok(week.study.resources.every((assignment) => ['learn', 'practice', 'reference'].includes(assignment.learningRole)), `${week.id} learning roles`);
  });
});

test('PYAE Core competencies have complete evidence and every Project milestone derives from a required weekly Build', () => {
  const coverageById = new Map(coverage.map((record) => [record.competencyId, record]));
  source.competencies.filter((item) => item.importance === 'core').forEach((competency) => {
    const record = coverageById.get(competency.id);
    ['taughtIn', 'practicedIn', 'assessedIn', 'appliedIn', 'projectUse', 'reinforcedIn', 'intermediateReinforcedIn']
      .forEach((field) => {
        if (competency.id === 'PYAE-C033' && field === 'intermediateReinforcedIn') return;
        assert.ok(record[field].length > 0, `${competency.id}.${field}`);
      });
  });
  const weeksById = new Map(source.weeks.map((week) => [week.id, week]));
  source.projects.flatMap((project) => project.milestones).forEach((milestone) => {
    const build = weeksById.get(milestone.weekId)?.builds.find((item) => item.id === milestone.buildId);
    assert.equal(build?.required, true, milestone.id);
  });
});

test('PYAE keeps the required learner path free, local-first, and free of production placeholders', () => {
  assert.ok(source.resources.every((resource) => resource.cost === 'free'));
  assert.ok(source.assumptions.some((item) => item.includes('FakeModel')));
  assert.ok(source.weeks.filter((week) => week.sequence >= 9).every((week) => week.builds.every((build) => build.acceptanceCriteria.some((item) => /offline|FakeModel|without.*model API|without requiring any paid API/i.test(item.text)))));
  assert.ok(source.resources.every((resource) => !resource.url.includes('example.com')));
  assert.ok(research.every((resource) => resource.accessStatus === 'verified'));
});
