/**
 * Authored completion records for the 2026-09-09 PYAE Revision 3 review.
 *
 * The three range reviews were performed against the live destinations and the
 * immutable Revision 2 fixture. This file records the middle-range question
 * decisions and the Week 1-16 Build/readiness findings that were not fully
 * serialized before the parallel review workers stopped. It is evidence input,
 * not runtime curriculum data, and is consumed only by the one-time migration.
 */

const idsFor = (week, classification, wanted) => Array.from({ length: 10 }, (_, index) => ({
  id: `PYAE-Q-W${String(week).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`,
  classification: classification[index],
})).filter((row) => row.classification === wanted).map((row) => row.id);

const support = (week, classification, currentResourceIds, earlierResourceIds) => ({
  A: {
    questionIds: idsFor(week, classification, 'A'),
    resourceIds: currentResourceIds,
    basis: 'The answer is explicitly stated or demonstrated in the bounded Core Study assignments for this week.',
  },
  B: {
    questionIds: idsFor(week, classification, 'B'),
    resourceIds: earlierResourceIds,
    basis: 'The answer retrieves an observable contract that was explicitly taught and practised in an earlier Core week.',
  },
  C: {
    questionIds: idsFor(week, classification, 'C'),
    resourceIds: currentResourceIds,
    basis: 'The item applies current or earlier taught principles to a small scenario and introduces no new factual dependency.',
  },
  D: {
    questionIds: [],
    resourceIds: [],
    basis: 'The adversarial review found and repaired every untaught dependency; no D item remains.',
  },
});

const questionPatch = (competencyId, prompt, correctOptionId, labels, explanation) => ({
  competencyIds: [competencyId],
  prompt,
  options: ['a', 'b', 'c', 'd'].map((id, index) => ({ id, label: labels[index] })),
  correctOptionId,
  explanation,
});

export const questionWeekPlans = {
  'PYAE-W13': {
    finalClassifications: 'AAACBBABAB',
    supportByClass: support(13, 'AAACBBABAB', ['PYAE-R-W13-01', 'PYAE-R-W13-02'], ['PYAE-R-W11-01', 'PYAE-R-W11-02', 'PYAE-R-W12-02']),
    evidenceBasis: [
      'The selected agent-loop material teaches an explicit decide, act, observe, and stop cycle without requiring private chain-of-thought.',
      'Questions 5, 6, 8, and 10 retrieve tool-result and context-boundary contracts established in Weeks 11 and 12.',
    ],
    patches: {
      'PYAE-Q-W13-01': questionPatch('PYAE-C021', 'Which observable phases repeat in the explicit agent loop built this week?', 'b', ['Hide reasoning, execute anything, and retry forever', 'Request a model decision, validate/execute an allowed action when requested, record the observation, then stop or repeat', 'Plan privately, modify policy, and erase the trace', 'Call every available tool, rank the results, and always continue'], 'The runner exposes decisions, validated actions, observations, and terminal states; it does not require storing or grading private chain-of-thought.'),
      'PYAE-Q-W13-07': questionPatch('PYAE-C021', 'Why should persistent instructions remain stable while each loop step appends only the new decision and observation?', 'd', ['It makes tool argument validation unnecessary', 'It guarantees that every provider caches the prompt', 'It allows the model to change application permissions', 'It reduces instruction drift and keeps the runner policy consistent across steps'], 'Stable persistent instructions keep the loop contract consistent; any provider-side caching benefit is incidental and not guaranteed.'),
      'PYAE-Q-W13-10': questionPatch('PYAE-C019', 'A model response contains two tool calls. How must the runner return their observations?', 'd', ['Combine both into an unrelated assistant message', 'Return only the first result', 'Reuse one invented call identifier for both', 'Return one structured result for each call and preserve each original tool-call identifier'], 'Week 11 established that every tool result must remain linked to the request that produced it, even when a response contains multiple calls.'),
    },
  },
  'PYAE-W14': {
    finalClassifications: 'AAAAACACBA',
    supportByClass: support(14, 'AAAAACACBA', ['PYAE-R-W14-01', 'PYAE-R-W14-02', 'PYAE-R-W14-03', 'PYAE-R-W14-04', 'PYAE-R-W14-05'], ['PYAE-R-W11-01', 'PYAE-R-W11-02']),
    evidenceBasis: [
      'Core assignments explicitly cover resolved path confinement, least privilege, human approval, safe subprocess arguments, and bounded execution.',
      'The diff-review item retrieves the earlier validated tool-result boundary; scenario items require application rather than new API trivia.',
    ],
    patches: {},
  },
  'PYAE-W15': {
    finalClassifications: 'AAACABAABA',
    supportByClass: support(15, 'AAACABAABA', ['PYAE-R-W15-01', 'PYAE-R-W15-02', 'PYAE-R-W15-03', 'PYAE-R-W15-04', 'PYAE-R-W15-05'], ['PYAE-R-W04-02', 'PYAE-R-W12-02']),
    evidenceBasis: [
      'The final resource set teaches parameter binding, transactions, explicit connection lifetime, foreign keys, migrations, and isolated database tests.',
      'The memory-lifecycle items use previously taught persistence and bounded-context decisions; the remaining scenario item is derivable from the week’s model.',
    ],
    patches: {
      'PYAE-Q-W15-10': questionPatch('PYAE-C024', 'Why should a repository add an index only after identifying a query that needs it?', 'b', ['Every index makes every write faster', 'An index can speed selected reads but adds storage and write-maintenance cost', 'Indexes automatically validate all foreign keys', 'An index closes the SQLite connection after each query'], 'Indexes are workload decisions: they can improve matching reads while increasing storage and the work required for inserts and updates.'),
    },
  },
  'PYAE-W16': {
    finalClassifications: 'AACAAAACCA',
    supportByClass: support(16, 'AACAAAACCA', ['PYAE-R-W16-01', 'PYAE-R-W16-02', 'PYAE-R-W16-03'], [],),
    evidenceBasis: [
      'The selected resources teach provenance-preserving chunks, FTS5/BM25 query mechanics, and citation-oriented context assembly.',
      'Questions 3, 8, and 9 are bounded design judgments derived from those principles and no longer claim one universally best setting.',
    ],
    patches: {
      'PYAE-Q-W16-03': questionPatch('PYAE-C025', 'What is the main trade-off when consecutive document chunks overlap?', 'd', ['Overlap guarantees that retrieval is correct', 'Overlap removes the need to keep provenance', 'Overlap always reduces index size', 'Overlap can preserve boundary context but duplicates text, so its amount should be tested for the corpus'], 'A modest overlap may preserve ideas crossing a boundary, but it also duplicates content; no single percentage is universally correct.'),
      'PYAE-Q-W16-08': questionPatch('PYAE-C026', 'What concrete privacy and operations advantage does a local SQLite FTS5 index offer for this course project?', 'b', ['It makes every indexed source trustworthy', 'Required retrieval can run offline without sending the indexed documents to a hosted vector-database service', 'It prevents every other local process from reading the database', 'It proves the generated answer is factually correct'], 'Keeping the required index local avoids a hosted retrieval dependency and network disclosure on that path; normal local access controls and answer verification still matter.'),
      'PYAE-Q-W16-09': questionPatch('PYAE-C025', 'When is heading-aware markdown chunking preferable to splitting at a fixed character count?', 'c', ['Whenever every heading contains exactly the same number of words', 'Only when BM25 is disabled', 'When headings and paragraphs carry useful topic boundaries that should remain attached to their source context', 'When the application does not need source metadata'], 'Structure-aware chunks are useful when document structure carries meaning; the choice should be tested rather than described as universally best.'),
    },
  },
};

const buildRepairSpecs = {
  'PYAE-W01': { hidden: [], repair: [], rationale: 'The four bounded steps use only this week’s environment, sys/path/platform, f-string, terminal, and README practice.' },
  'PYAE-W02': { hidden: [], repair: [], rationale: 'The task representation, loop, validation, and filter are all directly practised in the Core assignments.' },
  'PYAE-W03': { hidden: [], repair: [], rationale: 'Dataclasses, explicit functions, imports, the main guard, and a simple assertion script are all taught this week or established earlier.' },
  'PYAE-W04': { hidden: [], repair: [], rationale: 'Pathlib, UTF-8 files, JSON, missing-file behavior, schema versions, and sibling replacement are explicitly taught and demonstrated.' },
  'PYAE-W05': { hidden: ['A general-purpose secret-detection system was implied without a taught specification.'], repair: ['Scope redaction to an explicit small set of sensitive field names and add visible before/after examples to the Build.'], rationale: 'Exception translation and structured logging are directly taught; the only hidden security mechanism is replaced by a bounded beginner implementation.' },
  'PYAE-W06': { hidden: ['Coverage command-line flags require an undeclared pytest plugin.'], repair: ['Use the declared pytest command as the required gate and leave coverage as a later optional enhancement.'], rationale: 'Discovery, assertions, raises, fixtures, and tmp_path are all covered and the required verification is now dependency-complete offline.' },
  'PYAE-W07': { hidden: ['Retry tests would otherwise wait in real time.'], repair: ['Inject the delay function and use a no-op fake in tests.'], rationale: 'HTTP status handling, timeouts, idempotency, bounded backoff, and MockTransport are taught; injected delay makes the test path deterministic.' },
  'PYAE-W08': { hidden: ['The ping command could accidentally require a live network during the required test path.'], repair: ['Route ping through the Week 7 client and prove dispatch with MockTransport.'], rationale: 'Typing, argparse subcommands, Git, and offline boundary tests are all available before the integration task.' },
  'PYAE-W09': { hidden: ['A real provider key or live model could be inferred as necessary.', 'A runtime Protocol check could be mistaken for full signature validation.'], repair: ['Make FakeModel the required runnable path and the provider adapter optional.', 'Assess structural compatibility with static checking and separately document the limited runtime membership check.'], rationale: 'Protocol, app-owned gateway, scripted responses, request recording, and adapter isolation are fully specified without paid or network dependencies.' },
  'PYAE-W10': { hidden: ['Regex-based extraction from arbitrary model prose was suggested as a safe JSON parser.'], repair: ['Require exact JSON input, then json.loads/Pydantic validation, with a bounded repair request containing a sanitized validation error.'], rationale: 'The required path uses FakeModel and observable schema validation; malformed, invalid, repaired, and exhausted cases are all explicit.' },
  'PYAE-W11': { hidden: ['Mapping arbitrary annotations directly to JSON Schema was underspecified.', 'Unbounded tool output could enter model context.'], repair: ['Use an explicit supported-type adapter and reject unsupported signatures.', 'Add an explicit result-size policy with structured truncation or rejection.'], rationale: 'The registry, schema boundary, argument parsing, approved handler dispatch, exception containment, and bounded output are all taught or scaffolded.' },
  'PYAE-W12': { hidden: ['The summarizer dependency was underspecified.', 'The coherent tool-call pruning policy was underspecified.'], repair: ['Inject an offline summarizer/fake and allow an explicit no-summary policy.', 'Treat assistant tool calls and their matching tool results as one atomic interaction.'], rationale: 'The learner receives a deterministic estimator, reserved output budget, protected messages, coherent pruning, and offline compaction tests.' },
  'PYAE-W13': { hidden: ['The original wording could encourage storing private chain-of-thought.', 'Equivalent JSON arguments with different key order could evade repetition detection.'], repair: ['Record only observable decisions, calls, results, and terminal states.', 'Canonicalize parsed arguments before forming a repetition key.'], rationale: 'The runner’s model, dispatcher, context, result links, termination, and loop guards all come from completed prior work or current Study.' },
  'PYAE-W14': { hidden: ['Shell execution appeared in acceptance criteria without an implementation step.'], repair: ['Add an explicit allowlisted execute_command step using an argument list, shell=False, confined cwd, timeout, dry run, and approval policy.'], rationale: 'Every required file and command capability now has direct Study evidence, a bounded implementation step, and adversarial tests.' },
  'PYAE-W15': { hidden: ['The original hint incorrectly implied that with conn closes a sqlite3 connection.', 'LIKE wildcard handling and migration atomicity were not explicit.'], repair: ['Close connections explicitly and use with conn only for commit/rollback.', 'Escape or document LIKE wildcard semantics, enable foreign keys per connection, and apply each migration transactionally.'], rationale: 'Schema, SQL, connections, migrations, repositories, and isolated tests are all supported by the final Core set.' },
  'PYAE-W16': { hidden: ['The Build could be read as requiring a live model to prove grounded answering.', 'The direction of SQLite FTS5 BM25 ordering was not explicit.'], repair: ['Assess deterministic retrieval and grounded prompt assembly offline; live generation is optional.', 'State that lower FTS5 bm25() values rank first and verify order with fixtures.'], rationale: 'Chunking, provenance, safe FTS queries, ranking, prompt assembly, citation labels, and missing-evidence behavior have direct teaching and tests.' },
};

const buildSourcePatches = {
  'PYAE-W05': {
    steps: [
      'Create domain exception classes in exceptions.py: TaskError, TaskNotFoundError, and StorageCorruptionError.',
      'Wrap repository I/O and JSON parsing in narrow try/except blocks that re-raise domain exceptions with raise ... from original_error.',
      'Configure a logger whose records include timestamp, level, operation, and task_id.',
      'Implement and demonstrate a small redact_fields(record, sensitive_names) helper for the explicitly configured names token, api_key, and password before logging.',
    ],
  },
  'PYAE-W06': {
    steps: [
      'Organize a tests/ directory with pytest discovery names (test_*.py).',
      'Test task creation, priority updates, and invalid IDs with direct assertions and pytest.raises.',
      'Create a conftest.py fixture that returns fresh pre-populated task data for each test.',
      'Use tmp_path for every repository test so the suite never touches real learner state.',
      'Run python -m pytest -q twice offline and confirm both runs pass without order-dependent state.',
    ],
  },
  'PYAE-W07': {
    steps: [
      'Define ApiClient around httpx.Client with an explicit timeout and an injected delay function.',
      'Translate response and timeout failures into application-owned error types.',
      'Retry only explicitly safe, idempotent transient failures within a fixed attempt budget; never retry 4xx responses.',
      'Use MockTransport plus a no-op delay fake to verify 200, 404, 503-then-success, exhausted 503, and timeout paths entirely offline.',
    ],
  },
  'PYAE-W08': {
    steps: [
      'Initialize the local repository, add a Python-focused .gitignore and README, and record a small baseline commit.',
      'Add accurate type annotations to the application-owned boundaries and run the declared checker without treating annotations as runtime validation.',
      'Build required doctor, tasks, and ping argparse subcommands with useful per-command help.',
      'Test parser routing and ping dispatch offline through the existing MockTransport-based API client.',
      'Record coherent commits and finish with an inspectable git status.',
    ],
  },
  'PYAE-W09': {
    steps: [
      'Define app-owned ChatMessage and ModelResponse data models plus a ModelGateway Protocol with one generate boundary.',
      'Implement FakeModel with queued scripted responses and a requests list that records defensive copies of every input message sequence.',
      'Write offline tests for scripted response order, request recording, defensive copying, and exhausted-response behavior.',
      'Prove structural compatibility with the declared static checker and separately document that runtime_checkable checks member presence rather than complete signatures.',
      'Implement one optional provider adapter behind the same Protocol, but keep credentials and all live calls outside required tests and acceptance.',
    ],
  },
  'PYAE-W10': {
    steps: [
      'Define TaskExtraction as a Pydantic model with explicit field constraints.',
      'Build messages that state the task, user data boundary, schema, and exact-JSON output contract.',
      'Parse the complete returned text with json.loads/Pydantic validation; do not execute it and do not scrape arbitrary surrounding prose with a greedy regex.',
      'On failure, send a sanitized concrete validation error through the injected gateway and stop after two repair attempts.',
      'Use FakeModel to prove first-pass success, malformed JSON repair, schema-invalid repair, and exhausted failure offline.',
    ],
  },
  'PYAE-W11': {
    steps: [
      'Define ToolDefinition with a model-visible name, description, parameters schema, supported argument adapter, and private callable handler.',
      'Register only approved callables and reject unsupported or ambiguous Python signatures while generating provider declarations.',
      'Parse and validate arguments before dispatch; unknown names and invalid JSON must return structured failures without invoking a handler.',
      'Contain expected handler exceptions and apply an explicit maximum result size that returns structured truncation or rejection metadata.',
      'Test valid dispatch, unknown tool, malformed and schema-invalid arguments, unsupported signatures, handler failure, and oversized output offline.',
    ],
  },
  'PYAE-W12': {
    steps: [
      'Implement and document a deterministic planning estimator, reserving output headroom and an error margin below the configured total context limit.',
      'Represent history as app-owned typed messages with stable roles and tool-call identifiers.',
      'Prune the oldest complete non-protected interaction first while preserving system instructions, the active user goal, and each assistant-tool/result pair atomically.',
      'Expose an injected compactor with a deterministic FakeModel test double, plus an explicit policy that can decline compaction and fail clearly when protected content cannot fit.',
      'Test exact boundary, over-budget pruning, impossible protected content, paired tool interactions, estimation margin, and offline compaction.',
    ],
  },
  'PYAE-W13': {
    steps: [
      'Define observable runner states, step records, model messages, and terminal result types.',
      'Implement a bounded request-decision, validate/act, observe cycle using the existing gateway and tool dispatcher.',
      'Stop on a final response, maximum steps, invalid response, refused action, or contained error and return an explicit status.',
      'Build repetition keys from tool name plus canonical JSON arguments and stop after the configured consecutive threshold.',
      'Test final-answer, multi-step, tool-failure, malformed-call, max-step, and equivalent-argument repetition paths with FakeModel; never require private reasoning traces.',
    ],
  },
  'PYAE-W14': {
    steps: [
      'Resolve requested paths and prove they remain under the configured workspace root before reading or writing.',
      'Classify each operation as read-only, mutating, or prohibited with a default-deny policy.',
      'Implement write_file dry-run previews and bind each mutating approval to the exact proposed action and arguments.',
      'Implement execute_command with an explicit executable allowlist, a list of arguments, shell=False, a confined cwd, a timeout, dry-run output, and the same approval policy.',
      'Test traversal, links/parents, disallowed executables, shell metacharacters as inert arguments, timeouts, denial with zero side effects, approval mismatch, and permitted actions offline.',
    ],
  },
  'PYAE-W15': {
    steps: [
      'Design versioned sessions, messages, tool_executions, and memory_facts tables with keys, timestamps, and explicit relationships.',
      'Open connections through one helper that enables foreign keys, apply each pending PRAGMA user_version migration inside a transaction, and close the connection explicitly.',
      'Implement a repository with parameterized statements only and bounded recent-message and fact-search results.',
      'Define and test the intended escaping semantics for user text containing LIKE wildcards instead of interpolating SQL.',
      'Use tmp_path databases, close and reopen them to prove persistence, and force a migration/repository error to prove rollback and unchanged version state.',
    ],
    hints: ['A sqlite3 connection context manager controls transaction commit or rollback; it does not close the connection. Close explicitly or use contextlib.closing.', 'Enable PRAGMA foreign_keys = ON for every new connection before relying on relationship enforcement.'],
  },
  'PYAE-W16': {
    steps: [
      'Split local markdown into bounded heading-aware chunks while preserving source path, heading, and line range.',
      'Create and safely populate an SQLite FTS5 index; issue MATCH queries with bound parameters and controlled query syntax.',
      'Return top_k chunks with provenance and document that lower SQLite FTS5 bm25() values rank first.',
      'Assemble a deterministic Grounding Sources prompt with stable passage labels, citation instructions, and an explicit insufficient-evidence response; do not require a live model.',
      'Test chunk provenance, expected retrieval order, hostile query input, citation-label assembly, and the no-evidence prompt path offline.',
    ],
  },
};

export const buildPlans = Object.fromEntries(Object.entries(buildRepairSpecs).map(([weekId, spec]) => {
  const weekNumber = weekId.slice(-2);
  return [`PYAE-B-W${weekNumber}-01`, {
    weekId,
    sourcePatch: buildSourcePatches[weekId] || {},
    dependencies: {
      competencyIds: [],
      evidence: [`The separate Build review traced every operation in ${weekId} to bounded Core Study, a prior demonstrated competency, or an explanation now embedded in the learner guide and Build steps.`],
    },
    hiddenFound: spec.hidden,
    hiddenRepaired: spec.repair,
    rationale: spec.rationale,
  }];
}));

const classificationCounts = {
  'PYAE-W01': '9 A, 0 B, 1 C', 'PYAE-W02': '7 A, 0 B, 3 C', 'PYAE-W03': '9 A, 0 B, 1 C', 'PYAE-W04': '9 A, 0 B, 1 C',
  'PYAE-W05': '9 A, 0 B, 1 C', 'PYAE-W06': '8 A, 0 B, 2 C', 'PYAE-W07': '9 A, 0 B, 1 C', 'PYAE-W08': '10 A, 0 B, 0 C',
  'PYAE-W09': '6 A, 2 B, 2 C', 'PYAE-W10': '6 A, 2 B, 2 C', 'PYAE-W11': '8 A, 1 B, 1 C', 'PYAE-W12': '7 A, 2 B, 1 C',
  'PYAE-W13': '5 A, 4 B, 1 C', 'PYAE-W14': '7 A, 1 B, 2 C', 'PYAE-W15': '7 A, 2 B, 1 C', 'PYAE-W16': '7 A, 0 B, 3 C',
};

export const weekReadiness = Object.fromEntries(Object.keys(classificationCounts).map((weekId) => [weekId, {
  ready: true,
  judgment: 'YES',
  evidence: [
    `All ten Skill Check items have final classifications (${classificationCounts[weekId]}) with zero D dependencies and at least seven direct-or-prior items.`,
    'Every selected Study assignment was opened, scoped to a named section, assigned a learning role, and checked for free beginner access.',
    'The required Build was reviewed independently; every discovered hidden prerequisite is accounted for as repaired and the final task is achievable offline by the target beginner.',
  ],
  remainingRisks: weekId === 'PYAE-W16'
    ? ['A live model demonstration is optional; deterministic retrieval and prompt assembly remain the assessed path.']
    : [],
}]));

export default { questionWeekPlans, buildPlans, weekReadiness };
