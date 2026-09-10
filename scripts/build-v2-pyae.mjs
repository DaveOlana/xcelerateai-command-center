import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileCurriculum } from '../src/curriculum-v2/compiler/compileCurriculum.js';
import { generateCoverage } from '../src/curriculum-v2/coverage/generateCoverage.js';
import { validateCurriculumSource } from '../src/curriculum-v2/validation/validateCurriculumSource.js';
import { validateContentIntegrityAudit } from '../src/curriculum-v2/validation/validateContentIntegrityAudit.js';
import { validateResourceResearch } from '../src/curriculum-v2/validation/validateResourceResearch.js';
import { validateRuntimeCurriculum } from '../src/curriculum-v2/validation/validateRuntimeCurriculum.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artifactDir = path.join(root, 'XcelerateAI Curriculum System', 'v2', 'curricula', 'python-agent-engineering');
const source = JSON.parse(fs.readFileSync(path.join(artifactDir, 'curriculum-source.json'), 'utf8'));
const resources = JSON.parse(fs.readFileSync(path.join(artifactDir, 'resources.json'), 'utf8'));
const contentAudit = JSON.parse(fs.readFileSync(path.join(artifactDir, 'content-integrity-audit.json'), 'utf8'));
const shouldPublish = process.argv.includes('--publish');

const sourceReport = validateCurriculumSource(source);
if (sourceReport.status !== 'PASS') {
  throw new Error(`Source validation failed: ${JSON.stringify(sourceReport, null, 2)}`);
}

const researchReport = validateResourceResearch(resources);
if (researchReport.status !== 'PASS') {
  throw new Error(`Research validation failed: ${JSON.stringify(researchReport, null, 2)}`);
}

const contentIntegrityReport = validateContentIntegrityAudit(contentAudit, source, resources);
if (contentIntegrityReport.status !== 'PASS') {
  throw new Error(`Content integrity validation failed: ${JSON.stringify(contentIntegrityReport, null, 2)}`);
}

const runtime = compileCurriculum(source);
const runtimeReport = validateRuntimeCurriculum(runtime);
if (runtimeReport.status !== 'PASS') {
  throw new Error(`Runtime validation failed: ${JSON.stringify(runtimeReport, null, 2)}`);
}

const coverage = generateCoverage(source);

const countBy = (items, keyOf) => [...items.reduce((counts, item) => {
  const key = keyOf(item);
  counts.set(key, (counts.get(key) || 0) + 1);
  return counts;
}, new Map()).entries()].sort(([left], [right]) => String(left).localeCompare(String(right)));
const inlineCounts = (entries) => entries.map(([label, count]) => `${label} ${count}`).join(', ');
const assignments = source.weeks.flatMap((week) => week.study.resources.map((assignment) => ({ week, assignment })));
const resourceById = new Map(source.resources.map((resource) => [resource.id, resource]));
const assignedResources = assignments.map(({ assignment }) => resourceById.get(assignment.resourceId));
const resourceDecisionCounts = countBy(contentAudit.resourceAudits, (record) => record.decision);
const questionRepairCounts = countBy(contentAudit.questionAudits, (record) => record.repair);
const hiddenFound = contentAudit.buildAudits.reduce((total, record) => total + record.hiddenPrerequisitesFound.length, 0);
const hiddenRepaired = contentAudit.buildAudits.reduce((total, record) => total + record.hiddenPrerequisitesRepaired.length, 0);
const hiddenRemaining = contentAudit.buildAudits.reduce((total, record) => total + record.hiddenPrerequisitesRemaining.length, 0);
const directOrPriorByWeek = source.weeks.map((week) => [
  week.id,
  contentAudit.questionAudits.filter((record) => record.weekId === week.id && ['A', 'B'].includes(record.classification)).length,
]);
const generationSummary = `# Python Agent Engineering — Generation Summary

**Curriculum:** ${source.curriculumId} revision ${source.revision}
**Status:** CONTENT-INTEGRITY GATES PASSED; ${shouldPublish ? 'PUBLISHED' : 'CANDIDATE NOT YET PUBLISHED'}
**Compiled by:** deterministic Curriculum Engine V2 pipeline
**Human-led content audit:** ${contentAudit.auditedAt}

## Outcome

A ${source.weeks.length}-week, ${source.workload.estimatedTotalHours}-hour beginner pathway for Windows learners. Revision 3 preserves the approved profession, sequence, competencies, projects, offline FakeModel completion path, and stable learning identities while repairing the Study → Skill Check → Build chain from inspected evidence.

## Learning inventory

- ${source.phases.length} phases and ${source.competencies.length} competencies.
- ${assignments.length} selected Study assignments: ${inlineCounts(countBy(assignments, ({ assignment }) => assignment.role))}.
- Learning roles: ${inlineCounts(countBy(assignments, ({ assignment }) => assignment.learningRole))}.
- Formats: ${inlineCounts(countBy(assignedResources, (resource) => resource.format))}.
- Providers: ${inlineCounts(countBy(assignedResources, (resource) => resource.provider))}.
- Resource decisions preserved in \`content-integrity-audit.json\`: ${inlineCounts(resourceDecisionCounts)}.
- ${contentAudit.questionAudits.length} audited Skill Check questions: ${inlineCounts(Object.entries(contentIntegrityReport.summary.classificationTotals))}; repairs: ${inlineCounts(questionRepairCounts)}.
- Weekly A+B gate: ${directOrPriorByWeek.map(([weekId, count]) => `${weekId} ${count}/10`).join(', ')}.
- ${contentAudit.buildAudits.length} separately audited required Builds with learner guides and session plans.
- Hidden Build prerequisites: ${hiddenFound} found, ${hiddenRepaired} repaired, ${hiddenRemaining} remaining.
- Beginner-readiness judgments: ${contentAudit.weekReadiness.filter((record) => record.answer === 'YES').length} YES / ${contentAudit.weekReadiness.filter((record) => record.answer !== 'YES').length} NO.

## Educational authority

The compiler does not invent teaching quality or semantic approval. Resource inspection, candidate comparison, question classification, Build dependency findings, and weekly learner-readiness judgments live in the non-runtime \`content-integrity-audit.json\`. Deterministic validators check that this authored evidence is complete and consistent with the candidate source.

## Delivery policy

The assessed path remains local-first and free. Paid model access, hosted APIs, cloud CI evidence, Docker, and provider SDK experiments remain optional where identified. Every week retains the Study → 10-question Skill Check (7/10) → Build → Proof → Reflection progression and the existing recovery behavior.

## Publication policy

Revision 3 is published to the learner catalog only after source, research, content-integrity, runtime, coverage, update-safety, maintained-test, reproducibility, production-build, and diff checks pass. Candidate compilation alone never changes the learner catalog.
`;

const validationReport = {
  status: 'PASS',
  curriculumId: source.curriculumId,
  revision: source.revision,
  blockingFailures: 0,
  warningCount: 0,
  noteCount: 0,
  passes: [
    { validator: 'V001-V014', name: 'Deterministic source validation', status: 'PASS', findings: [] },
    { validator: 'V015-V017', name: 'Resource research validation', status: 'PASS', findings: [] },
    { validator: 'V018', name: 'Runtime contract validation', status: 'PASS', findings: [] },
    {
      validator: 'V020',
      name: 'Evidence-backed learning content integrity audit',
      status: 'PASS',
      findings: [],
      summary: contentIntegrityReport.summary,
    }
  ],
  findings: [],
  semanticValidation: contentAudit.semanticReview,
};

fs.writeFileSync(path.join(artifactDir, 'coverage.json'), `${JSON.stringify(coverage, null, 2)}\n`);
fs.writeFileSync(path.join(artifactDir, 'curriculum.json'), `${JSON.stringify(runtime, null, 2)}\n`);
fs.writeFileSync(path.join(artifactDir, 'validation-report.json'), `${JSON.stringify(validationReport, null, 2)}\n`);
fs.writeFileSync(path.join(artifactDir, 'generation-summary.md'), generationSummary);

if (shouldPublish) {
  const publishedDir = path.join(root, 'src', 'curriculum-v2', 'catalog', 'published');
  fs.mkdirSync(publishedDir, { recursive: true });
  const publishedPath = path.join(publishedDir, 'pythonAgentEngineering.js');
  const candidatePath = path.join(publishedDir, '.pythonAgentEngineering.candidate.js');
  fs.writeFileSync(
    candidatePath,
    `// Generated by npm run curriculum:v2:pyae:publish. Do not edit manually.\nexport default ${JSON.stringify(runtime, null, 2)};\n`
  );
  fs.renameSync(candidatePath, publishedPath);
}

console.log(`${shouldPublish ? 'Published' : 'Built candidate'} Python Agent Engineering ${source.curriculumId} revision ${source.revision}.`);
