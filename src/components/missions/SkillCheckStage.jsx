import React from 'react';
import { ChevronDown, ChevronUp, History, Play } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  createSubmittedAttempt,
  getAssessmentRecord,
  isQuizSkillCheck,
  isRecoveryLocked,
} from '../../utils/skillCheckUtils.js';
import QuizAssessment from './QuizAssessment';
import SkillCheckResults from './SkillCheckResults';
import RecoveryPrompt from './RecoveryPrompt';

function LegacyReadiness({ definition, weekNumber }) {
  const { skillChecks, submitSkillCheck } = useApp();
  const saved = skillChecks[weekNumber];
  const [answer, setAnswer] = React.useState(saved?.answers?.explanation || '');
  const [confidence, setConfidence] = React.useState(saved?.confidence || 3);
  const [savedNow, setSavedNow] = React.useState(false);

  const submit = (event) => {
    event.preventDefault();
    submitSkillCheck(weekNumber, { explanation: answer }, confidence, true);
    setSavedNow(true);
  };

  return (
    <section className="surface-card p-6 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-violet">Stage 2</p>
      <h2 className="mt-2 font-heading text-2xl font-extrabold text-text-primary">{definition.title || 'Readiness Skill Check'}</h2>
      <p className="mt-2 text-sm text-text-secondary">Explain what you understand and confirm how ready you feel before building.</p>

      <div className="mt-6 space-y-3">
        {(definition.questions || []).map((question, index) => (
          <div key={question.id || index} className="rounded-2xl border border-border-default bg-bg-soft p-4">
            <p className="text-sm font-semibold leading-relaxed text-text-primary">{index + 1}. {question.prompt || question.question}</p>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="readiness-note" className="mb-2 block text-sm font-bold text-text-primary">Your readiness note</label>
          <textarea id="readiness-note" rows={4} required value={answer} onChange={(event) => setAnswer(event.target.value)} className="input-base w-full text-sm" placeholder="Explain your understanding in your own words..." />
        </div>
        <div>
          <label htmlFor="readiness-confidence" className="mb-2 block text-sm font-bold text-text-primary">Confidence: {confidence}/5</label>
          <input id="readiness-confidence" type="range" min="1" max="5" value={confidence} onChange={(event) => setConfidence(Number(event.target.value))} className="w-full accent-brand-violet" />
        </div>
        <button type="submit" className="btn-primary px-5 py-2.5 text-sm">Save readiness</button>
        {(savedNow || saved?.confirmed) && <p className="text-sm font-semibold text-emerald-500" role="status">Readiness saved. Build is available.</p>}
      </form>
    </section>
  );
}

export default function SkillCheckStage({
  roadmapId,
  week,
  definition,
  unlocked,
  onAssessmentStateChange,
  onReturnToStudy,
  onContinue,
  attemptRecord = null,
  onSubmitAttempt = null,
}) {
  const { skillCheckAttempts, submitQuizAttempt, sessionTimer, pauseTimer } = useApp();
  const [assessmentActive, setAssessmentActive] = React.useState(false);
  const [selectedAttempt, setSelectedAttempt] = React.useState(null);
  const [reviewingHistory, setReviewingHistory] = React.useState(false);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const quizMode = isQuizSkillCheck(definition);
  const record = quizMode
    ? (attemptRecord || getAssessmentRecord(skillCheckAttempts, roadmapId, definition.skillCheckId))
    : null;
  const latestAttempt = record?.attempts?.[record.attempts.length - 1] || null;
  const locked = isRecoveryLocked(record);

  React.useEffect(() => () => onAssessmentStateChange?.(false), [onAssessmentStateChange]);

  if (!quizMode) return <LegacyReadiness definition={definition} weekNumber={week.weekNumber} />;

  const setActive = (value) => {
    setAssessmentActive(value);
    onAssessmentStateChange?.(value);
  };

  const begin = () => {
    if (!unlocked || locked) return;
    if (sessionTimer.isRunning) pauseTimer();
    setSelectedAttempt(null);
    setReviewingHistory(false);
    setActive(true);
  };

  const leave = () => {
    if (!window.confirm("Leave Skill Check?\nYour current answers won't be saved.")) return;
    setActive(false);
  };

  const submit = (answers) => {
    const attempt = createSubmittedAttempt({
      definition,
      answers,
      attemptNumber: (record?.attempts?.length || 0) + 1,
    });
    if (onSubmitAttempt) onSubmitAttempt(attempt);
    else submitQuizAttempt({ roadmapId, skillCheckId: definition.skillCheckId, attempt });
    setSelectedAttempt(attempt);
    setReviewingHistory(false);
    setActive(false);
  };

  if (assessmentActive) return <QuizAssessment definition={definition} onSubmit={submit} onLeave={leave} />;

  if (selectedAttempt) {
    const isAlreadyPersisted = record?.attempts?.some((attempt) => attempt.attemptId === selectedAttempt.attemptId);
    const projectedFailures = selectedAttempt.passed
      ? 0
      : isAlreadyPersisted ? (record?.consecutiveFailures || 0) : (record?.consecutiveFailures || 0) + 1;
    return (
      <SkillCheckResults
        attempt={selectedAttempt}
        canRetry={!reviewingHistory && !selectedAttempt.passed && projectedFailures < 2}
        onRetry={begin}
        onReturnToStudy={onReturnToStudy}
        onContinueToBuild={onContinue}
      />
    );
  }

  if (locked) return <RecoveryPrompt recovery={record.recovery} onReturnToStudy={onReturnToStudy} />;

  if (latestAttempt?.passed) {
    return <SkillCheckResults attempt={latestAttempt} onContinueToBuild={onContinue} onReturnToStudy={onReturnToStudy} />;
  }

  return (
    <div className="space-y-5">
      <section className="surface-card p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-violet">Stage 2</p>
        <h2 className="mt-2 font-heading text-2xl font-extrabold text-text-primary">{definition.title || 'Skill Check'}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">Ten focused questions. You can move backward and forward, and unanswered questions count as incorrect.</p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button type="button" disabled={!unlocked} onClick={begin} className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-45">
            <Play className="h-4 w-4" /> {record?.consecutiveFailures === 1 ? 'Retry Skill Check' : 'Take Skill Check'}
          </button>
          <span className="text-xs font-semibold text-text-muted">Pass mark: {definition.passingScore}%</span>
        </div>
      </section>

      {(record?.attempts?.length || 0) > 0 && (
        <section className="surface-card surface-card--compact overflow-hidden">
          <button type="button" onClick={() => setHistoryOpen((value) => !value)} aria-expanded={historyOpen} className="flex w-full items-center justify-between gap-3 p-5 text-left">
            <span className="flex items-center gap-2 text-sm font-bold text-text-primary"><History className="h-4 w-4 text-brand-violet" /> Previous attempts</span>
            {historyOpen ? <ChevronUp className="h-4 w-4 text-text-muted" /> : <ChevronDown className="h-4 w-4 text-text-muted" />}
          </button>
          {historyOpen && (
            <div className="space-y-2 border-t border-border-divider p-4">
              {[...record.attempts].reverse().map((attempt) => (
                <button key={attempt.attemptId} type="button" onClick={() => { setReviewingHistory(true); setSelectedAttempt(attempt); }} className="flex w-full items-center justify-between gap-4 rounded-xl border border-border-default bg-bg-soft px-4 py-3 text-left hover:border-border-strong">
                  <span className="text-sm font-semibold text-text-primary">Attempt {attempt.attemptNumber} — {attempt.score}/{attempt.total}</span>
                  <span className={`text-xs font-bold ${attempt.passed ? 'text-emerald-500' : 'text-text-muted'}`}>{attempt.passed ? 'Passed' : 'Failed'}</span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
