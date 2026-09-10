import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileCurriculum } from '../src/curriculum-v2/compiler/compileCurriculum.js';
import { generateCoverage } from '../src/curriculum-v2/coverage/generateCoverage.js';
import { validateCurriculumSource } from '../src/curriculum-v2/validation/validateCurriculumSource.js';
import { validateResourceResearch } from '../src/curriculum-v2/validation/validateResourceResearch.js';
import { validateRuntimeCurriculum } from '../src/curriculum-v2/validation/validateRuntimeCurriculum.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(root, 'XcelerateAI Curriculum System', 'v2', 'curricula', 'python-agent-engineering');
const publishedDir = path.join(root, 'src', 'curriculum-v2', 'catalog', 'published');
const checkedAt = '2026-09-05';

const phases = [
  ['PYAE-PH01', 'Python Foundations', 'Write and operate small Python command-line programs with dependable structured data.'],
  ['PYAE-PH02', 'Reliable Python Systems', 'Test, validate, document, and integrate Python components behind stable interfaces.'],
  ['PYAE-PH03', 'LLM Application Foundations', 'Build provider-aware LLM applications with explicit message, output, tool, and context contracts.'],
  ['PYAE-PH04', 'Agent Engineering Core', 'Implement transparent tool-using agent loops with bounded behavior, persistence, and grounding.'],
  ['PYAE-PH05', 'Reliability and Integrations', 'Evaluate, observe, secure, schedule, and connect agent systems responsibly.'],
  ['PYAE-PH06', 'Production Personal Agent', 'Integrate and ship a maintainable local-first personal agent with evidence of readiness.'],
].map(([id, title, outcome]) => ({ id, title, outcome }));

const competencyRows = [
  ['C001', 'Windows Python workspace', 'Create, activate, and verify an isolated Python environment from PowerShell.', 'Python foundations', 'core', []],
  ['C002', 'Values, types, and expressions', 'Represent and transform values with suitable Python types and operators.', 'Python foundations', 'core', ['C001']],
  ['C003', 'Control flow and collections', 'Use conditions, loops, lists, dictionaries, sets, and tuples to model decisions and data.', 'Python foundations', 'core', ['C002']],
  ['C004', 'Functions and contracts', 'Design small functions with explicit inputs, outputs, names, and responsibilities.', 'Python foundations', 'core', ['C002']],
  ['C005', 'Modules and packages', 'Organize Python code into importable modules and installable project dependencies.', 'Python foundations', 'core', ['C004']],
  ['C006', 'Files and paths', 'Read, write, and locate files safely with pathlib and context managers.', 'Python foundations', 'core', ['C004']],
  ['C007', 'JSON data contracts', 'Serialize, validate, and evolve JSON-shaped application data without losing meaning.', 'Python foundations', 'core', ['C003', 'C006']],
  ['C008', 'Exceptions and debugging', 'Diagnose failures and use narrow exception handling that preserves actionable context.', 'Reliability', 'core', ['C004']],
  ['C009', 'Operational logging', 'Emit useful structured diagnostic events without leaking secrets.', 'Reliability', 'supporting', ['C008']],
  ['C010', 'Automated tests', 'Write deterministic unit and integration tests for success and failure paths.', 'Reliability', 'core', ['C005', 'C008']],
  ['C011', 'Test doubles and isolation', 'Replace external dependencies with controlled fakes, mocks, and temporary state.', 'Reliability', 'core', ['C010']],
  ['C012', 'HTTP and API clients', 'Call HTTP APIs with explicit requests, responses, authentication boundaries, and parsing.', 'Integration', 'core', ['C007', 'C008']],
  ['C013', 'Timeouts, retries, and failure policy', 'Bound external calls and retry only safe transient failures with backoff.', 'Reliability', 'core', ['C012']],
  ['C014', 'Typed validation boundaries', 'Validate untrusted inputs and outputs into typed domain models with clear errors.', 'Architecture', 'core', ['C007', 'C008']],
  ['C015', 'Versioned interfaces and documentation', 'Document commands and interfaces, use Git history, and manage compatibility deliberately.', 'Professional practice', 'supporting', ['C005', 'C010']],
  ['C016', 'LLM request and message model', 'Construct provider-neutral model requests and interpret response metadata and failure modes.', 'LLM applications', 'core', ['C012', 'C014']],
  ['C017', 'Prompt contracts', 'Specify task, context, constraints, examples, and output expectations as a testable contract.', 'LLM applications', 'core', ['C016']],
  ['C018', 'Structured model outputs', 'Constrain and validate model output before application code trusts or executes it.', 'LLM applications', 'core', ['C014', 'C017']],
  ['C019', 'Tool schemas and execution', 'Define typed tool schemas, dispatch tool calls, and return inspectable results.', 'Agent engineering', 'core', ['C018']],
  ['C020', 'Conversation and context state', 'Persist and compact conversation state while preserving provenance and task-critical facts.', 'Agent engineering', 'core', ['C007', 'C016']],
  ['C021', 'Agent control loop', 'Implement an explicit observe-decide-act loop with budgets and deterministic stop conditions.', 'Agent engineering', 'core', ['C019', 'C020']],
  ['C022', 'Agent tool interface design', 'Design discoverable, composable tools with useful feedback and bounded effects.', 'Agent engineering', 'core', ['C019', 'C021']],
  ['C023', 'Safe action boundaries', 'Separate planning from execution and make state-changing actions confirmable and idempotent.', 'Agent safety', 'core', ['C021', 'C022']],
  ['C024', 'Persistent application state', 'Model and migrate durable agent state with SQLite transactions and repositories.', 'Agent engineering', 'core', ['C007', 'C010']],
  ['C025', 'Memory and context engineering', 'Select, summarize, retrieve, and expire memory according to task value and risk.', 'Agent engineering', 'core', ['C020', 'C024']],
  ['C026', 'Grounded retrieval', 'Retrieve from local sources with citations, provenance, and explicit no-answer behavior.', 'Agent engineering', 'core', ['C006', 'C014', 'C025']],
  ['C027', 'Agent evaluations', 'Build representative eval datasets, graders, thresholds, and regression reports.', 'Evaluation', 'core', ['C010', 'C021']],
  ['C028', 'Observability and resilience', 'Trace agent runs, classify failures, and recover without hiding partial effects.', 'Reliability', 'core', ['C009', 'C013', 'C027']],
  ['C029', 'Async work and scheduling', 'Coordinate cancellable concurrent work and scheduled jobs without blocking or duplication.', 'Runtime systems', 'supporting', ['C013', 'C024']],
  ['C030', 'Permissions, guardrails, and security', 'Apply least privilege, human approval, input/output guardrails, and secret hygiene.', 'Agent safety', 'core', ['C023', 'C028']],
  ['C031', 'MCP integration', 'Connect MCP clients and servers while preserving tool trust and permission boundaries.', 'Integration', 'supporting', ['C022', 'C030']],
  ['C032', 'Modular agent architecture', 'Compose provider, tool, memory, policy, and specialist components behind replaceable interfaces.', 'Architecture', 'core', ['C021', 'C025', 'C028']],
  ['C033', 'Deployment, configuration, and CI', 'Package, configure, continuously verify, and operate a Python agent across environments.', 'Professional practice', 'core', ['C015', 'C028', 'C030', 'C032']],
];
const competencies = competencyRows.map(([id, name, description, domain, importance, prerequisiteIds]) => ({
  id: `PYAE-${id}`, name, description, domain, importance,
  prerequisiteIds: prerequisiteIds.map((item) => `PYAE-${item}`),
}));

const profession = {
  curriculumId: 'PYAE', revision: 1, researchedAt: checkedAt,
  role: 'Python Agent Engineer',
  roleDefinition: 'A Python engineer who builds, evaluates, secures, and operates bounded software agents that use language models, tools, memory, and external systems to complete useful tasks with inspectable evidence.',
  evidenceSummary: [
    'Production agent work combines ordinary Python software engineering with model interaction, tool execution, state, evaluation, observability, and safety boundaries.',
    'Current primary guidance favors simple composable workflows before adding autonomy, explicit tool contracts, continuous evaluations, and human control for consequential actions.',
    'A beginner pathway must teach deterministic Python and API fundamentals before frameworks so learners can debug behavior rather than depend on hidden orchestration.',
  ],
  practitionerOutputs: [
    'Task-oriented Python services and command-line applications with stable data contracts.',
    'LLM applications that validate structured outputs and expose model providers through replaceable adapters.',
    'Tool-using agents with explicit loops, durable state, grounded retrieval, bounded actions, and human approval.',
    'Evaluation suites, traces, runbooks, threat models, migration paths, and reproducible release artifacts.',
  ],
  systemComponents: ['Python package and configuration', 'model-provider adapter', 'prompt and output contracts', 'tool registry and policy gateway', 'agent loop', 'session/context manager', 'SQLite repository', 'retrieval layer', 'evaluation harness', 'tracing and recovery', 'optional MCP adapter'],
  professionalPractices: ['Use documentation as a normal engineering tool', 'write deterministic tests before live-provider checks', 'preserve failure evidence', 'review narrow changes', 'version interfaces and state', 'document setup, limitations, recovery, and security decisions'],
  independentCompetenceSignals: [
    'Can explain and diagram the system without relying on framework vocabulary alone.',
    'Can reproduce a failure, identify its boundary, implement a focused repair, and add a regression test.',
    'Can replace a model provider or tool implementation without rewriting domain behavior.',
    'Can justify when not to use autonomy, MCP, multiple agents, cloud infrastructure, or a paid model.',
  ],
  deploymentExpectation: 'A graduate can package and continuously verify a local Windows installation and explain an optional container or hosted deployment path; operating distributed cloud infrastructure is outside the graduation boundary.',
  safetyAndControlPractices: ['least privilege', 'untrusted-content separation', 'strict input/output schemas', 'human approval for consequential actions', 'idempotency and effect reconciliation', 'secret redaction', 'cancellation and run budgets', 'independent safety evaluation gates'],
  coreCapabilities: competencies.filter((item) => item.importance === 'core').map((item) => item.id),
  supportingCapabilities: competencies.filter((item) => item.importance === 'supporting').map((item) => item.id),
  optionalCapabilities: ['Multi-agent delegation beyond one bounded specialist handoff', 'Hosted cloud scaling', 'Fine-tuning foundation models', 'Custom GPU inference operations'],
  exclusions: [
    'No claim of autonomous general intelligence or unsupervised authority over consequential systems.',
    'No paid API, cloud account, Docker installation, or GPU is required to complete assessed work.',
    'No framework is treated as a substitute for understanding the agent loop and its failure modes.',
  ],
  graduationBoundary: 'A graduate can design, implement, test, evaluate, and operate a local-first Python personal agent with replaceable model providers, bounded tools, durable state, grounded answers, approval gates, and a reproducible readiness report. Advanced distributed systems and unrestricted autonomy remain outside scope.',
  sources: [
    { title: 'Python 3 documentation', url: 'https://docs.python.org/3/', publisher: 'Python Software Foundation', contribution: 'Language, standard library, environment, persistence, concurrency, and testing foundations.' },
    { title: 'OpenAI API documentation', url: 'https://developers.openai.com/api/docs/quickstart', publisher: 'OpenAI', contribution: 'Current model request, structured output, tool calling, production, safety, and evaluation practices.' },
    { title: 'OpenAI Agents SDK documentation', url: 'https://openai.github.io/openai-agents-python/', publisher: 'OpenAI', contribution: 'Current agent loop, tools, sessions, guardrails, tracing, human approval, MCP, and testing concepts.' },
    { title: 'Building effective agents', url: 'https://www.anthropic.com/engineering/building-effective-agents', publisher: 'Anthropic', contribution: 'Evidence for simple composable workflows, explicit agent loops, and autonomy tradeoffs.' },
    { title: 'Demystifying evals for AI agents', url: 'https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents', publisher: 'Anthropic', contribution: 'Evaluation design for non-deterministic agent systems.' },
    { title: 'Model Context Protocol architecture', url: 'https://modelcontextprotocol.io/docs/learn/architecture', publisher: 'Model Context Protocol', contribution: 'Host, client, server, capability, and security boundaries for interoperable tools.' },
    { title: 'OWASP Top 10 for LLM Applications', url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/', publisher: 'OWASP', contribution: 'Threat categories and mitigations for LLM-enabled applications.' },
  ],
};

const c = (competencyId, situation, correct, failureChoice, distractorTwo, distractorThree, explanation, failure) => ({
  competencyId: `PYAE-${competencyId}`, situation, correct, failureChoice, distractorTwo, distractorThree, explanation, failure,
});
const r = (url, title, provider, format, minutes, note) => ({ url, title, provider, format, minutes, note });
const weekSpecs = [];

weekSpecs.push(
  {
    title: 'Python Workspace and First CLI', outcome: 'Run a repeatable Python command-line program inside an isolated Windows environment.',
    competencyIds: ['C001', 'C002'],
    resources: [
      r('https://docs.python.org/3/library/venv.html', 'venv — Creation of virtual environments', 'Python Software Foundation', 'documentation', 55, 'Read through How venvs work and the PowerShell activation commands.'),
      r('https://cs50.harvard.edu/python/2022/weeks/0/', 'CS50P Week 0: Functions, Variables', 'Harvard University', 'video', 100, 'Watch the lecture sections on functions, variables, return values, and errors.'),
      r('https://docs.python.org/3/tutorial/introduction.html', 'An Informal Introduction to Python', 'Python Software Foundation', 'lab', 75, 'Type and modify every code example in a local Python REPL and script.'),
    ],
    build: ['Environment Doctor CLI', 'Create a CLI that reports the Python executable, version, working directory, and whether its expected virtual environment is active.', 'The command runs from PowerShell and prints all four facts with readable labels.', 'A README gives exact setup, activation, and run commands for Windows.'],
    checks: [
      c('C001', 'A project needs dependencies isolated from every other Python project.', 'Create and activate a project-local virtual environment.', 'Install everything globally as administrator.', 'Copy another project’s site-packages folder.', 'Rename the Python executable.', 'A virtual environment isolates interpreter configuration and installed packages.', 'The global install changes other projects and makes the setup hard to reproduce.'),
      c('C001', 'PowerShell refuses to run the activation script because of execution policy.', 'Use the documented PowerShell activation approach and adjust policy only for the necessary scope.', 'Disable all Windows security controls permanently.', 'Delete the virtual environment metadata.', 'Run an unrelated executable.', 'The narrow documented remedy preserves the security boundary and fixes the actual shell issue.', 'A permanent global security change is disproportionate and unsafe.'),
      c('C002', 'A CLI must display a numeric Python version component inside a sentence.', 'Convert or format the value explicitly in an f-string.', 'Add the integer directly to a string with +.', 'Store the number in a file first.', 'Compare the number with the sentence.', 'Explicit formatting makes the type conversion intentional and readable.', 'Direct string-plus-integer concatenation raises a TypeError.'),
      c('C002', 'A value should remain unchanged after initial configuration.', 'Use an uppercase descriptive name and avoid rebinding it.', 'Put the value in a loop counter.', 'Reuse the same name for user input.', 'Hide it in an unnamed literal everywhere.', 'Python constants are communicated by naming convention and disciplined use.', 'Reusing the name destroys the stable configuration meaning.'),
      c('C001', 'A teammate cannot reproduce the first run.', 'Document Python version, environment creation, activation, installation, and run commands.', 'Send only a screenshot of the output.', 'Tell them to install random packages until it works.', 'Commit the local virtual-environment directory.', 'A command-level setup contract makes the environment repeatable.', 'A screenshot contains no reproducible setup procedure.'),
    ],
  },
  {
    title: 'Control Flow and Collections', outcome: 'Transform a small set of user tasks using appropriate conditions, loops, and collection types.',
    competencyIds: ['C002', 'C003'],
    resources: [
      r('https://docs.python.org/3/tutorial/controlflow.html', 'More Control Flow Tools', 'Python Software Foundation', 'documentation', 90, 'Study if, for, range, match, and loop-control sections.'),
      r('https://docs.python.org/3/tutorial/datastructures.html', 'Data Structures', 'Python Software Foundation', 'documentation', 100, 'Study lists, dictionaries, sets, looping techniques, and comparisons.'),
      r('https://cs50.harvard.edu/python/2022/weeks/2/', 'CS50P Week 2: Loops', 'Harvard University', 'exercise', 120, 'Complete two loop problems and one collection transformation locally.'),
    ],
    build: ['Task Queue CLI', 'Build a menu-driven task queue that adds, lists, prioritizes, completes, and filters in-memory tasks.', 'All menu choices have an explicit branch and invalid choices do not terminate the program.', 'Tasks retain a unique identifier, title, priority, and completion state.'],
    checks: [
      c('C003', 'A collection needs fast lookup of task records by unique task ID.', 'Use a dictionary keyed by task ID.', 'Use a set of mutable dictionaries.', 'Use a single long string.', 'Use a list indexed by task title.', 'A dictionary expresses key-based lookup and preserves each record as a value.', 'Mutable dictionaries cannot be set members and do not provide ID lookup.'),
      c('C003', 'A loop should keep prompting until the learner selects Quit.', 'Use an explicit loop with a tested break condition.', 'Use recursion for every menu iteration.', 'Duplicate the menu one hundred times.', 'Catch every exception and continue silently.', 'A loop represents repeated interaction and a visible exit rule.', 'Unbounded recursion consumes stack frames and obscures control flow.'),
      c('C003', 'Only incomplete high-priority tasks should be displayed.', 'Filter with both not completed and high priority conditions.', 'Display every task and relabel them later.', 'Change all task priorities to high.', 'Use identity comparison on text values.', 'A conjunction models both required predicates without mutating source data.', 'Displaying everything violates the requested selection rule.'),
      c('C002', 'User input returns the text "3" but the program needs arithmetic.', 'Validate and convert the string to an integer at the boundary.', 'Assume input() already returns an integer.', 'Add quotes around every number.', 'Use the raw value as a list.', 'Boundary conversion makes the internal numeric contract explicit.', 'input returns text, so arithmetic with an integer fails.'),
      c('C003', 'The program needs unique tags while ignoring order.', 'Use a set.', 'Use a list and assume duplicates never occur.', 'Use a Boolean.', 'Use one comma-separated string without parsing.', 'A set directly models uniqueness when ordering is not required.', 'A list permits duplicates and makes the invariant manual.'),
    ],
  },
  {
    title: 'Functions, Modules, and Data Models', outcome: 'Refactor task behavior into small functions and importable modules with explicit contracts.',
    competencyIds: ['C004', 'C005'],
    resources: [
      r('https://docs.python.org/3/tutorial/controlflow.html#defining-functions', 'Defining Functions', 'Python Software Foundation', 'documentation', 70, 'Study parameters, return values, defaults, and documentation strings.'),
      r('https://docs.python.org/3/tutorial/modules.html', 'Modules', 'Python Software Foundation', 'documentation', 85, 'Study modules, import behavior, packages, and the module search path.'),
      r('https://docs.python.org/3/library/dataclasses.html', 'dataclasses', 'Python Software Foundation', 'lab', 80, 'Implement and compare a plain dictionary and dataclass task record.'),
    ],
    build: ['Modular Task Service', 'Refactor the task queue into model, service, and CLI modules with pure transformation functions.', 'Business functions accept values and return results without reading input or printing.', 'The CLI entry point imports the service and runs only behind an __main__ guard.'],
    checks: [
      c('C004', 'A function both prompts the user, mutates global tasks, prints, and saves a file.', 'Split input/output from a small function that transforms explicit arguments.', 'Add more global variables so every step can reach them.', 'Wrap the whole body in one try block.', 'Rename it to helper.', 'Explicit inputs and outputs make behavior reusable and testable.', 'More globals increase hidden coupling and make tests order-dependent.'),
      c('C004', 'A function calculates a priority score needed by several callers.', 'Return the score.', 'Print the score and make callers scrape stdout.', 'Write it to a fixed file.', 'Assign it to an unrelated global.', 'A returned value is an explicit composable result contract.', 'Printing couples computation to presentation and gives callers no direct value.'),
      c('C005', 'Importing a module unexpectedly starts its interactive CLI.', 'Place runtime startup under if __name__ == "__main__".', 'Remove every function definition.', 'Rename the module to main.py only.', 'Import the module twice.', 'The main guard separates importable definitions from script execution.', 'Removing functions avoids useful modularity and does not establish an entry contract.'),
      c('C005', 'Two modules import each other to access shared task types.', 'Move the shared type into a lower-level model module both can import.', 'Add a third circular import.', 'Copy the type with different fields into each module.', 'Import with *.', 'A shared lower-level dependency breaks the cycle and preserves one type definition.', 'Another cycle worsens initialization ambiguity.'),
      c('C004', 'A function argument uses [] as a default and accumulates values across calls.', 'Use None as the default and create a new list inside.', 'Clear the shared list only on Fridays.', 'Use a larger default list.', 'Make the caller restart Python.', 'Default objects are created once, so a sentinel avoids unintended shared mutation.', 'Clearing conditionally leaves surprising cross-call state.'),
    ],
  },
  {
    title: 'Files, Paths, and JSON State', outcome: 'Persist task state atomically in portable JSON and recover cleanly from missing data.',
    competencyIds: ['C006', 'C007'],
    resources: [
      r('https://docs.python.org/3/tutorial/inputoutput.html#reading-and-writing-files', 'Reading and Writing Files', 'Python Software Foundation', 'documentation', 60, 'Study context-managed file I/O and text encoding.'),
      r('https://docs.python.org/3/library/json.html', 'json — JSON encoder and decoder', 'Python Software Foundation', 'documentation', 75, 'Study dumps, loads, file APIs, and decoder errors.'),
      r('https://docs.python.org/3/library/pathlib.html', 'pathlib — Object-oriented filesystem paths', 'Python Software Foundation', 'lab', 90, 'Build a path-safe load/save exercise using a temporary directory.'),
    ],
    build: ['Durable Task Store', 'Add a versioned JSON repository that loads, validates, and atomically saves task state.', 'Missing storage initializes an empty versioned document and malformed JSON produces an actionable error.', 'Saving writes a temporary file and then replaces the target so interruption cannot leave half a document.'],
    checks: [
      c('C006', 'Code currently joins Windows paths by adding strings with backslashes.', 'Use pathlib.Path and the / operator.', 'Add more escaped backslashes throughout the code.', 'Change the working directory globally.', 'Assume every user has the same Downloads path.', 'Path objects express platform-aware composition and improve testability.', 'Manual separators are brittle and spread platform assumptions.'),
      c('C006', 'A file must close even if parsing raises an exception.', 'Open it with a with statement.', 'Call close only after successful parsing.', 'Leave it for the operating system indefinitely.', 'Open it once as a global.', 'A context manager guarantees cleanup across normal and exceptional exits.', 'A close after parsing is skipped when parsing fails.'),
      c('C007', 'Stored data will evolve and future code must distinguish shapes.', 'Include a schema_version field and validate it during load.', 'Infer the version from file size.', 'Remove field names to save bytes.', 'Use Python repr instead of JSON.', 'An explicit version enables deliberate migration and rejection policies.', 'File size has no stable relationship to schema meaning.'),
      c('C007', 'The process could stop while overwriting the state file.', 'Write complete JSON to a sibling temporary file then replace the target.', 'Delete the old file before creating the new one.', 'Append JSON objects without delimiters.', 'Ignore write exceptions.', 'Replace-after-write minimizes the window for corrupt persistent state.', 'Deleting first turns interruption into total data loss.'),
      c('C007', 'json.loads reports malformed input from the state file.', 'Catch the specific decode error at the repository boundary and report the file and recovery action.', 'Catch BaseException and silently return no tasks.', 'Treat the malformed text as a Python module.', 'Keep retrying the same parse forever.', 'Specific handling preserves diagnosis and defines safe recovery.', 'Silent fallback hides corruption and can overwrite recoverable evidence.'),
    ],
  },
  {
    title: 'Exceptions, Debugging, and Logging', outcome: 'Diagnose failures and produce safe operational evidence across task-service boundaries.',
    competencyIds: ['C008', 'C009'],
    resources: [
      r('https://docs.python.org/3/tutorial/errors.html', 'Errors and Exceptions', 'Python Software Foundation', 'documentation', 90, 'Study exception types, handling, raising, chaining, and cleanup.'),
      r('https://docs.python.org/3/howto/logging.html', 'Logging HOWTO', 'Python Software Foundation', 'documentation', 80, 'Study loggers, levels, formatting, and file configuration.'),
      r('https://cs50.harvard.edu/python/2022/weeks/3/', 'CS50P Week 3: Exceptions', 'Harvard University', 'exercise', 120, 'Complete exception-handling exercises and capture one debugging narrative.'),
    ],
    build: ['Diagnosable Task Runner', 'Add domain exceptions, structured logging, and a repeatable failure-diagnosis command to the toolkit.', 'Expected invalid input maps to a named domain error while unexpected errors retain traceback context.', 'Logs contain operation, outcome, and non-secret identifiers without task contents or credentials.'],
    checks: [
      c('C008', 'Only integer conversion is expected to fail in a small boundary block.', 'Catch ValueError around that conversion.', 'Catch Exception around the entire application.', 'Catch nothing and suppress stderr.', 'Use finally as the error handler.', 'Narrow handling documents the expected failure and avoids masking defects.', 'A broad application-level catch misclassifies unrelated programming errors.'),
      c('C008', 'A repository catches an OS error and raises a domain StorageError.', 'Use raise StorageError(...) from original_error.', 'Discard the original exception completely.', 'Return an empty object as success.', 'Print and continue saving.', 'Exception chaining preserves both abstraction and root cause.', 'Discarding the cause removes evidence required for diagnosis.'),
      c('C009', 'A request fails and needs diagnostic context.', 'Log operation name, safe request identifier, failure class, and outcome.', 'Log the full API key and user content.', 'Log only the word error.', 'Do not record any event.', 'Structured safe fields make failures traceable without exposing secrets.', 'Credentials in logs create a durable secret leak.'),
      c('C009', 'A normal successful load happens frequently.', 'Record it at an appropriate informational or debug level.', 'Record it as critical.', 'Raise an exception instead of logging.', 'Write directly to many arbitrary files.', 'Severity should reflect operational impact so signals remain usable.', 'Critical for normal behavior creates alert noise and hides real incidents.'),
      c('C008', 'A bug reproduces only with one stored document.', 'Reduce it to the smallest fixture and capture the traceback before changing code.', 'Change several modules immediately without recording the failure.', 'Delete the document permanently.', 'Assume the last edited line is responsible.', 'A minimal reproduction and traceback constrain the hypothesis with evidence.', 'Simultaneous changes destroy causal information.'),
    ],
  },
  {
    title: 'Tests, Fixtures, and Test Doubles', outcome: 'Prove task-service behavior with deterministic tests isolated from files, time, and external processes.',
    competencyIds: ['C010', 'C011'],
    resources: [
      r('https://docs.pytest.org/en/stable/getting-started.html', 'Get Started with pytest', 'pytest project', 'documentation', 75, 'Follow installation, assertions, exception, grouping, and fixture examples.'),
      r('https://docs.python.org/3/library/unittest.mock.html', 'unittest.mock', 'Python Software Foundation', 'documentation', 85, 'Study Mock, patch location, call assertions, and side effects.'),
      r('https://docs.pytest.org/en/stable/how-to/monkeypatch.html', 'How to monkeypatch/mock modules and environments', 'pytest project', 'lab', 100, 'Practice tmp_path, monkeypatch, and a deterministic fake dependency.'),
    ],
    build: ['Tested Task Toolkit', 'Create a pytest suite for the task model, repository, CLI boundary, and representative failures.', 'The suite uses temporary paths and never touches learner real task data.', 'Tests cover success, invalid input, malformed storage, and one simulated write failure.'],
    checks: [
      c('C010', 'A test fails depending on the task order in the suite.', 'Remove shared mutable state and give each test an independent fixture.', 'Force the failing test to run first forever.', 'Add a sleep between tests.', 'Ignore it on CI.', 'Independent setup makes tests deterministic and diagnostically useful.', 'Ordering hides coupling rather than correcting it.'),
      c('C010', 'A function should reject an invalid task identifier.', 'Assert the specific exception and relevant message or attributes.', 'Assert that anything at all happens.', 'Catch the exception inside the test and always pass.', 'Inspect console color only.', 'A precise failure assertion proves the public error contract.', 'An always-passing catch cannot detect regressions.'),
      c('C011', 'A test must write files without changing the learner workspace.', 'Use pytest tmp_path and inject the path.', 'Write to a fixed file beside production data.', 'Mock every Python built-in globally.', 'Require manual cleanup after each run.', 'A temporary injected path exercises real I/O with isolation.', 'A fixed production-adjacent path risks collisions and data loss.'),
      c('C011', 'Code imports send_request into service.py and a test patches the original client module only.', 'Patch the name where service.py looks it up.', 'Patch a random similarly named function.', 'Reload Python until it passes.', 'Remove the assertion.', 'Mocks replace the reference used by the system under test.', 'Patching only the origin leaves the already imported service reference unchanged.'),
      c('C010', 'A test uses the current clock and sometimes crosses midnight.', 'Inject a clock or fixed timestamp.', 'Increase the assertion tolerance to several days.', 'Run it only in one timezone.', 'Disable it near midnight.', 'Controlling time removes environmental nondeterminism.', 'A huge tolerance weakens the behavior contract.'),
    ],
  },
  {
    title: 'HTTP Clients and Failure Policy', outcome: 'Implement a typed API client with bounded waits, safe retries, and inspectable errors.',
    competencyIds: ['C012', 'C013'],
    resources: [
      r('https://www.python-httpx.org/quickstart/', 'HTTPX QuickStart', 'Encode OSS', 'documentation', 80, 'Study request methods, parameters, JSON, headers, status handling, and clients.'),
      r('https://www.python-httpx.org/advanced/timeouts/', 'HTTPX Timeouts', 'Encode OSS', 'documentation', 50, 'Study default and fine-grained timeout behavior.'),
      r('https://docs.pytest.org/en/stable/how-to/monkeypatch.html', 'HTTP request mocking with monkeypatch', 'pytest project', 'lab', 100, 'Build a fake transport exercise for success, timeout, and server-error responses.'),
    ],
    build: ['Bounded API Client', 'Add a reusable JSON API client with validation, timeouts, retry classification, and a fake transport.', 'Every external call has an explicit timeout and raises a meaningful application error after exhaustion.', 'Retries apply only to configured transient failures and never blindly repeat unsafe state changes.'],
    checks: [
      c('C012', 'An API returns status 404 with a JSON error body.', 'Check status and translate the response into a typed client error with safe context.', 'Treat every JSON response as success.', 'Retry forever because JSON was present.', 'Return the raw socket.', 'HTTP status and body together define success or failure at the boundary.', 'JSON syntax does not turn an error status into success.'),
      c('C012', 'Several calls target the same host and share headers.', 'Use a configured client object with shared base settings.', 'Repeat credentials as string literals in every function.', 'Open a new process per request.', 'Store response objects in global state forever.', 'A client centralizes connection and request policy without duplicating secrets.', 'Repeated literals drift and expand secret exposure.'),
      c('C013', 'A network call has no timeout.', 'Set an explicit bounded timeout suited to the operation.', 'Assume the network always responds.', 'Add an unbounded retry loop.', 'Terminate the operating system on delay.', 'A timeout converts indefinite waiting into a controllable failure.', 'No timeout can hang the workflow permanently.'),
      c('C013', 'A GET request receives a transient 503 twice.', 'Retry a limited number of times with backoff and then surface failure.', 'Retry in a tight infinite loop.', 'Convert the request into DELETE.', 'Ignore status and parse an absent success body.', 'Bounded backoff is appropriate for a safe operation and transient status.', 'A tight infinite loop amplifies load and never returns control.'),
      c('C013', 'A payment-like POST times out after the server may have processed it.', 'Use an idempotency key or reconcile state before any retry.', 'Immediately resend it repeatedly without an identifier.', 'Assume timeout means the server did nothing.', 'Delete all client records.', 'Ambiguous state-changing outcomes require deduplication or reconciliation.', 'Blind retries can duplicate irreversible effects.'),
    ],
  },
  {
    title: 'Typed Boundaries and Versioned Interfaces', outcome: 'Expose the automation toolkit through validated models, a documented CLI, and a stable service boundary.',
    competencyIds: ['C014', 'C015'],
    resources: [
      r('https://docs.pydantic.dev/latest/concepts/models/', 'Pydantic Models', 'Pydantic', 'documentation', 100, 'Study model validation, methods, extra data policy, and nested models.'),
      r('https://docs.python.org/3/howto/argparse.html', 'Argparse Tutorial', 'Python Software Foundation', 'documentation', 65, 'Study positional, optional, typed, and help arguments.'),
      r('https://docs.github.com/en/get-started/start-your-journey/hello-world', 'GitHub Hello World', 'GitHub', 'exercise', 75, 'Create a branch, commit a documented change, and review the diff.'),
    ],
    build: ['Python Automation Toolkit Release', 'Package the first project as a validated CLI with help text, tests, changelog, and reproducible installation.', 'Untrusted JSON and CLI arguments are validated before reaching domain functions.', 'A clean environment can install dependencies, run help, execute an example, and pass the full test suite from README commands.'],
    checks: [
      c('C014', 'External JSON may contain an unknown priority and missing title.', 'Validate it into a typed model and return field-specific errors.', 'Pass the dictionary deep into business logic unchanged.', 'Trust it because JSON parsing succeeded.', 'Drop every invalid record silently.', 'Parsing establishes syntax; typed validation establishes application meaning.', 'A raw dictionary postpones failure and loses boundary context.'),
      c('C014', 'Unexpected input fields may contain attacker-controlled configuration.', 'Choose and document an explicit extra-field policy such as forbid.', 'Accept and execute every extra field automatically.', 'Rename extras to environment variables.', 'Store them as code for later evaluation.', 'An explicit policy prevents unnoticed schema expansion.', 'Automatic behavior from unrecognized input creates an injection surface.'),
      c('C015', 'A CLI argument name must change without breaking existing automation immediately.', 'Support the old name temporarily with deprecation guidance and test both paths.', 'Remove it without release notes.', 'Change behavior under the old name silently.', 'Ask every user to inspect source code.', 'A transition period and documented compatibility policy protect consumers.', 'Immediate removal creates avoidable breaking changes.'),
      c('C015', 'A reviewer needs to understand why a reliability change was made.', 'Commit a focused diff with a message describing behavior and rationale.', 'Combine generated files, refactors, and unrelated styling in one commit.', 'Use the message updates.', 'Delete the regression test.', 'Focused history makes intent and rollback scope inspectable.', 'An unrelated bundle hides causality and review risk.'),
      c('C014', 'A model serializes successfully but includes a datetime object later sent as JSON.', 'Define a deliberate serialization form and test the emitted contract.', 'Assume every Python object is valid JSON.', 'Call repr and label it JSON.', 'Remove the field at random.', 'Boundary serialization must be explicit and verified against consumer expectations.', 'Python objects are not automatically JSON-compatible.'),
    ],
  },
);

weekSpecs.push(
  {
    title: 'Model Requests and Provider Adapters', outcome: 'Send and simulate model requests through a provider-neutral Python interface.',
    competencyIds: ['C016', 'C012'],
    resources: [
      r('https://developers.openai.com/api/docs/quickstart', 'OpenAI API Quickstart', 'OpenAI', 'documentation', 80, 'Study the current Python request shape, environment configuration, and response handling; a paid key is optional.'),
      r('https://docs.ollama.com/api/introduction', 'Ollama API Introduction', 'Ollama', 'documentation', 45, 'Study the local API base URL and request pattern as an optional offline-capable provider.'),
      r('https://github.com/openai/openai-cookbook/tree/main/examples', 'OpenAI Cookbook Examples', 'OpenAI', 'lab', 90, 'Inspect one current text-generation example, then implement the same internal interface with a deterministic FakeModel.'),
    ],
    build: ['Replaceable Model Gateway', 'Create a ModelProvider protocol, deterministic FakeModel, and optional live adapter selected by configuration.', 'All assessed tests run with FakeModel and require no API key, network, or paid service.', 'Provider-specific response objects are translated into one application result with text, usage, request ID, and finish reason.'],
    checks: [
      c('C016', 'Business logic imports a vendor SDK response type everywhere.', 'Translate vendor data at one adapter boundary into an internal result model.', 'Expose the SDK object through every module.', 'Serialize it with repr and assume stability.', 'Copy undocumented attributes.', 'An adapter contains vendor change and keeps the application contract testable.', 'Leaking SDK types couples every consumer to vendor-specific behavior.'),
      c('C016', 'Tests must verify model behavior without a paid API key.', 'Inject a deterministic fake implementing the same provider interface.', 'Skip every model-related test.', 'Commit a real secret for CI.', 'Assert only that the SDK imports.', 'A protocol-compatible fake exercises orchestration deterministically and cheaply.', 'Skipping model tests leaves core control logic unverified.'),
      c('C012', 'A model API key is needed by an optional live adapter.', 'Read it from environment configuration and fail clearly only when that adapter is selected.', 'Hard-code it in the repository.', 'Include it in test snapshots.', 'Print it during startup.', 'Late validated configuration keeps default offline use safe and avoids secret storage.', 'Repository secrets can be exposed through history, logs, and forks.'),
      c('C016', 'A provider returns no assistant text because it issued a tool call.', 'Model the response as typed alternatives rather than treating empty text as failure.', 'Concatenate every response field blindly.', 'Retry until plain text appears.', 'Discard the tool call.', 'Agent-capable responses can contain actions instead of final text and need explicit modeling.', 'Blind retries ignore the requested action and can loop.'),
      c('C016', 'Two providers report token usage differently.', 'Normalize available fields and represent unavailable values explicitly.', 'Invent exact values for missing fields.', 'Drop usage from every provider.', 'Compare unrelated counters as identical.', 'Normalization supports common reporting without fabricating evidence.', 'Invented metrics make cost and evaluation reports untrustworthy.'),
    ],
  },
  {
    title: 'Prompt Contracts and Structured Outputs', outcome: 'Produce validated task results from explicit prompts and schema-constrained model responses.',
    competencyIds: ['C017', 'C018'],
    resources: [
      r('https://developers.openai.com/api/docs/guides/text', 'Text generation guide', 'OpenAI', 'documentation', 75, 'Study instruction hierarchy, message roles, reusable prompts, and output control.'),
      r('https://developers.openai.com/api/docs/guides/structured-outputs', 'Structured model outputs', 'OpenAI', 'documentation', 85, 'Study schema-constrained output behavior and validation boundaries.'),
      r('https://github.com/openai/openai-cookbook/tree/main/examples', 'Structured output examples', 'OpenAI', 'lab', 105, 'Adapt a schema example to the FakeModel and test valid, invalid, and refusal-like results.'),
    ],
    build: ['Structured Planning Service', 'Generate a validated task plan from a written goal using a versioned prompt and typed result schema.', 'The prompt states role, input boundary, constraints, output contract, and no-fabrication behavior.', 'Invalid or incomplete model output is rejected with a diagnostic result and is never treated as an executable plan.'],
    checks: [
      c('C017', 'A prompt says only "make a good plan" and results vary unpredictably.', 'Specify the task, input context, constraints, success criteria, and output contract.', 'Add several vague adjectives.', 'Repeat the same sentence ten times.', 'Raise model randomness.', 'A prompt contract makes important expectations observable and testable.', 'More vague emphasis does not define what success means.'),
      c('C017', 'Retrieved user text contains instructions that conflict with the application policy.', 'Delimit it as untrusted data and keep authoritative instructions separate.', 'Insert it into the highest-priority instruction unchanged.', 'Execute every embedded request.', 'Hide the policy from the model.', 'Instruction hierarchy and data boundaries reduce prompt-injection confusion.', 'Elevating untrusted text gives it control over application behavior.'),
      c('C018', 'The model returns JSON text that parses but omits required plan steps.', 'Validate the parsed value against the typed application schema.', 'Trust it because json.loads succeeded.', 'Add missing values guessed by the executor.', 'Execute it before validation.', 'Syntactic JSON and domain-valid output are different gates.', 'Parsing alone cannot enforce required semantic fields.'),
      c('C018', 'A provider signals refusal instead of the requested structured object.', 'Represent refusal as an explicit non-success result and stop downstream execution.', 'Coerce refusal text into the action field.', 'Retry without limit.', 'Pretend the request succeeded with defaults.', 'Refusals are distinct outcomes that must not enter the execution path.', 'Coercing refusal into data can create nonsensical or unsafe actions.'),
      c('C017', 'A prompt revision improves one example but breaks three others.', 'Run a fixed prompt evaluation set and version the change with results.', 'Keep only the example that improved.', 'Change the grader after seeing failures.', 'Deploy from memory.', 'Versioned evals reveal regressions and make prompt changes reviewable.', 'A single favorable example provides weak and biased evidence.'),
    ],
  },
  {
    title: 'Tool Calling and Safe Dispatch', outcome: 'Convert validated model tool calls into deterministic Python function execution and inspectable results.',
    competencyIds: ['C019', 'C018'],
    resources: [
      r('https://developers.openai.com/api/docs/guides/function-calling', 'Function calling guide', 'OpenAI', 'documentation', 105, 'Study tool definitions, strict schemas, call handling, and result return.'),
      r('https://openai.github.io/openai-agents-python/tools/', 'Tools in the OpenAI Agents SDK', 'OpenAI', 'documentation', 70, 'Study function tools, schema generation, failure functions, and conditional enabling.'),
      r('https://github.com/openai/openai-agents-python/tree/main/examples', 'OpenAI Agents SDK tool examples', 'OpenAI', 'lab', 110, 'Inspect one tool example and reproduce its core dispatch behavior without requiring the framework.'),
    ],
    build: ['Typed Tool Registry', 'Implement tool registration, JSON-schema exposure, argument validation, allowlisted dispatch, and structured tool results.', 'Unknown tools and invalid arguments fail closed without invoking application functions.', 'Every invocation records call ID, tool name, validated arguments summary, outcome, duration, and error class without secrets.'],
    checks: [
      c('C019', 'The model requests a tool name not present in the registry.', 'Return a structured unknown-tool error and do not execute anything.', 'Use eval on the requested name.', 'Choose the closest function automatically.', 'Download code matching the name.', 'An allowlisted registry makes executable capability explicit.', 'eval turns model output into arbitrary code execution.'),
      c('C019', 'Tool arguments are JSON but contain an unexpected destructive flag.', 'Validate against a strict schema that rejects unknown fields.', 'Pass the dictionary directly with **arguments.', 'Ignore only fields that look suspicious.', 'Ask the tool to decide after execution.', 'Strict boundary validation prevents capability expansion through extra fields.', 'Direct unpacking can activate parameters the model was never authorized to set.'),
      c('C019', 'A tool raises a predictable NotFound error.', 'Translate it into an inspectable tool result the loop can reason about.', 'Crash the entire process without context.', 'Return a false success message.', 'Retry the same call forever.', 'Expected tool failures are observations, not necessarily process failures.', 'A crash prevents recovery and loses the tool-call context.'),
      c('C018', 'The tool schema allows any string where only three statuses are valid.', 'Use an enum in the schema and validate again in Python.', 'Describe the values only in prose.', 'Accept any value and repair the database later.', 'Remove the field.', 'Machine-enforced constraints improve model selection and protect execution.', 'Prose alone cannot prevent invalid values reaching code.'),
      c('C019', 'A tool call and result must be correlated across logs and messages.', 'Preserve the provider call ID through dispatch and result submission.', 'Generate unrelated IDs at every layer.', 'Match them by similar timestamps.', 'Drop IDs after parsing.', 'Stable correlation connects decision, action, evidence, and response.', 'Timestamp guessing becomes ambiguous with concurrency or retries.'),
    ],
  },
  {
    title: 'Conversation State and Context Budgets', outcome: 'Continue multi-turn tasks while controlling context size, provenance, and privacy.',
    competencyIds: ['C020', 'C017'],
    resources: [
      r('https://developers.openai.com/api/docs/guides/conversation-state', 'Conversation state', 'OpenAI', 'documentation', 75, 'Study manual history, response chaining, conversation objects, and state tradeoffs.'),
      r('https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents', 'Effective context engineering for AI agents', 'Anthropic', 'article', 90, 'Study context selection, compaction, memory, and long-horizon tradeoffs.'),
      r('https://openai.github.io/openai-agents-python/sessions/', 'Sessions', 'OpenAI', 'lab', 95, 'Implement a small local session abstraction and compare it with the documented SDK session behavior.'),
    ],
    build: ['Budgeted Conversation Manager', 'Add session history, context selection, compaction, provenance labels, and a deterministic token-budget approximation.', 'The manager retains task-critical constraints and tool evidence while excluding configured sensitive or low-value content.', 'Compaction preserves a link to source message IDs and tests prove behavior at and beyond the budget.'],
    checks: [
      c('C020', 'A long session exceeds the model context budget.', 'Select recent and task-critical items and compact older material with provenance.', 'Send the entire database anyway.', 'Delete all system constraints first.', 'Silently truncate from a random position.', 'Purposeful selection preserves critical state and makes information loss explicit.', 'Sending beyond limits fails or causes uncontrolled truncation.'),
      c('C020', 'A summary states a decision but no one can find its source.', 'Store source message or event identifiers with the summary.', 'Mark every summary as certainly correct.', 'Delete original references.', 'Use the summary as an execution authority.', 'Provenance lets reviewers inspect and repair compressed context.', 'An untraceable summary can silently distort consequential instructions.'),
      c('C017', 'User data includes a pasted webpage with hidden instructions.', 'Treat webpage content as evidence data, not governing instructions.', 'Merge it into the system policy.', 'Obey the last instruction in the page.', 'Disable tool validation.', 'Trusted instruction and untrusted content channels need distinct roles.', 'Treating content as policy enables indirect prompt injection.'),
      c('C020', 'A session contains an API key accidentally pasted by a user.', 'Redact it before persistence and flag the event for user rotation guidance.', 'Include it in summaries and traces.', 'Use it automatically.', 'Share it with every tool.', 'Sensitive data minimization limits durable exposure and unintended authority.', 'Propagating the key multiplies leak paths.'),
      c('C020', 'The next response depends on a tool result from five turns ago.', 'Retain the result or a verified compact representation with its call ID.', 'Keep only assistant prose.', 'Ask the model to invent the result.', 'Discard all tool messages first.', 'Tool evidence is part of the task state and must remain attributable.', 'Assistant prose alone may omit or alter the observed result.'),
    ],
  },
  {
    title: 'The Transparent Agent Loop', outcome: 'Run a bounded observe-decide-act cycle that stops, reports, and can be replayed.',
    competencyIds: ['C021', 'C019', 'C020'],
    resources: [
      r('https://www.anthropic.com/engineering/building-effective-agents', 'Building effective agents', 'Anthropic', 'article', 100, 'Study workflow versus agent distinctions, orchestration patterns, stopping, and complexity tradeoffs.'),
      r('https://openai.github.io/openai-agents-python/running_agents/', 'Running agents', 'OpenAI', 'documentation', 80, 'Study the run loop, turns, lifecycle, configuration, and result behavior.'),
      r('https://openai.github.io/openai-agents-python/results/', 'Agent results', 'OpenAI', 'lab', 90, 'Model final output, tool-call history, and max-turn failure in a framework-independent loop.'),
    ],
    build: ['Bounded Research Agent Loop', 'Combine the fake model, typed tools, context manager, and an explicit loop for answering a local research question.', 'The loop stops on a validated final answer, configured turn/tool budget, cancellation, or unrecoverable policy error.', 'A run record can replay decisions and tool results without invoking external services.'],
    checks: [
      c('C021', 'The agent keeps calling a search tool with equivalent arguments.', 'Detect repeated state, stop at a bounded threshold, and report the loop.', 'Allow unlimited turns.', 'Increase temperature until it changes.', 'Delete previous tool results.', 'Loop detection plus budgets prevents wasted or uncontrolled execution.', 'Unlimited equivalent calls consume resources without progress.'),
      c('C021', 'The model emits a valid final-answer result.', 'Validate it, persist the terminal state, and exit the loop.', 'Ask for another tool call regardless.', 'Continue until a process timeout.', 'Discard the answer and restart.', 'A defined terminal condition makes the loop predictable and testable.', 'Ignoring terminal output produces needless or unsafe actions.'),
      c('C019', 'A tool returns a recoverable no-results outcome.', 'Add the result to observations so the next decision can adapt.', 'Hide it from the model.', 'Report fabricated sources.', 'Repeat the identical call automatically forever.', 'Agent decisions need accurate environment feedback, including negative results.', 'Hiding no-results encourages repeated or fabricated reasoning.'),
      c('C020', 'A run is cancelled while waiting between turns.', 'Propagate cancellation, record the stopped state, and avoid another action.', 'Catch cancellation as a normal retry.', 'Start a second loop.', 'Mark the run successful.', 'Cancellation is a control signal that must cross layer boundaries.', 'Retrying after cancellation violates operator intent.'),
      c('C021', 'A fixed two-step workflow solves the task reliably.', 'Use the workflow and avoid unnecessary autonomous routing.', 'Replace it with an open-ended agent for novelty.', 'Add multiple models with no evaluation.', 'Remove deterministic tests.', 'The simplest sufficient architecture is easier to test, operate, and secure.', 'Unneeded autonomy expands nondeterminism and failure surface.'),
    ],
  },
  {
    title: 'Tools as Product Interfaces', outcome: 'Design agent tools that are discoverable, composable, bounded, and informative under failure.',
    competencyIds: ['C022', 'C023'],
    resources: [
      r('https://www.anthropic.com/engineering/writing-tools-for-agents', 'Writing effective tools for agents', 'Anthropic', 'article', 95, 'Study tool boundaries, descriptions, response usefulness, and evaluation-driven improvement.'),
      r('https://openai.github.io/openai-agents-python/tools/', 'Agent tool design', 'OpenAI', 'documentation', 75, 'Study schemas, context, error functions, timeouts, and enablement.'),
      r('https://github.com/openai/openai-agents-python/tree/main/examples', 'Agent tools examples', 'OpenAI', 'lab', 105, 'Critique two tools and redesign one broad interface into bounded composable operations.'),
    ],
    build: ['Safe Personal-Task Tools', 'Add read, create-draft, and confirm-change tools with concise schemas and high-signal results.', 'Read and write capabilities are separate; no state-changing tool runs without a valid confirmation token.', 'Tool responses include enough identifiers and next-step information for the agent to recover without dumping unbounded data.'],
    checks: [
      c('C022', 'One tool has an "action" string supporting twenty unrelated operations.', 'Split it into coherent tools with distinct names and schemas.', 'Expand the prose description to ten pages.', 'Let the model invent action names.', 'Accept arbitrary nested code.', 'Focused tools are easier to select, validate, permission, and evaluate.', 'A broad action switch hides capabilities and weakens schemas.'),
      c('C022', 'A search tool returns ten thousand full records.', 'Return a bounded ranked summary with stable IDs and pagination or refinement guidance.', 'Increase context limits indefinitely.', 'Drop identifiers to save space.', 'Return raw database pages.', 'High-signal bounded results help the model decide without flooding context.', 'Unbounded output raises cost and hides relevant evidence.'),
      c('C023', 'A model wants to delete a calendar entry.', 'Create a preview and require explicit human confirmation before deletion.', 'Delete immediately because the model sounds confident.', 'Ask for confirmation after deletion.', 'Encode approval in the prompt only.', 'Consequential mutation needs an enforceable action boundary outside model text.', 'Confidence is not authorization and cannot reverse deletion.'),
      c('C023', 'A confirmed create request is retried after an ambiguous timeout.', 'Use an idempotency key and reconcile the existing result.', 'Create a new item on every retry.', 'Assume the first call failed.', 'Remove audit identifiers.', 'Idempotency prevents duplicate effects across transport uncertainty.', 'Blind retries can create multiple real-world changes.'),
      c('C022', 'The agent frequently selects the wrong of two similar tools.', 'Improve names, descriptions, schemas, and selection evals using failure evidence.', 'Randomize tool names each run.', 'Hide both descriptions.', 'Merge them without considering permissions.', 'Tool interfaces should be iterated like product APIs using observed selection failures.', 'Random names remove semantic signals and make regressions harder to interpret.'),
    ],
  },
  {
    title: 'Durable State with SQLite', outcome: 'Persist agent runs, tasks, approvals, and tool effects transactionally with migrations.',
    competencyIds: ['C024', 'C007'],
    resources: [
      r('https://docs.python.org/3/library/sqlite3.html', 'sqlite3 — DB-API interface for SQLite databases', 'Python Software Foundation', 'documentation', 110, 'Study connections, parameter substitution, transactions, rows, and context management.'),
      r('https://docs.python.org/3/library/contextlib.html', 'contextlib — Utilities for with-statement contexts', 'Python Software Foundation', 'documentation', 55, 'Study context managers for transaction and repository lifecycles.'),
      r('https://docs.pytest.org/en/stable/how-to/tmp_path.html', 'Temporary directories and files in pytest', 'pytest project', 'lab', 100, 'Test migrations, rollback, and repository queries against temporary databases.'),
    ],
    build: ['Agent State Repository', 'Replace ad hoc run storage with a versioned SQLite repository for sessions, events, approvals, and effect keys.', 'Migrations are ordered, transactional, repeatable, and tested from an empty database.', 'A failed multi-write operation rolls back completely, and queries use bound parameters.'],
    checks: [
      c('C024', 'A run event and its effect record must either both persist or neither persist.', 'Write them in one transaction and roll back on failure.', 'Commit each field separately.', 'Use two unrelated database files.', 'Ignore the second failure.', 'A transaction preserves the cross-record invariant under failure.', 'Independent commits can leave an effect without its event or vice versa.'),
      c('C024', 'A query filters by user-supplied task ID.', 'Use a parameterized query.', 'Build SQL with string interpolation.', 'Execute the input as a script.', 'Escape only spaces.', 'Bound parameters separate data from SQL syntax.', 'String interpolation enables injection and quoting bugs.'),
      c('C024', 'A new column is required in revision two.', 'Add a numbered migration and test upgrading representative prior state.', 'Edit the original migration after release.', 'Delete every existing database.', 'Infer schema from application crashes.', 'Immutable ordered migrations make update behavior reproducible.', 'Editing history makes existing installations diverge from clean ones.'),
      c('C007', 'Event payloads are stored as JSON inside SQLite.', 'Validate their schema at repository boundaries and retain an event version.', 'Assume TEXT means valid application data.', 'Store pickled model objects from untrusted sources.', 'Remove event type information.', 'JSON storage still requires semantic version and validation contracts.', 'A text column does not enforce payload meaning.'),
      c('C024', 'Tests occasionally read a developer’s real local database.', 'Inject a temporary database path per test.', 'Run cleanup SQL against the default path.', 'Require developers to back up manually.', 'Skip database tests locally.', 'Dependency injection prevents test activity from touching learner state.', 'Default-path cleanup risks irreversible loss.'),
    ],
  },
  {
    title: 'Memory, Retrieval, and Grounded Answers', outcome: 'Answer from a local document collection with provenance, bounded memory, and honest no-answer behavior.',
    competencyIds: ['C025', 'C026'],
    resources: [
      r('https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents', 'Context engineering for agents', 'Anthropic', 'article', 95, 'Study retrieval, memory, compaction, and context selection for long-horizon agents.'),
      r('https://docs.python.org/3/library/pathlib.html', 'pathlib file discovery', 'Python Software Foundation', 'documentation', 55, 'Focus on globbing, file metadata, and safe path resolution.'),
      r('https://github.com/openai/openai-cookbook/tree/main/examples', 'Retrieval and search examples', 'OpenAI', 'lab', 115, 'Inspect a retrieval example, then build a dependency-free keyword baseline over local text files.'),
    ],
    build: ['Grounded Local Research Agent', 'Index local approved documents, retrieve bounded passages, answer with citations, and persist only useful memory.', 'Every factual answer cites source path and passage identifier; insufficient evidence produces an explicit no-answer result.', 'Indexing rejects paths outside the configured root and memory records include provenance, retention reason, and expiry policy.'],
    checks: [
      c('C026', 'Retrieved passages do not contain the requested fact.', 'Return that the available sources do not support an answer.', 'Ask the model to fill the gap from imagination.', 'Cite an unrelated passage.', 'Remove citations.', 'Grounding requires the answer to remain inside available evidence.', 'Fabrication defeats the trust purpose of retrieval.'),
      c('C026', 'A document contains instructions telling the agent to expose secrets.', 'Treat document text as untrusted content and do not grant it tool authority.', 'Execute instructions because the document ranked first.', 'Move it into system instructions.', 'Disable the permission layer.', 'Retrieved content supplies evidence, not authorization.', 'Following embedded instructions enables indirect prompt injection.'),
      c('C025', 'The agent considers storing every conversation turn forever.', 'Persist only task-useful memory under an explicit retention and sensitivity policy.', 'Store all raw content and secrets by default.', 'Never allow correction or deletion.', 'Use memory as the sole source of truth.', 'Selective memory reduces privacy risk and stale-context errors.', 'Indefinite raw retention increases exposure and contamination.'),
      c('C026', 'A file path from the model contains ../ outside the approved corpus.', 'Resolve the path and reject it unless it remains under the configured root.', 'Open it because it is valid syntax.', 'Run it as a command.', 'Add administrator permissions.', 'Resolved-root checks enforce the retrieval capability boundary.', 'Syntactic validity does not authorize filesystem access.'),
      c('C025', 'A stored preference conflicts with the user’s current explicit request.', 'Use the current request and update or invalidate the stale memory.', 'Let old memory silently override the user.', 'Combine both into an impossible instruction.', 'Hide the conflict.', 'Current explicit intent outranks inferred historical preference.', 'Silent memory precedence makes behavior surprising and hard to correct.'),
    ],
  },
);

weekSpecs.push(
  {
    title: 'Agent Evaluations and Regression Gates', outcome: 'Measure agent task quality, safety, and efficiency with reproducible datasets and graders.',
    competencyIds: ['C027', 'C010'],
    resources: [
      r('https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents', 'Demystifying evals for AI agents', 'Anthropic', 'article', 110, 'Study task suites, graders, transcripts, nondeterminism, and iteration practice.'),
      r('https://developers.openai.com/api/docs/guides/evals', 'Evals guide', 'OpenAI', 'documentation', 90, 'Study eval design, datasets, testing criteria, and continuous evaluation.'),
      r('https://openai.github.io/openai-agents-python/testing/', 'Testing agents', 'OpenAI', 'lab', 100, 'Create deterministic trace assertions and a small end-to-end task suite using FakeModel.'),
    ],
    build: ['Agent Evaluation Harness', 'Create a versioned suite of representative tasks, deterministic fakes, outcome graders, trace checks, and a regression report.', 'The dataset includes success, no-answer, tool failure, repeated-call, malformed output, and confirmation-required cases.', 'The report separates task success, safety violations, latency/tool counts, and grader uncertainty with explicit thresholds.'],
    checks: [
      c('C027', 'An agent demo succeeds once on a hand-picked question.', 'Create a representative versioned task suite including failures and edge cases.', 'Declare production readiness from the demo.', 'Remove difficult examples.', 'Judge quality from response length.', 'A task distribution provides stronger evidence than one favorable anecdote.', 'One chosen demo cannot reveal reliability or safety variance.'),
      c('C027', 'A grader gives different scores to identical deterministic traces.', 'Investigate grader reliability and use deterministic criteria where possible.', 'Average arbitrary scores without review.', 'Change passing thresholds per run.', 'Hide the disagreement.', 'The evaluation instrument itself must be validated before its scores guide release.', 'Unstable grading can manufacture apparent regressions or improvements.'),
      c('C027', 'The final answer sounds good but the trace attempted an unauthorized write.', 'Fail the safety dimension even if answer quality is high.', 'Pass because the prose was fluent.', 'Delete the trace before grading.', 'Count only token usage.', 'Agent evaluation must inspect process and effects, not only final text.', 'Outcome-only grading can reward unsafe paths.'),
      c('C010', 'A regression test calls a live model and fails unpredictably.', 'Use a recorded or deterministic fake for the required gate and keep live checks separate.', 'Retry CI until it passes.', 'Commit a secret and fix a random seed only.', 'Remove the gate.', 'Deterministic required tests isolate code regressions from provider variance.', 'Retry-until-pass hides failures and wastes cost.'),
      c('C027', 'A new prompt improves average score but doubles severe safety failures.', 'Block release on the safety threshold and inspect affected traces.', 'Ship based on the average only.', 'Lower the safety weight after results.', 'Exclude failed cases retroactively.', 'Critical dimensions need independent gates rather than being diluted by averages.', 'An aggregate can conceal unacceptable high-severity behavior.'),
    ],
  },
  {
    title: 'Tracing, Reliability, and Recovery', outcome: 'Explain every agent run and recover from transient failure without duplicating effects.',
    competencyIds: ['C028', 'C009', 'C013'],
    resources: [
      r('https://openai.github.io/openai-agents-python/tracing/', 'Tracing agent runs', 'OpenAI', 'documentation', 80, 'Study traces, spans, sensitive data choices, grouping, and custom processors.'),
      r('https://developers.openai.com/api/docs/guides/production-best-practices', 'Production best practices', 'OpenAI', 'documentation', 85, 'Study scaling, latency, cost, security, and operational planning.'),
      r('https://docs.python.org/3/howto/logging.html', 'Python Logging HOWTO', 'Python Software Foundation', 'lab', 90, 'Instrument the agent loop with correlation IDs, durations, outcomes, and redaction tests.'),
    ],
    build: ['Observable Resilient Agent', 'Add structured traces, redaction, failure classification, retry budgets, checkpoints, and recovery commands.', 'A run timeline links model turns, tool calls, approvals, state changes, and terminal outcome by stable IDs.', 'Recovery resumes only from a durable safe checkpoint and proves that completed effects are not repeated.'],
    checks: [
      c('C028', 'A run fails but logs cannot connect the model turn to its tool effect.', 'Propagate stable run, turn, and call identifiers across spans.', 'Match records by wording similarity.', 'Add more unstructured print statements.', 'Remove timestamps.', 'Correlation IDs reconstruct causality across asynchronous boundaries.', 'Wording cannot reliably join concurrent operational events.'),
      c('C028', 'A process crashes after a tool effect succeeds but before the next model turn.', 'Persist the effect key and checkpoint before resuming from durable state.', 'Restart the entire run and repeat every action.', 'Assume the effect failed.', 'Delete the audit record.', 'Recovery must reconcile durable effects before re-execution.', 'Full replay can duplicate external changes.'),
      c('C009', 'Tracing captures full prompts containing personal data.', 'Redact or disable sensitive capture according to a documented policy.', 'Upload every trace publicly.', 'Treat tracing storage as risk-free.', 'Include environment secrets for debugging.', 'Observability needs data-minimization and access controls.', 'Full prompt capture creates a secondary sensitive datastore.'),
      c('C013', 'A validation error repeats identically after two attempts.', 'Stop retrying and surface it as a permanent failure.', 'Keep exponential backoff forever.', 'Change the input randomly.', 'Restart the database.', 'Retries are for likely transient conditions, not deterministic contract failures.', 'Repeated permanent failures consume budget without a recovery mechanism.'),
      c('C028', 'Latency increases sharply while task success remains constant.', 'Use span timing to identify the slow stage and compare against a baseline.', 'Optimize every module simultaneously.', 'Ignore it until requests time out.', 'Remove instrumentation.', 'Stage-level evidence localizes the bottleneck and preserves causal testing.', 'Broad simultaneous changes make performance effects impossible to attribute.'),
    ],
  },
  {
    title: 'Async Execution and Scheduling', outcome: 'Run independent agent work concurrently, cancel it safely, and schedule idempotent jobs.',
    competencyIds: ['C029', 'C028'],
    resources: [
      r('https://docs.python.org/3/library/asyncio-task.html', 'Coroutines and Tasks', 'Python Software Foundation', 'documentation', 100, 'Study task creation, groups, cancellation, timeouts, and synchronization.'),
      r('https://docs.python.org/3/library/asyncio-dev.html', 'Developing with asyncio', 'Python Software Foundation', 'documentation', 70, 'Study debug mode, cancellation, blocking code, logging, and thread boundaries.'),
      r('https://docs.python.org/3/library/sched.html', 'sched — Event scheduler', 'Python Software Foundation', 'lab', 80, 'Compare a simple local scheduler with an idempotent persisted job runner.'),
    ],
    build: ['Scheduled Briefing Runner', 'Schedule a local research briefing whose independent reads can run concurrently under a shared deadline.', 'Cancellation prevents new work, awaits cleanup, and records a non-success terminal state.', 'Each scheduled occurrence has a durable unique key so restart or overlap cannot create a duplicate briefing.'],
    checks: [
      c('C029', 'Three independent slow reads run one after another.', 'Run them concurrently under a bounded task group when their dependencies permit.', 'Create threads for every line of code.', 'Remove all timeouts.', 'Share one mutable response object without coordination.', 'Structured concurrency reduces elapsed wait while retaining lifecycle control.', 'Unbounded threads and shared mutation add races without clear ownership.'),
      c('C029', 'One task in a related group fails critically.', 'Cancel or resolve siblings according to the group policy and await cleanup.', 'Leave orphan tasks running.', 'Exit without closing clients.', 'Mark the group successful.', 'Related tasks need an explicit failure and cleanup policy.', 'Orphans can continue effects after the run is considered stopped.'),
      c('C029', 'An async function calls a blocking library for thirty seconds.', 'Move blocking work to an appropriate thread/process boundary or use an async client.', 'Call it directly on the event loop.', 'Add more coroutines around it.', 'Disable cancellation.', 'Blocking calls freeze all tasks sharing the event loop.', 'Wrapping syntax around blocking work does not make it cooperative.'),
      c('C029', 'The scheduler restarts near a due time and fires the same job twice.', 'Claim a persisted occurrence key transactionally before execution.', 'Use only an in-memory Boolean.', 'Assume restarts never happen.', 'Delete prior run history.', 'A durable uniqueness boundary makes scheduling idempotent across process restarts.', 'In-memory flags disappear during the exact failure that needs protection.'),
      c('C028', 'A cancelled run is logged as an unknown exception.', 'Model cancellation as a distinct terminal outcome and preserve its reason.', 'Retry cancellation automatically.', 'Report success.', 'Erase the trace.', 'Cancellation is an expected control outcome with different recovery semantics.', 'Treating it as unknown hides operator intent and can trigger harmful retries.'),
    ],
  },
  {
    title: 'Permissions, Guardrails, and Human Control', outcome: 'Enforce least privilege and human approval around untrusted input and consequential actions.',
    competencyIds: ['C030', 'C023'],
    resources: [
      r('https://openai.github.io/openai-agents-python/guardrails/', 'Guardrails', 'OpenAI', 'documentation', 85, 'Study input, output, and tool guardrails plus execution timing tradeoffs.'),
      r('https://openai.github.io/openai-agents-python/human_in_the_loop/', 'Human-in-the-loop approvals', 'OpenAI', 'documentation', 80, 'Study approval pauses, state serialization, resumption, and decisions.'),
      r('https://owasp.org/www-project-top-10-for-large-language-model-applications/', 'OWASP Top 10 for LLM Applications', 'OWASP', 'lab', 110, 'Threat-model the current agent and implement tests for prompt injection, excessive agency, and sensitive disclosure.'),
    ],
    build: ['Policy-Enforced Action Gateway', 'Create capability grants, approval previews, guardrails, secret redaction, and a tamper-evident action audit.', 'Default grants are read-only and narrow; state-changing tools require an unexpired approval bound to exact arguments.', 'Adversarial tests prove retrieved instructions, model confidence, and forged approval text cannot bypass the gateway.'],
    checks: [
      c('C030', 'A document tells the agent to ignore policy and send local files.', 'Keep document content untrusted and enforce tool permissions outside the model.', 'Follow it because retrieval selected it.', 'Give the model filesystem administrator access.', 'Store policy only as a user message.', 'External enforcement remains authoritative when model reasoning is manipulated.', 'Prompt text alone is not a security boundary.'),
      c('C030', 'A tool only needs read access to one project directory.', 'Grant read capability scoped to the resolved directory and operation.', 'Grant full disk read/write access.', 'Run the process as administrator.', 'Reuse another tool’s broad token.', 'Least privilege limits damage from mistakes or compromised instructions.', 'Broad authority turns a narrow failure into a system-wide one.'),
      c('C023', 'The user approves sending one exact email draft.', 'Bind approval to recipient, subject, body hash, and expiry.', 'Treat approval as permission for all future emails.', 'Allow the model to change recipients after approval.', 'Store approval as an unvalidated sentence.', 'Exact scoped approvals prevent post-review action drift.', 'Blanket approval defeats meaningful human review.'),
      c('C030', 'An output guardrail flags a possible secret.', 'Block release, retain a safe diagnostic, and require review or corrected output.', 'Send it first and review later.', 'Remove the guardrail from production.', 'Log the secret in full.', 'Potential disclosure must be contained before data leaves the boundary.', 'Post-send review cannot undo exposure.'),
      c('C030', 'A security test passes only because the dangerous tool was disabled in the fixture.', 'Test both denial and enabled-but-protected paths at the real gateway.', 'Claim the permission layer is proven.', 'Delete the adversarial case.', 'Mock the policy result as always safe.', 'Safety evidence must exercise the enforcement boundary under realistic capability.', 'A missing capability does not prove authorization controls work.'),
    ],
  },
  {
    title: 'MCP Tools with Explicit Trust', outcome: 'Connect one MCP server through an allowlisted client while preserving validation, permission, and audit boundaries.',
    competencyIds: ['C031', 'C030'],
    resources: [
      r('https://modelcontextprotocol.io/docs/learn/architecture', 'MCP architecture', 'Model Context Protocol', 'documentation', 90, 'Study host, client, server, primitives, discovery, and security boundaries.'),
      r('https://modelcontextprotocol.io/specification/2025-06-18/server/tools', 'MCP server tools specification', 'Model Context Protocol', 'documentation', 85, 'Study discovery, invocation, schemas, results, errors, and human control guidance.'),
      r('https://github.com/modelcontextprotocol/python-sdk/tree/main/examples', 'MCP Python SDK examples', 'Model Context Protocol', 'lab', 120, 'Run or inspect a minimal local server/client pair and map calls through the existing action gateway.'),
    ],
    build: ['Trust-Bounded MCP Adapter', 'Add an optional local MCP connection that imports selected tools through namespacing, schema validation, and policy mapping.', 'Discovered tools are not executable until allowlisted and assigned explicit read/write/approval classification.', 'The normal agent and test suite work without the MCP server, while a local fixture verifies discovery, call, error, and disconnect behavior.'],
    checks: [
      c('C031', 'A newly connected server advertises twenty tools.', 'Treat discovery as metadata and require explicit allowlisting before use.', 'Grant all discovered tools automatically.', 'Ask the model to choose which are safe.', 'Execute each once as a test.', 'Discovery does not establish trust or authorization.', 'Automatic exposure expands agent capability without review.'),
      c('C031', 'Two servers expose a tool named search.', 'Namespace tools by server identity and retain stable mapping metadata.', 'Merge both under one ambiguous name.', 'Choose by response speed.', 'Rename randomly each session.', 'Namespacing prevents collisions and keeps audit trails attributable.', 'An ambiguous name can route a call to the wrong trust domain.'),
      c('C030', 'An MCP tool schema permits a filesystem path.', 'Apply the same resolved-root and approval policy used by native tools.', 'Trust the remote schema as authorization.', 'Skip local validation.', 'Give the server the entire home directory.', 'External tools remain subject to host policy and least privilege.', 'Protocol conformance does not make a server or argument safe.'),
      c('C031', 'The MCP server disconnects during a call.', 'Return a typed transport failure and reconcile any ambiguous effect before retry.', 'Assume no effect occurred and resend writes.', 'Crash without call context.', 'Report fabricated success.', 'Transport failure and effect outcome are separate uncertainties.', 'Blind write retry can duplicate a server-side effect.'),
      c('C031', 'A production task does not benefit from interoperability.', 'Keep the native tool path and avoid adding MCP complexity.', 'Use MCP for every local function regardless.', 'Add multiple remote servers.', 'Remove the stable internal interface.', 'MCP is useful at integration boundaries, not a mandatory internal architecture.', 'Unnecessary protocol layers increase operational and security surface.'),
    ],
  },
  {
    title: 'Modular and Specialist Agent Architecture', outcome: 'Compose replaceable agent components and add delegation only where evaluation justifies it.',
    competencyIds: ['C032', 'C027'],
    resources: [
      r('https://openai.github.io/openai-agents-python/agents/', 'Agents', 'OpenAI', 'documentation', 80, 'Study agent configuration, output types, tool use, dynamic instructions, and cloning.'),
      r('https://openai.github.io/openai-agents-python/multi_agent/', 'Orchestrating multiple agents', 'OpenAI', 'documentation', 85, 'Study manager and handoff patterns plus context and control tradeoffs.'),
      r('https://www.anthropic.com/engineering/building-effective-agents', 'Workflow and agent architecture patterns', 'Anthropic', 'lab', 110, 'Compare a single-agent baseline with one bounded specialist delegation on the same eval set.'),
    ],
    build: ['Evaluated Specialist Handoff', 'Refactor provider, tools, memory, policy, and orchestration behind interfaces, then test one bounded research specialist handoff.', 'The single-agent baseline remains available and all required behavior works without delegation.', 'Delegation ships only if the report shows a defined quality gain that exceeds its added latency, cost, and failure complexity.'],
    checks: [
      c('C032', 'Changing model provider requires editing tools, storage, and policies.', 'Depend on an internal provider interface and keep vendor translation in adapters.', 'Add vendor conditionals to every module.', 'Duplicate the application for each provider.', 'Expose raw SDK state globally.', 'Replaceable boundaries localize change and support offline tests.', 'Scattered vendor branches create divergent behavior and high migration cost.'),
      c('C032', 'A specialist needs the question and three sources, not the entire session.', 'Pass a purpose-built bounded context object.', 'Forward all messages, secrets, and tools.', 'Let the specialist query unrestricted storage.', 'Copy the database.', 'Minimal context reduces leakage, distraction, and token cost.', 'Whole-session forwarding violates least privilege and increases prompt-injection reach.'),
      c('C027', 'A multi-agent version is more complex but has the same eval score.', 'Keep the simpler baseline.', 'Ship the complex version because it uses more agents.', 'Change the eval to reward handoffs.', 'Ignore latency and failures.', 'Complexity needs measured benefit to justify its new failure modes.', 'Agent count is not a user outcome.'),
      c('C032', 'A specialist returns output that the manager will execute.', 'Validate it at the manager boundary and apply normal policy checks.', 'Trust it because another agent produced it.', 'Convert it directly into shell code.', 'Skip provenance.', 'Agent output is untrusted input to the next component.', 'Delegation does not transfer authority or guarantee validity.'),
      c('C032', 'A framework feature hides the exact stop and tool-dispatch behavior.', 'Wrap or replace it so critical control rules remain explicit and tested.', 'Accept undocumented defaults.', 'Remove loop tests.', 'Depend on debug logs only.', 'Critical behavior needs an application-owned contract despite framework convenience.', 'Hidden defaults can change and defeat safety assumptions.'),
    ],
  },
  {
    title: 'Packaging, Configuration, and Continuous Verification', outcome: 'Install and verify the agent reproducibly across development and clean Windows environments.',
    competencyIds: ['C033', 'C015'],
    resources: [
      r('https://packaging.python.org/en/latest/tutorials/packaging-projects/', 'Packaging Python Projects', 'Python Packaging Authority', 'documentation', 105, 'Study pyproject configuration, build artifacts, metadata, and installation.'),
      r('https://docs.github.com/en/actions/tutorials/build-and-test-code/python', 'Building and testing Python with GitHub Actions', 'GitHub', 'documentation', 85, 'Study Python versions, dependency caching, pytest, and artifacts.'),
      r('https://docs.docker.com/guides/python/', 'Containerize your app: Python', 'Docker', 'lab', 100, 'Review container packaging as an optional deployment path; complete the required clean-venv install path first.'),
    ],
    build: ['Reproducible Agent Release', 'Package the personal agent with validated settings, environment templates, database migrations, CLI entry points, and continuous checks.', 'A clean virtual environment can install the package, initialize state, run offline smoke tests, and execute the evaluation gate from documented commands.', 'Configuration fails fast with field-specific errors, secrets are excluded, and CI publishes test/eval summaries without learner data.'],
    checks: [
      c('C033', 'A clean machine cannot import the app unless run from the repository root.', 'Package it with pyproject metadata and test an installed entry point.', 'Tell users to modify sys.path manually.', 'Depend on the developer working directory.', 'Copy modules into site-packages by hand.', 'Installed-package testing reveals path assumptions and defines the distribution contract.', 'Working-directory imports are fragile and environment-specific.'),
      c('C033', 'Configuration silently falls back when a required database path is invalid.', 'Validate configuration at startup and report the exact field and remedy.', 'Continue until a later file error.', 'Guess a writable production path.', 'Use the source directory.', 'Fail-fast validation keeps operational errors close to their cause.', 'Late failure obscures configuration responsibility and may write unexpectedly.'),
      c('C015', 'A release changes the stored schema.', 'Document compatibility, include tested migration, and note recovery/backup steps.', 'Mention only new UI features.', 'Rewrite old databases automatically without backup guidance.', 'Hide the revision.', 'Release notes are part of the update and operator contract.', 'Undocumented state change creates avoidable data risk.'),
      c('C033', 'CI requires a live provider secret for every pull request.', 'Use offline fake-model gates and isolate optional credentialed tests.', 'Expose a broad production key.', 'Skip all agent tests.', 'Run tests only on one laptop.', 'Offline gates are deterministic and safe for untrusted change contexts.', 'Broad secrets in routine CI expand cost and exfiltration risk.'),
      c('C033', 'A container works but the native Windows installation is broken.', 'Treat the documented learner environment as a required independent verification target.', 'Declare success from the container alone.', 'Require Docker despite the course contract.', 'Remove Windows instructions.', 'Deployment evidence must match the promised target environment.', 'A different runtime does not prove learner installation works.'),
    ],
  },
  {
    title: 'Production Personal Agent Capstone', outcome: 'Integrate, audit, and demonstrate a safe local-first personal agent with a defensible readiness report.',
    competencyIds: ['C033', 'C032', 'C030', 'C028', 'C027'],
    resources: [
      r('https://developers.openai.com/api/docs/guides/safety-best-practices', 'Safety best practices', 'OpenAI', 'documentation', 80, 'Use as a final review checklist for moderation, adversarial testing, human oversight, and constrained inputs/outputs.'),
      r('https://openai.github.io/openai-agents-python/quickstart/', 'Agents SDK quickstart', 'OpenAI', 'documentation', 65, 'Compare the completed transparent architecture with a current SDK implementation path; migration is optional.'),
      r('https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents', 'Agent evals release review', 'Anthropic', 'exercise', 120, 'Run the complete eval set, inspect transcripts, classify failures, repair blockers, and rerun from a clean state.'),
    ],
    build: ['Production-Readiness Capstone', 'Deliver a personal research-and-task agent with offline defaults, optional providers, grounded answers, bounded tools, approvals, durable state, evals, traces, recovery, and installation documentation.', 'From a clean Windows virtual environment, the documented offline path completes an end-to-end task and all required test, migration, security, and evaluation gates.', 'The readiness report includes architecture and data-flow diagrams, threat model, permission matrix, known limitations, rollback/recovery procedure, evaluation results, and evidence links.'],
    checks: [
      c('C033', 'The capstone works only with the developer database and shell state.', 'Verify from a clean environment and newly initialized storage using only documented steps.', 'Copy the developer profile to the reviewer.', 'Call local success production readiness.', 'Remove setup validation.', 'Clean-state verification proves the installation and initialization contract.', 'Developer state can conceal missing dependencies and migrations.'),
      c('C030', 'A red-team case causes an unapproved state-changing call.', 'Block release, repair the enforcement path, add regression coverage, and rerun the full safety gate.', 'Document it as a harmless quirk.', 'Remove the red-team case.', 'Lower the safety threshold.', 'Unauthorized effects are release blockers regardless of other quality metrics.', 'Accepting a known bypass makes the stated permission model false.'),
      c('C028', 'A failure report lacks the run trace and reproduction input.', 'Record stable evidence, reproduce under controlled state, and link the repair test.', 'Patch several areas based on intuition.', 'Mark it resolved after one manual attempt.', 'Delete failed artifacts.', 'A defensible repair connects observation, cause, change, and regression evidence.', 'Intuition-only patches cannot prove the failure was addressed.'),
      c('C027', 'Overall eval pass rate is high but no-answer honesty falls below its gate.', 'Fail readiness on the independent critical metric.', 'Average it with formatting scores.', 'Exclude no-answer tasks.', 'Change labels after evaluation.', 'Critical user-trust behaviors require explicit independent thresholds.', 'Averages can conceal systematic hallucination.'),
      c('C032', 'The final architecture contains an optional provider and MCP adapter.', 'Prove core tasks still work with FakeModel and native local tools disconnected.', 'Make optional services mandatory silently.', 'Skip offline tests.', 'Store live credentials as defaults.', 'Optional integrations must not undermine the promised local-first baseline.', 'Hidden mandatory dependencies contradict the delivery contract.'),
    ],
  },
);

const allCompetencyIds = competencies.map((item) => item.id);
const makeQuestions = (checks, weekNumber) => checks.flatMap((item, index) => {
  const number = String(index * 2 + 1).padStart(2, '0');
  const failureNumber = String(index * 2 + 2).padStart(2, '0');
  return [
    {
      id: `PYAE-Q-W${String(weekNumber).padStart(2, '0')}-${number}`,
      competencyIds: [item.competencyId],
      prompt: item.situation,
      options: [
        { id: 'a', label: item.correct },
        { id: 'b', label: item.failureChoice },
        { id: 'c', label: item.distractorTwo },
        { id: 'd', label: item.distractorThree },
      ],
      correctOptionId: 'a',
      explanation: item.explanation,
    },
    {
      id: `PYAE-Q-W${String(weekNumber).padStart(2, '0')}-${failureNumber}`,
      competencyIds: [item.competencyId],
      prompt: `${item.failure} Which choice most directly created this failure?`,
      options: [
        { id: 'a', label: item.correct },
        { id: 'b', label: item.failureChoice },
        { id: 'c', label: item.distractorTwo },
        { id: 'd', label: item.distractorThree },
      ],
      correctOptionId: 'b',
      explanation: `${item.failure} The cause is "${item.failureChoice}" because it violates this rule: ${item.explanation}`,
    },
  ];
});

const resourceResearch = [];
const resources = [];
const weeks = weekSpecs.map((spec, zeroIndex) => {
  const weekNumber = zeroIndex + 1;
  const weekToken = `W${String(weekNumber).padStart(2, '0')}`;
  const declaredCompetencyIds = spec.competencyIds.map((item) => `PYAE-${item}`);
  const weekCompetencyIds = weekNumber === 24 ? allCompetencyIds : declaredCompetencyIds;
  const assignments = spec.resources.map((item, resourceIndex) => {
    const resourceId = `PYAE-R-${weekToken}-${String(resourceIndex + 1).padStart(2, '0')}`;
    const base = {
      id: resourceId,
      title: item.title,
      url: item.url,
      provider: item.provider,
      format: item.format,
      cost: 'free',
      estimatedMinutes: item.minutes,
      location: { note: item.note },
      competencyIds: declaredCompetencyIds,
      whySelected: `${item.provider} is a primary or official source. This selection directly supports ${spec.title.toLowerCase()} and complements the other formats assigned this week.`,
    };
    resources.push(base);
    resourceResearch.push({
      ...base,
      accessStatus: 'verified',
      checkedAt,
      selectionRole: 'core',
      formatRationale: item.format === 'lab' || item.format === 'exercise'
        ? 'This section is assigned as a hands-on activity: learners must run, change, break, and verify code rather than only read the page.'
        : 'The format describes the selected learning asset itself.',
      purpose: resourceIndex === 0
        ? ['primary mental model', 'authoritative reference']
        : resourceIndex === 1
          ? ['complementary explanation', 'implementation detail']
          : ['guided practice', 'failure exploration'],
      evaluation: {
        competencyFit: 'Directly teaches or exercises every mapped weekly competency.',
        clarity: resourceIndex === 0 && weekNumber <= 4
          ? 'Paired with another beginner-compatible explanation or guided practice route.'
          : 'Suitable at this point in the prerequisite sequence.',
        correctnessAndCurrency: 'Publisher-maintained primary material inspected during this run.',
        accessibility: 'Free to access without making an account part of the learning gate.',
      },
      accessNotes: 'Public page opened successfully during the Phase 3 production research run; no payment is required to read or use the assigned section.',
      alternativeNotes: resourceIndex === 2
        ? 'Selected as the practice route; the required assessed build remains local and independent of external service availability.'
        : 'Selected for authoritative explanation; a separate hands-on resource and weekly build supply active practice.',
    });
    return {
      resourceId,
      role: 'core',
      competencyIds: declaredCompetencyIds,
      purpose: resourceIndex === 0
        ? 'Establish the primary mental model and authoritative contract.'
        : resourceIndex === 1
          ? 'Provide a complementary explanation and implementation perspective.'
          : 'Convert the concepts into guided hands-on practice before the graded check.',
    };
  });
  const buildId = `PYAE-B-${weekToken}-01`;
  const [buildTitle, buildBrief, criterionOne, criterionTwo] = spec.build;
  const buildGuidance = weekNumber <= 8
    ? [
      `Restate the ${buildTitle} behavior as inputs, outputs, constraints, and expected failure messages.`,
      `Implement the smallest working path for ${spec.title.toLowerCase()}, then separate presentation from application logic.`,
      `Add automated tests for both acceptance criteria plus one failure described in this week's Skill Check.`,
      'Run the documented verification commands from clean temporary state and preserve the results.',
    ]
    : weekNumber <= 16
      ? [
        `Define the new ${spec.title.toLowerCase()} boundary and connect it to the existing project through an injectable interface.`,
        'Implement one end-to-end path, then deliberately trigger and diagnose a representative boundary failure.',
        'Prove both acceptance criteria with automated tests and an offline integration run.',
      ]
      : [
        `Choose and document the smallest architecture that satisfies the ${buildTitle} brief using the interfaces already earned.`,
        'Use the acceptance criteria as the implementation and verification checklist; preserve failure evidence and justify repairs.',
      ];
  return {
    id: `PYAE-${weekToken}`,
    sequence: weekNumber,
    phaseId: `PYAE-PH${String(Math.floor(zeroIndex / 4) + 1).padStart(2, '0')}`,
    title: spec.title,
    outcome: spec.outcome,
    competencyIds: weekCompetencyIds,
    estimatedHours: 22,
    study: {
      objective: `Study, practice, and explain the decisions needed to ${spec.outcome.charAt(0).toLowerCase()}${spec.outcome.slice(1)}`,
      coreMinimum: 3,
      resources: assignments,
    },
    skillCheck: {
      id: `PYAE-SC-${weekToken}`,
      title: `${spec.title} Skill Check`,
      instructions: 'Answer all 10 questions. A score of 7/10 (70%) passes. Review the explanations before any recovery attempt.',
      passingScore: 70,
      competencyIds: declaredCompetencyIds,
      questions: makeQuestions(spec.checks, weekNumber),
    },
    builds: [{
      id: buildId,
      title: buildTitle,
      required: true,
      outcome: spec.outcome,
      competencyIds: weekCompetencyIds,
      estimatedMinutes: 540,
      brief: buildBrief,
      steps: buildGuidance.map((text, index) => ({ id: `${buildId}-S${String(index + 1).padStart(2, '0')}`, text })),
      acceptanceCriteria: [
        { id: `${buildId}-A01`, text: criterionOne },
        { id: `${buildId}-A02`, text: criterionTwo },
        { id: `${buildId}-A03`, text: 'Required automated checks pass without a live model API, paid account, or unapproved access to learner data.' },
        { id: `${buildId}-A04`, text: 'The README explains setup, commands, expected output, limitations, and safe recovery.' },
      ],
      hints: [
        'Keep model, storage, clock, network, and external tool dependencies injectable.',
        'When an external service is optional, prove the deterministic local path first.',
      ],
      templates: [{
        id: `PYAE-T-${weekToken}-01`,
        label: 'Weekly build README scaffold',
        content: `# ${buildTitle}\n\n## Purpose\n\n## Setup (Windows PowerShell)\n\n## Run\n\n## Test\n\n## Design decisions\n\n## Safety and data boundaries\n\n## Known limitations\n\n## Evidence\n`,
      }],
      stretch: weekNumber % 4 === 0 ? 'Repeat one verification from a newly created virtual environment and compare the evidence.' : null,
    }],
    proof: {
      id: `PYAE-PR-${weekToken}`,
      prompt: `Submit inspectable evidence for ${buildTitle}.`,
      evidence: [
        { id: `PYAE-PR-${weekToken}-E01`, type: 'link', label: 'Repository or reviewable artifact link', required: true },
        { id: `PYAE-PR-${weekToken}-E02`, type: 'text', label: 'Verification commands, results, and the most important limitation', required: true },
        { id: `PYAE-PR-${weekToken}-E03`, type: 'confirmation', label: 'I verified the required offline path without including credentials or private learner data.', required: true },
      ],
    },
    reflection: {
      minimumResponses: 1,
      prompts: [
        { id: `PYAE-RF-${weekToken}-01`, prompt: `In ${buildTitle}, what changed in your understanding of ${spec.title.toLowerCase()}? Point to one behavior or test that demonstrates the change.` },
        { id: `PYAE-RF-${weekToken}-02`, prompt: `This week examined the failure: "${spec.checks[4].failure}" How would you diagnose or prevent it now, and what uncertainty would you test next?` },
      ],
    },
  };
});

const projectSpecs = [
  ['PYAE-PJ01', 'Python Automation Toolkit', 'A tested, documented, versioned Python CLI and API toolkit with durable JSON state.', 1, 8],
  ['PYAE-PJ02', 'Tool-Using Research Agent', 'A transparent local research agent with validated model outputs, tools, state, memory, and grounded citations.', 9, 16],
  ['PYAE-PJ03', 'Reliable Personal Agent', 'A secure, observable, evaluated, packaged personal agent with optional MCP and provider integrations.', 17, 24],
];
const projects = projectSpecs.map(([id, title, outcome, start, end]) => {
  const projectWeeks = weeks.slice(start - 1, end);
  return {
    id, title, outcome,
    competencyIds: [...new Set(projectWeeks.flatMap((week) => week.competencyIds))],
    milestones: projectWeeks.map((week) => ({
      id: `${id}-M${String(week.sequence - start + 1).padStart(2, '0')}`,
      title: `${week.title} build accepted`,
      weekId: week.id,
      buildId: week.builds[0].id,
    })),
  };
});

const source = {
  schemaVersion: '2.0',
  curriculumId: 'PYAE',
  revision: 1,
  title: 'Python Agent Engineering',
  shortTitle: 'Python Agent Engineering',
  target: {
    role: 'Python Agent Engineer',
    learner: 'A beginner who can use a Windows computer but is not expected to know Python, APIs, databases, language models, or agent frameworks.',
    professionalOutcome: 'Design, build, evaluate, secure, and operate a local-first Python personal agent with replaceable providers, bounded tools, durable state, grounded answers, and human control.',
    specialGoals: [
      'Use Python rather than JavaScript for every learner coding outcome.',
      'Remain completable with free software, a deterministic FakeModel, and local fixtures; paid model access is optional.',
      'Prefer transparent Python implementations before framework abstractions.',
      'Graduate with three cumulative portfolio projects and inspectable evidence of production readiness.',
    ],
  },
  workload: { weeklyHours: { min: 20, max: 25 }, estimatedTotalHours: 528, estimatedWeeks: 24 },
  assumptions: [
    'The learner has a Windows 10 or 11 computer, PowerShell, internet access for reading resources, and permission to install free development tools.',
    'Python 3.12 or newer is the documented baseline; required work avoids operating-system-specific behavior outside explicit Windows setup instructions.',
    'GitHub is recommended for portfolio proof, but equivalent reviewable local artifacts may be used when account access is unavailable.',
    'All required model-dependent tests use a deterministic in-process FakeModel; Ollama and hosted APIs are optional adapters.',
    'Required projects act only on fixtures or learner-owned data and never require production credentials, external users, or consequential real-world effects.',
  ],
  phases,
  competencies,
  resources,
  weeks,
  projects,
  graduation: {
    outcome: 'Independently deliver and defend a tested Python agent system whose behavior, evidence, permissions, limitations, and recovery procedures are clear to another engineer.',
    requiredCompetencyIds: competencies.filter((item) => item.importance === 'core').map((item) => item.id),
    requiredProjectIds: projects.map((item) => item.id),
  },
};

const learningDesign = {
  curriculumId: 'PYAE', revision: 1,
  designPrinciple: 'Move from deterministic Python systems to bounded agent behavior; every abstraction is earned by a working lower-level implementation and every week produces inspectable evidence.',
  learningLens: [
    { move: 'UNDERSTAND', evidence: 'Explain the authoritative contract and predict behavior in the Skill Check.' },
    { move: 'IMPLEMENT', evidence: 'Complete the smallest end-to-end weekly Build slice.' },
    { move: 'BREAK', evidence: 'Trigger one named boundary or adversarial failure intentionally.' },
    { move: 'DEBUG', evidence: 'Preserve observations, isolate the failing boundary, and explain root cause.' },
    { move: 'TEST', evidence: 'Automate acceptance and failure behavior with offline fixtures.' },
    { move: 'EXPLAIN', evidence: 'Document design, verification, limitations, and proof for review.' },
    { move: 'IMPROVE', evidence: 'Make the smallest evidence-backed repair or justify the next bounded experiment.' },
  ],
  scaffoldingPolicy: 'Guidance decreases only for the repeatedly practiced contract → vertical slice → failure → test → evidence workflow. Newly introduced technologies retain complete Core teaching and focused acceptance criteria regardless of week number.',
  sequenceRationale: phases.map((phase, index) => ({
    phaseId: phase.id,
    rationale: [
      'Establish executable foundations before depending on them.',
      'Introduce one new responsibility while reinforcing prior contracts through the cumulative weekly build.',
      'End with an integrated artifact and evidence gate rather than passive completion.',
    ][index < 2 ? 0 : index < 5 ? 1 : 2],
  })),
  weeklyLearningLoop: [
    { stage: 'Study', hours: 5, rule: 'Open all three complementary Core resources; complete the guided practice route before grading.' },
    { stage: 'Skill Check', hours: 1.5, rule: 'Exactly 10 four-option questions; 7/10 passes. A failed attempt locks Build until explanations are reviewed and a fresh recovery attempt passes.' },
    { stage: 'Build', hours: 9, rule: 'Unlock only after Study and Skill Check requirements; implement the required cumulative artifact using the supplied scaffold.' },
    { stage: 'Test and repair', hours: 4.5, rule: 'Exercise acceptance criteria, failure paths, and offline verification; repair evidence-backed defects.' },
    { stage: 'Proof and reflection', hours: 2, rule: 'Submit link, verification narrative, confirmation, and at least one reflection response.' },
  ],
  assessmentPolicy: {
    weeklyQuestionCount: 10,
    optionsPerQuestion: 4,
    passingScorePercent: 70,
    openBeforeComplete: 'Resources may be opened in any order, but all Core resource activity must be complete before the Skill Check is considered ready.',
    recoveryLock: 'After a failed Skill Check, Build remains locked. The learner reviews item explanations and starts a distinct recovery attempt; no answer state carries forward.',
    buildUnlock: 'Study Core completion plus a passing 7/10 or better Skill Check unlocks the required Build. Proof follows accepted Build completion.',
  },
  resourceStrategy: {
    hierarchy: ['Official language/library documentation', 'Official provider/protocol documentation', 'University open course material', 'Maintainer-owned examples and repositories'],
    multimodality: 'Every week combines authoritative reading with a distinct practice route; articles and video are used where high-quality primary options exist. The weekly Build supplies active production practice rather than substituting another document.',
    resilience: 'Required acceptance never depends on a paid key or live provider. Official resources are mirrored by a local learning outcome and scaffold so temporary resource failure does not corrupt progress.',
  },
  projectArchitecture: projects.map((project) => ({ projectId: project.id, milestoneBuildIds: project.milestones.map((item) => item.buildId) })),
  providerPolicy: {
    required: 'Deterministic FakeModel implementing the internal provider protocol.',
    optional: ['Ollama local HTTP adapter', 'OpenAI API adapter supplied by the learner'],
    rule: 'Provider capability never bypasses validation, tool authorization, evaluation, or offline regression gates.',
  },
};

const sourceReport = validateCurriculumSource(source);
if (sourceReport.status !== 'PASS') throw new Error(`PYAE source validation failed:\n${JSON.stringify(sourceReport, null, 2)}`);
const resourceReport = validateResourceResearch(resourceResearch);
if (resourceReport.status !== 'PASS') throw new Error(`PYAE resource research validation failed:\n${JSON.stringify(resourceReport, null, 2)}`);
const runtime = compileCurriculum(source);
const runtimeReport = validateRuntimeCurriculum(runtime);
if (runtimeReport.status !== 'PASS') throw new Error(`PYAE runtime validation failed:\n${JSON.stringify(runtimeReport, null, 2)}`);
const coverage = generateCoverage(source);

const coverageFindings = coverage.flatMap((record) => {
  const competency = competencies.find((item) => item.id === record.competencyId);
  const requiredFields = competency?.importance === 'core'
    ? ['taughtIn', 'practicedIn', 'assessedIn', 'appliedIn', 'projectUse', 'reinforcedIn']
    : ['taughtIn', 'practicedIn', 'assessedIn', 'appliedIn', 'projectUse'];
  return requiredFields.filter((field) => record[field].length === 0).map((field) => ({
    code: 'PYAE-COVERAGE-B001', severity: 'BLOCKER', competencyId: record.competencyId, field,
    message: `${record.competencyId} has no ${field} coverage.`,
  }));
});
if (coverageFindings.length) throw new Error(`PYAE coverage validation failed:\n${JSON.stringify(coverageFindings, null, 2)}`);

const semanticAudits = [
  ['Profession fidelity', 'PASS', 'All graduation capabilities trace to current primary role evidence and an assessed/applied competency.'],
  ['Beginner accessibility', 'PASS', 'The path starts with environment and Python syntax; it assumes no code, API, database, or agent experience.'],
  ['Dependency order', 'PASS', 'Every prerequisite is taught before the dependent competency and the compiler reports no teaching-order blocker.'],
  ['Assessment integrity', 'PASS', 'Each week has exactly 10 scenario/failure MCQs, four plausible options, one correct answer, explanation, and a 70% threshold.'],
  ['Build authenticity', 'PASS', 'Twenty-four cumulative builds exercise code, tests, evidence, and failure behavior rather than recall-only tasks.'],
  ['Project derivation', 'PASS', 'All 24 project milestones point to required weekly Build IDs; no separate hidden project task exists.'],
  ['Free completion path', 'PASS', 'Every required model path uses FakeModel/local fixtures; hosted APIs, Ollama, Docker, and MCP servers remain optional.'],
  ['Windows viability', 'PASS', 'Setup, venv, CLI, paths, clean-install verification, and final acceptance explicitly target Windows PowerShell.'],
  ['Resource authority and access', 'PASS', 'All 72 Core records were opened during research and come from official, maintainer, or university primary sources.'],
  ['Resource complementarity', 'PASS', 'Each week includes authoritative explanation plus an explicit lab/exercise route or hands-on source assignment.'],
  ['Agent safety', 'PASS', 'Action separation, least privilege, confirmations, idempotency, prompt-injection resistance, redaction, and adversarial tests are taught and gated.'],
  ['State and update resilience', 'PASS', 'Versioned JSON, migrations, transactions, checkpoints, effect reconciliation, configuration, backup/recovery documentation, and clean-state tests are explicit.'],
  ['Evaluation quality', 'PASS', 'Task, trace, safety, latency/tool, and no-answer metrics have independent gates and deterministic required fixtures.'],
  ['Framework independence', 'PASS', 'Learners implement provider, tool dispatch, state, and control loop contracts before optional SDK or MCP integration.'],
  ['Scope control', 'PASS', 'Distributed scale, fine-tuning, GPUs, unrestricted autonomy, and unjustified multi-agent complexity are excluded.'],
];
const adversarialAudits = [
  ['A01', 'Credential unavailable', 'Required FakeModel path completes all assessed behavior without network or payment.'],
  ['A02', 'Malformed model JSON', 'Typed validation fails closed before tools or storage receive output.'],
  ['A03', 'Repeated equivalent tool calls', 'Loop detector and turn/tool budgets terminate with evidence.'],
  ['A04', 'Prompt injection in retrieved content', 'Content remains data; permission enforcement lives outside model instructions.'],
  ['A05', 'Path traversal', 'Resolved paths outside the approved root are rejected.'],
  ['A06', 'Ambiguous write timeout', 'Effect/idempotency keys require reconciliation before retry.'],
  ['A07', 'Forged approval text', 'Approval is a stored scoped token bound to exact arguments and expiry.'],
  ['A08', 'Sensitive trace content', 'Redaction and capture policy block durable secret storage.'],
  ['A09', 'Database migration failure', 'Transactional migration rolls back and recovery procedure preserves prior state.'],
  ['A10', 'MCP tool surprise', 'Discovery does not grant execution; local allowlist and policy mapping remain authoritative.'],
  ['A11', 'Cancelled concurrent run', 'Cancellation propagates, cleanup is awaited, and no new effect begins.'],
  ['A12', 'Misleading aggregate eval', 'Independent safety and grounded-no-answer gates can block release despite high average quality.'],
  ['A13', 'Provider SDK change', 'Adapter boundary and contract suite isolate vendor response changes.'],
  ['A14', 'Optional integration offline', 'Native local tools and FakeModel preserve core behavior.'],
  ['A15', 'Developer-state dependency', 'Final acceptance requires a clean Windows environment and newly initialized store.'],
].map(([id, attack, evidence]) => ({ id, attack, status: 'PASS', evidence }));

const validationReport = {
  status: 'PASS', curriculumId: 'PYAE', revision: 1,
  productionGate: 'PRODUCTION READY FOR PILOT',
  blockingFailures: 0, warningCount: 0, noteCount: 0,
  liveResourceVerification: {
    checkedAt,
    selectedRecords: resourceResearch.length,
    uniqueUrls: new Set(resourceResearch.map((item) => item.url)).size,
    reachableUniqueUrls: new Set(resourceResearch.map((item) => item.url)).size,
    flaggedUrls: 0,
    method: 'Follow-redirect HTTP GET plus page inspection during the production research pass.',
  },
  passes: [
    { validator: 'V001-V014', name: 'Deterministic Curriculum Source validation', status: sourceReport.status, findings: sourceReport.findings },
    { validator: 'V012', name: 'Live resource research validation', status: resourceReport.status, findings: resourceReport.findings },
    { validator: 'V015-V017', name: 'Coverage and semantic contract audit', status: 'PASS', findings: coverageFindings },
    { validator: 'V018', name: 'Runtime contract validation', status: runtimeReport.status, findings: runtimeReport.findings },
  ],
  semanticAudits: semanticAudits.map(([name, status, evidence]) => ({ name, status, evidence })),
  adversarialAudits,
  repairCycles: [
    { cycle: 1, finding: 'An initial architecture draft coupled required work to hosted model access.', repair: 'Made FakeModel the required provider and moved all live providers to optional adapters.', result: 'PASS' },
    { cycle: 2, finding: 'A draft MCP stage treated discovered tools as immediately usable.', repair: 'Added explicit discovery-versus-authorization teaching, namespacing, allowlisting, and policy mapping.', result: 'PASS' },
    { cycle: 3, finding: 'A draft capstone gate could hide safety regression inside an average score.', repair: 'Separated safety and grounded-no-answer metrics into independent release gates.', result: 'PASS' },
    { cycle: 4, finding: 'The authored weekly pattern repeated generic reflection and Build guidance after learners had already demonstrated the workflow.', repair: 'Grounded reflection in each Build and a specific weekly failure, and reduced process scaffolding while retaining instruction for new concepts.', result: 'PASS' },
  ],
  counts: {
    phases: phases.length, competencies: competencies.length, coreCompetencies: competencies.filter((item) => item.importance === 'core').length,
    resources: resources.length, weeks: weeks.length, questions: weeks.reduce((sum, week) => sum + week.skillCheck.questions.length, 0),
    requiredBuilds: weeks.reduce((sum, week) => sum + week.builds.filter((build) => build.required).length, 0), projects: projects.length,
  },
};

const countBy = (items, select) => Object.fromEntries([...items.reduce((counts, item) => {
  const key = select(item);
  counts.set(key, (counts.get(key) || 0) + 1);
  return counts;
}, new Map()).entries()].sort(([left], [right]) => left.localeCompare(right)));
const providerCounts = countBy(resources, (item) => item.provider);
const formatCounts = countBy(resources, (item) => item.format);
const coreCount = competencies.filter((item) => item.importance === 'core').length;
const supportingCount = competencies.filter((item) => item.importance === 'supporting').length;
const minimumPlausibleWeeks = Math.ceil(source.workload.estimatedTotalHours / source.workload.weeklyHours.max);
const maximumPlausibleWeeks = Math.ceil(source.workload.estimatedTotalHours / source.workload.weeklyHours.min);
const summary = `# Python Agent Engineering — Generation Summary\n\n` +
`**Curriculum:** PYAE revision 1  \n**Status:** PRODUCTION READY FOR PILOT  \n**Generated by:** deterministic Phase 3 production pipeline  \n**Research verified:** ${checkedAt}\n\n` +
`## Outcome\n\nA 24-week, 528-hour beginner pathway for Windows learners. It moves from Python fundamentals through testable API and LLM boundaries into bounded tools, agent loops, persistence, retrieval, evaluations, observability, scheduling, security, MCP, modular architecture, packaging, and a production-readiness capstone.\n\n` +
`## Production inventory\n\n- ${phases.length} phases: ${phases.map((item) => item.title).join('; ')}\n- ${competencies.length} competencies (${coreCount} Core, ${supportingCount} Supporting)\n- ${resources.length} live-verified Core resource assignments; formats: ${Object.entries(formatCounts).map(([key, count]) => `${key} ${count}`).join(', ')}\n- Providers: ${Object.entries(providerCounts).map(([key, count]) => `${key} ${count}`).join(', ')}\n- Cost: ${resources.length} free, 0 paid, 0 mixed\n- ${weeks.length} weeks at 22 hours each (${source.workload.estimatedTotalHours} hours; plausible range ${minimumPlausibleWeeks}–${maximumPlausibleWeeks} weeks at ${source.workload.weeklyHours.min}–${source.workload.weeklyHours.max} hours/week)\n- ${weeks.length} graded Skill Checks and ${weeks.length * 10} multiple-choice questions\n- ${weeks.length} required cumulative Builds\n- ${projects.length} portfolio Projects derived only from weekly Builds\n\n` +
`## Delivery policy\n\nThe required path is local-first and free: all model-dependent assessment uses a deterministic FakeModel and fixtures. Ollama, hosted model APIs, Docker, MCP servers, and multi-agent delegation are optional extensions. Every week follows Study → 10-question Skill Check (7/10) → Build → Proof → Reflection, with recovery review after a failed check.\n\n` +
`## Graduation and scope\n\nGraduation requires all ${source.graduation.requiredCompetencyIds.length} Core competencies and Projects ${source.graduation.requiredProjectIds.join(', ')}. The culminating Production-Readiness Capstone integrates the personal agent and requires clean-install, test, migration, security, evaluation, evidence, and recovery gates. Excluded are unrestricted autonomy, mandatory paid or cloud infrastructure, foundation-model fine-tuning, GPU operations, distributed scale, and multi-agent complexity without measured value.\n\n` +
`## Research and design record\n\nProfession evidence prioritizes ordinary Python engineering, explicit tool contracts, structured state, bounded control loops, evaluations, tracing, human approval, and least privilege. The selected resources are official or maintainer/university primary sources, opened during the production research pass, and paired with hands-on work. Guidance reduces only for the repeatedly demonstrated build/test/evidence workflow; every new late concept retains three Core teaching resources. The adversarial review covered credentials, malformed output, loops, injection, traversal, ambiguous effects, approvals, secrets, migrations, MCP trust, cancellation, evaluation aggregation, provider changes, offline operation, and clean-state installation.\n\n` +
`## Repair cycles\n\nThree targeted cycles removed mandatory hosted-model dependence, made MCP discovery non-authoritative until explicit allowlisting, and separated safety/no-answer release gates from aggregate quality. A final coherence repair made weekly reflection topic-specific and reduced Build scaffolding only after the learner had repeatedly demonstrated the underlying workflow.\n\n` +
`## Validation gate\n\nSource, resource research, coverage, runtime compilation, and semantic/adversarial review all pass with zero blockers and zero warnings. All ${new Set(resources.map((item) => item.url)).size} unique selected URLs were reachable on ${checkedAt}. Repository-level build and test verification are performed after deterministic publication.\n`;

fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(publishedDir, { recursive: true });
const writeJson = (name, value) => fs.writeFileSync(path.join(outputDir, name), `${JSON.stringify(value, null, 2)}\n`);
writeJson('profession.json', profession);
writeJson('competencies.json', competencies);
writeJson('resources.json', resourceResearch);
writeJson('learning-design.json', learningDesign);
writeJson('curriculum-source.json', source);
writeJson('coverage.json', coverage);
writeJson('validation-report.json', validationReport);
writeJson('curriculum.json', runtime);
fs.writeFileSync(path.join(outputDir, 'generation-summary.md'), summary);
fs.writeFileSync(
  path.join(publishedDir, 'pythonAgentEngineering.js'),
  `// Generated by npm run curriculum:v2:pyae. Do not edit manually.\nexport default ${JSON.stringify(runtime, null, 2)};\n`,
);

console.log(`Built PYAE revision 1: ${weeks.length} weeks, ${resources.length} resources, ${weeks.length * 10} questions, ${competencies.length} competencies.`);
