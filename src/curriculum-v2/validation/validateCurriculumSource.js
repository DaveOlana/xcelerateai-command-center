import {
  BUILD_SESSION_TIME_TOLERANCE,
  COMPETENCY_IMPORTANCE,
  PROOF_EVIDENCE_TYPES,
  REJECTED_LEGACY_FIELDS,
  RESOURCE_COSTS,
  RESOURCE_FORMATS,
  SOURCE_SCHEMA_VERSION,
  STUDY_LEARNING_ROLES,
  STUDY_ROLES,
} from '../schema/constants.js';
import { createFinding, createValidationReport, SEVERITIES } from './findings.js';
import { rejectUnknownProperties } from './objectShape.js';

const REQUIRED_TOP_LEVEL = [
  'schemaVersion', 'curriculumId', 'revision', 'title', 'shortTitle', 'target', 'workload',
  'assumptions', 'phases', 'competencies', 'resources', 'weeks', 'projects', 'graduation',
];
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]*$/;

const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const asArray = (value) => Array.isArray(value) ? value : [];

export function validateCurriculumSource(source) {
  const findings = [];
  const add = (code, message, affectedIds = [], severity = SEVERITIES.BLOCKER) => {
    findings.push(createFinding(code, severity, message, affectedIds));
  };

  if (!isObject(source)) {
    add('V001-B001', 'Curriculum Source must be a JSON object.');
    return createValidationReport(source, findings);
  }

  REQUIRED_TOP_LEVEL.forEach((field) => {
    if (!(field in source)) add('V001-B002', `Required top-level field "${field}" is missing.`);
  });
  if (source.schemaVersion !== SOURCE_SCHEMA_VERSION) add('V001-B003', `schemaVersion must be "${SOURCE_SCHEMA_VERSION}".`);
  validateId(source.curriculumId, 'curriculumId', add, 'V002-B001');
  if (!Number.isInteger(source.revision) || source.revision < 1) add('V001-B004', 'revision must be a positive integer.');
  requireString(source.title, 'title', add);
  requireString(source.shortTitle, 'shortTitle', add);

  findRejectedLegacyFields(source).forEach(({ path, key }) => {
    add('V001-B005', `Legacy field "${key}" is not allowed in Curriculum Source V2 at ${path}.`);
  });

  validateTarget(source.target, add);
  validateWorkloadShape(source.workload, add);
  if (!Array.isArray(source.assumptions) || source.assumptions.some((item) => !isNonEmptyString(item))) {
    add('V001-B006', 'assumptions must be an array of non-empty strings.');
  }

  const phases = validateCollection(source.phases, 'phases', add);
  const competencies = validateCollection(source.competencies, 'competencies', add);
  const concepts = validateCollection(source.concepts ?? [], 'concepts', add, true);
  const resources = validateCollection(source.resources, 'resources', add, true);
  const weeks = validateCollection(source.weeks, 'weeks', add);
  const projects = validateCollection(source.projects, 'projects', add, true);

  const identityRegistry = new Map();
  const registerId = (id, label, code = 'V002-B002') => {
    if (!validateId(id, label, add, code)) return;
    const normalized = String(id);
    if (identityRegistry.has(normalized)) {
      add('V002-B003', `Duplicate stable ID "${normalized}" is used by ${identityRegistry.get(normalized)} and ${label}.`, [normalized]);
    } else {
      identityRegistry.set(normalized, label);
    }
  };

  concepts.forEach((concept, index) => {
    const label = `concepts[${index}]`;
    if (!isObject(concept)) return add('V019-B001', `${label} must be an object.`);
    rejectUnknownProperties(concept, ['id', 'term', 'simpleMeaning', 'example', 'commonMistake'], label, add);
    registerId(concept.id, label);
    ['term', 'simpleMeaning', 'example', 'commonMistake'].forEach((key) => requireString(concept[key], `${label}.${key}`, add));
  });

  phases.forEach((phase, index) => {
    const label = `phases[${index}]`;
    if (!isObject(phase)) return add('V001-B007', `${label} must be an object.`);
    registerId(phase.id, label);
    requireString(phase.title, `${label}.title`, add);
    requireString(phase.outcome, `${label}.outcome`, add);
  });

  competencies.forEach((competency, index) => {
    const label = `competencies[${index}]`;
    if (!isObject(competency)) return add('V001-B008', `${label} must be an object.`);
    registerId(competency.id, label);
    requireString(competency.name, `${label}.name`, add);
    requireString(competency.description, `${label}.description`, add);
    requireString(competency.domain, `${label}.domain`, add);
    requireEnum(competency.importance, COMPETENCY_IMPORTANCE, `${label}.importance`, add);
    requireIdArray(competency.prerequisiteIds, `${label}.prerequisiteIds`, add);
  });

  resources.forEach((resource, index) => {
    const label = `resources[${index}]`;
    if (!isObject(resource)) return add('V001-B009', `${label} must be an object.`);
    registerId(resource.id, label);
    requireString(resource.title, `${label}.title`, add);
    requireString(resource.url, `${label}.url`, add);
    requireString(resource.provider, `${label}.provider`, add);
    requireEnum(resource.format, RESOURCE_FORMATS, `${label}.format`, add);
    requireEnum(resource.cost, RESOURCE_COSTS, `${label}.cost`, add);
    requirePositiveNumber(resource.estimatedMinutes, `${label}.estimatedMinutes`, add);
    requireIdArray(resource.competencyIds, `${label}.competencyIds`, add, false);
    requireString(resource.whySelected, `${label}.whySelected`, add);
    if (resource.location !== undefined) validateLocation(resource.location, `${label}.location`, add);
  });

  const phaseIds = new Set(phases.map((item) => item?.id).filter(Boolean));
  const competencyIds = new Set(competencies.map((item) => item?.id).filter(Boolean));
  const resourceIds = new Set(resources.map((item) => item?.id).filter(Boolean));
  const conceptIds = new Set(concepts.map((item) => item?.id).filter(Boolean));
  const weekIds = new Set();
  const buildToWeek = new Map();
  const skillCheckIds = new Set();
  const proofIds = new Set();
  const sequences = new Set();

  weeks.forEach((week, index) => {
    const label = `weeks[${index}]`;
    if (!isObject(week)) return add('V001-B010', `${label} must be an object.`);
    registerId(week.id, label);
    if (week.id) weekIds.add(week.id);
    if (!Number.isInteger(week.sequence) || week.sequence < 1) add('V001-B011', `${label}.sequence must be a positive integer.`, [week.id]);
    else if (sequences.has(week.sequence)) add('V001-B012', `Week sequence ${week.sequence} is duplicated.`, [week.id]);
    else sequences.add(week.sequence);
    if (index > 0 && Number.isInteger(weeks[index - 1]?.sequence) && week.sequence <= weeks[index - 1].sequence) {
      add('V001-B013', 'weeks must be authored in strictly increasing sequence order.', [weeks[index - 1]?.id, week.id]);
    }
    validateReference(week.phaseId, phaseIds, `${label}.phaseId`, add, week.id);
    requireString(week.title, `${label}.title`, add);
    requireString(week.outcome, `${label}.outcome`, add);
    requireIdArray(week.competencyIds, `${label}.competencyIds`, add, false);
    requirePositiveNumber(week.estimatedHours, `${label}.estimatedHours`, add);
    validateStudy(week.study, label, week, resourceIds, competencyIds, resources, registerId, add);
    validateSkillCheck(week.skillCheck, label, week, competencyIds, registerId, skillCheckIds, add);
    validateBuilds(
      week.builds,
      label,
      week,
      competencyIds,
      conceptIds,
      availableCompetenciesForWeek(weeks, week),
      registerId,
      buildToWeek,
      add,
    );
    validateProof(week.proof, label, week, registerId, proofIds, add);
    validateReflection(week.reflection, label, week, registerId, add);
  });

  validateReferences({ competencies, resources, weeks, projects, source, competencyIds, resourceIds, weekIds, buildToWeek, add });
  validateCompetencyGraph(competencies, competencyIds, add);
  validateTeachingOrder(weeks, resources, competencies, competencyIds, add);
  validateProjects(projects, weeks, weekIds, buildToWeek, competencyIds, registerId, add);
  validateGraduation(source.graduation, competencyIds, new Set(projects.map((item) => item?.id).filter(Boolean)), add);
  validateWorkloadArithmetic(source.workload, weeks, add);
  validateCurriculumSkillChecks(weeks, add);

  return createValidationReport(source, findings, {
    summary: {
      phases: phases.length,
      competencies: competencies.length,
      concepts: concepts.length,
      resources: resources.length,
      weeks: weeks.length,
      projects: projects.length,
    },
  });
}

function requireString(value, label, add) {
  if (!isNonEmptyString(value)) add('V001-B020', `${label} must be a non-empty string.`);
}

function validateId(value, label, add, code) {
  if (!isNonEmptyString(value) || !ID_PATTERN.test(value)) {
    add(code, `${label} must be a non-empty stable ID using letters, numbers, period, underscore, colon, or hyphen.`, value ? [value] : []);
    return false;
  }
  return true;
}

function validateCollection(value, label, add, allowEmpty = false) {
  if (!Array.isArray(value)) {
    add('V001-B021', `${label} must be an array.`);
    return [];
  }
  if (!allowEmpty && value.length === 0) add('V001-B022', `${label} must not be empty.`);
  return value;
}

function requireEnum(value, allowed, label, add) {
  if (!allowed.includes(value)) add('V001-B023', `${label} must be one of: ${allowed.join(', ')}.`);
}

function requireIdArray(value, label, add, allowEmpty = true) {
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0) || value.some((item) => !isNonEmptyString(item))) {
    add('V001-B024', `${label} must be ${allowEmpty ? 'an' : 'a non-empty'} array of stable IDs.`);
  }
}

function requirePositiveNumber(value, label, add) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) add('V001-B025', `${label} must be a positive number.`);
}

function validateReference(value, ids, label, add, ownerId) {
  if (!isNonEmptyString(value) || !ids.has(value)) add('V003-B001', `${label} references unknown ID "${value ?? ''}".`, [ownerId, value]);
}

function validateTarget(target, add) {
  if (!isObject(target)) return add('V001-B030', 'target must be an object.');
  ['role', 'learner', 'professionalOutcome'].forEach((key) => requireString(target[key], `target.${key}`, add));
  if (!Array.isArray(target.specialGoals) || target.specialGoals.some((item) => !isNonEmptyString(item))) {
    add('V001-B031', 'target.specialGoals must be an array of non-empty strings.');
  }
}

function validateWorkloadShape(workload, add) {
  if (!isObject(workload)) return add('V001-B032', 'workload must be an object.');
  if (!isObject(workload.weeklyHours)) add('V001-B033', 'workload.weeklyHours must be an object.');
  else {
    requirePositiveNumber(workload.weeklyHours.min, 'workload.weeklyHours.min', add);
    requirePositiveNumber(workload.weeklyHours.max, 'workload.weeklyHours.max', add);
    if (Number(workload.weeklyHours.min) > Number(workload.weeklyHours.max)) add('V014-B001', 'workload.weeklyHours.min cannot exceed max.');
  }
  requirePositiveNumber(workload.estimatedTotalHours, 'workload.estimatedTotalHours', add);
  if (!Number.isInteger(workload.estimatedWeeks) || workload.estimatedWeeks < 1) add('V014-B002', 'workload.estimatedWeeks must be a positive integer.');
}

function validateLocation(location, label, add) {
  if (!isObject(location)) return add('V001-B034', `${label} must be an object.`);
  const values = ['start', 'stop', 'note'].filter((key) => isNonEmptyString(location[key]));
  if (values.length === 0) add('V001-B035', `${label} must include at least one non-empty start, stop, or note value.`);
}

function validateStudy(study, label, week, resourceIds, competencyIds, resources, registerId, add) {
  if (!isObject(study)) return add('V005-B001', `${label}.study must be an object.`, [week.id]);
  requireString(study.objective, `${label}.study.objective`, add);
  if (!Number.isInteger(study.coreMinimum) || study.coreMinimum < 0) add('V005-B002', `${label}.study.coreMinimum must be a non-negative integer.`, [week.id]);
  const assignments = validateCollection(study.resources, `${label}.study.resources`, add, true);
  let coreCount = 0;
  assignments.forEach((assignment, index) => {
    const path = `${label}.study.resources[${index}]`;
    if (!isObject(assignment)) return add('V005-B003', `${path} must be an object.`, [week.id]);
    rejectUnknownProperties(assignment, ['id', 'resourceId', 'role', 'learningRole', 'competencyIds', 'purpose'], path, add);
    validateReference(assignment.resourceId, resourceIds, `${path}.resourceId`, add, week.id);
    requireEnum(assignment.role, STUDY_ROLES, `${path}.role`, add);
    if (assignment.learningRole !== undefined) requireEnum(assignment.learningRole, STUDY_LEARNING_ROLES, `${path}.learningRole`, add);
    if (assignment.role === 'core') coreCount += 1;
    requireIdArray(assignment.competencyIds, `${path}.competencyIds`, add, false);
    asArray(assignment.competencyIds).forEach((id) => validateReference(id, competencyIds, `${path}.competencyIds`, add, week.id));
    asArray(assignment.competencyIds).forEach((id) => {
      if (!asArray(week.competencyIds).includes(id)) add('V005-B006', `${path} maps competency "${id}" that is not declared by Week "${week.id}".`, [week.id, id]);
      const resource = resources.find((item) => item?.id === assignment.resourceId);
      if (resource && !asArray(resource.competencyIds).includes(id)) add('V005-B007', `${path} maps competency "${id}" that the referenced Resource does not support.`, [week.id, assignment.resourceId, id]);
    });
    requireString(assignment.purpose, `${path}.purpose`, add);
    if (assignment.id !== undefined) registerId(assignment.id, path);
  });
  if (Number.isInteger(study.coreMinimum) && study.coreMinimum > coreCount) {
    add('V005-B004', `${label}.study.coreMinimum (${study.coreMinimum}) exceeds its ${coreCount} Core resources.`, [week.id]);
  }
}

function validateSkillCheck(skillCheck, label, week, competencyIds, registerId, skillCheckIds, add) {
  if (!isObject(skillCheck)) return add('V006-B001', `${label}.skillCheck must be an object.`, [week.id]);
  registerId(skillCheck.id, `${label}.skillCheck`);
  if (skillCheck.id) skillCheckIds.add(skillCheck.id);
  requireString(skillCheck.title, `${label}.skillCheck.title`, add);
  requireString(skillCheck.instructions, `${label}.skillCheck.instructions`, add);
  if (!Number.isInteger(skillCheck.passingScore) || skillCheck.passingScore < 1 || skillCheck.passingScore > 100) {
    add('V006-B002', `${label}.skillCheck.passingScore must be an integer from 1 to 100.`, [skillCheck.id]);
  }
  requireIdArray(skillCheck.competencyIds, `${label}.skillCheck.competencyIds`, add, false);
  asArray(skillCheck.competencyIds).forEach((id) => validateReference(id, competencyIds, `${label}.skillCheck.competencyIds`, add, skillCheck.id));
  const questions = validateCollection(skillCheck.questions, `${label}.skillCheck.questions`, add, true);
  if (questions.length !== 10) add('V006-B003', `${label}.skillCheck must contain exactly 10 questions; found ${questions.length}.`, [skillCheck.id]);
  questions.forEach((question, index) => {
    const path = `${label}.skillCheck.questions[${index}]`;
    if (!isObject(question)) return add('V006-B004', `${path} must be an object.`, [skillCheck.id]);
    registerId(question.id, path);
    requireString(question.prompt, `${path}.prompt`, add);
    requireIdArray(question.competencyIds, `${path}.competencyIds`, add, false);
    asArray(question.competencyIds).forEach((id) => validateReference(id, competencyIds, `${path}.competencyIds`, add, question.id));
    const options = validateCollection(question.options, `${path}.options`, add, true);
    if (options.length !== 4) add('V006-B005', `${path} must contain exactly 4 options; found ${options.length}.`, [question.id]);
    const optionIds = new Set();
    options.forEach((option, optionIndex) => {
      const optionPath = `${path}.options[${optionIndex}]`;
      if (!isObject(option)) return add('V006-B006', `${optionPath} must be an object.`, [question.id]);
      if (!isNonEmptyString(option.id)) add('V006-B007', `${optionPath}.id must be non-empty.`, [question.id]);
      else if (optionIds.has(String(option.id))) add('V006-B008', `${path} contains duplicate option ID "${option.id}".`, [question.id]);
      else optionIds.add(String(option.id));
      requireString(option.label, `${optionPath}.label`, add);
    });
    if (!isNonEmptyString(question.correctOptionId) || !optionIds.has(String(question.correctOptionId))) {
      add('V006-B009', `${path}.correctOptionId must reference one of its four options.`, [question.id]);
    }
    requireString(question.explanation, `${path}.explanation`, add);
  });

  const seenPrompts = new Set();
  const optionSets = [];
  const correctCounts = {};
  const stemCounts = {};

  questions.forEach((question) => {
    if (!isObject(question)) return;
    const normPrompt = (question.prompt || '').trim().toLowerCase();
    if (seenPrompts.has(normPrompt)) {
      add('V006-B014', `Skill Check in "${week.id}" contains duplicate question prompt: "${question.prompt}".`, [question.id]);
    } else {
      seenPrompts.add(normPrompt);
    }

    const sortedOptionLabels = asArray(question.options).map((o) => (o?.label || '').trim().toLowerCase()).sort().join('|||');
    if (sortedOptionLabels && optionSets.includes(sortedOptionLabels)) {
      add('V006-B012', `Skill Check in "${week.id}" question "${question.id}" reuses identical option choices from another question (clone pair).`, [question.id]);
    } else if (sortedOptionLabels) {
      optionSets.push(sortedOptionLabels);
    }

    const key = (question.correctOptionId || '').toLowerCase();
    if (key) correctCounts[key] = (correctCounts[key] || 0) + 1;

    const stemMatch = (question.prompt || '').match(/(Which choice most directly created this failure\?|What is the primary cause of this failure\?)/i);
    if (stemMatch) {
      const stem = stemMatch[0].toLowerCase();
      stemCounts[stem] = (stemCounts[stem] || 0) + 1;
    }
  });

  if (questions.length === 10) {
    for (const [opt, count] of Object.entries(correctCounts)) {
      if (count > 5) {
        add('V006-B010', `Skill Check in "${week.id}" has excessive correct option concentration: "${opt}" is keyed ${count} of 10 times.`, [skillCheck.id]);
      }
    }
    const distinctKeys = Object.keys(correctCounts);
    if (distinctKeys.length < 3) {
      add('V006-B010', `Skill Check in "${week.id}" uses only ${distinctKeys.length} distinct correct option positions (${distinctKeys.join(', ')}); at least 3 positions required per week.`, [skillCheck.id]);
    }
    const keys = questions.map((q) => (q?.correctOptionId || '').toLowerCase());
    let alternating = keys.length === 10 && keys[0] !== keys[1];
    for (let i = 2; i < keys.length; i++) {
      if (keys[i] !== keys[i % 2]) {
        alternating = false;
        break;
      }
    }
    if (alternating) {
      add('V006-B011', `Skill Check in "${week.id}" has a deterministic alternating answer sequence (${keys.join(', ')}).`, [skillCheck.id]);
    }
  }

  for (const [stem, count] of Object.entries(stemCounts)) {
    if (count > 2) {
      add('V006-B013', `Skill Check in "${week.id}" repeats question stem "${stem}" ${count} times; maximum allowed is 2.`, [skillCheck.id]);
    }
  }
}

function validateBuilds(buildsValue, label, week, competencyIds, conceptIds, availableCompetencyIds, registerId, buildToWeek, add) {
  const builds = validateCollection(buildsValue, `${label}.builds`, add, true);
  builds.forEach((build, index) => {
    const path = `${label}.builds[${index}]`;
    if (!isObject(build)) return add('V007-B001', `${path} must be an object.`, [week.id]);
    rejectUnknownProperties(build, [
      'id', 'title', 'required', 'outcome', 'competencyIds', 'estimatedMinutes', 'brief',
      'steps', 'acceptanceCriteria', 'hints', 'templates', 'stretch', 'learnerGuide',
    ], path, add);
    registerId(build.id, path);
    if (build.id) buildToWeek.set(build.id, week.id);
    requireString(build.title, `${path}.title`, add);
    if (typeof build.required !== 'boolean') add('V007-B002', `${path}.required must be boolean.`, [build.id]);
    requireString(build.outcome, `${path}.outcome`, add);
    requireIdArray(build.competencyIds, `${path}.competencyIds`, add, false);
    asArray(build.competencyIds).forEach((id) => validateReference(id, competencyIds, `${path}.competencyIds`, add, build.id));
    requirePositiveNumber(build.estimatedMinutes, `${path}.estimatedMinutes`, add);
    requireString(build.brief, `${path}.brief`, add);
    validateTextItems(build.steps, `${path}.steps`, registerId, add, true);
    validateTextItems(build.acceptanceCriteria, `${path}.acceptanceCriteria`, registerId, add, false);
    if (!Array.isArray(build.hints) || build.hints.some((hint) => !isNonEmptyString(hint))) add('V007-B003', `${path}.hints must be an array of strings.`, [build.id]);
    const templates = validateCollection(build.templates, `${path}.templates`, add, true);
    templates.forEach((template, templateIndex) => {
      const templatePath = `${path}.templates[${templateIndex}]`;
      if (!isObject(template)) return add('V007-B004', `${templatePath} must be an object.`, [build.id]);
      rejectUnknownProperties(template, ['id', 'label', 'content'], templatePath, add);
      registerId(template.id, templatePath);
      requireString(template.label, `${templatePath}.label`, add);
      if (typeof template.content !== 'string') add('V007-B005', `${templatePath}.content must be a string.`, [template.id]);
    });
    if (build.stretch !== null && build.stretch !== undefined && !isNonEmptyString(build.stretch)) add('V007-B006', `${path}.stretch must be null or a non-empty string.`, [build.id]);
    if (build.learnerGuide !== undefined) {
      validateLearnerGuide(build.learnerGuide, path, build, competencyIds, conceptIds, availableCompetencyIds, registerId, add);
    }
  });
}

function validateLearnerGuide(guide, buildPath, build, competencyIds, conceptIds, availableCompetencyIds, registerId, add) {
  const label = `${buildPath}.learnerGuide`;
  if (!isObject(guide)) return add('V019-B002', `${label} must be an object.`, [build.id]);
  rejectUnknownProperties(guide, ['summary', 'whyItMatters', 'priorKnowledgeCompetencyIds', 'finishedResult', 'conceptRefs', 'sessions'], label, add);
  requireString(guide.summary, `${label}.summary`, add);
  requireString(guide.whyItMatters, `${label}.whyItMatters`, add);
  requireString(guide.finishedResult, `${label}.finishedResult`, add);

  requireIdArray(guide.priorKnowledgeCompetencyIds, `${label}.priorKnowledgeCompetencyIds`, add);
  const priorIds = asArray(guide.priorKnowledgeCompetencyIds);
  rejectDuplicates(priorIds, `${label}.priorKnowledgeCompetencyIds`, add, 'V019-B003', build.id);
  priorIds.forEach((id) => {
    validateReference(id, competencyIds, `${label}.priorKnowledgeCompetencyIds`, add, build.id);
    if (competencyIds.has(id) && !availableCompetencyIds.has(id)) {
      add('V019-B004', `${label} references competency "${id}" before it is available to the learner.`, [build.id, id]);
    }
  });

  const conceptRefs = validateCollection(guide.conceptRefs, `${label}.conceptRefs`, add, true);
  const referencedConceptIds = [];
  conceptRefs.forEach((reference, index) => {
    const path = `${label}.conceptRefs[${index}]`;
    if (!isObject(reference)) return add('V019-B005', `${path} must be an object.`, [build.id]);
    rejectUnknownProperties(reference, ['conceptId', 'relevance'], path, add);
    validateReference(reference.conceptId, conceptIds, `${path}.conceptId`, add, build.id);
    requireString(reference.relevance, `${path}.relevance`, add);
    referencedConceptIds.push(reference.conceptId);
  });
  rejectDuplicates(referencedConceptIds, `${label}.conceptRefs`, add, 'V019-B006', build.id);

  const sessions = validateCollection(guide.sessions, `${label}.sessions`, add, true);
  const buildStepIds = new Set(asArray(build.steps).map((step) => step?.id).filter(Boolean));
  const referencedStepIds = [];
  let sessionMinutes = 0;
  sessions.forEach((session, index) => {
    const path = `${label}.sessions[${index}]`;
    if (!isObject(session)) return add('V019-B007', `${path} must be an object.`, [build.id]);
    rejectUnknownProperties(session, ['id', 'title', 'estimatedMinutes', 'stepIds'], path, add);
    registerId(session.id, path);
    requireString(session.title, `${path}.title`, add);
    requirePositiveNumber(session.estimatedMinutes, `${path}.estimatedMinutes`, add);
    if (typeof session.estimatedMinutes === 'number' && Number.isFinite(session.estimatedMinutes)) sessionMinutes += session.estimatedMinutes;
    requireIdArray(session.stepIds, `${path}.stepIds`, add);
    asArray(session.stepIds).forEach((stepId) => {
      if (!buildStepIds.has(stepId)) add('V019-B008', `${path}.stepIds references step "${stepId}" outside Build "${build.id}".`, [build.id, stepId]);
      referencedStepIds.push(stepId);
    });
  });
  rejectDuplicates(referencedStepIds, `${label}.sessions step references`, add, 'V019-B009', build.id);

  if (sessions.length > 0) {
    buildStepIds.forEach((stepId) => {
      if (!referencedStepIds.includes(stepId)) add('V019-B010', `${label}.sessions does not assign Build step "${stepId}".`, [build.id, stepId]);
    });
    if (typeof build.estimatedMinutes === 'number' && Number.isFinite(build.estimatedMinutes) && build.estimatedMinutes > 0) {
      const minimum = build.estimatedMinutes * (1 - BUILD_SESSION_TIME_TOLERANCE);
      const maximum = build.estimatedMinutes * (1 + BUILD_SESSION_TIME_TOLERANCE);
      if (sessionMinutes < minimum || sessionMinutes > maximum) {
        add('V019-B011', `${label}.sessions total ${sessionMinutes} minutes must be within ±${BUILD_SESSION_TIME_TOLERANCE * 100}% of Build estimate ${build.estimatedMinutes}.`, [build.id]);
      }
    }
  }
}

function rejectDuplicates(values, label, add, code, ownerId) {
  const seen = new Set();
  values.filter(isNonEmptyString).forEach((value) => {
    if (seen.has(value)) add(code, `${label} contains duplicate reference "${value}".`, [ownerId, value]);
    seen.add(value);
  });
}

function availableCompetenciesForWeek(weeks, currentWeek) {
  const available = new Set();
  asArray(weeks)
    .filter((week) => isObject(week) && week.sequence <= currentWeek.sequence)
    .forEach((week) => asArray(week.study?.resources)
      .filter((assignment) => assignment?.role === 'core')
      .forEach((assignment) => asArray(assignment.competencyIds).forEach((id) => available.add(id))));
  return available;
}

function validateTextItems(value, label, registerId, add, allowEmpty) {
  const items = validateCollection(value, label, add, allowEmpty);
  items.forEach((item, index) => {
    const path = `${label}[${index}]`;
    if (!isObject(item)) return add('V001-B040', `${path} must be an object.`);
    rejectUnknownProperties(item, ['id', 'text'], path, add);
    registerId(item.id, path);
    requireString(item.text, `${path}.text`, add);
  });
}

function validateProof(proof, label, week, registerId, proofIds, add) {
  if (!isObject(proof)) return add('V008-B001', `${label}.proof must be an object.`, [week.id]);
  registerId(proof.id, `${label}.proof`);
  if (proof.id) proofIds.add(proof.id);
  requireString(proof.prompt, `${label}.proof.prompt`, add);
  const evidence = validateCollection(proof.evidence, `${label}.proof.evidence`, add, true);
  let requiredCount = 0;
  evidence.forEach((item, index) => {
    const path = `${label}.proof.evidence[${index}]`;
    if (!isObject(item)) return add('V008-B002', `${path} must be an object.`, [proof.id]);
    registerId(item.id, path);
    requireEnum(item.type, PROOF_EVIDENCE_TYPES, `${path}.type`, add);
    requireString(item.label, `${path}.label`, add);
    if (typeof item.required !== 'boolean') add('V008-B003', `${path}.required must be boolean.`, [item.id]);
    if (item.required === true) requiredCount += 1;
  });
  if (requiredCount === 0) add('V008-B004', `${label}.proof requires at least one required evidence item.`, [proof.id]);
}

function validateReflection(reflection, label, week, registerId, add) {
  if (!isObject(reflection)) return add('V009-B001', `${label}.reflection must be an object.`, [week.id]);
  const prompts = validateCollection(reflection.prompts, `${label}.reflection.prompts`, add, true);
  if (!Number.isInteger(reflection.minimumResponses) || reflection.minimumResponses < 0 || reflection.minimumResponses > prompts.length) {
    add('V009-B002', `${label}.reflection.minimumResponses must be a non-negative integer no greater than prompt count.`, [week.id]);
  }
  prompts.forEach((prompt, index) => {
    const path = `${label}.reflection.prompts[${index}]`;
    if (!isObject(prompt)) return add('V009-B003', `${path} must be an object.`, [week.id]);
    registerId(prompt.id, path);
    requireString(prompt.prompt, `${path}.prompt`, add);
  });
}

function validateReferences({ competencies, resources, weeks, source, competencyIds, resourceIds, add }) {
  competencies.forEach((item) => asArray(item?.prerequisiteIds).forEach((id) => validateReference(id, competencyIds, `${item.id}.prerequisiteIds`, add, item.id)));
  resources.forEach((item) => asArray(item?.competencyIds).forEach((id) => validateReference(id, competencyIds, `${item.id}.competencyIds`, add, item.id)));
  weeks.forEach((week) => asArray(week?.competencyIds).forEach((id) => validateReference(id, competencyIds, `${week.id}.competencyIds`, add, week.id)));
  void source;
  void resourceIds;
}

function validateCompetencyGraph(competencies, competencyIds, add) {
  const graph = new Map(competencies.filter(isObject).map((item) => [item.id, asArray(item.prerequisiteIds)]));
  competencies.forEach((item) => {
    if (item?.id && asArray(item.prerequisiteIds).includes(item.id)) add('V004-B001', `Competency "${item.id}" cannot depend on itself.`, [item.id]);
  });
  const visiting = new Set();
  const visited = new Set();
  const visit = (id, path = []) => {
    if (visiting.has(id)) {
      const cycle = [...path.slice(path.indexOf(id)), id];
      add('V004-B002', `Competency prerequisite cycle detected: ${cycle.join(' -> ')}.`, cycle);
      return;
    }
    if (visited.has(id) || !competencyIds.has(id)) return;
    visiting.add(id);
    asArray(graph.get(id)).forEach((next) => visit(next, [...path, id]));
    visiting.delete(id);
    visited.add(id);
  };
  competencyIds.forEach((id) => visit(id));
}

function validateTeachingOrder(weeks, resources, competencies, competencyIds, add) {
  const resourceMap = new Map(resources.filter(isObject).map((item) => [item.id, item]));
  const taught = new Set();
  const firstTaught = new Map();
  [...weeks].filter(isObject).sort((a, b) => a.sequence - b.sequence).forEach((week) => {
    const currentTaught = new Set();
    asArray(week.study?.resources).filter((assignment) => assignment?.role === 'core').forEach((assignment) => {
      asArray(assignment.competencyIds).forEach((id) => currentTaught.add(id));
      asArray(resourceMap.get(assignment.resourceId)?.competencyIds).forEach((id) => {
        if (asArray(assignment.competencyIds).includes(id)) currentTaught.add(id);
      });
    });
    const available = new Set([...taught, ...currentTaught]);
    currentTaught.forEach((id) => { if (!firstTaught.has(id)) firstTaught.set(id, week.sequence); });
    const assessed = asArray(week.skillCheck?.questions).flatMap((question) => asArray(question?.competencyIds));
    assessed.forEach((id) => {
      if (competencyIds.has(id) && !available.has(id)) add('V005-B005', `Skill Check in ${week.id} assesses competency "${id}" without a Core teaching path in this or an earlier week.`, [week.id, week.skillCheck?.id, id]);
    });
    asArray(week.builds).forEach((build) => asArray(build?.competencyIds).forEach((id) => {
      if (competencyIds.has(id) && !available.has(id)) add('V007-B007', `Build "${build.id}" applies competency "${id}" before Core teaching.`, [week.id, build.id, id]);
    }));
    const testCompTaught = [...available].some((id) => {
      const c = competencies.find((x) => x?.id === id);
      return /automated test|test structure|pytest/i.test((c?.name || '') + ' ' + (c?.description || ''));
    });
    asArray(week.builds).forEach((build) => {
      const buildText = [
        ...asArray(build?.steps).map((s) => s?.text || ''),
        ...asArray(build?.acceptanceCriteria).map((a) => a?.text || ''),
      ].join(' ');
      if (/(add automated test|required automated checks pass|run pytest|pytest suite)/i.test(buildText) && !testCompTaught) {
        add('V007-B008', `Build "${build.id}" requires automated tests or automated checks before testing competency is taught.`, [week.id, build.id]);
      }
    });
    currentTaught.forEach((id) => taught.add(id));
  });
  competencies.forEach((competency) => asArray(competency?.prerequisiteIds).forEach((prerequisiteId) => {
    const competencySequence = firstTaught.get(competency.id);
    const prerequisiteSequence = firstTaught.get(prerequisiteId);
    if (competencySequence !== undefined && (prerequisiteSequence === undefined || prerequisiteSequence > competencySequence)) {
      add('V013-B001', `Competency "${competency.id}" is taught before prerequisite "${prerequisiteId}".`, [competency.id, prerequisiteId]);
    }
  }));
}

function validateProjects(projects, weeks, weekIds, buildToWeek, competencyIds, registerId, add) {
  const sequenceByWeek = new Map(weeks.map((week) => [week?.id, week?.sequence]));
  projects.forEach((project, index) => {
    const label = `projects[${index}]`;
    if (!isObject(project)) return add('V010-B001', `${label} must be an object.`);
    registerId(project.id, label);
    requireString(project.title, `${label}.title`, add);
    requireString(project.outcome, `${label}.outcome`, add);
    requireIdArray(project.competencyIds, `${label}.competencyIds`, add, false);
    asArray(project.competencyIds).forEach((id) => validateReference(id, competencyIds, `${label}.competencyIds`, add, project.id));
    const milestones = validateCollection(project.milestones, `${label}.milestones`, add, true);
    let previousSequence = -Infinity;
    milestones.forEach((milestone, milestoneIndex) => {
      const path = `${label}.milestones[${milestoneIndex}]`;
      if (!isObject(milestone)) return add('V010-B002', `${path} must be an object.`, [project.id]);
      registerId(milestone.id, path);
      requireString(milestone.title, `${path}.title`, add);
      validateReference(milestone.weekId, weekIds, `${path}.weekId`, add, milestone.id);
      if (!buildToWeek.has(milestone.buildId)) add('V010-B003', `${path}.buildId references unknown Build "${milestone.buildId ?? ''}".`, [project.id, milestone.id, milestone.buildId]);
      else if (buildToWeek.get(milestone.buildId) !== milestone.weekId) add('V010-B004', `${path} references Build "${milestone.buildId}" outside Week "${milestone.weekId}".`, [project.id, milestone.id, milestone.weekId, milestone.buildId]);
      const sequence = sequenceByWeek.get(milestone.weekId);
      if (Number.isFinite(sequence) && sequence < previousSequence) add('V010-B005', `${path} appears before an earlier Project milestone Week.`, [project.id, milestone.id]);
      if (Number.isFinite(sequence)) previousSequence = sequence;
    });
  });
}

function validateGraduation(graduation, competencyIds, projectIds, add) {
  if (!isObject(graduation)) return add('V001-B050', 'graduation must be an object.');
  requireString(graduation.outcome, 'graduation.outcome', add);
  requireIdArray(graduation.requiredCompetencyIds, 'graduation.requiredCompetencyIds', add, false);
  requireIdArray(graduation.requiredProjectIds, 'graduation.requiredProjectIds', add, false);
  asArray(graduation.requiredCompetencyIds).forEach((id) => validateReference(id, competencyIds, 'graduation.requiredCompetencyIds', add, id));
  asArray(graduation.requiredProjectIds).forEach((id) => validateReference(id, projectIds, 'graduation.requiredProjectIds', add, id));
}

function validateWorkloadArithmetic(workload, weeks, add) {
  if (!isObject(workload) || !isObject(workload.weeklyHours)) return;
  const weekTotal = weeks.reduce((sum, week) => sum + (typeof week?.estimatedHours === 'number' ? week.estimatedHours : 0), 0);
  if (typeof workload.estimatedTotalHours === 'number' && Math.abs(workload.estimatedTotalHours - weekTotal) > 1) {
    add('V014-B003', `estimatedTotalHours (${workload.estimatedTotalHours}) differs from summed week hours (${weekTotal}) by more than 1 hour.`);
  }
  const min = workload.weeklyHours.min;
  const max = workload.weeklyHours.max;
  if ([min, max, workload.estimatedTotalHours].every((value) => typeof value === 'number' && value > 0) && Number.isInteger(workload.estimatedWeeks)) {
    const minimumPlausible = Math.ceil(workload.estimatedTotalHours / max);
    const maximumPlausible = Math.ceil(workload.estimatedTotalHours / min);
    if (workload.estimatedWeeks < minimumPlausible || workload.estimatedWeeks > maximumPlausible) {
      add('V014-B004', `estimatedWeeks (${workload.estimatedWeeks}) must be between ${minimumPlausible} and ${maximumPlausible} for the declared weekly capacity.`);
    }
  }
}

function validateCurriculumSkillChecks(weeks, add) {
  const weeklySequences = new Map();
  const globalCounts = { a: 0, b: 0, c: 0, d: 0 };
  let totalQuestions = 0;
  let repeatedStems = 0;

  weeks.forEach((week) => {
    const qs = asArray(week?.skillCheck?.questions);
    const seq = qs.map((q) => (q?.correctOptionId || '').toLowerCase()).join(',');
    if (seq.length > 0 && qs.length === 10) {
      if (weeklySequences.has(seq)) {
        add('V006-B011', `Weeks "${weeklySequences.get(seq)}" and "${week.id}" share identical 10-question answer key sequences: ${seq}.`, [weeklySequences.get(seq), week.id]);
      } else {
        weeklySequences.set(seq, week.id);
      }
    }
    qs.forEach((q) => {
      totalQuestions += 1;
      const key = (q?.correctOptionId || '').toLowerCase();
      if (globalCounts[key] !== undefined) globalCounts[key] += 1;
      if (/Which choice most directly created this failure\?/i.test(q?.prompt || '')) {
        repeatedStems += 1;
      }
    });
  });

  if (totalQuestions >= 20) {
    ['a', 'b', 'c', 'd'].forEach((opt) => {
      if (globalCounts[opt] === 0) {
        add('V006-B010', `Option position "${opt}" is never correct across ${totalQuestions} curriculum questions.`, []);
      } else if (globalCounts[opt] / totalQuestions > 0.45) {
        const pct = Math.round((globalCounts[opt] / totalQuestions) * 100);
        add('V006-B010', `Option position "${opt}" is correct in ${pct}% of questions (exceeds 45% ceiling).`, []);
      }
    });
    if (repeatedStems / totalQuestions > 0.10) {
      add('V006-B013', `Question stem "Which choice most directly created this failure?" appears in ${repeatedStems} questions (${Math.round((repeatedStems / totalQuestions) * 100)}%), exceeding 10% ceiling.`, []);
    }
  }
}

function findRejectedLegacyFields(value, path = '$', found = []) {
  if (Array.isArray(value)) value.forEach((item, index) => findRejectedLegacyFields(item, `${path}[${index}]`, found));
  else if (isObject(value)) Object.entries(value).forEach(([key, child]) => {
    if (REJECTED_LEGACY_FIELDS.has(key)) found.push({ path: `${path}.${key}`, key });
    findRejectedLegacyFields(child, `${path}.${key}`, found);
  });
  return found;
}
