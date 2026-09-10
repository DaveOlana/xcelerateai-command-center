/**
 * Human-authored PYAE Revision 3 evidence for Weeks 17-24.
 *
 * This module is data only. It never reads, writes, migrates, compiles, or
 * publishes curriculum artifacts. All web destinations represented here were
 * inspected on 2026-09-09.
 */

const checkedAt = '2026-09-09';

const judgment = (
  beginnerClarity,
  competencyFit,
  factualCorrectness,
  currency,
  stageAppropriateness,
  guidedPractice,
  accessibility,
) => ({
  beginnerClarity,
  competencyFit,
  factualCorrectness,
  currency,
  stageAppropriateness,
  guidedPractice,
  accessibility,
});

const candidate = (title, url, decision, evidence) => ({
  title,
  url,
  decision,
  evidence,
});

function makeResourcePlan({
  id,
  weekId,
  decision,
  title,
  url,
  provider,
  format,
  estimatedMinutes,
  location,
  competencyIds,
  role,
  learningRole,
  purposes,
  assignmentPurpose,
  whySelected,
  formatRationale,
  alternativeNotes,
  candidateComparisons = [],
  judgment: resourceJudgment,
  rationale,
}) {
  const resourcePatch = {
    title,
    url,
    provider,
    format,
    cost: 'free',
    estimatedMinutes,
    location: { note: location },
    competencyIds,
    whySelected,
    accessStatus: 'verified',
    checkedAt,
    selectionRole: role,
    learningRole,
    formatRationale,
    purpose: purposes,
    evaluation: {
      competencyFit: resourceJudgment.competencyFit,
      clarity: resourceJudgment.beginnerClarity,
      correctnessAndCurrency:
        resourceJudgment.factualCorrectness + ' ' + resourceJudgment.currency,
      accessibility: resourceJudgment.accessibility,
    },
    accessNotes:
      'Destination opened successfully on 2026-09-09. The assigned material is free to read or watch and does not require a learner account.',
    alternativeNotes,
  };

  return {
    weekId,
    decision,
    resourcePatch,
    assignment: {
      role,
      learningRole,
      competencyIds,
      purpose: assignmentPurpose,
    },
    candidateComparisons,
    judgment: resourceJudgment,
    rationale,
  };
}

function makeAddedResourcePlan(spec) {
  const plan = makeResourcePlan(spec);
  return {
    weekId: plan.weekId,
    resource: { id: spec.id, ...plan.resourcePatch },
    assignment: plan.assignment,
    candidateComparisons: plan.candidateComparisons,
    judgment: plan.judgment,
    rationale: plan.rationale,
  };
}

export const resourcePlans = {
  'PYAE-R-W17-01': makeResourcePlan({
    id: 'PYAE-R-W17-01',
    weekId: 'PYAE-W17',
    decision: 'retain',
    title: 'Demystifying evals for AI agents',
    url: 'https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents',
    provider: 'Anthropic',
    format: 'article',
    estimatedMinutes: 90,
    location:
      'Read The structure of an evaluation, Types of graders for agents, Capability vs. regression evals, How to think about non-determinism, and roadmap Steps 0-6. Build a task/trial/grader/transcript/outcome/harness mapping for this Build. Stop before long-term organizational maintenance.',
    competencyIds: ['PYAE-C027', 'PYAE-C010'],
    role: 'core',
    learningRole: 'learn',
    purposes: ['primary mental model', 'evaluation design'],
    assignmentPurpose:
      'Learn how an agent evaluation separates tasks, trials, observable trajectories, outcomes, graders, and regression gates before you design your own suite.',
    whySelected:
      'This article explains agent-specific evaluation from first principles, compares deterministic, model, and human graders, and explicitly warns against brittle exact-path scoring. It is a stronger first explanation than an API product guide for a learner building an offline custom harness.',
    formatRationale:
      'A narrative engineering article is appropriate for the conceptual distinctions that must precede implementation.',
    alternativeNotes:
      'Retained over API-first eval tutorials because the Build is framework-neutral and offline.',
    candidateComparisons: [
      candidate(
        'Working with evals',
        'https://developers.openai.com/api/docs/guides/evals',
        'not selected as primary',
        'Accurate but centered on OpenAI-managed eval creation and execution rather than the custom local harness.',
      ),
    ],
    judgment: judgment(
      'Defines unfamiliar eval vocabulary before using it and supplies concrete examples.',
      'Directly covers dataset design, trajectory/outcome grading, pass rates, and regression use.',
      'Its distinctions and cautions agree with the observable offline harness required here.',
      'Published in 2026 and inspected at the assigned destination.',
      'Deep enough for Week 17 without requiring an eval platform.',
      'The learner converts the framework into a schema and grader plan before coding.',
      'Public article; no login, payment, or live model is needed.',
    ),
    rationale:
      'Retain as the week’s best framework-neutral mental model and repair the assignment to an exact bounded reading/activity.',
  }),

  'PYAE-R-W17-02': makeResourcePlan({
    id: 'PYAE-R-W17-02',
    weekId: 'PYAE-W17',
    decision: 'retain-demote',
    title: 'Working with evals',
    url: 'https://developers.openai.com/api/docs/guides/evals',
    provider: 'OpenAI',
    format: 'documentation',
    estimatedMinutes: 45,
    location:
      'Read the overview, data-source and testing-criteria design, and result-analysis sections. Stop before uploading/running an API eval; no account or API execution is part of this assignment.',
    competencyIds: ['PYAE-C027'],
    role: 'optional',
    learningRole: 'reference',
    purposes: ['implementation reference', 'industry comparison'],
    assignmentPurpose:
      'Compare your local dataset and graders with a production eval service’s vocabulary without making that service part of your Build.',
    whySelected:
      'The guide is a useful current industry reference for data sources, criteria, and result analysis, but its managed-API workflow is not needed to complete or pass the offline project.',
    formatRationale:
      'Documentation is suitable as an optional implementation comparison after the primary explanation.',
    alternativeNotes:
      'Demoted because account-bound API execution would add cost and provider coupling without improving the required offline evidence.',
    judgment: judgment(
      'The conceptual portions are readable after R-W17-01, though the full page is long.',
      'Supports evaluation criteria and result interpretation but not the custom runner mechanics.',
      'Accurately documents the current OpenAI eval workflow.',
      'Current provider documentation inspected on 2026-09-09.',
      'Appropriate only as optional reference at this stage.',
      'The bounded comparison activity prevents an account/API detour.',
      'Reading is public; execution would require an account, so execution is explicitly excluded.',
    ),
    rationale:
      'Retain for reference value but remove it from the mandatory knowledge path.',
  }),

  'PYAE-R-W17-03': makeResourcePlan({
    id: 'PYAE-R-W17-03',
    weekId: 'PYAE-W17',
    decision: 'retain',
    title: 'Testing agents',
    url: 'https://openai.github.io/openai-agents-python/testing/',
    provider: 'OpenAI',
    format: 'lab',
    estimatedMinutes: 75,
    location:
      'Complete Return a fixed response, Test a tool workflow, Inspect model calls, and Detect workflow drift. Recreate one equivalent test with the project FakeModel; do not configure a live provider.',
    competencyIds: ['PYAE-C027', 'PYAE-C010', 'PYAE-C011'],
    role: 'core',
    learningRole: 'practice',
    purposes: ['guided practice', 'deterministic test design'],
    assignmentPurpose:
      'Practice scripting a model/tool trajectory and asserting that the workflow consumes exactly the expected steps without a network call.',
    whySelected:
      'The page now provides complete deterministic ScriptedModel recipes, call inspection, and workflow-drift assertions, making it a strong worked example for the local FakeModel harness.',
    formatRationale:
      'Runnable recipes make this a practice asset rather than passive reference documentation.',
    alternativeNotes:
      'The learner adapts the pattern rather than adopting the SDK as the project architecture.',
    judgment: judgment(
      'Recipes progress from one response to a full tool loop with visible assertions.',
      'Directly supports deterministic trajectories, test doubles, and regression detection.',
      'The inspected recipes make no model request and explain their test boundary precisely.',
      'Current Agents SDK testing documentation inspected on 2026-09-09.',
      'Appropriate after the learner already built FakeModel and pytest skills.',
      'Provides code to run and an explicit local adaptation task.',
      'Public and executable without a paid API when used as assigned.',
    ),
    rationale:
      'Retain as the active practice complement to the framework-neutral eval article.',
  }),

  'PYAE-R-W18-01': makeResourcePlan({
    id: 'PYAE-R-W18-01',
    weekId: 'PYAE-W18',
    decision: 'retain',
    title: 'Tracing agent runs',
    url: 'https://openai.github.io/openai-agents-python/tracing/',
    provider: 'OpenAI',
    format: 'documentation',
    estimatedMinutes: 45,
    location:
      'Read Traces and spans, Creating traces, Creating spans, and Sensitive data. Map trace_id, span_id, parent_id, timing, status, and safe attributes to the custom StepSpan. Stop before ecosystem integrations.',
    competencyIds: ['PYAE-C028', 'PYAE-C009'],
    role: 'core',
    learningRole: 'reference',
    purposes: ['agent-specific reference', 'trace field model'],
    assignmentPurpose:
      'See how an agent run becomes linked parent/child operations and identify which fields your local span record must preserve.',
    whySelected:
      'It gives an agent-specific trace hierarchy and explicitly documents parent_id and sensitive-data concerns; the assignment extracts those concepts without requiring the hosted tracing product.',
    formatRationale:
      'Focused reference sections provide precise field semantics after the learner receives a vendor-neutral introduction.',
    alternativeNotes:
      'Kept alongside OpenTelemetry because it supplies agent-event examples while OpenTelemetry supplies the general model.',
    judgment: judgment(
      'The assigned sections are short and concrete once scoped.',
      'Directly supports parent/child spans and safe agent trace attributes.',
      'The documented field is parent_id; the existing quiz answer parent_span_id is incorrect.',
      'Current page inspected on 2026-09-09.',
      'Appropriate as a bounded reference, not the only explanation.',
      'The learner must map the fields to the custom dataclass.',
      'Public reading; no dashboard or API execution is required.',
    ),
    rationale:
      'Retain for agent-specific mapping and correct all curriculum references to parent_id.',
  }),

  'PYAE-R-W18-02': makeResourcePlan({
    id: 'PYAE-R-W18-02',
    weekId: 'PYAE-W18',
    decision: 'replace',
    title: 'OpenTelemetry Python instrumentation',
    url: 'https://opentelemetry.io/docs/languages/python/instrumentation/',
    provider: 'OpenTelemetry',
    format: 'lab',
    estimatedMinutes: 65,
    location:
      'Complete Setup and Traces. Create console-exported parent/child spans with attributes, events, status, and a recorded exception. Stop before Metrics and Logs.',
    competencyIds: ['PYAE-C028', 'PYAE-C009'],
    role: 'core',
    learningRole: 'learn',
    purposes: ['primary tracing model', 'guided instrumentation'],
    assignmentPurpose:
      'Learn the vendor-neutral span model by creating nested timed operations and recording one failure before implementing the project tracer.',
    whySelected:
      'This official OpenTelemetry guide directly teaches manual spans, attributes, events, status, and exception recording in Python; the replaced production guide does not teach the Build’s tracer or recovery model.',
    formatRationale:
      'The page combines explanation with a locally runnable console-exporter exercise.',
    alternativeNotes:
      'Selected over product monitoring pages because the project implements local, provider-neutral trace records.',
    candidateComparisons: [
      candidate(
        'Production best practices',
        'https://developers.openai.com/api/docs/guides/production-best-practices',
        'rejected',
        'Broad deployment page; it discusses latency generally but does not teach span construction, failure classification, or recovery coordination.',
      ),
      candidate(
        'OpenTelemetry Python instrumentation',
        'https://opentelemetry.io/docs/languages/python/instrumentation/',
        'selected',
        'Vendor-neutral, current, and provides runnable nested-span and exception examples.',
      ),
      candidate(
        'Tracing agent runs',
        'https://openai.github.io/openai-agents-python/tracing/',
        'retained separately as reference',
        'Useful agent mapping but tied to one SDK and hosted exporter.',
      ),
    ],
    judgment: judgment(
      'The bounded Setup/Traces route introduces each field through a small program.',
      'Directly covers the span mechanics required by S01 and error evidence used by recovery.',
      'Matches the OpenTelemetry span model and avoids invented tracing terminology.',
      'Current documentation inspected on 2026-09-09.',
      'The assignment stops before unrelated telemetry signals.',
      'Learner runs and modifies a nested-span example locally.',
      'Free public documentation and open-source local packages; no hosted account required.',
    ),
    rationale:
      'Replace a broad, weakly aligned production page with direct tracing instruction.',
  }),

  'PYAE-R-W18-03': makeResourcePlan({
    id: 'PYAE-R-W18-03',
    weekId: 'PYAE-W18',
    decision: 'retain',
    title: 'Python Logging Cookbook — Contextual and Structured Logging',
    url: 'https://docs.python.org/3/howto/logging-cookbook.html',
    provider: 'Python Software Foundation',
    format: 'lab',
    estimatedMinutes: 75,
    location:
      'Use Implementing structured logging, Using a rotator and namer, and Formatting times using UTC. Implement one-JSON-object-per-line output, structured-field redaction, and a forced rollover test; stop after the UTC exercise.',
    competencyIds: ['PYAE-C009', 'PYAE-C028'],
    role: 'core',
    learningRole: 'practice',
    purposes: ['structured logging practice', 'rotation and UTC reference'],
    assignmentPurpose:
      'Practice writing machine-readable local evidence, rotating it safely, and formatting timestamps consistently before integrating tracing.',
    whySelected:
      'The official cookbook contains the exact logging extension points needed for structured records, rotation, and UTC; the activity narrows a very large reference to the Build’s concrete mechanics.',
    formatRationale:
      'Selected sections are converted into a hands-on local logging exercise.',
    alternativeNotes:
      'Retained with an exact route because replacing it would lose authoritative handler and formatter details.',
    judgment: judgment(
      'The full cookbook is overwhelming, but the three named sections are manageable.',
      'Directly supports JSONL-compatible records, rotation, and unambiguous time.',
      'Official recipes accurately demonstrate formatter and handler extension points.',
      'Current Python documentation inspected on 2026-09-09.',
      'Advanced unrelated recipes are explicitly excluded.',
      'Learner implements and forces rollover rather than copying prose.',
      'Free public documentation; only the Python standard library is required.',
    ),
    rationale:
      'Retain and repair title encoding, scope, purpose, and practice instructions.',
  }),

  'PYAE-R-W19-01': makeResourcePlan({
    id: 'PYAE-R-W19-01',
    weekId: 'PYAE-W19',
    decision: 'retain',
    title: 'Coroutines and Tasks',
    url: 'https://docs.python.org/3/library/asyncio-task.html',
    provider: 'Python Software Foundation',
    format: 'documentation',
    estimatedMinutes: 65,
    location:
      'Read Coroutines, Creating Tasks, Task Cancellation, Task Groups, Running Tasks Concurrently, Timeouts, and Running in Threads. Run one TaskGroup sibling-failure example; skip eager-task and introspection sections.',
    competencyIds: ['PYAE-C029'],
    role: 'core',
    learningRole: 'reference',
    purposes: ['authoritative API reference', 'structured concurrency'],
    assignmentPurpose:
      'Use the current Python definitions of task ownership, cancellation, timeouts, and thread offloading while implementing the runner.',
    whySelected:
      'This is the authoritative current reference for TaskGroup, cancellation, asyncio.timeout, gather, and to_thread, which prevents the beginner video’s older syntax from becoming the implementation contract.',
    formatRationale:
      'API documentation is appropriate as the precise reference paired with a beginner video and a queue lab.',
    alternativeNotes:
      'Retained because no secondary tutorial should replace the language’s exact cancellation and timeout behavior.',
    judgment: judgment(
      'Dense but bounded to seven named sections and paired with a video.',
      'Covers nearly every runtime API used by the Build and quiz.',
      'Authoritative semantics for Python 3.11+ structured concurrency.',
      'Current Python documentation inspected on 2026-09-09.',
      'Advanced factories/introspection are excluded.',
      'Includes one required failure/cancellation experiment.',
      'Free and available with the standard library.',
    ),
    rationale:
      'Retain as precise implementation reference, not the sole mental-model resource.',
  }),

  'PYAE-R-W19-02': makeResourcePlan({
    id: 'PYAE-R-W19-02',
    weekId: 'PYAE-W19',
    decision: 'retain-demote',
    title: 'Developing with asyncio',
    url: 'https://docs.python.org/3/library/asyncio-dev.html',
    provider: 'Python Software Foundation',
    format: 'documentation',
    estimatedMinutes: 30,
    location:
      'Read Debug Mode, Concurrency and Multithreading, and Running Blocking Code. Enable debug mode and observe one deliberately blocking callback; stop before platform-specific event-loop material.',
    competencyIds: ['PYAE-C029', 'PYAE-C028'],
    role: 'optional',
    learningRole: 'reference',
    purposes: ['debugging reference', 'blocking-code diagnostics'],
    assignmentPurpose:
      'Use asyncio debug signals when your runner appears frozen or a synchronous dependency blocks unrelated work.',
    whySelected:
      'It documents how Python exposes blocking callbacks and thread boundaries, but these troubleshooting details are not mandatory for the first successful runner.',
    formatRationale:
      'Best used as a targeted troubleshooting reference.',
    alternativeNotes:
      'Demoted so two dense standard-library pages are not both required before practice.',
    judgment: judgment(
      'Clear when opened for a named problem, not as a linear beginner lesson.',
      'Supports debugging and blocking-code diagnosis rather than core scheduler construction.',
      'Official behavior and diagnostic guidance.',
      'Current Python documentation inspected on 2026-09-09.',
      'Appropriate as optional troubleshooting depth.',
      'Contains one small debug-mode observation task.',
      'Free and standard-library only.',
    ),
    rationale:
      'Retain for reference value but remove from the mandatory path.',
  }),

  'PYAE-R-W19-03': makeResourcePlan({
    id: 'PYAE-R-W19-03',
    weekId: 'PYAE-W19',
    decision: 'replace',
    title: 'Asynchronous Python for the Complete Beginner',
    url: 'https://www.youtube.com/watch?v=iG6fr81xHKA',
    provider: 'Miguel Grinberg / PyCon 2017',
    format: 'video',
    estimatedMinutes: 45,
    location:
      'Watch 00:00-30:57. Diagram suspend/resume, cooperative multitasking, and the event loop, then rewrite the toy entry point with asyncio.run. Treat R-W19-01 as the source for current TaskGroup syntax.',
    competencyIds: ['PYAE-C029'],
    role: 'core',
    learningRole: 'learn',
    purposes: ['beginner mental model', 'format diversity'],
    assignmentPurpose:
      'Build an intuitive model of how asynchronous work overlaps waiting time before learning the modern APIs used by the runner.',
    whySelected:
      'The short PyCon talk was designed for complete beginners and explains concurrency through visual analogies; it is a much better first explanation than the synchronous sched module.',
    formatRationale:
      'Video supplies the missing visual/conversational route for an otherwise documentation-heavy week.',
    alternativeNotes:
      'The talk predates TaskGroup, so the assignment explicitly separates its timeless mental model from current API syntax.',
    candidateComparisons: [
      candidate(
        'sched — Event scheduler',
        'https://docs.python.org/3/library/sched.html',
        'rejected',
        'A synchronous event scheduler; it does not teach asyncio task ownership, cancellation, or a responsive event loop.',
      ),
      candidate(
        'Asynchronous Python for the Complete Beginner',
        'https://www.youtube.com/watch?v=iG6fr81xHKA',
        'selected',
        'Thirty-one-minute beginner talk with a clear event-loop and suspend/resume mental model.',
      ),
      candidate(
        'Async Programming in Python: From Generators to asyncio',
        'https://realpython.com/python-async-features/',
        'viable alternative',
        'Modern and thorough, but another long text route would not address the week’s format imbalance.',
      ),
    ],
    judgment: judgment(
      'Explicitly aimed at complete beginners and uses concrete waiting-time analogies.',
      'Establishes the event-loop model needed to reason about every Build step.',
      'The core model remains correct; modern APIs are deliberately sourced elsewhere.',
      'Older presentation, with its version boundary explicitly disclosed and repaired by current docs.',
      'Appropriate as conceptual introduction, not API authority.',
      'Learner produces a diagram and modernizes the entry point.',
      'Free public video; no login is required to watch.',
    ),
    rationale:
      'Replace a technically unrelated synchronous module with a genuine async introduction.',
  }),

  'PYAE-R-W20-01': makeResourcePlan({
    id: 'PYAE-R-W20-01',
    weekId: 'PYAE-W20',
    decision: 'retain',
    title: 'Guardrails',
    url: 'https://openai.github.io/openai-agents-python/guardrails/',
    provider: 'OpenAI',
    format: 'documentation',
    estimatedMinutes: 40,
    location:
      'Read Workflow boundaries, Input guardrails and execution modes, and Tool guardrails. Produce a table showing which checks happen before a side effect; stop before copying the full framework recipes.',
    competencyIds: ['PYAE-C030', 'PYAE-C023'],
    role: 'core',
    learningRole: 'reference',
    purposes: ['guardrail placement reference', 'side-effect timing'],
    assignmentPurpose:
      'Identify where input, output, and tool checks execute so risky actions are blocked before their side effects occur.',
    whySelected:
      'The page clearly distinguishes workflow boundaries and shows why blocking pre-tool checks matter; that timing lesson transfers directly to the custom dispatcher.',
    formatRationale:
      'A focused SDK reference is useful for comparing guardrail placement without adopting the SDK.',
    alternativeNotes:
      'Paired with vendor-neutral OWASP threat guidance so provider mechanics are not mistaken for the security model.',
    judgment: judgment(
      'Named sections make a complex SDK page manageable.',
      'Directly supports placement and timing of deterministic tool checks.',
      'Accurately distinguishes input, output, and per-tool boundaries.',
      'Current page inspected on 2026-09-09.',
      'Appropriate as a pattern reference after earlier tool dispatch work.',
      'Learner creates a pre/post-execution control table.',
      'Public reading and no API execution required.',
    ),
    rationale:
      'Retain for its distinct operational-boundary role.',
  }),

  'PYAE-R-W20-02': makeResourcePlan({
    id: 'PYAE-R-W20-02',
    weekId: 'PYAE-W20',
    decision: 'retain',
    title: 'Human-in-the-loop approvals',
    url: 'https://openai.github.io/openai-agents-python/human_in_the_loop/',
    provider: 'OpenAI',
    format: 'lab',
    estimatedMinutes: 50,
    location:
      'Read approval, rejection, state/resume, and serialized approval flow. Model a local PendingAction record and test approve/reject transitions without a model or network.',
    competencyIds: ['PYAE-C030', 'PYAE-C023'],
    role: 'core',
    learningRole: 'practice',
    purposes: ['approval workflow practice', 'state transition reference'],
    assignmentPurpose:
      'Practice representing a risky proposed action as data that can be approved or rejected before execution.',
    whySelected:
      'It provides a concrete interruption/resume lifecycle for approval rather than merely recommending human oversight in prose.',
    formatRationale:
      'The learner converts the documented workflow into an offline local state-machine exercise.',
    alternativeNotes:
      'Used for approval mechanics; OWASP remains the source for the threat model and layered defenses.',
    judgment: judgment(
      'The state transition is concrete and understandable after prior persistence work.',
      'Directly supports the confirmation gate and audit record.',
      'Accurately models approve/reject before tool execution.',
      'Current SDK documentation inspected on 2026-09-09.',
      'Appropriate implementation depth without requiring the framework.',
      'Includes an explicit offline modeling and test task.',
      'Public and no learner account/API required as assigned.',
    ),
    rationale:
      'Retain because it supplies the approval lifecycle missing from broad safety guides.',
  }),

  'PYAE-R-W20-03': makeResourcePlan({
    id: 'PYAE-R-W20-03',
    weekId: 'PYAE-W20',
    decision: 'replace',
    title: 'LLM Prompt Injection Prevention Cheat Sheet',
    url: 'https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html',
    provider: 'OWASP Cheat Sheet Series',
    format: 'lab',
    estimatedMinutes: 75,
    location:
      'Read Anatomy, Direct and Remote/Indirect Prompt Injection, Data Exfiltration, Agent-Specific Attacks, Primary Defenses, Least Privilege, Model-Based Guardrails, caveats, and Best Practices Checklist. Produce a threat/control/remaining-risk matrix.',
    competencyIds: ['PYAE-C030', 'PYAE-C023'],
    role: 'core',
    learningRole: 'learn',
    purposes: ['primary threat model', 'defense-in-depth design'],
    assignmentPurpose:
      'Learn how untrusted content reaches an agent and choose several independent controls instead of trusting one detector.',
    whySelected:
      'This actionable cheat sheet directly covers indirect injection, exfiltration, structured separation, output validation, HITL, least privilege, and the limitations of regex/model guardrails; the replaced page is now explicitly a historical archive.',
    formatRationale:
      'A security cheat sheet supports focused threat-to-control analysis and a concrete learner worksheet.',
    alternativeNotes:
      'The current broad Top 10 remains useful as a review index but is not as effective for implementing this week’s gateway.',
    candidateComparisons: [
      candidate(
        'OWASP Top 10 for Large Language Model Applications',
        'https://owasp.org/www-project-top-10-for-large-language-model-applications/',
        'rejected',
        'The destination now labels itself a legacy historical entry point and gives only brief archived risk summaries.',
      ),
      candidate(
        'LLM Prompt Injection Prevention Cheat Sheet',
        'https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html',
        'selected',
        'Direct attack examples, layered controls, agent-specific defenses, and explicit caveats.',
      ),
      candidate(
        'OWASP GenAI LLM Top 10 2026',
        'https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/',
        'not selected for this role',
        'Current risk overview but broader and less implementation-focused than the cheat sheet.',
      ),
    ],
    judgment: judgment(
      'Starts with attack anatomy and concrete examples before controls.',
      'Directly covers every threat term and defense principle assessed in Week 20.',
      'Explicitly says pattern/model guardrails are layers, not replacements for deterministic controls.',
      'Current OWASP Cheat Sheet destination inspected on 2026-09-09.',
      'Advanced attack variants are bounded by named assigned sections.',
      'Threat/control/remaining-risk matrix forces application rather than passive reading.',
      'Free public page with no login.',
    ),
    rationale:
      'Replace a legacy landing page and use its evidence to correct the Build’s overclaim about regex and XML.',
  }),

  'PYAE-R-W21-01': makeResourcePlan({
    id: 'PYAE-R-W21-01',
    weekId: 'PYAE-W21',
    decision: 'retain',
    title: 'MCP architecture',
    url: 'https://modelcontextprotocol.io/docs/learn/architecture',
    provider: 'Model Context Protocol',
    format: 'documentation',
    estimatedMinutes: 55,
    location:
      'Read Participants, Layers, Statelessness and discovery, Primitives, and the complete tool discovery/execution example. Stop before notification subscription details. Confirm the page resolves to protocol revision 2026-07-28.',
    competencyIds: ['PYAE-C031', 'PYAE-C019'],
    role: 'core',
    learningRole: 'learn',
    purposes: ['primary protocol model', 'current lifecycle'],
    assignmentPurpose:
      'Understand host, client, server, data layer, transport, discovery, and tool calls before using the SDK.',
    whySelected:
      'The current official architecture page explains the 2026 stateless protocol and full tools/list and tools/call exchange in one beginner-readable narrative.',
    formatRationale:
      'Architecture documentation is the correct source for protocol roles and layers before implementation.',
    alternativeNotes:
      'The stable URL is retained because it currently redirects to the latest dated revision; the checked revision is recorded explicitly.',
    judgment: judgment(
      'Explains roles and layers before raw messages and provides one coherent example.',
      'Directly supports host/client/server boundaries, discovery, primitives, and transports.',
      'Authoritative current protocol explanation; contradicts the R2 legacy handshake.',
      'Resolved to 2026-07-28 and inspected on 2026-09-09.',
      'Appropriate conceptual depth before the SDK lab.',
      'Learner annotates the complete discovery/call exchange.',
      'Free public documentation with no account.',
    ),
    rationale:
      'Retain the stable official entry point while binding the evidence to the inspected 2026-07-28 content.',
  }),

  'PYAE-R-W21-02': makeResourcePlan({
    id: 'PYAE-R-W21-02',
    weekId: 'PYAE-W21',
    decision: 'replace',
    title: 'MCP Tools specification — 2026-07-28',
    url: 'https://modelcontextprotocol.io/specification/2026-07-28/server/tools',
    provider: 'Model Context Protocol',
    format: 'documentation',
    estimatedMinutes: 35,
    location:
      'Read Overview, Listing tools, Calling tools, result/error behavior, and Security Considerations. Use it to verify names and schema mapping; do not hand-write a protocol stack.',
    competencyIds: ['PYAE-C031', 'PYAE-C019', 'PYAE-C023'],
    role: 'core',
    learningRole: 'reference',
    purposes: ['normative tool reference', 'security requirements'],
    assignmentPurpose:
      'Verify the exact current tools/list and tools/call contract and the host’s security obligations while adapting discovered tools.',
    whySelected:
      'The dated current specification is the authoritative source for tool discovery, invocation, results, and security; the R2 link points to an obsolete protocol revision.',
    formatRationale:
      'Normative documentation is appropriate as a narrow reference beside the architecture explanation and SDK lab.',
    alternativeNotes:
      'The architecture overview is clearer for learning but cannot replace the normative tool contract.',
    candidateComparisons: [
      candidate(
        'MCP Tools specification — 2025-06-18',
        'https://modelcontextprotocol.io/specification/2025-06-18/server/tools',
        'rejected',
        'Stale revision with lifecycle assumptions that no longer match 2026-07-28.',
      ),
      candidate(
        'MCP Tools specification — 2026-07-28',
        'https://modelcontextprotocol.io/specification/2026-07-28/server/tools',
        'selected',
        'Current normative tools contract.',
      ),
      candidate(
        'MCP architecture',
        'https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture',
        'retained separately',
        'Better teaching narrative but not the full normative tool specification.',
      ),
    ],
    judgment: judgment(
      'Dense but restricted to one primitive and named sections.',
      'Directly supports discovery, schema conversion, execution, error handling, and trust.',
      'Normative specification for the selected protocol revision.',
      '2026-07-28 revision inspected on 2026-09-09.',
      'Used as reference rather than first explanation.',
      'Learner verifies its implementation mapping against the exact methods.',
      'Free public specification.',
    ),
    rationale:
      'Replace the stale dated spec; protocol currency is a correctness requirement.',
  }),

  'PYAE-R-W21-03': makeResourcePlan({
    id: 'PYAE-R-W21-03',
    weekId: 'PYAE-W21',
    decision: 'replace',
    title: 'MCP Python SDK — Get started',
    url: 'https://py.sdk.modelcontextprotocol.io/get-started/',
    provider: 'Model Context Protocol',
    format: 'lab',
    estimatedMinutes: 75,
    location:
      'Run the complete local server/client example, replace its tool with calculate or system_info, list the tool, call it, and close the client context. Do not connect to an external service.',
    competencyIds: ['PYAE-C031', 'PYAE-C019', 'PYAE-C029'],
    role: 'core',
    learningRole: 'practice',
    purposes: ['guided SDK practice', 'lifecycle and invocation'],
    assignmentPurpose:
      'Create and call one local MCP tool through the maintained Python SDK before bridging it into your ToolRegistry.',
    whySelected:
      'This focused page provides a coherent, runnable server-and-client path; the replaced GitHub examples directory is a moving collection without one beginner route.',
    formatRationale:
      'A complete official SDK lab is safer and clearer than manually implementing framing and session details.',
    alternativeNotes:
      'The broader examples repository remains discoverable from the SDK docs but is not assigned.',
    candidateComparisons: [
      candidate(
        'MCP Python SDK examples directory',
        'https://github.com/modelcontextprotocol/python-sdk/tree/main/examples',
        'rejected',
        'Broad moving directory with multiple unrelated examples and no bounded beginner sequence.',
      ),
      candidate(
        'MCP Python SDK — Get started',
        'https://py.sdk.modelcontextprotocol.io/get-started/',
        'selected',
        'Focused current server/client walkthrough with runnable examples.',
      ),
      candidate(
        'MCP Python SDK — Client',
        'https://py.sdk.modelcontextprotocol.io/client/',
        'viable reference',
        'Useful client detail but does not provide the same complete first server/client exercise.',
      ),
    ],
    judgment: judgment(
      'One ordered example avoids repository browsing and raw protocol burden.',
      'Directly supports local server, client lifecycle, list, call, and teardown.',
      'Uses the maintained SDK boundary recommended by current architecture documentation.',
      'Current SDK documentation inspected on 2026-09-09.',
      'Appropriate implementation depth; manual wire protocol is deliberately out of scope.',
      'Learner runs, changes, lists, calls, and closes the example.',
      'Free and local; no external MCP service or account is required.',
    ),
    rationale:
      'Replace the unbounded examples directory and repair the Build around the maintained SDK.',
  }),

  'PYAE-R-W22-01': makeResourcePlan({
    id: 'PYAE-R-W22-01',
    weekId: 'PYAE-W22',
    decision: 'replace',
    title: 'Dependency INVERSION vs Dependency INJECTION in Python',
    url: 'https://www.youtube.com/watch?v=2ejbLVkCndI',
    provider: 'ArjanCodes',
    format: 'video',
    estimatedMinutes: 30,
    location:
      'Watch 00:20-17:35. Pause at 06:37 and 11:20 to diagram injection versus inversion, then reproduce the fake-based test shown in the video.',
    competencyIds: ['PYAE-C032', 'PYAE-C010', 'PYAE-C011'],
    role: 'core',
    learningRole: 'learn',
    purposes: ['architecture mental model', 'testability demonstration'],
    assignmentPurpose:
      'Learn why object creation is separated from object use and why high-level code depends on application-owned abstractions.',
    whySelected:
      'This concise Python video distinguishes dependency injection from dependency inversion with working tests; the replaced generic Agents page does not teach either prerequisite.',
    formatRationale:
      'Video and code demonstration provide a clearer first encounter with an abstract architecture topic.',
    alternativeNotes:
      'Paired with Cosmic Python for a larger composition-root application.',
    candidateComparisons: [
      candidate(
        'Agents',
        'https://openai.github.io/openai-agents-python/agents/',
        'rejected',
        'Describes one SDK Agent object but not dependency inversion, injection, or composition roots.',
      ),
      candidate(
        'Dependency INVERSION vs Dependency INJECTION in Python',
        'https://www.youtube.com/watch?v=2ejbLVkCndI',
        'selected',
        'Short, concrete Python explanation with tests and exact chapters.',
      ),
      candidate(
        'Dependency Injection and Bootstrapping',
        'https://www.cosmicpython.com/book/chapter_13_dependency_injection',
        'selected as additional practice',
        'Excellent applied depth but longer and assumes more architecture context.',
      ),
    ],
    judgment: judgment(
      'Defines both commonly confused terms with one small running example.',
      'Directly repairs the central hidden prerequisite in the Build.',
      'The distinction and testing consequences are technically sound.',
      'The principles remain current; video chapters were inspected on 2026-09-09.',
      'Short enough to introduce the topic before the applied article.',
      'Learner pauses to diagram and then reproduces the fake-based test.',
      'Free public video with no mandatory login.',
    ),
    rationale:
      'Replace provider-specific agent configuration with the missing software-architecture foundation.',
  }),

  'PYAE-R-W22-02': makeResourcePlan({
    id: 'PYAE-R-W22-02',
    weekId: 'PYAE-W22',
    decision: 'retain',
    title: 'Orchestrating multiple agents',
    url: 'https://openai.github.io/openai-agents-python/multi_agent/',
    provider: 'OpenAI',
    format: 'documentation',
    estimatedMinutes: 40,
    location:
      'Read Orchestrating via LLM and Orchestrating via code. Produce a two-row comparison of manager-as-tool and conversation handoff, then design the bounded manager-controlled route used by this Build.',
    competencyIds: ['PYAE-C032', 'PYAE-C021', 'PYAE-C022'],
    role: 'core',
    learningRole: 'reference',
    purposes: ['specialist orchestration reference', 'pattern comparison'],
    assignmentPurpose:
      'Choose an explicit orchestration pattern and understand who owns the conversation after specialist work begins.',
    whySelected:
      'It clearly distinguishes a manager retaining control from a handoff that transfers control, directly preventing the semantic conflation in the current Build and Q04.',
    formatRationale:
      'A focused pattern reference complements the general architecture resources.',
    alternativeNotes:
      'Retained because this week still needs one agent-specific orchestration source after architecture prerequisites are repaired.',
    judgment: judgment(
      'The two-pattern comparison is short and concrete.',
      'Directly supports specialist partitioning and delegation ownership.',
      'Accurately distinguishes manager-as-tool from handoff.',
      'Current page inspected on 2026-09-09.',
      'Appropriate after the agent loop and tool interfaces already exist.',
      'Learner must select and justify the Build’s pattern.',
      'Public and no API run is required.',
    ),
    rationale:
      'Retain for a distinct, correctly scoped agent-orchestration function.',
  }),

  'PYAE-R-W22-03': makeResourcePlan({
    id: 'PYAE-R-W22-03',
    weekId: 'PYAE-W22',
    decision: 'retain-demote',
    title: 'Agent Handoffs',
    url: 'https://openai.github.io/openai-agents-python/handoffs/',
    provider: 'OpenAI',
    format: 'documentation',
    estimatedMinutes: 30,
    location:
      'Read Handoffs, Input types, and Input filters. Write one case where the specialist should genuinely become the active agent; no SDK implementation is required.',
    competencyIds: ['PYAE-C032', 'PYAE-C021'],
    role: 'optional',
    learningRole: 'reference',
    purposes: ['true handoff reference', 'context filtering'],
    assignmentPurpose:
      'Compare a true ownership transfer with the manager-controlled delegation implemented in the required Build.',
    whySelected:
      'The page is useful for understanding true handoffs and input filtering, but the required Build returns a specialist result to the manager and therefore should not depend on this SDK mechanism.',
    formatRationale:
      'Optional documentation is appropriate for comparing an alternative orchestration pattern.',
    alternativeNotes:
      'Correct the existing whySelected attribution from Anthropic to OpenAI and remove it from Core.',
    judgment: judgment(
      'Clear after the manager pattern is understood.',
      'Supports handoff vocabulary and least-context filtering, not the core container architecture.',
      'Current OpenAI SDK behavior; existing provider rationale is factually wrong.',
      'Current page inspected on 2026-09-09.',
      'Appropriate optional depth.',
      'The learner writes a concrete decision case rather than implementing a second pattern.',
      'Free public documentation.',
    ),
    rationale:
      'Retain as optional contrast and repair the provider/whySelected mismatch.',
  }),

  'PYAE-R-W23-01': makeResourcePlan({
    id: 'PYAE-R-W23-01',
    weekId: 'PYAE-W23',
    decision: 'retain',
    title: 'Packaging Python Projects',
    url: 'https://packaging.python.org/en/latest/tutorials/packaging-projects/',
    provider: 'Python Packaging Authority',
    format: 'lab',
    estimatedMinutes: 70,
    location:
      'Complete package layout, pyproject.toml, and Generating distribution archives. Build the sdist and wheel and inspect their contents. Stop before uploading to an index.',
    competencyIds: ['PYAE-C033', 'PYAE-C005'],
    role: 'core',
    learningRole: 'learn',
    purposes: ['packaging foundation', 'distribution build practice'],
    assignmentPurpose:
      'Turn the source tree into standard distribution artifacts and verify what an installer will receive.',
    whySelected:
      'The PyPA tutorial is the most direct authoritative path from source layout and pyproject metadata to sdist/wheel artifacts, while separate focused resources cover scripts and installs it does not teach.',
    formatRationale:
      'A guided packaging tutorial gives both explanation and a concrete artifact.',
    alternativeNotes:
      'Retained but no longer misrepresented as teaching project.scripts or editable installs.',
    judgment: judgment(
      'Stepwise tutorial with a small example and clear file tree.',
      'Directly covers layout, build system, metadata, and artifact generation.',
      'Authoritative PyPA guidance; it does not contain project.scripts or editable-install instruction.',
      'Current page inspected on 2026-09-09.',
      'Upload/publication sections are excluded.',
      'Learner builds and inspects both artifacts.',
      'Free; local build may require installing declared open-source build tooling.',
    ),
    rationale:
      'Retain for the exact function it performs and add missing focused resources rather than stretching its metadata.',
  }),

  'PYAE-R-W23-02': makeResourcePlan({
    id: 'PYAE-R-W23-02',
    weekId: 'PYAE-W23',
    decision: 'retain',
    title: 'Building and testing Python with GitHub Actions',
    url: 'https://docs.github.com/en/actions/tutorials/build-and-test-code/python',
    provider: 'GitHub',
    format: 'lab',
    estimatedMinutes: 80,
    location:
      'Read Using multiple Python versions, Using a specific version, Installing dependencies, Testing with pytest, and linting with Ruff. Author the workflow, then run the same install/lint/type/test commands locally. Cloud execution is optional evidence.',
    competencyIds: ['PYAE-C033', 'PYAE-C010'],
    role: 'core',
    learningRole: 'practice',
    purposes: ['CI workflow practice', 'version matrix reference'],
    assignmentPurpose:
      'Make a clean environment reproduce the same checks you can already run locally across supported Python versions.',
    whySelected:
      'The official guide directly demonstrates setup-python, matrices, dependency installation, pytest, and Ruff while allowing the assessed result to remain an inspectable YAML file plus local command evidence.',
    formatRationale:
      'Runnable workflow examples make this a practice resource.',
    alternativeNotes:
      'A GitHub account is not part of the completion gate; local parity is required.',
    judgment: judgment(
      'Examples are copyable and the assigned sections follow a logical workflow.',
      'Directly supports the required CI stages and version matrix.',
      'Current GitHub Actions syntax and maintained action versions.',
      'Inspected on 2026-09-09.',
      'Publishing and unrelated deployment sections are excluded.',
      'Learner authors YAML and executes identical commands locally.',
      'Reading is public; account/cloud execution is optional.',
    ),
    rationale:
      'Retain and remove any mandatory account dependency from the learner activity.',
  }),

  'PYAE-R-W23-03': makeResourcePlan({
    id: 'PYAE-R-W23-03',
    weekId: 'PYAE-W23',
    decision: 'retain-demote',
    title: 'Python language-specific guide',
    url: 'https://docs.docker.com/guides/python/',
    provider: 'Docker',
    format: 'lab',
    estimatedMinutes: 35,
    location:
      'Optional only: if Docker is already installed, complete the initial create/build/run path for a minimal Python image. Stop before the FastAPI/Postgres development workflow.',
    competencyIds: ['PYAE-C033'],
    role: 'optional',
    learningRole: 'reference',
    purposes: ['optional container extension'],
    assignmentPurpose:
      'Explore container packaging only if your machine is already prepared; this is not needed for the CLI, quiz, Build, or unlock.',
    whySelected:
      'Containerization can extend deployment learning, but this large Docker Desktop/FastAPI/Postgres guide does not teach the required local CLI and would create an unnecessary availability barrier if Core.',
    formatRationale:
      'Kept as an optional lab for learners with the external tooling already available.',
    alternativeNotes:
      'Demoted from Core; no mandatory assessment or acceptance criterion depends on it.',
    judgment: judgment(
      'The full guide is broad; only the initial build/run route is suitable here.',
      'Adjacent to deployment, not necessary for packaging/configuration/CI competency.',
      'Official Docker guidance but unrelated to several current quiz claims, including health checks.',
      'Current destination inspected on 2026-09-09.',
      'Optional extension only.',
      'Hands-on when Docker already exists.',
      'Documentation is free, but Docker Desktop availability makes it unsuitable as required learning.',
    ),
    rationale:
      'Retain only as explicitly non-gating optional exploration.',
  }),

  'PYAE-R-W24-01': makeResourcePlan({
    id: 'PYAE-R-W24-01',
    weekId: 'PYAE-W24',
    decision: 'retain',
    title: 'Safety best practices',
    url: 'https://developers.openai.com/api/docs/guides/safety-best-practices',
    provider: 'OpenAI',
    format: 'documentation',
    estimatedMinutes: 40,
    location:
      'Convert adversarial testing, human oversight, constrained input/output, and safety-control recommendations into a checked capstone evidence table. Do not add a new subsystem.',
    competencyIds: ['PYAE-C030', 'PYAE-C027', 'PYAE-C033'],
    role: 'core',
    learningRole: 'reference',
    purposes: ['capstone safety review', 'evidence checklist'],
    assignmentPurpose:
      'Review whether the completed agent demonstrates the safety controls already learned and record evidence or a known limitation for each.',
    whySelected:
      'The guide gives a concise operational safety checklist suitable for final review when treated as confirmation of earlier learning rather than new Week 24 instruction.',
    formatRationale:
      'Reference documentation is converted into a verification checklist.',
    alternativeNotes:
      'Provider-specific examples do not replace the vendor-neutral OWASP review.',
    judgment: judgment(
      'Readable as a short checklist after Week 20.',
      'Supports final verification of testing, oversight, and bounded input/output.',
      'Accurate provider safety guidance, not claimed as a universal security standard.',
      'Current page inspected on 2026-09-09.',
      'Appropriate for review only.',
      'Learner maps each recommendation to concrete project evidence.',
      'Public reading; no API/account execution required.',
    ),
    rationale:
      'Retain as review evidence and ensure it introduces no new assessed dependency.',
  }),

  'PYAE-R-W24-02': makeResourcePlan({
    id: 'PYAE-R-W24-02',
    weekId: 'PYAE-W24',
    decision: 'retain-demote',
    title: 'Agents SDK quickstart',
    url: 'https://openai.github.io/openai-agents-python/quickstart/',
    provider: 'OpenAI',
    format: 'documentation',
    estimatedMinutes: 25,
    location:
      'Compare the quickstart’s minimal model/agent/tool loop with the custom project boundaries. Record three similarities and three deliberate differences; do not migrate frameworks or run a live model.',
    competencyIds: ['PYAE-C021', 'PYAE-C032'],
    role: 'optional',
    learningRole: 'reference',
    purposes: ['industry implementation comparison'],
    assignmentPurpose:
      'Compare your finished architecture with a minimal SDK design without changing the capstone scope.',
    whySelected:
      'It is useful as a compact external comparison, but it neither establishes production readiness nor belongs in the mandatory final verification path.',
    formatRationale:
      'Optional reference comparison prevents framework churn during integration.',
    alternativeNotes:
      'Demoted because the capstone must validate the learner’s existing provider-neutral implementation.',
    judgment: judgment(
      'Short and approachable after the learner has built an agent.',
      'Only indirectly supports architecture comparison.',
      'Accurately documents the current SDK quickstart.',
      'Current page inspected on 2026-09-09.',
      'Optional comparison, not capstone instruction.',
      'The activity is an architecture comparison rather than API execution.',
      'Public page; no live API use required as assigned.',
    ),
    rationale:
      'Retain as optional comparison and remove it from the production-readiness gate.',
  }),

  'PYAE-R-W24-03': makeResourcePlan({
    id: 'PYAE-R-W24-03',
    weekId: 'PYAE-W24',
    decision: 'replace',
    title: 'OWASP Top 10 for Agentic Applications 2026',
    url: 'https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/',
    provider: 'OWASP GenAI Security Project',
    format: 'documentation',
    estimatedMinutes: 45,
    location:
      'Review the ten risk summaries and map each relevant risk to an existing code control, test, and remaining limitation. Stop before deep appendices; do not add a new capstone subsystem.',
    competencyIds: ['PYAE-C030', 'PYAE-C027', 'PYAE-C033'],
    role: 'core',
    learningRole: 'reference',
    purposes: ['agentic security review', 'capstone evidence matrix'],
    assignmentPurpose:
      'Audit the assembled agent against current agent-specific risks using controls and tests built in earlier weeks.',
    whySelected:
      'The current agentic Top 10 is a better final review than the duplicated legacy LLM Top 10 landing page and directly matches a tool-using autonomous-agent capstone.',
    formatRationale:
      'A current risk report is appropriate as a final verification reference.',
    alternativeNotes:
      'Corrects the existing false Anthropic attribution and removes the duplicate Week 20 URL/function.',
    candidateComparisons: [
      candidate(
        'Legacy OWASP Top 10 for Large Language Model Applications',
        'https://owasp.org/www-project-top-10-for-large-language-model-applications/',
        'rejected',
        'Duplicated from Week 20, explicitly historical, and incorrectly attributed in current metadata.',
      ),
      candidate(
        'OWASP Top 10 for Agentic Applications 2026',
        'https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/',
        'selected',
        'Current and directly focused on autonomous agents with tools and workflows.',
      ),
      candidate(
        'OWASP Agent Control Standard',
        'https://genai.owasp.org/resource/agent-control-standard-acs/',
        'not selected',
        'Current but aimed at enterprise middleware/control portability and too advanced for this capstone review.',
      ),
    ],
    judgment: judgment(
      'The Top 10 summaries support a bounded checklist rather than a full security course.',
      'Directly reviews tool authority, identity, memory, and agent-control risks.',
      'Current peer-reviewed OWASP agentic security framework.',
      '2026 edition inspected on 2026-09-09.',
      'Appropriate as cumulative review, not new teaching.',
      'Learner must map risks to code, tests, and admitted limitations.',
      'Free public landing/download with no login.',
    ),
    rationale:
      'Replace the duplicated legacy page with the current agent-specific review and correct attribution.',
  }),
};

export const addedResourcePlans = [
  makeAddedResourcePlan({
    id: 'PYAE-R-W19-04',
    weekId: 'PYAE-W19',
    decision: 'add',
    title: 'asyncio Queues',
    url: 'https://docs.python.org/3/library/asyncio-queue.html',
    provider: 'Python Software Foundation',
    format: 'lab',
    estimatedMinutes: 45,
    location:
      'Read Queue and its join/task_done behavior. Build a bounded producer/consumer with two consumers, await join, send explicit shutdown sentinels, and verify clean completion.',
    competencyIds: ['PYAE-C029'],
    role: 'core',
    learningRole: 'practice',
    purposes: ['queue API practice', 'backpressure and shutdown'],
    assignmentPurpose:
      'Practice passing work safely between async producers and consumers and prove that all queued work finishes before shutdown.',
    whySelected:
      'The official queue page directly teaches the API assessed in Q08 and gives the learner a safe coordination primitive for background work.',
    formatRationale:
      'A small runnable producer/consumer exercise turns the API reference into practice.',
    alternativeNotes:
      'Added because neither existing asyncio page nor the removed sched page directly teaches asyncio.Queue.',
    candidateComparisons: [
      candidate(
        'asyncio Queues',
        'https://docs.python.org/3/library/asyncio-queue.html',
        'selected',
        'Authoritative API and exact queue lifecycle used by the practice.',
      ),
      candidate(
        'queue — synchronized queue class',
        'https://docs.python.org/3/library/queue.html',
        'rejected',
        'Thread-oriented blocking queues would teach the wrong concurrency boundary.',
      ),
    ],
    judgment: judgment(
      'Short API surface demonstrated through one familiar producer/consumer pattern.',
      'Directly supports Q08 and bounded async work coordination.',
      'Authoritative standard-library semantics.',
      'Current Python documentation inspected on 2026-09-09.',
      'Appropriate immediately after the event-loop mental model.',
      'Requires a complete runnable queue lifecycle.',
      'Free and standard-library only.',
    ),
    rationale:
      'Adds the missing directly taught Queue dependency without widening Build scope.',
  }),

  makeAddedResourcePlan({
    id: 'PYAE-R-W22-04',
    weekId: 'PYAE-W22',
    decision: 'add',
    title: 'Dependency Injection and Bootstrapping',
    url: 'https://www.cosmicpython.com/book/chapter_13_dependency_injection',
    provider: 'Cosmic Python',
    format: 'lab',
    estimatedMinutes: 75,
    location:
      'Read Implicit Versus Explicit Dependencies through Composition Root, A Bootstrap Script, and Initializing DI in Our Tests. Adapt the manual bootstrap pattern to AgentContainer using one fake override.',
    competencyIds: ['PYAE-C032', 'PYAE-C010', 'PYAE-C011'],
    role: 'core',
    learningRole: 'practice',
    purposes: ['composition-root practice', 'fake substitution'],
    assignmentPurpose:
      'Apply explicit dependency wiring to the actual agent components and prove the container can substitute a fake implementation.',
    whySelected:
      'This chapter shows manual Python dependency injection, explains the composition root, and demonstrates production/test bootstrapping in a realistic application.',
    formatRationale:
      'An applied chapter bridges the short concept video and the project refactor.',
    alternativeNotes:
      'Selected over a DI framework tutorial because the Build needs architectural understanding, not a new dependency.',
    candidateComparisons: [
      candidate(
        'Dependency Injection and Bootstrapping',
        'https://www.cosmicpython.com/book/chapter_13_dependency_injection',
        'selected',
        'Complete manual composition-root example with production and fake wiring.',
      ),
      candidate(
        'Dependency INVERSION vs Dependency INJECTION in Python',
        'https://www.youtube.com/watch?v=2ejbLVkCndI',
        'selected separately as introduction',
        'Clearer first explanation but not a full application bootstrap.',
      ),
    ],
    judgment: judgment(
      'Uses explicit before/after code and names why each extra boundary exists.',
      'Directly covers AgentContainer, overrides, fakes, and composition-root ownership.',
      'Sound manual-DI approach without service-locator misuse.',
      'Stable open book chapter inspected on 2026-09-09.',
      'Assigned sections avoid unrelated event-driven architecture depth.',
      'Learner adapts the pattern to existing components and one fake.',
      'Free public chapter and code.',
    ),
    rationale:
      'Adds the central Build prerequisite absent from all three R2 Week 22 resources.',
  }),

  makeAddedResourcePlan({
    id: 'PYAE-R-W23-04',
    weekId: 'PYAE-W23',
    decision: 'add',
    title: 'Creating and packaging command-line tools',
    url: 'https://packaging.python.org/en/latest/guides/creating-command-line-tools/',
    provider: 'Python Packaging Authority',
    format: 'lab',
    estimatedMinutes: 45,
    location:
      'Follow the src-layout and pyproject.toml sections, add a project.scripts entry for pyae, install it, and run pyae --help. Stop before publishing or pipx distribution.',
    competencyIds: ['PYAE-C033', 'PYAE-C005'],
    role: 'core',
    learningRole: 'practice',
    purposes: ['console-script practice', 'installable CLI'],
    assignmentPurpose:
      'Expose the project as a real installed command rather than relying on the repository working directory.',
    whySelected:
      'This current PyPA guide directly teaches project.scripts and src-layout CLI packaging, which the existing Packaging Python Projects tutorial does not contain.',
    formatRationale:
      'A focused guided CLI package is the shortest route to the required artifact.',
    alternativeNotes:
      'Added instead of pretending R-W23-01 covers console scripts.',
    candidateComparisons: [
      candidate(
        'Creating and packaging command-line tools',
        'https://packaging.python.org/en/latest/guides/creating-command-line-tools/',
        'selected',
        'Current PyPA guide with explicit project.scripts example.',
      ),
      candidate(
        'Entry points specification',
        'https://packaging.python.org/en/latest/specifications/entry-points/',
        'not selected as lesson',
        'Normative but less suitable for a beginner’s first executable package.',
      ),
    ],
    judgment: judgment(
      'Uses a small command and visible file tree.',
      'Directly supports S02 and Q03.',
      'Current PyPA-recommended project.scripts syntax.',
      'Page updated in 2026 and inspected on 2026-09-09.',
      'Stops before distribution/publication concerns.',
      'Learner installs and executes the command.',
      'Free public guide; no package-index account required.',
    ),
    rationale:
      'Adds directly taught console-script knowledge and a runnable outcome.',
  }),

  makeAddedResourcePlan({
    id: 'PYAE-R-W23-05',
    weekId: 'PYAE-W23',
    decision: 'add',
    title: 'Local project installs',
    url: 'https://pip.pypa.io/en/stable/topics/local-project-installs/',
    provider: 'Python Packaging Authority / pip',
    format: 'lab',
    estimatedMinutes: 20,
    location:
      'Read Regular installs and Editable installs. In disposable virtual environments, perform one editable install and one regular install, then record why CI and release checks use the regular path.',
    competencyIds: ['PYAE-C033', 'PYAE-C005'],
    role: 'core',
    learningRole: 'reference',
    purposes: ['install-mode reference', 'release-fidelity check'],
    assignmentPurpose:
      'Understand why editable installs are convenient for development but do not prove that a user-style package install works.',
    whySelected:
      'The official pip page directly contrasts regular and editable local installs and explicitly recommends regular installs for CI/deployment fidelity.',
    formatRationale:
      'Short authoritative reference plus two terminal commands is sufficient.',
    alternativeNotes:
      'Added because R-W23-01 contains no editable-install discussion.',
    candidateComparisons: [
      candidate(
        'Local project installs',
        'https://pip.pypa.io/en/stable/topics/local-project-installs/',
        'selected',
        'Exact official comparison of regular and editable behavior.',
      ),
      candidate(
        'pip install CLI reference',
        'https://pip.pypa.io/en/stable/cli/pip_install/',
        'not selected',
        'Comprehensive command reference but unnecessarily broad for this distinction.',
      ),
    ],
    judgment: judgment(
      'Two short sections state the tradeoff directly.',
      'Directly supports S03 and Q02.',
      'Authoritative pip behavior and deployment recommendation.',
      'Current stable pip documentation inspected on 2026-09-09.',
      'Exactly appropriate depth for a first packaged project.',
      'Learner runs both modes in isolated environments.',
      'Free; uses existing Python/pip.',
    ),
    rationale:
      'Adds an otherwise untaught factual dependency and strengthens release verification.',
  }),

  makeAddedResourcePlan({
    id: 'PYAE-R-W23-06',
    weekId: 'PYAE-W23',
    decision: 'add',
    title: 'The Twelve-Factor App — Config',
    url: 'https://www.12factor.net/config',
    provider: 'The Twelve-Factor App',
    format: 'article',
    estimatedMinutes: 20,
    location:
      'Read the complete short Config page. Classify the project’s settings as deploy-varying configuration or internal constants, and mark required secrets as required rather than giving them fake defaults.',
    competencyIds: ['PYAE-C033', 'PYAE-C023'],
    role: 'core',
    learningRole: 'learn',
    purposes: ['configuration principle', 'secret boundary'],
    assignmentPurpose:
      'Decide which values belong in environment configuration and which missing values should stop startup clearly.',
    whySelected:
      'This concise original source explains environment-based deploy configuration without forcing an unrelated settings library into the curriculum.',
    formatRationale:
      'The page is short enough to read fully and apply immediately.',
    alternativeNotes:
      'Selected over a pydantic-settings tutorial because the competency is configuration behavior, not library recall.',
    candidateComparisons: [
      candidate(
        'The Twelve-Factor App — Config',
        'https://www.12factor.net/config',
        'selected',
        'Concise principle and direct deploy-varying configuration test.',
      ),
      candidate(
        'Pydantic Settings',
        'https://docs.pydantic.dev/latest/concepts/pydantic_settings/',
        'not selected as Core',
        'Powerful implementation reference but large, library-specific, and unnecessary for the required behavior.',
      ),
    ],
    judgment: judgment(
      'Very short and states a memorable deploy-varying test.',
      'Directly supports S04 and the repaired configuration question.',
      'Sound environment-configuration principle with secret handling repaired in the Build.',
      'Stable source inspected on 2026-09-09.',
      'Appropriate principle-level depth.',
      'Learner classifies actual project settings and identifies required values.',
      'Free public page.',
    ),
    rationale:
      'Adds the source needed for configuration behavior while removing library trivia.',
  }),
];

const optionIds = ['a', 'b', 'c', 'd'];

const questionPatch = (prompt, correctOptionId, explanation, labels) => ({
  prompt,
  options: labels.map((label, index) => ({ id: optionIds[index], label })),
  correctOptionId,
  explanation,
});

const classSupport = ({ A = [], B = [], C = [], D = [], resources = [], prior = [] }) => ({
  A: {
    questionIds: A,
    resourceIds: resources,
    basis: 'Directly taught or practiced by this week\'s assigned Core material and Build.',
  },
  B: {
    questionIds: B,
    competencyIds: prior,
    basis: 'Intentional retrieval of prerequisite competencies taught before this week.',
  },
  C: {
    questionIds: C,
    resourceIds: resources,
    basis: 'Terminology is explicitly defined in the revised prompt and supported by assigned evidence.',
  },
  D: {
    questionIds: D,
    basis: 'No unsupported items remain after repair.',
  },
});

export const questionWeekPlans = {
  'PYAE-W17': {
    finalClassifications: 'AAAAACAAAB',
    supportByClass: classSupport({
      A: ['PYAE-Q-W17-01', 'PYAE-Q-W17-02', 'PYAE-Q-W17-03', 'PYAE-Q-W17-04', 'PYAE-Q-W17-05', 'PYAE-Q-W17-07', 'PYAE-Q-W17-08', 'PYAE-Q-W17-09'],
      B: ['PYAE-Q-W17-10'],
      C: ['PYAE-Q-W17-06'],
      resources: ['PYAE-R-W17-01', 'PYAE-R-W17-02', 'PYAE-R-W17-03'],
      prior: ['PYAE-C007', 'PYAE-C010', 'PYAE-C011', 'PYAE-C019', 'PYAE-C021', 'PYAE-C023'],
    }),
    evidenceBasis: [
      'Anthropic\'s evaluation guide directly teaches task-specific evals, reference answers, graders, and test cases.',
      'The Build makes learners curate cases, grade trajectories and answers, emit versioned reports, and enforce a threshold offline.',
      'Question 6 defines tool recall before testing it; Question 10 deliberately retrieves prior reproducibility and version-control practice.',
    ],
    patches: {
      'PYAE-Q-W17-01': questionPatch(
        'A team wants a stable benchmark that can reveal whether a new agent version regressed. Which dataset best serves as its golden evaluation dataset?',
        'b',
        'A golden dataset is a curated, reviewed, and versioned set of representative cases with expected behavior; stability makes comparisons meaningful.',
        ['Production traces with no reviewed expected results', 'A curated and versioned set of representative inputs with expected outcomes', 'Fresh randomly generated cases that change on every run', 'Cases rewritten after seeing each candidate model\'s output'],
      ),
      'PYAE-Q-W17-02': questionPatch(
        'What does trajectory evaluation inspect in an agent run?',
        'c',
        'Trajectory evaluation examines the observable path: messages, selected tools, arguments, results, and relevant state transitions.',
        ['Only the final answer wording', 'Only service uptime and latency', 'The observable sequence of messages, tool calls, results, and state transitions', 'Only unit-test coverage of the agent code'],
      ),
      'PYAE-Q-W17-03': questionPatch(
        'Why should CI evaluation runs use scripted model responses and controlled fixtures?',
        'a',
        'Controlled fixtures remove avoidable variation so a failure is attributable to a code or contract change rather than a live model response.',
        ['They make results reproducible and attributable to code changes', 'A temperature and seed guarantee identical behavior from every hosted model', 'CI should retry live calls until the benchmark passes', 'They make final-answer snapshots sufficient for every evaluation'],
      ),
      'PYAE-Q-W17-04': questionPatch(
        'Which result is an evaluation regression?',
        'b',
        'A regression is a previously passing behavior that fails after a change under the same benchmark conditions.',
        ['A newly added case that has never run before', 'A previously passing case that fails after a change under unchanged conditions', 'A planned increase in dataset difficulty with a new baseline', 'An unchanged pass result after refactoring'],
      ),
      'PYAE-Q-W17-05': questionPatch(
        'What tradeoff does an LLM-as-a-judge introduce compared with a deterministic assertion?',
        'c',
        'Model judging can handle nuance, but may be biased or nondeterministic and adds latency and cost.',
        ['It cannot evaluate natural-language answers', 'It always agrees with human reviewers', 'It may be biased or variable and adds latency and cost', 'It requires exact string equality'],
      ),
      'PYAE-Q-W17-06': questionPatch(
        'For a case whose reference trajectory lists every tool necessary to complete the task, what does tool recall measure?',
        'a',
        'Tool recall is the fraction of necessary reference tools the agent actually invoked; unnecessary calls are a separate precision or efficiency concern.',
        ['The fraction of necessary reference tools that the agent invoked', 'The fraction of invoked tools that were necessary', 'The average latency of all invoked tools', 'Whether every argument matched its JSON schema'],
      ),
      'PYAE-Q-W17-07': questionPatch(
        'Why track token use for each benchmark case?',
        'd',
        'Per-case usage reveals cost or context-growth regressions even when task correctness is unchanged.',
        ['To prove that a longer answer is more accurate', 'To replace correctness grading with a cheaper metric', 'To infer the model provider without recording it', 'To detect cost and context-growth regressions alongside quality'],
      ),
      'PYAE-Q-W17-08': questionPatch(
        'In an evaluation that samples k independent attempts for one problem, what does pass@k estimate?',
        'a',
        'Pass@k estimates the chance that at least one of k attempts succeeds.',
        ['The probability that at least one of k attempts succeeds', 'The probability that all k attempts succeed', 'The mean score of exactly k graders', 'The number of documents returned by top-k retrieval'],
      ),
      'PYAE-Q-W17-09': questionPatch(
        'Why include adversarial or intentionally unsolvable cases in an agent benchmark?',
        'c',
        'Negative cases verify that the agent refuses, asks for missing information, or fails safely instead of fabricating success.',
        ['To make the reported pass rate look lower', 'To eliminate the need for ordinary success cases', 'To test safe refusal, clarification, and error behavior', 'To ensure the agent attempts every tool at least once'],
      ),
      'PYAE-Q-W17-10': questionPatch(
        'How should repeated evaluation results be stored so a team can compare behavior over time?',
        'd',
        'Versioned structured reports preserve case-level outcomes and run metadata; a commit identifier is useful when available but is not universally required.',
        ['Overwrite one result file after every run', 'Store only a free-text summary of the latest failures', 'Keep one unversioned aggregate percentage', 'Keep versioned structured reports with case outcomes and run metadata'],
      ),
    },
  },

  'PYAE-W18': {
    finalClassifications: 'AAACBBABAC',
    supportByClass: classSupport({
      A: ['PYAE-Q-W18-01', 'PYAE-Q-W18-02', 'PYAE-Q-W18-03', 'PYAE-Q-W18-07', 'PYAE-Q-W18-09'],
      B: ['PYAE-Q-W18-05', 'PYAE-Q-W18-06', 'PYAE-Q-W18-08'],
      C: ['PYAE-Q-W18-04', 'PYAE-Q-W18-10'],
      resources: ['PYAE-R-W18-01', 'PYAE-R-W18-02', 'PYAE-R-W18-03'],
      prior: ['PYAE-C007', 'PYAE-C008', 'PYAE-C009', 'PYAE-C013', 'PYAE-C021', 'PYAE-C024', 'PYAE-C027'],
    }),
    evidenceBasis: [
      'OpenTelemetry traces and instrumentation material supplies current span, parent, event, timing, and context semantics.',
      'The revised Build requires structured redaction, capped replay-safe recovery, an atomic checkpoint, and fake-clock tests.',
      'JSONL and time-to-first-token are explicitly defined in the two C prompts before reasoning is tested.',
    ],
    patches: {
      'PYAE-Q-W18-01': questionPatch(
        'What distinction between logging and distributed tracing is most useful when diagnosing an agent workflow?',
        'a',
        'Logs are timestamped event records; a trace relates timed spans across one request or workflow through shared context.',
        ['Logs record events, while a trace connects timed spans across one request or workflow', 'Logs are always unstructured, while traces are always JSON', 'Tracing replaces every application log', 'Logging works locally, while tracing only works in cloud systems'],
      ),
      'PYAE-Q-W18-02': questionPatch(
        'In OpenTelemetry, what represents one timed unit of work inside a trace?',
        'c',
        'A span is a named operation with start/end timing, attributes, status, and links to trace context.',
        ['A metric counter', 'A log exporter', 'A span', 'A baggage entry'],
      ),
      'PYAE-Q-W18-03': questionPatch(
        'Why should redaction occur inside the logging or tracing pipeline rather than only in a viewer?',
        'b',
        'Redacting before serialization and export prevents raw credentials from reaching files, exporters, or downstream systems.',
        ['It makes trace IDs shorter', 'It prevents raw secrets from being persisted or exported', 'It guarantees every arbitrary object can be serialized', 'It removes the need for access control on observability data'],
      ),
      'PYAE-Q-W18-04': questionPatch(
        'JSON Lines stores one complete JSON value per line. Why is that useful for an append-only trace file?',
        'a',
        'Each record can be appended and streamed independently, and earlier complete lines remain parseable after an interrupted final write.',
        ['Records can be appended and processed independently', 'The format automatically encrypts every trace', 'It guarantees the file can never be corrupted', 'It compresses more than every binary format'],
      ),
      'PYAE-Q-W18-05': questionPatch(
        'An idempotent LLM request receives HTTP 429 and includes retry guidance. What is the safest recovery policy?',
        'd',
        'Honor server guidance when present, otherwise use capped exponential backoff with jitter and a retry limit; only replay an operation known to be safe.',
        ['Retry immediately in a tight loop', 'Treat every 429 as permanently fatal', 'Double the timeout but resend forever', 'Retry only when replay-safe, using server guidance or capped backoff with jitter and a limit'],
      ),
      'PYAE-Q-W18-06': questionPatch(
        'Why is silently swallowing a tool failure unsafe in an agent loop?',
        'a',
        'The model can continue from a false belief that the action succeeded; a structured failure observation enables a safe next decision.',
        ['The model may proceed as though the failed action succeeded', 'Every caught exception automatically corrupts the trace', 'Tool errors must always terminate the whole process', 'It prevents Python from collecting memory'],
      ),
      'PYAE-Q-W18-07': questionPatch(
        'In this curriculum\'s Span record, which field links a child span to its parent span?',
        'd',
        'The project schema names that link parent_id; OpenTelemetry APIs commonly expose the relationship through parent span context.',
        ['trace_id', 'span_id', 'step_index', 'parent_id'],
      ),
      'PYAE-Q-W18-08': questionPatch(
        'What does fail-safe state preservation mean when an unrecoverable agent error occurs?',
        'c',
        'Validate a recoverable checkpoint, write it atomically, report the failure, and halt without claiming unfinished work completed.',
        ['Serialize every in-memory object after ignoring validation errors', 'Continue executing and save only after the next success', 'Atomically save a validated recoverable checkpoint, report the failure, and halt', 'Write credentials into the checkpoint so recovery requires no configuration'],
      ),
      'PYAE-Q-W18-09': questionPatch(
        'Which timestamp policy avoids ambiguity when structured logs are compared across regions?',
        'b',
        'Use timezone-aware UTC timestamps in a standard form such as RFC 3339/ISO 8601 with Z or an explicit offset.',
        ['Local wall time with no offset', 'Timezone-aware UTC in a standard timestamp format', 'A translated timezone name chosen by each service', 'A date without time or offset'],
      ),
      'PYAE-Q-W18-10': questionPatch(
        'Time to first token is the duration from sending a model request until what event?',
        'd',
        'TTFT ends when the client receives the first output token or content chunk, not when the full response finishes.',
        ['DNS lookup completes', 'The request body finishes serializing', 'The complete model response is received', 'The first output token or content chunk is received'],
      ),
    },
  },

  'PYAE-W19': {
    finalClassifications: 'AAAAAAAAAC',
    supportByClass: classSupport({
      A: ['PYAE-Q-W19-01', 'PYAE-Q-W19-02', 'PYAE-Q-W19-03', 'PYAE-Q-W19-04', 'PYAE-Q-W19-05', 'PYAE-Q-W19-06', 'PYAE-Q-W19-07', 'PYAE-Q-W19-08', 'PYAE-Q-W19-09'],
      C: ['PYAE-Q-W19-10'],
      resources: ['PYAE-R-W19-01', 'PYAE-R-W19-02', 'PYAE-R-W19-03', 'PYAE-R-W19-04'],
      prior: ['PYAE-C008', 'PYAE-C013', 'PYAE-C019', 'PYAE-C021', 'PYAE-C024', 'PYAE-C028'],
    }),
    evidenceBasis: [
      'The Python asyncio task, queue, timeout, and development references directly support Questions 1-9.',
      'A focused PyCon concurrency talk supplies an alternate explanation before implementation.',
      'Question 10 defines the independent-call condition and requires honoring provider and local resource limits.',
    ],
    patches: {
      'PYAE-Q-W19-01': questionPatch(
        'What happens when a coroutine directly calls blocking code such as time.sleep() or requests.get()?',
        'a',
        'The blocking call occupies the event-loop thread, delaying every other coroutine scheduled there.',
        ['It blocks the event-loop thread and delays other coroutines', 'asyncio automatically moves it to a worker thread', 'Only the calling coroutine pauses while the loop stays free', 'Python converts it into a nonblocking system call'],
      ),
      'PYAE-Q-W19-02': questionPatch(
        'In Python 3.11+, which construct runs related child tasks with structured lifetime and failure handling?',
        'b',
        'asyncio.TaskGroup waits for its children and cancels remaining siblings when one fails with a non-cancellation exception.',
        ['asyncio.Queue', 'asyncio.TaskGroup', 'asyncio.Event', 'concurrent.futures.ProcessPoolExecutor'],
      ),
      'PYAE-Q-W19-03': questionPatch(
        'Which exception is normally injected into an asyncio task after task.cancel()?',
        'c',
        'Cancellation is delivered as asyncio.CancelledError at the next opportunity; cleanup should normally re-raise it.',
        ['TimeoutError', 'StopAsyncIteration', 'asyncio.CancelledError', 'SystemExit'],
      ),
      'PYAE-Q-W19-04': questionPatch(
        'A legacy function performs blocking file I/O and has no async API. How can a coroutine call it without blocking the event loop?',
        'd',
        'asyncio.to_thread runs an I/O-bound blocking function in another thread. It is not a general solution for CPU-bound Python work.',
        ['Call it directly after await asyncio.sleep(0)', 'Wrap it in asyncio.shield()', 'Create a second event loop in the same thread', 'Use await asyncio.to_thread(...) for the blocking I/O function'],
      ),
      'PYAE-Q-W19-05': questionPatch(
        'You need results from three independent coroutines and want them to overlap. Which approach is appropriate when ordinary result aggregation is sufficient?',
        'a',
        'await asyncio.gather(c1(), c2(), c3()) schedules the awaitables concurrently and returns ordered results; TaskGroup is preferable when structured sibling-failure semantics are required.',
        ['await asyncio.gather(c1(), c2(), c3())', 'await c1(); await c2(); await c3()', 'Call each coroutine without awaiting it', 'Run asyncio.run() separately for each coroutine inside the event loop'],
      ),
      'PYAE-Q-W19-06': questionPatch(
        'What happens when work inside `async with asyncio.timeout(5):` exceeds the deadline?',
        'c',
        'The context cancels the current task internally and transforms that cancellation into TimeoutError when the context manager exits.',
        ['The work continues silently in the background', 'The process exits immediately', 'The context cancels the work and raises TimeoutError outside the context', 'The timeout returns None instead of raising'],
      ),
      'PYAE-Q-W19-07': questionPatch(
        'How should a coroutine handle asyncio.CancelledError if it needs cleanup?',
        'b',
        'Use finally or briefly catch the exception to clean up, then re-raise so TaskGroup, timeout, and shutdown coordination remain correct.',
        ['Convert it to a successful return after cleanup', 'Clean up and normally re-raise the cancellation', 'Retry the cancelled operation forever', 'Catch BaseException and suppress it'],
      ),
      'PYAE-Q-W19-08': questionPatch(
        'Which asyncio primitive safely coordinates work items between asynchronous producers and consumers?',
        'a',
        'asyncio.Queue supplies awaitable put/get operations and task accounting for producer-consumer workflows.',
        ['asyncio.Queue', 'A module-level list polled in a tight loop', 'threading.local', 'A synchronous generator shared without coordination'],
      ),
      'PYAE-Q-W19-09': questionPatch(
        'Which function is the normal top-level entry point for running one asyncio coroutine from synchronous Python code?',
        'd',
        'asyncio.run creates and closes an event loop around the top-level coroutine; it cannot be nested inside an already running loop.',
        ['asyncio.wait_for', 'asyncio.create_task', 'asyncio.current_task', 'asyncio.run'],
      ),
      'PYAE-Q-W19-10': questionPatch(
        'When several tool calls are independent, why might an agent execute them concurrently, subject to provider limits and local resource bounds?',
        'b',
        'Overlap can reduce total wall-clock latency, but concurrency must not violate dependencies, rate limits, ordering, or resource safety.',
        ['It guarantees lower token use', 'It can reduce wall-clock latency by overlapping independent waits', 'It makes dependent writes safe to reorder', 'It bypasses provider rate limits'],
      ),
    },
  },

  'PYAE-W20': {
    finalClassifications: 'AAAABAABAA',
    supportByClass: classSupport({
      A: ['PYAE-Q-W20-01', 'PYAE-Q-W20-02', 'PYAE-Q-W20-03', 'PYAE-Q-W20-04', 'PYAE-Q-W20-06', 'PYAE-Q-W20-07', 'PYAE-Q-W20-08', 'PYAE-Q-W20-09', 'PYAE-Q-W20-10'],
      B: ['PYAE-Q-W20-05'],
      resources: ['PYAE-R-W20-01', 'PYAE-R-W20-02', 'PYAE-R-W20-03'],
      prior: ['PYAE-C007', 'PYAE-C014', 'PYAE-C019', 'PYAE-C022', 'PYAE-C023', 'PYAE-C028', 'PYAE-C029'],
    }),
    evidenceBasis: [
      'The OWASP prompt-injection guidance and OpenAI guardrail/HITL material support layered defenses and authorization boundaries.',
      'The Build exercises deny-before-execute permissions, structural redaction, adversarial fixtures, and explicit limitations.',
      'Secret handling intentionally retrieves the earlier configuration and observability boundary rather than introducing a new fact.',
    ],
    patches: {
      'PYAE-Q-W20-01': questionPatch(
        'Which scenario is an indirect prompt-injection attack?',
        'a',
        'Indirect injection places malicious instructions in external content the agent later retrieves or observes.',
        ['A retrieved web page tells the agent to ignore policy and exfiltrate data', 'A user mistypes a normal command', 'A tool returns a documented validation error', 'A developer changes the system prompt in source control'],
      ),
      'PYAE-Q-W20-02': questionPatch(
        'Why must authorization not rely only on a system-prompt instruction such as "never delete without asking"?',
        'd',
        'Model instructions are probabilistic and exposed to conflicting input; deterministic policy must deny unauthorized execution outside the model.',
        ['System prompts cannot contain security guidance', 'A longer prompt makes tools execute more slowly', 'Only operating-system administrators can write prompts', 'Model compliance is not a deterministic authorization boundary'],
      ),
      'PYAE-Q-W20-03': questionPatch(
        'What does wrapping retrieved text in explicit untrusted-data delimiters accomplish?',
        'c',
        'Delimiters help the model distinguish data from instructions, but they are only one defense layer and do not authorize tool use or guarantee safety.',
        ['It sanitizes every malicious meaning from the text', 'It grants the enclosed text permission to call read-only tools', 'It signals that the content is data, while external policy still enforces permissions', 'It guarantees the model cannot follow an injected instruction'],
      ),
      'PYAE-Q-W20-04': questionPatch(
        'What is insecure output handling in an agent system?',
        'a',
        'It is trusting or passing model output into a downstream interpreter, tool, or client without appropriate validation, encoding, or authorization.',
        ['Using model output downstream without appropriate validation or encoding', 'Returning a refusal to a prohibited request', 'Recording a redacted audit event', 'Validating tool arguments against a schema'],
      ),
      'PYAE-Q-W20-05': questionPatch(
        'How should API keys and similar secrets cross prompt, tool, and observability boundaries?',
        'b',
        'Load them only where needed, avoid sending them to the model, and structurally redact them before logs or traces are serialized.',
        ['Embed them in the system prompt so every tool can reuse them', 'Keep them out of prompts and redact them before persistence or export', 'Return them in tool errors to simplify debugging', 'Use secret-looking fallback values when configuration is missing'],
      ),
      'PYAE-Q-W20-06': questionPatch(
        'A guest requests an ADMIN_ONLY tool. What must the dispatcher do?',
        'd',
        'The dispatcher must deny before execution and emit a safe audit event; the model cannot override the decision.',
        ['Run it and redact the result afterward', 'Ask the model whether the guest seems trustworthy', 'Execute a preview with the same side effects', 'Deny before execution and record the decision safely'],
      ),
      'PYAE-Q-W20-07': questionPatch(
        'What is the goal of a data-exfiltration prompt injection?',
        'a',
        'It attempts to make the agent reveal or transmit secrets or protected information to an unauthorized destination.',
        ['Cause protected data to be revealed or sent to an unauthorized destination', 'Increase model response latency', 'Make a public tool return fewer fields', 'Force the application to use JSON instead of text'],
      ),
      'PYAE-Q-W20-08': questionPatch(
        'Why should writes to operating-system configuration require a strong confirmation and policy boundary?',
        'c',
        'Such writes can alter security, networking, or machine behavior and are difficult to contain or reverse safely.',
        ['Configuration files are always encrypted', 'LLMs cannot produce valid file paths', 'A mistaken or injected action can materially alter the host system', 'Read access automatically grants safe write access'],
      ),
      'PYAE-Q-W20-09': questionPatch(
        'What does a dual-model pattern try to achieve when processing untrusted content?',
        'b',
        'It isolates untrusted-content interpretation from a more privileged decision context, reducing shared attack surface; deterministic permissions are still required.',
        ['Have two models vote so authorization is guaranteed', 'Separate untrusted-content processing from a privileged decision context as one defense layer', 'Store the same secret in two prompts', 'Replace all deterministic validation with a second model'],
      ),
      'PYAE-Q-W20-10': questionPatch(
        'Why is a single regex for one familiar API-key prefix insufficient as a secret-redaction strategy?',
        'c',
        'Secrets have many formats and can appear in structured or nested values; layered key-name and value detection plus tests is safer than one prefix regex.',
        ['Regex cannot match any credential characters', 'All providers use the same key prefix', 'Secret formats vary, so structural and multiple tested detectors are needed', 'Redaction should occur only in the user interface'],
      ),
    },
  },

  'PYAE-W21': {
    finalClassifications: 'AAAAAAAAAC',
    supportByClass: classSupport({
      A: ['PYAE-Q-W21-01', 'PYAE-Q-W21-02', 'PYAE-Q-W21-03', 'PYAE-Q-W21-04', 'PYAE-Q-W21-05', 'PYAE-Q-W21-06', 'PYAE-Q-W21-07', 'PYAE-Q-W21-08', 'PYAE-Q-W21-09'],
      C: ['PYAE-Q-W21-10'],
      resources: ['PYAE-R-W21-01', 'PYAE-R-W21-02', 'PYAE-R-W21-03'],
      prior: ['PYAE-C014', 'PYAE-C019', 'PYAE-C022', 'PYAE-C023', 'PYAE-C029', 'PYAE-C030'],
    }),
    evidenceBasis: [
      'Current MCP architecture, 2026-07-28 tools specification, and Python SDK quickstart replace stale protocol assumptions.',
      'The Build uses the maintained Python SDK/FastMCP path while preserving observable lifecycle and policy checks.',
      'Question 10 defines graceful shutdown as an application obligation without claiming hard-crash cleanup can be guaranteed.',
    ],
    patches: {
      'PYAE-Q-W21-01': questionPatch(
        'Which message format underlies MCP request, response, and notification exchanges?',
        'a',
        'MCP messages use JSON-RPC 2.0 semantics, carried over a supported transport.',
        ['JSON-RPC 2.0', 'GraphQL subscriptions', 'Protocol Buffers only', 'SMTP commands'],
      ),
      'PYAE-Q-W21-02': questionPatch(
        'Which transport is designed for a client to communicate with a local MCP server subprocess?',
        'c',
        'The stdio transport exchanges protocol messages through the subprocess standard input and output streams.',
        ['UDP multicast', 'A shared SQLite file', 'Standard input and standard output', 'An email webhook'],
      ),
      'PYAE-Q-W21-03': questionPatch(
        'In the current MCP lifecycle, which request establishes protocol version and capabilities for a new session?',
        'b',
        'The client sends initialize, receives the server result, then sends notifications/initialized. Optional discovery extensions do not replace this lifecycle.',
        ['tools/list', 'initialize', 'server/discover', 'resources/read'],
      ),
      'PYAE-Q-W21-04': questionPatch(
        'Which MCP request lists tools currently exposed by a connected server?',
        'd',
        'tools/list discovers tool definitions after initialization.',
        ['prompts/get', 'resources/list', 'tools/call', 'tools/list'],
      ),
      'PYAE-Q-W21-05': questionPatch(
        'What problem is MCP primarily intended to reduce?',
        'a',
        'It standardizes how AI applications exchange context and invoke capabilities, reducing one-off integrations.',
        ['Repeated custom integration work between AI applications and context/tool providers', 'The need to validate tool arguments', 'All network latency between clients and servers', 'The need for application-specific authorization policy'],
      ),
      'PYAE-Q-W21-06': questionPatch(
        'Which three core primitive families may an MCP server expose?',
        'b',
        'MCP server features include resources, prompts, and tools.',
        ['Threads, processes, and sockets', 'Resources, prompts, and tools', 'Models, invoices, and deployments', 'Cookies, sessions, and routes'],
      ),
      'PYAE-Q-W21-07': questionPatch(
        'Which MCP request invokes a named server tool with arguments?',
        'c',
        'tools/call requests execution of a selected tool.',
        ['resources/read', 'prompts/get', 'tools/call', 'tools/list'],
      ),
      'PYAE-Q-W21-08': questionPatch(
        'Why must a client validate MCP tool metadata and apply local policy before exposing a tool to the model?',
        'd',
        'Server metadata is external input, not authorization. The host must validate schemas, namespace tools, and enforce its own permissions.',
        ['MCP tool schemas contain no argument definitions', 'Every remote tool is automatically ADMIN_ONLY', 'Validation makes the server response arrive faster', 'Server metadata is untrusted input and does not replace local authorization'],
      ),
      'PYAE-Q-W21-09': questionPatch(
        'Which current MCP transport supports remote HTTP communication and may use server-sent events for streaming?',
        'a',
        'Streamable HTTP is the current remote transport; SSE may be used within that transport but is not a separate authorization mechanism.',
        ['Streamable HTTP', 'stdio over a local subprocess only', 'FTP passive mode', 'Raw database replication'],
      ),
      'PYAE-Q-W21-10': questionPatch(
        'For a locally spawned MCP server, what lifecycle behavior should the host implement during normal shutdown and cancellation?',
        'b',
        'The host should close the session, terminate the child, wait, and escalate termination if needed. A hard host crash cannot promise normal cleanup on every platform.',
        ['Leave the child running so it can accept a future client', 'Close the session and terminate/reap the child with bounded cleanup', 'Delete the server source file', 'Assume the operating system guarantees graceful protocol shutdown after every hard crash'],
      ),
    },
  },

  'PYAE-W22': {
    finalClassifications: 'AAAAABBAAC',
    supportByClass: classSupport({
      A: ['PYAE-Q-W22-01', 'PYAE-Q-W22-02', 'PYAE-Q-W22-03', 'PYAE-Q-W22-04', 'PYAE-Q-W22-05', 'PYAE-Q-W22-08', 'PYAE-Q-W22-09'],
      B: ['PYAE-Q-W22-06', 'PYAE-Q-W22-07'],
      C: ['PYAE-Q-W22-10'],
      resources: ['PYAE-R-W22-01', 'PYAE-R-W22-02', 'PYAE-R-W22-03', 'PYAE-R-W22-04'],
      prior: ['PYAE-C005', 'PYAE-C010', 'PYAE-C011', 'PYAE-C015', 'PYAE-C019', 'PYAE-C021', 'PYAE-C022', 'PYAE-C025', 'PYAE-C030', 'PYAE-C031'],
    }),
    evidenceBasis: [
      'Video and written dependency-inversion instruction precede composition-root implementation.',
      'OpenAI orchestration material is retained with explicit distinctions between manager-controlled specialist calls and control-transfer handoffs.',
      'The Build verifies import direction, overrideable dependencies, bounded specialist context, and offline isolation.',
    ],
    patches: {
      'PYAE-Q-W22-01': questionPatch(
        'What does the Dependency Inversion Principle require of high-level agent orchestration code?',
        'b',
        'High-level policy should depend on stable abstractions rather than concrete database, model, or tool implementations.',
        ['Every module must instantiate its own dependencies', 'High-level and low-level code should depend on abstractions', 'Concrete infrastructure should import the application entry point', 'Dependency injection requires a third-party container framework'],
      ),
      'PYAE-Q-W22-02': questionPatch(
        'What can happen when module A and module B import each other at module-import time?',
        'a',
        'A cycle may expose a partially initialized module and raise an ImportError or AttributeError depending on access order; it does not have one guaranteed error.',
        ['One module may be only partially initialized, causing import-time failures', 'Python always resolves the cycle without observable effects', 'The interpreter always raises SyntaxError', 'Both modules are automatically merged'],
      ),
      'PYAE-Q-W22-03': questionPatch(
        'Why give specialist agents bounded tool subsets instead of exposing every tool to every specialist?',
        'c',
        'A smaller relevant capability surface improves selection clarity and limits the impact of errors or compromised context.',
        ['It guarantees every specialist reaches the same answer', 'It removes the need for permission enforcement', 'It improves relevance and reduces unnecessary capability exposure', 'It allows specialists to bypass the orchestrator'],
      ),
      'PYAE-Q-W22-04': questionPatch(
        'What distinguishes a true agent handoff from a manager calling a specialist as a tool?',
        'd',
        'A handoff transfers active control and conversation responsibility; a manager-as-tool pattern keeps control with the manager and receives a bounded result.',
        ['A handoff merely changes the Python function name', 'A handoff means two agents always run concurrently', 'A handoff keeps all control with the manager', 'A handoff transfers active control/responsibility to the specialist'],
      ),
      'PYAE-Q-W22-05': questionPatch(
        'What is the job of an application composition root?',
        'a',
        'The composition root is the boundary that constructs concrete dependencies and connects them to high-level abstractions.',
        ['Construct and wire concrete dependencies at one application boundary', 'Store every domain rule in global variables', 'Generate model answers before startup', 'Make each package import all other packages'],
      ),
      'PYAE-Q-W22-06': questionPatch(
        'What special module variable controls names imported by `from package import *`?',
        'c',
        '__all__ explicitly lists the public names used by wildcard import; explicit imports may still access other module attributes.',
        ['__name__', '__path__', '__all__', '__exports__'],
      ),
      'PYAE-Q-W22-07': questionPatch(
        'How does typing.Protocol make a high-level orchestrator easier to test?',
        'b',
        'A fake only needs to satisfy the required structural interface, so tests can replace network or persistence implementations without inheritance coupling.',
        ['It executes every test in a separate process', 'Fakes can satisfy the required interface structurally', 'It automatically mocks every method call', 'It prevents runtime exceptions'],
      ),
      'PYAE-Q-W22-08': questionPatch(
        'What context should a manager provide to a specialist for a bounded delegated task?',
        'd',
        'Pass the objective, relevant evidence and constraints, allowed capabilities, and expected result shape—not unrelated secrets or the entire history by default.',
        ['Every secret and all application state', 'Only the specialist name', 'The complete raw history regardless of relevance', 'The bounded objective, relevant context, constraints, capabilities, and output contract'],
      ),
      'PYAE-Q-W22-09': questionPatch(
        'Where should a modular application normally assemble concrete gateways, repositories, registries, and policies?',
        'a',
        'A composition root centralizes construction and wiring without leaking concrete dependencies into domain logic.',
        ['In a composition root at the application boundary', 'Inside every domain entity', 'Inside package __init__ wildcard imports', 'In the model prompt'],
      ),
      'PYAE-Q-W22-10': questionPatch(
        'Why separate deterministic planning rules from network, database, and model I/O behind narrow interfaces?',
        'c',
        'The deterministic core can be tested quickly with fakes, while infrastructure changes or failures remain localized.',
        ['To ensure domain code never accepts input', 'To make every operation synchronous', 'To test policy deterministically and replace infrastructure without rewriting it', 'To eliminate the need for integration tests'],
      ),
    },
  },

  'PYAE-W23': {
    finalClassifications: 'AAAAAAAAAA',
    supportByClass: classSupport({
      A: ['PYAE-Q-W23-01', 'PYAE-Q-W23-02', 'PYAE-Q-W23-03', 'PYAE-Q-W23-04', 'PYAE-Q-W23-05', 'PYAE-Q-W23-06', 'PYAE-Q-W23-07', 'PYAE-Q-W23-08', 'PYAE-Q-W23-09', 'PYAE-Q-W23-10'],
      resources: ['PYAE-R-W23-01', 'PYAE-R-W23-02', 'PYAE-R-W23-03', 'PYAE-R-W23-04', 'PYAE-R-W23-05', 'PYAE-R-W23-06'],
      prior: ['PYAE-C001', 'PYAE-C005', 'PYAE-C010', 'PYAE-C015', 'PYAE-C032'],
    }),
    evidenceBasis: [
      'Authoritative PyPA pages now cover PEP 621 metadata, scripts, editable installs, wheel builds, and clean installation.',
      'GitHub Actions and Twelve-Factor sources cover the CI matrix and deploy-varying configuration principles.',
      'Library trivia and the unrelated health-check question are replaced with observable release-readiness decisions.',
    ],
    patches: {
      'PYAE-Q-W23-01': questionPatch(
        'Under PEP 621, where is standard project metadata such as name, version, and dependencies declared?',
        'c',
        'PEP 621 standardizes a [project] table in pyproject.toml. Some build-tool configuration or dynamically supplied fields may still live elsewhere.',
        ['requirements.txt under a [project] heading', 'setup.py only', 'The [project] table in pyproject.toml', 'The package __init__.py file'],
      ),
      'PYAE-Q-W23-02': questionPatch(
        'What does `python -m pip install -e .` do for a local project?',
        'a',
        'It installs the project in editable mode so source changes are normally reflected without rebuilding/reinstalling, while dependencies and entry points are installed.',
        ['Installs an editable development link to the local source', 'Builds and uploads a release to PyPI', 'Installs only test dependencies', 'Copies the source into a Docker image'],
      ),
      'PYAE-Q-W23-03': questionPatch(
        'Which pyproject.toml entry defines a `pyae` command that calls `main` in `pyae.cli`?',
        'b',
        'The [project.scripts] table maps a command name to an importable object reference.',
        ['[tool.cli] pyae = "pyae.cli.main"', '[project.scripts] pyae = "pyae.cli:main"', '[build-system] pyae = "pyae/cli.py"', '[project.urls] pyae = "pyae.cli:main"'],
      ),
      'PYAE-Q-W23-04': questionPatch(
        'What configuration rule is described by the Twelve-Factor App?',
        'd',
        'Deploy-varying configuration, especially credentials and service endpoints, belongs in the environment rather than committed source.',
        ['Keep all environment values in package source', 'Use the same credential in every deployment', 'Treat internal constants as deploy-time secrets', 'Store deploy-varying configuration in environment variables'],
      ),
      'PYAE-Q-W23-05': questionPatch(
        'In GitHub Actions, which top-level key defines events such as push that trigger a workflow?',
        'a',
        'The top-level on key declares workflow trigger events.',
        ['on', 'runs-on', 'jobs', 'uses'],
      ),
      'PYAE-Q-W23-06': questionPatch(
        'Why separate runtime dependencies from development or test dependencies in project metadata?',
        'c',
        'Separation keeps normal installs minimal while named development groups or extras install tooling only where needed; the exact mechanism depends on project and backend support.',
        ['It prevents runtime packages from receiving security updates', 'It makes dependency versions unnecessary', 'It avoids shipping test tooling to normal users while keeping development setup reproducible', 'It guarantees optional packages are imported lazily'],
      ),
      'PYAE-Q-W23-07': questionPatch(
        'Which command performs the essential standards-based check that a source tree can produce distribution artifacts?',
        'b',
        '`python -m build` invokes the configured build backend in isolation and should produce the source distribution and wheel; other validators can add checks but do not replace the build.',
        ['python -m pip freeze', 'python -m build', 'python -m http.server', 'python -m pytest --collect-only'],
      ),
      'PYAE-Q-W23-08': questionPatch(
        'Why install the built wheel in a fresh virtual environment before release?',
        'a',
        'A clean install catches missing package data, undeclared dependencies, and entry-point mistakes that an editable source checkout can hide.',
        ['It verifies that the artifact installs and runs without relying on the source checkout', 'It proves every future operating system is supported', 'It replaces all unit and integration tests', 'It automatically publishes the wheel'],
      ),
      'PYAE-Q-W23-09': questionPatch(
        'How should startup behave when a credential required for the selected provider is absent?',
        'd',
        'Required configuration should fail early with a clear, non-secret error rather than inventing a default or failing deep inside a request.',
        ['Generate a placeholder credential and continue', 'Log every environment variable for diagnosis', 'Wait until the first remote call fails ambiguously', 'Fail early with a clear validation error that does not expose secrets'],
      ),
      'PYAE-Q-W23-10': questionPatch(
        'Why run CI against each Python version the project claims to support?',
        'b',
        'The matrix reveals interpreter and dependency differences before users encounter them and makes the support claim executable.',
        ['It makes all versions execute identical machine code', 'It detects compatibility failures across the declared support range', 'It removes the need to specify requires-python', 'It guarantees third-party services remain available'],
      ),
    },
  },

  'PYAE-W24': {
    finalClassifications: 'BBBBBBBBBB',
    supportByClass: classSupport({
      B: ['PYAE-Q-W24-01', 'PYAE-Q-W24-02', 'PYAE-Q-W24-03', 'PYAE-Q-W24-04', 'PYAE-Q-W24-05', 'PYAE-Q-W24-06', 'PYAE-Q-W24-07', 'PYAE-Q-W24-08', 'PYAE-Q-W24-09', 'PYAE-Q-W24-10'],
      resources: ['PYAE-R-W24-01', 'PYAE-R-W24-02', 'PYAE-R-W24-03'],
      prior: ['PYAE-C001', 'PYAE-C005', 'PYAE-C007', 'PYAE-C010', 'PYAE-C011', 'PYAE-C014', 'PYAE-C015', 'PYAE-C019', 'PYAE-C021', 'PYAE-C023', 'PYAE-C024', 'PYAE-C025', 'PYAE-C027', 'PYAE-C028', 'PYAE-C029', 'PYAE-C030', 'PYAE-C031', 'PYAE-C032', 'PYAE-C033'],
    }),
    evidenceBasis: [
      'The capstone deliberately introduces no new assessed concept; every item retrieves an established architecture, safety, testing, observability, persistence, or packaging competency.',
      'The Build requires a clean install, scenario matrix, offline test/evaluation evidence, truthful limitations, and a reproducible demonstration.',
      'Capstone resources act as synthesis references, not substitutes for the preceding 23 weeks of evidence.',
    ],
    patches: {
      'PYAE-Q-W24-01': questionPatch(
        'Which property most clearly distinguishes an agent loop from a one-shot script that calls a model once?',
        'a',
        'An agent loop observes state, selects actions/tools, incorporates results, and iterates toward a stopping condition.',
        ['It iteratively selects actions from observations until a stopping condition', 'It always uses more than one model provider', 'It must run continuously in the cloud', 'It never asks a human for confirmation'],
      ),
      'PYAE-Q-W24-02': questionPatch(
        'Which personal-agent actions should require an explicit human confirmation gate?',
        'c',
        'Policy should classify actions by impact and reversibility; destructive, external side-effecting, costly, or sensitive actions need confirmation, while harmless reads need not all be blocked.',
        ['Every action including formatting local text', 'Only actions whose tool name contains delete', 'Actions classified as high impact, destructive, costly, sensitive, or externally side-effecting', 'No action once the system prompt calls the user trusted'],
      ),
      'PYAE-Q-W24-03': questionPatch(
        'How can a team gain fast confidence in ordinary agent code changes without paid model calls?',
        'b',
        'Deterministic fake gateways, tool fixtures, integration scenarios, and offline evals test contracts repeatedly; periodic live checks remain a separate layer.',
        ['Skip model-boundary tests entirely', 'Use deterministic fakes, fixtures, integration tests, and offline regression evals', 'Retry live calls until outputs match', 'Replace assertions with manual screenshots'],
      ),
      'PYAE-Q-W24-04': questionPatch(
        'What operational value does structured step-level JSONL tracing provide?',
        'a',
        'It records observable decisions, calls, timing, results, and errors for diagnosis without claiming access to private internal model reasoning.',
        ['A queryable record of observable steps, timing, calls, results, and failures', 'A guaranteed record of every private model thought', 'Automatic authorization for traced actions', 'A replacement for secret redaction'],
      ),
      'PYAE-Q-W24-05': questionPatch(
        'When is SQLite with write-ahead logging a reasonable persistence choice for a personal agent?',
        'd',
        'It fits many local, single-machine workloads needing transactions and useful read concurrency, but suitability depends on filesystem, write contention, and deployment needs.',
        ['For every distributed multi-region workload', 'Whenever multiple hosts must write one network-mounted file', 'Only when durability is unnecessary', 'For suitable local transactional workloads after checking concurrency and filesystem constraints'],
      ),
      'PYAE-Q-W24-06': questionPatch(
        'Why rerun regression benchmarks after changing a system prompt or tool description?',
        'b',
        'Those changes can alter selection and behavior; stable cases reveal lost capabilities, safety regressions, and cost shifts.',
        ['To guarantee the prompt is subjectively better', 'To detect behavior, safety, and efficiency regressions against stable cases', 'To eliminate the need for code tests', 'To make every model response deterministic'],
      ),
      'PYAE-Q-W24-07': questionPatch(
        'Why validate tool arguments against a strict schema before application logic runs?',
        'c',
        'Early validation rejects missing, malformed, or out-of-range input before it reaches a side-effect boundary.',
        ['To authorize every schema-valid action automatically', 'To hide tool descriptions from the model', 'To reject malformed input before execution while authorization remains separate', 'To convert all tools into read-only operations'],
      ),
      'PYAE-Q-W24-08': questionPatch(
        'Which strategy best addresses indirect prompt injection from retrieved documents?',
        'a',
        'Defense in depth combines untrusted-data separation with least privilege, deterministic authorization, validation, confirmation, and safe output handling; no single prompt technique is sufficient.',
        ['Layer untrusted-data framing with least privilege, validation, authorization, and confirmation', 'Trust retrieved instructions after adding XML tags', 'Use a single regex to delete the word ignore', 'Give the retrieval model every tool so it can verify content'],
      ),
      'PYAE-Q-W24-09': questionPatch(
        'What practical benefit comes from packaging the agent with standard metadata and a CLI entry point?',
        'd',
        'A standard install and stable command make setup, dependency resolution, execution, testing, and distribution reproducible.',
        ['It makes the application secure without policy checks', 'It guarantees compatibility with every Python version', 'It removes the need for documentation', 'It provides a reproducible installation and stable way to run the application'],
      ),
      'PYAE-Q-W24-10': questionPatch(
        'What long-term benefit does a provider-neutral gateway abstraction offer?',
        'c',
        'It localizes provider-specific change and makes substitution/testing easier; it cannot promise seamless switching when capabilities differ.',
        ['Every provider becomes behaviorally identical', 'Provider outages can no longer affect the agent', 'Provider-specific change is localized behind a stable application contract', 'No adapter tests are needed'],
      ),
    },
  },
};

const numbered = (prefix, marker, texts) =>
  texts.map((text, index) => ({
    id: `${prefix}-${marker}${String(index + 1).padStart(2, '0')}`,
    text,
  }));

const makeBuildPlan = ({
  buildId,
  weekId,
  steps,
  acceptanceCriteria,
  hints,
  template,
  competencyIds,
  dependencyEvidence,
  hiddenFound,
  hiddenRepaired,
  rationale,
}) => ({
  weekId,
  sourcePatch: {
    steps: numbered(buildId, 'S', steps),
    acceptanceCriteria: numbered(buildId, 'A', acceptanceCriteria),
    hints,
    templates: [template],
  },
  dependencies: {
    competencyIds,
    evidence: dependencyEvidence,
  },
  hiddenFound,
  hiddenRepaired,
  rationale,
});

export const buildPlans = {
  'PYAE-B-W17-01': makeBuildPlan({
    buildId: 'PYAE-B-W17-01',
    weekId: 'PYAE-W17',
    steps: [
      'Create evals/dataset.json with at least five versioned, representative cases. Each case must define an input, the necessary tool behavior, an expected outcome, and a short rationale derived before running the candidate.',
      'Implement trajectory graders in evals/graders.py for necessary-tool recall, unnecessary-call precision, argument-schema validity, ordering constraints where order matters, and a documented efficiency limit without requiring one brittle exact sequence.',
      'Implement final-answer graders for normalized exact match, keyword groups, and carefully scoped regex patterns; add unit cases that demonstrate normalization and at least one false-positive defense.',
      'Implement evals/runner.py using scripted FakeModel fixtures. Isolate each case, collect case-level grader results, latency and token metadata when available, then write a versioned structured report with dataset and runner versions.',
      'Add tests/test_evals.py that runs fully offline, verifies a known failing fixture is reported, and fails when the aggregate pass rate is below 80 percent against the committed reference fixture.',
    ],
    acceptanceCriteria: [
      'The committed dataset has at least five independently reviewable cases with stable IDs, inputs, expected necessary tool behavior, target outcomes, and rationales.',
      'Trajectory and answer graders return structured evidence and their tests cover both true positives and false positives without imposing irrelevant exact ordering.',
      'The isolated runner writes a versioned JSON report containing per-case outcomes, grader details, timing, optional usage, fixture version, and aggregate pass rate.',
      'All evaluation tests run offline with FakeModel; a reference run reaches at least 80 percent and a deliberately regressed fixture causes the threshold test to fail.',
    ],
    hints: [
      'Define the expected behavior before viewing a candidate run so the benchmark cannot move to fit the output.',
      'Keep necessary-tool recall, unnecessary-call precision, schema validity, and final-answer quality as separate fields before computing a policy-level pass.',
      'Use a stable case ID plus dataset and runner versions; include a source commit only when the environment provides one.',
    ],
    template: {
      id: 'PYAE-T-W17-01',
      label: 'Versioned eval case and report outline',
      content: '# evals/dataset.json\n{"dataset_version":"1","cases":[{"id":"case-001","input":"...","necessary_tools":[],"expected":{},"rationale":"..."}]}\n\n# evals/runner.py\ndef evaluate_case(case, fake_model):\n    """Return grader evidence; never mutate the reference case."""\n',
    },
    competencyIds: ['PYAE-C007', 'PYAE-C010', 'PYAE-C011', 'PYAE-C019', 'PYAE-C021', 'PYAE-C023'],
    dependencyEvidence: [
      'Uses prior JSON/schema validation, pytest fixtures, deterministic gateway fakes, error handling, CLI/file organization, and version-control practice.',
      'All new evaluation terms are taught by this week\'s resources and checked in the repaired assessment before the Build.',
    ],
    hiddenFound: [
      'The old exact-sequence instruction silently required one trajectory even when alternatives were valid.',
      'The 80 percent threshold was ungrounded because no known failing control or reference fixture was required.',
      'Longitudinal reports lacked explicit dataset/runner version identity.',
    ],
    hiddenRepaired: [
      'Grades necessary behavior and only constrains order when the case declares it meaningful.',
      'Requires both a passing reference and a deliberately regressed negative control.',
      'Adds stable IDs and dataset/runner versions while making commit metadata optional.',
    ],
    rationale: 'The repaired Build measures observable behavior reproducibly without teaching benchmark overfitting or brittle trajectory snapshots.',
  }),

  'PYAE-B-W18-01': makeBuildPlan({
    buildId: 'PYAE-B-W18-01',
    weekId: 'PYAE-W18',
    steps: [
      'Create a Span dataclass with trace_id, span_id, parent_id, step_index, timezone-aware start_time, duration_ms, status, and a bounded attributes mapping; do not record private chain-of-thought.',
      'Implement a Tracer that appends spans to rotating JSONL and structurally redacts sensitive key names and tested credential-like values before serialization.',
      'Implement an ErrorClassifier for TRANSIENT_NETWORK, RATE_LIMIT, TOOL_ERROR, and FATAL with an explicit default-safe result for unknown failures.',
      'Implement RecoveryCoordinator policies: bounded replay-safe retries with server guidance or capped exponential backoff and jitter; structured tool-error observations; and an atomic, validated checkpoint before reporting and halting on fatal errors.',
      'Write offline tests using fake clocks, scripted errors, and temporary files to verify parent linkage, UTC serialization, JSONL parsing, nested redaction, retry caps, no replay of unsafe operations, checkpoint atomicity, and fatal halt behavior.',
    ],
    acceptanceCriteria: [
      'Trace output contains parseable hierarchical spans linked by parent_id, timezone-aware UTC timestamps, duration, status, and bounded observable attributes.',
      'Redaction occurs before persistence and masks nested sensitive fields and representative bearer, token, password, and key values without recording hidden model reasoning.',
      'Classification and recovery are deterministic: retries are capped and replay-safe, unknown errors default safe, tool failures remain visible, and fatal errors create a validated atomic checkpoint before halt.',
      'All tests run offline with fake time, scripted failures, and temporary storage and assert both allowed recovery and prohibited replay.',
    ],
    hints: [
      'Use parent_id consistently in your project record even if an observability library represents the parent through a span context object.',
      'Inject the clock and sleeper so retry schedules can be asserted without real delays.',
      'Write a checkpoint to a sibling temporary file, validate it, flush it, then atomically replace the destination.',
    ],
    template: {
      id: 'PYAE-T-W18-01',
      label: 'Safe tracing and recovery skeleton',
      content: '# tracing.py\n@dataclass(frozen=True)\nclass Span:\n    trace_id: str\n    span_id: str\n    parent_id: str | None\n    start_time: str\n    duration_ms: float\n    status: str\n\nclass RecoveryCoordinator:\n    def policy_for(self, error, *, replay_safe: bool): ...\n',
    },
    competencyIds: ['PYAE-C007', 'PYAE-C008', 'PYAE-C009', 'PYAE-C013', 'PYAE-C021', 'PYAE-C024', 'PYAE-C027'],
    dependencyEvidence: [
      'Builds on prior dataclasses, serialization, tested error boundaries, deterministic fakes, filesystem safety, and persistent state.',
      'Span semantics, structured logging, and recovery policies are taught this week before implementation.',
    ],
    hiddenFound: [
      'The old secret rule only named API keys and a regex, missing nested structured fields and pre-serialization timing.',
      'Unbounded backoff could replay unsafe operations or make tests sleep.',
      'Save state and halt did not require validation, atomicity, or visible failure reporting.',
    ],
    hiddenRepaired: [
      'Requires structural plus value redaction before any record is written.',
      'Adds replay-safety, server guidance, caps, jitter, retry limits, and fake-time tests.',
      'Defines validated atomic checkpoint, error report, then halt.',
    ],
    rationale: 'The Build now teaches observable, testable recovery rather than silent exception handling and unsafe blanket retry.',
  }),

  'PYAE-B-W19-01': makeBuildPlan({
    buildId: 'PYAE-B-W19-01',
    weekId: 'PYAE-W19',
    steps: [
      'Add an async execution boundary for tools while keeping blocking legacy I/O behind an explicit asyncio.to_thread adapter; reject CPU-bound work from that adapter contract.',
      'Implement run_concurrent_tools for independent calls with stable input-order result mapping, bounded concurrency, and documented TaskGroup sibling-failure semantics.',
      'Apply per-call deadlines, convert timeouts into structured observations, cancel unfinished work, await cleanup, and re-raise cancellation when the parent operation itself is cancelled.',
      'Implement AsyncBackgroundScheduler with monotonic deadlines, an explicit no-overlap policy per job, retained task references, visible failures, and bounded start/stop lifecycle.',
      'Write offline tests with injected clock/events rather than fragile wall-clock sleeps to prove overlap of independent calls, ordering, concurrency limits, timeout cleanup, parent cancellation, recurring scheduling, no overlap, and shutdown.',
    ],
    acceptanceCriteria: [
      'Independent async tool calls overlap up to a configured bound and results remain associated with their original call IDs and input order.',
      'Deadlines cancel and await hung work, return a structured timeout only at the tool boundary, and do not swallow cancellation of the parent operation.',
      'Background jobs use monotonic scheduling, never overlap themselves, retain lifecycle ownership, expose failures, and stop cleanly.',
      'Tests are offline and deterministic using synchronization primitives or injected time; they cover blocking-I/O adaptation, concurrency, timeout, cancellation, scheduling, and teardown.',
    ],
    hints: [
      'Use TaskGroup for related child lifetimes; preserve input ordering explicitly because completion order can differ.',
      'asyncio.to_thread is suitable for blocking I/O, not a universal CPU-parallelism mechanism.',
      'A background task needs an owner, a shutdown path, and an observed exception—creating and forgetting it is not a scheduler.',
    ],
    template: {
      id: 'PYAE-T-W19-01',
      label: 'Bounded async runner outline',
      content: '# async_runner.py\nasync def run_one(call, *, timeout_s, semaphore):\n    async with semaphore:\n        async with asyncio.timeout(timeout_s):\n            return await call.execute_async()\n\nclass AsyncBackgroundScheduler:\n    async def start(self): ...\n    async def stop(self): ...\n',
    },
    competencyIds: ['PYAE-C008', 'PYAE-C013', 'PYAE-C019', 'PYAE-C021', 'PYAE-C024', 'PYAE-C028'],
    dependencyEvidence: [
      'Uses prior interfaces, error observations, cancellation-aware testing, configuration, and recovery boundaries.',
      'Current-week resources explicitly teach tasks, TaskGroup, queues, timeout, cancellation, and development diagnostics.',
    ],
    hiddenFound: [
      'The old TaskGroup-or-gather choice did not state failure semantics or result ordering.',
      'Timing-speedup assertions based on sleep would be flaky.',
      'Recurring task lifetime, overlap, clock source, and exception ownership were unspecified.',
    ],
    hiddenRepaired: [
      'Selects TaskGroup semantics, stable mapping, and a configurable concurrency bound.',
      'Uses events/injected time and asserts cleanup, not a narrow elapsed-time race.',
      'Defines monotonic scheduling, no overlap, retained ownership, surfaced failures, and bounded shutdown.',
    ],
    rationale: 'The revised Build makes concurrency safe under failure and shutdown, not merely fast in a happy-path demonstration.',
  }),

  'PYAE-B-W20-01': makeBuildPlan({
    buildId: 'PYAE-B-W20-01',
    weekId: 'PYAE-W20',
    steps: [
      'Implement an UntrustedContentScanner that records limited heuristic signals and frames external content as data; document that neither scanning nor delimiters constitute an authorization boundary.',
      'Define a PermissionMatrix from stable tool IDs to PUBLIC, USER_CONFIRMATION, or ADMIN_ONLY plus scopes, and deny unknown tools and missing roles by default.',
      'Enforce schema validation, scope, role, and fresh confirmation at a deterministic dispatcher boundary before any side effect; return and audit structured denials without including secrets.',
      'Implement structural secret redaction for nested mappings/sequences and tested credential-like values before prompts, traces, logs, errors, or tool observations cross their boundary.',
      'Write offline adversarial tests showing direct and indirect injection signals, delimiter escape attempts, unknown-tool denial, role/scope denial, stale or mismatched confirmation denial, zero execution on denial, and nested secret redaction.',
    ],
    acceptanceCriteria: [
      'Untrusted content is labeled and scanned with explicit limitations; adversarial text never changes deterministic permission decisions.',
      'The dispatcher defaults to deny and executes a side-effecting tool only after schema, tool identity, role, scope, and matching fresh confirmation all pass.',
      'Secrets are structurally removed before crossing model and observability boundaries, including nested values and representative formats, without relying on one provider regex.',
      'Offline adversarial tests prove denied functions are never invoked and cover unknown tools, malformed inputs, injection attempts, confirmation binding, and redaction.',
    ],
    hints: [
      'Treat heuristic injection matches as signals for policy or review, not proof that all unmatched content is safe.',
      'Bind confirmation to the exact normalized tool, arguments, actor, and expiry so it cannot authorize a changed request.',
      'Walk structured values by sensitive key name, then apply multiple narrowly tested value detectors before serialization.',
    ],
    template: {
      id: 'PYAE-T-W20-01',
      label: 'Pre-execution policy boundary',
      content: '# security.py\nclass PermissionLevel(Enum):\n    PUBLIC = "public"\n    USER_CONFIRMATION = "user_confirmation"\n    ADMIN_ONLY = "admin_only"\n\ndef authorize(request, actor, confirmation, matrix):\n    """Return an allow/deny decision before invoking the tool."""\n',
    },
    competencyIds: ['PYAE-C007', 'PYAE-C014', 'PYAE-C019', 'PYAE-C022', 'PYAE-C023', 'PYAE-C028', 'PYAE-C029'],
    dependencyEvidence: [
      'Requires prior schemas, dispatcher/tool identity, workspace safety, confirmation UX, error observations, configuration, and observability redaction.',
      'Current-week assigned evidence teaches injection limits, least privilege, guardrails, and human-in-the-loop boundaries.',
    ],
    hiddenFound: [
      'The original sanitizer language implied keyword heuristics plus XML tags made input safe.',
      'Role-only checks omitted scope, unknown-tool default, confirmation binding, and proof of no side effect.',
      'A centralized prefix regex could miss nested and non-OpenAI secrets.',
    ],
    hiddenRepaired: [
      'Recasts scanner/framing as signals and defense layers with documented limitations.',
      'Adds default deny, scope, schema, identity, fresh exact confirmation, and zero-invocation tests.',
      'Requires structural pre-boundary redaction plus a representative tested detector set.',
    ],
    rationale: 'The Build now establishes deterministic security controls outside the model and honestly treats prompt techniques as supporting layers.',
  }),

  'PYAE-B-W21-01': makeBuildPlan({
    buildId: 'PYAE-B-W21-01',
    weekId: 'PYAE-W21',
    steps: [
      'Create a minimal local MCP server with the maintained Python SDK/FastMCP and one harmless tool with typed arguments; keep server stdout protocol-safe and send diagnostics to stderr.',
      'Implement an MCP client adapter that opens a stdio client session through the current SDK, owns its async context, and guarantees bounded close/termination during normal cancellation and teardown.',
      'Initialize the session and record negotiated protocol/capabilities; do not add a legacy server/discover prerequisite, and treat optional discovery extensions separately from the required initialize lifecycle.',
      'List tools, validate names/descriptions/input schemas as untrusted metadata, namespace them, apply the local permission matrix, and map accepted tools into ToolDefinition without granting authority from server annotations.',
      'Write offline tests for in-memory client/server behavior plus one stdio smoke test covering initialization, tool listing, valid invocation, invalid arguments, policy rejection, protocol-safe output, cancellation, and subprocess teardown.',
    ],
    acceptanceCriteria: [
      'The maintained Python MCP SDK server and client complete initialization and expose one typed harmless tool without handwritten protocol framing.',
      'Discovered tool metadata is validated, namespaced, and filtered through local permissions before registry exposure; annotations never grant authority.',
      'A valid tool call returns a mapped observation, while invalid arguments and denied tools return structured errors without execution.',
      'Offline tests cover in-memory behavior and stdio lifecycle, including clean normal/cancelled teardown with no orphan subprocess.',
    ],
    hints: [
      'Prefer the SDK stdio_client, ClientSession, and FastMCP examples over maintaining a custom line-framing implementation.',
      'Keep protocol output on stdout pristine; use stderr or the SDK logging path for diagnostics.',
      'Graceful teardown is testable for normal and cancellation paths; do not claim a hard process crash always permits protocol cleanup.',
    ],
    template: {
      id: 'PYAE-T-W21-01',
      label: 'Current Python SDK MCP outline',
      content: '# mcp_server.py\nfrom mcp.server.fastmcp import FastMCP\nmcp = FastMCP("pyae-local")\n\n@mcp.tool()\ndef system_info(topic: str) -> str:\n    return f"requested: {topic}"\n\n# client adapter owns stdio_client(...) and ClientSession contexts\n',
    },
    competencyIds: ['PYAE-C014', 'PYAE-C019', 'PYAE-C022', 'PYAE-C023', 'PYAE-C029', 'PYAE-C030'],
    dependencyEvidence: [
      'Uses prior schemas, async subprocess/lifecycle, registry adapters, permission enforcement, and structured error handling.',
      'Current 2026 MCP specification and SDK quickstart teach the protocol lifecycle and supported implementation path.',
    ],
    hiddenFound: [
      'The old Build taught handwritten newline-delimited JSON-RPC although the current SDK owns transport framing.',
      'It omitted validation and authorization of server-provided tool metadata.',
      'It did not separate normal teardown guarantees from hard-crash limitations.',
    ],
    hiddenRepaired: [
      'Uses the maintained SDK/FastMCP path and keeps protocol stdout clean.',
      'Adds untrusted metadata validation, namespacing, local policy, and non-authoritative annotations.',
      'Tests bounded normal and cancellation cleanup without an impossible universal crash guarantee.',
    ],
    rationale: 'The learner builds a current, policy-aware MCP integration rather than memorizing stale wire-level assumptions.',
  }),

  'PYAE-B-W22-01': makeBuildPlan({
    buildId: 'PYAE-B-W22-01',
    weekId: 'PYAE-W22',
    steps: [
      'Reorganize src/pyae into domain, application, and infrastructure packages with documented inward import direction and deliberate public APIs; add a smoke-import test from a clean interpreter.',
      'Create one composition root that wires gateway, memory repository, tool registry, security policy, tracer, and coordinator through narrow Protocols and permits explicit fake overrides in tests.',
      'Implement SpecialistDispatcher with named specialist configurations, bounded objectives, least-privilege tool subsets, relevant-context selection, and an explicit structured result contract.',
      'Implement manager-controlled delegation in which the primary coordinator retains control, invokes a specialist for a bounded task, validates its result, and synthesizes the final response; document that this is not a control-transfer handoff.',
      'Write offline architecture tests for import direction, clean package import, composition overrides, least-privilege specialist registration, bounded context, invalid-result rejection, delegation success/failure, and isolation with FakeModel.',
    ],
    acceptanceCriteria: [
      'Packages have an enforceable inward dependency direction, documented public APIs, and import successfully in a clean interpreter without cycles.',
      'The composition root wires concrete infrastructure to Protocol-facing application code and every external dependency can be replaced explicitly in tests.',
      'Specialist registration limits tools and context and returns results through a validated contract.',
      'The manager retains control across delegation, handles specialist failure, and does not mislabel a tool-style specialist call as a control-transfer handoff.',
      'All architecture and delegation tests run offline with fakes and prove isolation from model, network, and persistent production services.',
    ],
    hints: [
      'Domain and application modules should name the capabilities they require; the composition root is where concrete infrastructure is chosen.',
      'Pass a specialist the objective, relevant evidence, constraints, allowed tools, and output schema—not every stored message by default.',
      'If you implement actual control transfer as a stretch, give it separate state ownership and termination tests.',
    ],
    template: {
      id: 'PYAE-T-W22-01',
      label: 'Composition root and specialist contract',
      content: '# src/pyae/bootstrap.py\ndef build_application(*, gateway=None, memory=None, policy=None):\n    """Create production defaults while accepting explicit test overrides."""\n\n@dataclass(frozen=True)\nclass SpecialistRequest:\n    objective: str\n    evidence: tuple[str, ...]\n    allowed_tool_ids: tuple[str, ...]\n',
    },
    competencyIds: ['PYAE-C005', 'PYAE-C010', 'PYAE-C011', 'PYAE-C015', 'PYAE-C019', 'PYAE-C021', 'PYAE-C022', 'PYAE-C025', 'PYAE-C030', 'PYAE-C031'],
    dependencyEvidence: [
      'Requires earlier package/import, Protocol, fake gateway, registry, policy, tracing, and orchestrator competencies.',
      'Current resources add dependency inversion, composition-root wiring, specialist orchestration, and accurate handoff vocabulary.',
    ],
    hiddenFound: [
      'The old package instruction named __all__ but did not define or test import direction.',
      'Concrete imports in the original container template undermined its Protocol acceptance criterion.',
      'The original handoff step described manager-controlled delegation while calling it a handoff.',
    ],
    hiddenRepaired: [
      'Adds an enforceable layer rule and clean-interpreter smoke import.',
      'Uses a composition root with explicit fake overrides and Protocol-facing application code.',
      'Names the required behavior manager-controlled delegation and documents the distinction from control transfer.',
    ],
    rationale: 'The Build now proves modularity through dependency direction, replaceability, bounded authority, and honest orchestration semantics.',
  }),

  'PYAE-B-W23-01': makeBuildPlan({
    buildId: 'PYAE-B-W23-01',
    weekId: 'PYAE-W23',
    steps: [
      'Create pyproject.toml with an explicit standards-based build backend, PEP 621 metadata, requires-python, runtime dependencies, package discovery, and named development/test dependency configuration supported by the chosen tooling.',
      'Define [project.scripts] pyae = "pyae.cli:main" and make the CLI return useful --help and --version output without importing optional provider clients or requiring secrets.',
      'In isolated environments, test editable installation for development, run python -m build, then install the produced wheel into a fresh non-editable environment and execute pyae --help plus an offline smoke command.',
      'Create pyae/config.py that reads deploy-varying values from the environment, validates types and paths, fails clearly when configuration required by a selected provider is missing, and never supplies fake secret defaults.',
      'Create a GitHub Actions matrix for every declared Python version that installs the project reproducibly and runs Ruff, mypy, pytest, offline integration tests, python -m build, and a fresh-wheel smoke test using the same documented local commands.',
    ],
    acceptanceCriteria: [
      'pyproject.toml declares a working backend, PEP 621 metadata, supported Python range, runtime dependencies, package discovery, CLI script, and documented development/test installation path.',
      'Both editable development installation and a clean install of the built wheel expose pyae; --help, --version, and an offline smoke command work without a source-tree import leak.',
      'Configuration follows the deploy-varying environment boundary, validates values, and fails early without exposing or inventing required secrets.',
      'CI syntax is valid and each supported Python matrix job runs the documented lint, type, test, build, and fresh-wheel smoke commands.',
      'All required CI tests and smoke commands use FakeModel or local fixtures and require no live provider token or external service.',
    ],
    hints: [
      'Editable install proves the development loop; only a fresh installation of the built wheel exposes missing files and undeclared dependencies.',
      'Use python -m build as the portable artifact build; add backend-specific checks only as supplemental validation.',
      'Keep required secrets conditional on the selected provider so --help and the offline mode remain usable.',
    ],
    template: {
      id: 'PYAE-T-W23-01',
      label: 'PEP 621 package and release checks',
      content: '[build-system]\nrequires = ["hatchling"]\nbuild-backend = "hatchling.build"\n\n[project]\nname = "pyae-agent"\nversion = "0.1.0"\nrequires-python = ">=3.11"\n\n[project.scripts]\npyae = "pyae.cli:main"\n',
    },
    competencyIds: ['PYAE-C001', 'PYAE-C005', 'PYAE-C010', 'PYAE-C015', 'PYAE-C032'],
    dependencyEvidence: [
      'Uses prior CLI, package layout, test isolation, version control, and environment setup competencies.',
      'Six current resources collectively teach packaging metadata, scripts, editable installs, artifact builds, CI, and configuration.',
    ],
    hiddenFound: [
      'Editable installation alone could hide missing wheel content and undeclared dependencies.',
      'Fallback defaults for provider credentials would teach insecure configuration behavior.',
      'CI covered only Python 3.12 despite the question and likely metadata claiming multiple versions.',
    ],
    hiddenRepaired: [
      'Adds source build and fresh non-editable wheel installation in isolation.',
      'Requires clear conditional failure for missing required secrets and safe no-secret CLI metadata paths.',
      'Aligns the CI matrix with requires-python and adds local parity commands plus artifact smoke testing.',
    ],
    rationale: 'The Build now proves that the distributable artifact—not merely the checkout—installs, configures, tests, and runs as claimed.',
  }),

  'PYAE-B-W24-01': makeBuildPlan({
    buildId: 'PYAE-B-W24-01',
    weekId: 'PYAE-W24',
    steps: [
      'Assemble the complete src/pyae project, build its wheel, install that wheel in a clean environment, and run the documented offline CLI entry point on Windows; record exact commands and versions.',
      'Create a capstone scenario matrix and run representative interactive flows through Gateway, Tools, Memory, Retrieval, Security, Tracing, Evals, and recovery, including denied mutations and controlled subsystem failures rather than merely asserting seamless integration.',
      'Run the full offline unit, integration, security, state-recovery, packaging, and benchmark suites; save the versioned eval report and command results and investigate any skipped required check.',
      'Write a user manual and ADR set covering installation, offline mode, configuration, architecture boundaries, data storage/backup, confirmation policy, threat model, known limitations, recovery, verification, and safe removal.',
      'Record a reproducible terminal transcript or demo using only non-sensitive fixtures that shows multi-step work, exact confirmation binding and denial, restart persistence, grounded file citations, trace correlation, a handled failure, and final cleanup.',
    ],
    acceptanceCriteria: [
      'A clean Windows environment installs the built wheel and runs the documented local offline CLI without a paid API, cloud account, external SaaS, or source-tree import dependency.',
      'Required unit, integration, security, recovery, packaging, and benchmark checks pass offline with FakeModel, including a documented eval threshold and failure controls.',
      'Mutating or externally side-effecting tools are confined by workspace and least-privilege policy and execute only after confirmation bound to the exact current request.',
      'Restart persistence and grounded retrieval are demonstrated with non-secret fixtures, verifiable file citations, redacted traces, backup/recovery instructions, and truthful documented limitations.',
    ],
    hints: [
      'Treat the scenario matrix as evidence: map each subsystem and failure boundary to a command, expected observation, and saved result.',
      'A clean wheel environment must not see the repository root on its import path.',
      'Redact the transcript and traces, use disposable workspace data, and confirm cleanup does not delete data outside that workspace.',
    ],
    template: {
      id: 'PYAE-T-W24-01',
      label: 'Capstone evidence README and ADR outline',
      content: '# Python Personal Agent — Capstone\n\n## Clean install and quickstart\n## Offline verification commands\n## Scenario evidence matrix\n## Architecture and data flow\n## Permissions and threat model\n## Persistence, backup, and recovery\n## Known limitations\n## Demo transcript and cleanup\n',
    },
    competencyIds: ['PYAE-C001', 'PYAE-C005', 'PYAE-C007', 'PYAE-C010', 'PYAE-C011', 'PYAE-C014', 'PYAE-C015', 'PYAE-C019', 'PYAE-C021', 'PYAE-C023', 'PYAE-C024', 'PYAE-C025', 'PYAE-C027', 'PYAE-C028', 'PYAE-C029', 'PYAE-C030', 'PYAE-C031', 'PYAE-C032', 'PYAE-C033'],
    dependencyEvidence: [
      'The capstone only composes competencies introduced and practiced in Weeks 01-23; it adds no hidden technical prerequisite.',
      'Current capstone resources supply synthesis and safety references while the scenario matrix proves the actual repository contracts.',
    ],
    hiddenFound: [
      'Operate seamlessly was unobservable and encouraged a happy-path-only manual claim.',
      'The old final test step omitted clean artifact installation, security/recovery controls, and saved evidence.',
      'The documentation and demo did not require truthful limitations, redaction, failure handling, or cleanup.',
    ],
    hiddenRepaired: [
      'Replaces seamless with a subsystem-by-scenario evidence matrix including controlled failures.',
      'Makes clean wheel installation and the complete offline gate suite part of acceptance.',
      'Requires threat model, limitations, recovery, redacted evidence, exact confirmations, and safe cleanup.',
    ],
    rationale: 'The capstone becomes an auditable production-readiness demonstration built entirely from prior learning rather than a vague integration victory lap.',
  }),
};

export const guideSpecs = {
  'PYAE-W17': {
    summary: 'Build a small versioned offline benchmark and grade both observable agent actions and final answers without changing the target after seeing a run.',
    whyItMatters: 'A repeatable evaluation suite turns "this change seems better" into case-level evidence and catches quality, safety, latency, or cost regressions before release.',
    prior: ['PYAE-C007', 'PYAE-C010', 'PYAE-C011', 'PYAE-C019', 'PYAE-C021', 'PYAE-C023'],
    finished: 'A reviewed five-or-more-case dataset, non-brittle trajectory and answer graders, an isolated FakeModel runner, a versioned result artifact, and a tested 80 percent regression gate with a negative control.',
    concepts: ['EVALUATION-DATASET', 'TRAJECTORY-EVALUATION'],
    sessions: [
      ['Choose representative cases before running candidates', 120, [1]],
      ['Grade necessary actions without one brittle path', 130, [2]],
      ['Grade final answers and test false positives', 110, [3]],
      ['Run isolated cases and write versioned evidence', 140, [4]],
      ['Prove the regression gate detects failure', 140, [5]],
    ],
  },
  'PYAE-W18': {
    summary: 'Trace observable agent work as linked, redacted spans and turn classified failures into bounded, replay-safe recovery or an honest safe halt.',
    whyItMatters: 'Operators need a causal record and a controlled outcome when a multi-step run fails; silent errors, leaked secrets, and blind retries make incidents worse.',
    prior: ['PYAE-C007', 'PYAE-C008', 'PYAE-C009', 'PYAE-C013', 'PYAE-C021', 'PYAE-C024', 'PYAE-C027'],
    finished: 'UTC linked spans, appendable structurally redacted JSONL, explicit failure classification, capped replay-safe recovery, atomic fatal checkpoints, and deterministic fake-clock tests.',
    concepts: ['TRACE-SPAN', 'RECOVERY-POLICY', 'STRUCTURED-LOGGING'],
    sessions: [
      ['Define observable linked operations', 100, [1]],
      ['Persist redacted trace evidence', 125, [2]],
      ['Classify known and unknown failures safely', 105, [3]],
      ['Apply bounded replay-safe recovery', 135, [4]],
      ['Test timing, redaction, checkpoint, and halt paths', 135, [5]],
    ],
  },
  'PYAE-W19': {
    summary: 'Run independent tool work concurrently inside an owned async lifetime, then handle deadlines, cancellation, background scheduling, and shutdown explicitly.',
    whyItMatters: 'Concurrency only improves an agent when it preserves dependencies and resource limits and never leaves unobserved tasks or incomplete cleanup behind.',
    prior: ['PYAE-C008', 'PYAE-C013', 'PYAE-C019', 'PYAE-C021', 'PYAE-C024', 'PYAE-C028'],
    finished: 'An explicit async tool boundary, bounded structured concurrency with stable result mapping, correct timeout/cancellation observations, a monotonic no-overlap scheduler, and deterministic lifecycle tests.',
    concepts: ['STRUCTURED-CONCURRENCY', 'RECOVERY-POLICY'],
    sessions: [
      ['Separate async work from blocking I/O', 100, [1]],
      ['Own bounded independent child tasks', 130, [2]],
      ['Handle deadlines and cancellation correctly', 110, [3]],
      ['Schedule recurring work without overlap', 150, [4]],
      ['Prove concurrency and teardown deterministically', 150, [5]],
    ],
  },
  'PYAE-W20': {
    summary: 'Treat external text and tool metadata as untrusted, enforce least-privilege permissions before execution, bind confirmations to exact actions, and redact secrets before they cross boundaries.',
    whyItMatters: 'Prompt wording can influence a model but cannot authorize side effects; deterministic policy must contain direct and indirect injection attempts even when heuristics miss them.',
    prior: ['PYAE-C007', 'PYAE-C014', 'PYAE-C019', 'PYAE-C022', 'PYAE-C023', 'PYAE-C028', 'PYAE-C029'],
    finished: 'Honest untrusted-content signals, a default-deny scoped permission matrix, pre-execution validation and confirmation, structural secret redaction, and adversarial tests proving zero execution on denial.',
    concepts: ['PROMPT-INJECTION', 'PERMISSION-MATRIX', 'LEAST-PRIVILEGE'],
    sessions: [
      ['Model untrusted-content signals and limits', 110, [1]],
      ['Define deny-by-default permissions and scopes', 100, [2]],
      ['Bind authorization before every side effect', 110, [3]],
      ['Redact secrets before boundary crossings', 120, [4]],
      ['Attack and verify the deterministic boundary', 160, [5]],
    ],
  },
  'PYAE-W21': {
    summary: 'Connect a harmless local MCP tool with the maintained Python SDK, then validate, namespace, authorize, invoke, and cleanly close that external capability.',
    whyItMatters: 'MCP standardizes integration mechanics, but the host still owns trust, permissions, schema validation, process lifetime, and the meaning of tool results.',
    prior: ['PYAE-C014', 'PYAE-C019', 'PYAE-C022', 'PYAE-C023', 'PYAE-C029', 'PYAE-C030'],
    finished: 'A current FastMCP server, SDK client session, negotiated lifecycle, validated and policy-filtered tool bridge, offline in-memory tests, and a stdio teardown smoke test.',
    concepts: ['MODEL-CONTEXT-PROTOCOL', 'JSON-RPC', 'DISPATCHER'],
    sessions: [
      ['Expose one typed harmless SDK tool', 100, [1]],
      ['Own the client and subprocess lifetime', 100, [2]],
      ['Negotiate current session capabilities', 90, [3]],
      ['Validate and authorize advertised tools', 110, [4]],
      ['Verify invocation, rejection, and teardown', 140, [5]],
    ],
  },
  'PYAE-W22': {
    summary: 'Give the growing agent an enforceable package direction and one composition root, then delegate bounded work to least-privilege specialists through validated contracts.',
    whyItMatters: 'Modularity is observable replaceability and controlled ownership, not merely more folders; bounded specialists must not inherit global state or authority accidentally.',
    prior: ['PYAE-C005', 'PYAE-C010', 'PYAE-C011', 'PYAE-C015', 'PYAE-C019', 'PYAE-C021', 'PYAE-C022', 'PYAE-C025', 'PYAE-C030', 'PYAE-C031'],
    finished: 'Layered packages with smoke-tested import direction, Protocol-facing application code, an overrideable composition root, bounded specialist configurations, manager-controlled delegation, and offline isolation tests.',
    concepts: ['DEPENDENCY-INVERSION', 'COMPOSITION-ROOT', 'HANDOFF'],
    sessions: [
      ['Enforce package roles and import direction', 110, [1]],
      ['Wire replaceable dependencies once', 110, [2]],
      ['Register least-privilege specialists', 110, [3]],
      ['Implement an accurately named delegation contract', 110, [4]],
      ['Prove import, override, context, and failure isolation', 160, [5]],
    ],
  },
  'PYAE-W23': {
    summary: 'Turn the repository into a standards-based distribution that installs and runs from a clean wheel, validates configuration, and repeats every supported check in CI.',
    whyItMatters: 'Editable success inside the author\'s checkout can hide missing files and dependencies; the built artifact and a fresh environment are the release truth.',
    prior: ['PYAE-C001', 'PYAE-C005', 'PYAE-C010', 'PYAE-C015', 'PYAE-C032'],
    finished: 'Complete PEP 621 metadata, a safe pyae CLI, editable and clean-wheel installation evidence, required configuration validation, and a supported-version CI matrix with offline lint, type, test, build, and smoke gates.',
    concepts: ['PACKAGE-ENTRY-POINT', 'CONTINUOUS-INTEGRATION'],
    sessions: [
      ['Declare build, metadata, dependencies, and packages', 110, [1]],
      ['Expose a safe command entry point', 80, [2]],
      ['Compare editable work with a clean wheel install', 120, [3]],
      ['Validate deploy-varying configuration', 90, [4]],
      ['Mirror the release gates across supported Python versions', 140, [5]],
    ],
  },
  'PYAE-W24': {
    summary: 'Assemble the previously verified components into one cleanly installable personal agent and produce reproducible evidence for its operation, safety, recovery, limits, and maintenance.',
    whyItMatters: 'Production readiness is not a flawless demo; it is the ability to install, exercise, diagnose, contain, recover, explain, and remove the whole system under realistic conditions.',
    prior: ['PYAE-C001', 'PYAE-C005', 'PYAE-C007', 'PYAE-C010', 'PYAE-C011', 'PYAE-C014', 'PYAE-C015', 'PYAE-C019', 'PYAE-C021', 'PYAE-C023', 'PYAE-C024', 'PYAE-C025', 'PYAE-C027', 'PYAE-C028', 'PYAE-C029', 'PYAE-C030', 'PYAE-C031', 'PYAE-C032', 'PYAE-C033'],
    finished: 'A clean-wheel local agent, subsystem scenario matrix, complete offline gate evidence, versioned eval report, bounded confirmations and workspace access, restart/retrieval proof, honest manuals and ADRs, and a redacted reproducible demonstration.',
    concepts: ['CAPSTONE-INTEGRATION', 'RECOVERY-POLICY', 'LEAST-PRIVILEGE'],
    sessions: [
      ['Build and install the release candidate cleanly', 130, [1]],
      ['Exercise integrated success, denial, and failure paths', 150, [2]],
      ['Run and preserve every offline gate', 150, [3]],
      ['Document architecture, operations, threats, and limits', 140, [4]],
      ['Record, review, redact, and clean up the demonstration', 150, [5]],
    ],
  },
};

export const weekReadiness = {
  'PYAE-W17': {
    ready: true,
    judgment: 'YES',
    evidence: [
      'All ten questions are classified (8 A, 1 B, 1 C), rewritten with plausible distractors, and supported by assigned evidence or named prerequisites.',
      'Three verified resources cover evaluation design, implementation guidance, and hands-on testing; the optional platform-specific reference is clearly demoted.',
      'The Build removes exact-path brittleness and requires stable cases, false-positive tests, versioned reports, a passing reference, and a failing control.',
    ],
    remainingRisks: ['LLM-as-judge implementation remains optional; any future addition needs a rubric, calibration set, privacy review, and cost limit.'],
  },
  'PYAE-W18': {
    ready: true,
    judgment: 'YES',
    evidence: [
      'All ten questions are classified (5 A, 3 B, 2 C); parent_id, TTFT, retry, checkpoint, and private-reasoning claims are now technically precise.',
      'Current OpenTelemetry instrumentation replaces a generic production page, while the trace and structured-logging references remain scoped to their strengths.',
      'The Build proves pre-persistence redaction, bounded replay-safe recovery, unknown-error behavior, atomic checkpoints, and deterministic fake-clock tests.',
    ],
    remainingRisks: ['Real exporter behavior varies by deployment and remains outside this local JSONL Build.'],
  },
  'PYAE-W19': {
    ready: true,
    judgment: 'YES',
    evidence: [
      'All ten questions are classified (9 A, 1 C) and accurately distinguish gather, TaskGroup, timeout transformation, cancellation, to_thread, and bounded independent concurrency.',
      'Core Python references plus an added Queue page and a focused video support both conceptual and practical learning modes.',
      'The Build specifies ownership, stable mapping, concurrency bounds, monotonic no-overlap scheduling, visible failures, and deterministic lifecycle tests.',
    ],
    remainingRisks: ['CPU-bound parallelism is explicitly excluded and would require a later process/thread design decision.'],
  },
  'PYAE-W20': {
    ready: true,
    judgment: 'YES',
    evidence: [
      'All ten questions are classified (9 A, 1 B); outdated OWASP numbering, regex-only redaction, delimiter guarantees, and dual-model overclaims are repaired.',
      'Current OWASP prompt-injection guidance and guardrail/HITL references support defense in depth without treating model output as authority.',
      'The Build requires default deny, exact confirmation binding, zero invocation on denial, structural redaction, and adversarial offline evidence.',
    ],
    remainingRisks: ['Heuristic injection detection is intentionally incomplete and documented as a signal rather than a security boundary.'],
  },
  'PYAE-W21': {
    ready: true,
    judgment: 'YES',
    evidence: [
      'All ten questions are classified (9 A, 1 C) against current lifecycle and transport semantics, including optional discovery and Streamable HTTP.',
      'The stale specification and example links are replaced by the 2026-07-28 tools specification and maintained Python SDK quickstart.',
      'The Build uses SDK-owned framing, validates untrusted metadata, applies local policy, and tests both in-memory behavior and stdio teardown.',
    ],
    remainingRisks: ['Future MCP revisions require rechecking the pinned specification version and SDK examples before curriculum publication.'],
  },
  'PYAE-W22': {
    ready: true,
    judgment: 'YES',
    evidence: [
      'All ten questions are classified (7 A, 2 B, 1 C); circular-import, handoff, composition-root, and deterministic-core semantics are corrected.',
      'A practical dependency-inversion video and written dependency-injection chapter complement the retained orchestration references.',
      'The Build proves import direction, fake overrides, bounded context/tools, validated results, failure isolation, and accurate manager-controlled delegation terminology.',
    ],
    remainingRisks: ['Actual control-transfer handoffs remain a clearly labeled stretch and need separate state-ownership tests if introduced.'],
  },
  'PYAE-W23': {
    ready: true,
    judgment: 'YES',
    evidence: [
      'All ten questions are classified A and replace packaging absolutes, library trivia, and an unrelated health-check item with observable release decisions.',
      'Six free resources now cover metadata, entry points, editable installs, clean builds, CI, and configuration with both reference and practice roles.',
      'The Build makes the wheel the release artifact, aligns CI with declared Python support, fails safely on required configuration, and preserves offline operation.',
    ],
    remainingRisks: ['The chosen build backend and dependency-group syntax must remain internally consistent when the candidate source is assembled.'],
  },
  'PYAE-W24': {
    ready: true,
    judgment: 'YES',
    evidence: [
      'All ten questions are B retrieval items and introduce no hidden capstone concepts; overclaims about universal confirmation, private thought traces, SQLite, injection defense, and provider swapping are removed.',
      'The Build traces every required subsystem to a scenario, clean-wheel command, saved offline gate, documentation section, or redacted demonstration event.',
      'Safety, recovery, persistence, retrieval, packaging, and evaluation evidence are required under both success and controlled failure conditions.',
    ],
    remainingRisks: ['A manual live learner-UX smoke test of published R3 remains required before the Week 1 pilot, per the approved non-blocking browser condition.'],
  },
};

export default {
  resourcePlans,
  addedResourcePlans,
  questionWeekPlans,
  buildPlans,
  guideSpecs,
  weekReadiness,
};
