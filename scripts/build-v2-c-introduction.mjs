import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileCurriculum } from '../src/curriculum-v2/compiler/compileCurriculum.js';
import { generateCoverage } from '../src/curriculum-v2/coverage/generateCoverage.js';
import { validateContentIntegrityAudit } from '../src/curriculum-v2/validation/validateContentIntegrityAudit.js';
import { validateCurriculumSource } from '../src/curriculum-v2/validation/validateCurriculumSource.js';
import { validateResourceResearch } from '../src/curriculum-v2/validation/validateResourceResearch.js';
import { validateRuntimeCurriculum } from '../src/curriculum-v2/validation/validateRuntimeCurriculum.js';
import { validateSkillCheckAuthoring } from '../src/curriculum-v2/validation/validateSkillCheckAuthoring.js';
import { validateStudioActivities } from '../src/curriculum-v2/validation/validateStudioActivities.js';
import { audit, learningDesign, profession, research, source, studio } from './c-r2/assemble.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artifactDir = path.join(root, 'XcelerateAI Curriculum System', 'v2', 'curricula', 'introductory-computer-science', 'c-introduction-r2');
const shouldPublish = process.argv.includes('--publish');
const writeJson = (name, value) => fs.writeFileSync(path.join(artifactDir, name), `${JSON.stringify(value, null, 2)}\n`);

const gates = [
  ['Source', validateCurriculumSource(source)],
  ['Resource research', validateResourceResearch(research)],
  ['Content integrity', validateContentIntegrityAudit(audit, source, research)],
  ['Studio activities', validateStudioActivities(studio, source)],
  ['Skill Check authoring', validateSkillCheckAuthoring(audit, source)],
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
const questionCount = source.weeks.reduce((sum, week) => sum + week.skillCheck.questions.length, 0);
const coreAssignments = source.weeks.flatMap((week) => week.study.resources).filter((assignment) => assignment.role === 'core');

const validationReport = {
  status: 'PASS', curriculumId: source.curriculumId, revision: source.revision,
  candidateOnly: !shouldPublish, published: shouldPublish, blockingFailures: 0, warningCount: 0, noteCount: 2,
  passes: [
    { validator: 'V001-V014', name: 'Deterministic source validation', status: 'PASS', findings: [], summary: gates[0][1].summary },
    { validator: 'V012', name: 'Live resource research evidence', status: 'PASS', findings: [], summary: { selectedResources: research.length, checkedAt: audit.auditedAt } },
    { validator: 'V020', name: 'Evidence-backed content integrity', status: 'PASS', findings: [], summary: gates[2][1].summary },
    { validator: 'V021', name: 'Build-integrated Studio learner contracts', status: 'PASS', findings: [] },
    { validator: 'V022', name: 'Skill Check authoring and assessment coverage', status: 'PASS', findings: [], summary: gates[4][1].summary },
    { validator: 'V018', name: 'Compiled runtime validation', status: 'PASS', findings: [], summary: runtimeReport.summary },
  ],
  findings: [
    { severity: 'NOTE', message: 'The withdrawn CLNG Revision 1 artifact remains preserved for comparison and is not a learner-catalog entry.' },
    { severity: 'NOTE', message: 'External resource access and exact consumption boundaries must be rechecked before a future curriculum revision.' },
  ],
  semanticValidation: audit.semanticReview,
};

const generationSummary = `# C Programming Foundations R2 — Generation Summary

**Curriculum:** ${source.curriculumId} revision ${source.revision}
**Status:** ALL CURRICULUM GATES PASSED; ${shouldPublish ? 'PUBLISHED TO THE LOCAL CATALOG MODULE' : 'CANDIDATE NOT YET PUBLISHED'}
**Research and editorial audit:** ${audit.auditedAt}
**Compiler:** deterministic Curriculum Engine V2

## Outcome

An eight-week, 48-hour beginner path from compiling a first warning-clean C17 program through bounded input, decisions, arrays, functions, strings, pointers, structs, defensive file handling, debugging, checks, and a documented CLI. Setup is separate and every capability can be skipped only after verification.

## Inventory

- ${source.phases.length} phases, ${source.competencies.length} atomic competencies, ${source.concepts.length} contextual concept references, and ${source.projects.length} projects.
- ${source.resources.length} live-inspected Study resources; ${coreAssignments.length} Core assignments and ${source.resources.length - coreAssignments.length} optional assignments.
- ${questionCount} hand-authored questions, 10 per week, with distinct assessment targets, evidence mappings, 7/10 pass logic, unlimited attempts, and per-attempt option shuffling.
- Eight distinct required Builds: seven progressively stronger smaller programs and a larger Week 8 CLI.
- Every Build contains sessions of at most two hours, concrete steps, acceptance criteria, starter scaffolds, deliberate debugging, normal/boundary/invalid evidence, and a human-reviewable Proof contract.

## Resource design

Resources were selected point by point from current official tool documentation and credible C teaching destinations. Demonstrations establish the tool and memory models; guided explanations introduce language ideas; references are assigned only at exact operational boundaries. No external source is delegated as an unbounded whole course.

## Repairs from withdrawn Revision 1

- Removed generated definition-card pages as the primary learning route.
- Replaced the calculator-first opening with a true edit, warning-enabled compile, run, diagnostic-reading, and repair experience.
- Deferred calculator-like composition until Week 5, after typed values, input, decisions, loops, arrays, and function contracts.
- Made C-specific safety visible: conversion counts, type/specifier agreement, divisor validation, array bounds, NUL termination, pointer validity, checked parsing, and non-destructive file failures.
- Rewrote and source-mapped all ${questionCount} Skill Check items under the repository authoring standard.

## Publication policy

The compiler does not manufacture semantic approval. Human-led resource inspection, question judgments, Build dependency review, adversarial findings, and repairs are preserved in content-integrity-audit.json. The generated catalog module is written only when --publish is explicitly supplied, and becomes production-authoritative only after repository tests, the production build, commit, push, and deployment succeed.
`;

fs.mkdirSync(artifactDir, { recursive: true });
writeJson('profession.json', profession);
writeJson('competencies.json', source.competencies);
writeJson('resources.json', research);
writeJson('learning-design.json', learningDesign);
writeJson('curriculum-source.json', source);
writeJson('content-integrity-audit.json', audit);
writeJson('studio-activities.json', studio);
writeJson('coverage.json', coverage);
writeJson('curriculum.json', runtime);
writeJson('validation-report.json', validationReport);
fs.writeFileSync(path.join(artifactDir, 'generation-summary.md'), generationSummary);

if (shouldPublish) {
  const publishedDir = path.join(root, 'src', 'curriculum-v2', 'catalog', 'published');
  const candidatePath = path.join(publishedDir, '.cProgrammingFoundations.candidate.js');
  const publishedPath = path.join(publishedDir, 'cProgrammingFoundations.js');
  fs.writeFileSync(candidatePath, `// Generated by npm run curriculum:v2:c:publish. Do not edit manually.\nexport default ${JSON.stringify(runtime, null, 2)};\n`);
  fs.renameSync(candidatePath, publishedPath);
}

console.log(`${shouldPublish ? 'Published' : 'Built candidate'} C Programming Foundations CLNG revision 2: ${source.weeks.length} weeks, ${source.resources.length} resources, ${questionCount} questions.`);
