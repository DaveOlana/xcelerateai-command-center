const OPTION_IDS = Object.freeze(['a', 'b', 'c', 'd']);

// Authored positions are deliberately irregular and nearly balanced across the
// course. The learner runtime reshuffles options again for every attempt.
const ANSWER_POSITIONS = Object.freeze({
  1: [2, 0, 3, 1, 3, 2, 0, 1, 2, 0],
  2: [1, 3, 0, 2, 0, 2, 1, 3, 1, 0],
  3: [3, 1, 2, 0, 2, 0, 3, 1, 0, 2],
  4: [0, 2, 1, 3, 1, 3, 2, 0, 3, 1],
  5: [2, 1, 3, 0, 3, 0, 2, 1, 0, 3],
  6: [1, 0, 2, 3, 0, 3, 1, 2, 3, 0],
  7: [3, 2, 0, 1, 2, 1, 3, 0, 1, 2],
  8: [0, 3, 1, 2, 1, 2, 0, 3, 2, 1],
});

const makeQuestion = (week, number, {
  competencyIds,
  target,
  supportingResourceIds,
  assessmentType,
  prompt,
  options,
  correct,
  explanation,
  classification = 'A',
}) => {
  const targetCorrect = ANSWER_POSITIONS[week][number - 1];
  const orderedOptions = [...options];
  [orderedOptions[correct], orderedOptions[targetCorrect]] = [orderedOptions[targetCorrect], orderedOptions[correct]];

  return Object.freeze({
    id: `CLNG-R2-Q-W${String(week).padStart(2, '0')}-${String(number).padStart(2, '0')}`,
    weekId: `CLNG-R2-W${String(week).padStart(2, '0')}`,
    competencyIds: Object.freeze(competencyIds.map((id) => id.replace(/^CLNG-C/, 'CLNG-R2-C'))),
    target,
    classification,
    supportingResourceIds: Object.freeze([...supportingResourceIds]),
    assessmentType,
    prompt,
    options: Object.freeze(OPTION_IDS.map((id, index) => Object.freeze({ id, label: orderedOptions[index] }))),
    correctOptionId: OPTION_IDS[targetCorrect],
    explanation,
  });
};

const week = (number, records) => Object.freeze(records.map((record, index) => makeQuestion(number, index + 1, record)));

export const questionsByWeek = Object.freeze({
  'CLNG-R2-W01': week(1, [
    {
      competencyIds: ['CLNG-C001'], target: 'Run the intended compiled executable from PowerShell', supportingResourceIds: ['CLNG-R2-W01-03'], assessmentType: 'command selection',
      prompt: 'GCC has created `out\\profile.exe`, and PowerShell is open at the project root. Which command runs that executable?',
      options: ['`gcc .\\out\\profile.exe`', '`run out profile.c`', '`.\\out\\profile.exe`', '`profile.c -o out`'], correct: 2,
      explanation: '`.\\out\\profile.exe` names the executable relative to the current PowerShell folder. GCC creates the executable; it is not the command used to run it.',
    },
    {
      competencyIds: ['CLNG-C002'], target: 'Order source compilation linking and execution', supportingResourceIds: ['CLNG-R2-W01-01', 'CLNG-R2-W01-02'], assessmentType: 'execution-pipeline reasoning',
      prompt: 'Which sequence best describes the path from `main.c` to visible program output?',
      options: ['Write C source, compile and link it into an executable, then run that executable', 'Run the source first, then ask GCC to recover the executed program', 'Link a README into source, then open the source as an executable', 'Create an executable first, then translate it into editable C source'], correct: 0,
      explanation: 'The `.c` file is source text. GCC translates it and the linker resolves required code into an executable, which the operating system can then run.',
    },
    {
      competencyIds: ['CLNG-C002'], target: 'Recognize the standard no-argument program entry point', supportingResourceIds: ['CLNG-R2-W01-01'], assessmentType: 'syntax recognition',
      prompt: 'Which declaration provides the standard no-argument entry point used by this week\'s C program?',
      options: ['`void start()`', '`main = int()`', '`int program(void)`', '`int main(void)`'], correct: 3,
      explanation: '`int main(void)` declares the standard entry function with no command-line parameters. The returned integer communicates program termination status.',
    },
    {
      competencyIds: ['CLNG-C004'], target: 'Match printf conversions to argument types', supportingResourceIds: ['CLNG-R2-W01-04'], assessmentType: 'formatted-output selection',
      prompt: '`name` is a character string and `level` is an int. Which statement prints both with matching conversions?',
      options: ['`printf("%d | %s\\n", name, level);`', '`printf("%s | %d\\n", name, level);`', '`printf(name, level, "%s%d");`', '`printf("name | level\\n");`'], correct: 1,
      explanation: '`%s` expects a string argument and `%d` expects an int. The arguments must appear in the same order as their conversion specifications.',
    },
    {
      competencyIds: ['CLNG-C004'], target: 'Predict a typed assignment and update', supportingResourceIds: ['CLNG-R2-W01-01', 'CLNG-R2-W01-04'], assessmentType: 'value prediction',
      prompt: 'What does this code print: `int completed = 2; completed = completed + 1; printf("%d", completed);`?',
      options: ['2', '21', 'A compiler command', '3'], correct: 3,
      explanation: '`completed + 1` performs integer addition and the assignment stores 3 back in `completed`. `%d` then prints that integer value.',
    },
    {
      competencyIds: ['CLNG-C003'], target: 'Classify a missing-semicolon diagnostic', supportingResourceIds: ['CLNG-R2-W01-02', 'CLNG-R2-W01-03'], assessmentType: 'failure classification',
      prompt: 'A missing semicolon causes GCC to stop before producing an updated executable. What kind of failure is this?',
      options: ['A Git publication failure', 'A valid run with a wrong result', 'A compile-time source error', 'A successful link with no output'], correct: 2,
      explanation: 'GCC must accept the source before linking a new executable. A syntax error such as the missing semicolon prevents that compile step from succeeding.',
    },
    {
      competencyIds: ['CLNG-C003'], target: 'Repair the first useful compiler diagnostic before unrelated edits', supportingResourceIds: ['CLNG-R2-W01-02'], assessmentType: 'debugging-strategy selection',
      prompt: 'One missing quote produces several later compiler messages. What is the strongest first repair move?',
      options: ['Read the earliest useful message and location, repair that source line, then compile again', 'Change every later line before rerunning the same compiler command', 'Delete the source because multiple messages prove it cannot be repaired', 'Run the previous executable and treat its output as evidence of the edit'], correct: 0,
      explanation: 'One malformed token can confuse parsing of later lines. Repairing the earliest useful cause and recompiling gives clearer evidence than making unrelated changes.',
    },
    {
      competencyIds: ['CLNG-C001', 'CLNG-C003'], target: 'Diagnose stale executable output after a source edit', supportingResourceIds: ['CLNG-R2-W01-02', 'CLNG-R2-W01-03'], assessmentType: 'workflow diagnosis',
      prompt: 'The learner changes a printed name in `main.c`, but the executable still shows the old name. The run path is correct. What should be checked first?',
      options: ['Whether GitHub already contains the source', 'Whether the file was saved and GCC successfully rebuilt the executable', 'Whether the terminal background color changed', 'Whether the executable was renamed to `.c`'], correct: 1,
      explanation: 'Running an old executable does not read the current source text. The source must be saved and a successful rebuild must replace the executable before the output can change.',
    },
    {
      competencyIds: ['CLNG-C003', 'CLNG-C004'], target: 'Treat a format warning as evidence of a type mismatch', supportingResourceIds: ['CLNG-R2-W01-02', 'CLNG-R2-W01-04'], assessmentType: 'warning interpretation',
      prompt: 'GCC warns that `%d` expects an int but the supplied argument is a string. What is the principled response?',
      options: ['Ignore it because warnings cannot describe real defects', 'Change the variable name while leaving the mismatch', 'Match the conversion and argument type, then rebuild with warnings enabled', 'Remove all format conversions so no value is printed'], correct: 2,
      explanation: 'A printf format mismatch makes the call invalid and can produce unreliable behavior. The conversion and argument type should agree before the program is accepted.',
    },
    {
      competencyIds: ['CLNG-C002', 'CLNG-C003'], target: 'Recognize the evidence boundary of successful compilation', supportingResourceIds: ['CLNG-R2-W01-02'], assessmentType: 'evidence-boundary reasoning',
      prompt: 'GCC finishes without errors and creates `profile.exe`. What has this result established?',
      options: ['The source compiled and linked, but required output still needs to be run and checked', 'Every requirement and displayed value is automatically correct', 'The executable has already been reviewed on GitHub', 'No future input can make the program behave incorrectly'], correct: 0,
      explanation: 'A successful build proves that the toolchain accepted and linked this source. It does not prove that the observable behavior satisfies the program contract.',
    },
  ]),

  'CLNG-R2-W02': week(2, [
    {
      competencyIds: ['CLNG-C005'], target: 'Pass an int address to scanf', supportingResourceIds: ['CLNG-R2-W02-01', 'CLNG-R2-W02-02'], assessmentType: 'input-call selection',
      prompt: '`minutes` is an int. Which call gives `scanf` the address where a converted integer should be stored?',
      options: ['`scanf("%d", minutes);`', '`scanf("%d", &minutes);`', '`scanf(minutes, "%d");`', '`scanf("&d", %minutes);`'], correct: 1,
      explanation: '`%d` requests integer conversion, and `&minutes` supplies the address of the int object that should receive the converted value.',
    },
    {
      competencyIds: ['CLNG-C005'], target: 'Interpret scanf conversion count', supportingResourceIds: ['CLNG-R2-W02-01', 'CLNG-R2-W02-02'], assessmentType: 'return-value interpretation',
      prompt: 'The program calls `scanf("%d", &minutes)` and receives return value 1. What does that 1 mean?',
      options: ['One byte was reserved for minutes', 'The entered integer must equal 1', 'The input stream has exactly one character', 'One requested conversion succeeded and was assigned'], correct: 3,
      explanation: '`scanf` reports how many requested input items were successfully converted and assigned. For this one-conversion call, 1 is the success result.',
    },
    {
      competencyIds: ['CLNG-C005'], target: 'Reject failed numeric conversion before using the destination', supportingResourceIds: ['CLNG-R2-W02-02'], assessmentType: 'input-failure reasoning',
      prompt: '`scanf("%d", &minutes)` returns 0 after the user enters `ninety`. What is the safe interpretation?',
      options: ['No integer conversion succeeded, so the program must not calculate with minutes', 'The value ninety was converted to integer 90', 'End of file was reached after a successful assignment', 'The compiler replaced the destination with zero'], correct: 0,
      explanation: 'A return of 0 means the next input did not match `%d`, so no new integer was assigned. Using the destination as if conversion succeeded would make the result untrustworthy.',
    },
    {
      competencyIds: ['CLNG-C006'], target: 'Predict integer division', supportingResourceIds: ['CLNG-R2-W02-03'], assessmentType: 'expression prediction',
      prompt: 'With `int minutes = 95;`, what value does `minutes / 60` produce?',
      options: ['1.5833', '35', '1', '95'], correct: 2,
      explanation: 'Both operands are integers, so C integer division discards the fractional part of the quotient. The result is 1.',
    },
    {
      competencyIds: ['CLNG-C006'], target: 'Use remainder for leftover minutes', supportingResourceIds: ['CLNG-R2-W02-03'], assessmentType: 'expression prediction',
      prompt: 'With `int minutes = 95;`, what does `minutes % 60` produce?',
      options: ['35', '1', '60', '1.5833'], correct: 0,
      explanation: 'The remainder after one complete group of 60 is 35. `%` provides that integer remainder.',
    },
    {
      competencyIds: ['CLNG-C006'], target: 'Convert before division to retain a fractional quotient', supportingResourceIds: ['CLNG-R2-W02-03', 'CLNG-R2-W02-04'], assessmentType: 'conversion-order selection',
      prompt: 'Which expression calculates 95 minutes as approximately 1.583 hours rather than truncating to 1?',
      options: ['`(double)(minutes / 60)`', '`minutes / (int)60.0`', '`(double)minutes / 60`', '`minutes % 60`'], correct: 2,
      explanation: 'Converting `minutes` before division makes one operand double, so floating-point division occurs. Converting only after integer division preserves the already-truncated result.',
    },
    {
      competencyIds: ['CLNG-C006'], target: 'Trace multiplication before addition', supportingResourceIds: ['CLNG-R2-W02-03'], assessmentType: 'operator-precedence prediction',
      prompt: 'What value is assigned by `int total = 2 + 3 * 4;`?',
      options: ['20', '14', '24', '9'], correct: 1,
      explanation: 'Multiplication has higher precedence than addition, so `3 * 4` is evaluated first and 2 is then added, giving 14.',
    },
    {
      competencyIds: ['CLNG-C006'], target: 'Use parentheses to express the intended grouping', supportingResourceIds: ['CLNG-R2-W02-03'], assessmentType: 'expression repair',
      prompt: 'A planner should multiply the sum of weekday and weekend sessions by 2. Which expression states that grouping?',
      options: ['`weekday + weekend * 2`', '`weekday * weekend + 2`', '`weekday + (weekend * 2)`', '`(weekday + weekend) * 2`'], correct: 3,
      explanation: 'Parentheses make the addition happen first, so the combined session count is multiplied by 2. Without them only the weekend value would be doubled.',
    },
    {
      competencyIds: ['CLNG-C006'], target: 'Format a double with two digits after the decimal point', supportingResourceIds: ['CLNG-R2-W02-04'], assessmentType: 'formatted-output selection',
      prompt: '`hours` is a double. Which statement prints it with two digits after the decimal point?',
      options: ['`printf("%d\\n", hours);`', '`printf("%.2f\\n", hours);`', '`printf("%s\\n", &hours);`', '`printf(hours, ".2");`'], correct: 1,
      explanation: 'For printf, `%f` consumes a double, and `.2` requests two digits after the decimal point. `%d` and `%s` expect different argument types.',
    },
    {
      competencyIds: ['CLNG-C005', 'CLNG-C006'], target: 'Sequence successful conversion before arithmetic', supportingResourceIds: ['CLNG-R2-W02-02', 'CLNG-R2-W02-03'], assessmentType: 'workflow sequencing',
      prompt: 'Which sequence gives the study-time calculation a trustworthy numeric input?',
      options: ['Read minutes, require one successful conversion, then calculate quotient and remainder', 'Calculate with minutes first, then check whether scanf succeeded', 'Assume failed conversion means zero and continue without reporting it', 'Use the address of minutes as the number of study hours'], correct: 0,
      explanation: 'The conversion result establishes whether a valid integer was stored. Arithmetic should begin only after that precondition is known to hold.',
    },
  ]),

  'CLNG-R2-W03': week(3, [
    {
      competencyIds: ['CLNG-C007', 'CLNG-C009'], target: 'Reject invalid ranges before eligibility rules', supportingResourceIds: ['CLNG-R2-W03-01', 'CLNG-R2-W03-03'], assessmentType: 'branch-order reasoning',
      prompt: 'A score must be between 0 and 100 before an eligibility rule uses it. Which decision belongs first after successful input conversion?',
      options: ['The eligible result', 'The highest grade label', 'The completed-prerequisite result', 'The invalid-range rejection'], correct: 3,
      explanation: 'An out-of-range score is invalid data rather than an ordinary eligible or ineligible result. Rejecting it first prevents later rules from assigning a misleading outcome.',
    },
    {
      competencyIds: ['CLNG-C008'], target: 'Express an inclusive score range', supportingResourceIds: ['CLNG-R2-W03-02'], assessmentType: 'condition selection',
      prompt: 'Which condition is true for every valid score from 0 through 100, including both boundaries?',
      options: ['`score > 0 && score < 100`', '`score >= 0 && score <= 100`', '`score >= 0 || score <= 100`', '`score < 0 && score > 100`'], correct: 1,
      explanation: '`>=` and `<=` include the boundary values, while `&&` requires the same score to satisfy both limits.',
    },
    {
      competencyIds: ['CLNG-C008'], target: 'Distinguish equality comparison from assignment', supportingResourceIds: ['CLNG-R2-W03-02', 'CLNG-R2-W03-04'], assessmentType: 'bug diagnosis',
      prompt: 'A condition uses `if (score = 50)` when it intends to compare score with 50. What is the smallest repair?',
      options: ['Use `if (score == 50)`', 'Use `if (score && 50)`', 'Use `if (&score = 50)`', 'Use `if (score % 50)`'], correct: 0,
      explanation: '`=` assigns a value, while `==` compares two values. Replacing the assignment operator with equality expresses the stated decision.',
    },
    {
      competencyIds: ['CLNG-C008'], target: 'Require two eligibility conditions together', supportingResourceIds: ['CLNG-R2-W03-02'], assessmentType: 'logical-operator selection',
      prompt: 'A learner is eligible only when `score >= 50` and `completed_practical` is nonzero. Which expression requires both?',
      options: ['`score >= 50 || completed_practical`', '`score >= 50 && completed_practical`', '`score = 50 && "yes"`', '`!score >= 50`'], correct: 1,
      explanation: '`&&` is true only when both operands are true. `||` would accept a learner who satisfies only one requirement.',
    },
    {
      competencyIds: ['CLNG-C008', 'CLNG-C009'], target: 'Use short-circuit evaluation to guard division', supportingResourceIds: ['CLNG-R2-W03-02', 'CLNG-R2-W03-03'], assessmentType: 'safety-condition reasoning',
      prompt: 'Which condition checks that `count` is nonzero before evaluating `total / count > 50`?',
      options: ['`total / count > 50 && count != 0`', '`count == 0 || total / count > 50`', '`count != 0 && total / count > 50`', '`count = 0 && total / count > 50`'], correct: 2,
      explanation: 'For `&&`, a false left operand stops evaluation of the right operand. Placing `count != 0` first prevents the division when count is zero.',
    },
    {
      competencyIds: ['CLNG-C007'], target: 'Trace first-match behavior in an if else-if chain', supportingResourceIds: ['CLNG-R2-W03-01'], assessmentType: 'control-flow prediction',
      prompt: 'In one `if`/`else if`/`else` chain, the first condition is true and a later condition would also be true. Which block runs?',
      options: ['Only the first matching block', 'Every block whose condition is true', 'Only the final else block', 'A matching block chosen by the compiler'], correct: 0,
      explanation: 'An if/else-if chain selects its first true branch and skips the remaining branches in that chain.',
    },
    {
      competencyIds: ['CLNG-C008'], target: 'Recognize an out-of-range condition', supportingResourceIds: ['CLNG-R2-W03-02'], assessmentType: 'condition interpretation',
      prompt: 'A valid percentage is 0 through 100. Which condition detects a value outside that range?',
      options: ['`score >= 0 && score <= 100`', '`score == 0 && score == 100`', '`score > 0 || score < 100`', '`score < 0 || score > 100`'], correct: 3,
      explanation: 'A score is invalid when it falls below the lower bound or above the upper bound, so the two invalid cases are joined with `||`.',
    },
    {
      competencyIds: ['CLNG-C009'], target: 'Validate a divisor before performing division', supportingResourceIds: ['CLNG-R2-W03-03'], assessmentType: 'unsafe-operation diagnosis',
      prompt: 'A program calculates `total / subjects` and only afterward checks whether subjects is zero. Why is that order defective?',
      options: ['The check changes total into text', 'The unsafe division has already been evaluated before the guard', 'The compiler always treats subjects as a string', 'The later check forces every result to zero'], correct: 1,
      explanation: 'A precondition must be checked before the operation it protects. Once the division expression is evaluated, a later guard cannot make that earlier evaluation safe.',
    },
    {
      competencyIds: ['CLNG-C007', 'CLNG-C009'], target: 'Keep invalid input distinct from legitimate ineligibility', supportingResourceIds: ['CLNG-R2-W03-01', 'CLNG-R2-W03-03'], assessmentType: 'outcome-classification reasoning',
      prompt: 'Input conversion succeeded, but age is 250. What should a defensive eligibility checker report?',
      options: ['Invalid age rather than an ordinary ineligible result', 'Eligible because conversion succeeded', 'Ineligible only because every large number fails', 'Compiler error because 250 is not an integer'], correct: 0,
      explanation: 'Successful conversion proves only that the text represented an integer. Domain validation still rejects 250 as invalid before eligibility rules run.',
    },
    {
      competencyIds: ['CLNG-C007', 'CLNG-C008'], target: 'Preserve an inclusive lower eligibility boundary', supportingResourceIds: ['CLNG-R2-W03-01', 'CLNG-R2-W03-02'], assessmentType: 'boundary-case prediction',
      prompt: 'The contract accepts score 50 when the practical is complete. For `score = 50` and `completed_practical = 1`, what should the decision be?',
      options: ['Invalid because 50 cannot be a boundary', 'Ineligible because only scores above 50 pass', 'Eligible because `score >= 50` includes equality and the second condition is true', 'Undefined because logical operators cannot use int values'], correct: 2,
      explanation: '`>=` includes 50, and the nonzero practical flag is true. Both operands of the required `&&` condition therefore hold.',
    },
  ]),

  'CLNG-R2-W04': week(4, [
    {
      competencyIds: ['CLNG-C011'], target: 'Traverse every initialized array element without crossing the bound', supportingResourceIds: ['CLNG-R2-W04-02'], assessmentType: 'loop-bound selection',
      prompt: '`count` is the number of initialized scores in `scores`. Which loop header visits indices 0 through `count - 1`?',
      options: ['`for (int i = 0; i < count; i++)`', '`for (int i = 1; i <= count; i++)`', '`for (int i = 0; i <= count; i++)`', '`for (int i = count; i > 0; i++)`'], correct: 0,
      explanation: 'A count of N gives valid initialized indices 0 through N-1. Starting at 0 and continuing while `i < count` visits exactly those positions.',
    },
    {
      competencyIds: ['CLNG-C011'], target: 'Diagnose an array off-by-one access', supportingResourceIds: ['CLNG-R2-W04-02', 'CLNG-R2-W04-04'], assessmentType: 'boundary-bug diagnosis',
      prompt: 'A five-element array is traversed with `i <= 5`. What is the defect when `i` becomes 5?',
      options: ['The loop repeats index 0', 'The array grows to six elements', 'Index 5 is outside the valid range 0 through 4', 'The compiler converts index 5 into index 4'], correct: 2,
      explanation: 'Array indexing starts at zero, so five elements end at index 4. Accessing index 5 is outside the array and does not have defined behavior.',
    },
    {
      competencyIds: ['CLNG-C011'], target: 'Include the final initialized element in traversal', supportingResourceIds: ['CLNG-R2-W04-02'], assessmentType: 'omission diagnosis',
      prompt: '`count` is 5, but a loop uses `i < count - 1`. Which initialized index is omitted?',
      options: ['Index 0', 'Index 1', 'Index 5', 'Index 4'], correct: 3,
      explanation: 'The condition becomes `i < 4`, so the loop stops after index 3. Index 4 is valid and initialized but never visited.',
    },
    {
      competencyIds: ['CLNG-C010'], target: 'Keep a while loop moving toward its stop condition', supportingResourceIds: ['CLNG-R2-W04-01'], assessmentType: 'loop-progress diagnosis',
      prompt: 'A loop begins with `int i = 0;` and continues while `i < count`, but its body never changes i. What is the likely result when count is positive?',
      options: ['The loop condition becomes false automatically', 'The loop can continue indefinitely at the same index', 'The array is sorted after one iteration', 'The compiler supplies `i++` after the body'], correct: 1,
      explanation: 'If i remains 0, the same true condition and array position repeat. A progress step such as `i++` is needed to approach the stopping boundary.',
    },
    {
      competencyIds: ['CLNG-C012'], target: 'Initialize a sum accumulator to its identity value', supportingResourceIds: ['CLNG-R2-W04-03'], assessmentType: 'accumulator selection',
      prompt: 'Before adding each score into `total`, which initialization gives a correct neutral starting value?',
      options: ['`int total = 1;`', '`int total = 0;`', '`int total = count;`', '`int total;` with no assignment'], correct: 1,
      explanation: 'Zero is the identity for addition. Starting from another or indeterminate value would bias the final sum.',
    },
    {
      competencyIds: ['CLNG-C011', 'CLNG-C012'], target: 'Initialize a minimum from real data after checking nonempty input', supportingResourceIds: ['CLNG-R2-W04-02', 'CLNG-R2-W04-03'], assessmentType: 'summary-initialization reasoning',
      prompt: 'All valid scores may be greater than zero. After confirming `count > 0`, how should a minimum scan begin?',
      options: ['Set minimum to 0 and start at index 0', 'Leave minimum uninitialized until printing', 'Set minimum to `scores[0]` and compare later elements', 'Set minimum to count and skip the array'], correct: 2,
      explanation: 'The first initialized score is valid evidence from the dataset. Starting from 0 would report a value that may not occur, while an uninitialized value is indeterminate.',
    },
    {
      competencyIds: ['CLNG-C012'], target: 'Guard an empty dataset before average calculation', supportingResourceIds: ['CLNG-R2-W04-03'], assessmentType: 'empty-state reasoning',
      prompt: '`count` is zero after the learner chooses to finish without scores. What should happen before calculating an average?',
      options: ['Report the empty state and skip both array access and division', 'Read `scores[0]` to invent a starting value', 'Divide total by count and repair the result afterward', 'Pretend one zero score was entered'], correct: 0,
      explanation: 'An empty collection has no first element and count cannot be used as a divisor. The empty case needs its own result before either operation occurs.',
    },
    {
      competencyIds: ['CLNG-C012'], target: 'Calculate a nontruncated average', supportingResourceIds: ['CLNG-R2-W04-03'], assessmentType: 'numeric-summary selection',
      prompt: '`total` and `count` are int values and count is positive. Which expression preserves a fractional average?',
      options: ['`double average = total / count;`', '`double average = (double) total / count;`', '`int average = total % count;`', '`double average = count / total;`'], correct: 1,
      explanation: 'Casting total before division makes the operation floating point. Assigning an already-truncated integer quotient to double would not recover the lost fraction.',
    },
    {
      competencyIds: ['CLNG-C010', 'CLNG-C012'], target: 'Count accepted values rather than failed attempts', supportingResourceIds: ['CLNG-R2-W04-01', 'CLNG-R2-W04-03'], assessmentType: 'state-update reasoning',
      prompt: 'A score attempt is rejected because it is outside 0 through 100. What should happen to the initialized-element count?',
      options: ['Increase it because an attempt occurred', 'Set it to the invalid score', 'Leave it unchanged because no array element was accepted', 'Decrease it below zero to record the failure'], correct: 2,
      explanation: 'The count describes how many valid array positions contain data. A rejected attempt stores no element, so advancing count would create a false initialized range.',
    },
    {
      competencyIds: ['CLNG-C010', 'CLNG-C012'], target: 'Trace a running sum across a fixed array', supportingResourceIds: ['CLNG-R2-W04-01', 'CLNG-R2-W04-03'], assessmentType: 'loop-trace prediction',
      prompt: 'Starting with `total = 0`, a loop adds the three values `{2, 4, 6}` exactly once each. What is total after the loop?',
      options: ['3', '12', '6', '24'], correct: 1,
      explanation: 'The accumulator states are 0, 2, 6, and finally 12. Each initialized element contributes once.',
    },
  ]),

  'CLNG-R2-W05': week(5, [
    {
      competencyIds: ['CLNG-C013'], target: 'Use a prototype before a function call', supportingResourceIds: ['CLNG-R2-W05-01'], assessmentType: 'declaration-purpose reasoning',
      prompt: '`main` calls `calculate_total` before its function definition appears later in the file. What should be available before main?',
      options: ['A second main function', 'A global result with the same name', 'A matching function prototype', 'A Git tag for the function'], correct: 2,
      explanation: 'A prototype declares the function name, parameter types, and return type before the call, allowing the compiler to check that use.',
    },
    {
      competencyIds: ['CLNG-C014'], target: 'Distinguish a returned value from printed output', supportingResourceIds: ['CLNG-R2-W05-02'], assessmentType: 'function-contract selection',
      prompt: 'Another calculation must use the subtotal produced by a helper. Which helper behavior supports that composition?',
      options: ['Print the subtotal and return nothing', 'Return the subtotal to the caller', 'Read another subtotal with scanf', 'Store the subtotal only in a local variable and exit'], correct: 1,
      explanation: 'Returning the subtotal gives the caller a value it can store or combine. Printing creates output but does not provide the numeric result to another expression.',
    },
    {
      competencyIds: ['CLNG-C014'], target: 'Predict pass-by-value behavior for an int parameter', supportingResourceIds: ['CLNG-R2-W05-02'], assessmentType: 'call-semantics prediction',
      prompt: '`void add_one(int value) { value++; }` is called with `int count = 4; add_one(count);`. What is count afterward?',
      options: ['5 because the parameter is the same object', 'Undefined because functions cannot receive ints', '0 because value leaves scope', '4 because the function changed only its local copy'], correct: 3,
      explanation: 'An int argument is passed by value, so `value` begins as a copy of count. Incrementing that local parameter does not change count in the caller.',
    },
    {
      competencyIds: ['CLNG-C014'], target: 'Keep local variables inside their scope', supportingResourceIds: ['CLNG-R2-W05-02'], assessmentType: 'scope diagnosis',
      prompt: '`discount` is declared inside `calculate_discount`. Why can main not refer to that local name directly?',
      options: ['Its scope is limited to the function block where it was declared', 'All double variables are private to GCC', 'Only arrays can cross a closing brace', 'The linker renames every local value after a call'], correct: 0,
      explanation: 'A block-scope local name exists only within its declaring block. The function must return a needed result or receive an appropriate destination through a taught interface.',
    },
    {
      competencyIds: ['CLNG-C014'], target: 'Return a value on every required non-void path', supportingResourceIds: ['CLNG-R2-W05-01', 'CLNG-R2-W05-02'], assessmentType: 'control-path diagnosis',
      prompt: 'A function declared `double fee_for(int units)` returns a value when units is positive but reaches the closing brace for zero. What contract defect remains?',
      options: ['The parameter must be renamed after every call', 'The function should print instead of returning', 'The zero path does not provide the declared double result', 'The return type should always be int for zero'], correct: 2,
      explanation: 'A non-void function used for a result must return a valid value on each reachable case covered by its contract. Falling through does not supply the required result.',
    },
    {
      competencyIds: ['CLNG-C015'], target: 'Separate a header declaration from a source definition', supportingResourceIds: ['CLNG-R2-W05-03'], assessmentType: 'translation-unit organization',
      prompt: 'For a helper shared by `main.c` and implemented in `calculator.c`, where should its public prototype normally appear?',
      options: ['In a header included by code that calls the helper', 'Only inside the final executable file', 'In a README instead of C source', 'After each call as a comment'], correct: 0,
      explanation: 'A shared header exposes one consistent declaration to callers, while the function body remains in its implementation source file.',
    },
    {
      competencyIds: ['CLNG-C015'], target: 'Compile and link both source translation units', supportingResourceIds: ['CLNG-R2-W05-03', 'CLNG-R2-W05-04'], assessmentType: 'build-command selection',
      prompt: 'Which GCC command builds a program whose code is split between `main.c` and `calculator.c`?',
      options: ['`gcc main.c -o calculator.c`', '`gcc calculator.h -o main.c`', '`gcc main.c calculator.c -o utility.exe`', '`utility.exe main.c calculator.c`'], correct: 2,
      explanation: 'Both source translation units must be compiled and their object code linked into the named executable. A header is included by source; it is not a replacement source unit.',
    },
    {
      competencyIds: ['CLNG-C015'], target: 'Interpret an undefined-reference linker failure', supportingResourceIds: ['CLNG-R2-W05-03', 'CLNG-R2-W05-04'], assessmentType: 'linker-diagnostic interpretation',
      prompt: '`main.c` compiles, but linking reports an undefined reference to `calculate_total`. What is the most likely first check?',
      options: ['Whether printf uses a newline', 'Whether the source containing the matching definition was linked', 'Whether main has too many local variables', 'Whether the executable was already pushed to GitHub'], correct: 1,
      explanation: 'The call was declared well enough to compile, but the linker could not find a matching definition. Omitting the implementation source or mismatching the definition can cause that failure.',
    },
    {
      competencyIds: ['CLNG-C013', 'CLNG-C014'], target: 'Keep calculation helpers focused and independent from console input', supportingResourceIds: ['CLNG-R2-W05-01', 'CLNG-R2-W05-02'], assessmentType: 'function-boundary reasoning',
      prompt: 'Which design makes `calculate_discount` easiest to reuse and check with fixed cases?',
      options: ['Accept the needed subtotal as a parameter and return the discount', 'Call scanf inside it and print every intermediate value', 'Read a global subtotal that any function may replace', 'Exit the entire program whenever the discount is zero'], correct: 0,
      explanation: 'Explicit inputs and a returned result make the calculation deterministic for a given case. Console I/O can remain at the program edge.',
    },
    {
      competencyIds: ['CLNG-C013', 'CLNG-C015'], target: 'Keep a prototype and definition type-compatible', supportingResourceIds: ['CLNG-R2-W05-01', 'CLNG-R2-W05-03'], assessmentType: 'interface-mismatch diagnosis',
      prompt: 'A header declares `double average(int total, int count);` but the source defines `int average(int total, int count)`. What must be repaired?',
      options: ['Only the parameter names because return types never matter', 'The executable extension because functions require `.fn`', 'The call order because headers run after source files', 'The declaration and definition must agree on the return type'], correct: 3,
      explanation: 'The header and implementation describe one function interface and must have compatible types. Conflicting return types prevent reliable checking and compilation.',
    },
  ]),

  'CLNG-R2-W06': week(6, [
    {
      competencyIds: ['CLNG-C016'], target: 'Reserve string capacity for the terminating null character', supportingResourceIds: ['CLNG-R2-W06-01'], assessmentType: 'capacity reasoning',
      prompt: 'What is the smallest char array capacity that can hold the C string `Ada`?',
      options: ['3 bytes because three letters are visible', '4 bytes: three letters plus the terminating null character', '2 bytes because the compiler compresses text', 'Any size because strings grow automatically'], correct: 1,
      explanation: 'A C string stores its visible characters followed by `\\0`. `Ada` therefore needs four char positions.',
    },
    {
      competencyIds: ['CLNG-C016'], target: 'Read a line within a fixed char-array capacity', supportingResourceIds: ['CLNG-R2-W06-01', 'CLNG-R2-W06-02'], assessmentType: 'bounded-input selection',
      prompt: '`name` is a fixed char array. Which call tells the line reader the actual capacity of that array?',
      options: ['`fgets(name, sizeof name, stdin)`', '`gets(name)`', '`fgets(name, 1000, stdin)` regardless of its size', '`scanf("%s", name)` with no width or line contract'], correct: 0,
      explanation: '`fgets` receives the destination capacity and reads at most one fewer character before adding a terminator. `sizeof name` is valid here because name is the array in this scope.',
    },
    {
      competencyIds: ['CLNG-C016'], target: 'Compare C string contents rather than array identities', supportingResourceIds: ['CLNG-R2-W06-01'], assessmentType: 'string-comparison selection',
      prompt: 'Which expression tests whether `command` contains exactly the same text as `"list"`?',
      options: ['`command == "list"`', '`command = "list"`', '`sizeof command == "list"`', '`strcmp(command, "list") == 0`'], correct: 3,
      explanation: '`strcmp` compares string contents and returns zero when they are equal. `==` does not perform the required character-by-character content comparison.',
    },
    {
      competencyIds: ['CLNG-C016'], target: 'Remove an optional newline left by line input', supportingResourceIds: ['CLNG-R2-W06-02'], assessmentType: 'line-normalization reasoning',
      prompt: '`fgets` stores `"Ada\\n"` because the newline fit in the buffer. Why should the input boundary remove that newline before an exact name comparison?',
      options: ['The newline is a stored character and would make the text differ from `"Ada"`', 'Removing it converts the string into an integer', 'Every newline marks an unterminated array', 'The compiler cannot compile source that calls fgets'], correct: 0,
      explanation: 'When captured, the newline becomes part of the character sequence. Normalizing it once at the input boundary makes later exact comparisons and output predictable.',
    },
    {
      competencyIds: ['CLNG-C017'], target: 'Distinguish an address from the value stored there', supportingResourceIds: ['CLNG-R2-W06-03'], assessmentType: 'pointer-expression interpretation',
      prompt: 'Given `int score = 72; int *p = &score;`, what does `*p` evaluate to?',
      options: ['72', 'The text `score`', 'The size of an int', 'A new unrelated address'], correct: 0,
      explanation: '`p` stores the address of score, and unary `*` dereferences that address to access the int value stored there.',
    },
    {
      competencyIds: ['CLNG-C017'], target: 'Check pointer validity before dereferencing', supportingResourceIds: ['CLNG-R2-W06-03'], assessmentType: 'pointer-safety sequencing',
      prompt: 'A function accepts `struct Student *student`, and NULL is a possible argument. What must happen before reading `student->name`?',
      options: ['Increment the pointer until it becomes non-NULL', 'Convert NULL into an empty struct automatically', 'Check that student is not NULL and reject the invalid call if it is', 'Dereference it once to discover whether it is valid'], correct: 2,
      explanation: 'Dereferencing a null pointer is invalid. The pointer precondition must be established before using `->` to access an object.',
    },
    {
      competencyIds: ['CLNG-C017'], target: 'Recognize a pointer to an expired local object', supportingResourceIds: ['CLNG-R2-W06-03'], assessmentType: 'lifetime diagnosis',
      prompt: 'A function returns the address of its local `int temporary`. Why is using that returned pointer defective?',
      options: ['All pointers must point only to strings', 'The local object lifetime ends when the function returns', 'Addresses can be returned only from main', 'The int is automatically moved into the caller'], correct: 1,
      explanation: 'An automatic local object ceases to exist when its function returns. The saved address does not keep that object alive and must not be dereferenced.',
    },
    {
      competencyIds: ['CLNG-C018', 'CLNG-C019'], target: 'Select dot and arrow for struct access', supportingResourceIds: ['CLNG-R2-W06-04'], assessmentType: 'member-access discrimination',
      prompt: '`student` is a struct object and `pstudent` points to one. Which pair accesses their `id` members correctly?',
      options: ['`student->id` and `pstudent.id`', '`student::id` and `pstudent::id`', '`student[id]` and `*pstudent[id]`', '`student.id` and `pstudent->id`'], correct: 3,
      explanation: 'Dot accesses a member of a struct object. Arrow accesses a member through a pointer to that struct.',
    },
    {
      competencyIds: ['CLNG-C018', 'CLNG-C019'], target: 'Pass a struct address when a function must update the original record', supportingResourceIds: ['CLNG-R2-W06-03', 'CLNG-R2-W06-04'], assessmentType: 'mutation-contract reasoning',
      prompt: '`mark_present` must change the original Student record in main. Which function interface supports that change?',
      options: ['Accept `struct Student *student` and call it with `&record`', 'Accept `struct Student student` and change only that local copy', 'Accept no parameters and guess which record is intended', 'Return the address of a temporary local Student'], correct: 0,
      explanation: 'Passing the record address lets the function access and update the caller-owned object. Passing the struct by value would give the function a copy.',
    },
    {
      competencyIds: ['CLNG-C019'], target: 'Bound traversal of a fixed array of struct records', supportingResourceIds: ['CLNG-R2-W06-04'], assessmentType: 'record-array boundary selection',
      prompt: '`records` has fixed capacity 10 and `count` initialized entries. Which condition must hold before storing a new record at `records[count]`?',
      options: ['`count <= 10`', '`count > 10`', '`count == -1`', '`count < 10`'], correct: 3,
      explanation: 'The next free index is count, so it is valid only while count is below capacity. When count is 10, valid indices 0 through 9 are already occupied.',
    },
  ]),

  'CLNG-R2-W07': week(7, [
    {
      competencyIds: ['CLNG-C020', 'CLNG-C021'], target: 'Check fopen before using the file stream', supportingResourceIds: ['CLNG-R2-W07-01'], assessmentType: 'file-open sequencing',
      prompt: '`FILE *file = fopen("data/log.txt", "r");` may fail. What must the program do before calling `fgets` with file?',
      options: ['Call `feof(file)` until the pointer changes', 'Write an empty record to prove the path exists', 'Check whether file is NULL and handle the open failure', 'Dereference file to discover its mode'], correct: 2,
      explanation: '`fopen` reports failure with a null pointer. Stream operations require a valid FILE pointer, so the failure check must come first.',
    },
    {
      competencyIds: ['CLNG-C020'], target: 'Choose append mode when existing log records must remain', supportingResourceIds: ['CLNG-R2-W07-01', 'CLNG-R2-W07-02'], assessmentType: 'file-mode selection',
      prompt: 'A new study-log line should be added after existing lines without truncating them. Which fopen mode matches that contract?',
      options: ['`"w"`', '`"x"`', '`"r"`', '`"a"`'], correct: 3,
      explanation: 'Append mode positions writes at the end and preserves existing file contents. Write mode would truncate an existing file.',
    },
    {
      competencyIds: ['CLNG-C020'], target: 'Drive a read loop by successful line reads', supportingResourceIds: ['CLNG-R2-W07-01'], assessmentType: 'file-loop selection',
      prompt: 'Which loop processes a line only when `fgets` actually read one?',
      options: ['`while (fgets(line, sizeof line, file) != NULL)`', '`while (!feof(file))` followed by an unchecked read', '`while (line != EOF)` before any read', '`while (fopen(file, "r"))`'], correct: 0,
      explanation: 'The result of `fgets` states whether a line was obtained. Testing `feof` before reading can produce an extra iteration after the final successful line.',
    },
    {
      competencyIds: ['CLNG-C020', 'CLNG-C021'], target: 'Preserve an existing file after malformed stored data', supportingResourceIds: ['CLNG-R2-W07-02'], assessmentType: 'failure-state reasoning', classification: 'A',
      prompt: 'Loading finds a malformed existing record that cannot be parsed under the documented format. What is the safest response?',
      options: ['Treat the file as empty and immediately overwrite it', 'Report the malformed record and avoid saving replacement data', 'Skip every validation rule for the remaining lines', 'Convert the malformed text into a valid record silently'], correct: 1,
      explanation: 'Malformed existing data is different from a missing first-run file. Refusing to write preserves evidence and prevents valid records from being destroyed by a failed load.',
    },
    {
      competencyIds: ['CLNG-C021'], target: 'Keep an expected missing first-run file distinct from malformed data', supportingResourceIds: ['CLNG-R2-W07-01', 'CLNG-R2-W07-02'], assessmentType: 'error-classification reasoning',
      prompt: 'The log file does not exist on the first run, but the parent data folder is valid. How does that differ from a file that exists with a broken record?',
      options: ['Missing may initialize an empty log; malformed existing data should stop without overwrite', 'Both cases prove GCC failed to compile the program', 'Both cases should erase the entire data folder', 'Malformed data is safe to ignore, while missing data is always fatal'], correct: 0,
      explanation: 'A documented missing first-run file can mean no records yet. Existing malformed data signals a preservation problem and must not be silently converted into empty state.',
    },
    {
      competencyIds: ['CLNG-C021'], target: 'Report a failed library operation without hiding its cause', supportingResourceIds: ['CLNG-R2-W07-02'], assessmentType: 'error-reporting selection',
      prompt: '`fopen` returns NULL for a required file. Which response gives the learner useful failure evidence?',
      options: ['Continue and let a later stream call fail', 'Print only `something went wrong` and discard the path', 'Use a specific message or `perror` at the failed operation, then take the documented failure path', 'Catch the error with an unrelated if condition after saving'], correct: 2,
      explanation: 'Reporting at the failing boundary preserves the operation context and system reason. Continuing with a null stream would replace the original failure with unsafe behavior.',
    },
    {
      competencyIds: ['CLNG-C022'], target: 'Pause the debugger before a suspected state update', supportingResourceIds: ['CLNG-R2-W07-03'], assessmentType: 'debugger-action selection',
      prompt: 'A summary becomes wrong immediately after one record is added. Where is the most useful first breakpoint?',
      options: ['On the state-update line before it executes, then inspect inputs and current totals', 'After main has returned and every local value is gone', 'Inside the README heading for the summary', 'On an unrelated printf that runs before file loading'], correct: 0,
      explanation: 'Pausing at the suspected update exposes the values and control path that determine the incorrect state, allowing one evidence-led step and comparison.',
    },
    {
      competencyIds: ['CLNG-C022'], target: 'Use compiler warnings as a release gate', supportingResourceIds: ['CLNG-R2-W07-03'], assessmentType: 'warning-repair reasoning',
      prompt: 'The checks pass, but `-Wall -Wextra -pedantic` reports an incompatible format warning. What should happen before acceptance?',
      options: ['Remove the warning flags from the documented command', 'Repair the mismatch and rerun the same warning-enabled build and checks', 'Commit the executable so the warning cannot be seen', 'Change the expected check output without inspecting the source'], correct: 1,
      explanation: 'Passing behavior cases do not make a known invalid call safe. Repairing the reported cause and rerunning both build and checks keeps the evidence consistent.',
    },
    {
      competencyIds: ['CLNG-C023'], target: 'Cover normal boundary and invalid behavior in a dependency-free check harness', supportingResourceIds: ['CLNG-R2-W07-04'], assessmentType: 'test-case selection',
      prompt: 'Which three cases give stronger evidence for a parser that accepts study minutes from 0 through 600?',
      options: ['Three repetitions of 120', 'Only 0 because it is the shortest input', '120 as normal, 600 as a boundary, and malformed text as invalid', 'One random value without an expected result'], correct: 2,
      explanation: 'The cases sample ordinary behavior, an explicit accepted boundary, and rejection behavior. Repeating one ordinary input leaves important contract risks untested.',
    },
    {
      competencyIds: ['CLNG-C022', 'CLNG-C023'], target: 'Repair implementation while preserving a valid expected result', supportingResourceIds: ['CLNG-R2-W07-03', 'CLNG-R2-W07-04'], assessmentType: 'test-repair judgment',
      prompt: 'A check correctly expects three loaded records, but the loop uses `i <= count` and reports four. What is the principled repair?',
      options: ['Change the expected record count from three to four and leave the loop unchanged', 'Delete the failing check because the other checks already pass', 'Wrap the loop in a broad error handler and always report PASS', 'Repair the loop bound, rerun the focused check, then rerun all checks'], correct: 3,
      explanation: 'The expected result matches the stated three-record contract, and the observed bound accesses one extra position. Repair the implementation and preserve the valid test oracle.',
    },
  ]),

  'CLNG-R2-W08': week(8, [
    {
      competencyIds: ['CLNG-C024'], target: 'Validate argc before indexing argv', supportingResourceIds: ['CLNG-R2-W08-01'], assessmentType: 'argument-safety sequencing',
      prompt: 'The program needs a command in `argv[1]`. What must it establish before reading that element?',
      options: ['`argc >= 2`', '`argv[1] != argc`', '`argc == 0`', '`argv[0] == NULL`'], correct: 0,
      explanation: '`argv[0]` holds the program name, so a separate command token exists only when argc is at least 2. The count check must precede the access.',
    },
    {
      competencyIds: ['CLNG-C024'], target: 'Interpret command-line token positions', supportingResourceIds: ['CLNG-R2-W08-01'], assessmentType: 'argument-trace interpretation',
      prompt: 'For `labtrack.exe complete 7`, which values should the program treat as the command and record-ID text?',
      options: ['Command `labtrack.exe`; ID `complete`', 'Command `7`; ID `labtrack.exe`', 'Command `complete`; ID `7`', 'Command `complete 7`; no separate ID'], correct: 2,
      explanation: 'The executable name is `argv[0]`. The following tokens are `argv[1] == "complete"` and `argv[2] == "7"`.',
    },
    {
      competencyIds: ['CLNG-C024'], target: 'Reject an unknown command with usable guidance', supportingResourceIds: ['CLNG-R2-W08-01', 'CLNG-R2-W08-03'], assessmentType: 'CLI-contract judgment',
      prompt: 'The CLI supports `add`, `list`, `complete`, and `help`, but receives `archive`. What response best preserves the command contract?',
      options: ['Treat archive as add without telling the user', 'Create archive behavior without tests', 'Delete the data file and start again', 'Report the unknown command and show the valid command forms'], correct: 3,
      explanation: 'A clear rejection plus valid usage lets the user correct the command without silently invoking a different operation or inventing unverified behavior.',
    },
    {
      competencyIds: ['CLNG-C020', 'CLNG-C021', 'CLNG-C024'], target: 'Avoid persistence after a rejected CLI operation', supportingResourceIds: ['CLNG-R2-W07-02', 'CLNG-R2-W08-01'], assessmentType: 'integration-state reasoning', classification: 'B',
      prompt: 'The `complete` command receives an unknown record ID, so no valid state transition exists. What should happen to the stored records file?',
      options: ['Replace it with an empty file', 'Leave it unchanged and report the rejected operation', 'Append a completed record using the invalid ID', 'Save a partially modified in-memory array'], correct: 1,
      explanation: 'A rejected command produces no valid new state. Preserving the existing file prevents an invalid operation from damaging stored records.',
    },
    {
      competencyIds: ['CLNG-C025'], target: 'Document an exact reproducible C build and run route', supportingResourceIds: ['CLNG-R2-W08-03'], assessmentType: 'README-quality selection',
      prompt: 'Which README instruction is most reproducible for a reviewer at the project root?',
      options: ['Open an arbitrary C file, click the first Run control shown, and assume its hidden command uses the required flags', 'Build with the usual command, run the application normally, and omit expected output because it should be obvious', 'Run the exact warning-enabled GCC command, then `.\\out\\labtrack.exe help`, and state the expected usage heading', 'Install every C extension in the marketplace and use whichever compiler the editor selects automatically'], correct: 2,
      explanation: 'An exact starting location, build command, run command, and expected visible result allow another learner to repeat the same verification without guessing.',
    },
    {
      competencyIds: ['CLNG-C025'], target: 'Exclude generated C build output from source history', supportingResourceIds: ['CLNG-R2-W08-04'], assessmentType: 'ignore-rule judgment',
      prompt: 'Which paths should normally be ignored while `.c`, `.h`, checks, and README remain tracked?',
      options: ['Generated `out/`, `*.o`, and `*.exe` files', 'Every `.c` and `.h` file', 'The complete checks folder and README', 'Only source files that contain main'], correct: 0,
      explanation: 'Object files and executables are generated build products. Source, headers, checks, and documentation are the reviewable assets needed to reproduce them.',
    },
    {
      competencyIds: ['CLNG-C025'], target: 'Inspect changed and staged paths before committing', supportingResourceIds: ['CLNG-R2-W08-04'], assessmentType: 'repository-safety workflow',
      prompt: 'Why run `git status --short` before and after staging the project?',
      options: ['To make GCC infer missing function definitions', 'To convert record IDs into Git commit hashes', 'To inspect what changed and what will enter the commit before publication', 'To upload files without creating a commit'], correct: 2,
      explanation: 'The two status views expose working and staged paths, giving the learner a chance to remove generated output, credentials, or private data before a commit.',
    },
    {
      competencyIds: ['CLNG-C025'], target: 'Remove private learner data from the staged set', supportingResourceIds: ['CLNG-R2-W08-04'], assessmentType: 'publication-correction choice',
      prompt: 'A real student-data file appears in the staged list. What should happen before the commit?',
      options: ['Commit it privately and make the repository public later', 'Rename it to `.exe` so Git treats it as generated', 'Copy its contents into README for transparency', 'Remove it from staging, add the appropriate ignore rule or safe sample, and inspect status again'], correct: 3,
      explanation: 'Private data must not enter repository history. Correcting the staged set and verifying it again is safer than trying to remove sensitive history after publication.',
    },
    {
      competencyIds: ['CLNG-C025'], target: 'Create an empty remote for existing reviewed local history', supportingResourceIds: ['CLNG-R2-W08-02', 'CLNG-R2-W08-04'], assessmentType: 'repository-creation reasoning',
      prompt: 'LabTrack already has local commits, a README, and `.gitignore`. How should the new GitHub repository be initialized for the simplest first push?',
      options: ['Empty, without a remote README, license, or `.gitignore` commit', 'With an unrelated C template and sample executable', 'With only the private records file uploaded', 'By replacing the local history with a generated archive'], correct: 0,
      explanation: 'An empty remote avoids an unrelated initial commit that would need reconciliation with the already-reviewed local history.',
    },
    {
      competencyIds: ['CLNG-C023', 'CLNG-C024', 'CLNG-C025'], target: 'Verify the published CLI from a clean perspective', supportingResourceIds: ['CLNG-R2-W07-04', 'CLNG-R2-W08-03', 'CLNG-R2-W08-04'], assessmentType: 'release-verification sequencing', classification: 'B',
      prompt: 'The checks pass and the push succeeds. What final action gives the strongest human-reviewable handoff evidence?',
      options: ['Assume the repository page proves the build works because a successful push validates all source and instructions', 'Follow the README from a fresh clone, rebuild with warnings, rerun checks and commands, then inspect published files', 'Run only the old local executable in the original folder, where earlier build output and data still remain', 'Add several new commands after the push, then skip repeating the required acceptance cases'], correct: 1,
      explanation: 'A clean clone verifies that the repository contains the necessary source and that its documented build, checks, commands, and prerequisites are sufficient for another person.',
    },
  ]),
});

export const allQuestions = Object.freeze(Object.values(questionsByWeek).flat());
