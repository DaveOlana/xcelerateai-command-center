import {
  BUILD_SESSION_TIME_TOLERANCE,
  RUNTIME_CONTRACT_VERSION,
  STUDY_LEARNING_ROLES,
} from '../schema/constants.js';
import { createFinding, createValidationReport, SEVERITIES } from './findings.js';
import { rejectUnknownProperties } from './objectShape.js';

const asArray = (value) => Array.isArray(value) ? value : [];
const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export function validateRuntimeCurriculum(runtime) {
  const findings = [];
  const add = (code, message, affectedIds = []) => findings.push(createFinding(code, SEVERITIES.BLOCKER, message, affectedIds));
  if (!isObject(runtime)) {
    add('V018-B001', 'Runtime curriculum must be an object.');
    return createValidationReport(runtime, findings);
  }
  if (runtime.runtimeContractVersion !== RUNTIME_CONTRACT_VERSION) add('V018-B002', `runtimeContractVersion must be "${RUNTIME_CONTRACT_VERSION}".`);
  if (!runtime.curriculumId || typeof runtime.curriculumId !== 'string') add('V018-B003', 'Runtime curriculum requires curriculumId.');
  if (!Number.isInteger(runtime.revision) || runtime.revision < 1) add('V018-B004', 'Runtime curriculum requires a positive revision.');
  if (!isObject(runtime.metadata)) add('V018-B005', 'Runtime curriculum requires metadata.');
  validateLearningExtensions(runtime, add);
  if (asArray(runtime.weeks).length === 0) add('V018-B006', 'Runtime curriculum requires at least one week.');
  const weekIds = new Set(asArray(runtime.weeks).map((week) => week?.id).filter(Boolean));
  if (weekIds.size !== asArray(runtime.weeks).length) add('V018-B007', 'Runtime week IDs must be present and unique.');
  for (const week of asArray(runtime.weeks)) {
    if (!week.study || !week.skillCheck || !Array.isArray(week.builds) || !week.proof || !week.reflection) {
      add('V018-B008', `Runtime Week "${week?.id || 'unknown'}" does not contain the complete learner journey.`, [week?.id]);
    }
  }
  const expectedIndexes = ['phasesById', 'competenciesById', 'resourcesById', 'weeksById', 'skillChecksById', 'buildsById', 'proofsById', 'projectsById'];
  expectedIndexes.forEach((key) => {
    if (!isObject(runtime.indexes?.[key])) add('V018-B009', `Runtime index "${key}" is missing.`);
  });
  asArray(runtime.projects).forEach((project) => asArray(project.milestones).forEach((milestone) => {
    const week = runtime.indexes?.weeksById?.[milestone.weekId];
    if (!week || !asArray(week.builds).some((build) => build.id === milestone.buildId)) {
      add('V018-B010', `Project milestone "${milestone.id}" does not resolve to its weekly Build.`, [project.id, milestone.id]);
    }
  }));
  return createValidationReport(runtime, findings);
}

function validateLearningExtensions(runtime, add) {
  const conceptsPresent = runtime.concepts !== undefined;
  const conceptIndexPresent = runtime.indexes?.conceptsById !== undefined;
  if (conceptsPresent !== conceptIndexPresent) {
    add('V018-B011', 'Runtime concepts and indexes.conceptsById must either both be present or both be absent.');
  }

  const concepts = conceptsPresent && Array.isArray(runtime.concepts) ? runtime.concepts : [];
  if (conceptsPresent && !Array.isArray(runtime.concepts)) add('V018-B012', 'Runtime concepts must be an array.');
  const conceptIds = new Set();
  concepts.forEach((concept, index) => {
    const label = `concepts[${index}]`;
    if (!isObject(concept)) return add('V018-B013', `${label} must be an object.`);
    rejectUnknownProperties(concept, ['id', 'term', 'simpleMeaning', 'example', 'commonMistake'], label, add, 'V018-B014');
    ['id', 'term', 'simpleMeaning', 'example', 'commonMistake'].forEach((key) => {
      if (!isNonEmptyString(concept[key])) add('V018-B015', `${label}.${key} must be a non-empty string.`, [concept.id]);
    });
    if (conceptIds.has(concept.id)) add('V018-B016', `Runtime concept ID "${concept.id}" is duplicated.`, [concept.id]);
    if (isNonEmptyString(concept.id)) conceptIds.add(concept.id);
  });

  if (conceptIndexPresent) {
    const index = runtime.indexes?.conceptsById;
    if (!isObject(index)) add('V018-B017', 'Runtime indexes.conceptsById must be an object.');
    else {
      const keys = Object.keys(index);
      if (keys.length !== conceptIds.size || keys.some((id) => !conceptIds.has(id))) {
        add('V018-B018', 'Runtime indexes.conceptsById must contain exactly the runtime concept IDs.');
      }
      concepts.forEach((concept) => {
        if (JSON.stringify(index[concept.id]) !== JSON.stringify(concept)) {
          add('V018-B019', `Runtime concept index entry "${concept.id}" does not match its concept.`, [concept.id]);
        }
      });
    }
  }

  const competencyIds = new Set(asArray(runtime.competencies).map((item) => item?.id).filter(Boolean));
  const orderedWeeks = [...asArray(runtime.weeks)].sort((a, b) => a.sequence - b.sequence);
  const availableCompetencyIds = new Set();
  orderedWeeks.forEach((week) => {
    asArray(week.study?.resources)
      .filter((assignment) => assignment?.role === 'core')
      .forEach((assignment) => asArray(assignment.competencyIds).forEach((id) => availableCompetencyIds.add(id)));

    asArray(week.study?.resources).forEach((assignment, index) => {
      const label = `Week "${week.id}" Study assignment ${index + 1}`;
      if (!isObject(assignment)) return;
      rejectUnknownProperties(assignment, ['id', 'resourceId', 'role', 'learningRole', 'competencyIds', 'purpose'], label, add, 'V018-B020');
      if (assignment.learningRole !== undefined && !STUDY_LEARNING_ROLES.includes(assignment.learningRole)) {
        add('V018-B021', `${label}.learningRole must be one of: ${STUDY_LEARNING_ROLES.join(', ')}.`, [week.id, assignment.resourceId]);
      }
    });

    asArray(week.builds).forEach((build) => validateRuntimeBuild(build, week, competencyIds, availableCompetencyIds, conceptIds, add));
  });
}

function validateRuntimeBuild(build, week, competencyIds, availableCompetencyIds, conceptIds, add) {
  if (!isObject(build)) return;
  const label = `Build "${build.id || 'unknown'}"`;
  rejectUnknownProperties(build, [
    'id', 'title', 'required', 'outcome', 'competencyIds', 'estimatedMinutes', 'brief',
    'steps', 'acceptanceCriteria', 'hints', 'templates', 'stretch', 'learnerGuide',
  ], label, add, 'V018-B022');
  if (build.learnerGuide === undefined) return;
  const guide = build.learnerGuide;
  if (!isObject(guide)) return add('V018-B023', `${label}.learnerGuide must be an object.`, [build.id]);
  rejectUnknownProperties(guide, ['summary', 'whyItMatters', 'priorKnowledgeCompetencyIds', 'finishedResult', 'conceptRefs', 'sessions'], `${label}.learnerGuide`, add, 'V018-B024');
  ['summary', 'whyItMatters', 'finishedResult'].forEach((key) => {
    if (!isNonEmptyString(guide[key])) add('V018-B025', `${label}.learnerGuide.${key} must be a non-empty string.`, [build.id]);
  });

  if (!Array.isArray(guide.priorKnowledgeCompetencyIds)) add('V018-B026', `${label}.learnerGuide.priorKnowledgeCompetencyIds must be an array.`, [build.id]);
  const priorIds = asArray(guide.priorKnowledgeCompetencyIds);
  validateUniqueReferences(priorIds, `${label} prior knowledge`, build.id, add);
  priorIds.forEach((id) => {
    if (!competencyIds.has(id)) add('V018-B027', `${label} references unknown prior competency "${id}".`, [build.id, id]);
    else if (!availableCompetencyIds.has(id)) add('V018-B028', `${label} references competency "${id}" before it is available in Week "${week.id}".`, [build.id, id]);
  });

  if (!Array.isArray(guide.conceptRefs)) add('V018-B029', `${label}.learnerGuide.conceptRefs must be an array.`, [build.id]);
  const referencedConceptIds = [];
  asArray(guide.conceptRefs).forEach((reference, index) => {
    const referenceLabel = `${label}.learnerGuide.conceptRefs[${index}]`;
    if (!isObject(reference)) return add('V018-B030', `${referenceLabel} must be an object.`, [build.id]);
    rejectUnknownProperties(reference, ['conceptId', 'relevance'], referenceLabel, add, 'V018-B031');
    if (!conceptIds.has(reference.conceptId)) add('V018-B032', `${referenceLabel} references unknown concept "${reference.conceptId}".`, [build.id, reference.conceptId]);
    if (!isNonEmptyString(reference.relevance)) add('V018-B033', `${referenceLabel}.relevance must be a non-empty string.`, [build.id]);
    referencedConceptIds.push(reference.conceptId);
  });
  validateUniqueReferences(referencedConceptIds, `${label} concept references`, build.id, add);

  if (!Array.isArray(guide.sessions)) add('V018-B034', `${label}.learnerGuide.sessions must be an array.`, [build.id]);
  const sessionIds = [];
  const referencedStepIds = [];
  const buildStepIds = new Set(asArray(build.steps).map((step) => step?.id).filter(Boolean));
  let sessionMinutes = 0;
  asArray(guide.sessions).forEach((session, index) => {
    const sessionLabel = `${label}.learnerGuide.sessions[${index}]`;
    if (!isObject(session)) return add('V018-B035', `${sessionLabel} must be an object.`, [build.id]);
    rejectUnknownProperties(session, ['id', 'title', 'estimatedMinutes', 'stepIds'], sessionLabel, add, 'V018-B036');
    if (!isNonEmptyString(session.id)) add('V018-B037', `${sessionLabel}.id must be a non-empty string.`, [build.id]);
    if (!isNonEmptyString(session.title)) add('V018-B038', `${sessionLabel}.title must be a non-empty string.`, [build.id]);
    if (!isPositiveNumber(session.estimatedMinutes)) add('V018-B039', `${sessionLabel}.estimatedMinutes must be positive.`, [build.id, session.id]);
    else sessionMinutes += session.estimatedMinutes;
    if (!Array.isArray(session.stepIds)) add('V018-B040', `${sessionLabel}.stepIds must be an array.`, [build.id, session.id]);
    asArray(session.stepIds).forEach((stepId) => {
      if (!buildStepIds.has(stepId)) add('V018-B041', `${sessionLabel} references step "${stepId}" outside this Build.`, [build.id, stepId]);
      referencedStepIds.push(stepId);
    });
    sessionIds.push(session.id);
  });
  validateUniqueReferences(sessionIds, `${label} session IDs`, build.id, add);
  validateUniqueReferences(referencedStepIds, `${label} session step references`, build.id, add);

  if (asArray(guide.sessions).length > 0) {
    buildStepIds.forEach((stepId) => {
      if (!referencedStepIds.includes(stepId)) add('V018-B042', `${label} sessions do not assign step "${stepId}".`, [build.id, stepId]);
    });
    if (isPositiveNumber(build.estimatedMinutes)) {
      const minimum = build.estimatedMinutes * (1 - BUILD_SESSION_TIME_TOLERANCE);
      const maximum = build.estimatedMinutes * (1 + BUILD_SESSION_TIME_TOLERANCE);
      if (sessionMinutes < minimum || sessionMinutes > maximum) {
        add('V018-B043', `${label} session total must be within ±${BUILD_SESSION_TIME_TOLERANCE * 100}% of its estimate.`, [build.id]);
      }
    }
  }
}

function validateUniqueReferences(values, label, ownerId, add) {
  const seen = new Set();
  values.filter(isNonEmptyString).forEach((value) => {
    if (seen.has(value)) add('V018-B044', `${label} contains duplicate "${value}".`, [ownerId, value]);
    seen.add(value);
  });
}

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const isPositiveNumber = (value) => typeof value === 'number' && Number.isFinite(value) && value > 0;
