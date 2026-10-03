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
import { validateSkillCheckAuthoring } from '../validation/validateSkillCheckAuthoring.js';
import { validateStudioActivities } from '../validation/validateStudioActivities.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const artifactDir = path.join(root, 'XcelerateAI Curriculum System', 'v2', 'curricula', 'front-end-web-engineering');
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(artifactDir, name), 'utf8'));
const source = readJson('curriculum-source.json');
const research = readJson('resources.json');
const coverage = readJson('coverage.json');
const contentAudit = readJson('content-integrity-audit.json');
const studios = readJson('studio-activities.json');

test('Front-End source, research, evidence, Studios, Skill Checks, runtime, and coverage pass', () => {
  const reports = [
    validateCurriculumSource(source),
    validateResourceResearch(research),
    validateContentIntegrityAudit(contentAudit, source, research),
    validateStudioActivities(studios, source),
    validateSkillCheckAuthoring(contentAudit, source),
  ];
  reports.forEach((report) => {
    assert.equal(report.status, 'PASS');
    assert.equal(report.warningCount, 0);
  });
  assert.equal(contentAudit.questionAudits.length, 330);
  assert.equal(contentAudit.buildAudits.length, 33);
  assert.equal(contentAudit.weekReadiness.length, 33);
  const classificationTotals = contentAudit.questionAudits.reduce((totals, item) => {
    totals[item.classification] += 1;
    return totals;
  }, { A: 0, B: 0, C: 0, D: 0 });
  assert.deepEqual(classificationTotals, { A: 330, B: 0, C: 0, D: 0 });
  const compiled = compileCurriculum(source);
  assert.equal(validateRuntimeCurriculum(compiled).status, 'PASS');
  assert.deepEqual(coverage, generateCoverage(source));
});

test('Front-End architecture derives a platform-first 33-week professional path', () => {
  assert.equal(source.curriculumId, 'FEWE');
  assert.equal(source.revision, 1);
  assert.equal(source.phases.length, 5);
  assert.equal(source.weeks.length, 33);
  assert.equal(source.workload.estimatedTotalHours, 795);
  assert.equal(source.weeks.reduce((total, week) => total + week.estimatedHours, 0), 795);
  assert.equal(source.projects.length, 5);
  assert.match(source.projects.at(-1).title, /Independent.*Capstone/i);
  assert.match(source.weeks[0].title, /Web Works|First Page/i);
  assert.match(source.weeks[19].title, /React/i);
});

test('every Front-End Week separates Study from its Build guidance and supplies ten mapped questions', () => {
  const resourceById = new Map(source.resources.map((resource) => [resource.id, resource]));
  source.weeks.forEach((week) => {
    assert.equal(week.skillCheck.questions.length, 10, week.id);
    assert.equal(week.skillCheck.passingScore, 70, week.id);
    assert.equal(new Set(week.skillCheck.questions.map((question) => question.correctOptionId)).size >= 3, true, week.id);
    assert.equal(week.study.resources.length, 2, week.id);
    assert.equal(week.study.resources.filter((item) => resourceById.get(item.resourceId)?.provider === 'XcelerateAI').length, 0, week.id);
    assert.equal(week.study.resources.some((item) => /studio/i.test(resourceById.get(item.resourceId)?.url ?? '')), false, week.id);
    const build = week.builds.find((item) => item.required);
    assert.ok(build, `${week.id} required Build`);
    const guided = studios.activities.find((item) => item.weekId === week.id);
    assert.deepEqual(guided.placement, { stage: 'build', buildId: build.id }, week.id);
    assert.deepEqual(guided.steps, build.steps.map((step) => step.text), week.id);
    assert.equal(contentAudit.weekReadiness.find((item) => item.weekId === week.id)?.answer, 'YES', week.id);
  });
});

test('Front-End Core competencies and Project milestones resolve to canonical Build evidence', () => {
  const coverageById = new Map(coverage.map((record) => [record.competencyId, record]));
  source.competencies.filter((item) => item.importance === 'core').forEach((competency) => {
    const record = coverageById.get(competency.id);
    ['taughtIn', 'assessedIn', 'appliedIn', 'projectUse'].forEach((field) => {
      assert.ok(record[field].length > 0, `${competency.id}.${field}`);
    });
    if (!competency.id.startsWith('FEWE-C065') && !competency.id.startsWith('FEWE-C066')) {
      assert.ok(record.reinforcedIn.length > 0, `${competency.id}.reinforcedIn`);
    }
  });
  const weeksById = new Map(source.weeks.map((week) => [week.id, week]));
  source.projects.flatMap((project) => project.milestones).forEach((milestone) => {
    const build = weeksById.get(milestone.weekId)?.builds.find((item) => item.id === milestone.buildId);
    assert.equal(build?.required, true, milestone.id);
  });
});

test('Front-End resources remain free, final-destination verified, diverse, and honestly classified', () => {
  const assignments = source.weeks.flatMap((week) => week.study.resources);
  const resourceById = new Map(source.resources.map((resource) => [resource.id, resource]));
  const formats = assignments.map((assignment) => resourceById.get(assignment.resourceId).format);
  assert.ok(source.resources.every((resource) => resource.cost === 'free'));
  assert.ok(source.resources.every((resource) => !resource.url.includes('example.com')));
  assert.ok(research.every((resource) => resource.accessStatus === 'verified'));
  assert.ok(research.every((resource) => resource.availability?.finalDestinationStatus === 'success'));
  assert.ok(research.every((resource) => resource.availability?.finalContentVerified === true));
  assert.ok(research.every((resource) => resource.availability?.accessRestricted === false));
  assert.deepEqual(assignments.reduce((totals, assignment) => {
    totals[assignment.learningRole] = (totals[assignment.learningRole] || 0) + 1;
    return totals;
  }, {}), { learn: 32, reference: 30, practice: 4 });
  assert.ok(formats.filter((format) => format === 'documentation').length < assignments.length / 4);
  source.weeks.forEach((week) => {
    const providers = week.study.resources.map((item) => resourceById.get(item.resourceId).provider);
    assert.ok(providers.filter((provider) => ['React', 'Meta'].includes(provider)).length <= 1, week.id);
  });
});

test('Week 1 replaces the unavailable route and gives a complete beginner concrete Build actions', () => {
  const week = source.weeks[0];
  const build = week.builds.find((item) => item.required);
  assert.deepEqual(week.study.resources.map((item) => item.resourceId), ['FEWE-R-W01-01', 'FEWE-R-W01-04']);
  assert.equal(source.resources.some((resource) => resource.id === 'FEWE-R-W01-02'), false);
  assert.equal(source.resources.some((resource) => resource.url.includes('learn.microsoft.com/en-us/training/modules/get-started-web-development')), false);
  assert.match(week.study.objective, /HTML, CSS, and JavaScript/);
  assert.equal(build.steps.length, 5);
  assert.ok(build.templates.some((template) => template.label === 'index.html starter'));
  assert.ok(build.templates.some((template) => template.label === 'styles.css starter'));
  assert.ok(build.templates.some((template) => template.label === 'script.js starter'));
  assert.ok(week.proof.evidence.some((item) => /broken link/i.test(item.label)));
});
