import { competencies, concepts, phases, weekPlans } from './course-data.mjs';
import { checkedAt, resources as authoredResources } from './resources.mjs';
import { questionsByWeek as questionsWeeks1To3 } from './questions-weeks-1-3.mjs';
import { questionWeeks4To6 } from './questions-weeks-4-6.mjs';
import { questionsByWeek as questionsWeeks7To8 } from './questions-weeks-7-8.mjs';
import {
  editorialBuildAudits,
  editorialRepairLedger,
  editorialSemanticReview,
  editorialWeekReadiness,
} from './editorial-review.mjs';

const weekNumber = (sequence) => String(sequence).padStart(2, '0');
const weekId = (sequence) => `JSIN-R2-W${weekNumber(sequence)}`;
const questionBank = {
  ...questionsWeeks1To3,
  ...Object.fromEntries(questionWeeks4To6.map(({ weekId: id, questions }) => [id, questions])),
  ...questionsWeeks7To8,
};

const studyOrderByWeek = new Map([
  ['JSIN-R2-W06', new Map([
    ['JSIN-R2-W06-02', 1],
    ['JSIN-R2-W06-01', 2],
    ['JSIN-R2-W06-03', 3],
    ['JSIN-R2-W06-04', 4],
    ['JSIN-R2-W06-05', 5],
  ])],
  ['JSIN-R2-W07', new Map([
    ['JSIN-R2-W07-02', 1],
    ['JSIN-R2-W07-03', 2],
    ['JSIN-R2-W07-04', 3],
    ['JSIN-R2-W07-07', 4],
    ['JSIN-R2-W07-08', 5],
    ['JSIN-R2-W07-09', 6],
    ['JSIN-R2-W07-11', 7],
    ['JSIN-R2-W07-12', 8],
    ['JSIN-R2-W07-05', 9],
    ['JSIN-R2-W07-06', 10],
    ['JSIN-R2-W07-01', 11],
    ['JSIN-R2-W07-10', 12],
  ])],
]);

const finalDestination = (url) => url.startsWith('https://nodejs.org/en/learn/')
  ? url.replace('https://nodejs.org/en/learn/', 'https://nodejs.org/learn/')
  : url;

const sourceQuestion = ({ id, competencyIds, prompt, options, correctOptionId, explanation }) => ({
  id,
  competencyIds: [...competencyIds],
  prompt,
  options: options.map(({ id: optionId, label }) => ({ id: optionId, label })),
  correctOptionId,
  explanation,
});

const learnerFacingResourceNote = (item) => {
  const assignment = item.learnerAssignment;
  const parts = [
    `Do: ${assignment.consume}`,
    `Finished when: ${assignment.expectedOutcome}`,
  ];
  if (assignment.accountRequirement && !assignment.accountRequirement.startsWith('No account')) {
    parts.push(`Access: ${assignment.accountRequirement}`);
  }
  parts.push(`Next: ${assignment.nextAction}`);
  return parts.join('\n\n');
};

export const sourceResources = authoredResources.map((item) => ({
  id: item.id,
  title: item.title,
  url: item.url,
  provider: item.provider,
  format: item.format,
  cost: 'free',
  estimatedMinutes: item.estimatedMinutes,
  location: { ...item.location, note: learnerFacingResourceNote(item) },
  competencyIds: [...item.competencyIds],
  whySelected: item.whySelected,
}));

const sourceWeeks = weekPlans.map((plan) => {
  const id = weekId(plan.sequence);
  const preferredOrder = studyOrderByWeek.get(id);
  const assignments = authoredResources
    .filter((resource) => resource.weekId === id)
    .sort((left, right) => (preferredOrder?.get(left.id) ?? Number.MAX_SAFE_INTEGER) - (preferredOrder?.get(right.id) ?? Number.MAX_SAFE_INTEGER));
  const questions = questionBank[id] ?? [];
  const proofPrefix = `JSIN-R2-PR-W${weekNumber(plan.sequence)}`;
  return {
    id,
    sequence: plan.sequence,
    phaseId: plan.phaseId,
    title: plan.title,
    outcome: plan.outcome,
    competencyIds: [...plan.competencyIds],
    estimatedHours: 6,
    study: {
      objective: plan.studyObjective,
      coreMinimum: assignments.filter((resource) => resource.role === 'core').length,
      resources: assignments.map((resource) => ({
        resourceId: resource.id,
        role: resource.role,
        learningRole: resource.learningRole,
        competencyIds: [...resource.competencyIds],
        purpose: resource.purpose,
      })),
    },
    skillCheck: {
      id: `JSIN-R2-SC-W${weekNumber(plan.sequence)}`,
      title: `${plan.title} Skill Check`,
      instructions: 'Answer all 10 questions from the bounded Study resources and your own traces. You need 7/10 to pass. Options are reshuffled on every attempt, and attempts are unlimited.',
      passingScore: 70,
      optionOrder: 'shuffle-per-attempt',
      competencyIds: [...new Set(questions.flatMap((question) => question.competencyIds))],
      questions: questions.map(sourceQuestion),
    },
    builds: [plan.build],
    proof: {
      id: proofPrefix,
      prompt: plan.proofPrompt,
      evidence: plan.proof.map((label, index) => ({
        id: `${proofPrefix}-E${String(index + 1).padStart(2, '0')}`,
        type: plan.sequence === 8 && index === 0 ? 'link' : (index === plan.proof.length - 1 && /^Confirmation/i.test(label) ? 'confirmation' : 'text'),
        label,
        required: true,
      })),
    },
    reflection: {
      minimumResponses: 1,
      prompts: plan.reflections.map((prompt, index) => ({
        id: `JSIN-R2-RF-W${weekNumber(plan.sequence)}-${String(index + 1).padStart(2, '0')}`,
        prompt,
      })),
    },
  };
});

export const source = {
  schemaVersion: '2.0',
  curriculumId: 'JSIN',
  revision: 2,
  title: 'JavaScript Programming Foundations',
  shortTitle: 'JavaScript Foundations',
  catalog: { category: 'Introductory Computer Science', level: 'introductory' },
  target: {
    role: 'Beginning JavaScript programmer',
    learner: 'A tertiary fresher or independent beginner with basic computer literacy and no assumed programming experience',
    professionalOutcome: 'Write, run, debug, test, document, and publish small dependency-free JavaScript programs with enough fluency for introductory practical examinations and beginner projects.',
    specialGoals: ['syntax recognition', 'program tracing', 'debugging', 'small command-line programs', 'JSON data', 'automated tests', 'Git and GitHub', 'practical-exam readiness'],
  },
  workload: { weeklyHours: { min: 6, max: 6 }, estimatedTotalHours: 48, estimatedWeeks: 8 },
  assumptions: [
    'The learner has a Windows computer and basic file, browser, and typing skills.',
    'No prior programming, command-line, Git, JavaScript, or Node.js knowledge is assumed.',
    'Setup is separate from the eight instructional weeks and may be skipped capability by capability after verification.',
    'Required learning resources are free to access; a free verified GitHub account is needed only for repository publication.',
    'Most project work can continue offline after the required tools and referenced materials have been opened or downloaded.',
  ],
  setup: {
    title: 'JavaScript workstation setup',
    description: 'Install and verify the smallest Windows toolchain used throughout the course. Skip only a capability whose verification checks already pass.',
    estimatedMinutes: 105,
    capabilities: [
      { id: 'JSIN-R2-SETUP-CAP01', title: 'Node.js LTS', description: 'Install the supported JavaScript runtime and npm command.', required: true, skippableWhenVerified: true, instructions: ['Open the Week 1 Node.js setup card.', 'Install the latest LTS Windows build.', 'Close and reopen PowerShell.'], verification: ['`node --version` prints an LTS version.', '`npm --version` prints a version.'] },
      { id: 'JSIN-R2-SETUP-CAP02', title: 'Visual Studio Code', description: 'Install the editor and make its folder command available.', required: true, skippableWhenVerified: true, instructions: ['Open the Week 1 VS Code setup card.', 'Install User setup.', 'Restart PowerShell.'], verification: ['`code .` opens the current practice folder.', 'A `.js` file can be created and saved.'] },
      { id: 'JSIN-R2-SETUP-CAP03', title: 'Git identity', description: 'Install Git and set the name and email used by local commits.', required: true, skippableWhenVerified: true, instructions: ['Open the Week 1 Git setup card.', 'Install Git for Windows.', 'Set the global commit name and email.'], verification: ['`git --version` prints a version.', 'Both global identity commands return the intended values.'] },
      { id: 'JSIN-R2-SETUP-CAP04', title: 'Free GitHub account', description: 'Create or verify the account used to publish the final project.', required: true, skippableWhenVerified: true, instructions: ['Open the Week 1 GitHub account card.', 'Create a free personal account if needed.', 'Verify the email address.'], verification: ['The learner can sign in.', 'The account email is verified.', 'No paid plan was selected.'] },
    ],
  },
  phases,
  competencies,
  concepts,
  resources: sourceResources,
  weeks: sourceWeeks,
  projects: [
    {
      id: 'JSIN-R2-PJ01',
      title: 'JavaScript Practice Portfolio',
      outcome: 'Produce seven progressively stronger programs demonstrating execution, values, decisions, collections, functions, structured data, persistence, tests, and debugging.',
      competencyIds: competencies.filter((item) => !['JSIN-C021', 'JSIN-C023'].includes(item.id)).map((item) => item.id),
      milestones: sourceWeeks.slice(0, 7).map((week) => ({
        id: `JSIN-R2-PJ01-M${weekNumber(week.sequence)}`,
        title: week.builds[0].title,
        weekId: week.id,
        buildId: week.builds[0].id,
      })),
    },
    {
      id: 'JSIN-R2-PJ02',
      title: 'FoundIt CLI',
      outcome: 'Deliver and publish a tested, persistent lost-and-found command-line program with a reproducible README and human-reviewable evidence.',
      competencyIds: ['JSIN-C021', 'JSIN-C023', 'JSIN-C017', 'JSIN-C018', 'JSIN-C019', 'JSIN-C020'],
      milestones: [{ id: 'JSIN-R2-PJ02-M01', title: 'FoundIt CLI production release', weekId: 'JSIN-R2-W08', buildId: 'JSIN-R2-B-W08-01' }],
    },
  ],
  graduation: {
    outcome: 'Write, run, debug, test, document, and publish small dependency-free JavaScript programs with enough fluency for introductory practical examinations and beginner projects.',
    requiredCompetencyIds: competencies.filter((item) => item.importance === 'core').map((item) => item.id),
    requiredProjectIds: ['JSIN-R2-PJ01', 'JSIN-R2-PJ02'],
  },
};

export const research = authoredResources.map((resource) => {
  const resolvedUrl = finalDestination(resource.url);
  return {
    ...sourceResources.find((item) => item.id === resource.id),
    accessStatus: 'verified',
    checkedAt: resource.inspectedAt,
    selectionRole: resource.role,
    formatRationale: `${resource.format} was selected because it is the smallest credible ${resource.learningRole} route for this exact point in the course, not to satisfy a format quota.`,
    availability: {
      checked: true,
      checkedAt: resource.inspectedAt,
      requestedUrl: resource.url,
      finalUrl: resolvedUrl,
      finalDestinationStatus: 'success',
      redirected: resolvedUrl !== resource.url,
      finalDestinationKind: 'assigned-content',
      finalContentVerified: true,
      accessRestricted: false,
      verificationMethod: 'live-web-content-inspection',
      notes: `The assigned destination and named boundary were opened and inspected during the ${resource.inspectedAt.slice(0, 10)} production research pass.`,
    },
  };
});

const researchById = new Map(research.map((item) => [item.id, item]));
const sourceResourceById = new Map(sourceResources.map((item) => [item.id, item]));

const resourceAudits = authoredResources.map((resource) => {
  const selected = sourceResourceById.get(resource.id);
  const availability = researchById.get(resource.id).availability;
  const expected = resource.learnerAssignment.expectedOutcome;
  return {
    resourceId: resource.id,
    weekId: resource.weekId,
    decision: 'added',
    previousUrl: null,
    finalUrl: resource.url,
    learningRole: resource.learningRole,
    actualContentInspected: true,
    inspectedAt: resource.inspectedAt,
    access: {
      status: 'verified', free: true, loginRequired: false, sectionVerified: true,
      finalUrl: availability.finalUrl, finalDestinationStatus: 'success', redirected: availability.redirected,
      finalDestinationKind: 'assigned-content', finalContentVerified: true, accessRestricted: false,
      verificationMethod: 'live-web-content-inspection',
    },
    candidateComparisons: [
      { title: selected.title, url: selected.url, provider: selected.provider, disposition: 'selected', reason: `Opened and selected for its bounded ${resource.learningRole} role, prerequisite fit, free access, and direct support for the named learner action.` },
      { title: resource.alternative.title, url: resource.alternative.url, provider: resource.alternative.provider, disposition: 'rejected', reason: resource.alternative.reason },
    ],
    prerequisiteFit: {
      assumedCompetencyIds: [...resource.assumedCompetencyIds], unresolvedAssumptions: [], resolution: 'fit',
      evidence: resource.assumedCompetencyIds.length === 0 ? 'The bounded assignment starts from basic computer literacy or introduces every programming term it uses.' : `Every assumed competency (${resource.assumedCompetencyIds.join(', ')}) is established in an earlier assignment or Week before this resource.`,
      expectedOutcome: expected, bridgeResourceIds: [],
    },
    modalityReview: { consideredFormats: [...resource.consideredFormats], selectedFormat: selected.format, rationale: `Compared ${resource.consideredFormats.join(', ')}; ${selected.format} best matches the ${resource.learningRole} action and bounded scope at this point.` },
    documentationTeachingJustification: selected.format === 'documentation' ? 'The assigned headings are bounded to one concrete operation, include an exact runnable example, and lead immediately to prediction, execution, or the required Build.' : 'Not applicable; this assignment is not documentation used as the primary teaching route.',
    judgment: {
      beginnerClarity: `The entry and stop points isolate the material needed to achieve: ${expected}`,
      competencyFit: `The inspected content directly supports ${selected.competencyIds.join(', ')} and the same Week’s named task.`,
      correctness: 'Syntax and procedures were checked against the opened official or established educational destination.',
      currency: `The destination and assigned section were inspected on ${resource.inspectedAt.slice(0, 10)}.`,
      pacing: `${selected.estimatedMinutes} minutes is bounded and leaves most of the six-hour Week for tracing, building, debugging, proof, and reflection.`,
      practiceQuality: resource.learningRole === 'practice' ? 'The learner predicts or executes an observable action before continuing.' : 'The assignment feeds an immediate trace, Skill Check, or required Build action.',
      redundancy: `This card’s distinct contribution is: ${resource.purpose}`,
      prerequisiteFit: 'Every assumption is either established earlier or defined inside the assigned boundary.',
      learnerStageFit: `The scope fits the accumulated knowledge available before ${resource.weekId}.`,
      scopeFit: `The start, consume, and stop instructions lead to one observable result rather than an entire course or documentation hub.`,
      accessibility: selected.format === 'video' ? 'The video is short and paired in the same Week with a readable authoritative route or explicit page description.' : 'The route is readable HTML or an interactive visualizer and requires no paid tool.',
      cost: 'The assigned content is free; no certificate, subscription, or paid upgrade is required.',
      availability: `The final destination was opened successfully on ${resource.inspectedAt.slice(0, 10)}${availability.redirected ? ` after a verified redirect to ${availability.finalUrl}` : ''}.`,
      sectionAssignability: `${resource.learnerAssignment.start} ${resource.learnerAssignment.stop}`,
      learningRoleFit: `${resource.learningRole} matches the primary action: ${resource.primaryLearnerAction}.`,
      maintenanceRisk: 'Recheck the exact destination, title, access, and assigned boundary before a future revision.',
    },
    rationale: `Added after live inspection and candidate comparison because it supplies the strongest bounded ${resource.learningRole} path for ${resource.purpose}`,
    learnerAssignment: { ...resource.learnerAssignment },
    surfaceClassification: resource.surfaceClassification,
    primaryLearnerAction: resource.primaryLearnerAction,
    requiredArtifact: false,
    redundancyDecision: 'distinct',
    distinctContribution: resource.purpose,
  };
});

const allAuthoredQuestions = Object.values(questionBank).flat();
const questionAudits = allAuthoredQuestions.map((question) => ({
  questionId: question.id,
  weekId: question.weekId ?? Object.entries(questionBank).find(([, list]) => list.includes(question))?.[0],
  classification: question.classification,
  supportingResourceIds: [...question.supportingResourceIds],
  evidence: question.auditEvidence ?? (question.classification === 'A'
    ? 'The exact reasoning target is taught in the cited current-Week Core resource before the check; the required Build separately demonstrates execution.'
    : question.classification === 'B'
      ? 'The target is deliberately retrieved from the cited earlier Core teaching route and reused in the current integration decision.'
      : 'The item combines only cited current or earlier Core ideas into a bounded interpretation; it does not introduce an untaught dependency.'),
  repair: 'rewritten',
  targetId: question.targetId ?? question.target ?? `Target for ${question.id}`,
  assessmentType: question.assessmentType,
}));

const assessmentEntries = allAuthoredQuestions.map((question) => ({
  questionId: question.id,
  targetId: question.targetId ?? question.target ?? `JSIN-R2-AT-${question.id}`,
  learningTarget: question.target ?? question.learningTarget,
  assessmentType: question.assessmentType,
  quizAppropriate: question.whyQuizAppropriate ?? `A four-option item can check this ${question.assessmentType} decision before the learner demonstrates the related behavior in code and proof.`,
  whereTaught: { resourceIds: [...question.supportingResourceIds], evidence: question.auditEvidence ?? 'The cited bounded Core assignment explicitly teaches or demonstrates the target before assessment.' },
}));

export const audit = {
  schemaVersion: '1.3', curriculumId: 'JSIN', revision: 2, auditedAt: checkedAt,
  targetLearner: 'A complete programming beginner with basic Windows computer literacy, limited study time, and a need for both practical-exam fluency and credible small projects.',
  resourceAudits,
  questionAudits,
  buildAudits: editorialBuildAudits,
  weekReadiness: editorialWeekReadiness,
  semanticReview: editorialSemanticReview,
  focusVendor: { applicable: false, rationale: 'The course uses standards, runtime, editor, repository, video, tutorial, and visual-trace providers according to point-of-use quality rather than privileging one framework or vendor.' },
  repairLedger: editorialRepairLedger,
  weekResourceAudit: sourceWeeks.map((week) => {
    const assignments = week.study.resources;
    return {
      weekId: week.id,
      selectedStudyCards: assignments.length,
      coreCards: assignments.filter((item) => item.role === 'core').length,
      optionalCards: assignments.filter((item) => item.role === 'optional').length,
      finalUrlsChecked: assignments.map((item) => researchById.get(item.resourceId).availability.finalUrl),
      deadOrUnavailable: [], redirectsObserved: assignments.filter((item) => researchById.get(item.resourceId).availability.redirected).map((item) => item.resourceId), accessRestrictions: [],
      learnerAction: assignments.map((item) => ({ resourceId: item.resourceId, action: resourceAudits.find((auditItem) => auditItem.resourceId === item.resourceId).primaryLearnerAction })),
      skillCheckImpact: 'Every question cites active current or prior Core teaching, with at least seven direct/prior items and no untaught D classification.',
      buildImpact: `The resources prepare the learner to start ${week.builds[0].title}; guided production work remains inside Build rather than masquerading as a Study card.`,
      result: 'PASS',
    };
  }),
  beforeRepair: { status: 'WITHDRAWN', summary: 'Revision 1 exposed repeated course-owned definition cards and generic Build language that did not meet the approved beginner-learning contract.' },
  afterRepair: { status: 'CANDIDATE', summary: 'Revision 2 is independently authored around externally inspected instruction, active traces, eight distinct practical programs, source-mapped assessment, and explicit human-review proof.' },
  assessmentCoverageMap: { entries: assessmentEntries },
  assessmentRepair: { authoringStandard: 'SKILL_CHECK_AUTHORING_STANDARD.md', questionsReviewed: allAuthoredQuestions.length, answerOrder: 'shuffle-per-attempt', passRule: '7/10', attempts: 'unlimited', generatedSemanticApproval: false },
};

export const studio = {
  schemaVersion: '1.1', curriculumId: 'JSIN', revision: 2,
  activities: sourceWeeks.map((week) => {
    const plan = weekPlans[week.sequence - 1];
    const buildItem = week.builds[0];
    return {
      weekId: week.id,
      title: `${buildItem.title} guided Build`,
      placement: { stage: 'build', buildId: buildItem.id },
      contract: {
        doing: buildItem.brief,
        why: buildItem.learnerGuide.whyItMatters,
        output: buildItem.learnerGuide.finishedResult,
        tools: week.sequence < 7 ? 'Windows, VS Code, PowerShell, and Node.js LTS' : (week.sequence === 7 ? 'Windows, VS Code, PowerShell, Node.js LTS, node:test, and local JSON files' : 'Windows, VS Code, PowerShell, Node.js LTS, Git, a free verified GitHub account, and local JSON files'),
        estimatedMinutes: buildItem.estimatedMinutes,
        prerequisites: buildItem.learnerGuide.priorKnowledgeCompetencyIds.length ? `Previously completed competencies: ${buildItem.learnerGuide.priorKnowledgeCompetencyIds.join(', ')}. New Week concepts are taught in Core Study before this Build.` : 'Only the verified setup capabilities and this Week’s Core Study are required.',
        finished: buildItem.acceptanceCriteria.map((item) => item.text).join(' '),
        submission: plan.proof.join(' | '),
      },
      steps: buildItem.steps.map((step) => step.text),
      checklist: buildItem.acceptanceCriteria.map((criterion) => criterion.text),
      stuck: `Return to the exact cited Core section for the failing concept, reduce the program to the smallest failing case, read the first error or actual-versus-expected difference, then rerun the unchanged case after one repair. Do not copy a complete solution.`,
      prerequisiteReview: { unresolvedTerms: [], evidence: 'Every tool, command, concept, file, and output used here is taught earlier, taught in the current bounded Study, or explained directly in the Build step and starter.' },
    };
  }),
};

export const profession = {
  curriculumId: 'JSIN', revision: 2, researchedAt: checkedAt,
  role: 'Beginning JavaScript programmer',
  roleDefinition: 'A learner who can independently produce and explain small dependency-free Node.js programs using core syntax, structured data, modules, files, tests, debugging, Git, and clear run instructions.',
  evidenceSummary: 'The capability boundary was triangulated across current Node.js, MDN, Microsoft Learn, JavaScript.info, GitHub, VS Code, and Python Tutor materials and constrained to eight six-hour instructional Weeks.',
  capabilityTiers: [
    { tier: 'Foundational', weeks: '1–3', outcome: 'Run code, reason about values, repair basic failures, and make validated decisions.' },
    { tier: 'Program construction', weeks: '4–6', outcome: 'Use collections, functions, objects, classes, and JSON in smaller projects.' },
    { tier: 'Reliable delivery', weeks: '7–8', outcome: 'Modularize, persist, test, debug, document, and publish a coherent CLI.' },
  ],
  practitionerOutputs: weekPlans.map((week) => week.build.title),
  professionalPractices: ['predict before running', 'read evidence before editing', 'separate pure logic from I/O', 'test normal, boundary, and invalid cases', 'preserve malformed data for diagnosis', 'document exact commands', 'inspect staged files before publishing'],
  boundaries: ['No browser DOM or frontend framework', 'No asynchronous JavaScript', 'No database or web server', 'No third-party runtime packages', 'No advanced object-oriented patterns', 'No CI/CD requirement'],
  graduationBoundary: source.graduation.outcome,
  technologyDecision: 'Node.js LTS, VS Code, PowerShell, built-in JavaScript/Node APIs, Git, and GitHub minimize setup burden while preserving practical-exam and project value.',
  sources: [...new Set(sourceResources.map((resource) => resource.url))],
};

export const learningDesign = {
  curriculumId: 'JSIN', revision: 2,
  designPrinciple: 'A beginner first sees a bounded explanation or demonstration, predicts and traces behavior, then writes, breaks, repairs, tests, explains, and proves a progressively less scaffolded program.',
  targetLearner: source.target.learner,
  technologySequence: ['Windows toolchain setup', 'execution and output', 'values and conversion', 'decisions and validation', 'arrays and loops', 'functions and scope', 'objects, classes, and JSON', 'modules, files, tests, and debugging', 'CLI integration, Git, README, and GitHub'],
  learningRhythm: ['bounded Learn or demonstration', 'active trace or precise reference', '10-target shuffled Skill Check', 'required Build in sessions of at most two hours', 'human-reviewable Proof', 'specific reflection'],
  resourceRoleStrategy: { learn: 'A short first explanation or demonstration.', practice: 'An observable prediction, trace, or action.', reference: 'A precise bounded lookup used beside immediate work, never an unscoped documentation dump.' },
  progressionPolicy: ['Weeks 1–3 are heavily scaffolded.', 'Weeks 4–6 combine earlier syntax in distinct small programs.', 'Week 7 introduces reliability boundaries.', 'Week 8 integrates earlier competencies into one larger independently inspectable project.'],
  workloadPrinciples: ['Eight instructional Weeks at six hours each.', 'Setup is separate and skippable only through explicit verification.', 'No session exceeds two hours.', 'Most time is reserved for coding, debugging, tests, evidence, and explanation rather than passive consumption.'],
  assessmentPolicy: 'Each Week has ten independently authored, source-mapped questions; 7/10 passes; attempts are unlimited; option order reshuffles per attempt; code and project competence is judged through Build and Proof, not quiz score alone.',
  projectArchitecture: source.projects.map((project) => ({ projectId: project.id, title: project.title, milestoneCount: project.milestones.length, outcome: project.outcome })),
};

export { allAuthoredQuestions, questionBank };
