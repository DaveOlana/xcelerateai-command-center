function normalizeOption(option, index) {
  if (typeof option === 'string') {
    return { id: String.fromCharCode(97 + index), label: option };
  }
  const id = option?.id || option?.value || String.fromCharCode(97 + index);
  return {
    ...(option || {}),
    id: String(id),
    label: String(option?.label || option?.text || option?.value || id),
  };
}

export function normalizeSkillCheckQuestion(question, index = 0) {
  if (typeof question === 'string') {
    return {
      id: `legacy-question-${index + 1}`,
      questionId: `legacy-question-${index + 1}`,
      prompt: question,
      question,
      type: 'short_text',
      options: [],
    };
  }

  const raw = question || {};
  const id = raw.questionId || raw.id || `question-${index + 1}`;
  const prompt = raw.prompt || raw.question || raw.text || '';
  return {
    ...raw,
    id: String(id),
    questionId: String(id),
    prompt: String(prompt),
    question: String(prompt),
    type: raw.type || raw.answerType || 'short_text',
    options: Array.isArray(raw.options) ? raw.options.map(normalizeOption) : [],
    correctOptionId: raw.correctOptionId ?? raw.correctAnswer ?? null,
    explanation: raw.explanation == null ? null : String(raw.explanation),
  };
}

export function normalizeSkillCheckValue(value) {
  if (Array.isArray(value)) {
    if (value.length === 1 && value[0] && typeof value[0] === 'object' && Array.isArray(value[0].questions)) {
      return normalizeSkillCheckValue(value[0]);
    }
    return value.map(normalizeSkillCheckQuestion);
  }

  if (value && typeof value === 'object' && Array.isArray(value.questions)) {
    const id = value.skillCheckId || value.id || null;
    return {
      ...value,
      id: id ? String(id) : null,
      skillCheckId: id ? String(id) : null,
      mode: value.mode || 'legacy',
      passingScore: value.passingScore == null ? null : Number(value.passingScore),
      questions: value.questions.map(normalizeSkillCheckQuestion),
    };
  }

  if (value == null || value === '') return [];
  return [normalizeSkillCheckQuestion(value, 0)];
}

export function getSkillCheckDefinition(week) {
  if (!week) return { mode: 'legacy', skillCheckId: null, title: 'Skill Check', questions: [] };
  const source = week.skillCheck ?? week.skillChecks ?? week.quiz ?? week.checkpoint ?? [];
  const normalized = normalizeSkillCheckValue(source);

  if (Array.isArray(normalized)) {
    return {
      mode: 'legacy',
      skillCheckId: null,
      title: 'Readiness Skill Check',
      questions: normalized,
    };
  }

  return normalized;
}

export function getQuizValidationErrors(definition) {
  if (definition?.mode !== 'quiz') return [];
  const errors = [];
  const questions = Array.isArray(definition.questions) ? definition.questions : [];
  if (!definition.skillCheckId) errors.push('skillCheckId is required.');
  if (!Number.isInteger(definition.passingScore) || definition.passingScore < 1 || definition.passingScore > 100) {
    errors.push('passingScore must be an integer from 1 to 100.');
  }
  if (questions.length !== 10) errors.push('Quiz mode requires exactly 10 questions.');

  const ids = questions.map((question) => question.id).filter(Boolean);
  if (new Set(ids).size !== questions.length) errors.push('Question IDs must be present and unique.');

  questions.forEach((question, index) => {
    if (!question.prompt?.trim()) errors.push(`Question ${index + 1} requires a prompt.`);
    if (question.type !== 'multiple_choice') errors.push(`Question ${index + 1} must use multiple_choice.`);
    if (!Array.isArray(question.options) || question.options.length !== 4) {
      errors.push(`Question ${index + 1} requires exactly four options.`);
      return;
    }
    const optionIds = question.options.map((option) => option.id);
    if (optionIds.some((id) => !id) || new Set(optionIds).size !== 4) {
      errors.push(`Question ${index + 1} option IDs must be present and unique.`);
    }
    if (!optionIds.includes(String(question.correctOptionId))) {
      errors.push(`Question ${index + 1} correctOptionId must match one option.`);
    }
    if (question.explanation != null && typeof question.explanation !== 'string') {
      errors.push(`Question ${index + 1} explanation must be a string.`);
    }
  });
  return errors;
}

export function isQuizSkillCheck(definition) {
  return definition?.mode === 'quiz' && getQuizValidationErrors(definition).length === 0;
}

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function sameOptionOrder(left, right) {
  return left.length === right.length && left.every((option, index) => option.id === right[index]?.id);
}

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffledValues(items, seedText) {
  const result = [...items];
  const random = seededRandom(hashString(seedText));
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function optionPermutations(items) {
  if (items.length <= 1) return [items.map((item) => ({ ...item }))];
  return items.flatMap((item, index) => optionPermutations([
    ...items.slice(0, index),
    ...items.slice(index + 1),
  ]).map((tail) => [{ ...item }, ...tail]));
}

function optionsForAttempt(items, seedText, attemptNumber) {
  const permutations = optionPermutations(items);
  let startIndex = hashString(seedText) % permutations.length;
  if (sameOptionOrder(permutations[startIndex], items)) startIndex = (startIndex + 1) % permutations.length;
  return permutations[(startIndex + attemptNumber - 1) % permutations.length];
}

function correctPositionSchedule(questionCount, seedText, attemptNumber) {
  const balanced = Array.from({ length: questionCount }, (_, index) => index % 4);
  const base = shuffledValues(balanced, seedText);
  return base.map((position) => (position + attemptNumber - 1) % 4);
}

function placeCorrectOption(options, correctOptionId, targetPosition, authoredOptions) {
  const correct = options.find((option) => option.id === String(correctOptionId));
  if (!correct) return options;
  const arranged = options.filter((option) => option.id !== correct.id);
  arranged.splice(Math.min(targetPosition, arranged.length), 0, correct);
  if (sameOptionOrder(arranged, authoredOptions)) {
    const distractorIndexes = arranged.map((option, index) => option.id === correct.id ? -1 : index).filter((index) => index >= 0);
    [arranged[distractorIndexes[0]], arranged[distractorIndexes[1]]] = [arranged[distractorIndexes[1]], arranged[distractorIndexes[0]]];
  }
  return arranged;
}

export function prepareSkillCheckAttempt(definition, attemptNumber) {
  if (definition?.optionOrder !== 'shuffle-per-attempt') return definition;
  const stableAttemptNumber = Number.isInteger(attemptNumber) && attemptNumber > 0 ? attemptNumber : 1;
  const skillCheckId = definition.skillCheckId || definition.id || 'skill-check';
  const correctPositions = correctPositionSchedule(definition.questions.length, skillCheckId, stableAttemptNumber);
  return {
    ...definition,
    questions: definition.questions.map((question, questionIndex) => ({
      ...question,
      options: placeCorrectOption(optionsForAttempt(
        question.options,
        `${skillCheckId}:${question.id}`,
        stableAttemptNumber,
      ), question.correctOptionId, correctPositions[questionIndex], question.options),
    })),
  };
}

export function getAssessmentRecord(store, roadmapId, skillCheckId) {
  return store?.[roadmapId]?.[skillCheckId] || { attempts: [], consecutiveFailures: 0, recovery: null };
}

export function setAssessmentRecord(store, roadmapId, skillCheckId, record) {
  return {
    ...(store || {}),
    [roadmapId]: {
      ...(store?.[roadmapId] || {}),
      [skillCheckId]: record,
    },
  };
}

export function scoreQuiz(definition, answers = {}) {
  const questions = definition?.questions || [];
  const correct = questions.reduce((total, question) => (
    answers[question.id] != null && String(answers[question.id]) === String(question.correctOptionId)
      ? total + 1
      : total
  ), 0);
  const total = questions.length;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  return {
    score: correct,
    total,
    percentage,
    passed: percentage >= definition.passingScore,
  };
}

export function createSubmittedAttempt({
  definition,
  answers = {},
  attemptNumber,
  submittedAt = new Date().toISOString(),
  attemptId,
}) {
  const result = scoreQuiz(definition, answers);
  const normalizedAnswers = Object.fromEntries(
    definition.questions.map((question) => [question.id, answers[question.id] ?? null])
  );
  return {
    attemptId: attemptId || `${definition.skillCheckId}-attempt-${attemptNumber}-${Date.parse(submittedAt)}`,
    attemptNumber,
    questionIds: definition.questions.map((question) => question.id),
    answers: normalizedAnswers,
    ...result,
    submittedAt,
    questionSnapshot: definition.questions.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      options: question.options.map((option) => ({ id: option.id, label: option.label })),
      correctOptionId: String(question.correctOptionId),
      explanation: question.explanation || null,
    })),
  };
}

export function applySubmittedAttempt(record, attempt) {
  const current = record || { attempts: [], consecutiveFailures: 0, recovery: null };
  const consecutiveFailures = attempt.passed ? 0 : (current.consecutiveFailures || 0) + 1;
  const recovery = !attempt.passed && consecutiveFailures >= 2
    ? {
        lockedAt: attempt.submittedAt,
        afterAttemptId: attempt.attemptId,
        resourceId: null,
        resourceReviewedAt: null,
        insightNoteId: null,
        insightCreatedAt: null,
        recoveredAt: null,
      }
    : null;
  return {
    attempts: [...(current.attempts || []), attempt],
    consecutiveFailures,
    recovery,
  };
}

export function isRecoveryLocked(record) {
  return Boolean(record?.recovery?.lockedAt && !record?.recovery?.recoveredAt);
}

function maybeCompleteRecovery(record, completedAt) {
  if (!record?.recovery) return record;
  if (!record.recovery.resourceReviewedAt || !record.recovery.insightCreatedAt) return record;
  return {
    ...record,
    consecutiveFailures: 0,
    recovery: {
      ...record.recovery,
      recoveredAt: completedAt,
    },
  };
}

export function applyRecoveryResourceReview(record, { resourceId, reviewedAt }) {
  if (!isRecoveryLocked(record) || Date.parse(reviewedAt) <= Date.parse(record.recovery.lockedAt)) return record;
  return maybeCompleteRecovery({
    ...record,
    recovery: {
      ...record.recovery,
      resourceId,
      resourceReviewedAt: reviewedAt,
    },
  }, reviewedAt);
}

export function applyRecoveryInsight(record, note) {
  const qualifies = isRecoveryLocked(record) &&
    note?.noteType === 'study_insight' &&
    note?.insightScope === 'study' &&
    !note?.linkedResource &&
    String(note?.content || note?.whatLearned || '').trim().length > 0 &&
    Date.parse(note.createdAt) > Date.parse(record.recovery.lockedAt);
  if (!qualifies) return record;
  return maybeCompleteRecovery({
    ...record,
    recovery: {
      ...record.recovery,
      insightNoteId: note.id,
      insightCreatedAt: note.createdAt,
    },
  }, note.createdAt);
}

export function getAttemptReviewItems(attempt) {
  return (attempt?.questionSnapshot || []).map((question) => {
    const learnerOptionId = attempt.answers?.[question.id] ?? null;
    const learnerOption = question.options.find((option) => option.id === learnerOptionId) || null;
    const correct = learnerOptionId != null && learnerOptionId === question.correctOptionId;
    const base = {
      id: question.id,
      prompt: question.prompt,
      learnerAnswer: learnerOption?.label || 'Unanswered',
      correct,
    };
    if (!attempt.passed) return base;
    return {
      ...base,
      correctAnswer: question.options.find((option) => option.id === question.correctOptionId)?.label || '',
      explanation: question.explanation || null,
    };
  });
}
