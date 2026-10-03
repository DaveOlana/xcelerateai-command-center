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
import publishedRuntime from './published/productDesign.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const artifactDir = path.join(root, 'XcelerateAI Curriculum System', 'v2', 'curricula', 'product-design');
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(artifactDir, name), 'utf8'));
const source = readJson('curriculum-source.json');
const research = readJson('resources.json');
const coverage = readJson('coverage.json');
const contentAudit = readJson('content-integrity-audit.json');
const learningDesign = readJson('learning-design.json');

test('Product Design source, research, content evidence, runtime, and derived coverage pass their contracts', () => {
  const sourceReport = validateCurriculumSource(source);
  const researchReport = validateResourceResearch(research);
  const contentReport = validateContentIntegrityAudit(contentAudit, source, research);
  const compiled = compileCurriculum(source);
  assert.equal(sourceReport.status, 'PASS');
  assert.equal(sourceReport.warningCount, 0);
  assert.equal(researchReport.status, 'PASS');
  assert.equal(researchReport.warningCount, 0);
  assert.equal(contentReport.status, 'PASS');
  assert.equal(contentReport.warningCount, 0);
  assert.equal(contentAudit.questionAudits.length, 280);
  assert.equal(contentAudit.buildAudits.length, 28);
  assert.equal(contentAudit.weekReadiness.length, 28);
  assert.equal(validateRuntimeCurriculum(compiled).status, 'PASS');
  assert.deepEqual(coverage, generateCoverage(source));
  assert.deepEqual(publishedRuntime, compiled);
});

test('Product Design architecture matches the approved beginner workload and progressive project design', () => {
  assert.equal(source.curriculumId, 'PDES');
  assert.equal(source.revision, 1);
  assert.equal(source.phases.length, 6);
  assert.equal(source.weeks.length, 28);
  assert.equal(source.workload.estimatedTotalHours, 673);
  assert.equal(source.weeks.reduce((total, week) => total + week.estimatedHours, 0), 673);
  assert.deepEqual(source.projects.map((project) => project.milestones.length), [4, 7, 12, 5]);
  assert.match(source.projects.at(-1).title, /Independent.*Capstone/i);
});

test('every Product Design Week has the complete active learning and assessment contract', () => {
  const resourceById = new Map(source.resources.map((resource) => [resource.id, resource]));
  source.weeks.forEach((week) => {
    assert.equal(week.skillCheck.questions.length, 10, week.id);
    assert.equal(week.skillCheck.passingScore, 70, week.id);
    assert.ok(week.skillCheck.questions.every((question) => question.options.length === 4), week.id);
    assert.ok(week.study.resources.some((item) => item.learningRole === 'learn'), `${week.id} learn route`);
    assert.ok(week.study.resources.some((item) => item.learningRole === 'practice'), `${week.id} practice route`);
    assert.ok(week.study.resources.some((item) => resourceById.get(item.resourceId)?.format === 'lab'), `${week.id} lab`);
    assert.ok(week.builds.some((build) => build.required), `${week.id} required Build`);
    assert.equal(contentAudit.weekReadiness.find((item) => item.weekId === week.id)?.answer, 'YES', week.id);
  });
});

test('all Core competencies have complete evidence and Project milestones resolve to required weekly Builds', () => {
  const coverageById = new Map(coverage.map((record) => [record.competencyId, record]));
  source.competencies.filter((item) => item.importance === 'core').forEach((competency) => {
    const record = coverageById.get(competency.id);
    ['taughtIn', 'practicedIn', 'assessedIn', 'appliedIn', 'projectUse', 'reinforcedIn'].forEach((field) => {
      assert.ok(record[field].length > 0, `${competency.id}.${field}`);
    });
  });
  const weeksById = new Map(source.weeks.map((week) => [week.id, week]));
  source.projects.flatMap((project) => project.milestones).forEach((milestone) => {
    const build = weeksById.get(milestone.weekId)?.builds.find((item) => item.id === milestone.buildId);
    assert.equal(build?.required, true, milestone.id);
  });
});

test('Product Design keeps the required path free, inspected, and free of production placeholders', () => {
  assert.ok(source.resources.every((resource) => resource.cost === 'free'));
  assert.ok(source.resources.every((resource) => !resource.url.includes('example.com')));
  assert.ok(research.every((resource) => resource.accessStatus === 'verified'));
  assert.ok(source.assumptions.some((item) => /Figma Starter/i.test(item)));
  assert.ok(source.assumptions.some((item) => /paid|Dev Mode/i.test(item)));
  assert.equal(learningDesign.primaryTool.alternativeEvaluated, 'Penpot');
});
