import { BookOpen, Check, ExternalLink } from 'lucide-react';
import { getProviderIdentity } from '../../common/ProviderIdentity';
import {
  formatResourceFormat,
  getLearningRolePresentation,
} from '../../../curriculum-v2/runtime/learningPresentation.js';

const ROLE_STYLES = {
  learn: 'border-brand-violet/25 bg-brand-violet/10 text-brand-violet',
  practice: 'border-brand-cyan/25 bg-brand-cyan/10 text-brand-cyan',
  reference: 'border-border-strong bg-bg-soft text-text-secondary',
};

export default function StudyResourceCard({ assignment, resource, record, inspectionOnly, onOpen, onComplete }) {
  const learningRole = getLearningRolePresentation(assignment.learningRole);
  const completed = Boolean(record.completedAt);
  const opened = Boolean(record.openedAt);
  const providerResource = { ...resource, metadata: { ...(resource.metadata || {}), provider: resource.provider }, type: formatResourceFormat(resource.format) };
  const { Icon: ProviderIcon, color: providerColor } = getProviderIdentity(providerResource);
  const status = completed ? 'Completed' : opened ? 'Opened' : 'Not opened';

  return (
    <article className={`surface-card surface-card--compact flex h-full flex-col overflow-hidden ${assignment.role === 'core' ? 'border-brand-violet/20' : ''}`}>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {learningRole && (
              <span className={`rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] ${ROLE_STYLES[assignment.learningRole]}`} title={learningRole.description}>
                {learningRole.label}
              </span>
            )}
            <span className="rounded-full border border-border-default bg-bg-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              {assignment.role === 'core' ? 'Core' : 'Optional'}
            </span>
          </div>
          <span className={`flex items-center gap-1.5 text-xs font-semibold ${completed ? 'text-brand-green' : 'text-text-muted'}`}>
            {completed && <Check className="h-3.5 w-3.5" aria-hidden="true" />}{status}
          </span>
        </div>

        <h3 className="mt-4 font-heading text-lg font-extrabold leading-snug text-text-primary">{resource.title}</h3>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-text-muted">
          <span className="flex min-w-0 items-center gap-2 text-text-secondary">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border-default bg-bg-soft" style={{ color: providerColor }}>
              <ProviderIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <span className="break-words font-semibold">{resource.provider}</span>
          </span>
          <span>{formatResourceFormat(resource.format)}</span>
          <span>{resource.estimatedMinutes} min</span>
        </div>

        <section className="mt-5" aria-label="Why this resource">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted">Why this resource</p>
          <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{assignment.purpose}</p>
        </section>

        {resource.location && (
          <section className="mt-4 rounded-xl border border-border-default bg-bg-soft p-3.5 text-xs leading-relaxed text-text-secondary" aria-label="Assigned section or activity">
            <div className="flex items-center gap-2 font-bold text-text-primary"><BookOpen className="h-3.5 w-3.5" aria-hidden="true" /> Assigned section or activity</div>
            {resource.location.start && <p className="mt-2"><strong>Start:</strong> {resource.location.start}</p>}
            {resource.location.stop && <p className="mt-1"><strong>Stop:</strong> {resource.location.stop}</p>}
            {resource.location.note && <p className="mt-2">{resource.location.note}</p>}
          </section>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-5 sm:flex-row">
          <a href={resource.url} target="_blank" rel="noopener noreferrer" onClick={() => onOpen(resource.id)} className="btn-secondary min-h-11 flex-1 gap-2 px-4 py-2.5 text-xs">
            Open resource <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span>
          </a>
          <button type="button" disabled={inspectionOnly || completed || !opened} onClick={() => onComplete(resource.id)} className="btn-primary min-h-11 flex-1 gap-2 px-4 py-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-45">
            {completed ? <><Check className="h-3.5 w-3.5" aria-hidden="true" /> Completed</> : 'Mark complete'}
          </button>
        </div>
        {!opened && !completed && <p className="mt-2 text-xs text-text-muted">Open this resource before marking it complete.</p>}
      </div>
    </article>
  );
}
