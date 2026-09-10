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
