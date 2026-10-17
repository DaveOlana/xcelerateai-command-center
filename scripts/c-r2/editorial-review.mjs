export const editorialBuildAudits = [
  {
    buildId: 'CLNG-R2-B-W01-01', weekId: 'CLNG-R2-W01', readiness: 'YES',
    dependencies: [
      { name: 'Compile a saved C17 source file and run the executable', classification: 'taught-this-week', evidence: 'The Study route separates source, GCC build, linking, executable output, and the exact warning-enabled PowerShell commands before the Build.' },
      { name: 'Declare initialized int, double, and char objects', classification: 'taught-this-week', evidence: 'The bounded beginner lesson and reference show declarations, initialization, and matching printf conversions before the learner edits the supplied profile starter.' },
      { name: 'Read compiler diagnostics before editing', classification: 'taught-this-week', evidence: 'The Build supplies one format warning and one missing-semicolon error with a fixed reproduce-read-repair-rerun protocol.' },
    ],
    hiddenPrerequisitesFound: ['A blank-file task would require the learner to invent program structure before learning what main, compilation, or a diagnostic means.', 'A first-week input or calculator task would introduce addresses, conversion counts, arithmetic policy, and validation too early.'],
    hiddenPrerequisitesRepaired: ['A complete starter and exact expected profile output constrain Week 1 to reading, compiling, editing initialized values, and repairing evidence.', 'Input and arithmetic are explicitly deferred to Week 2; Week 1 uses only fixed values and formatted output.'],
    hiddenPrerequisitesRemaining: [],
    rationale: 'Approved for a complete beginner because the deliverable is a fixed student card, not an open-ended application, and both 90-minute sessions stay below the two-hour limit.',
  },
  {
    buildId: 'CLNG-R2-B-W02-01', weekId: 'CLNG-R2-W02', readiness: 'YES',
    dependencies: [
      { name: 'Read two integers through writable addresses', classification: 'taught-this-week', evidence: 'The Study route introduces scanf addresses and requires checking a conversion count of two before either object is used.' },
      { name: 'Distinguish integer quotient, remainder, and decimal division', classification: 'taught-this-week', evidence: 'The learner predicts and runs the same minute total through /, %, and conversion-before-division examples.' },
      { name: 'Compile, run, and interpret warning output', classification: 'established-previously', evidence: 'Week 1 establishes the exact C17 warning command and a read-before-edit diagnostic routine.' },
    ],
    hiddenPrerequisitesFound: ['scanf examples often use values after a failed conversion or omit the address-of operator.', 'Assigning integer division to double can look like floating-point arithmetic after the fraction has already been lost.'],
    hiddenPrerequisitesRepaired: ['The conversion-count branch stops before using either value and the nonnumeric case is required evidence.', 'A deliberate truncation probe records operands and moves the cast before division before the final rerun.'],
    hiddenPrerequisitesRemaining: [],
    rationale: 'Approved because the planner has one bounded two-integer contract, three fixed cases, and no loop, menu, branch architecture, or calculator design burden.',
  },
  {
    buildId: 'CLNG-R2-B-W03-01', weekId: 'CLNG-R2-W03', readiness: 'YES',
    dependencies: [
      { name: 'Order invalid, boundary, unsuccessful, and successful decisions', classification: 'taught-this-week', evidence: 'The Week fixes the branch precedence and six expected results before implementation.' },
      { name: 'Combine registration and attendance requirements with &&', classification: 'taught-this-week', evidence: 'A truth table and deliberate || defect make the complete rule observable before repair.' },
      { name: 'Reject a zero divisor before percentage arithmetic', classification: 'established-previously', evidence: 'Week 2 establishes predictable arithmetic; current Study explicitly requires held > 0 before division.' },
    ],
    hiddenPrerequisitesFound: ['An eligibility checker can accidentally calculate with zero classes or merge invalid data with a legitimate ineligible result.', 'A percentage boundary is ambiguous without a stated inclusive threshold.'],
    hiddenPrerequisitesRepaired: ['The contract validates scan success, registration flag, class counts, and attended range before calculation.', 'Exactly 75 percent, just below 75 percent, and unregistered cases have named expected outputs.'],
    hiddenPrerequisitesRemaining: [],
    rationale: 'Approved after branch order and boundaries were specified as data rather than left for a beginner to invent.',
  },
  {
    buildId: 'CLNG-R2-B-W04-01', weekId: 'CLNG-R2-W04', readiness: 'YES',
    dependencies: [
      { name: 'Keep an input loop moving toward a fixed capacity', classification: 'taught-this-week', evidence: 'The trace records index, accepted count, candidate value, and next condition; only accepted scores advance storage.' },
      { name: 'Traverse only initialized array elements', classification: 'taught-this-week', evidence: 'The Study route distinguishes element count from last valid index and the Build summarizes indexes 0 through count - 1.' },
      { name: 'Initialize totals, minimum, and maximum deliberately', classification: 'taught-this-week', evidence: 'The empty case is separated and minimum/maximum begin from the first accepted score rather than an invented sentinel.' },
    ],
    hiddenPrerequisitesFound: ['A score tracker can read uninitialized slots, count rejected attempts, divide by zero, or cross the array boundary.', 'A dangerous out-of-bounds exercise is unnecessary for demonstrating an off-by-one defect.'],
    hiddenPrerequisitesRepaired: ['The contract caps accepted values, prevents partial invalid summaries, and provides a named empty branch.', 'The deliberate defect safely omits the last initialized element, then repairs < count without requiring undefined behavior.'],
    hiddenPrerequisitesRemaining: [],
    rationale: 'Approved because capacity, accepted count, traversal range, and summary initial state are all visible in the supplied trace and five-case contract.',
  },
  {
    buildId: 'CLNG-R2-B-W05-01', weekId: 'CLNG-R2-W05', readiness: 'YES',
    dependencies: [
      { name: 'Declare focused function contracts and return calculated values', classification: 'taught-this-week', evidence: 'The header and implementation responsibilities are fixed before coding; calculation helpers do not own terminal input or presentation.' },
      { name: 'Explain pass-by-value through an observable probe', classification: 'taught-this-week', evidence: 'A supplied parameter-reassignment probe compares the local parameter with the unchanged caller object.' },
      { name: 'Compile and link every translation unit', classification: 'taught-this-week', evidence: 'The learner first reproduces an undefined-reference failure, then builds main.c and calculator.c together.' },
      { name: 'Validate before division', classification: 'established-previously', evidence: 'Week 3 establishes validation-before-dependent-arithmetic and the operation contract names zero-divisor behavior.' },
    ],
    hiddenPrerequisitesFound: ['A generic calculator task would make the beginner invent an interface, operation set, error policy, and file layout simultaneously.', 'Header guards and linker errors can be mistaken for ordinary syntax topics when no translation-unit model is supplied.'],
    hiddenPrerequisitesRepaired: ['The Build fixes the operation set, seven cases, three-file tree, function signatures, and error behavior.', 'The Study route explains declarations versus definitions and the Build captures both the incomplete and corrected linker commands.'],
    hiddenPrerequisitesRemaining: [],
    rationale: 'Approved as the first calculator-like work only after values, input, decisions, loops, and arrays; the learning target is decomposition and linking, not feature invention.',
  },
  {
    buildId: 'CLNG-R2-B-W06-01', weekId: 'CLNG-R2-W06', readiness: 'YES',
    dependencies: [
      { name: 'Store bounded NUL-terminated text', classification: 'taught-this-week', evidence: 'The Study route distinguishes array capacity from current text length and the Build rejects overlong input instead of truncating silently.' },
      { name: 'Dereference only a pointer to a live object', classification: 'taught-this-week', evidence: 'Search returns an address inside main\'s live directory array or NULL; no pointer to a returned local temporary is allowed.' },
      { name: 'Model and update coherent struct records', classification: 'taught-this-week', evidence: 'Student groups ID, name, and score; dot and arrow use is tied to object versus pointer form.' },
      { name: 'Traverse a fixed initialized range', classification: 'established-previously', evidence: 'Week 4 establishes count-bounded array traversal and empty/full cases.' },
    ],
    hiddenPrerequisitesFound: ['Beginner string tasks can conceal buffer overflow, missing terminators, or the false assumption that == compares text.', 'Pointer exercises can introduce dangling addresses or unexplained allocation before object lifetime is understood.'],
    hiddenPrerequisitesRepaired: ['The task uses fixed arrays, explicit capacities, overlong rejection, and a required strcmp defect/repair record.', 'No dynamic allocation is used; every successful pointer result names an element in the still-live fixed directory array.'],
    hiddenPrerequisitesRemaining: [],
    rationale: 'Approved because string storage, pointer validity, structs, search, and update converge on one bounded six-case directory without dynamic-memory prerequisites.',
  },
  {
    buildId: 'CLNG-R2-B-W07-01', weekId: 'CLNG-R2-W07', readiness: 'YES',
    dependencies: [
      { name: 'Read and write one documented text-record grammar', classification: 'taught-this-week', evidence: 'The id|minutes|subject grammar, maximum counts, checked reads, and checked parses are supplied before implementation.' },
      { name: 'Preserve malformed or unreadable existing state', classification: 'taught-this-week', evidence: 'Only a genuinely missing first-run file becomes empty state; malformed data must stop before replacement and is compared before/after.' },
      { name: 'Inspect a deterministic defect in the debugger', classification: 'taught-this-week', evidence: 'The duplicate-next-ID failure, breakpoint location, expected values, and same-case rerun are all specified.' },
      { name: 'Run a dependency-free check harness', classification: 'taught-this-week', evidence: 'Six named checks compare actual and expected values without requiring a third-party C test framework.' },
    ],
    hiddenPrerequisitesFound: ['Treating every fopen failure as empty state can destroy inaccessible or malformed learner data.', 'A testing requirement could silently require an unintroduced package manager or framework.'],
    hiddenPrerequisitesRepaired: ['Missing, other open failure, malformed record, normal EOF, I/O error, and close failure are distinguished before any save.', 'The check helpers are supplied as ordinary C functions compiled with the same GCC toolchain already in use.'],
    hiddenPrerequisitesRemaining: [],
    rationale: 'Approved after the storage grammar, failure matrix, six checks, debugger target, and no-mutation proof made the integration bounded and reviewable.',
  },
  {
    buildId: 'CLNG-R2-B-W08-01', weekId: 'CLNG-R2-W08', readiness: 'YES',
    dependencies: [
      { name: 'Validate argc before reading argv', classification: 'taught-this-week', evidence: 'The exact add, list, complete, and help forms are supplied and every route begins with an argument-count check.' },
      { name: 'Reuse bounded records, persistence, and failure preservation', classification: 'established-previously', evidence: 'Weeks 6-7 establish structs, bounded strings, pointers to live records, checked parsing, and no-mutation failure paths.' },
      { name: 'Run a visible behavioral check suite and debug one failure', classification: 'established-previously', evidence: 'Week 7 establishes the dependency-free harness and reproducible debugger workflow; Week 8 expands the cases without adding a framework.' },
      { name: 'Publish a source-only GitHub repository safely', classification: 'taught-this-week', evidence: 'The Build supplies the README contract, ignore rules, staged-path inspection, sanitized sample policy, and fresh-clone verification.' },
    ],
    hiddenPrerequisitesFound: ['An open-ended C capstone would force a beginner to invent commands, storage syntax, module ownership, checks, error messages, and delivery policy at once.', 'Generated executables, editor paths, credentials, or personal records can be published accidentally.'],
    hiddenPrerequisitesRepaired: ['The command forms, record grammar, file responsibilities, twelve acceptance cases, and eight checks are fixed before implementation.', 'Source-only staging, .gitignore, sanitized data, pre-push inspection, and a fresh-clone README run are required evidence.'],
    hiddenPrerequisitesRemaining: [],
    rationale: 'Approved after splitting the 240-minute final Build into 90, 90, and 60 minute sessions and limiting new material to argv routing and safe repository handoff.',
  },
];

export const editorialWeekReadiness = [
  { weekId: 'CLNG-R2-W01', answer: 'YES', evidence: 'A complete starter, fixed output, exact GCC/PowerShell commands, and two supplied diagnostics let a computer-literate beginner compile, edit, repair, and explain without inventing program structure.' },
  { weekId: 'CLNG-R2-W02', answer: 'YES', evidence: 'The learner receives one bounded two-integer input contract, checked conversion count, visible address use, and separate quotient/remainder/decimal predictions before implementing the planner.' },
  { weekId: 'CLNG-R2-W03', answer: 'YES', evidence: 'A fixed branch order, six outcomes, an inclusive 75-percent boundary, and a truth-table repair make validation and Boolean behavior observable.' },
  { weekId: 'CLNG-R2-W04', answer: 'YES', evidence: 'Accepted count, array capacity, initialized range, empty state, accumulator state, and a safe off-by-one defect are supplied and traceable.' },
  { weekId: 'CLNG-R2-W05', answer: 'YES', evidence: 'The first calculator-like Build arrives only after prerequisite syntax and uses fixed operations, signatures, files, cases, and linker evidence to teach functions and translation units.' },
  { weekId: 'CLNG-R2-W06', answer: 'YES', evidence: 'Fixed-capacity strings, a live-array lifetime, NULL search, one struct model, and six cases constrain pointers and records without dynamic allocation.' },
  { weekId: 'CLNG-R2-W07', answer: 'YES', evidence: 'A complete record grammar, explicit failure matrix, six-check harness, deterministic debugger target, and malformed-file no-mutation proof bound the persistence work.' },
  { weekId: 'CLNG-R2-W08', answer: 'YES', evidence: 'The capstone fixes commands, modules, records, cases, checks, repository policy, and evidence; only argv routing and publication are newly introduced.' },
];

export const editorialSemanticReview = {
  status: 'PASS',
  method: 'Human-led adversarial review examined the complete-beginner target, all 25 competencies and 34 concepts, every weekly Study assignment and question mapping, eight Build contracts, prerequisite edges, C-specific safety failures, session limits, and human-review Proof. Deterministic validation consumes this judgment but does not create it.',
  findingsReviewed: [
    'Rejected Revision 1\'s repeated generated definition-card route and required bounded current external teaching plus active prediction, compilation, tracing, or inspection before each Skill Check.',
    'Kept Week 1 to source, compilation, execution, typed fixed values, printf, and diagnostics; scanf begins in Week 2 and the first calculator-like work appears only in Week 5.',
    'Made conversion counts, address-of, integer truncation, zero-divisor validation, short-circuit rules, and inclusive boundaries observable before they are assessed.',
    'Avoided undefined-behavior demonstrations where a safe omission defect can teach the same boundary lesson; warning-clean C17 builds remain mandatory.',
    'Separated declarations, definitions, translation units, and linker failures before asking the learner to maintain a multi-file program.',
    'Constrained strings and pointers to fixed-capacity arrays and live objects; dynamic allocation, pointer arithmetic, and production parsing remain outside this beginner boundary.',
    'Distinguished missing first-run data from malformed or unreadable existing data and required byte/hash evidence that failure paths preserve the file.',
    'Used a plain-C check harness so verification adds no hidden framework, package-manager, or network prerequisite.',
    'Mapped every graded item to inspected Study resources, wrote language-specific distractors, distributed authored correct positions, and retained runtime reshuffling.',
    'Kept all Build sessions at or below 110 minutes, separated setup from the 48 instructional hours, and reserved Week 8 for integration rather than a surge of untaught concepts.',
  ],
  adversarialResult: 'PASS after the recorded repairs. Fixed capacities, a simple text grammar, scanf for bounded numeric input, and dependency-free checks are explicit instructional constraints rather than production-safety claims. No required Build depends on an unresolved competency.',
};

export const editorialRepairLedger = [
  { finding: 'Revision 1 repeated generic concept-card prose instead of supplying a credible beginner learning route.', repair: 'Revision 2 uses inspected external explanations, demonstrations, interactive practice, and precise references with exact start, consume, stop, outcome, and next-action boundaries.' },
  { finding: 'A calculator-first introduction would combine syntax, input, decisions, arithmetic policy, and error handling before the learner can compile or diagnose C.', repair: 'Week 1 is a fixed student profile; input begins in Week 2, decisions in Week 3, iteration in Week 4, and calculator-like decomposition in Week 5.' },
  { finding: 'Unchecked scanf results and incorrect addresses can make invalid input look like ordinary program data.', repair: 'Every required numeric input contract checks the exact conversion count before use and explicitly connects each conversion to a writable object address.' },
  { finding: 'Array-bound mistakes are dangerous to demonstrate through actual out-of-bounds access.', repair: 'The intentional Week 4 defect safely omits the final initialized element, then repairs the loop boundary and explains why <= count would be invalid.' },
  { finding: 'Generic function lessons can hide the distinction between compilation and linking.', repair: 'Week 5 captures a real undefined-reference result from an omitted translation unit and repairs the exact GCC command.' },
  { finding: 'Strings and pointers can silently introduce buffer overflow, dangling lifetime, dynamic allocation, and identity-versus-content confusion.', repair: 'Week 6 uses fixed capacities, overlong rejection, live array elements, NULL, strcmp, and no dynamic allocation.' },
  { finding: 'Naive file recovery can erase malformed learner data.', repair: 'Week 7 distinguishes absence from failure, parses every record completely, prohibits failure-path writes, and proves malformed-file byte preservation.' },
  { finding: 'An open-ended final project would require beginners to invent architecture and safety policy while integrating C.', repair: 'LabTrack fixes commands, modules, record grammar, result messages, cases, checks, Git hygiene, and evidence while leaving implementation and explanation to the learner.' },
  { finding: 'Setup could consume one of the eight instructional Weeks or force needless reinstalls.', repair: 'Setup is separate, capability-based, and independently skippable only after GCC, GDB, VS Code, Git, and GitHub verification.' },
];
