import test from 'node:test';
import assert from 'node:assert/strict';
import { quizPreviewFixture } from '../dev/quizPreviewFixture.js';
import {
  applyRecoveryInsight,
  applyRecoveryResourceReview,
  applySubmittedAttempt,
  createSubmittedAttempt,
  getAttemptReviewItems,
  getQuizValidationErrors,
  getSkillCheckDefinition,
  isRecoveryLocked,
  scoreQuiz,
} from './skillCheckUtils.js';
import {
  canMarkResourceComplete,
  getResourceIdentity,
  getStudyRequirementStatus,
  getWeekIdentity,
  recordResourceOpened,
} from './resourceActivity.js';
import { getWeekStepStatus } from './unlockChecker.js';
import { validateRoadmapJSON } from './jsonValidator.js';
import { normalizeRoadmap } from './normalizeRoadmap.js';

const correctAnswers = Object.fromEntries(
  quizPreviewFixture.questions.map((question) => [question.id, question.correctOptionId])
);

test('development fixture is a valid ten-question graded quiz', () => {
  assert.equal(quizPreviewFixture.questions.length, 10);
  assert.deepEqual(getQuizValidationErrors(quizPreviewFixture), []);
});

test('roadmap validation accepts valid quiz mode and rejects malformed quiz mode', () => {
  const roadmap = {
    schemaVersion: 'xcelerate-bootcamp-schema-v1',
    title: 'Quiz validation fixture',
    months: [{
      monthNumber: 1,
      title: 'Foundations',
      weeks: [{
        weekNumber: 1,
        title: 'Objects',
        studyResources: [{ id: 'objects-doc', title: 'Objects doc', url: 'https://example.com', required: true }],
        studyRequirement: { minimumCoreResources: 1 },
        skillCheck: quizPreviewFixture,
      }],
    }],
  };
  assert.equal(validateRoadmapJSON(roadmap).valid, true);
  const malformed = structuredClone(roadmap);
  malformed.months[0].weeks[0].skillCheck.questions.pop();
  const result = validateRoadmapJSON(malformed);
  assert.equal(result.valid, false);
  assert.equal(result.errors.some((error) => error.includes('exactly 10 questions')), true);
});

test('70 percent means seven of ten passes and six fails', () => {
  const sevenAnswers = Object.fromEntries(Object.entries(correctAnswers).slice(0, 7));
  const sixAnswers = Object.fromEntries(Object.entries(correctAnswers).slice(0, 6));
  assert.deepEqual(scoreQuiz(quizPreviewFixture, sevenAnswers), { score: 7, total: 10, percentage: 70, passed: true });
  assert.equal(scoreQuiz(quizPreviewFixture, sixAnswers).passed, false);
  assert.equal(scoreQuiz(quizPreviewFixture, Object.fromEntries(Object.entries(correctAnswers).slice(0, 9))).passed, true);
  assert.equal(scoreQuiz(quizPreviewFixture, {}).score, 0);
});

test('Core-count Study requires the configured minimum, not every Core resource', () => {
  const resources = [1, 2, 3, 4].map((number) => ({ id: `core-${number}`, title: `Core ${number}`, required: true }));
  const week = { studyResources: resources, studyRequirement: { minimumCoreResources: 2 } };
  assert.equal(getStudyRequirementStatus(week, { 'Core 1': 'Studied' }).satisfied, false);
  const satisfied = getStudyRequirementStatus(week, { 'Core 1': 'Studied', 'Core 2': 'Studied' });
  assert.equal(satisfied.satisfied, true);
  assert.equal(satisfied.completedCore, 2);
  assert.equal(satisfied.coreResources.length, 4);
});

test('legacy all-optional resource lists keep all-resources-required compatibility', () => {
  const week = { resources: [{ title: 'One' }, { title: 'Two', required: false }] };
  assert.equal(getStudyRequirementStatus(week, { One: 'Studied' }).satisfied, false);
  assert.equal(getStudyRequirementStatus(week, { One: 'Studied', Two: 'Studied' }).satisfied, true);
});

test('opening a new-mode resource records activity without completing Study status', () => {
  const resource = { title: 'Fallback identity' };
  const week = { weekNumber: 3, resources: [resource], studyRequirement: { minimumCoreResources: 1 } };
  const activity = recordResourceOpened({}, {
    roadmapId: 'roadmap',
    weekId: getWeekIdentity(week),
    resourceId: getResourceIdentity(resource, week),
    title: resource.title,
    openedAt: '2026-01-01T00:00:01.000Z',
  });
  assert.equal(getResourceIdentity(resource, week), 'week-3::Fallback identity');
  assert.equal(getStudyRequirementStatus(week, {}).completedCore, 0);
  assert.equal(canMarkResourceComplete({ week, resource, roadmapId: 'roadmap', resourceActivity: activity }), true);
});

test('failed reviews do not disclose answers while passed reviews do', () => {
  const failed = createSubmittedAttempt({ definition: quizPreviewFixture, answers: {}, attemptNumber: 1, submittedAt: '2026-01-01T00:00:01.000Z' });
  const passed = createSubmittedAttempt({ definition: quizPreviewFixture, answers: correctAnswers, attemptNumber: 2, submittedAt: '2026-01-01T00:00:02.000Z' });
  assert.equal('correctAnswer' in getAttemptReviewItems(failed)[0], false);
  assert.equal('explanation' in getAttemptReviewItems(failed)[0], false);
  assert.equal(getAttemptReviewItems(passed)[0].correctAnswer.length > 0, true);
});

test('two consecutive failures create a hard recovery lock that override cannot bypass', () => {
  const first = createSubmittedAttempt({ definition: quizPreviewFixture, answers: {}, attemptNumber: 1, submittedAt: '2026-01-01T00:00:01.000Z' });
  const second = createSubmittedAttempt({ definition: quizPreviewFixture, answers: {}, attemptNumber: 2, submittedAt: '2026-01-01T00:00:02.000Z' });
  const record = applySubmittedAttempt(applySubmittedAttempt(null, first), second);
  assert.equal(isRecoveryLocked(record), true);
  const status = getWeekStepStatus({
    week: { weekNumber: 1, skillCheck: quizPreviewFixture },
    weekNum: 1,
    monthNum: 1,
    settings: { manualOverrideEnabled: true },
    skillCheckAttempts: { roadmap: { [quizPreviewFixture.skillCheckId]: record } },
    roadmapId: 'roadmap',
  });
  assert.equal(status.recoveryLocked, true);
  assert.equal(status.practicalsUnlocked, false);
  assert.equal(status.weekCompleteUnlocked, false);
});

test('a pass resets the consecutive failure count and unlocks quiz progression', () => {
  const failed = createSubmittedAttempt({ definition: quizPreviewFixture, answers: {}, attemptNumber: 1, submittedAt: '2026-01-01T00:00:01.000Z' });
  const passed = createSubmittedAttempt({ definition: quizPreviewFixture, answers: correctAnswers, attemptNumber: 2, submittedAt: '2026-01-01T00:00:02.000Z' });
  const record = applySubmittedAttempt(applySubmittedAttempt(null, failed), passed);
  assert.equal(record.consecutiveFailures, 0);
  assert.equal(record.recovery, null);
  const status = getWeekStepStatus({
    week: { weekNumber: 1, skillCheck: quizPreviewFixture },
    weekNum: 1,
    monthNum: 1,
    settings: {},
    skillCheckAttempts: { roadmap: { [quizPreviewFixture.skillCheckId]: record } },
    roadmapId: 'roadmap',
  });
  assert.equal(status.skillCheckDone, true);
  assert.equal(status.practicalsUnlocked, true);
});

test('recovery requires both a post-lock resource open and a fresh general Study insight', () => {
  const first = createSubmittedAttempt({ definition: quizPreviewFixture, answers: {}, attemptNumber: 1, submittedAt: '2026-01-01T00:00:01.000Z' });
  const second = createSubmittedAttempt({ definition: quizPreviewFixture, answers: {}, attemptNumber: 2, submittedAt: '2026-01-01T00:00:02.000Z' });
  const locked = applySubmittedAttempt(applySubmittedAttempt(null, first), second);
  const reviewed = applyRecoveryResourceReview(locked, { resourceId: 'objects-video', reviewedAt: '2026-01-01T00:00:03.000Z' });
  assert.equal(isRecoveryLocked(reviewed), true);
  const recovered = applyRecoveryInsight(reviewed, {
    id: 'note-1',
    noteType: 'study_insight',
    insightScope: 'study',
    linkedResource: '',
    content: 'Objects group related state and behavior.',
    createdAt: '2026-01-01T00:00:04.000Z',
  });
  assert.equal(isRecoveryLocked(recovered), false);
  assert.equal(recovered.consecutiveFailures, 0);
});

test('pre-lock and non-general Study recovery actions do not qualify', () => {
  const first = createSubmittedAttempt({ definition: quizPreviewFixture, answers: {}, attemptNumber: 1, submittedAt: '2026-01-01T00:00:02.000Z' });
  const second = createSubmittedAttempt({ definition: quizPreviewFixture, answers: {}, attemptNumber: 2, submittedAt: '2026-01-01T00:00:03.000Z' });
  const locked = applySubmittedAttempt(applySubmittedAttempt(null, first), second);
  assert.strictEqual(applyRecoveryResourceReview(locked, { resourceId: 'old', reviewedAt: '2026-01-01T00:00:01.000Z' }), locked);
  for (const note of [
    { id: 'old', noteType: 'study_insight', insightScope: 'study', linkedResource: '', content: 'Old', createdAt: '2026-01-01T00:00:01.000Z' },
    { id: 'wrong', noteType: 'ordinary_note', insightScope: 'study', linkedResource: '', content: 'Wrong type', createdAt: '2026-01-01T00:00:04.000Z' },
    { id: 'resource', noteType: 'study_insight', insightScope: 'resource', linkedResource: 'Objects doc', content: 'Specific', createdAt: '2026-01-01T00:00:04.000Z' },
  ]) {
    assert.strictEqual(applyRecoveryInsight(locked, note), locked);
  }
});

test('legacy readiness still unlocks Build while quiz mode requires a passing attempt', () => {
  const legacy = getWeekStepStatus({
    week: { weekNumber: 1, skillCheck: ['Explain objects'] },
    weekNum: 1,
    monthNum: 1,
    skillChecks: { 1: { confirmed: true } },
    settings: {},
  });
  assert.equal(legacy.practicalsUnlocked, true);
  const quiz = getWeekStepStatus({
    week: { weekNumber: 1, skillCheck: quizPreviewFixture },
    weekNum: 1,
    monthNum: 1,
    skillChecks: { 1: { confirmed: true } },
    settings: {},
    roadmapId: 'roadmap',
  });
  assert.equal(quiz.skillCheckDone, false);
  assert.equal(quiz.practicalsUnlocked, false);
});

test('nested production Skill Check wrappers normalize and checkpoint strings remain valid', () => {
  const raw = {
    title: 'Wrapper fixture',
    months: [{
      monthNumber: 1,
      title: 'Foundations',
      weeks: [{
        weekNumber: 1,
        title: 'Objects',
        skillCheck: [{ ...quizPreviewFixture }],
      }],
    }],
  };
  const normalized = normalizeRoadmap(raw);
  const definition = getSkillCheckDefinition(normalized.weeks[0]);
  assert.equal(definition.mode, 'quiz');
  assert.equal(definition.questions.length, 10);
  assert.equal(getSkillCheckDefinition({ checkpoint: 'Explain an object.' }).questions[0].prompt, 'Explain an object.');
});

test('open-before-complete applies only to the new study requirement mode', () => {
  const resource = { id: 'objects-doc', title: 'Objects doc' };
  const legacyWeek = { weekNumber: 1, resources: [resource] };
  const modernWeek = { weekNumber: 1, resources: [resource], studyRequirement: { minimumCoreResources: 1 } };
  assert.equal(canMarkResourceComplete({ week: legacyWeek, resource, roadmapId: 'roadmap' }), true);
  assert.equal(canMarkResourceComplete({ week: modernWeek, resource, roadmapId: 'roadmap' }), false);
  const activity = recordResourceOpened({}, {
    roadmapId: 'roadmap',
    weekId: getWeekIdentity(modernWeek),
    resourceId: getResourceIdentity(resource, modernWeek),
    title: resource.title,
    openedAt: '2026-01-01T00:00:01.000Z',
  });
  assert.equal(canMarkResourceComplete({ week: modernWeek, resource, roadmapId: 'roadmap', resourceActivity: activity }), true);
});
