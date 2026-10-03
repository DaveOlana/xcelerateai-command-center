# XcelerateAI Skill Check Authoring Standard

**Status:** Authoritative curriculum-generation standard
**Scope:** All current and future XcelerateAI curricula
**Applies to:** Skill Checks, quiz-style knowledge checks, and their validation
**Does not replace:** Builds, Proof, Studio practice, projects, or other practical evidence

---

## 1. Purpose

Skill Checks exist to answer one question:

> **Did the learner understand the important knowledge and reasoning taught before this point?**

They are not a substitute for practical work.

A Skill Check must test understanding, discrimination, reasoning, interpretation, or professional judgment that can legitimately be assessed in a quiz format.

It must not pretend to prove practical competence that is better demonstrated through a Build, Studio exercise, project, or submitted evidence.

---

## 2. Core Principle

Every question must earn its place.

A question is valid only when it tests a distinct, meaningful learning target that the learner has actually been taught or deliberately prepared to reason about.

Do not generate questions merely to satisfy a numerical quota.

Do not generate questions because a resource mentioned something.

Do not generate questions from platform policy, curriculum metadata, authoring decisions, or implementation details unless those are themselves explicit learner competencies.

---

## 3. Assessment Source of Truth

Before authoring a Skill Check, inspect the actual curriculum context for that week or checkpoint.

At minimum inspect:

- competencies introduced and reinforced;
- Study resources actually assigned;
- Studio/lab activity;
- Build requirements;
- prior prerequisite knowledge;
- intended learning outcomes;
- professional reasoning expected at that point.

Questions must be derived from the learner's educational experience, not from unrelated model knowledge.

If a concept has not been taught, practiced, or intentionally made available through prerequisites, do not assess it.

---

## 4. Assessment Map Required Before Question Writing

Before drafting questions, create an internal assessment map.

For every proposed question identify:

1. **Learning target**
2. **Where it was taught**
3. **Why it matters**
4. **What type of understanding is being tested**
5. **Why quiz format is appropriate**
6. **How this question differs from every other question**

Example:

| Question | Learning target | Source | Assessment type |
|---|---|---|---|
| Q1 | Product Design role | Week 1 Study | Concept discrimination |
| Q2 | Product Design vs UX/UI | Week 1 Study | Relationship reasoning |
| Q3 | Evidence vs assumption | Study + Studio | Scenario classification |
| Q4 | Design critique vs preference | Studio | Professional judgment |

If two questions map to substantially the same target and reasoning task, merge, replace, or remove one.

---

## 5. Question Count

Question count must emerge from meaningful assessment coverage.

### Preferred rule

Use the smallest number of high-quality questions needed to sample the week's important assessable knowledge.

A normal range is:

> **6–10 questions**

This is guidance, not a padding target.

If the runtime currently requires a fixed count such as 10:

- identify 10 genuinely distinct assessment targets;
- do not split one idea into multiple near-duplicate questions;
- do not manufacture filler;
- if 10 distinct meaningful targets do not exist, surface the mismatch instead of lowering question quality.

Never pad a Skill Check to satisfy a number.

---

## 6. Match the Assessment Method to the Competency

Use a Skill Check only when quiz-style assessment is appropriate.

### Good quiz targets

- definitions that matter professionally;
- concept relationships;
- recognizing evidence vs assumption;
- selecting an appropriate method;
- interpreting a scenario;
- accessibility reasoning;
- identifying a misconception;
- understanding constraints and trade-offs;
- professional judgment in a bounded scenario.

### Usually not quiz targets

- visual design execution;
- Figma/tool dexterity;
- coding ability;
- research execution;
- prototype quality;
- layout skill;
- developer handoff quality;
- portfolio quality;
- debugging skill;
- practical artifact construction.

Those belong primarily in:

- Studio;
- Build;
- Proof;
- projects;
- capstones.

A quiz may test the reasoning behind a practical skill, but must not claim to prove the skill itself.

---

## 7. Prefer Reasoning Over Trivia

Skill Checks should usually test whether the learner can use what they learned.

Prefer:

- scenarios;
- comparisons;
- interpretation;
- diagnosis;
- method selection;
- critique;
- trade-offs;
- applied reasoning.

Use direct factual recall when the terminology or fact itself is important.

### Weak

> What is evidence?

### Better

> A designer says, “Users will understand this icon because it looks familiar.” What is that statement currently?

The second version tests whether the learner can apply the concept.

---

## 8. One Question, One Meaningful Target

Each question should primarily test one learning target.

Do not create paired duplicates such as:

- “What should the designer do?”
- followed immediately by:
- “Which principle explains why that is the right thing to do?”

unless the second question genuinely tests a different competency that was independently taught.

Changing wording is not new assessment coverage.

Changing the scenario slightly is not necessarily new coverage.

Semantic duplication is duplication.

---

## 9. Distractor Quality

Incorrect answers must be plausible.

A distractor should represent one of:

- a common misconception;
- incomplete reasoning;
- confusion between related concepts;
- an attractive but inappropriate method;
- a reasonable action applied in the wrong context;
- a partially correct answer that fails an explicit condition.

Do not use nonsense.

Do not use cartoonishly bad professional behavior.

Do not create options such as:

- “Evidence never matters.”
- “Accessibility should always be ignored.”
- “Testing is unnecessary in every situation.”
- “Completing one exercise proves the design works for every user.”

unless the absolute claim itself is deliberately being assessed.

A learner with no subject knowledge should not be able to answer merely by choosing the only mature-sounding option.

---

## 10. Option Symmetry

For multiple-choice questions:

- keep options in the same conceptual domain;
- use similar grammatical structure;
- avoid making the correct answer obviously longer or more nuanced;
- avoid giving the correct answer uniquely professional vocabulary;
- avoid one absurd option among three serious options;
- avoid synonymous duplicate answers;
- avoid overlapping answers that make more than one defensible.

The correct answer must be identifiable because of subject knowledge, not writing style.

---

## 11. Exactly One Defensible Best Answer

For single-select questions, exactly one option must satisfy the complete stem.

Before finalizing:

1. Read the question literally.
2. Evaluate every option independently.
3. Ask whether another competent professional could reasonably defend a second answer.
4. If yes, repair the stem or options.

Do not rely on feedback to introduce restrictions that were absent from the question.

Do not justify ambiguity with phrases such as:

- “more professional”;
- “generally better”;
- “the preferred response”;

unless the question contains enough context to make that judgment objective.

---

## 12. No Obvious-Answer Language

Review each question for answer cues.

Be suspicious of:

- extreme absolutes;
- childish mistakes;
- obviously unethical choices;
- obviously anti-user choices;
- obviously anti-evidence choices;
- one unusually detailed option;
- one option copied almost verbatim from Study text;
- one answer containing all the week's professional buzzwords.

The learner should need the intended knowledge to answer.

---

## 13. No Platform-Policy Leakage

Never test internal XcelerateAI product or curriculum policy unless it is explicitly part of the professional curriculum.

Do not quiz learners on things such as:

- why XcelerateAI avoids paid tools;
- why the curriculum uses a provider cap;
- why a resource was selected;
- why evidence submission is implemented a certain way;
- why a particular runtime limitation exists;
- curriculum authoring rules;
- validator behavior;
- internal terminology used only by curriculum creators.

Example of invalid assessment:

> Why should paid Figma Dev Mode not be required by this curriculum?

That is an internal curriculum decision, not a Product Design competency.

---

## 14. No Template Leakage

All learner-visible text must read as natural human language after generation.

Do not mechanically inject:

- week titles;
- competency names;
- resource titles;
- phase names;
- project names;
- metadata strings;

into generic question templates.

Invalid pattern:

> “Postpone evidence review until after Product Design, Evidence, and Your Figma Workspace.”

Before publication, read every generated question as ordinary prose.

If it sounds machine-assembled, rewrite it.

---

## 15. Ground Questions in What Was Actually Taught

Every question must be answerable from:

- assigned learning;
- prior curriculum knowledge;
- the scenario provided in the question;
- deliberate professional reasoning appropriate to the learner's level.

Do not test obscure details from optional references.

Do not test details merely because they appeared somewhere on a page.

Do not assume learners consumed unrelated sections of a resource.

If the assigned scope did not teach it, do not assess it.

---

## 16. Reference Material Is Not Automatically Assessable

Reference resources exist primarily to support work.

Do not turn reference documentation into trivia questions.

For example, a learner may use Figma documentation while working without needing to memorize:

- navigation locations;
- subscription-plan details;
- every panel name;
- every feature limitation.

Assess only reference knowledge that is important to the professional competency.

---

## 17. Difficulty Progression

Question difficulty should grow with the learner.

### Early curriculum

Prefer:

- concept recognition;
- simple discrimination;
- evidence vs assumption;
- straightforward scenarios;
- basic professional reasoning;
- identifying an appropriate next step.

### Middle curriculum

Increase:

- ambiguity;
- method selection;
- critique;
- diagnosis;
- competing constraints;
- interpretation of incomplete evidence.

### Late curriculum

Use:

- realistic trade-offs;
- incomplete information;
- conflicting stakeholder needs;
- multiple plausible actions;
- prioritization;
- professional judgment;
- reasoning under constraints.

Do not use senior-level ambiguity before the learner has enough experience to reason about it.

---

## 18. Question Independence

Each question must stand alone.

Do not require the learner to remember:

- the previous question;
- the previous answer;
- prior quiz feedback.

Do not let one question reveal another question's answer.

Avoid repeated scenario pairs unless they genuinely assess separate competencies without leaking answers.

---

## 19. Scenario Quality

When using scenarios:

- include all necessary context;
- remove irrelevant narrative;
- keep the situation realistic;
- avoid invented complexity;
- test one primary decision;
- provide enough information for one defensible answer.

Do not require assumptions not stated in the scenario.

A scenario should feel like a small professional situation, not a riddle.

---

## 20. Professional Judgment Questions

Professional judgment questions must not reduce to:

> “Choose the nicest-sounding behavior.”

All options should be credible enough that the learner must understand the principle being tested.

Good judgment questions often distinguish between:

- evidence and assumption;
- immediate action and premature action;
- observation and interpretation;
- user need and stakeholder preference;
- useful research and unnecessary research;
- appropriate scope and overwork;
- reversible and irreversible decisions.

---

## 21. Skill Check vs Build Boundary

A Skill Check can ask:

> Which research method best fits this stated question?

A Build should prove:

> Can the learner actually plan and execute that research appropriately?

A Skill Check can ask:

> Which interface treatment creates stronger hierarchy?

A Build should prove:

> Can the learner create hierarchy effectively?

Keep this boundary explicit.

---

## 22. Feedback Must Teach

Feedback should reinforce learning.

For an incorrect answer:

- identify the specific misconception;
- explain why the option fails;
- remind the learner of the relevant principle;
- stay concise.

For a correct answer:

- explain the reasoning;
- do not merely say “Correct.”

### Weak

> Incorrect. B is wrong.

### Better

> This is still an assumption because no observation or user evidence has shown that people understand the icon.

Do not introduce entirely new untaught concepts inside feedback.

---

## 23. Hints

If hints are supported:

- guide recall or reasoning;
- do not reveal the answer;
- do not repeat the correct option using synonyms;
- do not eliminate three choices immediately;
- do not tell the learner to search externally.

A useful hint should help the learner think, not answer for them.

---

## 24. Answer Position Distribution

Correct-answer positions should not follow a detectable pattern.

Across a Skill Check:

- distribute correct answers naturally;
- avoid all correct answers clustering in one position;
- do not distort question quality merely to force perfect numerical balance.

Content quality outranks artificial answer-position symmetry.

---

## 25. Repetition Audit

Before publication, compare all questions within the Skill Check.

Flag:

- repeated concepts;
- paraphrased duplicates;
- repeated scenarios;
- repeated correct reasoning;
- “action” + “principle explaining the action” pairs;
- same misconception tested multiple times without instructional reason.

A question is not unique merely because its wording is different.

---

## 26. Adversarial Question Audit

Before publication, attempt to answer the Skill Check without using the week's learning.

For every question ask:

1. Can the answer be guessed because three distractors are ridiculous?
2. Is the correct answer the only professional-sounding option?
3. Is one answer obviously longer or more detailed?
4. Does the question test internal XcelerateAI policy?
5. Is it duplicating another question?
6. Was the required knowledge actually taught?
7. Is the question testing trivia rather than understanding?
8. Could two answers reasonably be defended?
9. Did template substitution create unnatural language?
10. Is this better assessed through a Build instead?

Repair every material failure.

---

## 27. Coverage Audit

Every Skill Check must include a final coverage map.

Example:

```text
Q1 → Product Design role
Q2 → Product Design vs UX/UI
Q3 → Evidence vs assumption
Q4 → Evidence identification in scenario
Q5 → Critique vs preference
Q6 → Product-design cycle reasoning
Q7 → Basic Figma mental model
Q8 → Testing before claiming success
```

The coverage map should make duplication and omissions obvious.

Do not count repeated questions as additional competency coverage.

---

## 28. Beginner Integrity

For beginner curricula:

- use terminology already taught;
- define unavoidable new context inside the question;
- avoid professional shorthand before it has been introduced;
- avoid asking learners to infer unstated industry conventions;
- keep scenario complexity appropriate to accumulated knowledge.

The difficulty should come from the concept, not from decoding the English.

---

## 29. Curriculum-Specific Adaptation

This standard is universal, but questions must reflect the profession.

### Product Design

Favor:

- evidence;
- assumptions;
- critique;
- user needs;
- research choices;
- accessibility reasoning;
- interaction decisions;
- product trade-offs.

### Front-End Web Engineering

Favor:

- browser behavior;
- HTML/CSS/JS reasoning;
- accessibility;
- debugging;
- state;
- APIs;
- performance;
- testing;
- implementation trade-offs.

### Back-End Web Engineering

Favor:

- HTTP;
- APIs;
- data modeling;
- validation;
- authentication/authorization;
- SQL;
- transactions;
- security;
- testing;
- system behavior.

Do not reuse generic “professional judgment” templates across unrelated professions.

---

## 30. Validation Severity

### Hard Fail

A Skill Check must fail authoring/validation when:

- a question tests untaught knowledge;
- multiple answers are defensible in a single-select question;
- a question duplicates another question's learning target without justification;
- distractors are obviously nonsensical;
- internal platform/curriculum policy leaks into subject assessment;
- template substitution produces unnatural learner-visible language;
- a practical competency is being falsely treated as proven by quiz completion;
- the question depends on an unassigned resource section;
- the correct answer is revealed by the stem, hint, another question, or option construction.

### Review / Warning

Flag for human review when:

- difficulty may be poorly calibrated;
- scenario realism is questionable;
- two questions are semantically similar;
- one provider's language is being echoed too closely;
- an assessment might be better as a Build;
- feedback may be too verbose or too shallow.

---

## 31. Generation Workflow

When authoring a Skill Check:

1. Inspect the week's actual learning experience.
2. Extract assessable learning targets.
3. Exclude practical skills better proven elsewhere.
4. Build the assessment map.
5. Choose question types appropriate to each target.
6. Draft questions.
7. Create plausible distractors from likely misconceptions.
8. Validate every option independently.
9. Check question independence.
10. Run duplicate/semantic-overlap review.
11. Run platform-policy leakage review.
12. Run template-language review.
13. Run adversarial answerability review.
14. Verify feedback.
15. Produce the final coverage map.
16. Only then write the Skill Check into curriculum source.

Do not generate ten questions first and attempt to justify them afterward.

---

## 32. Anti-Patterns

Do not publish Skill Checks containing patterns such as:

### Duplicate pair

> What should the designer do?

followed by:

> Which principle explains why the preferred response is stronger?

when both assess the same reasoning.

### Cartoon distractor

> Ignore all evidence because speed is always more important.

### Platform leakage

> Why does XcelerateAI avoid requiring paid Dev Mode?

### Metadata leakage

> What should happen after Product Design, Evidence, and Your Figma Workspace?

### Reference trivia

> Which sidebar contains feature X?

when the learner can simply use the documentation while working.

### Fake competency proof

> Which button creates Auto Layout?

followed by a claim that the learner has demonstrated Auto Layout competence.

### Vague professionalism

> Choose the most professional response.

without enough conditions to make one answer objectively best.

---

## 33. Quality Standard

A strong Skill Check should make an informed reviewer say:

> “A learner who did not understand this week's important ideas would genuinely struggle with these questions, while a learner who understood the material could reason their way through them.”

That is the target.

Not difficulty for its own sake.

Not trivia.

Not clever wording.

Not question volume.

**Understanding.**
