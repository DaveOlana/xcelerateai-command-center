import React from 'react';
import { Check, LockKeyhole } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getAllV2ProjectProgress } from '../../curriculum-v2/runtime/projects.js';
import { WorkspaceEmptyState, WorkspaceSectionHeader } from '../../components/workspace/WorkspacePrimitives';

export default function V2Projects() {
  const { activeV2Curriculum: curriculum, activeV2Learner: learner } = useApp();
  const projects = React.useMemo(() => getAllV2ProjectProgress(curriculum, learner), [curriculum, learner]);
  const [selectedId, setSelectedId] = React.useState(projects[0]?.project.id || null);
  const selected = projects.find((item) => item.project.id === selectedId) || projects[0];
  if (!selected) return <div className="space-y-7"><WorkspaceSectionHeader title="Projects" description="Projects grow from completed weekly Builds." /><WorkspaceEmptyState title="No projects yet" description="This curriculum has no published projects." /></div>;
  return (
    <div className="space-y-7">
      <WorkspaceSectionHeader title="Projects" description="Milestone progress is derived from the real Builds completed in Missions." />
      {projects.length > 1 && <div className="flex gap-2 overflow-x-auto">{projects.map((item) => <button key={item.project.id} type="button" onClick={() => setSelectedId(item.project.id)} className={`min-w-52 rounded-2xl border p-4 text-left ${item.project.id === selected.project.id ? 'border-brand-violet bg-brand-violet/10' : 'border-border-default bg-bg-surface'}`}><span className="text-sm font-bold text-text-primary">{item.project.title}</span><span className="mt-1 block text-xs text-text-muted">{item.completedCount}/{item.totalCount} milestones</span></button>)}</div>}
      <section className="surface-card overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-brand-violet">{selected.completed ? 'Completed project' : 'Build-derived project'}</p><h2 className="mt-2 font-heading text-2xl font-extrabold text-text-primary">{selected.project.title}</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">{selected.project.outcome}</p></div><span className="font-mono text-3xl font-extrabold text-text-primary">{selected.percent}%</span></div>
        <div className="mt-7 divide-y divide-border-divider border-y border-border-divider">{selected.milestones.map((milestone) => <div key={milestone.id} className="flex items-center gap-3 py-4"><span className={`flex h-7 w-7 items-center justify-center rounded-full border ${milestone.completed ? 'border-brand-green bg-brand-green/10 text-brand-green' : 'border-border-strong text-text-muted'}`}>{milestone.completed ? <Check className="h-4 w-4" /> : <LockKeyhole className="h-3.5 w-3.5" />}</span><div><p className="text-sm font-bold text-text-primary">{milestone.title}</p><p className="mt-0.5 text-xs text-text-muted">Week {curriculum.indexes.weeksById[milestone.weekId]?.sequence} · Build {milestone.buildId}</p></div></div>)}</div>
        <p className="mt-5 text-xs text-text-muted">Milestones cannot be toggled here. Complete their referenced Build in Missions.</p>
      </section>
    </div>
  );
}
