import React from 'react';
import { ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react';

export default React.memo(function QuizAssessment({ definition, onSubmit, onLeave }) {
  const [questionIndex, setQuestionIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState({});
  const [confirmUnanswered, setConfirmUnanswered] = React.useState(false);
  const questions = definition.questions;
  const question = questions[questionIndex];
  const unansweredCount = questions.filter((item) => answers[item.id] == null).length;
  const isLast = questionIndex === questions.length - 1;

  const submit = () => {
    if (unansweredCount > 0 && !confirmUnanswered) {
      setConfirmUnanswered(true);
      return;
    }
    onSubmit(answers);
  };

  return (
    <section className="surface-card overflow-hidden" aria-labelledby="quiz-title">
      <div className="border-b border-border-divider px-5 py-5 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-violet">Skill Check</p>
            <h2 id="quiz-title" className="mt-1 font-heading text-xl font-extrabold text-text-primary">{definition.title}</h2>
          </div>
          <button type="button" onClick={onLeave} className="btn-secondary px-3 py-2 text-xs">Leave Skill Check</button>
        </div>
        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-text-secondary" aria-live="polite">Question {questionIndex + 1} of {questions.length}</p>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-soft" aria-hidden="true">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-violet to-brand-cyan transition-[width] duration-200" style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="px-5 py-7 sm:px-8 sm:py-9">
        <fieldset>
          <legend className="max-w-3xl font-heading text-lg font-bold leading-relaxed text-text-primary sm:text-xl">{question.prompt}</legend>
          <div className="mt-6 grid gap-3">
            {question.options.map((option) => {
              const selected = answers[question.id] === option.id;
              return (
                <label key={option.id} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all duration-200 focus-within:ring-2 focus-within:ring-brand-violet ${selected ? 'border-brand-violet bg-brand-violet/10' : 'border-border-default bg-bg-surface hover:border-border-strong'}`}>
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option.id}
                    checked={selected}
                    onChange={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}
                    className="h-4 w-4 accent-brand-violet"
                  />
                  <span className="flex-1 text-sm font-medium text-text-primary">{option.label}</span>
                  <span className="text-xs font-bold uppercase text-text-muted">{option.id}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {confirmUnanswered && (
          <div className="mt-6 rounded-2xl border border-brand-amber/30 bg-brand-amber/5 p-4" role="alert">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-brand-amber" />
              <div>
                <p className="text-sm font-bold text-text-primary">{unansweredCount} {unansweredCount === 1 ? 'question' : 'questions'} unanswered.</p>
                <p className="mt-1 text-sm text-text-secondary">Unanswered questions will be marked incorrect.</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => setConfirmUnanswered(false)} className="btn-secondary px-4 py-2 text-xs">Go back</button>
              <button type="button" onClick={submit} className="btn-primary px-4 py-2 text-xs">Submit anyway</button>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-border-divider pt-5">
          <button type="button" disabled={questionIndex === 0} onClick={() => { setQuestionIndex((value) => value - 1); setConfirmUnanswered(false); }} className="btn-secondary flex items-center gap-2 px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-40">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          {isLast ? (
            <button type="button" onClick={submit} className="btn-primary px-5 py-2.5 text-sm">Submit Skill Check</button>
          ) : (
            <button type="button" onClick={() => { setQuestionIndex((value) => value + 1); setConfirmUnanswered(false); }} className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm">
              Next <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
});
