import React from 'react';
import { Check, Lock } from 'lucide-react';

export default function MissionStageStepper({ steps, activeStage, getStatus, onSelect }) {
  const itemRefs = React.useRef({});

  React.useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    itemRefs.current[activeStage]?.scrollIntoView?.({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
  }, [activeStage]);

  return (
    <nav className="surface-card surface-card--compact p-3 sm:p-4 no-print" aria-label="Mission stages">
      <div className="overflow-x-auto snap-x snap-mandatory [scrollbar-width:thin]">
        <ol className="flex min-w-max items-center px-1 py-1">
          {steps.map((step, index) => {
            const status = getStatus(step.id);
            const isLocked = status === 'locked';
            const isComplete = status === 'completed';
            const isActive = activeStage === step.id;
            const Icon = step.icon;
            return (
              <React.Fragment key={step.id}>
                {index > 0 && (
                  <li aria-hidden="true" className={`h-px w-5 sm:w-8 ${isComplete || isActive ? 'bg-brand-violet' : 'bg-border-default'}`} />
                )}
                <li className="snap-center">
                  <button
                    ref={(node) => { itemRefs.current[step.id] = node; }}
                    type="button"
                    disabled={isLocked}
                    aria-current={isActive ? 'step' : undefined}
                    aria-label={`${step.label}, ${isLocked ? 'locked' : isComplete ? 'completed' : isActive ? 'current' : 'available'}`}
                    onClick={() => onSelect(step.id)}
                    className={`group min-w-[112px] rounded-2xl border px-3 py-2.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page ${
                      isActive
                        ? 'border-brand-violet/45 bg-brand-violet/10 shadow-primary-glow-sm'
                        : isComplete
                          ? 'border-emerald-500/25 bg-emerald-500/5 hover:border-emerald-500/45'
                          : isLocked
                            ? 'cursor-not-allowed border-border-default bg-bg-soft opacity-70'
                            : 'border-border-default bg-bg-surface hover:border-border-strong'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                        isActive ? 'border-brand-violet bg-brand-violet text-on-brand' :
                          isComplete ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' :
                            'border-border-default bg-bg-soft text-text-muted'
                      }`}>
                        {isComplete ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> :
                          isLocked ? <Lock className="h-3.5 w-3.5" aria-hidden="true" /> :
                            <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
                      </span>
                      <span className="text-xs font-bold text-text-primary">{step.label}</span>
                    </span>
                    <span className="mt-1.5 block pl-9 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                      {isActive ? 'Current' : isComplete ? 'Completed' : isLocked ? 'Locked' : 'Available'}
                    </span>
                  </button>
                </li>
              </React.Fragment>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
