import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareSkillCheckAttempt } from '../src/utils/skillCheckUtils.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const portfolioRoot = path.join(root, 'XcelerateAI Curriculum System', 'v2', 'curricula', 'introductory-computer-science');
const guideRoot = path.join(root, 'public', 'curriculum-guides');
const catalogPath = path.join(root, 'src', 'curriculum-v2', 'catalog', 'catalog.js');
const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));
const manifest = readJson(path.join(portfolioRoot, 'portfolio-manifest.json'));
const candidateIds = new Set(['QBAS', 'JAVA', 'CLNG', 'CPPL', 'JSIN', 'PYIN', 'WEBD']);
const escapeHtml = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

assert.equal(manifest.publicationPolicy, 'candidate-only-until-owner-review');
assert.equal(manifest.courses.length, 7);
assert.deepEqual(new Set(manifest.courses.map((course) => course.curriculumId)), candidateIds);

for (const course of manifest.courses) {
  const dir = path.join(root, course.artifactPath);
  const source = readJson(path.join(dir, 'curriculum-source.json'));
  const audit = readJson(path.join(dir, 'content-integrity-audit.json'));
  const report = readJson(path.join(dir, 'validation-report.json'));
  const guide = fs.readFileSync(path.join(guideRoot, `${course.slug}.html`), 'utf8');

  assert.equal(source.curriculumId, course.curriculumId);
  assert.equal(source.revision, 1);
  assert.equal(source.weeks.length, 8);
  assert.equal(source.workload.estimatedWeeks, 8);
  assert.equal(source.workload.estimatedTotalHours, 48);
  assert.equal(source.weeks.reduce((hours, week) => hours + week.estimatedHours, 0), 48);
  assert.ok(source.setup.estimatedMinutes >= 120 && source.setup.estimatedMinutes <= 240);
  assert.ok(source.setup.capabilities.every((capability) => capability.skippableWhenVerified === true));
  assert.equal(source.resources.length, 16);
  assert.equal(source.projects.length, 2);

  const answerKeys = new Set();
  for (const [weekIndex, week] of source.weeks.entries()) {
    const weekStart = guide.indexOf(`<section id="week-${weekIndex + 1}">`);
    const nextWeekStart = guide.indexOf(`<section id="week-${weekIndex + 2}">`);
    const weekGuide = guide.slice(weekStart, nextWeekStart === -1 ? undefined : nextWeekStart);
    assert.ok(weekStart >= 0);
    assert.equal(week.study.coreMinimum, 1);
    assert.equal(week.study.resources.length, 2);
    assert.equal(week.study.resources[0].role, 'core');
    assert.equal(week.study.resources[0].learningRole, 'learn');
    assert.equal(week.study.resources[1].role, 'optional');
    assert.equal(week.study.resources[1].learningRole, 'practice');
    assert.equal(week.skillCheck.passingScore, 70);
    assert.equal(week.skillCheck.optionOrder, 'shuffle-per-attempt');
    assert.equal(week.skillCheck.questions.length, 10);
    assert.equal(new Set(week.skillCheck.questions.map((question) => question.prompt)).size, 10);
    assert.equal(new Set(week.skillCheck.questions.map((question) => question.options.map((option) => option.label).sort().join('|'))).size, 10);
    const definition = { ...week.skillCheck, mode: 'quiz', skillCheckId: week.skillCheck.id, questions: week.skillCheck.questions.map((question) => ({ ...question, type: 'multiple_choice' })) };
    const firstAttempt = prepareSkillCheckAttempt(definition, 1);
    const restoredFirstAttempt = prepareSkillCheckAttempt(definition, 1);
    const secondAttempt = prepareSkillCheckAttempt(definition, 2);
    assert.deepEqual(firstAttempt, restoredFirstAttempt);
    firstAttempt.questions.forEach((question, questionIndex) => {
      assert.notDeepEqual(question.options.map((option) => option.id), definition.questions[questionIndex].options.map((option) => option.id));
      assert.notDeepEqual(question.options.map((option) => option.id), secondAttempt.questions[questionIndex].options.map((option) => option.id));
      assert.equal(question.correctOptionId, definition.questions[questionIndex].correctOptionId);
      question.options.forEach((option) => assert.ok(weekGuide.includes(escapeHtml(option.label)), `${question.id} option is not taught in its weekly guide`));
    });
    for (const attempt of [firstAttempt, secondAttempt]) {
      const positions = attempt.questions.map((question) => question.options.findIndex((option) => option.id === question.correctOptionId));
      assert.deepEqual(new Set(positions), new Set([0, 1, 2, 3]));
    }
    assert.equal(week.builds.length, 1);
    assert.equal(week.builds[0].required, true);
    assert.match(week.builds[0].brief, /^Deliverable:/);
    assert.match(week.builds[0].steps[0].text, /normal case, one boundary case, and one invalid case/);
    assert.match(week.builds[0].acceptanceCriteria.map((item) => item.text).join(' '), /normal, boundary, and invalid/);
    assert.match(week.builds[0].templates[0].content, /\| Normal \|/);
    assert.ok(week.builds[0].learnerGuide.sessions.every((session) => session.estimatedMinutes <= 120));
    answerKeys.add(week.skillCheck.questions.map((question) => question.correctOptionId).join(''));
    const weekAudit = audit.questionAudits.filter((record) => record.weekId === week.id);
    assert.equal(weekAudit.length, 10);
    weekAudit.forEach((record, index) => assert.match(record.evidence, new RegExp(`#week-${weekIndex + 1}-concept-${Math.floor(index / 2) + 1}`)));
  }

  assert.equal(answerKeys.size, 8);
  assert.equal(audit.questionAudits.length, 80);
  assert.equal(audit.resourceAudits.length, 16);
  assert.equal(audit.buildAudits.length, 8);
  assert.equal(audit.weekReadiness.length, 8);
  assert.equal(audit.semanticReview.status, 'PASS');
  assert.equal(report.status, 'PASS');
  assert.equal(report.candidateOnly, true);
  assert.equal(report.published, false);
  assert.equal((guide.match(/<section id="setup">/g) || []).length, 1);
  assert.equal((guide.match(/<section id="week-/g) || []).length, 8);
  assert.equal((guide.match(/id="week-\d+-concept-\d+"/g) || []).length, 40);
  assert.equal((guide.match(/<details>/g) || []).length, 40);
  assert.equal((guide.match(/Optional authority reference:/g) || []).length, 8);
  assert.equal((guide.match(/Build contract preview/g) || []).length, 8);

  if (course.curriculumId === 'QBAS') {
    assert.equal(course.status, 'blocked-candidate');
    assert.match(course.blockedReason, /learner-supplied licensed/i);
  } else {
    assert.equal(course.status, 'review-candidate');
    assert.equal(course.blockedReason, null);
  }
}

const catalog = fs.readFileSync(catalogPath, 'utf8');
for (const id of candidateIds) assert.doesNotMatch(catalog, new RegExp(`['\"]${id}['\"]`));

console.log('Introductory portfolio audit: 7/7 candidates passed; production catalog unchanged; QBASIC remains blocked.');
