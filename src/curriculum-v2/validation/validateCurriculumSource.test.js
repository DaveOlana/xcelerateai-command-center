import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { validateCurriculumSource } from './validateCurriculumSource.js';

const sourcePath = new URL('../../../XcelerateAI Curriculum System/v2/examples/golden-curriculum/curriculum-source.json', import.meta.url);
const fixture = () => JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const codes = (source) => validateCurriculumSource(source).findings.map((finding) => finding.code);
const withLearningContract = () => {
  const source = fixture();
  source.concepts = [{
    id: 'GOLDEN-CONCEPT-OBSERVATION',
    term: 'Controlled observation',
    simpleMeaning: 'Compare results while changing one relevant factor.',
    example: 'Record a baseline, change one setting, then record the result.',
    commonMistake: 'Changing several factors before observing again.',
  }];
  source.weeks[0].study.resources[0].learningRole = 'learn';
  source.weeks[0].builds[0].learnerGuide = {
    summary: 'Make a clear record of one controlled comparison.',
    whyItMatters: 'A controlled comparison makes evidence easier to interpret.',
    priorKnowledgeCompetencyIds: ['GOLDEN-C001', 'GOLDEN-C002'],
    finishedResult: 'A short before-and-after change log.',
    conceptRefs: [{ conceptId: 'GOLDEN-CONCEPT-OBSERVATION', relevance: 'This Build depends on comparing two observable results.' }],
    sessions: [
      { id: 'GOLDEN-SESSION-01', title: 'Record the baseline', estimatedMinutes: 50, stepIds: ['GOLDEN-B-W01-01-S01'] },
      { id: 'GOLDEN-SESSION-02', title: 'Test the change', estimatedMinutes: 50, stepIds: ['GOLDEN-B-W01-01-S02'] },
    ],
  };
  return source;
};

test('valid Golden Curriculum Source passes strict validation', () => {
  const report = validateCurriculumSource(fixture());
  assert.equal(report.status, 'PASS');
  assert.equal(report.blockingFailures, 0);
});

test('missing required top-level field fails', () => {
  const source = fixture();
  delete source.target;
  assert.equal(validateCurriculumSource(source).status, 'FAIL');
});

test('legacy-only fields fail instead of being normalized', () => {
  const source = fixture();
  source.months = [];
  assert.ok(codes(source).includes('V001-B005'));
});

test('duplicate stable IDs fail', () => {
  const source = fixture();
  source.resources[1].id = source.resources[0].id;
  assert.ok(codes(source).includes('V002-B003'));
});

test('dangling references fail', () => {
  const source = fixture();
  source.weeks[0].phaseId = 'MISSING';
  assert.ok(codes(source).includes('V003-B001'));
});

test('self dependencies and competency cycles fail', () => {
  const source = fixture();
  source.competencies[0].prerequisiteIds = ['GOLDEN-C003'];
  assert.ok(codes(source).includes('V004-B002'));
  source.competencies[0].prerequisiteIds = ['GOLDEN-C001'];
  assert.ok(codes(source).includes('V004-B001'));
});

test('invalid Core minimum fails', () => {
  const source = fixture();
  source.weeks[0].study.coreMinimum = 3;
  assert.ok(codes(source).includes('V005-B004'));
});

for (const count of [9, 11]) {
  test(`${count}-question Skill Check fails`, () => {
    const source = fixture();
    if (count === 9) source.weeks[0].skillCheck.questions.pop();
    else source.weeks[0].skillCheck.questions.push({ ...source.weeks[0].skillCheck.questions[0], id: 'EXTRA-Q' });
    assert.ok(codes(source).includes('V006-B003'));
  });
}

test('three-option question fails', () => {
  const source = fixture();
  source.weeks[0].skillCheck.questions[0].options.pop();
  assert.ok(codes(source).includes('V006-B005'));
});

test('invalid correct option fails', () => {
  const source = fixture();
  source.weeks[0].skillCheck.questions[0].correctOptionId = 'missing';
  assert.ok(codes(source).includes('V006-B009'));
});

test('missing explanation fails', () => {
  const source = fixture();
  source.weeks[0].skillCheck.questions[0].explanation = '';
  assert.equal(validateCurriculumSource(source).status, 'FAIL');
});

test('unsupported Proof evidence type fails', () => {
  const source = fixture();
  source.weeks[0].proof.evidence[0].type = 'file';
  assert.equal(validateCurriculumSource(source).status, 'FAIL');
});

test('invalid Reflection minimum fails', () => {
  const source = fixture();
  source.weeks[0].reflection.minimumResponses = 3;
  assert.ok(codes(source).includes('V009-B002'));
});

test('bad Project milestone reference fails', () => {
  const source = fixture();
  source.projects[0].milestones[0].buildId = 'MISSING';
  assert.ok(codes(source).includes('V010-B003'));
});

test('Project Build must belong to referenced Week', () => {
  const source = fixture();
  source.projects[0].milestones[0].buildId = 'GOLDEN-B-W02-01';
  assert.ok(codes(source).includes('V010-B004'));
});

test('workload total and estimated duration use approved arithmetic', () => {
  const source = fixture();
  source.workload.estimatedTotalHours = 14;
  assert.ok(codes(source).includes('V014-B003'));
  source.workload.estimatedTotalHours = 12;
  source.workload.estimatedWeeks = 4;
  assert.ok(codes(source).includes('V014-B004'));
});

test('valid optional learning UX contract passes', () => {
  assert.equal(validateCurriculumSource(withLearningContract()).status, 'PASS');
});

test('concept IDs are globally unique and concept fields are required and closed', () => {
  const duplicate = withLearningContract();
  duplicate.concepts.push({ ...duplicate.concepts[0] });
  assert.ok(codes(duplicate).includes('V002-B003'));

  const missing = withLearningContract();
  delete missing.concepts[0].simpleMeaning;
  assert.equal(validateCurriculumSource(missing).status, 'FAIL');

  const unknown = withLearningContract();
  unknown.concepts[0].invented = true;
  assert.ok(codes(unknown).includes('V001-B026'));
});

test('learningRole accepts only learn, practice, or reference and Study assignments reject unknown fields', () => {
  for (const role of ['learn', 'practice', 'reference']) {
    const source = withLearningContract();
    source.weeks[0].study.resources[0].learningRole = role;
    assert.equal(validateCurriculumSource(source).status, 'PASS');
  }
  const invalid = withLearningContract();
  invalid.weeks[0].study.resources[0].learningRole = 'video';
  assert.equal(validateCurriculumSource(invalid).status, 'FAIL');
  const unknown = withLearningContract();
  unknown.weeks[0].study.resources[0].learnerPurpose = 'Not part of the contract';
  assert.ok(codes(unknown).includes('V001-B026'));
});

test('learnerGuide rejects unknown fields, concept errors, and unavailable competencies', () => {
  const missingRequired = withLearningContract();
  delete missingRequired.weeks[0].builds[0].learnerGuide.summary;
  assert.equal(validateCurriculumSource(missingRequired).status, 'FAIL');

  const unknownField = withLearningContract();
  unknownField.weeks[0].builds[0].learnerGuide.generatedExplanation = 'No';
  assert.ok(codes(unknownField).includes('V001-B026'));

  const unknownConcept = withLearningContract();
  unknownConcept.weeks[0].builds[0].learnerGuide.conceptRefs[0].conceptId = 'MISSING';
  assert.ok(codes(unknownConcept).includes('V003-B001'));

  const duplicateConcept = withLearningContract();
  duplicateConcept.weeks[0].builds[0].learnerGuide.conceptRefs.push({ ...duplicateConcept.weeks[0].builds[0].learnerGuide.conceptRefs[0] });
  assert.ok(codes(duplicateConcept).includes('V019-B006'));

  const unknownConceptRefField = withLearningContract();
  unknownConceptRefField.weeks[0].builds[0].learnerGuide.conceptRefs[0].generated = true;
  assert.ok(codes(unknownConceptRefField).includes('V001-B026'));

  const unknownCompetency = withLearningContract();
  unknownCompetency.weeks[0].builds[0].learnerGuide.priorKnowledgeCompetencyIds = ['MISSING'];
  assert.ok(codes(unknownCompetency).includes('V003-B001'));

  const futureCompetency = withLearningContract();
  futureCompetency.weeks[0].builds[0].learnerGuide.priorKnowledgeCompetencyIds = ['GOLDEN-C003'];
  assert.ok(codes(futureCompetency).includes('V019-B004'));

  const duplicateCompetency = withLearningContract();
  duplicateCompetency.weeks[0].builds[0].learnerGuide.priorKnowledgeCompetencyIds = ['GOLDEN-C001', 'GOLDEN-C001'];
  assert.ok(codes(duplicateCompetency).includes('V019-B003'));

  const unknownBuildField = withLearningContract();
  unknownBuildField.weeks[0].builds[0].generatedGuide = true;
  assert.ok(codes(unknownBuildField).includes('V001-B026'));
});

test('Build sessions require local unique complete step assignments and positive time', () => {
  const duplicateSession = withLearningContract();
  duplicateSession.weeks[0].builds[0].learnerGuide.sessions[1].id = 'GOLDEN-SESSION-01';
  assert.ok(codes(duplicateSession).includes('V002-B003'));

  const crossBuildStep = withLearningContract();
  crossBuildStep.weeks[0].builds[0].learnerGuide.sessions[0].stepIds = ['GOLDEN-B-W02-01-S01'];
  assert.ok(codes(crossBuildStep).includes('V019-B008'));

  const duplicateStep = withLearningContract();
  duplicateStep.weeks[0].builds[0].learnerGuide.sessions[1].stepIds.push('GOLDEN-B-W01-01-S01');
  assert.ok(codes(duplicateStep).includes('V019-B009'));

  const missingStep = withLearningContract();
  missingStep.weeks[0].builds[0].learnerGuide.sessions[1].stepIds = [];
  assert.ok(codes(missingStep).includes('V019-B010'));

  const nonPositive = withLearningContract();
  nonPositive.weeks[0].builds[0].learnerGuide.sessions[0].estimatedMinutes = 0;
  assert.equal(validateCurriculumSource(nonPositive).status, 'FAIL');

  const unknownSessionField = withLearningContract();
  unknownSessionField.weeks[0].builds[0].learnerGuide.sessions[0].completed = false;
  assert.ok(codes(unknownSessionField).includes('V001-B026'));
});

test('Build session totals use inclusive ±20% tolerance rather than exact equality', () => {
  for (const [first, second] of [[48, 48], [72, 72]]) {
    const source = withLearningContract();
    source.weeks[0].builds[0].learnerGuide.sessions[0].estimatedMinutes = first;
    source.weeks[0].builds[0].learnerGuide.sessions[1].estimatedMinutes = second;
    assert.equal(validateCurriculumSource(source).status, 'PASS');
  }
  for (const [first, second] of [[47, 48], [72, 73]]) {
    const source = withLearningContract();
    source.weeks[0].builds[0].learnerGuide.sessions[0].estimatedMinutes = first;
    source.weeks[0].builds[0].learnerGuide.sessions[1].estimatedMinutes = second;
    assert.ok(codes(source).includes('V019-B011'));
  }
});
