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
import publishedRuntime from './published/javascriptProgrammingFoundations.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const artifactDir = path.join(root, 'XcelerateAI Curriculum System', 'v2', 'curricula', 'introductory-computer-science', 'javascript-introduction-r2');
const historicalDir = path.join(root, 'XcelerateAI Curriculum System', 'v2', 'curricula', 'introductory-computer-science', 'javascript-introduction');
const readJson = (directory, name) => JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8'));
const source = readJson(artifactDir, 'curriculum-source.json');
const research = readJson(artifactDir, 'resources.json');
const audit = readJson(artifactDir, 'content-integrity-audit.json');
const studio = readJson(artifactDir, 'studio-activities.json');
const coverage = readJson(artifactDir, 'coverage.json');

test('JavaScript R2 passes every evidence-backed candidate and runtime contract', () => {
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

test('JavaScript R2 is an eight-week, 48-hour progression with credible shuffled checks', () => {
  assert.equal(source.curriculumId, 'JSIN');
  assert.equal(source.revision, 2);
  assert.equal(source.workload.estimatedTotalHours, 48);
  assert.equal(source.weeks.length, 8);
  assert.equal(source.weeks.reduce((total, week) => total + week.estimatedHours, 0), 48);
  assert.equal(source.weeks.every((week) => /^JSIN-R2-W\d{2}$/.test(week.id)), true);
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
  assert.deepEqual(classifications, { A: 63, B: 3, C: 14, D: 0 });
});

test('JavaScript R2 uses bounded diverse resources and keeps coding sessions at two hours or less', () => {
  const resourceById = new Map(source.resources.map((resource) => [resource.id, resource]));
  assert.equal(source.resources.length, 48);
  assert.ok(source.resources.every((resource) => resource.cost === 'free'));
  assert.ok(source.resources.every((resource) => !/curriculum-guides|example\.com/i.test(resource.url)));
  assert.ok(research.every((resource) => resource.accessStatus === 'verified'));
  assert.ok(research.every((resource) => resource.availability?.finalDestinationStatus === 'success'));
  assert.ok(research.every((resource) => resource.availability?.finalContentVerified === true));
  assert.ok(new Set(source.resources.map((resource) => resource.format)).size >= 4);

  source.weeks.forEach((week) => {
    const core = week.study.resources.filter((assignment) => assignment.role === 'core');
    assert.equal(core.length >= week.study.coreMinimum, true, week.id);
    assert.ok(core.some((assignment) => assignment.learningRole === 'learn'), `${week.id} learn route`);
    const videoCompetencies = core
      .filter((assignment) => resourceById.get(assignment.resourceId)?.format === 'video')
      .flatMap((assignment) => assignment.competencyIds);
    if (videoCompetencies.length > 0) {
      assert.ok(core.some((assignment) => resourceById.get(assignment.resourceId)?.format !== 'video'
        && assignment.competencyIds.some((id) => videoCompetencies.includes(id))), `${week.id} readable video fallback`);
    }
    const build = week.builds.find((item) => item.required);
    assert.ok(build, `${week.id} required Build`);
    assert.ok(build.steps.length >= 5, `${week.id} concrete steps`);
    assert.ok(build.acceptanceCriteria.length >= 4, `${week.id} acceptance criteria`);
    assert.ok(build.learnerGuide.sessions.every((session) => session.estimatedMinutes <= 120), `${week.id} session cap`);
  });
});

test('JavaScript R2 opens gently, teaches CLI arguments before the capstone, and preserves R1 separately', () => {
  assert.match(source.weeks[0].builds[0].title, /Welcome Card/i);
  assert.doesNotMatch(source.weeks[0].builds[0].title, /calculator/i);
  assert.ok(source.weeks[7].study.resources.some((item) => item.resourceId === 'JSIN-R2-W08-04'));
  assert.match(source.resources.find((item) => item.id === 'JSIN-R2-W08-04').title, /process\.argv/i);
  assert.match(source.weeks[7].builds[0].title, /FoundIt/i);

  const historicalSource = readJson(historicalDir, 'curriculum-source.json');
  const historicalRuntime = readJson(historicalDir, 'curriculum.json');
  assert.equal(historicalSource.revision, 1);
  assert.equal(historicalRuntime.revision, 1);
  assert.equal(historicalSource.weeks[0].id, 'JSIN-W01');
  assert.equal(source.weeks[0].id, 'JSIN-R2-W01');
  assert.notDeepEqual(historicalRuntime, publishedRuntime);
});

test('JavaScript R2 teaches every repaired output, rejection, and capstone contract before review', () => {
  const week1 = source.weeks.find((week) => week.id === 'JSIN-R2-W01');
  const week2 = source.weeks.find((week) => week.id === 'JSIN-R2-W02');
  const week7 = source.weeks.find((week) => week.id === 'JSIN-R2-W07');
  const week8 = source.weeks.find((week) => week.id === 'JSIN-R2-W08');

  const week1RunRoute = source.resources.find((item) => item.id === 'JSIN-R2-W01-02');
  assert.ok(week1.study.resources.some((item) => item.resourceId === week1RunRoute.id && item.role === 'core'));
  assert.match(week1RunRoute.location.note, /Do:.*cd \.\/week-01/s);
  assert.match(week1RunRoute.location.note, /Finished when:/);
  assert.match(week1RunRoute.location.note, /Next:/);

  assert.ok(week2.study.resources.some((item) => item.resourceId === 'JSIN-R2-W02-06' && item.role === 'core'));
  assert.match(source.resources.find((item) => item.id === 'JSIN-R2-W02-06').title, /template literals/i);
  assert.ok(week7.study.resources.some((item) => item.resourceId === 'JSIN-R2-W07-06' && item.role === 'core'));
  assert.match(week7.builds[0].brief, /Task title is required/);
  assert.match(week7.builds[0].brief, /Task 99 was not found/);

  const foundItContract = week8.builds[0].templates.find((item) => item.label === 'Exact FoundIt command and result contract');
  assert.ok(foundItContract);
  assert.match(foundItContract.content, /id: number/);
  assert.match(foundItContract.content, /status: "open" \| "claimed"/);
  assert.match(foundItContract.content, /node src\/cli\.js add "Blue backpack" "Main library" "Bag"/);
  assert.match(foundItContract.content, /description, location, and category/);
  assert.match(foundItContract.content, /Usage:/);
  const gitignore = week8.builds[0].templates.find((item) => item.label === 'Supplied .gitignore');
  assert.ok(gitignore);
  assert.match(gitignore.content, /^\.env/m);
  const capstoneSteps = week8.builds[0].steps.map((step) => step.text).join(' ');
  assert.match(capstoneSteps, /git status --short/);
  assert.match(capstoneSteps, /git rm --cached/);
});
