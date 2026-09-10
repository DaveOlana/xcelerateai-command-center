import React from 'react';
import { ArrowRight, BookOpen, Clock3, Layers3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../../components/common/UIComponents';
import { useApp } from '../../context/AppContext';
import { getCurriculumLaunchLabel } from '../../curriculum-v2/state/curriculumSelection.js';

export default function CurriculumCatalog() {
  const { publishedV2Curricula, v2LearnerState, selectV2Curriculum, activeV2CurriculumId } = useApp();
  const navigate = useNavigate();
  const launch = (curriculumId) => {
    if (selectV2Curriculum(curriculumId)) navigate('/');
  };
  return (
    <PageShell className="max-w-5xl">
      <header className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-violet">Curriculum catalog</p>
        <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">Choose what you want to learn.</h1>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">Published learning paths are ready to run inside XcelerateAI. Your progress stays separate for every curriculum.</p>
      </header>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {publishedV2Curricula.map((curriculum) => {
          const label = getCurriculumLaunchLabel(v2LearnerState, curriculum.curriculumId);
          const current = activeV2CurriculumId === curriculum.curriculumId;
          return (
            <article key={curriculum.curriculumId} className="surface-card overflow-hidden p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-violet/25 bg-brand-violet/10 text-brand-violet"><BookOpen className="h-5 w-5" /></span>
                <span className="rounded-full border border-border-default bg-bg-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">Revision {curriculum.revision}</span>
              </div>
              <h2 className="mt-5 font-heading text-2xl font-extrabold text-text-primary">{curriculum.title}</h2>
              <p className="mt-2 min-h-12 text-sm leading-relaxed text-text-secondary">{curriculum.professionalOutcome}</p>
              <div className="mt-5 flex flex-wrap gap-4 border-y border-border-divider py-4 text-xs font-semibold text-text-muted">
                <span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> {curriculum.estimatedWeeks} weeks</span>
                <span className="flex items-center gap-1.5"><Layers3 className="h-3.5 w-3.5" /> Published</span>
              </div>
              <button type="button" onClick={() => launch(curriculum.curriculumId)} className="btn-primary mt-5 w-full justify-center gap-2 px-5 py-3 text-sm">
                {current ? 'Continue' : label} <ArrowRight className="h-4 w-4" />
              </button>
            </article>
          );
        })}
      </div>
      {publishedV2Curricula.length === 0 && <p className="surface-card mt-8 p-8 text-center text-sm text-text-muted">No published curricula are currently available.</p>}
    </PageShell>
  );
}
