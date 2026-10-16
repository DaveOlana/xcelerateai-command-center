import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { compileCurriculum } from '../compiler/compileCurriculum.js';
import { generateCoverage } from '../coverage/generateCoverage.js';
import { validateContentIntegrityAudit } from '../validation/validateContentIntegrityAudit.js';
import { validateCurriculumSource } from '../validation/validateCurriculumSource.js';
import { validateResourceResearch } from '../validation/validateResourceResearch.js';
import { validateRuntimeCurriculum } from '../validation/validateRuntimeCurriculum.js';
import { validateSkillCheckAuthoring } from '../validation/validateSkillCheckAuthoring.js';
import { validateStudioActivities } from '../validation/validateStudioActivities.js';
import publishedRuntime from './published/pythonProgrammingFoundations.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const artifactDir = path.join(root, 'XcelerateAI Curriculum System', 'v2', 'curricula', 'introductory-computer-science', 'python-introduction-r2');
const historicalDir = path.join(root, 'XcelerateAI Curriculum System', 'v2', 'curricula', 'introductory-computer-science', 'python-introduction');
const readJson = (directory, name) => JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8'));
const source = readJson(artifactDir, 'curriculum-source.json');
const research = readJson(artifactDir, 'resources.json');
const audit = readJson(artifactDir, 'content-integrity-audit.json');
const studio = readJson(artifactDir, 'studio-activities.json');
const coverage = readJson(artifactDir, 'coverage.json');

test('Python R2 passes every evidence-backed candidate and runtime contract', () => {
  const reports = [
    validateCurriculumSource(source),
    validateResourceResearch(research),
    validateContentIntegrityAudit(audit, source, research),
    validateStudioActivities(studio, source),
    validateSkillCheckAuthoring(audit, source),
  ];
  reports.forEach((report) => {
    assert.equal(report.status, 'PASS');
    assert.equal(report.warningCount, 0);
  });
  const compiled = compileCurriculum(source);
  assert.equal(validateRuntimeCurriculum(compiled).status, 'PASS');
  assert.deepEqual(coverage, generateCoverage(source));
  assert.deepEqual(publishedRuntime, compiled);
});

test('Python R2 is an eight-week, 48-hour progression with credible shuffled checks', () => {
  assert.equal(source.curriculumId, 'PYIN');
  assert.equal(source.revision, 2);
  assert.equal(source.workload.estimatedTotalHours, 48);
  assert.equal(source.weeks.length, 8);
  assert.equal(source.weeks.reduce((total, week) => total + week.estimatedHours, 0), 48);
  assert.equal(source.weeks.every((week) => /^PYIN-R2-W\d{2}$/.test(week.id)), true);
  assert.equal(source.weeks.flatMap((week) => week.skillCheck.questions).length, 80);
  assert.equal(new Set(audit.assessmentCoverageMap.entries.map((entry) => entry.targetId)).size, 80);

  source.weeks.forEach((week) => {
    assert.equal(week.skillCheck.questions.length, 10, week.id);
    assert.equal(week.skillCheck.passingScore, 70, week.id);
    assert.equal(week.skillCheck.optionOrder, 'shuffle-per-attempt', week.id);
    assert.ok(new Set(week.skillCheck.questions.map((question) => question.correctOptionId)).size >= 3, week.id);
    assert.ok(week.skillCheck.questions.every((question) => question.options.length === 4), week.id);
  });

  const classifications = audit.questionAudits.reduce((totals, item) => {
    totals[item.classification] += 1;
    return totals;
  }, { A: 0, B: 0, C: 0, D: 0 });
  assert.deepEqual(classifications, { A: 78, B: 2, C: 0, D: 0 });
});

test('Python R2 uses bounded diverse resources and reserves weekly assessment time', () => {
  const resourceById = new Map(source.resources.map((resource) => [resource.id, resource]));
  assert.equal(source.resources.length, 38);
  assert.ok(source.resources.every((resource) => resource.cost === 'free'));
  assert.ok(source.resources.every((resource) => !/curriculum-guides|example\.com/i.test(resource.url)));
  assert.ok(research.every((resource) => resource.accessStatus === 'verified'));
  assert.ok(research.every((resource) => resource.availability?.finalDestinationStatus === 'success'));
  assert.ok(research.every((resource) => resource.availability?.finalContentVerified === true));
  assert.deepEqual(new Set(source.resources.map((resource) => resource.format)), new Set(['course', 'documentation', 'video', 'exercise']));
  assert.ok(source.resources.every((resource) => /Do:/.test(resource.location.note)
    && /Finished when:/.test(resource.location.note)
    && /Next:/.test(resource.location.note)));

  source.weeks.forEach((week) => {
    const core = week.study.resources.filter((assignment) => assignment.role === 'core');
    const resourceMinutes = core.reduce((total, assignment) => total + resourceById.get(assignment.resourceId).estimatedMinutes, 0);
    const build = week.builds.find((item) => item.required);
    assert.ok(core.length >= week.study.coreMinimum, week.id);
    assert.ok(core.some((assignment) => assignment.learningRole === 'learn'), `${week.id} learn route`);
    assert.ok(build, `${week.id} required Build`);
    assert.ok(build.steps.length >= 5, `${week.id} concrete steps`);
    assert.ok(build.acceptanceCriteria.length >= 4, `${week.id} acceptance criteria`);
    assert.ok(build.learnerGuide.sessions.every((session) => session.estimatedMinutes <= 120), `${week.id} session cap`);
    assert.ok(resourceMinutes + build.estimatedMinutes <= 314, `${week.id} reserves at least 46 minutes for Skill Check and reflection`);
  });
});

test('Python R2 opens gently, builds capability progressively, and preserves R1 separately', () => {
  assert.match(source.weeks[0].builds[0].title, /Student Profile/i);
  assert.doesNotMatch(source.weeks[0].builds[0].title, /calculator/i);
  assert.match(source.weeks[3].builds[0].title, /Order Quote/i);
  assert.match(source.weeks[7].builds[0].title, /TaskTrail CLI/i);
  assert.ok(source.weeks[7].study.resources.some((item) => item.resourceId === 'PYIN-R2-W08-01'));
  assert.match(source.resources.find((item) => item.id === 'PYIN-R2-W08-01').title, /argparse/i);

  const historicalSource = readJson(historicalDir, 'curriculum-source.json');
  const historicalRuntime = readJson(historicalDir, 'curriculum.json');
  assert.equal(historicalSource.revision, 1);
  assert.equal(historicalRuntime.revision, 1);
  assert.equal(historicalSource.weeks[0].id, 'PYIN-W01');
  assert.equal(source.weeks[0].id, 'PYIN-R2-W01');
  assert.notDeepEqual(historicalRuntime, publishedRuntime);
});
