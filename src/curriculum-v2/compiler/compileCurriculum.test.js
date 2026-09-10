import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { compileCurriculum } from './compileCurriculum.js';
import { generateCoverage } from '../coverage/generateCoverage.js';
import { CurriculumValidationError } from '../validation/findings.js';

const sourcePath = new URL('../../../XcelerateAI Curriculum System/v2/examples/golden-curriculum/curriculum-source.json', import.meta.url);
const fixture = () => JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

test('valid source compiles deterministically with stable IDs preserved', () => {
  const source = fixture();
  const first = compileCurriculum(source);
  const second = compileCurriculum(structuredClone(source));
  assert.deepEqual(first, second);
  assert.equal(first.curriculumId, source.curriculumId);
  assert.deepEqual(first.weeks.map((week) => week.id), source.weeks.map((week) => week.id));
  assert.equal(first.indexes.buildsById['GOLDEN-B-W01-01'].id, 'GOLDEN-B-W01-01');
});

test('invalid source does not compile', () => {
  const source = fixture();
  source.weeks[0].skillCheck.questions.pop();
  assert.throws(() => compileCurriculum(source), CurriculumValidationError);
});

test('coverage derives taught, practiced, assessed, applied, project, and later reinforcement evidence', () => {
  const coverage = generateCoverage(fixture());
  const c1 = coverage.find((item) => item.competencyId === 'GOLDEN-C001');
  const c2 = coverage.find((item) => item.competencyId === 'GOLDEN-C002');
  assert.deepEqual(c1.taughtIn, ['GOLDEN-W01', 'GOLDEN-W02']);
  assert.ok(c2.practicedIn.includes('GOLDEN-W01'));
  assert.ok(c1.assessedIn.includes('GOLDEN-SC-W01'));
  assert.ok(c1.appliedIn.includes('GOLDEN-B-W01-01'));
  assert.ok(c1.projectUse.includes('GOLDEN-PJ01-M01'));
  assert.ok(c1.reinforcedIn.includes('GOLDEN-W02'));
});

test('compiler mechanically preserves learning UX fields and creates a concept index', () => {
  const source = fixture();
  source.concepts = [{ id: 'GOLDEN-CONCEPT-01', term: 'Observation', simpleMeaning: 'A fact you can inspect.', example: 'The response status was 500.', commonMistake: 'Replacing the fact with a conclusion.' }];
  source.weeks[0].study.resources[0].learningRole = 'learn';
  source.weeks[0].builds[0].learnerGuide = {
    summary: 'Create a controlled change record.',
    whyItMatters: 'It makes the evidence inspectable.',
    priorKnowledgeCompetencyIds: ['GOLDEN-C001'],
    finishedResult: 'A before-and-after record.',
    conceptRefs: [{ conceptId: 'GOLDEN-CONCEPT-01', relevance: 'The record begins with observable facts.' }],
    sessions: [
      { id: 'GOLDEN-SESSION-C01', title: 'Record', estimatedMinutes: 50, stepIds: ['GOLDEN-B-W01-01-S01'] },
      { id: 'GOLDEN-SESSION-C02', title: 'Compare', estimatedMinutes: 50, stepIds: ['GOLDEN-B-W01-01-S02'] },
    ],
  };
  const runtime = compileCurriculum(source);
  assert.deepEqual(runtime.concepts, source.concepts);
  assert.deepEqual(runtime.indexes.conceptsById['GOLDEN-CONCEPT-01'], source.concepts[0]);
  assert.equal(runtime.weeks[0].study.resources[0].learningRole, 'learn');
  assert.deepEqual(runtime.weeks[0].builds[0].learnerGuide, source.weeks[0].builds[0].learnerGuide);
});

test('compiler adds empty concept structures without inventing educational content', () => {
  const runtime = compileCurriculum(fixture());
  assert.deepEqual(runtime.concepts, []);
  assert.deepEqual(runtime.indexes.conceptsById, {});
  assert.equal(runtime.weeks[0].study.resources[0].learningRole, undefined);
  assert.equal(runtime.weeks[0].builds[0].learnerGuide, undefined);
});
