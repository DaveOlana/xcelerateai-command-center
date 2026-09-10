import React from 'react';
import { CheckCircle2, ExternalLink, FileText, Github, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageHeader, PageShell } from '../components/common/UIComponents';
import { aggregateWorkspaceProof } from '../utils/workspaceAdapters';

const SOURCE_OPTIONS = ['All', 'Weekly Proof', 'Practical Mission', 'Project'];

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ProofOfWork() {
  const { roadmap, weekProofs, practicalMissions, progress } = useApp();
  const [query, setQuery] = React.useState('');
  const [source, setSource] = React.useState('All');
  const evidence = React.useMemo(
    () => aggregateWorkspaceProof({ roadmap, weekProofs, practicalMissions, progress }),
    [roadmap, weekProofs, practicalMissions, progress]
  );
  const filteredEvidence = React.useMemo(() => {
    const search = query.trim().toLowerCase();
    return evidence.filter((item) => {
      if (source !== 'All' && item.source !== source) return false;
      if (!search) return true;
      return [item.title, item.source, item.weekNumber, item.missionId]
        .some((value) => String(value || '').toLowerCase().includes(search));
    });
  }, [evidence, query, source]);

  return (
    <PageShell>
      <PageHeader
        title="Proof"
        subtitle="Review evidence submitted through Missions, practical missions, and projects."
      />

      <div className="card flex flex-col md:flex-row gap-3 md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search proof by title, week, or mission" className="input-base w-full pl-10 text-sm" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0" aria-label="Proof source filter">
          {SOURCE_OPTIONS.map((option) => (
            <button key={option} onClick={() => setSource(option)} className={`px-3 py-2 rounded-lg border whitespace-nowrap text-xs font-semibold ${source === option ? 'border-accent-primary bg-accent-primary/10 text-accent-primary' : 'border-navy-600 text-slate-400 hover:text-white'}`}>
              {option}
            </button>
          ))}
        </div>
      </div>

      {filteredEvidence.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="w-9 h-9 text-slate-600 mx-auto" />
          <h2 className="text-sm font-bold text-white mt-3">{evidence.length === 0 ? 'No proof yet' : 'No proof matches these filters'}</h2>
          <p className="text-xs text-slate-500 mt-1">{evidence.length === 0 ? 'Your completed builds and evidence will appear here.' : 'Try a different search or source.'}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredEvidence.map((item) => (
            <article key={item.id} className="card flex flex-col gap-4 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge-slate text-xs">{item.source}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${item.status === 'Complete' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{item.status}</span>
                  </div>
                  <h2 className="text-sm font-bold text-white mt-2 break-words">{item.title}</h2>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs text-slate-500">
                    {item.weekNumber && <span>Week {item.weekNumber}</span>}
                    {item.missionId && <span>Mission {item.missionId}</span>}
                    {formatDate(item.date) && <span>{formatDate(item.date)}</span>}
                  </div>
                </div>
                {item.status === 'Complete' && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
              </div>

              {(item.readmeCompleted !== undefined || item.testsPassed !== '') && (
                <div className="flex flex-wrap gap-2 text-xs">
                  {item.readmeCompleted !== undefined && <span className="badge-slate">README: {item.readmeCompleted ? 'Complete' : 'Not confirmed'}</span>}
                  {item.testsPassed !== '' && <span className="badge-slate">Tests: {item.testsPassed === true ? 'Passed' : item.testsPassed === false ? 'Not confirmed' : String(item.testsPassed)}</span>}
                </div>
              )}

              {item.screenshot && <p className="text-xs text-slate-400 break-words"><span className="font-semibold text-slate-300">Screenshot:</span> {item.screenshot}</p>}
              {item.reflection && <p className="text-xs text-slate-400 whitespace-pre-wrap break-words"><span className="font-semibold text-slate-300">Notes:</span> {item.reflection}</p>}

              <div className="mt-auto flex flex-wrap gap-2 pt-3 border-t border-navy-700/30">
                {item.repository && <a href={item.repository} target="_blank" rel="noopener noreferrer" className="btn-secondary py-2 px-3 text-xs font-semibold inline-flex items-center gap-1.5 max-w-full"><Github className="w-3.5 h-3.5" /> Repository <ExternalLink className="w-3 h-3" /></a>}
                {item.commit && <a href={item.commit} target="_blank" rel="noopener noreferrer" className="btn-secondary py-2 px-3 text-xs font-semibold inline-flex items-center gap-1.5 max-w-full"><FileText className="w-3.5 h-3.5" /> Commit <ExternalLink className="w-3 h-3" /></a>}
                {item.demo && <a href={item.demo} target="_blank" rel="noopener noreferrer" className="btn-secondary py-2 px-3 text-xs font-semibold inline-flex items-center gap-1.5 max-w-full">Demo <ExternalLink className="w-3 h-3" /></a>}
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}
