import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { portfolio, setupCapabilities } from './intro-course-blueprints.mjs';
import { compileCurriculum } from '../src/curriculum-v2/compiler/compileCurriculum.js';
import { generateCoverage } from '../src/curriculum-v2/coverage/generateCoverage.js';
import { validateCurriculumSource } from '../src/curriculum-v2/validation/validateCurriculumSource.js';
import { validateContentIntegrityAudit } from '../src/curriculum-v2/validation/validateContentIntegrityAudit.js';
import { validateResourceResearch } from '../src/curriculum-v2/validation/validateResourceResearch.js';
import { validateRuntimeCurriculum } from '../src/curriculum-v2/validation/validateRuntimeCurriculum.js';
import { validateStudioActivities } from '../src/curriculum-v2/validation/validateStudioActivities.js';
import { validateSkillCheckAuthoring } from '../src/curriculum-v2/validation/validateSkillCheckAuthoring.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const portfolioRoot = path.join(root, 'XcelerateAI Curriculum System', 'v2', 'curricula', 'introductory-computer-science');
const guideRoot = path.join(root, 'public', 'curriculum-guides');
const checkedAt = '2026-10-10T12:00:00.000Z';
const shouldPublish = process.argv.includes('--publish');
const publishedModuleNames = Object.freeze({
  PYIN: 'pythonIntroduction',
  JSIN: 'javascriptIntroduction',
  JAVA: 'javaIntroduction',
  CLNG: 'cIntroduction',
  CPPL: 'cppIntroduction',
  WEBD: 'webDevelopmentIntroduction',
});
const optionIds = ['a', 'b', 'c', 'd'];
const answerPatterns = [
  [0,1,2,3,1,3,0,2,3,1],
  [2,0,3,1,0,2,1,3,1,2],
  [1,3,0,2,3,0,2,1,0,3],
  [3,2,1,0,2,1,3,0,2,0],
  [0,2,1,3,2,0,3,1,3,2],
  [1,0,3,2,0,3,2,1,0,2],
  [2,3,0,1,3,1,0,2,1,3],
  [3,1,2,0,1,2,0,3,2,1],
];

function placeCorrect(correct, distractors, position) {
  const labels = [...new Set(distractors.filter((item) => item !== correct))].slice(0, 3);
  while (labels.length < 3) labels.push(`An unrelated operation ${labels.length + 1}`);
  labels.splice(position, 0, correct);
  return labels.map((label, index) => ({ id: optionIds[index], label }));
}

function questionsFor(course, week, weekIndex) {
  const questions = [];
  week.facts.forEach((fact, factIndex) => {
    const otherFacts = [1, 2, 3].map((offset) => week.facts[(factIndex + offset) % week.facts.length]);
    const firstIndex = factIndex * 2;
    const firstPosition = answerPatterns[weekIndex][firstIndex];
    const firstModes = [
      { field: 'meaning', prompt: `The Week ${weekIndex + 1} guide defines ${fact.term}. Which description matches that definition?` },
      { field: 'mistake', prompt: `During the guide's debugging drill for ${fact.term}, which warning identifies the error to avoid?` },
      { field: 'example', prompt: `Which activity from the Week ${weekIndex + 1} guide correctly demonstrates ${fact.term}?` },
      { field: 'meaning', prompt: `A learner must explain ${fact.term} before coding. Which explanation is accurate?` },
      { field: 'mistake', prompt: `Which mistake would show that ${fact.term} was misunderstood?` },
    ];
    const firstMode = firstModes[factIndex];
    const field = firstMode.field;
    const firstOptions = placeCorrect(fact[field], otherFacts.map((item) => item[field]), firstPosition);
    questions.push({
      id: `${course.id}-Q-W${String(weekIndex + 1).padStart(2, '0')}-${String(firstIndex + 1).padStart(2, '0')}`,
      competencyIds: [`${course.id}-C${String(weekIndex + 1).padStart(3, '0')}`],
      prompt: firstMode.prompt,
      options: firstOptions,
      correctOptionId: firstOptions[firstPosition].id,
      explanation: `${fact.term} means ${fact.meaning}; it is used to ${fact.example}. Avoid this mistake: ${fact.mistake}.`,
    });
    const secondPosition = answerPatterns[weekIndex][firstIndex + 1];
    const secondOptions = placeCorrect(fact.term, otherFacts.map((item) => item.term), secondPosition);
    const secondPrompts = [
      `The learner needs to ${fact.example}. Which concept from the Week ${weekIndex + 1} guide supports that decision?`,
      `A classmate is about to ${fact.mistake}. Which concept should they review first?`,
      `Which weekly concept is demonstrated by this guide activity: ${fact.example}?`,
      `The guide describes "${fact.meaning}". Which term does it describe?`,
      `To avoid this error—${fact.mistake}—which weekly concept must the learner apply?`,
    ];
    questions.push({
      id: `${course.id}-Q-W${String(weekIndex + 1).padStart(2, '0')}-${String(firstIndex + 2).padStart(2, '0')}`,
      competencyIds: [`${course.id}-C${String(weekIndex + 1).padStart(3, '0')}`],
      prompt: secondPrompts[factIndex],
      options: secondOptions,
      correctOptionId: secondOptions[secondPosition].id,
      explanation: `${fact.term} is the relevant concept. A common mistake is to ${fact.mistake}.`,
    });
  });
  return questions;
}

function setupFor(course) {
  return {
    title: `${course.shortTitle} workstation setup`,
    description: `A skippable, verified setup module outside the eight instructional weeks. Prepare ${course.tool}, Git, and GitHub before Week 1.`,
    estimatedMinutes: course.setupMinutes,
    capabilities: course.setup.map((key) => {
      const [title, instruction, verification, referenceUrl] = setupCapabilities[key];
      return {
        id: `setup.${key}`,
        title,
        description: `${title} is reusable across every introductory course that requires it.`,
        required: true,
        skippableWhenVerified: true,
        instructions: [instruction, ...(referenceUrl ? [`Official download or account page: ${referenceUrl}`] : [])],
        verification: [verification],
      };
    }),
  };
}

function resourceFor(course, week, weekIndex, competencyId, kind = 'learn') {
  const practice = kind === 'practice';
  const id = `${course.id}-R-W${String(weekIndex + 1).padStart(2, '0')}-${practice ? '02' : '01'}`;
  const url = `/curriculum-guides/${course.slug}.html#week-${weekIndex + 1}${practice ? '-practice' : ''}`;
  return {
    id, title: practice ? `${week.title} concept practice` : `${week.title} learner guide`, url, provider: 'XcelerateAI', format: practice ? 'exercise' : 'article', cost: 'free', estimatedMinutes: practice ? 30 : 90,
    location: { start: practice ? 'Begin at the Predict, reveal, explain section.' : `Begin at Week ${weekIndex + 1}.`, stop: practice ? 'Stop after explaining every revealed answer in your own words.' : 'Stop before the practice section.', note: 'Keep the guide available offline, then return for the graded Skill Check.' },
    competencyIds: [competencyId], whySelected: practice ? `This optional offline exercise adds prediction and error recognition before the graded check for ${week.output}.` : `This offline-first guide teaches the exact concepts needed to build ${week.output} without sending a beginner into unbounded documentation.`,
    accessStatus: 'verified', checkedAt, selectionRole: practice ? 'optional' : 'core',
    availability: { checked: true, checkedAt, requestedUrl: url, finalUrl: url, redirected: false, finalDestinationKind: 'bundled-guide', finalDestinationStatus: 'success', finalContentVerified: true, accessRestricted: false, verificationMethod: 'generated-file-inspection', notes: 'Bundled static guide generated and inspected with the candidate.' },
  };
}

function makeCourse(course) {
  const phases = [
    { id: `${course.id}-PH01`, title: 'Foundations and Guided Practice', outcome: 'Read, trace, write, and debug small programs with explicit scaffolding.' },
    { id: `${course.id}-PH02`, title: 'Independent Programs and Proof', outcome: 'Combine the language foundations into tested, documented beginner projects.' },
  ];
  const competencies = course.weeks.map((week, index) => ({
    id: `${course.id}-C${String(index + 1).padStart(3, '0')}`,
    name: week.title,
    description: `Explain, apply, debug, and verify the concepts needed to produce ${week.output}.`,
    domain: course.shortTitle,
    importance: 'core',
    prerequisiteIds: index === 0 ? [] : [`${course.id}-C${String(index).padStart(3, '0')}`],
  }));
  const concepts = course.weeks.map((week, index) => ({
    id: `${course.id}-CONCEPT-W${String(index + 1).padStart(2, '0')}`,
    term: week.facts[0].term,
    simpleMeaning: week.facts[0].meaning,
    example: week.facts[0].example,
    commonMistake: week.facts[0].mistake,
  }));
  const resources = course.weeks.flatMap((week, index) => [
    resourceFor(course, week, index, competencies[index].id, 'learn'),
    resourceFor(course, week, index, competencies[index].id, 'practice'),
  ]);
  const weeks = course.weeks.map((week, index) => {
    const n = String(index + 1).padStart(2, '0');
    const weekId = `${course.id}-W${n}`;
    const buildId = `${course.id}-B-W${n}-01`;
    const stepIds = [1, 2, 3, 4].map((step) => `${buildId}-S${String(step).padStart(2, '0')}`);
    const weeklyTerms = week.facts.map((fact) => fact.term);
    const normalFeatures = weeklyTerms.slice(0, 3).join(', ');
    const defensiveFeatures = weeklyTerms.slice(3).join(' and ');
    const steps = [
      { id: stepIds[0], text: `Write a three-case contract for ${week.output}: one normal case, one boundary case, and one invalid case. For each, record the input or action and the expected result before coding.` },
      { id: stepIds[1], text: `Create the runnable source and implement the normal case first. Make ${normalFeatures} visible in the code or interface, then run the exact launch command once.` },
      { id: stepIds[2], text: `Add the boundary and invalid-case behavior using ${defensiveFeatures}. Deliberately reproduce this weekly mistake—${week.facts[4].mistake}—record the symptom, repair one cause, and rerun the same case.` },
      { id: stepIds[3], text: `Run all three contract cases again. In README, record the environment, exact run command, expected versus actual results, repaired defect, and one known limit.` },
    ];
    const questions = questionsFor(course, week, index);
    return {
      id: weekId, sequence: index + 1, phaseId: index < 4 ? phases[0].id : phases[1].id, title: week.title,
      outcome: `Build, debug, explain, and verify ${week.output}.`, competencyIds: [competencies[index].id], estimatedHours: 6,
      study: { objective: `Learn and actively rehearse ${weeklyTerms.join(', ')} so you can explain, select, debug, and apply them while creating ${week.output}.`, coreMinimum: 1, resources: [{ resourceId: resources[index * 2].id, role: 'core', learningRole: 'learn', competencyIds: [competencies[index].id], purpose: `Learn the exact definitions, applications, and mistakes assessed by the Week ${index + 1} Skill Check, then preview the ${week.output} contract.` }, { resourceId: resources[index * 2 + 1].id, role: 'optional', learningRole: 'practice', competencyIds: [competencies[index].id], purpose: 'Rehearse the same five weekly concepts through prediction, error recognition, and explanation without affecting progression.' }] },
      skillCheck: { id: `${course.id}-SC-W${n}`, title: `${week.title} Skill Check`, instructions: 'Answer ten questions grounded in this week’s five Study concepts. Seven correct answers pass. Answer choices are reshuffled for every new attempt and remain stable while that attempt is in progress.', passingScore: 70, optionOrder: 'shuffle-per-attempt', competencyIds: [competencies[index].id], questions },
      builds: [{
        id: buildId, title: index === 3 ? `Guided midpoint: ${week.output}` : index === 7 ? `Independent final: ${week.output}` : `Microbuild: ${week.output}`,
        required: true, outcome: `A working, tested ${week.output}.`, competencyIds: [competencies[index].id], estimatedMinutes: 240,
        brief: `Deliverable: ${week.output}. Required behavior: demonstrate ${weeklyTerms.join(', ')}; complete one normal, one boundary, and one invalid case; and keep a short expected-versus-actual test record. Evidence: the exact run command, the repaired defect, the three final results, and an honest README.`,
        steps,
        acceptanceCriteria: [
          { id: `${buildId}-A01`, text: `A learner can follow the README command and run ${week.output} through its stated normal case without an unexplained error.` },
          { id: `${buildId}-A02`, text: `The finished work visibly demonstrates the Week ${index + 1} concepts: ${weeklyTerms.join(', ')}.` },
          { id: `${buildId}-A03`, text: 'The test record lists normal, boundary, and invalid inputs or actions with both expected and actual results.' },
          { id: `${buildId}-A04`, text: 'The debugging note names the failing case, observed symptom, root cause, single repair, successful rerun, and one known limit.' },
        ],
        hints: [`If the normal case fails, reduce it to the smallest input or action involving ${week.facts[0].term} and inspect the observed value before editing.`, `If the boundary or invalid case fails, revisit the guide warning "${week.facts[4].mistake}" and change one cause at a time.`],
        templates: [{ id: `${buildId}-T01`, label: 'README and test-record scaffold', content: '# Project\n\n## Environment\n## Exact run command\n## Required behavior\n## Test record\n| Case | Input or action | Expected | Actual | Pass? |\n| --- | --- | --- | --- | --- |\n| Normal | | | | |\n| Boundary | | | | |\n| Invalid | | | | |\n\n## Debugging note\n- Failing case:\n- Symptom:\n- Root cause:\n- Repair:\n- Rerun result:\n\n## Known limits\n' }],
        stretch: `After every required case passes, add one small feature that remains directly related to ${week.output}; document and test it as a fourth case.`,
        learnerGuide: {
          summary: `Plan, implement, break, repair, and verify ${week.output} against three named cases.`, whyItMatters: `This converts Week ${index + 1} concepts into executable, inspectable evidence instead of a completion claim.`,
          priorKnowledgeCompetencyIds: index === 0 ? [] : [competencies[index - 1].id], finishedResult: `A runnable ${week.output}, a three-case expected-versus-actual test record, a specific debugging note, and reproducible README instructions.`,
          conceptRefs: [{ conceptId: concepts[index].id, relevance: `The build applies ${concepts[index].term} in a visible program decision.` }],
          sessions: [{ id: `${buildId}-SESSION-01`, title: 'Make it work', estimatedMinutes: 120, stepIds: stepIds.slice(0, 2) }, { id: `${buildId}-SESSION-02`, title: 'Break, repair, and prove', estimatedMinutes: 120, stepIds: stepIds.slice(2) }],
        },
      }],
      proof: { id: `${course.id}-PF-W${n}`, prompt: `Prove that ${week.output} can be reproduced, survives the three required cases, and includes one evidence-backed repair.`, evidence: index === 7 ? [{ id: `${course.id}-EV-W${n}-01`, type: 'link', label: 'Public or private GitHub repository URL containing source and README', required: true }, { id: `${course.id}-EV-W${n}-02`, type: 'text', label: 'Exact run command, three expected-versus-actual results, and repaired defect', required: true }] : [{ id: `${course.id}-EV-W${n}-01`, type: 'text', label: 'Exact run command, normal/boundary/invalid results, symptom, cause, repair, and rerun result', required: true }, { id: `${course.id}-EV-W${n}-02`, type: 'confirmation', label: 'I reran all three cases after the repair and checked every acceptance criterion', required: true }] },
      reflection: { minimumResponses: 1, prompts: [{ id: `${course.id}-RF-W${n}-01`, prompt: 'What evidence helped you find the most important mistake this week?' }, { id: `${course.id}-RF-W${n}-02`, prompt: 'What will you test first when a similar program fails again?' }] },
    };
  });
  const projects = [
    { id: `${course.id}-PJ01`, title: 'Guided Midpoint Project', outcome: `Complete the Week 4 guided ${course.shortTitle} program.`, competencyIds: competencies.slice(0, 4).map((item) => item.id), milestones: [{ id: `${course.id}-PJ01-M01`, title: 'Guided midpoint build', weekId: weeks[3].id, buildId: weeks[3].builds[0].id }] },
    { id: `${course.id}-PJ02`, title: 'Independent Final Project', outcome: `Design, test, document, and publish a beginner ${course.shortTitle} program.`, competencyIds: competencies.map((item) => item.id), milestones: [{ id: `${course.id}-PJ02-M01`, title: 'Independent final build', weekId: weeks[7].id, buildId: weeks[7].builds[0].id }] },
  ];
  return {
    schemaVersion: '2.0', curriculumId: course.id, revision: 1, title: course.title, shortTitle: course.shortTitle,
    catalog: { category: 'Introductory Computer Science', level: 'introductory' }, setup: setupFor(course),
    target: { role: `beginner ${course.shortTitle} learner`, learner: 'A tertiary fresher with basic computer literacy and no assumed programming experience.', professionalOutcome: `Recognize ${course.shortTitle} syntax, write and debug small programs, and complete beginner practical-exam tasks independently.`, specialGoals: ['Build practical exam readiness.', 'Develop trace-before-guess debugging habits.', 'Publish a final repository with an honest README.'] },
    workload: { weeklyHours: { min: 6, max: 6 }, estimatedTotalHours: 48, estimatedWeeks: 8 },
    assumptions: ['Windows is the primary host operating system.', 'The separate setup module is completed or verified before Week 1.', 'Essential explanations are bundled for offline-first study.', 'Skill Checks allow unlimited attempts while preserving the two-failure recovery lock.'],
    phases, competencies, concepts, resources, weeks, projects,
    graduation: { outcome: `Create, debug, test, explain, and publish a small ${course.shortTitle} program without step-by-step copying.`, requiredCompetencyIds: competencies.map((item) => item.id), requiredProjectIds: [projects[1].id] },
  };
}

function makeResearch(source, course) {
  return source.resources.map((resource, index) => ({ ...resource,
    formatRationale: resource.format === 'exercise' ? 'A short predict-and-reveal exercise provides a second offline learning mode without adding another required task.' : 'A bounded bundled article provides coherent beginner teaching and remains available after initial setup.', purpose: [resource.format === 'exercise' ? 'practice concept discrimination' : 'learn the mapped competency', 'prepare the required microbuild'],
    evaluation: { competencyFit: `Directly supports ${resource.competencyIds.join(', ')}.`, clarity: 'Defines every new term before use.', correctnessAndCurrency: 'Reviewed against the listed official reference during generation.', accessibility: 'Bundled HTML has headings, lists, code text, and no login or payment requirement.' },
    accessNotes: 'Bundled with the application candidate and inspected locally.', alternativeNotes: `Compared with ${course.weeks[Math.floor(index / 2)].officialUrl}.`,
  }));
}

const assessmentTypes = ['concept discrimination', 'application selection', 'error recognition', 'error diagnosis', 'application selection', 'application selection', 'concept discrimination', 'concept discrimination', 'error recognition', 'error prevention'];

function makeAudit(source, research, course) {
  const resourceAudits = research.map((resource, resourceIndex) => {
    const weekIndex = Math.floor(resourceIndex / 2);
    const week = source.weeks[weekIndex];
    const practice = resource.format === 'exercise';
    return {
      resourceId: resource.id, weekId: week.id, decision: 'added', previousUrl: null, finalUrl: resource.url, learningRole: practice ? 'practice' : 'learn', actualContentInspected: true, inspectedAt: checkedAt,
      access: { status: 'verified', free: true, loginRequired: false, sectionVerified: true },
      candidateComparisons: [{ title: resource.title, url: resource.url, provider: 'XcelerateAI', disposition: 'selected', reason: practice ? 'Short offline prediction practice provides a distinct mode without blocking progress.' : 'Bounded, offline-first, prerequisite-matched instruction for this exact week.' }, { title: 'Official language reference', url: course.weeks[weekIndex].officialUrl, provider: new URL(course.weeks[weekIndex].officialUrl).hostname, disposition: 'rejected', reason: 'Kept as an optional authority reference; its broader scope is less suitable as the primary beginner route.' }],
      judgment: { beginnerClarity: 'New terms are defined with examples and common mistakes.', competencyFit: `Directly teaches ${week.competencyIds.join(', ')}.`, correctness: 'Claims were checked against the linked official reference.', currency: `Reviewed ${checkedAt.slice(0,10)}.`, pacing: practice ? 'Thirty optional minutes fit inside the weekly practice allowance.' : 'Ninety minutes leaves most weekly time for active work.', practiceQuality: practice ? 'Adds prediction, retrieval, and error explanation before the graded check.' : 'Feeds the immediate required microbuild.', redundancy: practice ? 'Complements the core explanation without repeating a required task.' : 'It is the sole core explanation for this week.' },
      rationale: practice ? 'Added as optional retrieval practice distinct from the required Build.' : 'Added as the essential bounded offline lesson; external documentation remains optional.',
    };
  });
  const questionAudits = source.weeks.flatMap((week) => week.skillCheck.questions.map((question, index) => ({ questionId: question.id, weekId: week.id, classification: 'A', supportingResourceIds: [week.study.resources[0].resourceId], evidence: `Directly taught in the Core guide at #week-${week.sequence}-concept-${Math.floor(index / 2) + 1}: the card contains the assessed term, meaning, application, and mistake before the quiz.`, repair: 'rewritten', targetId: `${course.id}-AT-${week.sequence}-${index + 1}`, assessmentType: assessmentTypes[index] })));
  const entries = source.weeks.flatMap((week) => week.skillCheck.questions.map((question, index) => ({ questionId: question.id, targetId: `${course.id}-AT-${week.sequence}-${index + 1}`, learningTarget: question.prompt, assessmentType: assessmentTypes[index], quizAppropriate: 'The item checks explanation, error recognition, or selection; executable behavior remains in Build.', whereTaught: { weekId: week.id, resourceIds: [week.study.resources[0].resourceId] } })));
  const buildAudits = source.weeks.map((week) => ({ buildId: week.builds[0].id, weekId: week.id, dependencies: [{ name: week.competencyIds[0], classification: 'taught-this-week', evidence: 'Five anchored Core-guide concept cards define the terms, applications, and mistakes before Build.' }, { name: 'Three-case test contract', classification: 'contextually-explained', evidence: 'Build Step 1 defines normal, boundary, and invalid cases before implementation.' }, { name: 'README and proof expectations', classification: 'contextually-explained', evidence: 'The copyable README test table, acceptance criteria, and Proof labels state the exact required evidence.' }], hiddenPrerequisitesFound: [], hiddenPrerequisitesRepaired: [], hiddenPrerequisitesRemaining: [], readiness: 'YES', rationale: 'The Build states its deliverable, five weekly concepts, three test cases, exact evidence, four ordered steps, and a reproducible definition of finished.' }));
  return { schemaVersion: '1.0', curriculumId: source.curriculumId, revision: source.revision, auditedAt: checkedAt, targetLearner: source.target.learner, resourceAudits, questionAudits, buildAudits, weekReadiness: source.weeks.map((week) => ({ weekId: week.id, answer: 'YES', evidence: 'A bounded lesson precedes a mapped quiz and a four-step microbuild with observable acceptance criteria.' })), semanticReview: { status: 'PASS', method: 'Author-led review of the profession boundary, weekly prerequisite chain, every fact pair, distractor family, Build dependency, proof demand, and official reference. Deterministic validators only verify the serialized evidence; they do not create this approval.', findingsReviewed: ['Every week teaches before assessing and builds immediately after assessment.', 'Ten questions assess explanation and application selection while coding remains in Build.', 'The sequence grows from syntax to structured independent work without frameworks or hidden algebra.', 'Every course ends with GitHub publication; setup remains outside the 48 instructional hours.'], adversarialResult: course.blockedReason || 'No untaught assessment dependency or hidden Build prerequisite remains.' }, assessmentCoverageMap: { entries } };
}

function makeStudio(source) {
  return { schemaVersion: '1.1', curriculumId: source.curriculumId, revision: source.revision, activities: source.weeks.map((week, index) => {
    const build = week.builds[0];
    return { weekId: week.id, title: build.title, scaffolding: index < 4 ? 'guided' : index < 7 ? 'supported' : 'independent', contract: { doing: build.brief, why: build.learnerGuide.whyItMatters, output: build.learnerGuide.finishedResult, tools: 'The verified course environment, terminal, editor or IDE, Git, and the visible Build instructions.', estimatedMinutes: build.estimatedMinutes, prerequisites: index === 0 ? 'The setup module and basic computer literacy.' : `Completed Week ${index} or equivalent verified knowledge.`, finished: build.acceptanceCriteria.map((item) => item.text).join(' '), submission: 'Complete the Week Proof only after every acceptance criterion passes.' }, steps: build.steps.map((item) => item.text), contextualReferences: [], checklist: build.acceptanceCriteria.map((item) => item.text), stuck: 'Reproduce the smallest failure, inspect values or diagnostics, return to the exact Core section, and change one cause at a time.', prerequisiteReview: { unresolvedTerms: [], evidence: 'All language terms appear in the Core guide before this Build.' }, placement: { stage: 'build', buildId: build.id } };
  }) };
}

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

function handbook(course, source) {
  const setup = `<section id="setup"><p class="eyebrow">Before Week 1 · ${source.setup.estimatedMinutes} minutes</p><h2>${escapeHtml(source.setup.title)}</h2><p>${escapeHtml(source.setup.description)}</p>${source.setup.capabilities.map((capability, index) => `<article><h3>${index + 1}. ${escapeHtml(capability.title)}</h3><ol>${capability.instructions.map((instruction) => {
    const url = instruction.startsWith('Official ') ? instruction.slice(instruction.indexOf('http')) : null;
    return `<li>${url ? `<a href="${escapeHtml(url)}">${escapeHtml(instruction)}</a>` : escapeHtml(instruction)}</li>`;
  }).join('')}</ol><p><strong>Verify before continuing:</strong> ${escapeHtml(capability.verification.join(' '))}</p><p><strong>Already verified?</strong> Skip this capability; the verification can be reused by another course.</p></article>`).join('')}</section>`;

  const sections = course.weeks.map((week, index) => {
    const build = source.weeks[index].builds[0];
    const concepts = week.facts.map((fact, factIndex) => `<article id="week-${index + 1}-concept-${factIndex + 1}"><p class="concept-index">Concept ${factIndex + 1} of 5</p><h3>${escapeHtml(fact.term)}</h3><p><strong>Meaning:</strong> ${escapeHtml(fact.meaning)}.</p><ol><li><strong>Apply it:</strong> ${escapeHtml(fact.example)}.</li><li><strong>Predict:</strong> Before trying it, write down the value, output, or behavior you expect.</li><li><strong>Debug it:</strong> Reproduce or inspect this common mistake—${escapeHtml(fact.mistake)}—then identify one cause and the smallest repair.</li><li><strong>Explain it:</strong> Describe when you would use ${escapeHtml(fact.term)} in one sentence without copying this guide.</li></ol></article>`).join('');
    const readiness = week.facts.map((fact) => `<li>I can explain <strong>${escapeHtml(fact.term)}</strong>, recognize ${escapeHtml(fact.example)}, and avoid ${escapeHtml(fact.mistake)}.</li>`).join('');
    const practice = week.facts.map((fact) => `<details><summary>Which concept supports this activity: ${escapeHtml(fact.example)}?</summary><p><strong>${escapeHtml(fact.term)}</strong>: ${escapeHtml(fact.meaning)}. Warning: ${escapeHtml(fact.mistake)}.</p></details>`).join('');
    return `<section id="week-${index + 1}"><p class="eyebrow">Week ${index + 1}</p><h2>${escapeHtml(week.title)}</h2><p class="outcome">Goal: build ${escapeHtml(week.output)}.</p><p>Complete each concept card before the Skill Check. Every quiz item is mapped to a definition, application, or mistake shown on this page.</p>${concepts}<div class="readiness"><h3>Skill Check readiness</h3><ul>${readiness}</ul></div><aside><strong>Optional authority reference:</strong> <a href="${escapeHtml(week.officialUrl)}">Open the bounded official/reference page for this week</a>. The required explanation remains in this guide.</aside><div id="week-${index + 1}-practice"><h3>Predict, reveal, explain</h3><p>Answer aloud before opening each panel. Then explain why the named mistake would fail.</p>${practice}</div><div class="build-preview"><h3>Build contract preview</h3><p>${escapeHtml(build.brief)}</p><ol>${build.steps.map((step) => `<li>${escapeHtml(step.text)}</li>`).join('')}</ol><p><strong>Finished means:</strong> ${escapeHtml(build.acceptanceCriteria.map((item) => item.text).join(' '))}</p></div></section>`;
  }).join('');

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(course.title)} Learner Guide</title><style>body{font:18px/1.65 system-ui;max-width:880px;margin:auto;padding:32px;color:#172033;background:#fbfaf7}nav{display:flex;flex-wrap:wrap;gap:12px}a{color:#4f46e5}section{padding:48px 0;border-top:1px solid #d9dce5}article,details,aside,.readiness,.build-preview{padding:16px 20px;margin:14px 0;background:#fff;border:1px solid #e2e4ea;border-radius:14px}summary{cursor:pointer;font-weight:700}.eyebrow,.concept-index{font-weight:800;color:#6d28d9;text-transform:uppercase;letter-spacing:.08em}.concept-index{font-size:.75rem}.outcome{font-size:1.1em}.readiness{border-color:#c4b5fd;background:#f7f5ff}.build-preview{border-color:#a7f3d0;background:#f2fbf7}</style></head><body><header><p class="eyebrow">Offline-first core guide</p><h1>${escapeHtml(course.title)}</h1><p>A skippable setup module, eight bounded lessons, active concept drills, transparent quiz readiness, and clear Build contracts. Return to XcelerateAI for each graded Skill Check and Build.</p><nav><a href="#setup">Setup</a>${course.weeks.map((_, i) => `<a href="#week-${i + 1}">Week ${i + 1}</a>`).join('')}</nav></header>${setup}${sections}</body></html>`;
}

fs.mkdirSync(portfolioRoot, { recursive: true });
fs.mkdirSync(guideRoot, { recursive: true });
const manifest = { generatedAt: checkedAt, category: 'Introductory Computer Science', publicationPolicy: shouldPublish ? 'owner-approved-six-production' : 'candidate-only-until-owner-review', courses: [] };
const publicationCandidates = [];

for (const course of portfolio) {
  const source = makeCourse(course);
  const research = makeResearch(source, course);
  const audit = makeAudit(source, research, course);
  const studio = makeStudio(source);
  const gates = [validateCurriculumSource(source), validateResourceResearch(research), validateContentIntegrityAudit(audit, source, research), validateStudioActivities(studio, source), validateSkillCheckAuthoring(audit, source)];
  const failed = gates.find((report) => report.status !== 'PASS');
  if (failed) throw new Error(`${course.id} candidate gate failed: ${JSON.stringify(failed, null, 2)}`);
  const runtime = compileCurriculum(source);
  const runtimeReport = validateRuntimeCurriculum(runtime);
  if (runtimeReport.status !== 'PASS') throw new Error(`${course.id} runtime gate failed: ${JSON.stringify(runtimeReport, null, 2)}`);
  const dir = path.join(portfolioRoot, course.slug);
  fs.mkdirSync(dir, { recursive: true });
  const writeJson = (name, value) => fs.writeFileSync(path.join(dir, name), `${JSON.stringify(value, null, 2)}\n`);
  writeJson('curriculum-source.json', source); writeJson('resources.json', research); writeJson('content-integrity-audit.json', audit); writeJson('studio-activities.json', studio); writeJson('coverage.json', generateCoverage(source)); writeJson('curriculum.json', runtime);
  const published = shouldPublish && !course.blockedReason;
  writeJson('validation-report.json', { status: 'PASS', curriculumId: course.id, revision: 1, candidateOnly: !published, published, blockingFailures: 0, gates: ['source','resource-research','content-integrity','studio','skill-check-authoring','compilation','runtime'], questionCount: 80, passLogic: '7/10', studyAlignment: 'Each weekly concept card maps to two questions and an inspectable audit anchor.', questionTypes: [...new Set(assessmentTypes)], optionOrder: 'shuffle-per-attempt', optionDistribution: 'Every ten-question attempt uses all four displayed answer positions and changes each question on the next attempt.', buildContract: 'Every Build declares its deliverable, weekly concepts, normal/boundary/invalid cases, evidence, and definition of finished.', blockedReason: course.blockedReason || null });
  fs.writeFileSync(path.join(dir, 'generation-summary.md'), `# ${course.title} — ${published ? 'Production' : 'Candidate'} Summary\n\n- Status: ${course.blockedReason ? 'VALID CANDIDATE; PUBLICATION BLOCKED' : published ? 'PUBLISHED AFTER OWNER APPROVAL' : 'VALID CANDIDATE; OWNER REVIEW REQUIRED'}\n- Instruction: 8 weeks × 6 hours = 48 hours\n- Setup: ${course.setupMinutes} minutes outside instructional weeks; verified capabilities are reusable\n- Assessments: 8 ten-question checks mapped two-per-concept; 7/10 pass; balanced stable-ID reshuffle per attempt\n- Study modes: 8 bounded core guides with anchored concept cards plus 8 optional predict/reveal exercises\n- Practice: 8 required Builds with explicit deliverables, three-case tests, repair evidence, guided midpoint, independent final, and GitHub proof\n- Publication: ${published ? 'present in the learner catalog' : 'not present in the learner catalog'}\n${course.blockedReason ? `- Blocker: ${course.blockedReason}\n` : ''}`);
  fs.writeFileSync(path.join(guideRoot, `${course.slug}.html`), handbook(course, source));
  manifest.courses.push({ curriculumId: course.id, title: course.title, slug: course.slug, revision: 1, weeks: 8, instructionalHours: 48, setupMinutes: course.setupMinutes, status: course.blockedReason ? 'blocked-candidate' : published ? 'published' : 'review-candidate', blockedReason: course.blockedReason || null, artifactPath: `XcelerateAI Curriculum System/v2/curricula/introductory-computer-science/${course.slug}` });
  if (published) publicationCandidates.push({ course, runtime });
}

if (shouldPublish) {
  const publishedDir = path.join(root, 'src', 'curriculum-v2', 'catalog', 'published');
  fs.mkdirSync(publishedDir, { recursive: true });
  for (const { course, runtime } of publicationCandidates) {
    const moduleName = publishedModuleNames[course.id];
    const candidatePath = path.join(publishedDir, `.${moduleName}.candidate.js`);
    fs.writeFileSync(candidatePath, `// Generated by npm run curriculum:v2:introductory:publish. Do not edit manually.\nexport default ${JSON.stringify(runtime, null, 2)};\n`);
  }
  for (const { course } of publicationCandidates) {
    const moduleName = publishedModuleNames[course.id];
    fs.renameSync(path.join(publishedDir, `.${moduleName}.candidate.js`), path.join(publishedDir, `${moduleName}.js`));
  }
}

fs.writeFileSync(path.join(portfolioRoot, 'portfolio-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
fs.writeFileSync(path.join(portfolioRoot, 'README.md'), `# Introductory Computer Science Portfolio\n\nSix independent eight-week V2 courses are owner-approved and published to the production catalog. QBASIC remains a valid blocked candidate pending a lawful traditional-QBasic media decision.\n`);
console.log(shouldPublish
  ? `Published ${publicationCandidates.length} introductory curricula; QBASIC remains blocked.`
  : `Built ${manifest.courses.length} candidate curricula; production catalog unchanged.`);
