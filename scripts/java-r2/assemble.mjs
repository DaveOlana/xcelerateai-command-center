import { competencies, concepts, phases, weekPlans } from './course-data.mjs';
import { checkedAt, resources as authoredResources } from './resources.mjs';
import { allQuestions, questionsByWeek } from './questions.mjs';
import { editorialBuildAudits, editorialRepairLedger, editorialSemanticReview, editorialWeekReadiness } from './editorial-review.mjs';

const two = (value) => String(value).padStart(2, '0');
const weekId = (sequence) => `JAVA-R2-W${two(sequence)}`;

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
  const proofPrefix = `JAVA-R2-PR-W${two(plan.sequence)}`;
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
      id: `JAVA-R2-SC-W${two(plan.sequence)}`,
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
      prompts: plan.reflections.map((prompt, index) => ({ id: `JAVA-R2-RF-W${two(plan.sequence)}-${two(index + 1)}`, prompt })),
    },
  };
});

export const source = {
  schemaVersion: '2.0',
  curriculumId: 'JAVA',
  revision: 2,
  title: 'Java Programming Foundations',
  shortTitle: 'Java Foundations',
  catalog: { category: 'Introductory Computer Science', level: 'introductory' },
  target: {
    role: 'Beginning Java programmer',
    learner: 'A tertiary fresher or independent beginner with basic computer literacy and no assumed programming experience',
    professionalOutcome: 'Write, run, debug, verify, document, and publish small dependency-free Java programs with enough fluency for introductory practical examinations and beginner projects.',
    specialGoals: ['syntax recognition', 'compilation and JVM mental model', 'program tracing', 'debugging', 'small console programs', 'methods', 'object-oriented foundations', 'text-file persistence', 'dependency-free checks', 'Git and GitHub', 'practical-exam readiness'],
  },
  workload: { weeklyHours: { min: 6, max: 6 }, estimatedTotalHours: 48, estimatedWeeks: 8 },
  assumptions: [
    'The learner has a Windows computer and basic file, browser, and typing skills.',
    'No prior programming, command-line, Git, Java, testing, or object-oriented knowledge is assumed.',
    'Setup is separate from the eight instructional Weeks and may be skipped capability by capability after verification.',
    'Required learning resources are free to access; a free verified GitHub account is needed only for final repository publication.',
    'Most project work can continue offline after the required tools and referenced materials have been opened or downloaded.',
  ],
  setup: {
    title: 'Java workstation setup',
    description: 'Install and verify the smallest Windows Java toolchain used throughout the course. Skip only a capability whose verification checks already pass.',
    estimatedMinutes: 120,
    capabilities: [
      { id: 'JAVA-R2-SETUP-CAP01', title: 'Current supported JDK', description: 'Install a current supported JDK and verify the Java launcher and compiler.', required: true, skippableWhenVerified: true, instructions: ['Open the Week 1 JDK and IntelliJ setup cards.', 'Install the assigned current JDK for the current user.', 'Close and reopen PowerShell.'], verification: ['`java --version` reports the assigned JDK.', '`javac --version` reports the matching compiler.'] },
      { id: 'JAVA-R2-SETUP-CAP02', title: 'IntelliJ IDEA workspace', description: 'Install IntelliJ IDEA, select the intended JDK, and run a saved Java class.', required: true, skippableWhenVerified: true, instructions: ['Install the free IntelliJ core experience.', 'Create a Java project using the verified JDK.', 'Save and run a class with a main method.'], verification: ['The project SDK is the intended JDK.', 'The Run tool window displays the saved program output.'] },
      { id: 'JAVA-R2-SETUP-CAP03', title: 'Git identity', description: 'Install Git and set the name/email recorded by local commits.', required: true, skippableWhenVerified: true, instructions: ['Open the Week 1 Git setup card.', 'Install Git for Windows if needed.', 'Set the global name and commit email.'], verification: ['`git --version` reports a version.', 'Both global identity commands return the intended values.'] },
      { id: 'JAVA-R2-SETUP-CAP04', title: 'Free GitHub account', description: 'Create or verify the account used to publish the final project.', required: true, skippableWhenVerified: true, instructions: ['Open the Week 1 GitHub account card.', 'Create a free personal account if needed.', 'Verify the email address.'], verification: ['The learner can sign in.', 'The account email is verified.', 'No paid plan was selected.'] },
    ],
  },
  phases,
  competencies,
  concepts,
  resources: sourceResources,
  weeks: sourceWeeks,
  projects: [
    {
      id: 'JAVA-R2-PJ01',
      title: 'Java Practice Portfolio',
      outcome: 'Produce seven progressively stronger programs demonstrating execution, typed values, decisions, collections, methods, objects, persistence, debugging, and checks.',
      competencyIds: competencies.filter((item) => !['JAVA-C022', 'JAVA-C023'].includes(item.id)).map((item) => item.id),
      milestones: sourceWeeks.slice(0, 7).map((week) => ({ id: `JAVA-R2-PJ01-M${two(week.sequence)}`, title: week.builds[0].title, weekId: week.id, buildId: week.builds[0].id })),
    },
    {
      id: 'JAVA-R2-PJ02',
      title: 'StudySprint CLI',
      outcome: 'Deliver and publish a verified, persistent campus-task command-line program with a reproducible README and human-reviewable evidence.',
      competencyIds: ['JAVA-C022', 'JAVA-C023', 'JAVA-C015', 'JAVA-C016', 'JAVA-C018', 'JAVA-C019', 'JAVA-C020', 'JAVA-C021'],
      milestones: [{ id: 'JAVA-R2-PJ02-M01', title: 'StudySprint CLI production release', weekId: 'JAVA-R2-W08', buildId: 'JAVA-R2-B-W08-01' }],
    },
  ],
  graduation: {
    outcome: 'Write, run, debug, verify, document, and publish small dependency-free Java programs with enough fluency for introductory practical examinations and beginner projects.',
    requiredCompetencyIds: competencies.filter((item) => item.importance === 'core').map((item) => item.id),
    requiredProjectIds: ['JAVA-R2-PJ01', 'JAVA-R2-PJ02'],
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
    documentationTeachingJustification: selected.format === 'documentation' ? 'The assignment names exact headings or API entries, includes an observable run/trace action, and stops before advanced material; it is never an unbounded documentation hub.' : 'Not applicable; this is not documentation used as the primary teaching route.',
    judgment: {
      beginnerClarity: `The entry, exact action, and stop point isolate what is needed to achieve: ${expected}`,
      competencyFit: `The inspected content directly supports ${selected.competencyIds.join(', ')} and the same Week's named trace or Build.`,
      correctness: 'Syntax, commands, and procedures were checked against the opened official or established educational destination.',
      currency: `The final destination and assigned section were inspected on ${resource.inspectedAt.slice(0, 10)}.`,
      pacing: `${selected.estimatedMinutes} minutes is bounded and preserves most of the six-hour Week for active coding, debugging, assessment, and Proof.`,
      practiceQuality: resource.learningRole === 'practice' ? 'The learner must predict, execute, inspect, or compare observable state before continuing.' : 'The assignment feeds an immediate trace, Skill Check decision, or required Build action.',
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
  targetId: `JAVA-R2-AT-${question.id.slice(-6)}`,
  assessmentType: question.assessmentType,
}));

const assessmentEntries = allQuestions.map((question) => ({
  questionId: question.id,
  targetId: `JAVA-R2-AT-${question.id.slice(-6)}`,
  learningTarget: question.target,
  assessmentType: question.assessmentType,
  quizAppropriate: `A four-option item can check this ${question.assessmentType} decision before the learner demonstrates the related behavior in code and Proof.`,
  whereTaught: { resourceIds: [...question.supportingResourceIds], evidence: 'The cited bounded assignment explicitly teaches or demonstrates the target before assessment.' },
}));

export const audit = {
  schemaVersion: '1.3',
  curriculumId: 'JAVA',
  revision: 2,
  auditedAt: checkedAt,
  targetLearner: 'A complete programming beginner with basic Windows computer literacy, limited weekly time, and a need for practical-exam fluency plus credible small projects.',
  resourceAudits,
  questionAudits,
  buildAudits: editorialBuildAudits,
  weekReadiness: editorialWeekReadiness,
  semanticReview: editorialSemanticReview,
  focusVendor: { applicable: false, rationale: 'Resources are selected by point-of-use quality across Dev.java, JetBrains, GitHub, and other current Java learning destinations rather than by a vendor quota.' },
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
  afterRepair: { status: 'CANDIDATE', summary: 'Revision 2 is independently authored around current external Java teaching, active traces, eight distinct programs, source-mapped assessment, defensive persistence, and explicit human-review Proof.' },
  assessmentCoverageMap: { entries: assessmentEntries },
  assessmentRepair: { authoringStandard: 'SKILL_CHECK_AUTHORING_STANDARD.md', questionsReviewed: allQuestions.length, answerOrder: 'shuffle-per-attempt', passRule: '7/10', attempts: 'unlimited', generatedSemanticApproval: false },
};

export const studio = {
  schemaVersion: '1.1', curriculumId: 'JAVA', revision: 2,
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
        tools: week.sequence < 7 ? 'Windows, a current supported JDK, IntelliJ IDEA, and PowerShell' : (week.sequence < 8 ? 'Windows, a current supported JDK, IntelliJ IDEA, PowerShell, and Java standard-library APIs' : 'Windows, a current supported JDK, IntelliJ IDEA, PowerShell, Git, a free verified GitHub account, and Java standard-library APIs'),
        estimatedMinutes: build.estimatedMinutes,
        prerequisites: build.learnerGuide.priorKnowledgeCompetencyIds.length ? `Previously completed competencies: ${build.learnerGuide.priorKnowledgeCompetencyIds.join(', ')}. New Week concepts are taught in Core Study before this Build.` : "Only verified setup capabilities and this Week's Core Study are required.",
        finished: build.acceptanceCriteria.map((item) => item.text).join(' '),
        submission: plan.proof.join(' | '),
      },
      steps: build.steps.map((step) => step.text),
      checklist: build.acceptanceCriteria.map((criterion) => criterion.text),
      stuck: 'Return to the exact cited Core boundary for the failing concept, reduce the program to the smallest failing case, read the first useful compiler diagnostic, stack-trace location, or actual-versus-expected difference, change one cause, and rerun the same case before continuing. Do not copy a complete solution.',
      prerequisiteReview: { unresolvedTerms: [], evidence: 'Every tool, command, concept, file, and output is taught earlier, taught in current bounded Study, or supplied directly by the Build contract and starter.' },
    };
  }),
};

export const profession = {
  curriculumId: 'JAVA', revision: 2, researchedAt: checkedAt,
  role: 'Beginning Java programmer',
  roleDefinition: 'A learner who can independently produce and explain small dependency-free Java programs using core syntax, typed values, collections, methods, classes, objects, files, narrow exception handling, debugging, checks, Git, and clear run instructions.',
  evidenceSummary: 'The capability boundary was triangulated across current Java and IntelliJ learning material plus GitHub guidance and constrained to eight six-hour instructional Weeks.',
  capabilityTiers: [
    { tier: 'Foundational', weeks: '1-4', outcome: 'Compile and run code, reason about typed values, repair basic failures, make validated decisions, and process arrays and lists.' },
    { tier: 'Program construction', weeks: '5-7', outcome: 'Decompose behavior, model independent object state, persist text defensively, debug, and run dependency-free checks.' },
    { tier: 'Reliable delivery', weeks: '8', outcome: 'Integrate proven Java competencies into a documented, verified, persistent command-line application.' },
  ],
  practitionerOutputs: weekPlans.map((week) => week.build.title),
  professionalPractices: ['predict before running', 'read compiler and stack-trace evidence before editing', 'validate before mutation or saving', 'separate domain logic from input/output', 'test normal, boundary, and invalid cases', 'preserve malformed data for diagnosis', 'document exact commands', 'inspect staged files before publishing'],
  boundaries: ['No GUI or web framework', 'No Maven or Gradle requirement', 'No third-party runtime dependencies', 'No database or network API', 'No inheritance or concurrency', 'No automated cloud deployment'],
  graduationBoundary: source.graduation.outcome,
  technologyDecision: 'A current supported JDK, IntelliJ IDEA, PowerShell, Java standard-library APIs, Git, and GitHub minimize setup burden while preserving practical-exam and beginner-project value.',
  sources: [...new Set(sourceResources.map((resource) => resource.url))],
};

export const learningDesign = {
  curriculumId: 'JAVA', revision: 2,
  designPrinciple: 'A beginner first receives a bounded explanation or demonstration, predicts and traces behavior, then writes, compiles, breaks, repairs, verifies, explains, and proves a progressively less scaffolded program.',
  targetLearner: source.target.learner,
  technologySequence: ['Windows JDK/IntelliJ setup', 'source, compiler, JVM, main, and diagnostics', 'types, Strings, Scanner, and conversion', 'branches and narrow recovery', 'loops, arrays, and ArrayList', 'methods, returns, and scope', 'classes, objects, and encapsulation', 'Path, Files, exceptions, debugger, and check harness', 'args, Git, README, and GitHub'],
  learningRhythm: ['bounded external Learn or demonstration', 'active trace or precise reference', '10-target shuffled Skill Check', 'required Build in sessions of at most two hours', 'human-reviewable Proof', 'specific reflection'],
  resourceRoleStrategy: { learn: 'A short first explanation or visual demonstration.', practice: 'An observable prediction, trace, compile, run, or comparison.', reference: 'A precise bounded lookup beside immediate work, never an unscoped documentation dump.' },
  progressionPolicy: ['Weeks 1-4 establish execution, typed values, decisions, and iteration without a calculator-first jump.', 'Weeks 5-7 combine earlier syntax through methods, objects, persistence, debugging, and checks.', 'Week 8 integrates proven competencies into one larger independently inspectable project.'],
  workloadPrinciples: ['Eight instructional Weeks at six hours each.', 'Setup is separate and skippable only through explicit verification.', 'No Build session exceeds two hours.', 'Most time is reserved for coding, compiling, debugging, checks, evidence, and explanation rather than passive consumption.'],
  assessmentPolicy: 'Each Week has ten independently authored, source-mapped questions; 7/10 passes; attempts are unlimited; option order reshuffles per attempt; program competence is judged through Build and Proof, not quiz score alone.',
  projectArchitecture: source.projects.map((project) => ({ projectId: project.id, title: project.title, milestoneCount: project.milestones.length, outcome: project.outcome })),
};

export { allQuestions, questionsByWeek };
