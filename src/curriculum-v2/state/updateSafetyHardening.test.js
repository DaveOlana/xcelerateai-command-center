import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { createCatalogEntry, createCurriculumCatalog } from '../catalog/publishCurriculum.js';
import { compileCurriculum } from '../compiler/compileCurriculum.js';
import { deriveV2CompetencyProgress } from '../runtime/competencyProgress.js';
import { getV2WeekProgress } from '../runtime/progression.js';
import { createSubmittedAttempt } from '../../utils/skillCheckUtils.js';
import { createV2BackupSlice, restoreV2BackupSlice } from './backupReconciliation.js';
import { activateCurriculumSelection, resolveActiveCurriculumId } from './curriculumSelection.js';
import {
  completeV2Resource,
  completeV2Week,
  EMPTY_V2_STATE_STORE,
  getCurriculumState,
  reconcileCurriculumState,
  recordV2RecoveryInsight,
  recordV2ResourceOpened,
  setV2BuildCompleted,
  setV2ProofEvidence,
  setV2ReflectionResponse,
  submitV2SkillCheckAttempt,
} from './learnerState.js';

const sourcePath = new URL('../../../XcelerateAI Curriculum System/v2/examples/golden-curriculum/curriculum-source.json', import.meta.url);
const fixture = () => JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const at = (minute) => `2026-01-01T00:${String(minute).padStart(2, '0')}:00.000Z`;

function deepReplace(value, from, to) {
  if (Array.isArray(value)) return value.map((entry) => deepReplace(entry, from, to));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, deepReplace(entry, from, to)]));
  return typeof value === 'string' ? value.replaceAll(from, to) : value;
}

function otherFixture() {
  return deepReplace(fixture(), 'GOLDEN', 'OTHER');
}

function runtime(source = fixture()) {
  return compileCurriculum(source);
}

function revision2(mutator) {
  const source = fixture();
  source.revision = 2;
  mutator(source);
  return runtime(source);
}

function replaceBuild(build, nextId) {
  const replacement = deepReplace(build, build.id, nextId);
  replacement.templates = replacement.templates.map((template, index) => ({ ...template, id: `${nextId}-T${index + 1}` }));
  return replacement;
}

function replaceRequiredBuild(source, weekIndex, nextId) {
  const previous = source.weeks[weekIndex].builds[0];
  source.weeks[weekIndex].builds[0] = replaceBuild(previous, nextId);
  source.projects.forEach((project) => project.milestones.forEach((milestone) => {
    if (milestone.buildId === previous.id) milestone.buildId = nextId;
  }));
}

function replacementResource(source, resourceIndex, nextId) {
  const previous = source.resources[resourceIndex];
  const replacement = { ...previous, id: nextId, title: `${previous.title} revision two` };
  source.resources[resourceIndex] = replacement;
  for (const week of source.weeks) {
    week.study.resources = week.study.resources.map((assignment) => assignment.resourceId === previous.id
      ? { ...assignment, resourceId: nextId }
      : assignment);
  }
  return replacement;
}

function addRequiredResource(source, weekIndex, resourceIndex, nextId) {
  const resource = { ...source.resources[resourceIndex], id: nextId, title: `Additional Core ${nextId}` };
  source.resources.push(resource);
  const week = source.weeks[weekIndex];
  week.study.resources.push({
    resourceId: resource.id,
    role: 'core',
    competencyIds: [...resource.competencyIds],
    purpose: 'Additional required revision material.',
  });
  week.study.coreMinimum += 1;
}

function replaceSkillCheck(source, weekIndex, nextId) {
  const previousId = source.weeks[weekIndex].skillCheck.id;
  source.weeks[weekIndex].skillCheck = deepReplace(source.weeks[weekIndex].skillCheck, previousId, nextId);
}

function replaceProof(source, weekIndex, nextId) {
  const previousId = source.weeks[weekIndex].proof.id;
  source.weeks[weekIndex].proof = deepReplace(source.weeks[weekIndex].proof, previousId, nextId);
}

function replaceReflection(source, weekIndex, prefix, minimumResponses = 2) {
  const reflection = source.weeks[weekIndex].reflection;
  reflection.prompts = reflection.prompts.map((prompt, index) => ({
    id: `${prefix}-${index + 1}`,
    prompt: `Revision two reflection prompt ${index + 1}`,
  }));
  reflection.minimumResponses = minimumResponses;
}

function satisfyStudy(store, compiled, weekId = 'GOLDEN-W01') {
  const week = compiled.indexes.weeksById[weekId];
  for (const assignment of week.study.resources.filter((entry) => entry.role === 'core').slice(0, week.study.coreMinimum)) {
    store = completeV2Resource(store, compiled, weekId, assignment.resourceId, at(1));
  }
  return store;
}

function passingAttempt(compiled, weekId, attemptId = 'passing-attempt') {
  const definition = compiled.indexes.weeksById[weekId].skillCheck;
  const answers = Object.fromEntries(definition.questions.map((question) => [question.id, question.correctOptionId]));
  return createSubmittedAttempt({ definition, answers, attemptNumber: 1, attemptId, submittedAt: at(2) });
}

function failingAttempt(compiled, weekId, attemptNumber) {
  const definition = compiled.indexes.weeksById[weekId].skillCheck;
  const answers = Object.fromEntries(definition.questions.map((question) => [
    question.id,
    question.options.find((option) => option.id !== question.correctOptionId).id,
  ]));
  return createSubmittedAttempt({
    definition,
    answers,
    attemptNumber,
    attemptId: `failed-attempt-${attemptNumber}`,
    submittedAt: at(6 + attemptNumber),
  });
}

function satisfySkillCheck(store, compiled, weekId = 'GOLDEN-W01') {
  const skillCheckId = compiled.indexes.weeksById[weekId].skillCheck.id;
  return submitV2SkillCheckAttempt(store, compiled, weekId, skillCheckId, passingAttempt(compiled, weekId));
}

function satisfyProof(store, compiled, weekId = 'GOLDEN-W01') {
  const proof = compiled.indexes.weeksById[weekId].proof;
  for (const evidence of proof.evidence.filter((entry) => entry.required)) {
    const value = evidence.type === 'confirmation' ? true : evidence.type === 'link' ? 'https://example.com/proof' : 'Meaningful proof evidence';
    store = setV2ProofEvidence(store, compiled, weekId, proof.id, evidence.id, value, at(4));
  }
  return store;
}

function satisfyReflection(store, compiled, weekId = 'GOLDEN-W01') {
  const reflection = compiled.indexes.weeksById[weekId].reflection;
  for (const prompt of reflection.prompts.slice(0, reflection.minimumResponses)) {
    store = setV2ReflectionResponse(store, compiled, weekId, prompt.id, 'A meaningful reflection response.', at(5));
  }
  return store;
}

function completeWeekOne(store, compiled) {
  store = satisfyStudy(store, compiled);
  store = satisfySkillCheck(store, compiled);
  store = setV2BuildCompleted(store, compiled, 'GOLDEN-W01', 'GOLDEN-B-W01-01', true, at(3));
  store = satisfyProof(store, compiled);
  store = satisfyReflection(store, compiled);
  return completeV2Week(store, compiled, 'GOLDEN-W01', at(6));
}

test('completed Week remains complete when revision adds Study, replaces Build, and changes Proof requirements', () => {
  const first = runtime();
  let store = completeWeekOne(reconcileCurriculumState(EMPTY_V2_STATE_STORE, first), first);
  const second = revision2((source) => {
    addRequiredResource(source, 0, 2, 'GOLDEN-R-W01-NEW');
    replaceRequiredBuild(source, 0, 'GOLDEN-B-W01-NEW');
    replaceProof(source, 0, 'GOLDEN-PR-W01-R2');
  });
  store = reconcileCurriculumState(store, second);
  const progress = getV2WeekProgress(second, getCurriculumState(store, 'GOLDEN'), 'GOLDEN-W01');
  assert.equal(progress.completed, true);
  assert.equal(progress.complete.done, true);
});

test('satisfied Build stage survives new required Build while unsatisfied Build uses latest rules', () => {
  const first = runtime();
  let satisfied = reconcileCurriculumState(EMPTY_V2_STATE_STORE, first);
  satisfied = setV2BuildCompleted(satisfied, first, 'GOLDEN-W01', 'GOLDEN-B-W01-01', true, at(3));
  let unsatisfied = reconcileCurriculumState(EMPTY_V2_STATE_STORE, first);
  const second = revision2((source) => {
    source.weeks[0].builds.push(replaceBuild(source.weeks[0].builds[0], 'GOLDEN-B-W01-NEW'));
  });
  satisfied = reconcileCurriculumState(satisfied, second);
  unsatisfied = reconcileCurriculumState(unsatisfied, second);
  assert.equal(getV2WeekProgress(second, getCurriculumState(satisfied, 'GOLDEN'), 'GOLDEN-W01').builds.done, true);
  assert.equal(getV2WeekProgress(second, getCurriculumState(unsatisfied, 'GOLDEN'), 'GOLDEN-W01').builds.done, false);
  unsatisfied = setV2BuildCompleted(unsatisfied, second, 'GOLDEN-W01', 'GOLDEN-B-W01-01', true, at(3));
  assert.equal(getV2WeekProgress(second, getCurriculumState(unsatisfied, 'GOLDEN'), 'GOLDEN-W01').builds.done, false);
});

test('satisfied Proof survives changed evidence while unsatisfied Proof uses latest requirements', () => {
  const first = runtime();
  let satisfied = satisfyProof(reconcileCurriculumState(EMPTY_V2_STATE_STORE, first), first);
  let unsatisfied = reconcileCurriculumState(EMPTY_V2_STATE_STORE, first);
  unsatisfied = setV2ProofEvidence(unsatisfied, first, 'GOLDEN-W01', 'GOLDEN-PR-W01', 'GOLDEN-PR-W01-E01', 'https://example.com/partial', at(4));
  const second = revision2((source) => replaceProof(source, 0, 'GOLDEN-PR-W01-R2'));
  satisfied = reconcileCurriculumState(satisfied, second);
  unsatisfied = reconcileCurriculumState(unsatisfied, second);
  assert.equal(getV2WeekProgress(second, getCurriculumState(satisfied, 'GOLDEN'), 'GOLDEN-W01').proof.done, true);
  assert.equal(getV2WeekProgress(second, getCurriculumState(unsatisfied, 'GOLDEN'), 'GOLDEN-W01').proof.done, false);
});

test('satisfied Reflection survives changed prompts and minimum while unsatisfied Reflection uses latest requirements', () => {
  const first = runtime();
  let satisfied = satisfyReflection(reconcileCurriculumState(EMPTY_V2_STATE_STORE, first), first);
  let unsatisfied = reconcileCurriculumState(EMPTY_V2_STATE_STORE, first);
  unsatisfied = setV2ReflectionResponse(unsatisfied, first, 'GOLDEN-W01', 'GOLDEN-RF-W01-01', 'short', at(5));
  const second = revision2((source) => replaceReflection(source, 0, 'GOLDEN-RF-W01-R2'));
  satisfied = reconcileCurriculumState(satisfied, second);
  unsatisfied = reconcileCurriculumState(unsatisfied, second);
  assert.equal(getV2WeekProgress(second, getCurriculumState(satisfied, 'GOLDEN'), 'GOLDEN-W01').reflection.done, true);
  assert.equal(getV2WeekProgress(second, getCurriculumState(unsatisfied, 'GOLDEN'), 'GOLDEN-W01').reflection.done, false);
});

test('unsatisfied Study requires replacement resource and satisfied Study remains durable', () => {
  const first = runtime();
  let unsatisfied = reconcileCurriculumState(EMPTY_V2_STATE_STORE, first);
  unsatisfied = completeV2Resource(unsatisfied, first, 'GOLDEN-W01', 'GOLDEN-R001', at(1));
  let satisfied = satisfyStudy(reconcileCurriculumState(EMPTY_V2_STATE_STORE, first), first);
  const second = revision2((source) => replacementResource(source, 0, 'GOLDEN-R001-R2'));
  unsatisfied = reconcileCurriculumState(unsatisfied, second);
  satisfied = reconcileCurriculumState(satisfied, second);
  const unsatisfiedProgress = getV2WeekProgress(second, getCurriculumState(unsatisfied, 'GOLDEN'), 'GOLDEN-W01');
  assert.equal(unsatisfiedProgress.study.done, false);
  assert.equal(unsatisfiedProgress.study.completedCore, 0);
  assert.equal(getV2WeekProgress(second, getCurriculumState(satisfied, 'GOLDEN'), 'GOLDEN-W01').study.done, true);
});

test('material competency replacement does not inherit evidence while same-ID display rename does', () => {
  const first = runtime();
  let store = satisfyStudy(reconcileCurriculumState(EMPTY_V2_STATE_STORE, first), first);
  const renamed = revision2((source) => { source.competencies[0].name = 'Renamed observation competency'; });
  const renamedProgress = deriveV2CompetencyProgress(renamed, getCurriculumState(reconcileCurriculumState(store, renamed), 'GOLDEN'));
  assert.notEqual(renamedProgress.find((entry) => entry.competencyId === 'GOLDEN-C001').status, 'not_started');

  const replacementSource = fixture();
  replacementSource.revision = 2;
  replacementSource.competencies[0] = { ...replacementSource.competencies[0], id: 'GOLDEN-C901', name: 'Record an observable problem' };
  replacementSource.competencies[1].prerequisiteIds = ['GOLDEN-C901'];
  replacementSource.resources = replacementSource.resources.map((resource) => ({
    ...resource,
    competencyIds: resource.competencyIds.map((id) => id === 'GOLDEN-C001' ? 'GOLDEN-C901' : id),
  }));
  replacementSource.weeks = replacementSource.weeks.map((week) => ({
    ...week,
    competencyIds: week.competencyIds.map((id) => id === 'GOLDEN-C001' ? 'GOLDEN-C901' : id),
    study: {
      ...week.study,
      resources: week.study.resources.map((assignment) => ({
        ...assignment,
        resourceId: assignment.resourceId === 'GOLDEN-R001' ? 'GOLDEN-R001-C901' : assignment.resourceId,
        competencyIds: assignment.competencyIds.map((id) => id === 'GOLDEN-C001' ? 'GOLDEN-C901' : id),
      })),
    },
    skillCheck: deepReplace(week.skillCheck, 'GOLDEN-C001', 'GOLDEN-C901'),
    builds: week.builds.map((build) => ({ ...build, competencyIds: build.competencyIds.map((id) => id === 'GOLDEN-C001' ? 'GOLDEN-C901' : id) })),
  }));
  replacementSource.resources[0] = { ...replacementSource.resources[0], id: 'GOLDEN-R001-C901' };
  replacementSource.projects = replacementSource.projects.map((project) => ({ ...project, competencyIds: project.competencyIds.map((id) => id === 'GOLDEN-C001' ? 'GOLDEN-C901' : id) }));
  replacementSource.graduation.requiredCompetencyIds = replacementSource.graduation.requiredCompetencyIds.map((id) => id === 'GOLDEN-C001' ? 'GOLDEN-C901' : id);
  const replaced = runtime(replacementSource);
  const replacedProgress = deriveV2CompetencyProgress(replaced, getCurriculumState(reconcileCurriculumState(store, replaced), 'GOLDEN'));
  assert.equal(replacedProgress.find((entry) => entry.competencyId === 'GOLDEN-C901').status, 'not_started');
});

test('Build title rename with stable buildId preserves completion', () => {
  const first = runtime();
  let store = setV2BuildCompleted(reconcileCurriculumState(EMPTY_V2_STATE_STORE, first), first, 'GOLDEN-W01', 'GOLDEN-B-W01-01', true, at(3));
  const second = revision2((source) => { source.weeks[0].builds[0].title = 'Renamed Controlled Change Log'; });
  store = reconcileCurriculumState(store, second);
  assert.ok(getCurriculumState(store, 'GOLDEN').builds['GOLDEN-B-W01-01'].completedAt);
  assert.equal(getV2WeekProgress(second, getCurriculumState(store, 'GOLDEN'), 'GOLDEN-W01').builds.done, true);
});

test('production backup slice restores revision-safe A state, independent B state, and active selection', () => {
  const firstA = runtime();
  const firstB = runtime(otherFixture());
  let store = satisfyStudy(reconcileCurriculumState(EMPTY_V2_STATE_STORE, firstA), firstA);
  store = satisfySkillCheck(store, firstA);
  store = setV2BuildCompleted(store, firstA, 'GOLDEN-W01', 'GOLDEN-B-W01-02', true, at(3));
  store = setV2ProofEvidence(store, firstA, 'GOLDEN-W01', 'GOLDEN-PR-W01', 'GOLDEN-PR-W01-E01', 'https://example.com/partial', at(4));
  store = setV2ReflectionResponse(store, firstA, 'GOLDEN-W01', 'GOLDEN-RF-W01-01', 'short', at(5));
  store = reconcileCurriculumState(store, firstB);
  store = satisfyStudy(store, firstB, 'OTHER-W01');
  store = submitV2SkillCheckAttempt(store, firstB, 'OTHER-W01', 'OTHER-SC-W01', failingAttempt(firstB, 'OTHER-W01', 1));
  store = submitV2SkillCheckAttempt(store, firstB, 'OTHER-W01', 'OTHER-SC-W01', failingAttempt(firstB, 'OTHER-W01', 2));
  store = recordV2ResourceOpened(store, firstB, 'OTHER-W01', 'OTHER-R001', { skillCheckId: 'OTHER-SC-W01', openedAt: at(9) });
  store = recordV2RecoveryInsight(store, firstB, 'OTHER-SC-W01', 'A fresh recovery insight for the next attempt.');
  const backup = JSON.parse(JSON.stringify(createV2BackupSlice(store, 'GOLDEN')));
  const secondA = revision2((source) => {
    replaceRequiredBuild(source, 0, 'GOLDEN-B-W01-R2');
    replaceProof(source, 0, 'GOLDEN-PR-W01-R2');
  });
  const catalog = createCurriculumCatalog([createCatalogEntry(secondA), createCatalogEntry(firstB)]);
  const restored = restoreV2BackupSlice(backup, catalog);
  const stateA = getCurriculumState(restored.stateStore, 'GOLDEN');
  const stateB = getCurriculumState(restored.stateStore, 'OTHER');
  const progressA = getV2WeekProgress(secondA, stateA, 'GOLDEN-W01');
  assert.equal(restored.activeCurriculumId, 'GOLDEN');
  assert.equal(stateA.lastSeenRevision, 2);
  assert.equal(progressA.study.done, true);
  assert.equal(progressA.skillCheck.done, true);
  assert.equal(progressA.builds.done, false);
  assert.equal(progressA.proof.done, false);
  assert.ok(stateA.resources['GOLDEN-W01']['GOLDEN-R001']);
  assert.equal(stateA.skillChecks['GOLDEN-SC-W01'].attempts.length, 1);
  assert.ok(stateA.builds['GOLDEN-B-W01-02']);
  assert.ok(stateA.proofs['GOLDEN-PR-W01'].evidence['GOLDEN-PR-W01-E01']);
  assert.ok(stateA.reflections['GOLDEN-W01']['GOLDEN-RF-W01-01']);
  assert.ok(stateB.resources['OTHER-W01']['OTHER-R001']);
  assert.equal(stateB.skillChecks['OTHER-SC-W01'].attempts.length, 2);
  assert.equal(stateB.skillChecks['OTHER-SC-W01'].consecutiveFailures, 2);
  assert.ok(stateB.skillChecks['OTHER-SC-W01'].recovery);
});

test('A to B to A selection resumes isolated progress without copying curriculum content', () => {
  const firstA = runtime();
  const firstB = runtime(otherFixture());
  const catalog = createCurriculumCatalog([createCatalogEntry(firstA), createCatalogEntry(firstB)]);
  let transition = activateCurriculumSelection(catalog, EMPTY_V2_STATE_STORE, 'GOLDEN');
  let store = completeV2Resource(transition.stateStore, firstA, 'GOLDEN-W01', 'GOLDEN-R001', at(1));
  transition = activateCurriculumSelection(catalog, store, 'OTHER');
  assert.equal(transition.activeCurriculumId, 'OTHER');
  store = completeV2Resource(transition.stateStore, firstB, 'OTHER-W01', 'OTHER-R002', at(2));
  transition = activateCurriculumSelection(catalog, store, 'GOLDEN');
  assert.equal(transition.activeCurriculumId, 'GOLDEN');
  assert.ok(getCurriculumState(transition.stateStore, 'GOLDEN').resources['GOLDEN-W01']['GOLDEN-R001']);
  assert.ok(getCurriculumState(transition.stateStore, 'OTHER').resources['OTHER-W01']['OTHER-R002']);
  assert.equal(getCurriculumState(transition.stateStore, 'GOLDEN').resources['OTHER-W01'], undefined);
  assert.equal('weeks' in getCurriculumState(transition.stateStore, 'GOLDEN'), false);
});

test('missing published selection clears active ID without deleting stored learner state', () => {
  const firstA = runtime();
  const firstB = runtime(otherFixture());
  let store = reconcileCurriculumState(EMPTY_V2_STATE_STORE, firstA);
  store = completeV2Resource(store, firstA, 'GOLDEN-W01', 'GOLDEN-R001', at(1));
  const catalogWithoutA = createCurriculumCatalog([createCatalogEntry(firstB)]);
  assert.equal(resolveActiveCurriculumId(catalogWithoutA, 'GOLDEN'), null);
  const restored = restoreV2BackupSlice(createV2BackupSlice(store, 'GOLDEN'), catalogWithoutA);
  assert.equal(restored.activeCurriculumId, null);
  assert.ok(getCurriculumState(restored.stateStore, 'GOLDEN').resources['GOLDEN-W01']['GOLDEN-R001']);
});

test('combined revision preserves past Study and Skill Check while applying latest Build and Proof', () => {
  const first = runtime();
  let store = satisfyStudy(reconcileCurriculumState(EMPTY_V2_STATE_STORE, first), first, 'GOLDEN-W02');
  store = satisfySkillCheck(store, first, 'GOLDEN-W02');
  const second = revision2((source) => {
    replacementResource(source, 3, 'GOLDEN-R004-R2');
    replaceSkillCheck(source, 1, 'GOLDEN-SC-W02-R2');
    replaceRequiredBuild(source, 1, 'GOLDEN-B-W02-R2');
    replaceProof(source, 1, 'GOLDEN-PR-W02-R2');
  });
  store = reconcileCurriculumState(store, second);
  const state = getCurriculumState(store, 'GOLDEN');
  const progress = getV2WeekProgress(second, state, 'GOLDEN-W02');
  assert.equal(Object.keys(store.curricula).length, 1);
  assert.equal(state.lastSeenRevision, 2);
  assert.equal(progress.study.done, true);
  assert.equal(progress.skillCheck.done, true);
  assert.equal(progress.builds.done, false);
  assert.equal(progress.proof.done, false);
  assert.equal(progress.builds.unlocked, true);
});
