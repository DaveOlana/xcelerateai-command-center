// Human-authored release evidence. This file is deliberately not derived from
// Curriculum Source fields so deterministic compilation cannot approve its own
// pedagogical decisions.

export const editorialBuildAudits = [
  {
    buildId: 'JSIN-R2-B-W01-01', weekId: 'JSIN-R2-W01', readiness: 'YES',
    dependencies: [
      { name: 'Edit, save, and run one JavaScript file', classification: 'taught-this-week', evidence: 'W01-01 demonstrates the folder/file flow and W01-02 gives the exact node filename command before the Build.' },
      { name: 'Enter and leave the source folder in PowerShell', classification: 'taught-this-week', evidence: 'W01-02 now supplies an exact parent-folder, `cd ./week-01`, run, `cd ..`, wrong-folder observation, and recovery sequence before the check.' },
      { name: 'Distinguish a saved script from the REPL', classification: 'taught-this-week', evidence: 'W01-03 has the learner run three disposable expressions and exit the REPL before explaining why welcome.js is saved.' },
      { name: 'Read a basic syntax error location', classification: 'taught-this-week', evidence: 'The Core run route plus the ordered missing-quote step names the file, line, marker, repair, and unchanged rerun.' },
    ],
    hiddenPrerequisitesFound: ['The quiz and first Build required changing folders even though the target learner was assumed to have no command-line knowledge and the original assignment never taught `cd`.'],
    hiddenPrerequisitesRepaired: ['Expanded W01-02 into an exact PowerShell folder-navigation, wrong-folder failure, and recovery exercise before assessment.'],
    hiddenPrerequisitesRemaining: [],
    rationale: 'The learner changes only console output, one quote, and one terminal command. The starter contains the first complete program, and 35 minutes of Core Study plus two 90-minute sessions leave substantial Week time for assessment, Proof, and reflection.',
  },
  {
    buildId: 'JSIN-R2-B-W02-01', weekId: 'JSIN-R2-W02', readiness: 'YES',
    dependencies: [
      { name: 'Choose const or let deliberately', classification: 'taught-this-week', evidence: 'W02-02 teaches declarations, reassignment, naming, and const-by-default with runnable Node examples.' },
      { name: 'Recognize value types including the typeof null quirk', classification: 'taught-this-week', evidence: 'W02-01 and the repaired W02-03 boundary cover number, string, Boolean, null, undefined, and typeof before the check.' },
      { name: 'Convert numeric text before arithmetic', classification: 'taught-this-week', evidence: 'W02-04 and W02-05 expose concatenation, explicit conversion, precedence, and a visible state trace.' },
      { name: 'Insert calculated values into labelled output', classification: 'taught-this-week', evidence: 'W02-06 now teaches the exact backtick and `${expression}` form, contrasts ordinary quotes, and feeds a source-aligned Skill Check item before the Build.' },
    ],
    hiddenPrerequisitesFound: ['The Build required template-literal output, but the original bounded Study route taught arithmetic and conversion without teaching interpolation syntax.'],
    hiddenPrerequisitesRepaired: ['Added a live-inspected bounded MDN interpolation route and replaced a redundant typeof item with a template-literal question tied to that route.'],
    hiddenPrerequisitesRemaining: [],
    rationale: 'All input values are configured in the starter rather than collected interactively. The normal and zero-remainder cases can be calculated independently, and both interpolation and the deliberate concatenation defect are directly taught.',
  },
  {
    buildId: 'JSIN-R2-B-W03-01', weekId: 'JSIN-R2-W03', readiness: 'YES',
    dependencies: [
      { name: 'Strict comparisons and explicit Boolean rules', classification: 'taught-this-week', evidence: 'W03-01 through W03-04 teach branch tracing, strict equality, if/else order, and AND/OR/NOT with fixed values.' },
      { name: 'Validate converted numbers', classification: 'taught-this-week', evidence: 'W03-05 supplies the exact Number conversion plus Number.isFinite guard used before the age rule.' },
      { name: 'Configured values and output', classification: 'established-previously', evidence: 'Week 2 established const, Boolean and numeric values, conversion, and labelled template-literal output.' },
    ],
    hiddenPrerequisitesFound: ['The first Build contract required list membership but omitted the not-on-list case from required verification.', 'One quiz explanation used mathematical chained-range notation, which is not a valid JavaScript range check.', 'The logical-operator reading boundary asked learners to move sequentially past advanced sections it also told them to skip.'],
    hiddenPrerequisitesRepaired: ['Required six explicit cases now include age-16 boundary acceptance, not-on-list rejection, and invalid text.', 'The quiz now teaches `age >= 16 && age <= 120` and explicitly warns against chained comparison notation.', 'The W03-04 assignment now gives three named non-contiguous reading stops and one exact range task through the page navigation.'],
    hiddenPrerequisitesRemaining: [],
    rationale: 'The Build avoids prompts and asynchronous input. Six fixed cases expose branch order, list rejection, a lower boundary, and validation; every required operator appears in current Core Study or an established Week 2 competency.',
  },
  {
    buildId: 'JSIN-R2-B-W04-01', weekId: 'JSIN-R2-W04', readiness: 'YES',
    dependencies: [
      { name: 'Create, index, search, and measure an array', classification: 'taught-this-week', evidence: 'W04-01 and W04-02 teach array creation, first/last access, length, push/pop, and indexOf with immediate Node practice.' },
      { name: 'Traverse a collection with a safe boundary', classification: 'taught-this-week', evidence: 'W04-03 through W04-05 teach and visualize counted and for...of loops, accumulators, and the index < length boundary.' },
      { name: 'Guard an empty-data calculation', classification: 'established-previously', evidence: 'Week 3 established explicit if/else decisions; the Build supplies the exact no-division-by-zero requirement.' },
    ],
    hiddenPrerequisitesFound: ['The first contract allowed a for...of scoreboard but later assumed that its main loop had an index condition available to break.'],
    hiddenPrerequisitesRepaired: ['Added a supplied standalone boundary-demo.js so every valid scoreboard style can reproduce, observe, and repair the <= off-by-one defect without rewriting the main solution.'],
    hiddenPrerequisitesRemaining: [],
    rationale: 'A six-number starter case keeps arithmetic inspectable. One-score and empty-list cases isolate data boundaries, while the separate counted-loop demo guarantees a visible undefined result and repair for every learner.',
  },
  {
    buildId: 'JSIN-R2-B-W05-01', weekId: 'JSIN-R2-W05', readiness: 'YES',
    dependencies: [
      { name: 'Define functions with parameters and returned values', classification: 'taught-this-week', evidence: 'W05-01 through W05-04 teach named functions, parameter/argument roles, local scope, return values, and a visual call trace.' },
      { name: 'Iterate item prices and calculate totals', classification: 'established-previously', evidence: 'Week 4 established array traversal and numeric accumulators; Week 2 established arithmetic and formatted output.' },
      { name: 'Discount, fee, and expected totals', classification: 'contextually-explained', evidence: 'The repaired Build fixes prices at [1200, 800, 500], makes the discount and fee helpers return amounts rather than totals, defines total = subtotal - discountAmount + feeApplied, and supplies expected totals 2450, 2700, and 0.' },
    ],
    hiddenPrerequisitesFound: ['The original contract omitted the discount rate, packaging fee, sample prices, and independently checkable totals.', 'The first repair made the packaging helper return amount plus fee while the total formula treated its result as fee only.'],
    hiddenPrerequisitesRepaired: ['The learner guide and case table now define the arithmetic contract and expected totals 2450, 2700, and 0.', 'Renamed the helper calculatePackagingFee and made its contract return only 200 or 0; the main formula now composes three amount-returning helpers without double-counting subtotal.'],
    hiddenPrerequisitesRemaining: [],
    rationale: 'The repaired fixed arithmetic removes guesswork. Each helper has one stated result, and the missing-return experiment demonstrates composition without introducing callbacks or arrow functions.',
  },
  {
    buildId: 'JSIN-R2-B-W06-01', weekId: 'JSIN-R2-W06', readiness: 'YES',
    dependencies: [
      { name: 'Create and update named object properties', classification: 'taught-this-week', evidence: 'W06-02 is deliberately first in Study and teaches object literals, dot/bracket access, and property updates before JSON appears.' },
      { name: 'Construct simple class instances and call one method', classification: 'taught-this-week', evidence: 'W06-03 is bounded to class declaration, constructor, new, instance data, and one method.' },
      { name: 'Stringify and parse JSON data', classification: 'taught-this-week', evidence: 'W06-01 introduces the data shape after object basics; W06-04 and W06-05 then teach and trace the exact round trip and method loss.' },
    ],
    hiddenPrerequisitesFound: ['The JSON video originally appeared before the first object-literal lesson.', 'After reordering, two learner-facing next actions still described the obsolete sequence.'],
    hiddenPrerequisitesRepaired: ['Study ordering now places object basics before the JSON overview, class lesson, detailed JSON route, and trace.', 'Aligned the object and JSON cards so their next actions now follow the assembled Study order exactly.'],
    hiddenPrerequisitesRemaining: [],
    rationale: 'The Build remains in memory and explicitly forbids unstudied filesystem code. A supplied class scaffold plus three records makes the instance/plain-record comparison small enough to inspect.',
  },
  {
    buildId: 'JSIN-R2-B-W07-01', weekId: 'JSIN-R2-W07', readiness: 'YES',
    dependencies: [
      { name: 'Connect local ECMAScript modules', classification: 'taught-this-week', evidence: 'W07-02 teaches type: module, named exports, matching imports, relative paths, and .js extensions.' },
      { name: 'Read, parse, serialize, and write UTF-8 JSON', classification: 'taught-this-week', evidence: 'W07-03 and W07-04 provide the bounded synchronous small-file operations; Week 6 already established parse/stringify.' },
      { name: 'Recover only a genuinely missing file', classification: 'taught-this-week', evidence: 'W07-07 teaches conditional catch and rethrow; W07-08 identifies error.code === ENOENT; the defensive loader scaffold combines them.' },
      { name: 'Perform case-insensitive search', classification: 'taught-this-week', evidence: 'W07-09, W07-11, and W07-12 separately teach lowercase normalization, surrounding-space removal, and boolean substring matching before the learner combines them.' },
      { name: 'Write synchronous built-in tests', classification: 'taught-this-week', evidence: 'W07-05 supplies the test API; required W07-06 now teaches strictEqual, deepStrictEqual, and assert.throws with exact name/message validation; named-function scaffolds avoid arrow syntax.' },
      { name: 'Pause and inspect a failing decision', classification: 'taught-this-week', evidence: 'Required readable W07-10 supplies the complete failing debug-search.js case and exact node inspect, debugger-statement, cont, watch, repl, next, repair, and cleanup path; W07-01 remains an optional visual demonstration.' },
      { name: 'Task record and pure-function behavior', classification: 'contextually-explained', evidence: 'The repaired brief fixes the task shape, first ID 1, highest-plus-one rule, exact TypeError/RangeError messages, search behavior, returned arrays, and success/failure no-mutation contracts before coding begins.' },
    ],
    hiddenPrerequisitesFound: ['try/catch and a reliable missing-file discriminator were not taught', 'trim, lowercase normalization, and substring-search syntax were not all taught', 'the debugger route referred to a supplied failing case that did not exist and omitted a usable pause mechanism', 'the repaired debugger card was initially ordered before the trim, lowercase, and includes cards it uses', 'four learner-facing next actions still followed the pre-repair Week 7 order', 'the test scaffold used an unexplained arrow callback', 'task shape and add/complete/find return contracts were ambiguous', 'The first rejection repair still failed to define the thrown error classes/messages, first empty-list ID, or the assert.throws technique required to test those promises.'],
    hiddenPrerequisitesRepaired: ['Added bounded conditional-catch and ENOENT resources plus a defensive loader scaffold', 'Added separate bounded trim, toLowerCase, and includes practice before the exact search contract', 'Supplied an exact debug-search.js defect plus debugger-statement, command, observation, repair, and cleanup instructions, then reused the same defect inside the Build', 'Added an explicit Week 7 order: modules, files, error handling, the three string operations, tests, then optional/readable debugger routes', 'Aligned every Week 7 next action with that prerequisite order and the correct Persistent Study Task Tracker destination', 'Replaced the arrow with a named synchronous test-body pattern and explicit explanation', 'Defined the task shape, ID rule, rejection behavior, returned arrays, blank search result, and no-mutation guarantee', 'Made the assert reference required, bounded it to exact synchronous error assertions, fixed first ID at 1, supplied stable TypeError/RangeError messages, and aligned the quiz and test scaffold to that contract.'],
    hiddenPrerequisitesRemaining: [],
    rationale: 'The repaired 126-minute Core route plus 195-minute Build leaves 39 minutes for the Skill Check, Proof, and reflection. Every file and function has a stated responsibility, error contracts are directly assertable, and inaccessible video does not block the complete required readable debugger path.',
  },
  {
    buildId: 'JSIN-R2-B-W08-01', weekId: 'JSIN-R2-W08', readiness: 'YES',
    dependencies: [
      { name: 'Read and dispatch command-line arguments', classification: 'taught-this-week', evidence: 'W08-04 teaches process.argv.slice(2); the Build reads args[0] and later indexes without destructuring.' },
      { name: 'Pure rules, modules, defensive persistence, tests, and debugging', classification: 'established-previously', evidence: 'Week 7 requires and proves the same architecture and storage contracts in the smaller Study Task Tracker.' },
      { name: 'Write a reproducible README and publish safely', classification: 'taught-this-week', evidence: 'W08-01 through W08-03 teach repository creation, README purpose, the exact existing-project push path, secret warning, and staged-file inspection.' },
      { name: 'FoundIt command and record contract', classification: 'contextually-explained', evidence: 'The supplied contract fixes numeric IDs, open/claimed status values, exact quoted commands, searchable fields, display lines, success/error messages, usage text, save rules, and eight required tests before implementation.' },
    ],
    hiddenPrerequisitesFound: ['A Skill Check option and concept example originally required untaught array destructuring.', 'The original 330-minute Build made the six-hour Week impossible before assessment and Proof.', 'The first repaired capstone still asked beginners to invent numeric-or-string IDs, status values, command signatures, searchable fields, and rejection outputs while claiming those contracts were defined.', 'The project required a `.gitignore` and staged-file safety check without supplying ignore rules or an executable inspection/removal sequence to a learner with no assumed Git knowledge.'],
    hiddenPrerequisitesRepaired: ['Rewrote the concept, assessment, and Build to use previously taught index access.', 'Reduced and regrouped the capstone sessions to 90, 90, and 60 minutes while retaining every acceptance criterion.', 'Supplied one canonical numeric-ID record model, five exact command forms, exact output/error/help text, three searchable fields, safe save rules, function starters, and aligned acceptance cases.', 'Supplied the exact `.gitignore`, sanitized-data rule, two `git status --short` inspections, `git rm --cached -- <path>` recovery, and free-account browser/Credential Manager first-push route.'],
    hiddenPrerequisitesRemaining: [],
    rationale: 'The four Core resources take 60 minutes and the capstone takes 240, leaving 60 minutes for its ten-question check, Proof, and reflection. The project is larger in scope than Week 7 but reuses proven boundaries instead of adding hidden language features.',
  },
];

export const editorialWeekReadiness = [
  { weekId: 'JSIN-R2-W01', answer: 'YES', evidence: 'A no-experience learner receives a complete five-line starter, exact `cd` and run sequence, REPL contrast, wrong-path/syntax repair, and two 90-minute sessions. Required Study plus Build uses 215 of 360 minutes.' },
  { weekId: 'JSIN-R2-W02', answer: 'YES', evidence: 'Video, readable type/binding routes, operator practice, a bounded template-literal lesson, and a visual trace precede a configured-input budget. Core Study (107m) plus Build (210m) leaves 43m for the check, Proof, and reflection; no terminal input API is assumed.' },
  { weekId: 'JSIN-R2-W03', answer: 'YES', evidence: 'Five bounded resources move from branch prediction to comparison, logic, and numeric validation. Six fixed cases now prove acceptance, the age-16 boundary, age/ticket/list rejections, and invalid text without prompts or a library.' },
  { weekId: 'JSIN-R2-W04', answer: 'YES', evidence: 'Array and loop videos are paired with readable routes and a visual trace. The scoreboard handles one-score and empty-list boundaries, while a supplied separate index-loop demo guarantees the required off-by-one experiment regardless of the chosen main-loop form.' },
  { weekId: 'JSIN-R2-W05', answer: 'YES', evidence: 'Functions are introduced visually, explained in readable pages, and traced before the Build. The repaired 10%-discount/200-fee contract gives the learner and reviewer identical expected totals.' },
  { weekId: 'JSIN-R2-W06', answer: 'YES', evidence: 'Object basics now precede JSON, then classes, detailed serialization, and a trace. The learner saves sample JSON manually, so filesystem persistence remains outside the Week.' },
  { weekId: 'JSIN-R2-W07', answer: 'YES', evidence: 'The required readable route now teaches modules, file I/O, conditional error handling, ENOENT, trim/lowercase/substring search, value/error assertions, tests, and a fully supplied debugger exercise. Core Study (126m) plus Build (195m) leaves 39m for check, Proof, and reflection.' },
  { weekId: 'JSIN-R2-W08', answer: 'YES', evidence: 'Only process arguments and safe repository handoff are new; program structure and persistence were proven in Week 7. The supplied ignore file and exact staged-path inspection remove Git-policy invention. Core Study (60m) plus three capstone sessions (240m) leaves 60m for check, Proof, and reflection.' },
];

export const editorialSemanticReview = {
  status: 'PASS',
  method: 'Two independent adversarial passes inspected the authored source, question mappings, bounded assignments, Build dependencies, repository integration, and workload. They reported concrete blockers rather than approving by default. The primary final pass repaired every reported item, re-imported all authored modules, reread the changed contracts, and reran deterministic source, resource, content, Studio, Skill Check, workload, syntax, and diff checks. The compiler did not create or change this decision.',
  findingsReviewed: [
    'Rejected the withdrawn definition-card learning route and required externally inspectable teaching before every Build.',
    'Found and repaired the Week 8 workload overflow rather than treating two-hour session caps as sufficient evidence.',
    'Found and repaired missing try/catch, ENOENT, trim/lowercase/includes, exact thrown-error assertions, test-body, and executable debugger-practice bridges in Week 7.',
    'Found and repaired the invalid chained-range explanation, omitted Week 3 list case, Week 4 loop-style contradiction, untaught destructuring assessment, Week 2 type and interpolation boundaries, Week 6 ordering error, Week 5 fee double-counting contract, and ambiguous Week 7/8 contracts.',
    'Found and repaired an untaught Week 1 `cd` dependency, obsolete Week 6 navigation, Week 5 semantic question duplication, Week 7 book/item vocabulary drift and unsupported architecture questions, and a pre-check Week 8 policy question that was defined only in the later Build.',
    'Found and repaired the Week 8 `.gitignore`, staged-path inspection, accidental-file removal, sanitized-data, and first-push authentication scaffolding instead of assuming prior Git knowledge.',
    'Reviewed all 80 answer keys, evidence mappings, distractors, explanations, assessment targets, and shuffled key distribution.',
  ],
  adversarialResult: 'PASS after repair. Independent reviewers surfaced hidden prerequisites and mapping drift through the final sweep; every reported blocker has an inspectable repair, no D-class question remains, all eight Builds have zero unresolved hidden prerequisites, and the final primary recheck found no remaining learner-facing release blocker.',
};

export const editorialRepairLedger = [
  { finding: 'R1 used generated concept definitions as its primary Study experience.', repair: 'Every R2 Week begins with bounded external instruction or practice selected for the exact competency.' },
  { finding: 'R1 opened with a calculator-like task before a runnable mental model.', repair: 'Week 1 now saves, predicts, reruns, breaks, and repairs a five-line Campus Welcome Card.' },
  { finding: 'The original Node test Learn URL was unavailable and its replacement lacked runnable examples.', repair: 'Selected the current node:test API introduction and bounded it before advanced testing features.' },
  { finding: 'FoundIt originally assumed process.argv and later used untaught destructuring.', repair: 'Added the official process.argv route and limited the concept, assessment, and Build to slice plus index access.' },
  { finding: 'Week 8 Study plus Build consumed 390 minutes before assessment or Proof.', repair: 'Replanned the capstone into 90, 90, and 60 minute sessions; the Week now reserves 60 minutes for check, Proof, and reflection.' },
  { finding: 'Week 7 asked learners to preserve malformed files and search case-insensitively without teaching the required error/string operations, and its debugger card named a supplied case that did not exist.', repair: 'Added bounded try/catch, ENOENT, trim, toLowerCase, and includes routes; supplied an executable debug-search.js case and exact debugger workflow; and added explicit task, loader, and test-body scaffolds.' },
  { finding: 'Week 3 omitted a required list-rejection case and used invalid chained-range notation; Week 4 assumed every valid scoreboard used an index loop.', repair: 'Required six explicit Week 3 cases, taught the two-comparison range form, and supplied a separate Week 4 boundary demo that works beside either taught main-loop style.' },
  { finding: 'Week 2 required template literals without a bounded lesson; Week 5 arithmetic was initially under-specified, then its first repair double-counted subtotal.', repair: 'Added a live-inspected interpolation lesson and aligned quiz item; defined fee-only and discount-only helper returns plus the exact total formula and fixed cases.' },
  { finding: 'Week 7 rejection behavior and Week 8 capstone contracts still required learner invention after the first repair.', repair: 'Defined exact Week 7 IDs/errors/assertions and a canonical Week 8 record, commands, messages, search fields, save rules, starters, and acceptance cases.' },
  { finding: 'Week 6 introduced JSON before object literals.', repair: 'Reordered Study so object basics comes first, followed by JSON orientation, classes, detailed JSON, and active tracing.' },
  { finding: 'Week 1 assessed and required `cd` while claiming no prior command-line knowledge.', repair: 'Added an exact enter, run, leave, fail, inspect, and recover PowerShell sequence before the first check.' },
  { finding: 'Late assessment review found repeated return-value coverage, Week 7 vocabulary drift, unsupported architecture/policy items, and stale competency metadata.', repair: 'Replaced the duplicates with directly taught invocation, ESM, assertion, and Git-publication targets; aligned task vocabulary and every repaired competency/evidence mapping.' },
  { finding: 'The final project named `.gitignore` and staged-file review without teaching or scaffolding either action.', repair: 'Supplied the ignore file, sanitized data rule, exact status commands, safe unstage correction, and free GitHub first-push authentication path.' },
  { finding: 'Setup metadata is not rendered by the current frontend.', repair: 'Retained formal setup metadata and exposed each independently skippable verification path through existing optional Week 1 cards.' },
];
