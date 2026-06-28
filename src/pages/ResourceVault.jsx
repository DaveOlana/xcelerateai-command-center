import React, { useState, useMemo } from 'react';
import { ExternalLink, Search, Filter, BookOpen, X, CheckCircle2, Circle, FileText, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ImportRequiredCard from '../components/common/ImportRequiredCard';
import { PageShell, PageHeader, SectionCard, StatusBadge } from '../components/common/UIComponents';

const DIFFICULTY_COLORS = {
  Beginner: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  Intermediate: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  Advanced: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

const TYPE_COLORS = {
  Docs: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  Tutorial: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  Video: 'bg-red-500/10 text-red-400 border border-red-500/20',
  Tool: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
  Course: 'bg-pink-500/10 text-pink-400 border border-pink-500/20',
};

export default function ResourceVault() {
  const { roadmap, resourcesStatus, updateResourceStatus, addNote, settings } = useApp();
  
  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterWeek, setFilterWeek] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLowData, setFilterLowData] = useState(false);

  // Build flat resource list with metadata
  const allResources = useMemo(() => {
    const list = [];
    roadmap?.months?.forEach((month) => {
      month.weeks?.forEach((week) => {
        week.resources?.forEach((res) => {
          list.push({
            ...res,
            monthNumber: month.monthNumber,
            monthTitle: month.title,
            weekNumber: week.weekNumber,
            weekTitle: week.title,
          });
        });
      });
    });
    return list;
  }, [roadmap]);
  
  if (allResources.length === 0) {
    return <ImportRequiredCard pageName="Resource Vault" />;
  }

  // Unique values for filters
  const months = [...new Set(allResources.map((r) => r.monthNumber))].sort();
  const weeks = [...new Set(allResources.map((r) => r.weekNumber))].sort((a, b) => a - b);
  const types = [...new Set(allResources.map((r) => r.type).filter(Boolean))];
  const difficulties = [...new Set(allResources.map((r) => r.difficulty).filter(Boolean))];

  // Filtered resources
  const filtered = useMemo(() => {
    return allResources.filter((r) => {
      const status = resourcesStatus[r.title] || 'Not Started';
      const dataEst = r.dataEstimate || r.estimatedData || '';
      const isLowData = r.lowData === true || r.lowData === 'true' || (dataEst && dataEst.toLowerCase().includes('mb'));

      if (filterMonth && r.monthNumber !== Number(filterMonth)) return false;
      if (filterWeek && r.weekNumber !== Number(filterWeek)) return false;
      if (filterType && r.type !== filterType) return false;
      if (filterDifficulty && r.difficulty !== filterDifficulty) return false;
      if (filterStatus && status !== filterStatus) return false;
      if (filterLowData && !isLowData) return false;

      if (search) {
        const q = search.toLowerCase();
        return (
          r.title?.toLowerCase().includes(q) ||
          r.whatToExpect?.toLowerCase().includes(q) ||
          r.missionObjective?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allResources, filterMonth, filterWeek, filterType, filterDifficulty, filterStatus, filterLowData, search, resourcesStatus]);
  
  const clearFilters = () => {
    setSearch('');
    setFilterMonth('');
    setFilterWeek('');
    setFilterType('');
    setFilterDifficulty('');
    setFilterStatus('');
    setFilterLowData(false);
  };

  const handleOpenAndTakeNote = (res) => {
    window.open(res.url, '_blank');
    addNote({
      title: `Study Log: ${res.title}`,
      type: 'Resource Summary',
      linkedItem: `Week ${res.weekNumber}`,
      content: `I opened the resource: ${res.title}. Notes: `,
      whatILearned: res.missionObjective || '',
      whatConfusedMe: '',
    });
    alert('Resource link opened in new tab. A pre-filled Note card has been created in your Notes Journal.');
  };

  const hasFilters = search || filterMonth || filterWeek || filterType || filterDifficulty || filterStatus || filterLowData;

  return (
    <PageShell>
      <PageHeader 
        title="Resource Vault" 
        subtitle={`${allResources.length} curated study assets and tutorial links from the active roadmap.`}
      />

      {/* Search + Filters Card */}
      <SectionCard>
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search titles, descriptions, objectives..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base w-full pl-10 text-xs font-medium"
            />
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <select
              value={filterMonth}
              onChange={(e) => { setFilterMonth(e.target.value); setFilterWeek(''); }}
              className="input-base text-xs"
            >
              <option value="">All Months</option>
              {months.map((m) => (
                <option key={m} value={m}>Month {m}</option>
              ))}
            </select>

            <select
              value={filterWeek}
              onChange={(e) => setFilterWeek(e.target.value)}
              className="input-base text-xs"
            >
              <option value="">All Weeks</option>
              {weeks
                .filter((w) => !filterMonth || allResources.find((r) => r.weekNumber === w && r.monthNumber === Number(filterMonth)))
                .map((w) => (
                  <option key={w} value={w}>Week {w}</option>
                ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-base text-xs"
            >
              <option value="">All Types</option>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>

            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="input-base text-xs"
            >
              <option value="">All Difficulties</option>
              {difficulties.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-base text-xs col-span-2 lg:col-span-1"
            >
              <option value="">All Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="Studying">Studying</option>
              <option value="Studied">Studied</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-navy-500/20">
            {/* Low Data Toggle */}
            <button
              onClick={() => setFilterLowData(!filterLowData)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-[13px] uppercase font-bold tracking-wider transition-all duration-200 active:scale-95 ${
                filterLowData
                  ? 'bg-accent-primary/10 border-accent-primary/30 text-accent-primary'
                  : 'bg-navy-700/60 border-navy-500/80 text-slate-400'
              }`}
            >
              Low Data Assets Only
            </button>

            <div className="flex items-center gap-3">
              <p className="text-[13px] text-slate-500">
                Found <span className="text-white font-bold">{filtered.length}</span> / {allResources.length} items
              </p>
              {hasFilters && (
                <button 
                  onClick={clearFilters} 
                  className="flex items-center gap-1 text-[13px] uppercase font-bold text-slate-400 hover:text-accent-primary transition-colors"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Resource Grid */}
      {filtered.length === 0 ? (
        <div className="bg-navy-800/40 border border-dashed border-navy-500/30 text-center py-16 px-6 rounded-2xl max-w-md mx-auto">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">No matching assets</h4>
          <p className="text-[14px] text-slate-500 mt-1">Try broadening your coordinates or resetting filters.</p>
          <button 
            onClick={clearFilters} 
            className="mt-4 bg-navy-700/60 border border-navy-500 text-slate-300 font-bold px-4 py-2 rounded-xl hover:text-white transition-all text-xs uppercase tracking-wider active:scale-95"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((res, i) => {
            const status = resourcesStatus[res.title] || 'Not Started';
            return (
              <div
                key={i}
                className="bg-navy-800/80 border border-navy-550/40 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-300 hover:border-accent-primary/20 hover:shadow-card-hover group"
              >
                <div>
                  {/* Top meta badges */}
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${TYPE_COLORS[res.type] || 'bg-navy-700 text-slate-400 border-navy-500/50'}`}>
                      {res.type}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${DIFFICULTY_COLORS[res.difficulty] || 'bg-navy-700 text-slate-400 border-navy-500/50'}`}>
                      {res.difficulty}
                    </span>
                    {(res.timeEstimate || res.estimatedTime) && (
                      <span className="text-xs text-slate-500 font-mono">⏱ {res.timeEstimate || res.estimatedTime}</span>
                    )}
                    {(res.dataEstimate || res.estimatedData) && (
                      <span className="text-xs text-accent-cyan font-mono">💾 {res.dataEstimate || res.estimatedData}</span>
                    )}
                    <span className="text-xs text-slate-500 ml-auto font-mono font-bold">
                      W{res.weekNumber}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-white text-sm mb-1 group-hover:text-accent-primary transition-colors">
                    {res.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-2">{res.weekTitle}</p>

                  {/* Expectation info */}
                  {res.whatToExpect && (
                    <p className="text-[14px] text-slate-400 line-clamp-2 leading-relaxed mb-3">{res.whatToExpect}</p>
                  )}

                  {/* Mission objective */}
                  {res.missionObjective && (
                    <p className="text-[14px] text-accent-primary/80 flex items-center gap-1.5 bg-accent-primary/5 border border-accent-primary/10 rounded-lg p-2 font-medium">
                      <span></span>
                      <span>{res.missionObjective}</span>
                    </p>
                  )}
                </div>

                {/* Bottom button controls */}
                <div className="border-t border-navy-500/20 pt-3 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateResourceStatus(res.title, status === 'Studied' ? 'Not Started' : 'Studied')}
                      className={`flex-1 py-1.5 px-3 rounded-xl border text-[13px] uppercase font-bold tracking-wider text-center transition-all active:scale-95 duration-150 ${
                        status === 'Studied'
                          ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                          : 'bg-navy-700/60 border-navy-500/80 text-slate-400 hover:text-white'
                      }`}
                    >
                      {status === 'Studied' ? (
                        <span className="flex items-center justify-center gap-1">
                          <Check className="w-3.5 h-3.5 text-blue-400" /> Studied
                        </span>
                      ) : (
                        'Mark Studied'
                      )}
                    </button>
                    
                    {status !== 'Studied' && (
                      <button
                        onClick={() => updateResourceStatus(res.title, 'Studying')}
                        className={`py-1.5 px-3 rounded-xl border text-[13px] uppercase font-bold tracking-wider text-center transition-all active:scale-95 duration-150 ${
                          status === 'Studying'
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : 'bg-navy-700/60 border-navy-500/80 text-slate-400 hover:text-white'
                        }`}
                      >
                        {status === 'Studying' ? 'Studying...' : 'Mark Studying'}
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-navy-700/60 border border-navy-500 text-slate-300 hover:text-white py-1.5 px-3 text-[13px] uppercase font-bold tracking-wider flex-1 text-center flex items-center justify-center gap-1.5 rounded-xl hover:border-accent-primary/20 transition-all active:scale-95"
                    >
                      Open URL <ExternalLink className="w-3 h-3" />
                    </a>
                    
                    <button
                      onClick={() => handleOpenAndTakeNote(res)}
                      className="bg-accent-cyan/5 border border-accent-cyan/25 text-accent-cyan hover:bg-accent-cyan/15 py-1.5 px-3 text-[13px] uppercase font-bold tracking-wider flex-1 flex items-center justify-center gap-1.5 rounded-xl transition-all active:scale-95"
                    >
                      <FileText className="w-3 h-3" /> Take Note
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
