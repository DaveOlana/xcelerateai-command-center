import React from 'react';
import { ExternalLink, Github } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { aggregateWorkspaceProof } from '../../utils/workspaceAdapters';
import { WorkspaceEmptyState, WorkspaceFilterPills, WorkspaceSearch, WorkspaceSectionHeader, formatWorkspaceDate } from '../../components/workspace/WorkspacePrimitives';

const sourceLabel = (source) => source === 'Practical Mission' ? 'Build' : source;

export default function ProofLibrary() {
  const { roadmap, weekProofs, practicalMissions, progress } = useApp();
  const [query, setQuery] = React.useState('');
  const [source, setSource] = React.useState('All');
  const [expanded, setExpanded] = React.useState(null);
  const evidence = React.useMemo(() => aggregateWorkspaceProof({ roadmap, weekProofs, practicalMissions, progress }), [roadmap, weekProofs, practicalMissions, progress]);
  const visible = evidence.filter((item) => {
    if (source !== 'All' && item.source !== source) return false;
    const needle = query.trim().toLowerCase();
    return !needle || [item.title, item.source, item.weekNumber, item.missionId, item.repository, item.commit, item.demo].some((value) => String(value || '').toLowerCase().includes(needle));
  });
  const sourceOptions = ['All', 'Weekly Proof', 'Practical Mission', 'Project'].map((value) => ({ value, label: value === 'Practical Mission' ? 'Build' : value }));

  return (
    <div className="space-y-7">
      <WorkspaceSectionHeader title="Proof" description="A read-only archive of evidence created through Missions, builds, and projects." />
      {evidence.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <WorkspaceSearch value={query} onChange={setQuery} placeholder="Search evidence..." label="Search proof" />
          <WorkspaceFilterPills options={sourceOptions} value={source} onChange={setSource} label="Filter proof by source" />
        </div>
      )}

      {visible.length === 0 ? (
        <WorkspaceEmptyState title={evidence.length ? 'No evidence matches' : 'No evidence yet'} description={evidence.length ? 'Try a different search or source.' : 'Evidence submitted through Missions and project links will appear here.'} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visible.map((item) => {
            const open = expanded === item.id;
            const links = [item.repository, item.commit, item.demo].filter(Boolean).length;
            return (
              <article key={item.id} className={`flex min-w-0 flex-col rounded-2xl border bg-bg-surface p-5 transition-colors duration-200 ${open ? 'border-border-strong' : 'border-border-default hover:border-border-strong'}`}>
                <div className="flex flex-wrap items-center gap-2 text-xs"><span className="font-bold text-brand-violet">{sourceLabel(item.source)}</span><span className={`rounded-full px-2 py-1 font-bold ${item.status === 'Complete' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-bg-soft text-text-secondary'}`}>{item.status}</span></div>
                <h3 className="mt-3 font-heading text-lg font-bold text-text-primary">{item.title}</h3>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-text-muted">{item.weekNumber && <span>Week {item.weekNumber}</span>}{formatWorkspaceDate(item.date) && <span>{formatWorkspaceDate(item.date)}</span>}{links > 0 && <span>{links} {links === 1 ? 'link' : 'links'} available</span>}</div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {item.repository && <a href={item.repository} target="_blank" rel="noopener noreferrer" className="btn-secondary flex min-h-10 items-center gap-2 px-3 py-2 text-xs"><Github className="h-4 w-4" />Repository<ExternalLink className="h-3 w-3" /></a>}
                  {item.demo && <a href={item.demo} target="_blank" rel="noopener noreferrer" className="btn-secondary flex min-h-10 items-center gap-2 px-3 py-2 text-xs">Demo<ExternalLink className="h-3 w-3" /></a>}
                  <button type="button" aria-expanded={open} onClick={() => setExpanded(open ? null : item.id)} className="btn-secondary min-h-10 px-3 py-2 text-xs">{open ? 'Hide details' : 'View details'}</button>
                </div>
                {open && (
                  <div className="mt-4 space-y-3 border-t border-border-divider pt-4 text-sm text-text-secondary">
                    {item.missionId && <p><span className="font-bold text-text-primary">Build:</span> {item.missionId}</p>}
                    {item.commit && <p><span className="font-bold text-text-primary">Commit:</span> <a href={item.commit} target="_blank" rel="noopener noreferrer" className="break-all font-mono text-brand-violet hover:underline">{item.commit}</a></p>}
                    {item.screenshot && <p><span className="font-bold text-text-primary">Screenshot note:</span> {item.screenshot}</p>}
                    {item.reflection && <p className="whitespace-pre-wrap"><span className="font-bold text-text-primary">Notes:</span> {item.reflection}</p>}
                    {item.readmeCompleted !== undefined && <p><span className="font-bold text-text-primary">README:</span> {item.readmeCompleted ? 'Confirmed' : 'Not confirmed'}</p>}
                    {item.testsPassed !== '' && <p><span className="font-bold text-text-primary">Tests:</span> {item.testsPassed === true ? 'Passed' : item.testsPassed === false ? 'Not confirmed' : String(item.testsPassed)}</p>}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
