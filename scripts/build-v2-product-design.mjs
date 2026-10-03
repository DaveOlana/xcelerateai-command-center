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
const artifactDir = path.join(root, 'XcelerateAI Curriculum System', 'v2', 'curricula', 'product-design');
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
if (runtimeReport.status !== 'PASS') {
  throw new Error(`Runtime validation failed: ${JSON.stringify(runtimeReport, null, 2)}`);
}

const contentIntegrityReport = gates[2][1];
const coverage = generateCoverage(source);
const assignments = source.weeks.flatMap((week) => week.study.resources);
const resourceById = new Map(source.resources.map((resource) => [resource.id, resource]));
const countBy = (items, keyOf) => Object.fromEntries([...items.reduce((counts, item) => {
  const key = keyOf(item);
  counts.set(key, (counts.get(key) || 0) + 1);
  return counts;
}, new Map()).entries()].sort(([left], [right]) => String(left).localeCompare(String(right))));
const classificationTotals = countBy(contentAudit.questionAudits, (item) => item.classification);

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
    { validator: 'V020', name: 'Evidence-backed learning content integrity audit', status: 'PASS', findings: [], summary: contentIntegrityReport.summary },
    { validator: 'V021', name: 'Studio learner contract validation', status: 'PASS', findings: [] },
    { validator: 'V022', name: 'Skill Check authoring and assessment-map validation', status: 'PASS', findings: [], summary: gates[4][1].summary },
  ],
  findings: [],
  semanticValidation: contentAudit.semanticReview,
};

const generationSummary = `# Product Design — Generation Summary

**Curriculum:** ${source.curriculumId} revision ${source.revision}
**Status:** ALL CURRICULUM GATES PASSED; ${shouldPublish ? 'PUBLISHED' : 'CANDIDATE NOT YET PUBLISHED'}
**Compiled by:** deterministic Curriculum Engine V2 pipeline
**Human-led content audit:** ${contentAudit.auditedAt}

## Outcome

A ${source.weeks.length}-week, ${source.workload.estimatedTotalHours}-hour beginner pathway from design foundations through research, interaction, visual systems, accessibility, handoff, and an independent portfolio capstone. Figma Starter is the primary tool; paid Figma capabilities are never required, and Penpot is documented as the free open-source alternative.

## Learning inventory

- ${source.phases.length} phases, ${source.competencies.length} competencies, ${source.concepts.length} concepts, and ${source.projects.length} progressively less-scaffolded projects.
- ${source.resources.length} researched resources and ${assignments.length} point-of-use Study assignments.
- Learning roles: ${JSON.stringify(countBy(assignments, (item) => item.learningRole))}.
- Formats: ${JSON.stringify(countBy(assignments, (item) => resourceById.get(item.resourceId).format))}.
- ${contentAudit.questionAudits.length} scenario-based questions, classified ${JSON.stringify(classificationTotals)}.
- ${contentAudit.buildAudits.length} required Builds and ${contentAudit.weekReadiness.length} beginner-readiness judgments.
- Every Week follows Study → Skill Check → Build → Proof → Reflect → Complete, uses 10 questions, and requires 7/10.

## Educational authority

The compiler does not manufacture semantic approval. Inspected resources, candidate comparisons, question evidence, Build-dependency judgments, weekly readiness, and adversarial repairs live in the non-runtime content-integrity audit. Deterministic validators confirm that the evidence is complete and consistent with the candidate.

## Free completion route

The assessed path uses free public learning resources, the local XcelerateAI Studio exercises, and Figma Starter capabilities. Paid Dev Mode, organization libraries, premium AI, and paid prototype features are optional and are not prerequisites for assessment. Manual specifications, exports, annotations, and share links provide the required handoff route.

## Publication policy

Publication is atomic: the generated runtime replaces the catalog module only after source, research, content-integrity, compilation, and runtime gates pass without blockers or warnings. Full repository tests and the production build remain required release gates.
`;

fs.writeFileSync(path.join(artifactDir, 'coverage.json'), `${JSON.stringify(coverage, null, 2)}\n`);
fs.writeFileSync(path.join(artifactDir, 'curriculum.json'), `${JSON.stringify(runtime, null, 2)}\n`);
fs.writeFileSync(path.join(artifactDir, 'validation-report.json'), `${JSON.stringify(validationReport, null, 2)}\n`);
fs.writeFileSync(path.join(artifactDir, 'generation-summary.md'), generationSummary);
fs.mkdirSync(path.join(root, 'public', 'curriculum'), { recursive: true });
fs.writeFileSync(path.join(root, 'public', 'curriculum', 'product-design-studio.html'), renderStudio(studioActivities));

if (shouldPublish) {
  const publishedDir = path.join(root, 'src', 'curriculum-v2', 'catalog', 'published');
  fs.mkdirSync(publishedDir, { recursive: true });
  const publishedPath = path.join(publishedDir, 'productDesign.js');
  const candidatePath = path.join(publishedDir, '.productDesign.candidate.js');
  fs.writeFileSync(candidatePath, `// Generated by npm run curriculum:v2:product-design:publish. Do not edit manually.\nexport default ${JSON.stringify(runtime, null, 2)};\n`);
  fs.renameSync(candidatePath, publishedPath);
}

console.log(`${shouldPublish ? 'Published' : 'Built candidate'} Product Design ${source.curriculumId} revision ${source.revision}.`);

function renderStudio(studio) {
  const data = JSON.stringify(studio.activities).replaceAll('<', '\\u003c');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>XcelerateAI Product Design Studio</title><style>
:root{color-scheme:light dark;font-family:Inter,ui-sans-serif,system-ui,sans-serif;background:#f5f6fa;color:#172033}body{margin:0}.shell{max-width:920px;margin:auto;padding:32px 20px 64px}.eyebrow{color:#5b4ae8;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.card{background:#fff;border:1px solid #dfe3ec;border-radius:20px;padding:28px;box-shadow:0 18px 50px #26355914;margin:18px 0}.contract{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.item{background:#f5f6fa;border-radius:12px;padding:14px}.item strong{display:block;margin-bottom:5px}li{margin:.65rem 0;line-height:1.55}a{color:#4f46e5}.error{border-color:#b42318;color:#b42318}@media(max-width:650px){.contract{grid-template-columns:1fr}.card{padding:20px}}@media(prefers-color-scheme:dark){:root{background:#08101f;color:#eef1f7}.card{background:#101a2c;border-color:#27344b}.item{background:#172237}a{color:#a99fff}}
</style></head><body><main class="shell" id="studio" aria-live="polite"></main><script>
const activities=${data};
const query=new URLSearchParams(location.search).get('week');
const hash=(location.hash.match(/week-(\\d+)/)||[])[1];
const requested=Number(query||hash||1);
const activity=activities.find(item=>Number(item.weekId.slice(-2))===requested);
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const list=items=>'<ol>'+items.map(item=>'<li>'+escape(item)+'</li>').join('')+'</ol>';
if(!activity){document.querySelector('#studio').innerHTML='<section class="card error"><h1>Studio week not found</h1><p>Return to Missions and open the Studio link for your current week.</p></section>'}
else{const c=activity.contract;document.title='Week '+requested+' · Product Design Studio';document.querySelector('#studio').innerHTML='<p class="eyebrow">XcelerateAI Studio · Week '+requested+'</p><h1>'+escape(activity.title)+'</h1><p>Only this week’s Studio activity is shown.</p><section class="card"><h2>Your activity contract</h2><div class="contract">'+[['What you are doing',c.doing],['Why',c.why],['What you will create',c.output],['Tools',c.tools],['Approximate time',c.estimatedMinutes+' minutes'],['Know first',c.prerequisites],['Finished looks like',c.finished],['Submit / prove',c.submission]].map(([a,b])=>'<div class="item"><strong>'+escape(a)+'</strong>'+escape(b)+'</div>').join('')+'</div></section><section class="card"><h2>Do this</h2>'+list(activity.steps)+(activity.contextualReferences?.length?'<h3>Help at the point of need</h3><ul>'+activity.contextualReferences.map(link=>'<li><a href="'+escape(link.url)+'" target="_blank" rel="noreferrer">'+escape(link.label)+'</a></li>').join('')+'</ul>':'')+'</section><section class="card"><h2>Finished-work checklist</h2>'+list(activity.checklist)+'</section><section class="card"><h2>If you get stuck</h2><p>'+escape(activity.stuck)+'</p></section>'}
</script></body></html>\n`;
}
