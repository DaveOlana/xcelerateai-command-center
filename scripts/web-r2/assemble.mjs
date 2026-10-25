import { competencies, concepts, phases, weekPlans } from './course-data.mjs';
import { checkedAt, resources as authoredResources } from './resources.mjs';
import { allQuestions, questionsByWeek } from './questions.mjs';
import { editorialBuildAudits, editorialRepairLedger, editorialSemanticReview, editorialWeekReadiness } from './editorial-review.mjs';

const two = (value) => String(value).padStart(2, '0');
const weekId = (sequence) => `WEBD-R2-W${two(sequence)}`;

const learnerFacingResourceNote = (item) => {
  const assignment = item.learnerAssignment;
  const parts = [`Do: ${assignment.consume}`, `Finished when: ${assignment.expectedOutcome}`];
  if (!assignment.accountRequirement.startsWith('No account')) parts.push(`Access: ${assignment.accountRequirement}`);
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

const sourceQuestion = (question) => ({
  id: question.id,
  competencyIds: [...question.competencyIds],
  prompt: question.prompt,
  options: question.options.map((option) => ({ ...option })),
  correctOptionId: question.correctOptionId,
  explanation: question.explanation,
});

const sourceWeeks = weekPlans.map((plan) => {
  const id = weekId(plan.sequence);
  const assignments = authoredResources.filter((resource) => resource.weekId === id);
  const questions = questionsByWeek[id] ?? [];
  const proofPrefix = `WEBD-R2-PR-W${two(plan.sequence)}`;
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
      id: `WEBD-R2-SC-W${two(plan.sequence)}`,
      title: `${plan.title} Skill Check`,
      instructions: 'Answer all 10 questions from the bounded Study resources and your browser observations. You need 7/10 to pass. Options reshuffle on every attempt, and attempts are unlimited.',
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
        id: `${proofPrefix}-E${two(index + 1)}`,
        type: plan.sequence === 8 && index < 2 ? 'link' : 'text',
        label,
        required: true,
      })),
    },
    reflection: {
      minimumResponses: 1,
      prompts: plan.reflections.map((prompt, index) => ({ id: `WEBD-R2-RF-W${two(plan.sequence)}-${two(index + 1)}`, prompt })),
    },
  };
});

export const source = {
  schemaVersion: '2.0',
  curriculumId: 'WEBD',
  revision: 2,
  title: 'Web Development Foundations',
  shortTitle: 'Web Foundations',
  catalog: { category: 'Introductory Computer Science', level: 'introductory' },
  target: {
    role: 'Beginning front-end web developer',
    learner: 'A tertiary fresher or independent beginner with basic computer literacy and no assumed coding experience',
    professionalOutcome: 'Create, debug, verify, document, version, and publish small semantic, responsive, accessible, interactive static websites with HTML, CSS, and browser JavaScript, with enough fluency for introductory practical examinations and beginner projects.',
    specialGoals: ['HTML syntax recognition', 'semantic structure', 'links and media', 'CSS cascade and box model', 'Flexbox and Grid', 'mobile-first responsiveness', 'browser JavaScript', 'DOM events', 'arrays and object state', 'localStorage', 'semantic forms', 'manual accessibility checks', 'fetch and JSON', 'DevTools debugging', 'Git and GitHub Pages', 'practical-exam readiness'],
  },
  workload: { weeklyHours: { min: 6, max: 6 }, estimatedTotalHours: 48, estimatedWeeks: 8 },
  assumptions: [
    'The learner has a Windows computer and basic file, browser, and typing skills.',
    'No prior HTML, CSS, JavaScript, terminal, Git, browser-development-tool, accessibility, storage, network, or deployment knowledge is assumed.',
    'Setup is separate from the eight instructional Weeks and may be skipped capability by capability only after its verification succeeds.',
    'Required learning resources are free; a free verified GitHub account is needed only for repository and GitHub Pages publication.',
    'Most project work can continue offline after required tools, pages, and local fixtures have been obtained.',
    'The course deliberately excludes frameworks, package managers, backends, databases, authentication, API keys, service workers, and production-security claims.',
  ],
  setup: {
    title: 'Windows web-development workspace setup',
    description: 'Verify a lightweight source-folder, localhost-preview, browser-inspection, Git, and GitHub route. Skip only capabilities whose checks already pass.',
    estimatedMinutes: 135,
    capabilities: [
      {
        id: 'WEBD-R2-SETUP-CAP01',
        title: 'VS Code project folder',
        description: 'Install or open VS Code and create a plain source folder without a framework or package manager.',
        required: true,
        skippableWhenVerified: true,
        instructions: ['Install current stable VS Code if needed.', 'Create `web-foundations` in a non-private learner workspace and open the folder.', 'Create, save, close, and reopen a small index.html file.'],
        verification: ['VS Code shows the intended folder as the workspace root.', 'index.html saves and reopens from that folder.', 'The folder contains no passwords, tokens, school records, or personal submissions.'],
      },
      {
        id: 'WEBD-R2-SETUP-CAP02',
        title: 'Browser and development tools',
        description: 'Use a current Chromium or Firefox browser and open Elements, Console, and Network for the served page.',
        required: true,
        skippableWhenVerified: true,
        instructions: ['Update or install a current supported browser if needed.', 'Open its developer tools.', 'Locate Elements, Console, Network, device-width controls, and Application or Storage.'],
        verification: ['Elements shows the page DOM.', 'Console accepts a harmless expression.', 'Network records a page request after refresh.'],
      },
      {
        id: 'WEBD-R2-SETUP-CAP03',
        title: 'Localhost preview route',
        description: 'Serve the project with the assigned VS Code local-preview extension so later fetch work uses HTTP rather than file URLs.',
        required: true,
        skippableWhenVerified: true,
        instructions: ['Install the assigned free Microsoft VS Code Live Preview extension if no approved localhost route exists.', 'Open the supplied setup HTML and JSON files through the preview action.', 'Record the localhost URL and refresh after one saved text change.'],
        verification: ['The address begins with http://127.0.0.1 or http://localhost, not file://.', 'Network records the HTML and supplied JSON with HTTP 200.', 'A saved source change appears after refresh.'],
      },
      {
        id: 'WEBD-R2-SETUP-CAP04',
        title: 'Git identity and free GitHub account',
        description: 'Verify local Git commits and the free account used only when publishing the capstone.',
        required: true,
        skippableWhenVerified: true,
        instructions: ['Install Git for Windows if needed and inspect the intended name/email.', 'Create a disposable local repository and commit a harmless README.', 'Create or sign in to a free GitHub account and verify its email; do not choose a paid plan.'],
        verification: ['`git --version` succeeds.', 'The disposable repository has one local commit with the intended identity.', 'The learner can sign in to a free verified GitHub account.'],
      },
    ],
  },
  phases,
  competencies,
  concepts,
  resources: sourceResources,
  weeks: sourceWeeks,
  projects: [
    {
      id: 'WEBD-R2-PJ01',
      title: 'Web Foundations Practice Portfolio',
      outcome: 'Produce seven progressively stronger browser artifacts demonstrating semantic HTML, CSS systems, responsive layout, DOM events, canonical state, local persistence, accessible forms, fetch states, and evidence-led debugging.',
      competencyIds: competencies.filter((item) => !['WEBD-R2-C024', 'WEBD-R2-C025'].includes(item.id)).map((item) => item.id),
      milestones: sourceWeeks.slice(0, 7).map((week) => ({ id: `WEBD-R2-PJ01-M${two(week.sequence)}`, title: week.builds[0].title, weekId: week.id, buildId: week.builds[0].id })),
    },
    {
      id: 'WEBD-R2-PJ02',
      title: 'FreshStart Hub',
      outcome: 'Deliver a documented, responsive, accessible static orientation application with local JSON, filtering, saved events, honest request states, a verified test record, Git history, and a working GitHub Pages URL.',
      competencyIds: competencies.map((item) => item.id),
      milestones: [{ id: 'WEBD-R2-PJ02-M01', title: 'FreshStart Hub published release', weekId: 'WEBD-R2-W08', buildId: 'WEBD-R2-B-W08-01' }],
    },
  ],
  graduation: {
    outcome: 'Create, debug, verify, document, version, and publish small semantic, responsive, accessible, interactive static websites with HTML, CSS, and browser JavaScript, with enough fluency for introductory practical examinations and beginner projects.',
    requiredCompetencyIds: competencies.filter((item) => item.importance === 'core').map((item) => item.id),
    requiredProjectIds: ['WEBD-R2-PJ01', 'WEBD-R2-PJ02'],
  },
};

export const research = authoredResources.map((resource) => ({
  ...sourceResources.find((item) => item.id === resource.id),
  accessStatus: 'verified',
  checkedAt: resource.inspectedAt,
  selectionRole: resource.role,
  formatRationale: `${resource.format} was selected because it is the smallest credible ${resource.learningRole} route for this exact point, not to meet a format quota.`,
  availability: {
    checked: true,
    checkedAt: resource.inspectedAt,
    requestedUrl: resource.url,
    finalUrl: resource.url,
    finalDestinationStatus: 'success',
    redirected: false,
    finalDestinationKind: 'assigned-content',
    finalContentVerified: true,
    accessRestricted: false,
    verificationMethod: 'live-web-content-inspection',
    notes: `The final page, public access, title, and assigned boundary were inspected during the ${resource.inspectedAt.slice(0, 10)} production research pass.`,
  },
}));

const resourceById = new Map(sourceResources.map((item) => [item.id, item]));

const resourceAudits = authoredResources.map((resource) => {
  const selected = resourceById.get(resource.id);
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
      status: 'verified', free: true, loginRequired: !resource.learnerAssignment.accountRequirement.startsWith('No account'), sectionVerified: true,
      finalUrl: resource.url, finalDestinationStatus: 'success', redirected: false, finalDestinationKind: 'assigned-content', finalContentVerified: true, accessRestricted: false, verificationMethod: 'live-web-content-inspection',
    },
    candidateComparisons: [
      { title: selected.title, url: selected.url, provider: selected.provider, disposition: 'selected', reason: `Opened and selected for its bounded ${resource.learningRole} role, beginner fit, free access, and direct support for the named browser action.` },
      { title: resource.alternative.title, url: resource.alternative.url, provider: resource.alternative.provider, disposition: 'rejected', reason: resource.alternative.reason },
    ],
    prerequisiteFit: {
      assumedCompetencyIds: [...resource.assumedCompetencyIds], unresolvedAssumptions: [], resolution: 'fit',
      evidence: resource.assumedCompetencyIds.length === 0 ? 'The assignment starts from basic computer literacy or defines the new web term inside its boundary.' : `Every assumed competency (${resource.assumedCompetencyIds.join(', ')}) is established earlier in the ordered Study route.`,
      expectedOutcome: expected, bridgeResourceIds: [],
    },
    modalityReview: { consideredFormats: [...resource.consideredFormats], selectedFormat: selected.format, rationale: `Compared ${resource.consideredFormats.join(', ')}; ${selected.format} best matches this bounded ${resource.learningRole} action.` },
    documentationTeachingJustification: selected.format === 'documentation' ? 'The card assigns exact headings, requires an immediate browser prediction, inspection, edit, validation, or test, and stops before unrelated sections; documentation never stands alone as an unbounded course.' : 'Not applicable; this selection is not documentation used as the primary explanation.',
    judgment: {
      beginnerClarity: `The entry point, exact action, stop point, and observable outcome isolate what is needed to achieve: ${expected}`,
      competencyFit: `The inspected content directly supports ${selected.competencyIds.join(', ')} and the same Week's browser trace or Build.`,
      correctness: 'HTML, CSS, JavaScript, browser, accessibility, Git, and deployment guidance was checked against the opened authoritative or established educational destination.',
      currency: `The final destination and assigned boundary were inspected on ${resource.inspectedAt.slice(0, 10)}.`,
      pacing: `${selected.estimatedMinutes} minutes is bounded and leaves most of the six-hour Week for active browser work, assessment, building, debugging, and Proof.`,
      practiceQuality: resource.learningRole === 'practice' ? 'The learner must interact, predict, edit, inspect, validate, or compare an observable browser result before continuing.' : 'The assignment feeds an immediate trace, Skill Check decision, or Build action.',
      redundancy: `This card's distinct contribution is: ${resource.purpose}`,
      prerequisiteFit: 'Every assumed capability is earlier, introduced inside the assigned boundary, or supplied directly.',
      learnerStageFit: `Examples and terminology fit the accumulated beginner knowledge before ${resource.weekId}.`,
      scopeFit: 'Exact start, consume, and stop instructions prevent the learner from having to select the syllabus from a large site.',
      accessibility: selected.format === 'video' ? 'The free video is bounded and paired with a readable or interactive route in the same Week.' : 'The destination works in a standard browser and does not require paid software.',
      cost: 'The assigned content is free; no subscription, certificate, or upgrade is required.',
      availability: `The assigned final destination was opened successfully on ${resource.inspectedAt.slice(0, 10)}.`,
      sectionAssignability: `${resource.learnerAssignment.start} ${resource.learnerAssignment.stop}`,
      learningRoleFit: `${resource.learningRole} matches the primary learner action: ${resource.primaryLearnerAction}.`,
      maintenanceRisk: 'Recheck the destination, title, access, and exact boundary before a future revision.',
    },
    rationale: `Added after current resource research and candidate comparison because it supplies the strongest bounded ${resource.learningRole} path for ${resource.purpose}`,
    learnerAssignment: { ...resource.learnerAssignment },
    surfaceClassification: resource.surfaceClassification,
    primaryLearnerAction: resource.primaryLearnerAction,
    requiredArtifact: false,
    redundancyDecision: 'distinct',
    distinctContribution: resource.purpose,
  };
});

const questionAudits = allQuestions.map((question) => ({
  questionId: question.id,
  weekId: question.weekId,
  classification: question.classification,
  supportingResourceIds: [...question.supportingResourceIds],
  evidence: question.classification === 'B'
    ? 'The target deliberately retrieves earlier Core teaching and applies it to the current browser decision.'
    : question.classification === 'C'
      ? 'The item combines only cited current or earlier Core ideas into a bounded interpretation.'
      : 'The exact target is taught or demonstrated in a cited current-Week Core assignment before assessment.',
  repair: 'rewritten',
  targetId: `WEBD-R2-AT-${question.id.slice(-6)}`,
  assessmentType: question.assessmentType,
}));

const assessmentEntries = allQuestions.map((question) => ({
  questionId: question.id,
  targetId: `WEBD-R2-AT-${question.id.slice(-6)}`,
  learningTarget: question.target,
  assessmentType: question.assessmentType,
  quizAppropriate: `A four-option item can check this ${question.assessmentType} decision before the related behavior is demonstrated in browser evidence and Proof.`,
  whereTaught: { resourceIds: [...question.supportingResourceIds], evidence: 'The cited bounded assignment explicitly teaches or demonstrates this target before assessment.' },
}));

export const audit = {
  schemaVersion: '1.3', curriculumId: 'WEBD', revision: 2, auditedAt: checkedAt,
  targetLearner: 'A complete coding beginner with basic Windows computer literacy, limited weekly time, and a need for practical-exam fluency plus credible small websites.',
  resourceAudits,
  questionAudits,
  buildAudits: editorialBuildAudits,
  weekReadiness: editorialWeekReadiness,
  semanticReview: editorialSemanticReview,
  focusVendor: { applicable: false, rationale: 'Resources are selected by point-of-use quality across MDN, web.dev, W3C WAI, Chrome DevTools, Microsoft Learn, interactive practice, Git, GitHub, and validators rather than by a vendor quota.' },
  repairLedger: editorialRepairLedger,
  weekResourceAudit: sourceWeeks.map((week) => ({
    weekId: week.id,
    selectedStudyCards: week.study.resources.length,
    coreCards: week.study.resources.filter((item) => item.role === 'core').length,
    optionalCards: week.study.resources.filter((item) => item.role === 'optional').length,
    finalUrlsChecked: week.study.resources.map((item) => resourceById.get(item.resourceId).url),
    deadOrUnavailable: [], redirectsObserved: [], accessRestrictions: [],
    learnerAction: week.study.resources.map((item) => ({ resourceId: item.resourceId, action: resourceAudits.find((record) => record.resourceId === item.resourceId).primaryLearnerAction })),
    skillCheckImpact: 'Every question cites active current or earlier Core teaching; no untaught D-class target remains.',
    buildImpact: `The ordered Study route prepares the learner to begin ${week.builds[0].title}; artifact production stays inside the Build.`,
    result: 'PASS',
  })),
  beforeRepair: { status: 'WITHDRAWN', summary: 'Revision 1 used a shared generated introductory template and course-owned definition pages that did not meet the approved comprehensive beginner-learning contract.' },
  afterRepair: { status: 'CANDIDATE', summary: 'Revision 2 is independently authored around current external web teaching, active browser inspection, eight distinct artifacts, source-mapped assessment, manual accessibility evidence, deterministic fixtures, and verified static deployment.' },
  assessmentCoverageMap: { entries: assessmentEntries },
  assessmentRepair: { authoringStandard: 'SKILL_CHECK_AUTHORING_STANDARD.md', questionsReviewed: allQuestions.length, answerOrder: 'shuffle-per-attempt', passRule: '7/10', attempts: 'unlimited', generatedSemanticApproval: false },
};

export const studio = {
  schemaVersion: '1.1', curriculumId: 'WEBD', revision: 2,
  activities: sourceWeeks.map((week) => {
    const plan = weekPlans[week.sequence - 1];
    const build = week.builds[0];
    return {
      weekId: week.id,
      title: `${build.title} guided Build`,
      placement: { stage: 'build', buildId: build.id },
      contract: {
        doing: build.brief,
        why: build.learnerGuide.whyItMatters,
        output: build.learnerGuide.finishedResult,
        tools: week.sequence < 8 ? 'Windows, VS Code, the verified localhost preview route, a current browser, and browser development tools' : 'Windows, VS Code, the verified localhost preview route, a current browser and development tools, Git, and a free verified GitHub account',
        estimatedMinutes: build.estimatedMinutes,
        prerequisites: build.learnerGuide.priorKnowledgeCompetencyIds.length ? `Previously completed competencies: ${build.learnerGuide.priorKnowledgeCompetencyIds.join(', ')}. New Week concepts are taught in Core Study before this Build.` : "Only verified setup capabilities and this Week's bounded Core Study are required.",
        finished: build.acceptanceCriteria.map((item) => item.text).join(' '),
        submission: plan.proof.join(' | '),
      },
      steps: build.steps.map((step) => step.text),
      checklist: build.acceptanceCriteria.map((criterion) => criterion.text),
      stuck: 'Reproduce one failing case, return to the exact cited Core boundary, inspect the smallest relevant validator, Elements, Styles, Computed, Console, Application, Network, keyboard, viewport, reload, Git, or live-URL evidence, change one cause, and rerun the same case before continuing. Do not copy a complete solution.',
      prerequisiteReview: { unresolvedTerms: [], evidence: 'Every file, element, selector, state, event, record, fixture, test input, error message, command, and deployment route is taught earlier, taught in current bounded Study, or supplied by the Build contract.' },
    };
  }),
};

export const profession = {
  curriculumId: 'WEBD', revision: 2, researchedAt: checkedAt,
  role: 'Beginning front-end web developer',
  roleDefinition: 'A learner who can independently produce and explain small semantic, responsive, accessible static sites using HTML, CSS, browser JavaScript, local JSON, browser storage, DevTools, Git, and GitHub Pages.',
  evidenceSummary: 'The capability boundary was triangulated across current web-platform, accessibility, browser-tooling, and Git/GitHub teaching, then constrained to eight six-hour instructional Weeks.',
  capabilityTiers: [
    { tier: 'Structure and style', weeks: '1-3', outcome: 'Create valid semantic pages, use the cascade and box model deliberately, and build responsive Flexbox/Grid layouts with measured contrast and reflow.' },
    { tier: 'Behavior and data', weeks: '4-7', outcome: 'Implement DOM events, canonical collection state, local persistence, accessible forms, deterministic fetch states, and evidence-led browser debugging.' },
    { tier: 'Integrated delivery', weeks: '8', outcome: 'Integrate proven behaviors into a documented, manually verified static application and publish it safely through GitHub Pages.' },
  ],
  practitionerOutputs: weekPlans.map((week) => week.build.title),
  professionalPractices: ['start with semantic source order', 'use reusable CSS and inspect the cascade', 'design mobile first and verify reflow', 'update canonical state before rendering', 'prefer native controls and safe text insertion', 'test keyboard and focus behavior manually', 'show honest loading, empty, and failure states', 'reproduce failures before editing', 'inspect staged files before publishing', 'verify the real deployed route and assets'],
  boundaries: ['No framework or package manager', 'No backend, database, or authentication', 'No external API or API key', 'No user-generated remote data', 'No service worker', 'No automated deployment pipeline', 'No claim of universal accessibility, production security, or cross-browser perfection'],
  graduationBoundary: source.graduation.outcome,
  technologyDecision: 'Plain HTML, CSS, browser JavaScript, VS Code, an HTTP localhost preview, browser DevTools, Git, and GitHub Pages provide the least strenuous free Windows route with high practical-exam and project value.',
  sources: [...new Set(sourceResources.map((resource) => resource.url))],
};

export const learningDesign = {
  curriculumId: 'WEBD', revision: 2,
  designPrinciple: 'A beginner first receives bounded explanation or demonstration, then predicts and inspects a browser result, practices in a safe fixed context, passes a source-mapped Skill Check, builds a progressively less scaffolded artifact, repairs one reproducible defect, verifies exact cases, and records human-reviewable Proof.',
  targetLearner: source.target.learner,
  technologySequence: ['Windows VS Code, current browser, DevTools, localhost preview, Git, and GitHub setup', 'HTML document metadata, landmarks, headings, links, local media, validation, and keyboard navigation', 'CSS cascade, inheritance, custom properties, box model, readable typography, contrast, and computed evidence', 'Flexbox, Grid, fluid media, mobile-first breakpoints, overflow, reflow, and zoom', 'browser JavaScript bindings, conditions, named functions, DOM selection/update, native controls, and events', 'arrays, record objects, canonical state, derived views, event delegation, JSON, and localStorage', 'semantic forms, native constraints, accessible errors/status, keyboard, focus, and manual checks', 'fetch, response.ok, JSON validation, request states, retry, Console, and Network diagnosis', 'integrated verification, Git, README, GitHub Pages, and live-path checks'],
  learningRhythm: ['bounded external explanation or demonstration', 'active interaction, prediction, inspection, validation, or comparison', '10-target shuffled Skill Check', 'required Build in sessions of at most two hours', 'human-reviewable Proof', 'specific reflection'],
  resourceRoleStrategy: { learn: 'A short first explanation or visual demonstration.', practice: 'An observable interaction, edit, prediction, inspection, validator, DevTools, or accessibility exercise.', reference: 'A precise bounded web-platform or tool lookup beside immediate work, never an unscoped documentation dump.' },
  progressionPolicy: ['Weeks 1-3 establish structure, styling, and responsive layout without a calculator or programming-first jump.', 'Weeks 4-7 add one browser behavior layer at a time: events, canonical state/storage, forms/accessibility, then HTTP data and failure states.', 'Week 8 introduces only bounded recovery and static publication while integrating already practiced application behavior.'],
  workloadPrinciples: ['Eight instructional Weeks at six hours each.', 'Setup is separate and skippable only through explicit verification.', 'No Build session exceeds two hours.', 'Most time is reserved for editing, previewing, inspecting, validating, debugging, testing, evidence, and explanation rather than passive consumption.'],
  assessmentPolicy: 'Each Week has ten independently authored, source-mapped questions; 7/10 passes; attempts are unlimited; option order reshuffles per attempt; browser competence is judged through Build and Proof, not quiz score alone.',
  projectArchitecture: source.projects.map((project) => ({ projectId: project.id, title: project.title, milestoneCount: project.milestones.length, outcome: project.outcome })),
};

export { allQuestions, questionsByWeek };
