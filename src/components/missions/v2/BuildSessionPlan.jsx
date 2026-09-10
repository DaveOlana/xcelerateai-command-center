import { Clock3 } from 'lucide-react';
import { formatMinutes } from '../../../curriculum-v2/runtime/learningPresentation.js';

export default function BuildSessionPlan({ sessions, headingId = 'build-session-plan-heading' }) {
  if (!sessions.length) return null;
  return (
    <section aria-labelledby={headingId}>
      <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-text-muted">Suggested plan</p><h3 id={headingId} className="mt-1 font-heading text-lg font-extrabold text-text-primary">Focused sessions</h3><p className="mt-1 text-xs text-text-muted">Planning guidance only; these are not completion checkboxes.</p></div>
      <ol className="mt-4 grid gap-3 lg:grid-cols-2">
        {sessions.map((session, index) => (
          <li key={session.id} className="rounded-2xl border border-border-default bg-bg-soft p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-violet">Session {index + 1}</p><h4 className="mt-1 font-bold text-text-primary">{session.title}</h4></div><span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-text-muted"><Clock3 className="h-3.5 w-3.5" aria-hidden="true" />~{formatMinutes(session.estimatedMinutes)}</span></div>
            {session.steps.length > 0 && <div className="mt-4"><p className="text-xs font-bold text-text-muted">Contains</p><ul className="mt-2 space-y-2">{session.steps.map((step) => <li key={step.id} className="flex gap-2 text-sm leading-relaxed text-text-secondary"><span className="font-mono text-brand-violet">•</span>{step.text}</li>)}</ul></div>}
          </li>
        ))}
      </ol>
    </section>
  );
}
