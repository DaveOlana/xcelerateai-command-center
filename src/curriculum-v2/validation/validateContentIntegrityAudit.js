import { RESOURCE_FORMATS, STUDY_LEARNING_ROLES } from '../schema/constants.js';
import { createFinding, createValidationReport, SEVERITIES } from './findings.js';

const QUESTION_CLASSIFICATIONS = Object.freeze(['A', 'B', 'C', 'D']);
const RESOURCE_DECISIONS = Object.freeze(['retained', 'replaced', 'added', 'removed']);
const AUDIT_SCHEMA_VERSIONS = Object.freeze(['1.0', '1.1']);
const PREREQUISITE_REPAIRS = Object.freeze(['fit', 'replaced', 'moved-later', 'taught-first', 'bridge', 'reference']);
const PROSPECTIVE_JUDGMENT_FIELDS = Object.freeze([
  'prerequisiteFit',
  'learnerStageFit',
  'scopeFit',
  'accessibility',
  'cost',
  'availability',
  'sectionAssignability',
  'learningRoleFit',
  'maintenanceRisk',
]);
const BUILD_DEPENDENCY_CLASSES = Object.freeze([
  'taught-this-week',
  'established-previously',
  'contextually-explained',
  'reasonable-integration',
  'hidden-prerequisite',
]);

const asArray = (value) => Array.isArray(value) ? value : [];
const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const isString = (value) => typeof value === 'string' && value.trim().length > 0;

export function validateContentIntegrityAudit(audit, source, research = []) {
  const findings = [];
  const add = (code, message, ids = []) => findings.push(createFinding(code, SEVERITIES.BLOCKER, message, ids));
  const warn = (code, message, ids = []) => findings.push(createFinding(code, SEVERITIES.WARNING, message, ids));

  if (!isObject(audit)) {
    add('V020-B001', 'content-integrity-audit.json must contain an object.');
    return createValidationReport(source, findings);
  }
  if (!isObject(source)) {
    add('V020-B002', 'A Curriculum Source object is required to validate the content-integrity audit.');
    return createValidationReport(source, findings);
  }

  if (!AUDIT_SCHEMA_VERSIONS.includes(audit.schemaVersion)) add('V020-B003', 'Content integrity audit schemaVersion must be "1.0" or "1.1".');
  const prospectiveBeginnerIntegrity = audit.schemaVersion === '1.1';
  if (audit.curriculumId !== source.curriculumId) add('V020-B004', 'Audit curriculumId must match Curriculum Source.', [audit.curriculumId, source.curriculumId]);
  if (audit.revision !== source.revision) add('V020-B005', 'Audit revision must match Curriculum Source.', [String(audit.revision), String(source.revision)]);
  if (!isString(audit.auditedAt) || Number.isNaN(Date.parse(audit.auditedAt))) add('V020-B006', 'Audit auditedAt must be a valid ISO-compatible date.');
  if (!isString(audit.targetLearner)) add('V020-B007', 'Audit targetLearner must explain the learner perspective used by reviewers.');

  const weeks = asArray(source.weeks);
  const sourceResources = asArray(source.resources);
  const researchRecords = asArray(research);
  const sourceResourceById = new Map(sourceResources.map((resource) => [resource?.id, resource]));
  const researchById = new Map(researchRecords.map((resource) => [resource?.id, resource]));
  const weekById = new Map(weeks.map((week) => [week?.id, week]));
  const weekSequenceById = new Map(weeks.map((week) => [week?.id, week?.sequence]));
  const firstCompetencyWeek = new Map();
  const assignmentByResourceId = new Map();
  const assignmentOrderByResourceId = new Map();
  const availableCompetenciesBeforeResource = new Map();
  const accumulatedCompetencies = new Set();
  let assignmentOrder = 0;

  [...weeks].sort((left, right) => left?.sequence - right?.sequence).forEach((week) => {
    asArray(week?.competencyIds).forEach((competencyId) => {
      if (!firstCompetencyWeek.has(competencyId)) firstCompetencyWeek.set(competencyId, week?.sequence);
    });
    asArray(week?.study?.resources).forEach((assignment) => {
      availableCompetenciesBeforeResource.set(assignment?.resourceId, new Set(accumulatedCompetencies));
      assignmentOrderByResourceId.set(assignment?.resourceId, assignmentOrder);
      assignmentOrder += 1;
      assignmentByResourceId.set(assignment?.resourceId, { assignment, week });
      if (!STUDY_LEARNING_ROLES.includes(assignment?.learningRole)) {
        add('V020-B008', `Production Study assignment ${assignment?.resourceId || '(missing ID)'} requires an authored learningRole.`, [week?.id, assignment?.resourceId]);
      }
      if (!isString(assignment?.purpose)) {
        add('V020-B009', `Production Study assignment ${assignment?.resourceId || '(missing ID)'} requires a learner-facing purpose.`, [week?.id, assignment?.resourceId]);
      }
      if (assignment?.learningRole === 'learn') {
        asArray(assignment?.competencyIds).forEach((competencyId) => accumulatedCompetencies.add(competencyId));
      }
    });
    asArray(week?.competencyIds).forEach((competencyId) => accumulatedCompetencies.add(competencyId));
  });

  const resourceAudits = asArray(audit.resourceAudits);
  const resourceAuditById = uniqueById(resourceAudits, 'resourceId', 'resource audit', add, 'V020-B010');
  sourceResources.forEach((resource) => {
    const record = resourceAuditById.get(resource?.id);
    if (!record || record.decision === 'removed') {
      add('V020-B011', `Selected Resource ${resource?.id} requires a non-removed audit record.`, [resource?.id]);
      return;
    }
    if (record.finalUrl !== resource?.url) add('V020-B012', `Resource audit finalUrl must match Curriculum Source for ${resource?.id}.`, [resource?.id]);
    const assignment = assignmentByResourceId.get(resource?.id)?.assignment;
    if (record.learningRole !== assignment?.learningRole) add('V020-B013', `Resource audit learningRole must match its Study assignment for ${resource?.id}.`, [resource?.id]);
    const researchRecord = researchById.get(resource?.id);
    if (!researchRecord || researchRecord.url !== resource?.url || researchRecord.accessStatus !== 'verified') {
      add('V020-B014', `Resource ${resource?.id} requires matching verified research evidence.`, [resource?.id]);
    }
    if (prospectiveBeginnerIntegrity) {
      validateProspectiveResourceIntegrity({
        record,
        resource,
        assignment,
        sourceResourceById,
        availableCompetencies: availableCompetenciesBeforeResource.get(resource?.id) ?? new Set(),
        assignmentOrderByResourceId,
        add,
        warn,
      });
    }
  });

  resourceAudits.forEach((record, index) => {
    const label = `resourceAudits[${index}]`;
    if (!isObject(record)) return add('V020-B015', `${label} must be an object.`);
    if (!RESOURCE_DECISIONS.includes(record.decision)) add('V020-B016', `${label}.decision must be retained, replaced, added, or removed.`, [record.resourceId]);
    if (!weekById.has(record.weekId)) add('V020-B017', `${label}.weekId references an unknown Week.`, [record.resourceId, record.weekId]);
    if (record.decision !== 'removed') {
      if (!sourceResourceById.has(record.resourceId)) add('V020-B018', `${label} describes a selected Resource missing from Curriculum Source.`, [record.resourceId]);
      if (record.actualContentInspected !== true) add('V020-B019', `${label} must confirm actual content inspection.`, [record.resourceId]);
      if (!isString(record.inspectedAt) || Number.isNaN(Date.parse(record.inspectedAt))) add('V020-B020', `${label}.inspectedAt must be a valid date.`, [record.resourceId]);
      if (!isObject(record.access) || record.access.status !== 'verified' || record.access.free !== true
        || typeof record.access.loginRequired !== 'boolean' || record.access.sectionVerified !== true) {
        add('V020-B021', `${label} must record verified free access.`, [record.resourceId]);
      }
      if (!isObject(record.judgment) || ['beginnerClarity', 'competencyFit', 'correctness', 'currency', 'pacing', 'practiceQuality', 'redundancy']
        .some((field) => !isString(record.judgment?.[field]))) {
        add('V020-B022', `${label}.judgment must record every pedagogical evaluation dimension.`, [record.resourceId]);
      }
      if (!isString(record.rationale)) add('V020-B023', `${label}.rationale must explain the final selection.`, [record.resourceId]);
    }
    const candidates = asArray(record.candidateComparisons);
    if (record.decision !== 'removed' && candidates.length === 0) add('V020-B024', `${label} must preserve at least the selected candidate evidence.`, [record.resourceId]);
    if (['replaced', 'added'].includes(record.decision) && candidates.length < 2) add('V020-B025', `${label} must compare at least two viable candidates for a changed resource.`, [record.resourceId]);
    candidates.forEach((candidate, candidateIndex) => {
      if (!isObject(candidate) || !isString(candidate.title) || !isString(candidate.url) || !isString(candidate.provider)
        || !['selected', 'rejected'].includes(candidate.disposition) || !isString(candidate.reason)) {
        add('V020-B026', `${label}.candidateComparisons[${candidateIndex}] is incomplete.`, [record.resourceId]);
      }
    });
    const selectedCandidates = candidates.filter((candidate) => candidate?.disposition === 'selected');
    if (record.decision !== 'removed' && (selectedCandidates.length !== 1 || selectedCandidates[0]?.url !== record.finalUrl)) {
      add('V020-B058', `${label} must identify exactly one selected candidate matching finalUrl.`, [record.resourceId]);
    }
    if (record.decision === 'retained' && record.previousUrl !== record.finalUrl) add('V020-B059', `${label} retained decision requires an unchanged URL.`, [record.resourceId]);
    if (record.decision === 'replaced' && (!isString(record.previousUrl) || record.previousUrl === record.finalUrl)) add('V020-B060', `${label} replaced decision requires a different previousUrl.`, [record.resourceId]);
    if (record.decision === 'added' && record.previousUrl !== null) add('V020-B061', `${label} added decision requires previousUrl null.`, [record.resourceId]);
  });
  if (prospectiveBeginnerIntegrity) warnPotentialResourceRedundancy(resourceAudits, sourceResourceById, assignmentByResourceId, warn);

  const expectedQuestions = weeks.flatMap((week) => asArray(week?.skillCheck?.questions).map((question) => ({ question, week })));
  const questionAudits = asArray(audit.questionAudits);
  const questionAuditById = uniqueById(questionAudits, 'questionId', 'question audit', add, 'V020-B027');
  expectedQuestions.forEach(({ question, week }) => {
    const record = questionAuditById.get(question?.id);
    if (!record) return add('V020-B028', `Question ${question?.id} has not been audited.`, [week?.id, question?.id]);
    if (record.weekId !== week?.id) add('V020-B029', `Question audit ${question?.id} has the wrong weekId.`, [question?.id, record.weekId, week?.id]);
  });
  if (questionAudits.length !== expectedQuestions.length) add('V020-B030', `Question audit count ${questionAudits.length} must equal production question count ${expectedQuestions.length}.`);

  questionAudits.forEach((record, index) => {
    const label = `questionAudits[${index}]`;
    if (!QUESTION_CLASSIFICATIONS.includes(record?.classification)) add('V020-B031', `${label}.classification must be A, B, C, or D.`, [record?.questionId]);
    if (record?.classification === 'D') add('V020-B032', `Question ${record.questionId} retains an untaught dependency.`, [record.weekId, record.questionId]);
    if (!isString(record?.evidence)) add('V020-B033', `${label}.evidence must justify the classification.`, [record?.questionId]);
    if (!Array.isArray(record?.supportingResourceIds)) add('V020-B034', `${label}.supportingResourceIds must be an array.`, [record?.questionId]);
    asArray(record?.supportingResourceIds).forEach((resourceId) => {
      if (!sourceResourceById.has(resourceId)) add('V020-B035', `${label} references unknown supporting Resource ${resourceId}.`, [record?.questionId, resourceId]);
    });
    const questionWeekSequence = weekSequenceById.get(record?.weekId);
    const coreSupports = asArray(record?.supportingResourceIds)
      .map((resourceId) => assignmentByResourceId.get(resourceId))
      .filter((entry) => entry?.assignment?.role === 'core');
    const currentCoreSupports = coreSupports.filter((entry) => entry.week?.id === record?.weekId);
    const earlierCoreSupports = coreSupports.filter((entry) => entry.week?.sequence < questionWeekSequence);
    if (record?.classification === 'A' && currentCoreSupports.length === 0) {
      add('V020-B062', `${record?.questionId} classified A requires at least one current-week Core supporting Resource.`, [record?.weekId, record?.questionId]);
    }
    if (record?.classification === 'B' && earlierCoreSupports.length === 0) {
      add('V020-B063', `${record?.questionId} classified B requires at least one earlier Core supporting Resource.`, [record?.weekId, record?.questionId]);
    }
    if (record?.classification === 'C' && coreSupports.filter((entry) => entry.week?.sequence <= questionWeekSequence).length === 0) {
      add('V020-B064', `${record?.questionId} classified C requires a Core teaching basis from the current or an earlier Week.`, [record?.weekId, record?.questionId]);
    }
    if (!['retained', 'rewritten', 'answer-key-repaired'].includes(record?.repair)) {
      add('V020-B036', `${label}.repair must be retained, rewritten, or answer-key-repaired.`, [record?.questionId]);
    }
  });

  weeks.forEach((week) => {
    const records = questionAudits.filter((record) => record?.weekId === week?.id);
    const directOrPrior = records.filter((record) => ['A', 'B'].includes(record.classification)).length;
    if (records.length !== asArray(week?.skillCheck?.questions).length) add('V020-B037', `${week?.id} question audit coverage is incomplete.`, [week?.id]);
    if (directOrPrior < 7) add('V020-B038', `${week?.id} has only ${directOrPrior} A/B questions; at least 7 are required.`, [week?.id]);
  });

  const expectedBuilds = weeks.flatMap((week) => asArray(week?.builds).filter((build) => build?.required).map((build) => ({ build, week })));
  const buildAudits = asArray(audit.buildAudits);
  const buildAuditById = uniqueById(buildAudits, 'buildId', 'Build audit', add, 'V020-B039');
  expectedBuilds.forEach(({ build, week }) => {
    const record = buildAuditById.get(build?.id);
    if (!record) return add('V020-B040', `Required Build ${build?.id} has not been audited.`, [week?.id, build?.id]);
    if (record.weekId !== week?.id) add('V020-B041', `Build audit ${build?.id} has the wrong weekId.`, [build?.id, record.weekId, week?.id]);
    if (!isObject(build.learnerGuide)) add('V020-B042', `Required Build ${build?.id} requires learnerGuide.`, [week?.id, build?.id]);
    else {
      ['summary', 'whyItMatters', 'finishedResult'].forEach((field) => {
        if (!isString(build.learnerGuide[field])) add('V020-B043', `Required Build ${build?.id} requires learnerGuide.${field}.`, [build?.id]);
      });
      ['priorKnowledgeCompetencyIds', 'conceptRefs', 'sessions'].forEach((field) => {
        if (!Array.isArray(build.learnerGuide[field])) add('V020-B044', `Required Build ${build?.id} requires learnerGuide.${field}.`, [build?.id]);
      });
      if (asArray(build.learnerGuide.sessions).length === 0) add('V020-B045', `Required Build ${build?.id} requires at least one learner-visible session.`, [build?.id]);
      if (asArray(build.learnerGuide.conceptRefs).length === 0) add('V020-B065', `Required Build ${build?.id} requires contextual concept references.`, [build?.id]);
      asArray(build.learnerGuide.priorKnowledgeCompetencyIds).forEach((competencyId) => {
        if ((firstCompetencyWeek.get(competencyId) ?? Infinity) >= week?.sequence) {
          add('V020-B066', `${build?.id} prior knowledge ${competencyId} is not established before ${week?.id}.`, [build?.id, competencyId]);
        }
      });
    }
  });
  if (buildAudits.length !== expectedBuilds.length) add('V020-B046', `Build audit count ${buildAudits.length} must equal required Build count ${expectedBuilds.length}.`);

  buildAudits.forEach((record, index) => {
    const label = `buildAudits[${index}]`;
    if (!Array.isArray(record?.dependencies) || record.dependencies.length === 0) add('V020-B047', `${label}.dependencies must record the separate Build-readiness audit.`, [record?.buildId]);
    asArray(record?.dependencies).forEach((dependency, dependencyIndex) => {
      if (!isObject(dependency) || !isString(dependency.name) || !BUILD_DEPENDENCY_CLASSES.includes(dependency.classification)
        || !isString(dependency.evidence)) {
        add('V020-B048', `${label}.dependencies[${dependencyIndex}] is incomplete.`, [record?.buildId]);
      }
      if (dependency?.classification === 'hidden-prerequisite') add('V020-B049', `${record?.buildId} retains hidden prerequisite ${dependency?.name || '(unnamed)'}.`, [record?.buildId]);
    });
    if (!Array.isArray(record?.hiddenPrerequisitesFound) || !Array.isArray(record?.hiddenPrerequisitesRepaired)
      || !Array.isArray(record?.hiddenPrerequisitesRemaining)) {
      add('V020-B050', `${label} must record found, repaired, and remaining hidden prerequisites.`, [record?.buildId]);
    } else if (record.hiddenPrerequisitesRemaining.length > 0) {
      add('V020-B051', `${record?.buildId} has unresolved hidden prerequisites.`, [record?.buildId]);
    } else if (record.hiddenPrerequisitesRepaired.length !== record.hiddenPrerequisitesFound.length) {
      add('V020-B067', `${record?.buildId} must account for every discovered hidden prerequisite as repaired.`, [record?.buildId]);
    }
    if (record?.readiness !== 'YES' || !isString(record?.rationale)) add('V020-B052', `${record?.buildId} must have an evidence-backed YES readiness judgment.`, [record?.buildId]);
  });

  const readiness = asArray(audit.weekReadiness);
  const readinessById = uniqueById(readiness, 'weekId', 'week readiness', add, 'V020-B053');
  weeks.forEach((week) => {
    const record = readinessById.get(week?.id);
    if (!record) add('V020-B054', `${week?.id} is missing its beginner-readiness judgment.`, [week?.id]);
    else if (record.answer !== 'YES' || !isString(record.evidence)) add('V020-B055', `${week?.id} must have an evidence-backed YES beginner-readiness judgment.`, [week?.id]);
  });
  if (readiness.length !== weeks.length) add('V020-B056', `Week readiness count ${readiness.length} must equal Week count ${weeks.length}.`);

  if (prospectiveBeginnerIntegrity) validateImmediateApplication(source, add);

  if (!isObject(audit.semanticReview) || audit.semanticReview.status !== 'PASS'
    || !isString(audit.semanticReview.method) || asArray(audit.semanticReview.findingsReviewed).length === 0) {
    add('V020-B057', 'semanticReview must contain evidence-backed PASS details; the pipeline may not manufacture semantic approval.');
  }

  const classificationTotals = questionAudits.reduce((totals, record) => {
    if (QUESTION_CLASSIFICATIONS.includes(record?.classification)) totals[record.classification] += 1;
    return totals;
  }, { A: 0, B: 0, C: 0, D: 0 });

  return createValidationReport(source, findings, {
    summary: {
      resourceAudits: resourceAudits.length,
      questionAudits: questionAudits.length,
      buildAudits: buildAudits.length,
      weekReadiness: readiness.length,
      classificationTotals,
    },
  });
}

function validateProspectiveResourceIntegrity({
  record,
  resource,
  assignment,
  sourceResourceById,
  availableCompetencies,
  assignmentOrderByResourceId,
  add,
  warn,
}) {
  const prerequisiteFit = record?.prerequisiteFit;
  if (!isObject(prerequisiteFit)
    || !Array.isArray(prerequisiteFit.assumedCompetencyIds)
    || !Array.isArray(prerequisiteFit.unresolvedAssumptions)
    || !PREREQUISITE_REPAIRS.includes(prerequisiteFit.resolution)
    || !isString(prerequisiteFit.evidence)
    || !isString(prerequisiteFit.expectedOutcome)) {
    add('V020-B068', `Resource ${resource?.id} requires a complete point-of-use prerequisiteFit review.`, [resource?.id]);
    return;
  }

  const unavailable = prerequisiteFit.assumedCompetencyIds.filter((competencyId) => !availableCompetencies.has(competencyId));
  if (unavailable.length > 0) {
    add('V020-B069', `Resource ${resource?.id} assumes competencies unavailable before its exact assignment point.`, [resource?.id, ...unavailable]);
  }
  if (prerequisiteFit.unresolvedAssumptions.length > 0) {
    add('V020-B070', `Resource ${resource?.id} retains unexplained terminology, tools, workflows, or prerequisites.`, [resource?.id]);
  }

  const bridgeResourceIds = asArray(prerequisiteFit.bridgeResourceIds);
  if (prerequisiteFit.resolution === 'bridge') {
    const currentOrder = assignmentOrderByResourceId.get(resource?.id);
    const invalidBridge = bridgeResourceIds.length === 0 || bridgeResourceIds.some((resourceId) => (
      !sourceResourceById.has(resourceId)
      || resourceId === resource?.id
      || (assignmentOrderByResourceId.get(resourceId) ?? Infinity) >= (currentOrder ?? -1)
    ));
    if (invalidBridge) add('V020-B071', `Resource ${resource?.id} bridge repair must identify an earlier assigned bridge resource.`, [resource?.id, ...bridgeResourceIds]);
  }

  const modalityReview = record?.modalityReview;
  if (!isObject(modalityReview)
    || !Array.isArray(modalityReview.consideredFormats)
    || modalityReview.consideredFormats.length === 0
    || modalityReview.consideredFormats.some((format) => !RESOURCE_FORMATS.includes(format))
    || modalityReview.selectedFormat !== resource?.format
    || !isString(modalityReview.rationale)) {
    add('V020-B072', `Resource ${resource?.id} requires a justified modality review without format quotas.`, [resource?.id]);
  }

  if (PROSPECTIVE_JUDGMENT_FIELDS.some((field) => !isString(record?.judgment?.[field]))) {
    add('V020-B073', `Resource ${resource?.id} requires the prospective resource-quality judgments.`, [resource?.id]);
  }

  if (resource?.format === 'documentation' && assignment?.learningRole === 'learn'
    && !isString(record?.documentationTeachingJustification)) {
    warn('V020-W001', `Documentation is the primary beginner teaching route for ${resource?.id} without an explicit teaching justification.`, [resource?.id]);
  }

  if (record?.recoveryAlternative !== undefined) {
    const recovery = record.recoveryAlternative;
    if (!isObject(recovery) || !isString(recovery.primaryResourceId) || recovery.primaryResourceId === resource?.id
      || !sourceResourceById.has(recovery.primaryResourceId) || !isString(recovery.difference)) {
      add('V020-B074', `Resource ${resource?.id} has an invalid recoveryAlternative review.`, [resource?.id, recovery?.primaryResourceId]);
    }
  }
}

function validateImmediateApplication(source, add) {
  const weeks = [...asArray(source?.weeks)].sort((left, right) => left?.sequence - right?.sequence);
  asArray(source?.competencies).filter((competency) => competency?.importance === 'core').forEach((competency) => {
    const introduction = weeks.find((week) => asArray(week?.competencyIds).includes(competency.id));
    if (!introduction) return;
    const applicationWindow = weeks.filter((week) => week?.sequence >= introduction.sequence && week?.sequence <= introduction.sequence + 1);
    const hasApplication = applicationWindow.some((week) => (
      asArray(week?.study?.resources).some((assignment) => assignment?.learningRole === 'practice'
        && asArray(assignment?.competencyIds).includes(competency.id))
      || asArray(week?.builds).some((build) => build?.required && asArray(build?.competencyIds).includes(competency.id))
    ));
    if (!hasApplication) {
      add('V020-B075', `Core competency ${competency.id} has no meaningful practice or required Build in its introduction Week or the next Week.`, [competency.id, introduction.id]);
    }
  });
}

function warnPotentialResourceRedundancy(resourceAudits, sourceResourceById, assignmentByResourceId, warn) {
  const signatures = new Map();
  resourceAudits.filter((record) => record?.decision !== 'removed').forEach((record) => {
    const resource = sourceResourceById.get(record?.resourceId);
    const assignmentRecord = assignmentByResourceId.get(record?.resourceId);
    if (!resource || !assignmentRecord?.assignment) return;
    const signature = [
      assignmentRecord.week?.id,
      assignmentRecord.assignment.learningRole,
      resource.format,
      [...asArray(assignmentRecord.assignment.competencyIds)].sort().join(','),
    ].join('|');
    const matches = signatures.get(signature) ?? [];
    matches.push(record.resourceId);
    signatures.set(signature, matches);
  });
  signatures.forEach((resourceIds) => {
    if (resourceIds.length > 1) {
      warn('V020-W002', 'Multiple resources share the same Week, learning role, format, and competency mapping; reviewers must confirm that each contributes a distinct instructional benefit.', resourceIds);
    }
  });
}

function uniqueById(records, idField, label, add, code) {
  const byId = new Map();
  records.forEach((record, index) => {
    const id = record?.[idField];
    if (!isString(id)) add(code, `${label} at index ${index} requires ${idField}.`);
    else if (byId.has(id)) add(code, `Duplicate ${label} ID ${id}.`, [id]);
    else byId.set(id, record);
  });
  return byId;
}
