import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { compileCurriculum } from '../compiler/compileCurriculum.js';
import { validateRuntimeCurriculum } from './validateRuntimeCurriculum.js';

const sourcePath = new URL('../../../XcelerateAI Curriculum System/v2/examples/golden-curriculum/curriculum-source.json', import.meta.url);
const revisionTwoRuntimePath = new URL('../test-fixtures/pyae-revision-2/curriculum.json', import.meta.url);
const fixture = () => JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const revisionTwoRuntime = () => JSON.parse(fs.readFileSync(revisionTwoRuntimePath, 'utf8'));

function enrichedRuntime() {
  const source = fixture();
  source.concepts = [{ id: 'GOLDEN-CONCEPT-RUNTIME', term: 'Observation', simpleMeaning: 'A fact you can inspect.', example: 'The status was 500.', commonMistake: 'Writing a conclusion instead.' }];
  source.weeks[0].study.resources[0].learningRole = 'reference';
  source.weeks[0].builds[0].learnerGuide = {
    summary: 'Create a controlled record.',
    whyItMatters: 'The record keeps evidence inspectable.',
    priorKnowledgeCompetencyIds: ['GOLDEN-C001'],
    finishedResult: 'A before-and-after record.',
    conceptRefs: [{ conceptId: 'GOLDEN-CONCEPT-RUNTIME', relevance: 'The Build starts with an observable fact.' }],
    sessions: [
      { id: 'GOLDEN-RUNTIME-SESSION-01', title: 'Record', estimatedMinutes: 50, stepIds: ['GOLDEN-B-W01-01-S01'] },
      { id: 'GOLDEN-RUNTIME-SESSION-02', title: 'Compare', estimatedMinutes: 50, stepIds: ['GOLDEN-B-W01-01-S02'] },
    ],
  };
  return compileCurriculum(source);
}

test('runtime validation accepts valid optional learning structures', () => {
  assert.equal(validateRuntimeCurriculum(enrichedRuntime()).status, 'PASS');
});

test('existing PYAE Revision 2 runtime remains valid without optional learning structures', () => {
  const runtime = revisionTwoRuntime();
  assert.equal(runtime.curriculumId, 'PYAE');
  assert.equal(runtime.revision, 2);
  assert.equal(runtime.concepts, undefined);
  assert.equal(validateRuntimeCurriculum(runtime).status, 'PASS');
});

test('runtime validation rejects corrupt concept indexes and invalid learning roles', () => {
  const badIndex = enrichedRuntime();
  delete badIndex.indexes.conceptsById['GOLDEN-CONCEPT-RUNTIME'];
  assert.equal(validateRuntimeCurriculum(badIndex).status, 'FAIL');

  const badRole = enrichedRuntime();
  badRole.weeks[0].study.resources[0].learningRole = 'documentation';
  assert.equal(validateRuntimeCurriculum(badRole).status, 'FAIL');
});

test('runtime validation rejects invalid learner references, session membership, and tolerance', () => {
  const badConcept = enrichedRuntime();
  badConcept.weeks[0].builds[0].learnerGuide.conceptRefs[0].conceptId = 'MISSING';
  assert.equal(validateRuntimeCurriculum(badConcept).status, 'FAIL');

  const badCompetency = enrichedRuntime();
  badCompetency.weeks[0].builds[0].learnerGuide.priorKnowledgeCompetencyIds = ['GOLDEN-C003'];
  assert.equal(validateRuntimeCurriculum(badCompetency).status, 'FAIL');

  const badStep = enrichedRuntime();
  badStep.weeks[0].builds[0].learnerGuide.sessions[0].stepIds = ['GOLDEN-B-W02-01-S01'];
  assert.equal(validateRuntimeCurriculum(badStep).status, 'FAIL');

  const badTolerance = enrichedRuntime();
  badTolerance.weeks[0].builds[0].learnerGuide.sessions[0].estimatedMinutes = 10;
  badTolerance.weeks[0].builds[0].learnerGuide.sessions[1].estimatedMinutes = 10;
  assert.equal(validateRuntimeCurriculum(badTolerance).status, 'FAIL');
});

test('runtime optional contract structures reject unknown properties', () => {
  const runtime = enrichedRuntime();
  runtime.weeks[0].builds[0].learnerGuide.generated = true;
  assert.equal(validateRuntimeCurriculum(runtime).status, 'FAIL');
});
