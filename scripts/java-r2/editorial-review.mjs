// Human-authored release evidence. These judgments are deliberately maintained
// outside the compiler/validator so the Java R2 pipeline cannot approve its own
// educational quality merely because an object satisfies a schema.

export const editorialBuildAudits = [
  {
    buildId: 'JAVA-R2-B-W01-01', weekId: 'JAVA-R2-W01', readiness: 'YES',
    dependencies: [
      { name: 'Create, save, and run one Java class in IntelliJ', classification: 'taught-this-week', evidence: 'The Week 1 Study sequence establishes the saved-source, compiler, class-output, and JVM path before Build step S01 asks the learner to use it.' },
      { name: 'Compile and run the same class from PowerShell', classification: 'contextually-explained', evidence: 'Build step S03 supplies a project-relative src-to-out route; the acceptance record requires the exact command rather than assuming terminal fluency.' },
      { name: 'Use String and int values, /, %, concatenation, and println', classification: 'contextually-explained', evidence: 'The complete Main.java starter supplies each construct in a bounded 95-minute example; the learner changes values and traces output rather than inventing syntax.' },
      { name: 'Read compiler and stack-trace evidence', classification: 'taught-this-week', evidence: 'The study objective and Build steps S04-S05 require two different failures, the first useful message/location, one repair, and a clean rerun.' },
    ],
    hiddenPrerequisitesFound: [
      'A first-week arithmetic task could be mistaken for a calculator project and could assume operators before Java execution is understood.',
      'ArithmeticException would not occur in the final minutes calculation unless an explicit zero-divisor probe were supplied.',
    ],
    hiddenPrerequisitesRepaired: [
      'Kept the deliverable to fixed supplied values, labelled output, and a complete starter; input, branching, loops, and a calculator interface are explicitly prohibited.',
      'Build step S05 supplies the disposable divisor-zero defect and exact repair target, so the learner diagnoses a reproducible runtime failure rather than fabricating one.',
    ],
    hiddenPrerequisitesRemaining: [],
    rationale: 'Approved after bounding the work to two 90-minute sessions. The learner first proves the execution path, then makes small edits and two evidence-led repairs; this is a beginner-safe first practical, not an application-design challenge.',
  },
  {
    buildId: 'JAVA-R2-B-W02-01', weekId: 'JAVA-R2-W02', readiness: 'YES',
    dependencies: [
      { name: 'Declare and explain Java value types', classification: 'taught-this-week', evidence: 'Week 2 explicitly introduces declared types and the Build asks the learner to name each field type before implementation.' },
      { name: 'Read five console values without skipped lines', classification: 'taught-this-week', evidence: 'The Week 2 Scanner boundary is constrained to one Scanner and nextLine for every prompt; acceptance criterion A01 checks a spaced name and all five fields.' },
      { name: 'Convert numeric text to int', classification: 'taught-this-week', evidence: 'Age remains text until the explicit Integer.parseInt boundary; one invalid value is observed and recorded.' },
      { name: 'Compare String content instead of references', classification: 'taught-this-week', evidence: 'The supplied new String probe makes == and equals produce visibly different results before the learner repairs the commuter decision.' },
    ],
    hiddenPrerequisitesFound: [
      'Mixing Scanner token methods with line methods would create a newline bug unrelated to the Week goal.',
      'Handling bad numeric text here would require exception recovery before it is formally taught.',
    ],
    hiddenPrerequisitesRepaired: [
      'All prompts use nextLine, and trimming/parsing happen as separate visible steps.',
      'The invalid age is intentionally a recorded NumberFormatException only; the task explicitly delays try/catch until Week 3.',
    ],
    hiddenPrerequisitesRemaining: [],
    rationale: 'Approved because the input and output contracts are complete, four valid cases are fixed, the single invalid case is observational rather than a recovery requirement, and both 100-minute sessions remain below the two-hour limit.',
  },
  {
    buildId: 'JAVA-R2-B-W03-01', weekId: 'JAVA-R2-W03', readiness: 'YES',
    dependencies: [
      { name: 'Normalize and compare input text', classification: 'established-previously', evidence: 'Week 2 establishes trim and equalsIgnoreCase through the commuter decision.' },
      { name: 'Order if/else-if/else rules and preserve inclusive boundaries', classification: 'taught-this-week', evidence: 'The Study objective and supplied seven-case table fix validation order and exercise both minimum and maximum boundaries.' },
      { name: 'Use && and || deliberately', classification: 'taught-this-week', evidence: 'Build step S05 requires a reproducible operator defect, a truth table, the repaired expression, and a seven-case rerun.' },
      { name: 'Recover from invalid numeric text without hiding defects', classification: 'taught-this-week', evidence: 'The contract catches NumberFormatException only at the parse boundary and explicitly rejects catch(Exception).' },
    ],
    hiddenPrerequisitesFound: [
      'An eligibility checker can conflate invalid input, legitimate rejection, and success when branch precedence is unspecified.',
      'The phrase valid score is ambiguous without explicit inclusive limits and over-maximum behavior.',
    ],
    hiddenPrerequisitesRepaired: [
      'The Build fixes the first-match order: number conversion, age range, prerequisite, score range, then eligibility.',
      'Seven exact cases establish 16/50 and 120/100 as accepted boundaries and 15/121 as rejected ages.',
    ],
    hiddenPrerequisitesRemaining: [],
    rationale: 'Approved after the decision contract was made observable. Every branch has a named output and evidence case, and the only new recovery mechanism handles the exact conversion failure encountered in Week 2.',
  },
  {
    buildId: 'JAVA-R2-B-W04-01', weekId: 'JAVA-R2-W04', readiness: 'YES',
    dependencies: [
      { name: 'Keep a while loop moving toward a stop condition', classification: 'taught-this-week', evidence: 'The collection loop is governed by accepted list size, handles done before parsing, and adds only valid scores.' },
      { name: 'Respect zero-based fixed-array boundaries', classification: 'taught-this-week', evidence: 'The disposable three-element probe turns <= length into a specific ArrayIndexOutOfBoundsException before repair to < length.' },
      { name: 'Store a changing number of typed values in ArrayList', classification: 'taught-this-week', evidence: 'The Build uses ArrayList<Integer> only for accepted scores and records each size change.' },
      { name: 'Reject invalid numeric and range input', classification: 'established-previously', evidence: 'Week 3 establishes narrow numeric recovery and ordered range validation.' },
    ],
    hiddenPrerequisitesFound: [
      'A five-score requirement could accidentally count failed attempts, accept a sixth item, or divide by zero on an empty collection.',
      'Average calculation could silently truncate if both operands remain int.',
    ],
    hiddenPrerequisitesRepaired: [
      'The contract distinguishes attempts from accepted size, handles done first, caps accepted values at five, and requires a NO SCORES branch.',
      'The acceptance criteria explicitly require floating-point division and fixed expected summaries.',
    ],
    hiddenPrerequisitesRemaining: [],
    rationale: 'Approved because collection mutation and loop progress are visible after every input. Five supplied sessions cover early stop, full capacity, retry, boundaries, and empty state without introducing methods prematurely.',
  },
  {
    buildId: 'JAVA-R2-B-W05-01', weekId: 'JAVA-R2-W05', readiness: 'YES',
    dependencies: [
      { name: 'Define static method parameters and return types', classification: 'taught-this-week', evidence: 'The Week 5 method contracts name subtotal, discount, service fee, final total, and formatting responsibilities before implementation.' },
      { name: 'Compose returned values instead of relying on printing', classification: 'taught-this-week', evidence: 'Calculation helpers must return numeric values and may not read Scanner or print; main remains the I/O edge.' },
      { name: 'Traverse an ArrayList and apply conditions', classification: 'established-previously', evidence: 'Weeks 3-4 establish decisions, loops, ArrayList traversal, and numeric boundaries.' },
      { name: 'Reason about local scope and overload signatures', classification: 'taught-this-week', evidence: 'The task reproduces a missing-return or scope diagnostic and a duplicate signature that differs only by return type.' },
    ],
    hiddenPrerequisitesFound: [
      'Money examples can quietly demand decimal-rounding policy, locale formatting, or BigDecimal before those topics are taught.',
      'Discount and service-fee methods can double-count or apply operations in the wrong order when intermediate contracts are vague.',
    ],
    hiddenPrerequisitesRepaired: [
      'Input prices are integer naira, the formulas and four exact intermediate rows are supplied, and the course does not claim production accounting precision.',
      'The service fee is explicitly calculated after discount; every helper returns one amount and all intermediate values are recorded before formatting.',
    ],
    hiddenPrerequisitesRemaining: [],
    rationale: 'Approved as the first calculator-like integration only after values, decisions, loops, and collections. The learner is assessed on method boundaries and composition, not on inventing financial rules.',
  },
  {
    buildId: 'JAVA-R2-B-W06-01', weekId: 'JAVA-R2-W06', readiness: 'YES',
    dependencies: [
      { name: 'Define a class, constructor, private fields, and independent instances', classification: 'taught-this-week', evidence: 'Book has one supplied state model; two initial instances make per-object ownership observable before transitions.' },
      { name: 'Validate and change state through public behavior', classification: 'taught-this-week', evidence: 'checkout and returnBook reject blank/invalid transitions before mutation, while fields remain private.' },
      { name: 'Store and traverse objects in ArrayList', classification: 'taught-this-week', evidence: 'The task combines the established ArrayList operation with the newly taught Book type and requires calls through public behavior.' },
      { name: 'Use methods and returned values', classification: 'established-previously', evidence: 'Week 5 establishes method contracts, parameters, returns, and scope.' },
    ],
    hiddenPrerequisitesFound: [
      'A broad OOP project could require inheritance, interfaces, persistence, or design-pattern vocabulary before instance state is understood.',
      'Constructor shadowing and static instance data can look correct until a second object is exercised.',
    ],
    hiddenPrerequisitesRepaired: [
      'The Build is limited to one Book class, one Main class, three fields, focused methods, and five explicit state cases.',
      'The this-shadowing and static-field defects are intentionally reproduced across two instances and repaired with debugger/status evidence.',
    ],
    hiddenPrerequisitesRemaining: [],
    rationale: 'Approved because objects solve a concrete state problem and every transition is inspectable. Inheritance, frameworks, and file reconstruction are deliberately absent.',
  },
  {
    buildId: 'JAVA-R2-B-W07-01', weekId: 'JAVA-R2-W07', readiness: 'YES',
    dependencies: [
      { name: 'Read and write a predictable UTF-8 project-relative file', classification: 'taught-this-week', evidence: 'Path and Files own the fixed data/notes.txt location, explicit UTF-8 encoding, and line-oriented record boundary.' },
      { name: 'Distinguish a missing first-run file from malformed existing data', classification: 'taught-this-week', evidence: 'Only NoSuchFileException becomes empty state; wrong part counts and invalid IDs stop before any save.' },
      { name: 'Verify behavior through a dependency-free check harness', classification: 'taught-this-week', evidence: 'Checks.java has six named checks and an exact 6/6 summary, avoiding an unstated Maven, Gradle, or JUnit dependency.' },
      { name: 'Use the IntelliJ debugger on one stable failure', classification: 'taught-this-week', evidence: 'The supplied highest + 0 defect produces a deterministic ID failure and names the values to inspect before repair.' },
      { name: 'Use methods, lists, objects, and narrow exceptions', classification: 'established-previously', evidence: 'Weeks 3-6 establish the required recovery, collection, method, and simple-object techniques.' },
    ],
    hiddenPrerequisitesFound: [
      'A pipe-delimited format becomes ambiguous if topic or text may contain a pipe, and a generic catch could overwrite malformed learner data.',
      'A testing requirement could silently assume JUnit configuration or a build tool not introduced in the course.',
    ],
    hiddenPrerequisitesRepaired: [
      'The record grammar fixes exactly three parts and rejects malformed records; the required examples do not require escaped delimiters and that limitation stays visible.',
      'The file is copied/compared before and after the malformed case, writes occur only after successful validation, and the check harness is plain Java.',
    ],
    hiddenPrerequisitesRemaining: [],
    rationale: 'Approved after separating first run, valid restart, invalid input, and malformed storage. The two 105-minute sessions integrate several established skills, but the supplied grammar, checks, defect, and output keep the task bounded.',
  },
  {
    buildId: 'JAVA-R2-B-W08-01', weekId: 'JAVA-R2-W08', readiness: 'YES',
    dependencies: [
      { name: 'Validate a small command-line argument contract before indexing args', classification: 'taught-this-week', evidence: 'The Week 8 Study objective and exact add/list/complete/help contract introduce the only new program interface.' },
      { name: 'Model tasks and transitions with classes and focused methods', classification: 'established-previously', evidence: 'Weeks 5-6 establish method composition, private state, validation-before-mutation, and object collections.' },
      { name: 'Preserve valid data and refuse malformed storage', classification: 'established-previously', evidence: 'Week 7 proves the same missing-versus-malformed UTF-8 contract that TaskStore must reuse.' },
      { name: 'Run checks and debug one reproducible failure', classification: 'established-previously', evidence: 'Week 7 establishes the dependency-free harness and debugger workflow; Week 8 expands it to eight named domain/storage cases.' },
      { name: 'Document, inspect, and publish a secret-free repository', classification: 'taught-this-week', evidence: 'The Build supplies the tree, .gitignore, README headings, Git status inspection, empty remote route, and fresh-folder verification.' },
    ],
    hiddenPrerequisitesFound: [
      'A capstone phrased only as build a task manager would require beginners to invent commands, record syntax, error messages, architecture, tests, and delivery rules simultaneously.',
      'Publishing a repository can expose IntelliJ metadata, class files, credentials, or real task data when staged paths are not inspected.',
    ],
    hiddenPrerequisitesRepaired: [
      'The project fixes five classes, one record grammar, four commands, exact results/errors, eight check categories, and class ownership before implementation.',
      'A supplied .gitignore, sanitized empty data file, pre/post-stage status inspection, and fresh-perspective README run are required acceptance evidence.',
    ],
    hiddenPrerequisitesRemaining: [],
    rationale: 'Approved after splitting the 240-minute Build into 90, 90, and 60 minute sessions. Only args handling and repository handoff are new; domain behavior, persistence, checks, and debugging deliberately reuse proven Week 5-7 contracts.',
  },
];

export const editorialWeekReadiness = [
  { weekId: 'JAVA-R2-W01', answer: 'YES', evidence: 'A complete beginner receives a verified IntelliJ/JDK path, a complete Main starter, two run routes, fixed output, and two supplied defects. Independent program design, input, and control flow are explicitly deferred.' },
  { weekId: 'JAVA-R2-W02', answer: 'YES', evidence: 'Declared types, a single safe Scanner pattern, explicit parsing, and a visible == versus equals probe precede a five-field collector. Invalid numeric text is observed but recovery is intentionally deferred and stated.' },
  { weekId: 'JAVA-R2-W03', answer: 'YES', evidence: 'Seven exact outcomes make branch order, inclusive limits, normalization, numeric recovery, and &&/|| behavior observable before the learner writes the checker.' },
  { weekId: 'JAVA-R2-W04', answer: 'YES', evidence: 'Loop progress, stop-before-parse behavior, arrays, ArrayList, empty state, rejected attempts, floating-point average, and one explicit off-by-one repair are all bounded by five supplied sessions.' },
  { weekId: 'JAVA-R2-W05', answer: 'YES', evidence: 'Method contracts, parameters, returns, scope, and overload rules precede the first calculator-like project; supplied integer-naira rules and intermediate rows prevent hidden finance or rounding design work.' },
  { weekId: 'JAVA-R2-W06', answer: 'YES', evidence: 'One concrete Book model introduces independent instances and encapsulated transitions without inheritance. Five cases plus this/static defects expose the exact object-state misconceptions being assessed.' },
  { weekId: 'JAVA-R2-W07', answer: 'YES', evidence: 'The learner receives the line grammar, UTF-8 path, missing/malformed distinction, six-check contract, deterministic ID defect, and exact debugger record before integrating files, exceptions, checks, and debugging.' },
  { weekId: 'JAVA-R2-W08', answer: 'YES', evidence: 'The final Week introduces only args validation and safe GitHub handoff. Its complete command/data/class/check contract and three sub-two-hour sessions make the larger integration feasible for a beginner.' },
];

export const editorialSemanticReview = {
  status: 'PASS',
  method: 'Human-led adversarial review examined the tertiary-fresher target, all 23 competencies and 28 concepts, the eight Build contracts, prerequisite edges, deliberate failures, session limits, Proof requirements, and the intended Study-to-assessment mapping. Deterministic validation may consume this judgment but does not create it.',
  findingsReviewed: [
    'Rejected Revision 1’s repeated generated definition-card approach as insufficient instruction and required bounded external teaching plus active rehearsal before each assessment.',
    'Removed the calculator-first jump: Week 1 is a fixed student card, input begins in Week 2, decisions in Week 3, collections in Week 4, and the first calculator-like composition appears only with methods in Week 5.',
    'Chose one predictable Scanner pattern before exposing token/line mixing, then introduced narrow NumberFormatException recovery only after the learner has observed the failure.',
    'Separated fixed arrays from growable ArrayList and made rejected-attempt count, empty state, and off-by-one behavior explicit.',
    'Constrained the cafe example to supplied integer-naira rules and intermediate results; it does not claim production-grade currency precision.',
    'Constrained OOP to one observable class and independent state before adding persistence, checks, or CLI integration.',
    'Separated missing-file recovery from malformed-record preservation and required before/after evidence so failure paths cannot silently erase data.',
    'Avoided hidden Maven, Gradle, and JUnit prerequisites by using javac/java-compatible source trees and dependency-free check harnesses.',
    'Required every graded question to map to a named assigned resource and assessment target, to have one defensible answer with plausible Java-specific distractors, and to use varied authored answer positions before runtime reshuffling.',
    'Kept every Build session at or below 105 minutes and the final capstone sessions at 90, 90, and 60 minutes; setup remains separate from the eight instructional Weeks.',
  ],
  adversarialResult: 'PASS after the recorded repairs. The remaining simplifications—integer-naira arithmetic, unescaped pipe-delimited records, and a plain-Java check harness—are explicit beginner constraints rather than hidden production claims. No Build requires an unresolved competency outside the established or currently taught path.',
};

export const editorialRepairLedger = [
  { finding: 'Revision 1 repeated generated concept cards and generic task language across courses.', repair: 'Revision 2 uses a Java-specific execution-to-CLI progression, curated external Study assignments, active traces, explicit contracts, and language-specific failure modes.' },
  { finding: 'The withdrawn route asked beginners to perform application-like arithmetic before they could distinguish source, compilation, and execution.', repair: 'Week 1 now uses a complete fixed-value student-card starter; console input, decisions, loops, and calculator-like work arrive in separate later Weeks.' },
  { finding: 'Scanner teaching can create skipped-input failures when token and line methods are mixed too early.', repair: 'Week 2 standardizes on one Scanner plus nextLine and explicit parsing; the newline trap is taught without requiring the risky pattern in the Build.' },
  { finding: 'Generic Java equality and exception advice can encourage == for String or catch(Exception) around the program.', repair: 'Revision 2 includes an executable reference-versus-content probe and catches only NumberFormatException at its conversion boundary.' },
  { finding: 'Collections and loops can hide attempt-count, empty-state, truncation, and index-boundary defects.', repair: 'The score tracker fixes accepted-count semantics, a five-value maximum, NO SCORES behavior, floating-point average, and an isolated array-boundary repair.' },
  { finding: 'A cafe calculator can smuggle in untaught finance precision or ambiguous operation order.', repair: 'The Build uses integer-naira inputs, supplied formulas and intermediate rows, explicit discount-before-fee order, and describes itself as an instructional quote rather than accounting software.' },
  { finding: 'A broad OOP assignment can introduce inheritance and architecture before a learner understands independent instances.', repair: 'The library task uses one Book class, private fields, five state cases, and two targeted this/static defects; inheritance and frameworks are excluded.' },
  { finding: 'File recovery can overwrite malformed learner data, while testing requirements can hide framework setup.', repair: 'Week 7 distinguishes missing from malformed files, prohibits failure-path writes, compares the malformed file before/after, and supplies a dependency-free six-check harness.' },
  { finding: 'An open-ended capstone would overload beginners with interface, persistence, architecture, test, and publication decisions.', repair: 'StudySprint fixes commands, records, classes, messages, checks, README, .gitignore, evidence, and staged-path safety, leaving implementation and explanation as the learner work.' },
  { finding: 'Setup could consume an instructional Week or force reinstalling already working tools.', repair: 'A separate capability-based setup verifies JDK, IntelliJ, PowerShell, Git, and GitHub independently and permits each proven capability to be skipped.' },
];
