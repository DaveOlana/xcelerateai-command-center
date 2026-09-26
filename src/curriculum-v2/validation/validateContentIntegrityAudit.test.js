import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { validateContentIntegrityAudit } from './validateContentIntegrityAudit.js';

const sourcePath = new URL('../../../XcelerateAI Curriculum System/v2/examples/golden-curriculum/curriculum-source.json', import.meta.url);
const fixture = () => JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

function productionFixture() {
  const source = fixture();
  source.revision = 3;
  source.concepts = [{
    id: 'GOLDEN-CONCEPT-AUDIT',
    term: 'Evidence',
    simpleMeaning: 'A fact the learner can inspect.',
    example: 'The saved record contains the expected value.',
    commonMistake: 'Replacing the fact with an unsupported conclusion.',
  }];
  const establishedCompetencies = new Set();
  source.weeks.forEach((week) => {
    week.study.resources.forEach((assignment, index) => {
      assignment.learningRole = index === 0 ? 'learn' : 'practice';
    });
    week.builds.filter((build) => build.required).forEach((build) => {
      build.learnerGuide = {
        summary: `Complete ${build.title} in understandable stages.`,
        whyItMatters: 'The result demonstrates the weekly competency in a reviewable artifact.',
        priorKnowledgeCompetencyIds: build.competencyIds.filter((id) => establishedCompetencies.has(id)),
        finishedResult: 'A working artifact plus its verification evidence.',
        conceptRefs: [{ conceptId: 'GOLDEN-CONCEPT-AUDIT', relevance: 'The Build must produce an inspectable result.' }],
        sessions: [{
          id: `${build.id}-SESSION-01`,
          title: 'Implement and verify',
          estimatedMinutes: build.estimatedMinutes,
          stepIds: build.steps.map((step) => step.id),
        }],
      };
    });
    week.competencyIds.forEach((id) => establishedCompetencies.add(id));
  });
  const research = source.resources.map((resource) => ({
    ...resource,
    accessStatus: 'verified',
    checkedAt: '2026-09-09',
  }));
  const audit = {
    schemaVersion: '1.0',
    curriculumId: source.curriculumId,
    revision: source.revision,
    auditedAt: '2026-09-09',
    targetLearner: 'A motivated beginner using Windows and learning the subject for the first time.',
    resourceAudits: source.resources.map((resource) => {
      const assignmentRecord = source.weeks
        .map((week) => ({ week, assignment: week.study.resources.find((item) => item.resourceId === resource.id) }))
        .find((item) => item.assignment);
      return {
        resourceId: resource.id,
        weekId: assignmentRecord.week.id,
        decision: 'retained',
        previousUrl: resource.url,
        finalUrl: resource.url,
        learningRole: assignmentRecord.assignment.learningRole,
        actualContentInspected: true,
        inspectedAt: '2026-09-09',
        access: { status: 'verified', free: true, loginRequired: false, sectionVerified: true },
        candidateComparisons: [{ title: resource.title, url: resource.url, provider: resource.provider, disposition: 'selected', reason: 'The inspected selection fits the fixture learning need.' }],
        judgment: {
          beginnerClarity: 'The assigned section is understandable at this point.',
          competencyFit: 'It directly supports the mapped competency.',
          correctness: 'The inspected material is technically correct.',
          currency: 'The destination remains current for the fixture.',
          pacing: 'The assignment fits the estimated time.',
          practiceQuality: 'The weekly activity requires an observable action.',
          redundancy: 'It performs a distinct role in the selected set.',
        },
        rationale: 'Retained after direct inspection because it performs its assigned role.',
      };
    }),
    questionAudits: source.weeks.flatMap((week) => week.skillCheck.questions.map((question) => ({
      questionId: question.id,
      weekId: week.id,
      classification: 'A',
      evidence: 'The required knowledge is explicitly covered by this week’s Core assignment.',
      supportingResourceIds: [week.study.resources[0].resourceId],
      repair: 'retained',
    }))),
    buildAudits: source.weeks.flatMap((week) => week.builds.filter((build) => build.required).map((build) => ({
      buildId: build.id,
      weekId: week.id,
      dependencies: [{ name: 'Weekly competency', classification: 'taught-this-week', evidence: 'The Core Study assignment teaches the mapped competency.' }],
      hiddenPrerequisitesFound: [],
      hiddenPrerequisitesRepaired: [],
      hiddenPrerequisitesRemaining: [],
      readiness: 'YES',
      rationale: 'The learner has the concepts and contextual guidance required to begin.',
    }))),
    weekReadiness: source.weeks.map((week) => ({ weekId: week.id, answer: 'YES', evidence: 'Core Study and the learner guide make the Build understandable.' })),
    semanticReview: {
      status: 'PASS',
      method: 'Human-led resource, question, Build, and adversarial readiness review.',
      findingsReviewed: ['Beginner clarity and hidden prerequisites were reviewed.'],
    },
  };
  return { source, research, audit };
}

function prospectiveFixture() {
  const fixtureData = productionFixture();
  fixtureData.audit.schemaVersion = '1.1';
  fixtureData.audit.resourceAudits.forEach((record) => {
    const resource = fixtureData.source.resources.find((item) => item.id === record.resourceId);
    record.prerequisiteFit = {
      assumedCompetencyIds: [],
      unresolvedAssumptions: [],
      resolution: 'fit',
      bridgeResourceIds: [],
      evidence: 'The inspected assignment assumes no knowledge beyond what is available before this exact point.',
      expectedOutcome: 'The learner can perform the mapped competency after completing the assignment.',
    };
    record.modalityReview = {
      consideredFormats: [resource.format],
      selectedFormat: resource.format,
      rationale: 'This format is the smallest useful route for the learning need; no format quota was applied.',
    };
    Object.assign(record.judgment, {
      prerequisiteFit: 'All material prerequisites are available before the assignment.',
      learnerStageFit: 'The explanation and activity fit a complete beginner at this point.',
      scopeFit: 'The assigned section contains only the needed scope.',
      accessibility: 'The selected section is usable with the stated learner setup.',
      cost: 'The resource is free for required progression.',
      availability: 'The exact assigned section was reachable during review.',
      sectionAssignability: 'The assignment has a precise learner-visible boundary.',
      learningRoleFit: 'The resource performs its authored learning role.',
      maintenanceRisk: 'The source and replacement risk were reviewed.',
    });
    if (resource.format === 'documentation') {
      record.documentationTeachingJustification = 'The assigned section is deliberately suitable as the primary explanation at this learner stage.';
    }
  });
  return fixtureData;
}

test('complete evidence-backed content integrity audit passes', () => {
  const { source, research, audit } = productionFixture();
  const report = validateContentIntegrityAudit(audit, source, research);
  assert.equal(report.status, 'PASS');
  assert.deepEqual(report.summary.classificationTotals, { A: 20, B: 0, C: 0, D: 0 });
});

test('untaught questions, incomplete Build reviews, and manufactured semantic approval fail', () => {
  const { source, research, audit } = productionFixture();
  audit.questionAudits[0].classification = 'D';
  audit.buildAudits[0].hiddenPrerequisitesRemaining.push('An unexplained framework API');
  audit.semanticReview = { status: 'PASS' };
  const report = validateContentIntegrityAudit(audit, source, research);
  assert.equal(report.status, 'FAIL');
  assert.ok(report.findings.some((finding) => finding.code === 'V020-B032'));
  assert.ok(report.findings.some((finding) => finding.code === 'V020-B051'));
  assert.ok(report.findings.some((finding) => finding.code === 'V020-B057'));
});

test('changed resources require candidate comparison evidence', () => {
  const { source, research, audit } = productionFixture();
  audit.resourceAudits[0].decision = 'replaced';
  const report = validateContentIntegrityAudit(audit, source, research);
  assert.equal(report.status, 'FAIL');
  assert.ok(report.findings.some((finding) => finding.code === 'V020-B025'));
});

test('classification evidence cannot hide required knowledge in Optional or future material', () => {
  const { source, research, audit } = productionFixture();
  const firstWeek = source.weeks[0];
  firstWeek.study.resources[0].role = 'optional';
  firstWeek.study.coreMinimum -= 1;
  const report = validateContentIntegrityAudit(audit, source, research);
  assert.equal(report.status, 'FAIL');
  assert.ok(report.findings.some((finding) => finding.code === 'V020-B062'));

  const badPrior = productionFixture();
  badPrior.source.weeks[0].builds[0].learnerGuide.priorKnowledgeCompetencyIds = [badPrior.source.weeks[0].competencyIds[0]];
  const priorReport = validateContentIntegrityAudit(badPrior.audit, badPrior.source, badPrior.research);
  assert.equal(priorReport.status, 'FAIL');
  assert.ok(priorReport.findings.some((finding) => finding.code === 'V020-B066'));
});

test('prospective audit accepts prerequisites already learned and an earlier explicit bridge', () => {
  const learned = prospectiveFixture();
  const secondWeek = learned.source.weeks[1];
  const secondWeekResourceId = secondWeek.study.resources[0].resourceId;
  learned.audit.resourceAudits.find((record) => record.resourceId === secondWeekResourceId)
    .prerequisiteFit.assumedCompetencyIds = [learned.source.weeks[0].competencyIds[0]];
  assert.equal(validateContentIntegrityAudit(learned.audit, learned.source, learned.research).status, 'PASS');

  const bridged = prospectiveFixture();
  const firstWeekAssignments = bridged.source.weeks[0].study.resources;
  assert.ok(firstWeekAssignments.length >= 2, 'Fixture requires two ordered Study assignments.');
  const bridgedAudit = bridged.audit.resourceAudits.find((record) => record.resourceId === firstWeekAssignments[1].resourceId);
  bridgedAudit.prerequisiteFit.resolution = 'bridge';
  bridgedAudit.prerequisiteFit.bridgeResourceIds = [firstWeekAssignments[0].resourceId];
  assert.equal(validateContentIntegrityAudit(bridged.audit, bridged.source, bridged.research).status, 'PASS');
});

test('prospective audit blocks an untaught resource prerequisite or unresolved assumption', () => {
  const { source, research, audit } = prospectiveFixture();
  const firstResourceId = source.weeks[0].study.resources[0].resourceId;
  const record = audit.resourceAudits.find((item) => item.resourceId === firstResourceId);
  record.prerequisiteFit.assumedCompetencyIds = [source.weeks[1].competencyIds[0]];
  record.prerequisiteFit.unresolvedAssumptions = ['An unexplained professional tool'];
  const report = validateContentIntegrityAudit(audit, source, research);
  assert.equal(report.status, 'FAIL');
  assert.ok(report.findings.some((finding) => finding.code === 'V020-B069'));
  assert.ok(report.findings.some((finding) => finding.code === 'V020-B070'));
});

test('documentation used to teach a beginner requires review but reference use does not', () => {
  const teaching = prospectiveFixture();
  const assignment = teaching.source.weeks[0].study.resources[0];
  const resource = teaching.source.resources.find((item) => item.id === assignment.resourceId);
  const auditRecord = teaching.audit.resourceAudits.find((item) => item.resourceId === assignment.resourceId);
  resource.format = 'documentation';
  assignment.learningRole = 'learn';
  auditRecord.learningRole = 'learn';
  auditRecord.modalityReview.selectedFormat = 'documentation';
  auditRecord.modalityReview.consideredFormats = ['documentation'];
  delete auditRecord.documentationTeachingJustification;
  const teachingReport = validateContentIntegrityAudit(teaching.audit, teaching.source, teaching.research);
  assert.equal(teachingReport.status, 'PASS');
  assert.ok(teachingReport.findings.some((finding) => finding.code === 'V020-W001'));

  assignment.learningRole = 'reference';
  auditRecord.learningRole = 'reference';
  const referenceReport = validateContentIntegrityAudit(teaching.audit, teaching.source, teaching.research);
  assert.ok(!referenceReport.findings.some((finding) => finding.code === 'V020-W001'));
});

test('prospective audit blocks a Core competency without near-term application', () => {
  const { source, research, audit } = prospectiveFixture();
  const competencyId = source.competencies.find((competency) => competency.importance === 'core').id;
  source.weeks.forEach((week) => {
    week.study.resources.forEach((assignment) => {
      if (assignment.competencyIds.includes(competencyId) && assignment.learningRole === 'practice') assignment.learningRole = 'learn';
      const record = audit.resourceAudits.find((item) => item.resourceId === assignment.resourceId);
      if (record) record.learningRole = assignment.learningRole;
    });
    week.builds.forEach((build) => {
      build.competencyIds = build.competencyIds.filter((id) => id !== competencyId);
    });
  });
  const report = validateContentIntegrityAudit(audit, source, research);
  assert.equal(report.status, 'FAIL');
  assert.ok(report.findings.some((finding) => finding.code === 'V020-B075'));
});

test('prospective audit permits a different recovery route and imposes no modality quota', () => {
  const { source, research, audit } = prospectiveFixture();
  source.resources.forEach((resource) => { resource.format = 'documentation'; });
  audit.resourceAudits.forEach((record) => {
    record.modalityReview = {
      consideredFormats: ['documentation'],
      selectedFormat: 'documentation',
      rationale: 'Only documentation materially improves this fixture need; no quota requires another format.',
    };
    record.documentationTeachingJustification = 'Direct inspection found this concise section appropriate for the learner stage.';
  });
  audit.resourceAudits[1].recoveryAlternative = {
    primaryResourceId: audit.resourceAudits[0].resourceId,
    difference: 'Uses a smaller worked example and additional scaffolding rather than repeating the primary explanation.',
  };
  const report = validateContentIntegrityAudit(audit, source, research);
  assert.equal(report.status, 'PASS');
  assert.equal(report.findings.filter((finding) => finding.code === 'V020-W001').length, 0);
});

test('prospective audit flags potentially redundant same-role resources for review', () => {
  const { source, research, audit } = prospectiveFixture();
  const assignments = source.weeks[0].study.resources;
  assert.ok(assignments.length >= 2, 'Fixture requires two Study assignments.');
  assignments[1].learningRole = assignments[0].learningRole;
  assignments[1].competencyIds = [...assignments[0].competencyIds];
  const firstResource = source.resources.find((resource) => resource.id === assignments[0].resourceId);
  const secondResource = source.resources.find((resource) => resource.id === assignments[1].resourceId);
  secondResource.format = firstResource.format;
  const secondAudit = audit.resourceAudits.find((record) => record.resourceId === assignments[1].resourceId);
  secondAudit.learningRole = assignments[1].learningRole;
  secondAudit.modalityReview.selectedFormat = secondResource.format;
  secondAudit.modalityReview.consideredFormats = [secondResource.format];
  const report = validateContentIntegrityAudit(audit, source, research);
  assert.equal(report.status, 'PASS');
  assert.ok(report.findings.some((finding) => finding.code === 'V020-W002'));
});
