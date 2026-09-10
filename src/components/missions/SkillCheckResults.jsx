import React from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { getAttemptReviewItems } from '../../utils/skillCheckUtils.js';

export default function SkillCheckResults({ attempt, canRetry, onRetry, onReturnToStudy, onContinueToBuild }) {
  const [showReview, setShowReview] = React.useState(false);
  const reviewItems = React.useMemo(() => getAttemptReviewItems(attempt), [attempt]);

  return (
    <section className="surface-card overflow-hidden" aria-labelledby="result-title">
      <div className={`px-6 py-8 sm:px-9 ${attempt.passed ? 'bg-gradient-to-br from-brand-violet/10 via-transparent to-brand-cyan/10' : 'bg-bg-surface'}`}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-violet">Skill Check Complete</p>
            <h2 id="result-title" className="mt-2 font-heading text-3xl font-extrabold text-text-primary">{attempt.score} / {attempt.total}</h2>
            <p className={`mt-2 text-sm font-bold ${attempt.passed ? 'text-emerald-500' : 'text-text-secondary'}`}>
              {attempt.passed ? 'Passed' : 'Review the Study resources, then try again.'}
            </p>
          </div>
          {attempt.passed && (
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 motion-safe:animate-scale-in">
              <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
              <span className="sr-only">Passed</span>
            </span>
          )}
        </div>
        <div className="mt-7 flex flex-wrap gap-3">
          {attempt.passed ? (
            <button type="button" onClick={onContinueToBuild} className="btn-primary px-5 py-2.5 text-sm">Continue to Build</button>
          ) : canRetry ? (
            <button type="button" onClick={onRetry} className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"><RotateCcw className="h-4 w-4" /> Retry Skill Check</button>
          ) : (
            <button type="button" onClick={onReturnToStudy} className="btn-primary px-5 py-2.5 text-sm">Return to Study</button>
          )}
          <button type="button" onClick={() => setShowReview((value) => !value)} aria-expanded={showReview} className="btn-secondary flex items-center gap-2 px-5 py-2.5 text-sm">
            Review answers {showReview ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {!attempt.passed && canRetry && <button type="button" onClick={onReturnToStudy} className="btn-secondary px-5 py-2.5 text-sm">Return to Study</button>}
        </div>
      </div>

      {showReview && (
        <div className="space-y-3 border-t border-border-divider bg-bg-soft p-5 sm:p-7">
          {reviewItems.map((item, index) => (
            <article key={item.id} className="rounded-2xl border border-border-default bg-bg-surface p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-sm font-bold leading-relaxed text-text-primary">{index + 1}. {item.prompt}</h3>
                <span className={`flex-none rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${item.correct ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-500' : 'border-brand-amber/30 bg-brand-amber/5 text-brand-amber'}`}>
                  {item.correct ? 'Correct' : 'Incorrect'}
                </span>
              </div>
              <p className="mt-3 text-sm text-text-secondary"><span className="font-semibold text-text-primary">Your answer:</span> {item.learnerAnswer}</p>
              {attempt.passed && (
                <div className="mt-3 border-t border-border-divider pt-3 text-sm text-text-secondary">
                  <p><span className="font-semibold text-text-primary">Correct answer:</span> {item.correctAnswer}</p>
                  {item.explanation && <p className="mt-2 leading-relaxed">{item.explanation}</p>}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
