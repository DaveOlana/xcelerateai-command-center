import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBuildSummary,
  calculateConsistency,
  calculateCourseProgress,
  calculateSkillSummary,
} from './progressCalculator.js';

const roadmap = {
  months: [
    {
      monthNumber: 1,
      weeks: [
        { weekNumber: 1, tasks: ['Required one', 'Required two', { title: 'Optional', required: false }] },
        { weekNumber: 2, tasks: ['Required three'] },
      ],
    },
  ],
  checkpoints: [{ skill: 'Objects' }, { skill: 'Loops' }, { skill: 'Functions' }],
  projects: [
    { name: 'One', milestones: ['A', 'B'] },
    { name: 'Two', milestones: ['C'] },
  ],
};

test('course progress is zero for a new learner and excludes optional activities', () => {
  assert.deepEqual(calculateCourseProgress(roadmap, {}), {
    percent: 0,
    activities: { completed: 0, total: 3 },
    weeks: { completed: 0, total: 2 },
    usesWeekFallback: false,
  });
});

test('course progress handles partial, completed-week, and completed-course states', () => {
  const partial = calculateCourseProgress(roadmap, {
    completedTasks: { m1_w1: [0, 2, 99] },
    completedWeeks: [1, 99],
  });
  assert.equal(partial.percent, 33);
  assert.deepEqual(partial.activities, { completed: 1, total: 3 });
  assert.deepEqual(partial.weeks, { completed: 1, total: 2 });

  const complete = calculateCourseProgress(roadmap, {
    completedTasks: { m1_w1: [0, 1], m1_w2: [0] },
    completedWeeks: [1, 2],
  });
  assert.equal(complete.percent, 100);
  assert.deepEqual(complete.activities, { completed: 3, total: 3 });
});

test('course progress has a safe completed-week fallback and no divide-by-zero', () => {
  const legacyRoadmap = { weeks: [{ weekNumber: 1 }, { weekNumber: 2 }] };
  assert.equal(calculateCourseProgress(legacyRoadmap, { completedWeeks: [1] }).percent, 50);
  assert.equal(calculateCourseProgress({}, {}).percent, 0);
});

test('skill summary supports legacy strings and object records', () => {
  const summary = calculateSkillSummary(roadmap, {
    Objects: 'Confident',
    Loops: { status: 'Learning', dateMarked: '2026-01-01' },
  });
  assert.deepEqual(summary, { confident: 1, developing: 1, notAssessed: 1, total: 3 });
});

test('build summary handles no projects, partial projects, and complete projects', () => {
  assert.deepEqual(calculateBuildSummary({}, {}), {
    projects: { completed: 0, total: 0 },
    milestones: { completed: 0, total: 0 },
  });
  assert.deepEqual(calculateBuildSummary(roadmap, {
    completedProjectMilestones: { 0: [0, 9], 1: [0] },
  }), {
    projects: { completed: 1, total: 2 },
    milestones: { completed: 2, total: 3 },
  });
});

test('consistency reports streaks and only trusted completed focus sessions this week', () => {
  const now = new Date('2026-09-02T12:00:00.000Z');
  const result = calculateConsistency(
    { currentStreak: 3, longestStreak: 8 },
    [
      {
        mode: 'Focus',
        status: 'completed',
        completedTimeBlock: true,
        durationSeconds: 1800,
        endedAt: '2026-09-01T12:00:00.000Z',
      },
      {
        mode: 'Break',
        status: 'completed',
        completedTimeBlock: true,
        durationSeconds: 600,
        endedAt: '2026-09-01T13:00:00.000Z',
      },
      {
        mode: 'Focus',
        status: 'completed',
        completedTimeBlock: true,
        durationSeconds: 900,
        endedAt: '2026-08-20T12:00:00.000Z',
      },
    ],
    now
  );
  assert.deepEqual(result, {
    currentStreak: 3,
    longestStreak: 8,
    sessionsThisWeek: 1,
    focusedSecondsThisWeek: 1800,
    hasTrustedSessionHistory: true,
  });
});

test('consistency remains truthful when no timer history exists', () => {
  assert.deepEqual(calculateConsistency({}, [], new Date('2026-09-02T12:00:00.000Z')), {
    currentStreak: 0,
    longestStreak: 0,
    sessionsThisWeek: 0,
    focusedSecondsThisWeek: 0,
    hasTrustedSessionHistory: false,
  });
});
