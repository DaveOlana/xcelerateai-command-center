const OPTION_IDS = Object.freeze(['a', 'b', 'c', 'd']);

// Authored positions are deliberately irregular. The runtime may shuffle again per
// attempt; correctOptionId remains the stable key for the authored option set.
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
    id: `JAVA-R2-Q-W${String(week).padStart(2, '0')}-${String(number).padStart(2, '0')}`,
    weekId: `JAVA-R2-W${String(week).padStart(2, '0')}`,
    competencyIds: Object.freeze([...competencyIds]),
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
  'JAVA-R2-W01': week(1, [
    {
      competencyIds: ['JAVA-C001'], target: 'Run the compiled Main class from the documented output folder', supportingResourceIds: ['JAVA-R2-W01-01', 'JAVA-R2-W01-03'], assessmentType: 'command selection',
      prompt: 'PowerShell is open in the project folder. `javac -d out src/Main.java` has succeeded. Which command runs the compiled `Main` class from `out`?',
      options: ['`javac out/Main.class`', '`java src/Main.java out`', '`java -cp out Main`', '`Main.java -cp java`'], correct: 2,
      explanation: '`java -cp out Main` tells the Java launcher to search the `out` class path for the compiled Main class. `javac` compiles source; it does not run a class.',
    },
    {
      competencyIds: ['JAVA-C002'], target: 'Order source, compilation, and JVM execution', supportingResourceIds: ['JAVA-R2-W01-01', 'JAVA-R2-W01-02'], assessmentType: 'execution-sequence reasoning',
      prompt: 'Which sequence correctly describes a normal beginner Java run?',
      options: ['Save `.java` source, compile it, then let the JVM run the resulting class instructions', 'Run the JVM first, then ask it to create the source file', 'Convert the source directly into a README, then execute the README', 'Open a `.class` file in the editor and compile it back into `.java`'], correct: 0,
      explanation: 'The saved `.java` file is source. Compilation checks it and produces class instructions, which the JVM can then execute.',
    },
    {
      competencyIds: ['JAVA-C002'], target: 'Recognize the Java application entry point', supportingResourceIds: ['JAVA-R2-W01-01'], assessmentType: 'syntax recognition',
      prompt: 'Which method declaration gives the Java launcher the standard entry point used in this week’s console application?',
      options: ['`public void start()`', '`static int main()`', '`public Main(String[] args)`', '`public static void main(String[] args)`'], correct: 3,
      explanation: 'For this course’s console programs, the launcher looks for `public static void main(String[] args)`. A constructor or differently named method is not that entry point.',
    },
    {
      competencyIds: ['JAVA-C003'], target: 'Distinguish compile failures from runtime failures', supportingResourceIds: ['JAVA-R2-W01-02', 'JAVA-R2-W01-04'], assessmentType: 'error classification',
      prompt: 'A missing semicolon prevents `javac` from producing an updated class. Later, a validly compiled program divides an integer by zero and stops. How should the two failures be classified?',
      options: ['Both are compile failures because they appear in source', 'The semicolon issue is a compile failure; division by zero is a runtime failure', 'The semicolon issue is a runtime failure; division by zero is a compile failure', 'Both are runtime failures because the learner noticed them while trying to run'], correct: 1,
      explanation: 'The compiler rejects invalid Java syntax before execution. Integer division by zero is discovered only when the compiled statement runs.',
    },
    {
      competencyIds: ['JAVA-C003'], target: 'Use the first useful compiler diagnostic', supportingResourceIds: ['JAVA-R2-W01-03'], assessmentType: 'diagnostic interpretation',
      prompt: 'After one missing semicolon, the compiler prints several messages. What is the strongest first repair move?',
      options: ['Rewrite every line that appears after the error', 'Delete the output folder and ignore the message', 'Change the project JDK without checking the source location', 'Read the first useful message and location, repair that source line, then compile again'], correct: 3,
      explanation: 'One syntax mistake can cause later messages. Repairing the earliest useful reported cause and recompiling keeps the diagnosis evidence-led.',
    },
    {
      competencyIds: ['JAVA-C001', 'JAVA-C003'], target: 'Diagnose stale output after an editor change', supportingResourceIds: ['JAVA-R2-W01-03', 'JAVA-R2-W01-04'], assessmentType: 'workflow diagnosis',
      prompt: 'Nneka changes the printed learner name in IntelliJ, but PowerShell still shows the old name. The run command is correct. What should she verify first?',
      options: ['That the JDK has been reinstalled since the edit', 'That the class was renamed after the earlier run', 'That the source was saved and recompiled before the rerun', 'That the terminal screen was cleared before running'], correct: 2,
      explanation: 'The JVM runs compiled class instructions, not unsaved editor text. Saving and recompiling ensures the run reflects the current source.',
    },
    {
      competencyIds: ['JAVA-C003'], target: 'Interpret the application frame in a stack trace', supportingResourceIds: ['JAVA-R2-W01-04'], assessmentType: 'stack-trace interpretation',
      prompt: 'A run ends with `ArithmeticException: / by zero` and includes `at Main.main(Main.java:9)`. Which evidence most directly identifies where the application failed?',
      options: ['`Main.java:9`, together with the exception type and message', 'Only the word `Exception`, without its type or source frame', 'The last successful compiler command from an earlier run', 'A Java-library frame that does not name the application source'], correct: 0,
      explanation: 'The exception states the failure, while `Main.java:9` points to the application source line executed when it occurred.',
    },
    {
      competencyIds: ['JAVA-C001', 'JAVA-C002'], target: 'Match a public class to its source filename', supportingResourceIds: ['JAVA-R2-W01-01', 'JAVA-R2-W01-02'], assessmentType: 'compiler-error diagnosis',
      prompt: 'The source contains `public class Main` but is saved as `Student.java`. The compiler reports that Main should be declared in a file named Main.java. What is the smallest repair?',
      options: ['Add a second `main` method', 'Save the public `Main` class in `Main.java`', 'Change every printed value to text', 'Run the mismatched file repeatedly'], correct: 1,
      explanation: 'A public top-level class must match its source filename. Saving this class as `Main.java` satisfies the reported rule without unrelated edits.',
    },
    {
      competencyIds: ['JAVA-C002'], target: 'Identify what a successful compilation proves', supportingResourceIds: ['JAVA-R2-W01-02'], assessmentType: 'evidence-boundary reasoning',
      prompt: '`javac` reports no errors for a program that calculates weekly study time. What has this result established?',
      options: ['The program meets every learner requirement', 'The arithmetic result is guaranteed correct', 'The source passed compilation, but behavior still needs to be run and checked', 'The project has already been published safely'], correct: 2,
      explanation: 'Successful compilation establishes that the compiler accepted the source. It does not prove that the program’s result or requirements are correct.',
    },
    {
      competencyIds: ['JAVA-C003'], target: 'Make one evidence-led repair at a time', supportingResourceIds: ['JAVA-R2-W01-03'], assessmentType: 'debugging-strategy selection',
      prompt: 'A compile message points to one missing semicolon, while the learner also wants to reformat several output lines. Which sequence gives the clearest evidence?',
      options: ['Repair the reported semicolon, recompile the same case, then make separate formatting changes', 'Reformat everything and assume the semicolon was included', 'Suppress compiler output before editing', 'Replace the whole class with an unrelated example'], correct: 0,
      explanation: 'A single targeted repair followed by the same compile attempt shows whether the reported cause was fixed. Unrelated changes make that result harder to interpret.',
    },
  ]),

  'JAVA-R2-W02': week(2, [
    {
      competencyIds: ['JAVA-C004'], target: 'Choose a declared type for a whole-number value', supportingResourceIds: ['JAVA-R2-W02-01'], assessmentType: 'type selection',
      prompt: 'A learner’s planned sessions must be stored as the whole number `3`. Which declaration matches that value?',
      options: ['`boolean sessions = 3;`', '`int sessions = 3;`', '`char sessions = "3";`', '`String sessions = true;`'], correct: 1,
      explanation: '`int` stores whole-number values such as 3. The other declarations pair incompatible types and values.',
    },
    {
      competencyIds: ['JAVA-C004'], target: 'Distinguish char from String literals', supportingResourceIds: ['JAVA-R2-W02-01'], assessmentType: 'syntax discrimination',
      prompt: 'Which pair correctly stores one grade letter and a course name?',
      options: ["`String grade = 'A'; char course = \"Java\";`", '`char grade = "A"; String course = \'Java\';`', '`int grade = A; boolean course = Java;`', "`char grade = 'A'; String course = \"Java\";"], correct: 3,
      explanation: 'A `char` literal uses single quotes and contains one character. A `String` literal uses double quotes and can contain multiple characters.',
    },
    {
      competencyIds: ['JAVA-C005'], target: 'Read a complete line of console text', supportingResourceIds: ['JAVA-R2-W02-02'], assessmentType: 'API selection',
      prompt: 'The learner may enter the full name `Ada Lovelace`. Which Scanner call reads that complete line, including the space?',
      options: ['`scanner.nextLine()`', '`scanner.hasNextInt()`', '`scanner.close("Ada")`', '`scanner.equals("Ada Lovelace")`'], correct: 0,
      explanation: '`nextLine()` reads the remaining characters on the current line, so a multiword name stays together.',
    },
    {
      competencyIds: ['JAVA-C005'], target: 'Avoid the Scanner pending-newline surprise', supportingResourceIds: ['JAVA-R2-W02-02'], assessmentType: 'input-bug diagnosis',
      prompt: 'Code calls `nextInt()` for age and immediately calls `nextLine()` for course. The course becomes empty. What caused the surprise?',
      options: ['`nextLine()` converts course names to numbers', '`nextInt()` closes the Scanner automatically', '`nextInt()` leaves the line ending for the following `nextLine()` to consume', '`String variables cannot hold spaces'], correct: 2,
      explanation: 'Token methods such as `nextInt()` do not consume the line ending. The next `nextLine()` may therefore read only that leftover ending.',
    },
    {
      competencyIds: ['JAVA-C005'], target: 'Use one predictable input-and-conversion pattern', supportingResourceIds: ['JAVA-R2-W02-02', 'JAVA-R2-W02-03'], assessmentType: 'workflow selection',
      prompt: 'Which pattern keeps this week’s text input predictable while still producing an integer age?',
      options: ['Read age with `nextLine()`, then pass the text to `Integer.parseInt`', 'Read age with `nextInt()`, then immediately read course with `nextLine()` and ignore the pending ending', 'Store the numeric-looking text directly in an `int` without conversion', 'Call `nextLine()` twice and always discard the first response'], correct: 0,
      explanation: 'Reading one complete line and converting it deliberately avoids mixing token and line boundaries while making the conversion visible.',
    },
    {
      competencyIds: ['JAVA-C005'], target: 'Recognize numeric parsing success', supportingResourceIds: ['JAVA-R2-W02-04'], assessmentType: 'value prediction',
      prompt: 'What value does `Integer.parseInt("18")` produce when the text is valid?',
      options: ['The String `"Integer"`', 'The boolean `true`', 'The int value `18`', 'The char value `\'1\'`'], correct: 2,
      explanation: '`Integer.parseInt` converts valid whole-number text into an `int`. It does not preserve the quotation marks.',
    },
    {
      competencyIds: ['JAVA-C006'], target: 'Compare String content correctly', supportingResourceIds: ['JAVA-R2-W02-03'], assessmentType: 'comparison selection',
      prompt: 'The variable `answer` contains user-entered text. Which condition checks whether its content is exactly `yes`?',
      options: ['`answer = "yes"`', '`answer.equals("yes")`', '`answer >= "yes"`', '`answer + "yes"`'], correct: 1,
      explanation: '`String.equals` compares text content. Assignment and arithmetic operators do not perform that content test.',
    },
    {
      competencyIds: ['JAVA-C006'], target: 'Explain why == is unsafe for entered text content', supportingResourceIds: ['JAVA-R2-W02-04'], assessmentType: 'misconception diagnosis',
      prompt: 'A learner uses `answer == "yes"` and sees inconsistent text decisions. What is the core problem?',
      options: ['`==` compares text after converting it to numbers', '`==` compares text without respecting letter case', '`==` compares String length rather than its characters', '`==` compares String references, not their text content'], correct: 3,
      explanation: 'For Strings, `==` asks whether two references identify the same object. `equals` is the intended content comparison.',
    },
    {
      competencyIds: ['JAVA-C004'], target: 'Predict integer division assigned to an int', supportingResourceIds: ['JAVA-R2-W02-01'], assessmentType: 'output prediction',
      prompt: 'What value is stored by `int hours = 95 / 60;`?',
      options: ['1.58', '1', '35', '95'], correct: 1,
      explanation: 'Both operands are integers, so integer division keeps the whole-number quotient: 1. The remainder would require a separate `%` calculation.',
    },
    {
      competencyIds: ['JAVA-C004', 'JAVA-C005'], target: 'Keep converted and original input values distinct', supportingResourceIds: ['JAVA-R2-W02-01', 'JAVA-R2-W02-04'], assessmentType: 'data-flow reasoning',
      prompt: 'The program has `String ageText = scanner.nextLine();` and then needs numeric arithmetic. Which next statement preserves a clear conversion boundary?',
      options: ['`int age = Integer.parseInt(ageText);`', '`String age = ageText + 1;`', '`boolean age = scanner.equals(ageText);`', '`char age = ageText;`'], correct: 0,
      explanation: 'The new `int age` makes the result of conversion explicit while retaining `ageText` as the original input text for diagnosis or reporting.',
    },
  ]),

  'JAVA-R2-W03': week(3, [
    {
      competencyIds: ['JAVA-C007'], target: 'Order invalid cases before eligibility decisions', supportingResourceIds: ['JAVA-R2-W03-01', 'JAVA-R2-W03-02'], assessmentType: 'branch-order reasoning',
      prompt: 'A registration checker must reject ages outside 16–120 before deciding eligibility. Which branch should appear first after successful numeric conversion?',
      options: ['The successful-eligibility condition', 'The invalid-age range check', 'The prerequisite-failure condition', 'The score-threshold condition'], correct: 1,
      explanation: 'An invalid age is not an ordinary eligible or ineligible case. Rejecting it first prevents later rules from assigning a misleading result.',
    },
    {
      competencyIds: ['JAVA-C007'], target: 'Preserve inclusive lower and upper boundaries', supportingResourceIds: ['JAVA-R2-W03-01'], assessmentType: 'condition selection',
      prompt: 'A valid score includes both 50 and 100. Which condition identifies a score inside that range?',
      options: ['`score > 50 && score < 100`', '`score == 50 || score == 100`', '`score >= 50 && score <= 100`', '`score < 50 && score > 100`'], correct: 2,
      explanation: '`>=` and `<=` include both boundary values, while `&&` requires the score to satisfy the lower and upper rules together.',
    },
    {
      competencyIds: ['JAVA-C007'], target: 'Trace first-match behavior in an else-if chain', supportingResourceIds: ['JAVA-R2-W03-02'], assessmentType: 'control-flow prediction',
      prompt: 'An `if/else if/else` chain has two conditions that would be true, but the first one matches. What happens next?',
      options: ['Both matching blocks run', 'The last matching branch replaces the first result', 'The compiler chooses one matching block at random', 'Only the first matching block runs; later branches are skipped'], correct: 3,
      explanation: 'An ordered chain selects its first true branch. Later `else if` and `else` blocks in that chain do not run.',
    },
    {
      competencyIds: ['JAVA-C006', 'JAVA-C007'], target: 'Require two eligibility conditions together', supportingResourceIds: ['JAVA-R2-W03-01', 'JAVA-R2-W03-03'], assessmentType: 'Boolean-operator selection',
      prompt: 'A learner is eligible only when the score is at least 50 and the prerequisite is complete. Which expression states both requirements?',
      options: ['`score >= 50 && hasPrerequisite`', '`score >= 50 || hasPrerequisite`', '`!score >= 50`', '`score = 50 && "yes"`'], correct: 0,
      explanation: '`&&` is true only when both operands are true. `||` would accept a learner who meets only one requirement.',
    },
    {
      competencyIds: ['JAVA-C006'], target: 'Reason about short-circuit evaluation', supportingResourceIds: ['JAVA-R2-W03-01'], assessmentType: 'evaluation prediction',
      prompt: 'In `age >= 16 && hasId`, `age >= 16` is false. What does short-circuit `&&` allow Java to do?',
      options: ['Evaluate `hasId` and use that value alone', 'Evaluate `hasId` twice to confirm the result', 'Skip evaluating the right operand because the whole expression is already false', 'Treat the skipped right operand as a compile error'], correct: 2,
      explanation: 'For `&&`, one false operand makes the complete expression false. Java therefore need not evaluate the right operand.',
    },
    {
      competencyIds: ['JAVA-C008'], target: 'Catch invalid integer text at the conversion boundary', supportingResourceIds: ['JAVA-R2-W03-04'], assessmentType: 'exception-boundary selection',
      prompt: 'Which handler belongs directly around `Integer.parseInt(scoreText)` when `"fifty"` is an expected invalid entry?',
      options: ['`catch (NumberFormatException error)`', '`catch (ArithmeticException error)` around every branch', '`catch (Exception error)` around the whole application', '`catch (NullPointerException error)` around printing'], correct: 0,
      explanation: '`Integer.parseInt` reports invalid numeric text with `NumberFormatException`. Catching that expected failure at the conversion keeps unrelated defects visible.',
    },
    {
      competencyIds: ['JAVA-C008'], target: 'Avoid broad exception handling that hides defects', supportingResourceIds: ['JAVA-R2-W03-04'], assessmentType: 'debugging-policy reasoning',
      prompt: 'A large `try` block parses a score, compares rules, and prints results, then catches `Exception` as “bad score.” Why is that unsafe?',
      options: ['It changes `NumberFormatException` into an I/O failure', 'It makes every later `else` branch execute', 'It may disguise an unrelated programming defect as an input mistake', 'It is rejected because Java permits only one statement inside `try`'], correct: 2,
      explanation: 'A broad catch can intercept failures caused by defective code, not just bad numeric input. The protected boundary should remain narrow and specific.',
    },
    {
      competencyIds: ['JAVA-C007'], target: 'Choose OR for alternative rejection reasons', supportingResourceIds: ['JAVA-R2-W03-01'], assessmentType: 'Boolean-rule translation',
      prompt: 'An age is invalid when it is below 16 or above 120. Which expression matches that rejection rule?',
      options: ['`age >= 16 && age <= 120`', '`age < 16 || age > 120`', '`age < 16 && age > 120`', '`age == 16 && age == 120`'], correct: 1,
      explanation: 'Either out-of-range condition is enough to reject the age, so the two alternatives are joined with `||`.',
    },
    {
      competencyIds: ['JAVA-C007', 'JAVA-C008'], target: 'Keep invalid input distinct from a valid ineligible result', supportingResourceIds: ['JAVA-R2-W03-02', 'JAVA-R2-W03-04'], assessmentType: 'outcome classification',
      prompt: 'A learner enters `fifty` where a numeric score is required. Which result best preserves the checker’s contract?',
      options: ['Report invalid numeric input rather than classifying the learner as ineligible', 'Treat the text as score zero and continue silently', 'Approve the learner because the word describes 50', 'Catch every future error and always print success'], correct: 0,
      explanation: 'Conversion did not produce a valid score, so eligibility rules cannot yet be applied. Invalid input is a separate outcome from valid-but-ineligible data.',
    },
    {
      competencyIds: ['JAVA-C007'], target: 'Detect a shadowed valid boundary', supportingResourceIds: ['JAVA-R2-W03-01', 'JAVA-R2-W03-02'], assessmentType: 'branch-bug diagnosis',
      prompt: 'The first branch says `if (score <= 50) invalid`, and a later branch says `else if (score >= 50) eligible`. What happens to the valid boundary score 50?',
      options: ['It reaches the eligible branch because both are true', 'It skips the complete chain', 'It is captured by the first branch and wrongly reported invalid', 'It causes NumberFormatException'], correct: 2,
      explanation: 'At 50, the first condition is true, so later branches are skipped. The invalid condition should reject values below the accepted boundary, not the boundary itself.',
    },
  ]),

  'JAVA-R2-W04': week(4, [
    {
      competencyIds: ['JAVA-C009'], target: 'Choose while for condition-controlled repetition', supportingResourceIds: ['JAVA-R2-W04-01'], assessmentType: 'loop-selection reasoning',
      prompt: 'A tracker should keep asking until the learner enters `done` or five valid scores have been accepted. Which loop best represents that changing stop rule?',
      options: ['A `while` loop whose condition depends on the accepted count, with a `break` for `done`', 'A `for` loop that always runs exactly five times, including rejected entries', 'One `if` statement that checks `done` only once', 'An enhanced `for` loop over an empty score list before scores are collected'], correct: 0,
      explanation: 'A `while` loop fits repetition controlled by changing state. Its body must update that state or break when the sentinel appears.',
    },
    {
      competencyIds: ['JAVA-C009'], target: 'Identify missing progress in a while loop', supportingResourceIds: ['JAVA-R2-W04-01'], assessmentType: 'infinite-loop diagnosis',
      prompt: 'A loop says `while (accepted < 5)` but never changes `accepted` and has no reachable `break`. What is the main defect?',
      options: ['The array has too many element types', 'The condition may remain true forever', 'The loop automatically skips its first run', 'The compiler changes `accepted` after each print'], correct: 1,
      explanation: 'Without a state update or stopping branch, the condition can remain true indefinitely and create an accidental infinite loop.',
    },
    {
      competencyIds: ['JAVA-C010'], target: 'Read the final element of an array safely', supportingResourceIds: ['JAVA-R2-W04-02'], assessmentType: 'index selection',
      prompt: 'For a nonempty `scores` array, which expression reads its final element?',
      options: ['`scores[scores.length]`', '`scores.length - 1`', '`scores[scores.length - 1]`', '`scores[last]`'], correct: 2,
      explanation: 'Array indexes start at zero, so the final valid index is one less than the array length.',
    },
    {
      competencyIds: ['JAVA-C010'], target: 'Predict an array-bound failure', supportingResourceIds: ['JAVA-R2-W04-02'], assessmentType: 'runtime-failure prediction',
      prompt: 'An array contains three values. What happens when code evaluates `scores[3]`?',
      options: ['It returns the third value', 'It expands the array by one slot', 'It returns zero without warning', 'It fails at runtime because valid indexes are 0, 1, and 2'], correct: 3,
      explanation: 'The length is 3, but the last valid index is 2. Index 3 lies outside the fixed array boundary.',
    },
    {
      competencyIds: ['JAVA-C010'], target: 'Use enhanced for when the index is unnecessary', supportingResourceIds: ['JAVA-R2-W04-02'], assessmentType: 'iteration-choice reasoning',
      prompt: 'The program only needs to add every score and never uses its position. Which loop is the clearest fit?',
      options: ['`for (int score : scores)`', '`while (scores)`', '`if (int score = scores)`', '`for (scores.length : score)`'], correct: 0,
      explanation: 'An enhanced `for` loop visits each array value directly when the index itself is not part of the work.',
    },
    {
      competencyIds: ['JAVA-C011'], target: 'Create a typed growable score collection', supportingResourceIds: ['JAVA-R2-W04-03'], assessmentType: 'collection-declaration selection',
      prompt: 'Which declaration creates a growable list intended to contain only Integer values?',
      options: ['`int scores = new int[];`', '`ArrayList scores = 0;`', '`ArrayList<Integer> scores = new ArrayList<>();`', '`String<Integer> scores = new String<>();`'], correct: 2,
      explanation: '`ArrayList<Integer>` declares the element type, while `new ArrayList<>()` creates the growable list instance.',
    },
    {
      competencyIds: ['JAVA-C011'], target: 'Distinguish size from the last list index', supportingResourceIds: ['JAVA-R2-W04-03'], assessmentType: 'boundary reasoning',
      prompt: 'An `ArrayList<Integer>` contains four scores. Which expression retrieves its final score?',
      options: ['`scores.get(scores.size())`', '`scores.get(scores.size() - 1)`', '`scores[scores.length - 1]`', '`scores.last()`'], correct: 1,
      explanation: '`size()` is the number of elements, so the final zero-based index is `size() - 1`. ArrayList access uses `get`.',
    },
    {
      competencyIds: ['JAVA-C010', 'JAVA-C011'], target: 'Choose fixed array versus growing ArrayList', supportingResourceIds: ['JAVA-R2-W04-02', 'JAVA-R2-W04-03'], assessmentType: 'data-structure selection',
      prompt: 'The program first stores exactly three diagnostic probe scores, then accepts an unknown number of valid classroom scores. Which pairing fits those needs?',
      options: ['Use a String for probes and a boolean for accepted scores', 'Use ArrayList for the fixed probes and forbid additions to the unknown collection', 'Use two fixed arrays and guess a very large second length', 'Use an array for the three probes and an ArrayList for the growing accepted scores'], correct: 3,
      explanation: 'An array expresses a known fixed length. An ArrayList fits an ordered collection whose size grows as valid values are accepted.',
    },
    {
      competencyIds: ['JAVA-C009', 'JAVA-C011'], target: 'Avoid counting rejected score attempts', supportingResourceIds: ['JAVA-R2-W04-01', 'JAVA-R2-W04-04'], assessmentType: 'state-update reasoning',
      prompt: 'A learner enters 140, but only scores from 0 through 100 are accepted. What should happen to the list and accepted-count state?',
      options: ['Neither should change until a valid score is accepted', 'Append 140 but leave the count unchanged', 'Increment the count but do not append', 'Append zero in place of 140'], correct: 0,
      explanation: 'Rejected input is not an accepted score. Updating either state would make the collection or count disagree with the stated contract.',
    },
    {
      competencyIds: ['JAVA-C009'], target: 'Use break only for the stated early stop', supportingResourceIds: ['JAVA-R2-W04-01', 'JAVA-R2-W04-04'], assessmentType: 'control-flow judgment',
      prompt: 'Inside the score-entry loop, when should `break` run under this week’s contract?',
      options: ['After every invalid numeric value', 'When the normalized input is `done`, ending entry deliberately', 'Before the first prompt appears', 'Whenever one score is below the current average'], correct: 1,
      explanation: '`break` implements the explicit `done` sentinel. Invalid entries are rejected and the loop can continue without pretending the session is finished.',
    },
  ]),

  'JAVA-R2-W05': week(5, [
    {
      competencyIds: ['JAVA-C012'], target: 'Distinguish a method declaration from a method call', supportingResourceIds: ['JAVA-R2-W05-01'], assessmentType: 'syntax discrimination',
      prompt: 'A class already contains `static double subtotal(double price, int quantity)`. Which line calls that method with a price of 750.0 and quantity 2?',
      options: ['`static double subtotal(double price, int quantity)`', '`subtotal = static double`', '`subtotal(750.0, 2)`', '`return type subtotal price quantity`'], correct: 2,
      explanation: 'The method name followed by compatible arguments performs the call. The declaration separately defines the method’s parameter and return contract.',
    },
    {
      competencyIds: ['JAVA-C012'], target: 'Map arguments to typed parameters', supportingResourceIds: ['JAVA-R2-W05-01', 'JAVA-R2-W05-02'], assessmentType: 'call-contract reasoning',
      prompt: 'For `static double fee(double amount, boolean takeaway)`, what are `amount` and `takeaway`?',
      options: ['Parameters that receive values supplied by each call', 'Arguments permanently stored in the JVM', 'Classes created whenever the method runs', 'Exceptions thrown before compilation'], correct: 0,
      explanation: 'Parameters are named, typed inputs in the method declaration. A call supplies matching argument values for one invocation.',
    },
    {
      competencyIds: ['JAVA-C013'], target: 'Return a value required by the caller', supportingResourceIds: ['JAVA-R2-W05-03'], assessmentType: 'method-contract selection',
      prompt: 'The caller must subtract a discount amount while calculating a quote. Which ending makes the discount helper composable?',
      options: ['`System.out.println(discount);` only', '`discount == true;`', '`new Scanner(discount);`', '`return discount;`'], correct: 3,
      explanation: '`return discount` sends the calculated value to the caller. Printing alone shows output but does not provide a value for the formula.',
    },
    {
      competencyIds: ['JAVA-C013'], target: 'Diagnose a missing return path', supportingResourceIds: ['JAVA-R2-W05-01', 'JAVA-R2-W05-03'], assessmentType: 'compiler-error diagnosis',
      prompt: 'A method declares `static double calculateFee(...)`, but one branch reaches the closing brace without returning a value. What should the compiler report?',
      options: ['The compiler inserts `0.0` for the missing branch', 'A return value may be missing on that path', 'Only the first branch’s return type is checked', 'The method silently changes to `void` for that branch'], correct: 1,
      explanation: 'A non-void method promises a compatible value to every completing call. Each reachable completion path must honor that return contract.',
    },
    {
      competencyIds: ['JAVA-C014'], target: 'Reason about local variable scope', supportingResourceIds: ['JAVA-R2-W05-03'], assessmentType: 'scope reasoning',
      prompt: '`double subtotal` is declared inside `calculateSubtotal`. Which statement about that local variable is correct?',
      options: ['It exists only within its declaring method/block and is not directly available in `main`', 'It automatically becomes a field on every object', 'It can be read from any class without a return value', 'It is shared permanently across all method calls'], correct: 0,
      explanation: 'A local variable belongs to its declaring block. Returning its value lets a caller use the result without exposing the local name.',
    },
    {
      competencyIds: ['JAVA-C014'], target: 'Recognize a valid method overload', supportingResourceIds: ['JAVA-R2-W05-01'], assessmentType: 'signature comparison',
      prompt: 'A class already defines `format(int value)`. Which additional declaration can form a valid overload?',
      options: ['`String format(int value)` differing only by return type', '`int format(int value)` with the same parameter list', '`String format(double value)` with a different parameter type', '`void format(int value)` differing only by parameter name spelling'], correct: 2,
      explanation: 'Overloads need different parameter lists, such as `int` versus `double`. Changing only the return type or parameter name does not create a distinct signature.',
    },
    {
      competencyIds: ['JAVA-C012', 'JAVA-C013'], target: 'Keep console input and output at the application edge', supportingResourceIds: ['JAVA-R2-W05-02', 'JAVA-R2-W05-04'], assessmentType: 'decomposition judgment',
      prompt: 'Which design makes `calculateSubtotal` easiest to reuse in several quote cases?',
      options: ['Have it create a Scanner, ask every question, print, and save a file', 'Pass the needed prices and quantities in, then return the subtotal', 'Have it read global mutable fields set by unrelated methods', 'Make it exit the application after one calculation'], correct: 1,
      explanation: 'Explicit parameters and a returned value give the helper one clear calculation responsibility. Input and presentation can remain in `main`.',
    },
    {
      competencyIds: ['JAVA-C013'], target: 'Compose amount-returning helpers once', supportingResourceIds: ['JAVA-R2-W05-04'], assessmentType: 'formula selection',
      prompt: 'The methods return `subtotal = 2500`, `discountAmount = 250`, and `feeAmount = 200`. Which expression calculates the quoted total without double-counting?',
      options: ['`subtotal + subtotal - feeAmount`', '`discountAmount - subtotal + feeAmount`', '`subtotal * discountAmount * feeAmount`', '`subtotal - discountAmount + feeAmount`'], correct: 3,
      explanation: 'Start with the subtotal, subtract the returned discount amount once, and add the returned fee amount once: 2450.',
    },
    {
      competencyIds: ['JAVA-C012'], target: 'Call a static helper from static main', supportingResourceIds: ['JAVA-R2-W05-01', 'JAVA-R2-W05-04'], assessmentType: 'static-context reasoning',
      prompt: '`main` and `calculateTotal` are both declared `static` in the same class. Which ordinary call is appropriate inside `main`?',
      options: ['`double total = calculateTotal(subtotal, discount, fee);`', '`double total = new static calculateTotal;`', '`return main.calculateTotal;`', '`class total = calculateTotal;`'], correct: 0,
      explanation: 'A static method in the same class can be called by its name with matching arguments; the returned value can be assigned to a compatible variable.',
    },
    {
      competencyIds: ['JAVA-C012', 'JAVA-C013'], target: 'Preserve a focused method responsibility', supportingResourceIds: ['JAVA-R2-W05-01', 'JAVA-R2-W05-02'], assessmentType: 'refactoring choice',
      prompt: 'A method named `calculateDiscount` also prompts for input, writes a receipt, and changes the menu. What is the smallest principled improvement?',
      options: ['Rename it `doEverything` and keep all dependencies hidden', 'Let it receive required values and return only the discount; move input and output to their callers', 'Catch every exception so the responsibilities cannot fail', 'Duplicate the method for every possible customer'], correct: 1,
      explanation: 'A focused calculation contract makes the method understandable and composable. Prompting and receipt output belong at a different boundary.',
    },
  ]),

  'JAVA-R2-W06': week(6, [
    {
      competencyIds: ['JAVA-C015'], target: 'Construct an object with valid initial state', supportingResourceIds: ['JAVA-R2-W06-01', 'JAVA-R2-W06-02'], assessmentType: 'constructor-call recognition',
      prompt: 'The class declares `Book(String title)`. Which expression creates a new Book whose title starts as `Kindred`?',
      options: ['`Book book = Book.title("Kindred");`', '`Book book = new Book("Kindred");`', '`new String = Book(Kindred);`', '`Book("Kindred") = class;`'], correct: 1,
      explanation: '`new Book("Kindred")` invokes the constructor and returns a reference to the newly initialized Book instance.',
    },
    {
      competencyIds: ['JAVA-C015'], target: 'Use this to assign a shadowed field', supportingResourceIds: ['JAVA-R2-W06-02', 'JAVA-R2-W06-03'], assessmentType: 'constructor-bug diagnosis',
      prompt: 'Inside `Book(String title)`, the statement `title = title;` leaves the field unchanged. Which repair assigns the parameter to the receiving object’s field?',
      options: ['`this.title = title;`', '`title.this = Book;`', '`static.title = this;`', '`new title = title;`'], correct: 0,
      explanation: '`this.title` names the field on the object being constructed, while the unqualified `title` on the right names the parameter.',
    },
    {
      competencyIds: ['JAVA-C015', 'JAVA-C016'], target: 'Keep per-object state independent', supportingResourceIds: ['JAVA-R2-W06-02', 'JAVA-R2-W06-03'], assessmentType: 'state prediction',
      prompt: 'Two Books start available. Only `second.checkout()` succeeds. What should their states be afterward?',
      options: ['Both unavailable because methods are shared', 'The first unavailable and the second available', 'The first still available and the second unavailable', 'Both replaced by one static Book'], correct: 2,
      explanation: 'Each instance has its own availability field. Sharing method code does not require sharing the per-object state that the method changes.',
    },
    {
      competencyIds: ['JAVA-C016'], target: 'Validate before changing object state', supportingResourceIds: ['JAVA-R2-W06-01', 'JAVA-R2-W06-03'], assessmentType: 'state-transition sequencing',
      prompt: 'A Book is already unavailable. Which checkout sequence best protects that state contract?',
      options: ['Set available false again, then decide whether the action was valid', 'Change every Book so the list stays consistent', 'Return success without inspecting the field', 'Check availability first; reject the invalid transition without mutating, otherwise change the field'], correct: 3,
      explanation: 'Validation should precede mutation. A rejected checkout leaves the original unavailable state unchanged and reports the failed operation clearly.',
    },
    {
      competencyIds: ['JAVA-C016'], target: 'Use private fields with controlled behavior', supportingResourceIds: ['JAVA-R2-W06-01', 'JAVA-R2-W06-03'], assessmentType: 'encapsulation reasoning',
      prompt: 'Why keep `available` private and expose `checkout()` and `returnBook()` methods?',
      options: ['The methods validate allowed changes before updating private state', 'Callers can still assign the private field after validation', 'Public methods make constructor state checks unnecessary', 'The private field becomes one value shared by all Books'], correct: 0,
      explanation: 'Private state narrows direct access. Public behavior can validate transitions and preserve the class’s rules before changing that state.',
    },
    {
      competencyIds: ['JAVA-C015'], target: 'Avoid static state for per-book availability', supportingResourceIds: ['JAVA-R2-W06-03'], assessmentType: 'shared-state diagnosis',
      prompt: 'After declaring `static boolean available`, checking out one Book makes every Book appear unavailable. What caused the defect?',
      options: ['Constructor parameters are shared by default', 'ArrayList copies the first element’s state into later elements', 'The static field belongs to the class, so all instances share it', '`this` points to the class instead of the current object'], correct: 2,
      explanation: 'A static field is class-level state. Availability describes one Book, so it should be an instance field initialized separately for each object.',
    },
    {
      competencyIds: ['JAVA-C017'], target: 'Declare a typed collection of objects', supportingResourceIds: ['JAVA-R2-W06-04'], assessmentType: 'collection-declaration selection',
      prompt: 'Which declaration creates a growable collection intended to hold only Book references?',
      options: ['`ArrayList<Book> books = new ArrayList<>();`', '`Book books = new int[10];`', '`ArrayList<String> books = new Book();`', '`static books = ArrayList<boolean>;`'], correct: 0,
      explanation: '`ArrayList<Book>` states the element type, and `new ArrayList<>()` creates the collection that can grow as Book instances are added.',
    },
    {
      competencyIds: ['JAVA-C017'], target: 'Call public behavior while traversing objects', supportingResourceIds: ['JAVA-R2-W06-04'], assessmentType: 'object-collection reasoning',
      prompt: 'Inside `for (Book book : books)`, which expression asks each Book for its display text through a public method?',
      options: ['`Book.displayLine = books;`', '`books[book].displayLine`', '`book.displayLine()`', '`private displayLine(book);`'], correct: 2,
      explanation: 'The enhanced loop variable refers to one Book at a time. Calling `book.displayLine()` invokes that instance’s public behavior.',
    },
    {
      competencyIds: ['JAVA-C016'], target: 'Preserve state after a rejected repeated action', supportingResourceIds: ['JAVA-R2-W06-01', 'JAVA-R2-W06-04'], assessmentType: 'error-contract prediction',
      prompt: 'The first checkout succeeds. A second checkout of the same Book is rejected by the method. What state should remain after the rejected call?',
      options: ['The Book becomes available again', 'The title is erased', 'Every Book is removed from the collection', 'That Book remains unavailable'], correct: 3,
      explanation: 'The invalid transition should be detected before mutation. Rejection therefore preserves the already-unavailable state.',
    },
    {
      competencyIds: ['JAVA-C015', 'JAVA-C016'], target: 'Separate class definition from object instance', supportingResourceIds: ['JAVA-R2-W06-01', 'JAVA-R2-W06-02'], assessmentType: 'concept discrimination',
      prompt: 'Which statement best distinguishes `Book` from `new Book("Kindred")`?',
      options: ['`Book` defines the type and behavior; `new Book(...)` creates one initialized instance', 'They are two spellings for the same local variable', '`Book` is a runtime exception and `new Book` catches it', '`Book` is an ArrayList and `new Book` is an array index'], correct: 0,
      explanation: 'The class defines the structure and available behavior. A constructor call with `new` creates one object that follows that definition.',
    },
  ]),

  'JAVA-R2-W07': week(7, [
    {
      competencyIds: ['JAVA-C018'], target: 'Separate a Path from the Files operation', supportingResourceIds: ['JAVA-R2-W07-01'], assessmentType: 'API-role discrimination',
      prompt: 'Which statement correctly separates the roles of `Path` and `Files`?',
      options: ['Path opens and closes every file; Files stores the path as plain text', 'Path names a location; Files provides operations that read or write at that location', 'Path contains the file data; Files contains only the filename', 'Path validates record fields; Files chooses the application’s working directory'], correct: 1,
      explanation: 'A Path represents where the program intends to work. Files contains the operations that act on that path.',
    },
    {
      competencyIds: ['JAVA-C018'], target: 'Specify UTF-8 for predictable text persistence', supportingResourceIds: ['JAVA-R2-W07-01'], assessmentType: 'encoding reasoning',
      prompt: 'Why should the note store use UTF-8 explicitly for both writing and reading?',
      options: ['It guarantees every record follows the application format', 'It prevents another process from deleting the text file', 'It reconstructs Java objects from each stored line', 'Both operations use the same documented encoding across environments'], correct: 3,
      explanation: 'Using the same explicit encoding makes character interpretation predictable across machines. Encoding does not validate the record’s application structure.',
    },
    {
      competencyIds: ['JAVA-C019'], target: 'Distinguish a missing first-run file from malformed stored data', supportingResourceIds: ['JAVA-R2-W07-02'], assessmentType: 'failure-classification reasoning',
      prompt: 'Which pair describes two different load outcomes that should not share the same recovery?',
      options: ['No notes file on the first run; an existing line missing required fields', 'An empty ArrayList; another empty ArrayList', 'Two valid records with different titles', 'Two successful reads of the same UTF-8 file'], correct: 0,
      explanation: 'A missing first-run file can legitimately mean no saved notes yet. An existing malformed line means stored data could not be interpreted and needs protective handling.',
    },
    {
      competencyIds: ['JAVA-C019'], target: 'Avoid overwriting after a malformed load', supportingResourceIds: ['JAVA-R2-W07-02'], assessmentType: 'data-safety judgment',
      prompt: 'Loading stops because one existing record has the wrong number of fields. What should the program do before any save?',
      options: ['Treat the complete file as empty and overwrite it', 'Append a success message to the malformed line', 'Report the malformed record and leave the existing file unchanged', 'Delete the file so the next run looks like a first run'], correct: 2,
      explanation: 'Malformed data is not evidence that the file is empty. Refusing to overwrite preserves evidence and prevents accidental loss while the cause is repaired.',
    },
    {
      competencyIds: ['JAVA-C019'], target: 'Handle expected failures at narrow boundaries', supportingResourceIds: ['JAVA-R2-W07-02'], assessmentType: 'exception-boundary selection',
      prompt: 'A loader reads lines and converts an ID field. Which design keeps failure meaning clearest?',
      options: ['Wrap the whole application in `catch (Exception)` and continue', 'Catch every failure and return an empty list', 'Catch I/O around the file operation and numeric conversion around the ID parsing boundary', 'Ignore all failures because the file is local'], correct: 2,
      explanation: 'Narrow handlers preserve the distinction between file access trouble and malformed numeric content, while leaving unrelated defects visible.',
    },
    {
      competencyIds: ['JAVA-C020'], target: 'Place a breakpoint before a suspicious state change', supportingResourceIds: ['JAVA-R2-W07-03', 'JAVA-R2-W07-04'], assessmentType: 'debugging-action selection',
      prompt: 'A saved note receives the wrong ID after `nextId` is updated. Where is the most useful first breakpoint?',
      options: ['Immediately before the suspicious ID assignment or update', 'Only after the wrong ID has been saved and the method has returned', 'At the first line of `main`, even if many unrelated steps occur before the failure', 'On output-formatting code that runs after the ID has already changed'], correct: 0,
      explanation: 'Pausing before the suspected state change exposes the current values and control path that lead to the wrong ID.',
    },
    {
      competencyIds: ['JAVA-C020'], target: 'Use stepping and local values as diagnostic evidence', supportingResourceIds: ['JAVA-R2-W07-03', 'JAVA-R2-W07-04'], assessmentType: 'debugger-evidence reasoning',
      prompt: 'At the breakpoint, `nextId` is 4 but becomes 6 after one method call. Which next action best narrows the cause?',
      options: ['Change the expected ID to 6 immediately', 'Step into or over the call while watching the relevant local values', 'Restart repeatedly without inspecting execution', 'Add broad exception handling around the debugger'], correct: 1,
      explanation: 'Stepping across the suspected call while inspecting values shows exactly where the unexpected update occurs. The expectation should not be changed without contract evidence.',
    },
    {
      competencyIds: ['JAVA-C021'], target: 'Interpret a dependency-free check failure', supportingResourceIds: ['JAVA-R2-W07-03', 'JAVA-R2-W07-04'], assessmentType: 'verification-result interpretation',
      prompt: 'A check reports `first id — expected 1, actual 2`. What does that result establish?',
      options: ['Every note-creation path is defective in the same way', 'The expected value must be changed because actual output is authoritative', 'The file write failed before any ID was calculated', 'For this named case, observed behavior differs from the stated expectation'], correct: 3,
      explanation: 'The check identifies one reproducible mismatch between expected and actual behavior. Investigation must determine whether code or expectation violates the contract.',
    },
    {
      competencyIds: ['JAVA-C021'], target: 'Repair implementation without weakening a valid expectation', supportingResourceIds: ['JAVA-R2-W07-03', 'JAVA-R2-W07-04'], assessmentType: 'test-repair judgment',
      prompt: 'The contract says the first note ID is 1, and debugger evidence shows code increments before assignment. What is the principled repair?',
      options: ['Move the increment, then rerun the unchanged check', 'Change expected 1 to expected 2', 'Delete the failing check', 'Catch AssertionError and print success'], correct: 0,
      explanation: 'The expectation matches the stated contract and the debugger exposed the implementation cause. Repair the update order and verify against the same case.',
    },
    {
      competencyIds: ['JAVA-C020', 'JAVA-C021'], target: 'Verify a focused repair and the full behavior set', supportingResourceIds: ['JAVA-R2-W07-03', 'JAVA-R2-W07-04'], assessmentType: 'verification sequencing',
      prompt: 'After repairing the ID update found by one failing check, which sequence provides the strongest evidence?',
      options: ['Publish immediately because the debugger closed', 'Rerun only a different successful case', 'Rerun the same failing case, then run the complete check harness', 'Replace every expected value with the latest output'], correct: 2,
      explanation: 'The focused rerun verifies the specific cause; the full harness checks that the repair did not break other established behaviors.',
    },
  ]),

  'JAVA-R2-W08': week(8, [
    {
      competencyIds: ['JAVA-C022'], target: 'Validate argument length before indexing args', supportingResourceIds: ['JAVA-R2-W08-01'], assessmentType: 'CLI-safety reasoning',
      prompt: 'Why should `main` check `args.length` before reading `args[0]`?',
      options: ['A run with no arguments has no element at index 0 and should receive help instead of an index failure', 'Java inserts an empty command at index 0 unless length is checked', '`args[0]` always contains the class name and must be skipped', 'Checking length converts every remaining argument to its required type'], correct: 0,
      explanation: 'The args array may be empty. Validating its shape first prevents out-of-bounds access and lets the program provide a usable command message.',
    },
    {
      competencyIds: ['JAVA-C022'], target: 'Interpret command tokens in args', supportingResourceIds: ['JAVA-R2-W08-01'], assessmentType: 'argument-trace interpretation',
      prompt: 'Under the documented contract, the learner runs `java -cp out Main complete 7`. Which token should be treated as the command and which as the task ID text?',
      options: ['Command `Main`; ID `complete`', 'Command `7`; ID `out`', 'Command `java`; ID `Main`', 'Command `complete`; ID `7`'], correct: 3,
      explanation: 'Tokens after the class name populate args. Here `args[0]` is `complete` and `args[1]` is the task ID text to validate and convert.',
    },
    {
      competencyIds: ['JAVA-C022'], target: 'Provide useful help for an unknown command', supportingResourceIds: ['JAVA-R2-W08-01', 'JAVA-R2-W08-03'], assessmentType: 'CLI-contract judgment',
      prompt: 'The user enters `archive`, but the CLI supports only `add`, `list`, `complete`, and `help`. What response best preserves the command contract?',
      options: ['Treat `archive` as `add` without telling the user', 'Report the unknown command and show the valid command forms', 'Create a new command dynamically with no tests', 'Delete the task file and start again'], correct: 1,
      explanation: 'A clear rejection plus valid usage lets the user correct the command without guessing or triggering unintended behavior.',
    },
    {
      competencyIds: ['JAVA-C019', 'JAVA-C022'], target: 'Avoid persistence after an invalid command', supportingResourceIds: ['JAVA-R2-W07-02', 'JAVA-R2-W08-01'], assessmentType: 'integration-state reasoning', classification: 'B',
      prompt: 'The `complete` command receives an unknown task ID and no valid state change exists. What should happen to the task file?',
      options: ['Replace it with an empty file', 'Append the invalid ID as a completed task', 'Leave it unchanged and report the rejected operation', 'Save a partially modified in-memory list'], correct: 2,
      explanation: 'An invalid operation should not create persisted state. Reporting the rejection while preserving the existing file protects valid tasks.',
    },
    {
      competencyIds: ['JAVA-C021', 'JAVA-C022'], target: 'Verify command behavior through a repeatable harness', supportingResourceIds: ['JAVA-R2-W07-04', 'JAVA-R2-W08-01'], assessmentType: 'verification-design reasoning',
      prompt: 'Which check gives the strongest evidence for the `complete 7` command?',
      options: ['Use known starting tasks, then compare expected and actual state and message', 'Run the command once and accept any output that contains 7', 'Change the stored task manually after the command', 'Inspect only whether the source file is long enough'], correct: 0,
      explanation: 'A known starting state and explicit expected result make the command behavior deterministic and repeatable without depending on prior manual runs.',
    },
    {
      competencyIds: ['JAVA-C023'], target: 'Write a reproducible README run instruction', supportingResourceIds: ['JAVA-R2-W08-03'], assessmentType: 'documentation-quality selection',
      prompt: 'Which README instruction is most reproducible for another learner at the project root?',
      options: ['Open IntelliJ and click Run without naming the configuration', 'Compile and run with whichever Java command is familiar', 'Run `javac -d out src/*.java`, then `java -cp out Main help`; expect the command list', 'Open Main.java and assume the IDE selects the intended JDK'], correct: 2,
      explanation: 'Exact starting location, commands, and expected visible result let another learner repeat the same verification without inventing missing steps.',
    },
    {
      competencyIds: ['JAVA-C023'], target: 'Inspect changed and staged paths before committing', supportingResourceIds: ['JAVA-R2-W08-04'], assessmentType: 'repository-safety workflow',
      prompt: 'Why inspect `git status --short` before and after staging the project?',
      options: ['To inspect changed and staged paths before committing unintended files', 'To refresh staged paths and make failed Java checks pass', 'To convert local task IDs into permanent commit IDs', 'To record the project JDK inside every staged source file'], correct: 0,
      explanation: 'Status inspection shows what changed and what will enter the commit, allowing caches, credentials, and private data to be caught before publication.',
    },
    {
      competencyIds: ['JAVA-C023'], target: 'Exclude generated IntelliJ and build output', supportingResourceIds: ['JAVA-R2-W08-04'], assessmentType: 'ignore-rule judgment',
      prompt: 'Which files should normally be excluded from this beginner repository while source and README remain tracked?',
      options: ['Every `.java` source file plus the README', 'Only Main.java because helper classes are generated', 'The complete `src` directory after compilation', 'Generated `out/` classes and IntelliJ `.idea/` metadata'], correct: 3,
      explanation: 'Compiled output and local IDE workspace state are reproducible or machine-specific. Source, checks, and documentation are the reviewable project assets.',
    },
    {
      competencyIds: ['JAVA-C023'], target: 'Create an empty remote for existing local history', supportingResourceIds: ['JAVA-R2-W08-02', 'JAVA-R2-W08-04'], assessmentType: 'publication-workflow reasoning',
      prompt: 'StudySprint already has reviewed local commits and a README. How should the new GitHub repository be initialized for the simplest first push?',
      options: ['With a second unrelated starter project', 'Empty, without a remote README, license, or `.gitignore` commit', 'By uploading only the task data file', 'With generated IntelliJ caches preloaded'], correct: 1,
      explanation: 'An empty remote avoids an unrelated initial commit that would need reconciliation with the already-reviewed local history.',
    },
    {
      competencyIds: ['JAVA-C021', 'JAVA-C023'], target: 'Verify the published handoff from a clean perspective', supportingResourceIds: ['JAVA-R2-W08-03', 'JAVA-R2-W08-04'], assessmentType: 'release-verification sequencing',
      prompt: 'All checks pass and the push succeeds. What final action best supports human verification?',
      options: ['Open the repository page and assume its commands work', 'Follow the README from a fresh clone, rerun commands and checks, then inspect files', 'Rerun only in the existing folder where cached output remains', 'Add features before checking the required commands again'], correct: 1,
      explanation: 'A clean-perspective run verifies that the repository contains the needed files and that its documented commands and prerequisites are sufficient for another learner.',
    },
  ]),
});

export const allQuestions = Object.freeze(Object.values(questionsByWeek).flat());
