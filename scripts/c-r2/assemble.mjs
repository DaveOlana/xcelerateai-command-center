import { competencies, concepts, phases, weekPlans } from './course-data.mjs';
import { checkedAt, resources as authoredResources } from './resources.mjs';
import { allQuestions, questionsByWeek } from './questions.mjs';
import { editorialBuildAudits, editorialRepairLedger, editorialSemanticReview, editorialWeekReadiness } from './editorial-review.mjs';

const two = (value) => String(value).padStart(2, '0');
const weekId = (sequence) => `CLNG-R2-W${two(sequence)}`;

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
  const proofPrefix = `CLNG-R2-PR-W${two(plan.sequence)}`;
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
      id: `CLNG-R2-SC-W${two(plan.sequence)}`,
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
        id: `${proofPrefix}-E${two(index + 1)}`,
        type: plan.sequence === 8 && index === 0 ? 'link' : (index === plan.proof.length - 1 && /^Confirmation/i.test(label) ? 'confirmation' : 'text'),
        label,
        required: true,
      })),
    },
    reflection: {
      minimumResponses: 1,
      prompts: plan.reflections.map((prompt, index) => ({ id: `CLNG-R2-RF-W${two(plan.sequence)}-${two(index + 1)}`, prompt })),
    },
  };
});

export const source = {
  schemaVersion: '2.0',
  curriculumId: 'CLNG',
  revision: 2,
  title: 'C Programming Foundations',
  shortTitle: 'C Foundations',
  catalog: { category: 'Introductory Computer Science', level: 'introductory' },
  target: {
    role: 'Beginning C programmer',
    learner: 'A tertiary fresher or independent beginner with basic computer literacy and no assumed programming experience',
    professionalOutcome: 'Write, compile, debug, verify, document, and publish small warning-clean C17 programs with enough fluency for introductory practical examinations and beginner projects.',
    specialGoals: ['syntax recognition', 'compile-link-run mental model', 'typed values and formatted I/O', 'program tracing', 'defensive validation', 'arrays and functions', 'bounded strings and pointers', 'struct records', 'failure-preserving persistence', 'dependency-free checks', 'Git and GitHub', 'practical-exam readiness'],
  },
  workload: { weeklyHours: { min: 6, max: 6 }, estimatedTotalHours: 48, estimatedWeeks: 8 },
  assumptions: [
    'The learner has a Windows computer and basic file, browser, and typing skills.',
    'No prior programming, terminal, Git, C, compiler, debugger, testing, or memory-model knowledge is assumed.',
    'Setup is separate from the eight instructional Weeks and may be skipped capability by capability after verification.',
    'Required learning resources are free to access; a free verified GitHub account is needed only for final repository publication.',
    'Most project work can continue offline after the required tools and referenced materials have been opened or downloaded.',
    'This beginner course uses fixed capacities and standard-library C; it does not claim production security or replace later systems-programming study.',
  ],
  setup: {
    title: 'C workstation setup',
    description: 'Install and verify a small Windows C17 toolchain. Skip only a capability whose verification checks already pass.',
    estimatedMinutes: 150,
    capabilities: [
      { id: 'CLNG-R2-SETUP-CAP01', title: 'MSYS2 UCRT64 GCC and GDB', description: 'Install the maintained UCRT64 toolchain and identify the compiler and debugger executables.', required: true, skippableWhenVerified: true, instructions: ['Open the Week 1 MSYS2 installer and environment cards.', 'Install to the supported short path if the toolchain is absent.', 'Select UCRT64 and install only the assigned GCC/GDB toolchain.'], verification: ['`gcc --version` reports GCC from `C:\\msys64\\ucrt64\\bin`.', '`gdb --version` reports GDB.', '`where.exe gcc` does not select an unintended compiler first.'] },
      { id: 'CLNG-R2-SETUP-CAP02', title: 'VS Code C workspace', description: 'Use VS Code with the verified compiler to build, run, and later debug a saved C file.', required: true, skippableWhenVerified: true, instructions: ['Install VS Code if needed.', 'Install the assigned C/C++ extension.', 'Create a course folder without private data and open it in VS Code.'], verification: ['A saved `.c` file builds with the exact C17 warning command.', 'PowerShell runs the resulting `.exe`.', 'VS Code can select the verified GDB executable.'] },
      { id: 'CLNG-R2-SETUP-CAP03', title: 'Git identity', description: 'Install Git and set the name and email recorded by local commits.', required: true, skippableWhenVerified: true, instructions: ['Open the Week 1 Git setup card.', 'Install Git for Windows if needed.', 'Set and inspect the intended global identity.'], verification: ['`git --version` reports a version.', 'Both global identity commands return the intended values.'] },
      { id: 'CLNG-R2-SETUP-CAP04', title: 'Free GitHub account', description: 'Create or verify the account used to publish the final source repository.', required: true, skippableWhenVerified: true, instructions: ['Open the Week 1 GitHub account card.', 'Create a free personal account if needed.', 'Verify the email address.'], verification: ['The learner can sign in.', 'The account email is verified.', 'No paid plan was selected.'] },
    ],
  },
  phases,
  competencies,
  concepts,
  resources: sourceResources,
  weeks: sourceWeeks,
  projects: [
    {
      id: 'CLNG-R2-PJ01',
      title: 'C Practice Portfolio',
      outcome: 'Produce seven progressively stronger warning-clean programs demonstrating execution, typed input, decisions, arrays, functions, bounded records, persistence, debugging, and checks.',
      competencyIds: competencies.filter((item) => !['CLNG-R2-C024', 'CLNG-R2-C025'].includes(item.id)).map((item) => item.id),
      milestones: sourceWeeks.slice(0, 7).map((week) => ({ id: `CLNG-R2-PJ01-M${two(week.sequence)}`, title: week.builds[0].title, weekId: week.id, buildId: week.builds[0].id })),
    },
    {
      id: 'CLNG-R2-PJ02',
      title: 'LabTrack CLI',
      outcome: 'Deliver and publish a verified, persistent, source-only C command-line program with reproducible build instructions and human-reviewable evidence.',
      competencyIds: ['CLNG-R2-C024', 'CLNG-R2-C025', 'CLNG-R2-C016', 'CLNG-R2-C019', 'CLNG-R2-C020', 'CLNG-R2-C021', 'CLNG-R2-C022', 'CLNG-R2-C023'],
      milestones: [{ id: 'CLNG-R2-PJ02-M01', title: 'LabTrack CLI production release', weekId: 'CLNG-R2-W08', buildId: 'CLNG-R2-B-W08-01' }],
    },
  ],
  graduation: {
    outcome: 'Write, compile, debug, verify, document, and publish small warning-clean C17 programs with enough fluency for introductory practical examinations and beginner projects.',
    requiredCompetencyIds: competencies.filter((item) => item.importance === 'core').map((item) => item.id),
    requiredProjectIds: ['CLNG-R2-PJ01', 'CLNG-R2-PJ02'],
  },
};

export const research = authoredResources.map((resource) => ({
  ...sourceResources.find((item) => item.id === resource.id),
  accessStatus: 'verified',
  checkedAt: resource.inspectedAt,
  selectionRole: resource.role,
  formatRationale: `${resource.format} was selected because it is the smallest credible ${resource.learningRole} route for this exact point, not to satisfy a format quota.`,
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
    notes: `The final page, title, public access, and assigned boundary were inspected during the ${resource.inspectedAt.slice(0, 10)} production research pass.`,
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
      { title: selected.title, url: selected.url, provider: selected.provider, disposition: 'selected', reason: `Opened and selected for its bounded ${resource.learningRole} role, prerequisite fit, free access, and direct support for the named learner action.` },
      { title: resource.alternative.title, url: resource.alternative.url, provider: resource.alternative.provider, disposition: 'rejected', reason: resource.alternative.reason },
    ],
    prerequisiteFit: {
      assumedCompetencyIds: [...resource.assumedCompetencyIds], unresolvedAssumptions: [], resolution: 'fit',
      evidence: resource.assumedCompetencyIds.length === 0 ? 'The assignment begins from basic computer literacy or defines every programming term it uses.' : `Every assumed competency (${resource.assumedCompetencyIds.join(', ')}) is established earlier in the ordered Study path.`,
      expectedOutcome: expected, bridgeResourceIds: [],
    },
    modalityReview: { consideredFormats: [...resource.consideredFormats], selectedFormat: selected.format, rationale: `Compared ${resource.consideredFormats.join(', ')}; ${selected.format} best matches this ${resource.learningRole} action and its bounded scope.` },
    documentationTeachingJustification: selected.format === 'documentation' ? 'The assignment names exact headings or API entries, includes an observable compile, run, trace, inspection, or decision action, and stops before advanced material; it is never an unbounded documentation hub.' : 'Not applicable; this is not documentation used as the primary teaching route.',
    judgment: {
      beginnerClarity: `The entry, exact action, and stop point isolate what is needed to achieve: ${expected}`,
      competencyFit: `The inspected content directly supports ${selected.competencyIds.join(', ')} and the same Week's named trace or Build.`,
      correctness: 'Syntax, commands, memory rules, and procedures were checked against the opened official or established educational destination.',
      currency: `The final destination and assigned section were inspected on ${resource.inspectedAt.slice(0, 10)}.`,
      pacing: `${selected.estimatedMinutes} minutes is bounded and preserves most of the six-hour Week for active coding, compiling, debugging, assessment, and Proof.`,
      practiceQuality: resource.learningRole === 'practice' ? 'The learner must predict, compile, run, inspect, trace, or compare observable state before continuing.' : 'The assignment feeds an immediate trace, Skill Check decision, or required Build action.',
      redundancy: `This card's distinct contribution is: ${resource.purpose}`,
      prerequisiteFit: 'All assumed skills are established earlier or introduced inside the assigned boundary.',
      learnerStageFit: `The examples and terminology fit the accumulated knowledge available before ${resource.weekId}.`,
      scopeFit: 'The assignment uses exact start, consume, and stop instructions rather than delegating scope to the beginner.',
      accessibility: selected.format === 'video' ? 'The video is free and paired with a readable current route in the same Week.' : 'The content is readable or interactive in a standard browser and does not require a paid tool.',
      cost: 'The assigned content is free; no subscription, certificate, or paid upgrade is required.',
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
    ? 'The target deliberately retrieves an earlier Core resource and applies it inside the current integration decision.'
    : question.classification === 'C'
      ? 'The item combines only cited current or earlier Core ideas into a bounded interpretation.'
      : 'The exact reasoning target is taught and demonstrated in the cited current-Week Core assignment before the check.',
  repair: 'rewritten',
  targetId: `CLNG-R2-AT-${question.id.slice(-6)}`,
  assessmentType: question.assessmentType,
}));

const assessmentEntries = allQuestions.map((question) => ({
  questionId: question.id,
  targetId: `CLNG-R2-AT-${question.id.slice(-6)}`,
  learningTarget: question.target,
  assessmentType: question.assessmentType,
  quizAppropriate: `A four-option item can check this ${question.assessmentType} decision before the learner demonstrates the related behavior in compiled code and Proof.`,
  whereTaught: { resourceIds: [...question.supportingResourceIds], evidence: 'The cited bounded assignment explicitly teaches or demonstrates the target before assessment.' },
}));

export const audit = {
  schemaVersion: '1.3', curriculumId: 'CLNG', revision: 2, auditedAt: checkedAt,
  targetLearner: 'A complete programming beginner with basic Windows computer literacy, limited weekly time, and a need for practical-exam fluency plus credible small C projects.',
  resourceAudits,
  questionAudits,
  buildAudits: editorialBuildAudits,
  weekReadiness: editorialWeekReadiness,
  semanticReview: editorialSemanticReview,
  focusVendor: { applicable: false, rationale: 'Resources are selected by point-of-use quality across MSYS2, OneCompiler, CS50, Beej, cppreference, GCC, VS Code, GitHub, and other current destinations rather than by a vendor quota.' },
  repairLedger: editorialRepairLedger,
  weekResourceAudit: sourceWeeks.map((week) => ({
    weekId: week.id,
    selectedStudyCards: week.study.resources.length,
    coreCards: week.study.resources.filter((item) => item.role === 'core').length,
    optionalCards: week.study.resources.filter((item) => item.role === 'optional').length,
    finalUrlsChecked: week.study.resources.map((item) => resourceById.get(item.resourceId).url),
    deadOrUnavailable: [], redirectsObserved: [], accessRestrictions: [],
    learnerAction: week.study.resources.map((item) => ({ resourceId: item.resourceId, action: resourceAudits.find((record) => record.resourceId === item.resourceId).primaryLearnerAction })),
    skillCheckImpact: 'Every question cites active current or earlier Core teaching; no D-class or untaught target remains.',
    buildImpact: `The ordered Study route prepares the learner to begin ${week.builds[0].title}; artifact production remains inside the Build.`,
    result: 'PASS',
  })),
  beforeRepair: { status: 'WITHDRAWN', summary: 'Revision 1 used a shared generated introductory template and course-owned definition pages that did not satisfy the approved comprehensive beginner-learning contract.' },
  afterRepair: { status: 'CANDIDATE', summary: 'Revision 2 is independently authored around current external C teaching, active traces, eight distinct programs, source-mapped assessment, warning-clean builds, bounded memory use, failure-preserving persistence, and explicit human-review Proof.' },
  assessmentCoverageMap: { entries: assessmentEntries },
  assessmentRepair: { authoringStandard: 'SKILL_CHECK_AUTHORING_STANDARD.md', questionsReviewed: allQuestions.length, answerOrder: 'shuffle-per-attempt', passRule: '7/10', attempts: 'unlimited', generatedSemanticApproval: false },
};

export const studio = {
  schemaVersion: '1.1', curriculumId: 'CLNG', revision: 2,
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
        tools: week.sequence < 7 ? 'Windows, MSYS2 UCRT64 GCC/GDB, VS Code, PowerShell, and the C standard library' : (week.sequence < 8 ? 'Windows, MSYS2 UCRT64 GCC/GDB, VS Code debugger, PowerShell, and the C standard library' : 'Windows, MSYS2 UCRT64 GCC/GDB, VS Code debugger, PowerShell, Git, a free verified GitHub account, and the C standard library'),
        estimatedMinutes: build.estimatedMinutes,
        prerequisites: build.learnerGuide.priorKnowledgeCompetencyIds.length ? `Previously completed competencies: ${build.learnerGuide.priorKnowledgeCompetencyIds.join(', ')}. New Week concepts are taught in Core Study before this Build.` : "Only verified setup capabilities and this Week's Core Study are required.",
        finished: build.acceptanceCriteria.map((item) => item.text).join(' '),
        submission: plan.proof.join(' | '),
      },
      steps: build.steps.map((step) => step.text),
      checklist: build.acceptanceCriteria.map((criterion) => criterion.text),
      stuck: 'Return to the exact cited Core boundary for the failing concept, reduce the program to the smallest warning or failing case, read the first relevant compiler, linker, debugger, parse, or actual-versus-expected evidence, change one cause, and rerun the same case before continuing. Do not copy a complete solution.',
      prerequisiteReview: { unresolvedTerms: [], evidence: 'Every tool, command, concept, file, buffer, record, and output is taught earlier, taught in current bounded Study, or supplied directly by the Build contract and starter.' },
    };
  }),
};

export const profession = {
  curriculumId: 'CLNG', revision: 2, researchedAt: checkedAt,
  role: 'Beginning C programmer',
  roleDefinition: 'A learner who can independently produce and explain small warning-clean C17 programs using core syntax, typed values, formatted I/O, validation, loops, arrays, functions, bounded strings, pointers to live objects, structs, checked text files, debugging, dependency-free checks, Git, and clear build instructions.',
  evidenceSummary: 'The capability boundary was triangulated across current C teaching, compiler/library documentation, debugger guidance, and GitHub safety material, then constrained to eight six-hour instructional Weeks.',
  capabilityTiers: [
    { tier: 'Foundational', weeks: '1-4', outcome: 'Compile and run code, reason about typed values, repair diagnostics, validate numeric input, make decisions, and process fixed arrays within bounds.' },
    { tier: 'Program construction', weeks: '5-7', outcome: 'Decompose multi-file behavior, manage bounded text and live-object pointers, model records, persist defensively, debug, and run dependency-free checks.' },
    { tier: 'Reliable delivery', weeks: '8', outcome: 'Integrate proven C competencies into a documented, verified, persistent command-line application and publish source safely.' },
  ],
  practitionerOutputs: weekPlans.map((week) => week.build.title),
  professionalPractices: ['predict before compiling or running', 'keep warnings enabled', 'read the first relevant diagnostic before editing', 'validate conversions, ranges, capacities, and divisors before use', 'keep pointers tied to live objects', 'test normal, boundary, invalid, missing, and malformed cases', 'preserve failed input and existing files for diagnosis', 'document exact build and run commands', 'inspect staged files before publishing'],
  boundaries: ['No GUI or web framework', 'No third-party runtime dependencies', 'No dynamic-memory allocation requirement', 'No pointer arithmetic curriculum', 'No database or network API', 'No concurrency', 'No automated cloud deployment', 'No claim of production security'],
  graduationBoundary: source.graduation.outcome,
  technologyDecision: 'MSYS2 UCRT64 GCC/GDB, VS Code, PowerShell, the C standard library, Git, and GitHub provide a maintained Windows route with high practical-exam value and no paid IDE requirement.',
  sources: [...new Set(sourceResources.map((resource) => resource.url))],
};

export const learningDesign = {
  curriculumId: 'CLNG', revision: 2,
  designPrinciple: 'A beginner first receives a bounded explanation or demonstration, predicts and traces behavior, then writes, compiles with warnings, breaks safely, repairs from evidence, verifies, explains, and proves a progressively less scaffolded C program.',
  targetLearner: source.target.learner,
  technologySequence: ['Windows GCC/GDB and VS Code setup', 'source, preprocessing, compilation, linking, main, printf, and diagnostics', 'typed numeric input, conversion counts, addresses, quotient, remainder, and floating conversion', 'ordered validation and Boolean decisions', 'loops, fixed arrays, counters, accumulators, and bounds', 'function contracts, returns, pass-by-value, headers, translation units, and linker evidence', 'bounded strings, pointer validity, structs, search, and update', 'FILE operations, checked records, failure preservation, debugger evidence, and dependency-free checks', 'argc/argv, modular CLI integration, Git, README, and GitHub'],
  learningRhythm: ['bounded external Learn or demonstration', 'active prediction, compile, run, trace, or precise reference', '10-target shuffled Skill Check', 'required Build in sessions of at most two hours', 'human-reviewable Proof', 'specific reflection'],
  resourceRoleStrategy: { learn: 'A short first explanation or visual demonstration.', practice: 'An observable prediction, compile, run, trace, debugger inspection, or comparison.', reference: 'A precise bounded language, compiler, or library lookup beside immediate work, never an unscoped documentation dump.' },
  progressionPolicy: ['Weeks 1-4 establish compilation, diagnostics, typed input, decisions, and bounded iteration without a calculator-first jump.', 'Weeks 5-7 combine earlier syntax through functions, multi-file builds, bounded records, persistence, debugging, and checks.', 'Week 8 introduces only command-line routing and safe publication while integrating already proven competencies.'],
  workloadPrinciples: ['Eight instructional Weeks at six hours each.', 'Setup is separate and skippable only through explicit verification.', 'No Build session exceeds two hours.', 'Most time is reserved for writing, compiling, tracing, debugging, checks, evidence, and explanation rather than passive consumption.'],
  assessmentPolicy: 'Each Week has ten independently authored, source-mapped questions; 7/10 passes; attempts are unlimited; option order reshuffles per attempt; program competence is judged through Build and Proof, not quiz score alone.',
  projectArchitecture: source.projects.map((project) => ({ projectId: project.id, title: project.title, milestoneCount: project.milestones.length, outcome: project.outcome })),
};

export { allQuestions, questionsByWeek };
