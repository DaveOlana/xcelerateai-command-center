import { BookOpen, Check, Lightbulb } from 'lucide-react';

export default function RecoveryPrompt({ recovery, onReturnToStudy }) {
  const resourceDone = Boolean(recovery?.resourceReviewedAt);
  const insightDone = Boolean(recovery?.insightCreatedAt);
  return (
    <section className="surface-card p-6 sm:p-8" aria-labelledby="recovery-title">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-violet">Skill Check paused</p>
      <h2 id="recovery-title" className="mt-2 font-heading text-2xl font-extrabold text-text-primary">Take another look before retrying.</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">
        Review one Study resource and write one fresh Study insight. Your next attempt unlocks when both are complete.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {[
          { done: resourceDone, label: 'Review a resource', Icon: BookOpen },
          { done: insightDone, label: 'Write a new insight', Icon: Lightbulb },
        ].map(({ done, label, Icon }) => (
          <div key={label} className="flex items-center gap-3 rounded-2xl border border-border-default bg-bg-soft p-4">
            <span className={`flex h-8 w-8 items-center justify-center rounded-full border ${done ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500' : 'border-border-strong text-text-muted'}`}>
              {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            </span>
            <span className="text-sm font-semibold text-text-primary">{label}</span>
          </div>
        ))}
      </div>
      {onReturnToStudy && (
        <button type="button" onClick={onReturnToStudy} className="btn-primary mt-6 px-5 py-2.5 text-sm">
          Return to Study
        </button>
      )}
    </section>
  );
}
