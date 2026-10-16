// Human-authored release evidence. These judgments are not generated from the
// compiled runtime, so the deterministic pipeline cannot approve its own work.

export const editorialBuildAudits = [
  {
    buildId: 'PYIN-R2-B-W01-01', weekId: 'PYIN-R2-W01', readiness: 'YES',
    dependencies: [
      { name: 'Create, save, and run a Python source file', classification: 'taught-this-week', evidence: 'W01-01 and W01-03 demonstrate the editor/source/interpreter cycle before the Build.' },
      { name: 'Use print, input, conversion, arithmetic, and f-strings', classification: 'taught-this-week', evidence: 'W01-01 and W01-02 teach each operation and require a saved runnable trace.' },
      { name: 'Read SyntaxError and NameError evidence', classification: 'taught-this-week', evidence: 'W01-04 requires reproduction and annotation of both failures before assessment.' },
      { name: 'Navigate to the source folder', classification: 'contextually-explained', evidence: 'The Build supplies the exact folder/file name and recovery with pwd/dir; setup verifies the editor terminal.' },
    ],
    hiddenPrerequisitesFound: ['The withdrawn course opened with a generic generated guide and did not ensure the learner could distinguish saved code, interpreter, terminal, and traceback evidence.'],
    hiddenPrerequisitesRepaired: ['Added externally taught edit-save-run flow, exact launcher command, three fixed calculation cases, and two distinct evidence-led repair exercises.'],
    hiddenPrerequisitesRemaining: [],
    rationale: 'The supplied starter is a complete first program. The learner changes bounded values and then adds input; both 90-minute sessions stay below the two-hour cap and avoid a calculator-first jump.',
  },
  {
    buildId: 'PYIN-R2-B-W02-01', weekId: 'PYIN-R2-W02', readiness: 'YES',
    dependencies: [
      { name: 'Compare numbers and combine Boolean requirements', classification: 'taught-this-week', evidence: 'W02-01 and W02-02 teach comparison chains, and/or/not, and branch order.' },
      { name: 'Catch invalid whole-number text narrowly', classification: 'taught-this-week', evidence: 'W02-03 distinguishes ValueError from unrelated programming errors.' },
      { name: 'Normalize text before a yes/no comparison', classification: 'contextually-explained', evidence: 'The Build supplies `strip().lower()` and W02-04 traces the normalized Boolean decision.' },
    ],
    hiddenPrerequisitesFound: ['A generic eligibility task could conflate invalid data with legitimate rejection and leave boundary inclusion ambiguous.'],
    hiddenPrerequisitesRepaired: ['Specified ordered outcomes, exact messages, inclusive age/score boundaries, seven fixed cases, and a deliberate and/or repair.'],
    hiddenPrerequisitesRemaining: [],
    rationale: 'Every input, rule, boundary, and expected output is supplied. The learner implements only currently taught conversion, validation, comparisons, and branches.',
  },
  {
    buildId: 'PYIN-R2-B-W03-01', weekId: 'PYIN-R2-W03', readiness: 'YES',
    dependencies: [
      { name: 'Choose for versus while and guarantee loop progress', classification: 'taught-this-week', evidence: 'W03-01 teaches loop choice, break, continue, and progress.' },
      { name: 'Store records in a list of dictionaries', classification: 'taught-this-week', evidence: 'W03-02 introduces both structures; W03-03 supplies exact append/key/items/enumerate forms.' },
      { name: 'Trace collection and accumulator changes', classification: 'taught-this-week', evidence: 'W03-04 visually steps through the exact list-of-dictionaries summary pattern.' },
    ],
    hiddenPrerequisitesFound: ['The initial concept could count rejected attempts or permit a sixth valid record without a precise state contract.'],
    hiddenPrerequisitesRepaired: ['Defined valid-record count, duplicate normalization, stop sentinel, `< 5` boundary, accepted-record shape, and five explicit cases.'],
    hiddenPrerequisitesRemaining: [],
    rationale: 'The maximum of five records keeps the trace inspectable. Validation precedes append, and the separate off-by-one experiment makes the boundary observable.',
  },
  {
    buildId: 'PYIN-R2-B-W04-01', weekId: 'PYIN-R2-W04', readiness: 'YES',
    dependencies: [
      { name: 'Define parameters and call functions', classification: 'taught-this-week', evidence: 'W04-01 and W04-02 teach definitions, calls, parameter/argument mapping, and call flow.' },
      { name: 'Return and compose numeric results', classification: 'taught-this-week', evidence: 'W04-01, W04-03, and W04-04 teach return, implicit None, and composed values.' },
      { name: 'Iterate a list and use comparisons', classification: 'established-previously', evidence: 'Weeks 2 and 3 establish conditions, list traversal, and accumulators.' },
    ],
    hiddenPrerequisitesFound: ['A calculator-like task would be premature before functions, and fee/discount helpers could double-count the subtotal if their return contracts were vague.'],
    hiddenPrerequisitesRepaired: ['Placed arithmetic integration in Week 4 and specified amount-returning helpers, exact formula, fixed cases, intermediate values, and missing-return evidence.'],
    hiddenPrerequisitesRemaining: [],
    rationale: 'The learner refactors known syntax into four focused contracts. Exact intermediate values make every helper independently checkable.',
  },
  {
    buildId: 'PYIN-R2-B-W05-01', weekId: 'PYIN-R2-W05', readiness: 'YES',
    dependencies: [
      { name: 'Open, read, and write text with context managers', classification: 'taught-this-week', evidence: 'W05-01 and W05-02 teach the complete file lifecycle.' },
      { name: 'Build a stable project-relative path', classification: 'taught-this-week', evidence: 'W05-03 supplies the exact Path(__file__).parent composition and existence checks.' },
      { name: 'Serialize and load a list of dictionaries', classification: 'taught-this-week', evidence: 'W05-04 provides the exact JSON round trip.' },
      { name: 'Preserve malformed existing data', classification: 'taught-this-week', evidence: 'W05-05 requires separate FileNotFoundError and JSONDecodeError observations before the Build.' },
    ],
    hiddenPrerequisitesFound: ['A file task can silently depend on the current folder or overwrite malformed data when all load failures are treated as first run.'],
    hiddenPrerequisitesRepaired: ['Anchored the path at __file__, required UTF-8/with, recovered only FileNotFoundError, prohibited save after malformed JSON, and added a before/after preservation case.'],
    hiddenPrerequisitesRemaining: [],
    rationale: 'The persistence surface is intentionally small: one JSON list, one relative path, and one add/list/total workflow. Failure cases are concrete and reversible.',
  },
  {
    buildId: 'PYIN-R2-B-W06-01', weekId: 'PYIN-R2-W06', readiness: 'YES',
    dependencies: [
      { name: 'Define a class initializer and construct instances', classification: 'taught-this-week', evidence: 'W06-01 and W06-02 teach the dictionary-to-class motivation, __init__, construction, and instance data.' },
      { name: 'Use self in instance methods', classification: 'taught-this-week', evidence: 'W06-02 and W06-04 show bound self and isolated object state.' },
      { name: 'Avoid shared class-level mutable state', classification: 'taught-this-week', evidence: 'W06-03 requires executing the official incorrect and corrected examples.' },
    ],
    hiddenPrerequisitesFound: ['A broad OOP task could introduce inheritance, properties, or persistence before a beginner can observe one instance method and separate state.'],
    hiddenPrerequisitesRepaired: ['Bounded the model to one class, three attributes, three methods, five state cases, and a class-versus-instance repair; no inheritance or automatic JSON reconstruction is required.'],
    hiddenPrerequisitesRemaining: [],
    rationale: 'The library context gives classes a reason to exist while retaining an inspectable state machine. Every error message and transition is supplied.',
  },
  {
    buildId: 'PYIN-R2-B-W07-01', weekId: 'PYIN-R2-W07', readiness: 'YES',
    dependencies: [
      { name: 'Import local functions without starting application flow', classification: 'taught-this-week', evidence: 'W07-01 and W07-02 teach local modules and the __name__ guard.' },
      { name: 'Write value and exact-error unittest cases', classification: 'taught-this-week', evidence: 'W07-03 and W07-04 teach TestCase, verbose runner, assertEqual, and assertRaisesRegex.' },
      { name: 'Debug a single failing test', classification: 'taught-this-week', evidence: 'W07-05 gives an exact failing score defect, breakpoint, four values, repair, and focused/full rerun.' },
    ],
    hiddenPrerequisitesFound: ['A generic “write tests and debug” instruction would assume test discovery, import safety, error assertions, and debugger controls.'],
    hiddenPrerequisitesRepaired: ['Supplied a three-file tree, six named test contracts, exact command, main guard, one deterministic defect, breakpoint location, inspected values, and rerun order.'],
    hiddenPrerequisitesRemaining: [],
    rationale: 'Core Study plus two 105-minute Build sessions leaves time for assessment and Proof. The program stays in memory so module/test/debug boundaries remain the focus.',
  },
  {
    buildId: 'PYIN-R2-B-W08-01', weekId: 'PYIN-R2-W08', readiness: 'YES',
    dependencies: [
      { name: 'Declare a command-line contract with argparse', classification: 'taught-this-week', evidence: 'W08-01 teaches positional/optional values, type, choices, and generated help before the Build.' },
      { name: 'Persist, test, and debug the task rules', classification: 'established-previously', evidence: 'Weeks 5 and 7 prove the defensive storage, test, module, entry-point, and debugger contracts.' },
      { name: 'Create, document, inspect, and push a safe repository', classification: 'taught-this-week', evidence: 'W08-02 through W08-04 teach the empty remote, README, staged-path inspection, secret warning, and existing-project push.' },
      { name: 'Task record, commands, messages, and file responsibilities', classification: 'contextually-explained', evidence: 'The Build supplies one canonical record, exact commands/results/errors, file tree, test list, .gitignore, README, and acceptance table.' },
    ],
    hiddenPrerequisitesFound: ['An underspecified capstone would ask beginners to invent CLI syntax, statuses, ID rules, storage semantics, test cases, and safe publication while integrating the whole course.'],
    hiddenPrerequisitesRepaired: ['Fixed the complete contract and split work into 90, 90, and 60 minute sessions; supplied exact errors, eight tests, sanitized data rule, staged-file inspection, and fresh-perspective README verification.'],
    hiddenPrerequisitesRemaining: [],
    rationale: 'Only argparse and repository handoff are new. The 240-minute capstone plus bounded Study leaves assessment/Proof time inside six hours and every session remains below two hours.',
  },
];

export const editorialWeekReadiness = [
  { weekId: 'PYIN-R2-W01', answer: 'YES', evidence: 'A complete beginner gets a working starter, visual execution model, exact run path, input/conversion teaching, three fixed cases, and two distinct traceback repairs before independent work.' },
  { weekId: 'PYIN-R2-W02', answer: 'YES', evidence: 'Current beginner instruction, a bounded visual lecture, official ValueError guidance, and an active branch trace precede an exact seven-case eligibility contract.' },
  { weekId: 'PYIN-R2-W03', answer: 'YES', evidence: 'Loop choice, progress, lists, dictionaries, enumerate, and a visual accumulator trace precede a five-record project with explicit reject/stop behavior.' },
  { weekId: 'PYIN-R2-W04', answer: 'YES', evidence: 'Function, return, scope, and call-frame instruction precedes the first calculator-like integration; all arithmetic rules and intermediate expectations are fixed.' },
  { weekId: 'PYIN-R2-W05', answer: 'YES', evidence: 'Files are introduced visually and textually before Path and JSON precision; missing, malformed, restart, invalid, and alternate-launch cases are explicit.' },
  { weekId: 'PYIN-R2-W06', answer: 'YES', evidence: 'The learner sees the dictionary-to-class motivation, reads exact instance semantics, reproduces shared-state failure, and traces two objects before the Build.' },
  { weekId: 'PYIN-R2-W07', answer: 'YES', evidence: 'Local modules, the main guard, unittest structure, exact exception assertions, and a real VS Code debugging route precede a small supplied flashcard contract.' },
  { weekId: 'PYIN-R2-W08', answer: 'YES', evidence: 'The learner adds only argparse and safe GitHub handoff while reusing proven rules/storage/tests. A fully supplied capstone contract and 240-minute plan leave one hour for assessment and Proof.' },
];

export const editorialSemanticReview = {
  status: 'PASS',
  method: 'Human-led authoring and adversarial review checked the target learner, progression, every bounded resource assignment, all 80 answer keys and evidence mappings, each Build dependency, session workload, failure recovery, and publication integration. Deterministic validation consumes but does not create this judgment.',
  findingsReviewed: [
    'Rejected the withdrawn generated definition-card route and required externally inspectable teaching before every Build.',
    'Moved calculator-like work to Week 4 after values, decisions, loops, collections, and function contracts are established.',
    'Replaced vague weekly tasks with exact file trees, state/data contracts, normal/boundary/invalid cases, deliberate defects, and human-reviewable evidence.',
    'Separated missing-file recovery from malformed-data preservation and kept storage writes after successful validation only.',
    'Constrained classes to observable instance state and delayed module/test/debug integration until Week 7.',
    'Reviewed all 80 questions for source grounding, one defensible answer, plausible distractors, substantive feedback, target uniqueness, and balanced authored answer positions; runtime still reshuffles options each attempt.',
    'Kept every Build session under two hours and every Week within six hours, with setup outside the eight instructional Weeks.',
  ],
  adversarialResult: 'PASS after repair. No untaught D-class question remains, all eight Builds have zero unresolved hidden prerequisites, all resources have precise consumption boundaries, and the final learner path is comprehensive without becoming an unbounded external course dump.',
};

export const editorialRepairLedger = [
  { finding: 'Revision 1 relied on repeated generated concept cards instead of a genuine beginner learning route.', repair: 'Revision 2 assigns current bounded Microsoft Learn, CS50P, Python Tutor, VS Code, Python, and GitHub material before each assessment and Build.' },
  { finding: 'The earlier portfolio template led with calculator-like work and repeated the same generic format across languages.', repair: 'Python now begins with execution, input, conversion, and traceback repair; each Week has a distinct program and concept-appropriate modalities.' },
  { finding: 'Generic task language left boundaries, invalid cases, and finished state open to invention.', repair: 'Every Build now supplies exact contracts, starter scaffolds, expected cases, deliberate failure, acceptance criteria, and Proof.' },
  { finding: 'Quiz generation risked testing vocabulary or template metadata rather than assigned learning.', repair: 'All 80 questions are independently authored against explicit assessment targets and named Study resources; quiz items check interpretation while code performance remains in Build/Proof.' },
  { finding: 'Persistence could silently erase malformed learner data.', repair: 'Week 5 and the capstone recover only FileNotFoundError, propagate malformed JSON, prohibit failure-path writes, and require before/after evidence.' },
  { finding: 'Setup could consume instructional Weeks or force reinstalling working tools.', repair: 'A separate 105-minute capability checklist makes Python, VS Code, Git, and GitHub independently skippable after verification.' },
];
