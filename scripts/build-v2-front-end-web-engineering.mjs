import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileCurriculum } from '../src/curriculum-v2/compiler/compileCurriculum.js';
import { generateCoverage } from '../src/curriculum-v2/coverage/generateCoverage.js';
import { validateCurriculumSource } from '../src/curriculum-v2/validation/validateCurriculumSource.js';
import { validateContentIntegrityAudit } from '../src/curriculum-v2/validation/validateContentIntegrityAudit.js';
import { validateResourceResearch } from '../src/curriculum-v2/validation/validateResourceResearch.js';
import { validateRuntimeCurriculum } from '../src/curriculum-v2/validation/validateRuntimeCurriculum.js';
import { validateStudioActivities } from '../src/curriculum-v2/validation/validateStudioActivities.js';
import { validateSkillCheckAuthoring } from '../src/curriculum-v2/validation/validateSkillCheckAuthoring.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artifactDir = path.join(root, 'XcelerateAI Curriculum System', 'v2', 'curricula', 'front-end-web-engineering');
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(artifactDir, name), 'utf8'));
const source = readJson('curriculum-source.json');
const resources = readJson('resources.json');
const contentAudit = readJson('content-integrity-audit.json');
const studioActivities = readJson('studio-activities.json');
const shouldPublish = process.argv.includes('--publish');

const gates = [
  ['Source', validateCurriculumSource(source)],
  ['Resource research', validateResourceResearch(resources)],
  ['Content integrity', validateContentIntegrityAudit(contentAudit, source, resources)],
  ['Studio activities', validateStudioActivities(studioActivities, source)],
  ['Skill Check authoring', validateSkillCheckAuthoring(contentAudit, source)],
];
for (const [name, report] of gates) {
  if (report.status !== 'PASS' || report.warningCount > 0) {
    throw new Error(`${name} validation failed: ${JSON.stringify(report, null, 2)}`);
  }
}

const runtime = compileCurriculum(source);
const runtimeReport = validateRuntimeCurriculum(runtime);
if (runtimeReport.status !== 'PASS') throw new Error(`Runtime validation failed: ${JSON.stringify(runtimeReport, null, 2)}`);

const coverage = generateCoverage(source);
const assignments = source.weeks.flatMap((week) => week.study.resources);
const resourceById = new Map(source.resources.map((resource) => [resource.id, resource]));
const countBy = (items, keyOf) => Object.fromEntries([...items.reduce((counts, item) => {
  const key = keyOf(item);
  counts.set(key, (counts.get(key) || 0) + 1);
  return counts;
}, new Map()).entries()].sort(([left], [right]) => String(left).localeCompare(String(right))));

const validationReport = {
  status: 'PASS',
  curriculumId: source.curriculumId,
  revision: source.revision,
  blockingFailures: 0,
  warningCount: 0,
  noteCount: 1,
  passes: [
    { validator: 'V001-V014', name: 'Deterministic source validation', status: 'PASS', findings: [] },
    { validator: 'V015-V017', name: 'Resource research and professional capability review', status: 'PASS', findings: [] },
    { validator: 'V018', name: 'Runtime contract validation', status: 'PASS', findings: [] },
    { validator: 'V020', name: 'Evidence-backed content integrity', status: 'PASS', findings: [], summary: gates[2][1].summary },
    { validator: 'V021', name: 'Studio learner contract', status: 'PASS', findings: [] },
    { validator: 'V022', name: 'Skill Check authoring and assessment maps', status: 'PASS', findings: [], summary: gates[4][1].summary },
  ],
  findings: [{ severity: 'NOTE', message: 'External services and resources were verified during generation and must be rechecked before a future revision.' }],
  semanticValidation: contentAudit.semanticReview,
};

const generationSummary = `# Front-End Web Engineering — Generation Summary

**Curriculum:** ${source.curriculumId} revision ${source.revision}
**Status:** ALL CURRICULUM GATES PASSED; ${shouldPublish ? 'PUBLISHED TO THE LOCAL CATALOG' : 'CANDIDATE NOT YET PUBLISHED'}
**Compiled by:** deterministic Curriculum Engine V2 pipeline
**Evidence-led semantic audit:** ${contentAudit.auditedAt}

## Outcome

A ${source.weeks.length}-week, ${source.workload.estimatedTotalHours}-hour path for a complete beginner to build, debug, test, optimize, and deploy responsive accessible web interfaces under appropriate junior supervision.

## Inventory

- ${source.phases.length} phases, ${source.competencies.length} competencies, ${source.concepts.length} concepts, and ${source.projects.length} progressively independent projects.
- ${source.resources.length} researched resources and ${assignments.length} point-of-use Study assignments.
- Learning roles: ${JSON.stringify(countBy(assignments, (item) => item.learningRole))}.
- Formats: ${JSON.stringify(countBy(assignments, (item) => resourceById.get(item.resourceId).format))}.
- ${contentAudit.questionAudits.length} individually mapped questions and ${contentAudit.buildAudits.length} separately audited required Builds.
- Every Week follows one complete Study → Skill Check → Build → Proof → Reflect → Complete journey. Guided implementation support is integrated into Build rather than presented as a separate Study resource.

## Architecture

The sequence is platform-first: HTML, CSS, responsiveness, JavaScript, DOM, HTTP, and browser debugging precede Git/tooling, TypeScript, tests, and React. Accessibility, debugging, testing, responsive work, API failure, collaboration, performance, security, and deployment recur in practical work. A meta-framework remains an optional post-graduation extension rather than replacing platform foundations.

## Publication policy

Publication is atomic. This script writes compiled artifacts first and replaces the local catalog module only after all source, research, content, Studio, Skill Check, compilation, and runtime gates pass without blockers or warnings. Repository regressions and the production application build remain final release gates.
`;

fs.writeFileSync(path.join(artifactDir, 'coverage.json'), `${JSON.stringify(coverage, null, 2)}\n`);
fs.writeFileSync(path.join(artifactDir, 'curriculum.json'), `${JSON.stringify(runtime, null, 2)}\n`);
fs.writeFileSync(path.join(artifactDir, 'validation-report.json'), `${JSON.stringify(validationReport, null, 2)}\n`);
fs.writeFileSync(path.join(artifactDir, 'generation-summary.md'), generationSummary);

if (shouldPublish) {
  const publishedDir = path.join(root, 'src', 'curriculum-v2', 'catalog', 'published');
  fs.mkdirSync(publishedDir, { recursive: true });
  const publishedPath = path.join(publishedDir, 'frontEndWebEngineering.js');
  const candidatePath = path.join(publishedDir, '.frontEndWebEngineering.candidate.js');
  fs.writeFileSync(candidatePath, `// Generated by npm run curriculum:v2:front-end:publish. Do not edit manually.\nexport default ${JSON.stringify(runtime, null, 2)};\n`);
  fs.renameSync(candidatePath, publishedPath);
}

console.log(`${shouldPublish ? 'Published' : 'Built candidate'} Front-End Web Engineering ${source.curriculumId} revision ${source.revision}.`);
