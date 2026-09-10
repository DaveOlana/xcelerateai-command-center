import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AlertCircle, CheckCircle2, Trash2, Copy, Plus, X, Search, HelpCircle, Check } from 'lucide-react';
import { PageShell, PageHeader, SectionCard, StatCard } from '../components/common/UIComponents';
import { normalizeWorkspaceProblem } from '../utils/workspaceAdapters';

export default function Blockers() {
  const { blockers, addBlocker, solveBlocker, deleteBlocker, roadmap, settings } = useApp();
  const mentorName = settings?.mentorName || roadmap?.mentorLabel || 'Mentor';
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activePromptBlocker, setActivePromptBlocker] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [relatedWeek, setRelatedWeek] = useState(settings.activeWeek.toString());
  const [relatedMission, setRelatedMission] = useState('');
  const [skillArea, setSkillArea] = useState('');
  const [whatTryingToDo, setWhatTryingToDo] = useState('');
  const [whatWentWrong, setWhatWentWrong] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [whatAlreadyTried, setWhatAlreadyTried] = useState('');
  const [screenshotNote, setScreenshotNote] = useState('');

  // Solve states
  const [solvingBlockerId, setSolvingBlockerId] = useState(null);
  const [solutionNotes, setSolutionNotes] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!title) return;
    addBlocker({
      title,
      weekNumber: Number(relatedWeek),
      missionTitle: relatedMission,
      skillArea,
      whatTryingToDo,
      whatWentWrong,
      errorMessage,
      whatAlreadyTried,
      screenshotCodeNote: screenshotNote,
    });
    // Reset form
    setTitle('');
    setRelatedMission('');
    setSkillArea('');
    setWhatTryingToDo('');
    setWhatWentWrong('');
    setErrorMessage('');
    setWhatAlreadyTried('');
    setScreenshotNote('');
    setShowAddModal(false);
  };

  const handleSolveSubmit = (e) => {
    e.preventDefault();
    if (!solutionNotes) return;
    solveBlocker(solvingBlockerId, solutionNotes);
    setSolvingBlockerId(null);
    setSolutionNotes('');
  };

  // Ask Mentor Helper Generator
  const generateMentorPrompt = (b) => {
    return `I am on Week ${b.weekNumber}${b.missionTitle ? `, Mission "${b.missionTitle}"` : ''} of the ${roadmap?.title || 'bootcamp'}.
I am trying to build: ${b.whatTryingToDo || b.title}.
The skill focus is: ${b.skillArea || 'General Development'}.
What went wrong: ${b.whatWentWrong || 'I am stuck.'}
The error I got is: ${b.errorMessage || 'None/No error trace.'}
I have tried: ${b.whatAlreadyTried || 'Reviewing resources.'}
Please help me debug this without giving me the full answer immediately.`;
  };

  const [copiedBlocker, setCopiedBlocker] = useState(false);
  const normalizedProblems = React.useMemo(
    () => (Array.isArray(blockers) ? blockers : []).map(normalizeWorkspaceProblem),
    [blockers]
  );

  const copyPromptToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedBlocker(true);
    setTimeout(() => setCopiedBlocker(false), 3000);
  };

  const filteredBlockers = normalizedProblems.filter((b) => {
    const query = String(searchQuery || '').toLowerCase();
    const matchesSearch = [b.title, b.errorMessage, b.whatWentWrong, b.whatAlreadyTried, b.solutionNotes, b.missionTitle, b.resourceTitle, b.stage]
      .some((value) => String(value || '').toLowerCase().includes(query));
    const matchesStatus = !statusFilter || b.workspaceStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <PageShell>
      {/* Header */}
      <PageHeader
        title="Problems"
        subtitle="Review where you struggled, what you tried, and how you resolved it."
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-accent-primary text-navy-900 font-bold px-5 py-2.5 rounded-xl hover:bg-accent-primary-dim active:scale-95 transition-all duration-200 shadow-primary-glow flex items-center gap-1.5 text-xs uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" /> Add Problem
          </button>
        }
      />

      {/* Stats and Search deck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Open Problems"
          value={normalizedProblems.filter(b => b.workspaceStatus === 'Open').length}
          icon={AlertCircle} 
          helperText="Problems still needing attention"
          accentColor="red"
        />
        <StatCard 
          label="Resolved Problems"
          value={normalizedProblems.filter(b => b.workspaceStatus === 'Resolved').length}
          icon={CheckCircle2} 
          helperText="Problems with a recorded resolution"
          accentColor="blue"
        />
        <SectionCard className="flex items-center justify-center">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base w-full pl-10 text-xs font-medium"
            />
          </div>
        </SectionCard>
      </div>

      {/* Filter Row */}
      <div className="flex gap-2.5 flex-wrap">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-4 py-1.5 rounded-xl text-[13px] uppercase font-bold tracking-wider border transition-all duration-200 active:scale-95 ${
            !statusFilter
              ? 'bg-accent-primary/10 text-accent-primary border-accent-primary/30 shadow-primary-glow-sm'
              : 'bg-navy-700/60 border-navy-500/80 text-slate-400 hover:text-white'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter('Open')}
          className={`px-4 py-1.5 rounded-xl text-[13px] uppercase font-bold tracking-wider border transition-all duration-200 active:scale-95 ${
            statusFilter === 'Open'
              ? 'bg-red-500/10 text-red-400 border-red-500/30'
              : 'bg-navy-700/60 border-navy-500/80 text-slate-400 hover:text-white'
          }`}
        >
          Open
        </button>
        <button
          onClick={() => setStatusFilter('Resolved')}
          className={`px-4 py-1.5 rounded-xl text-[13px] uppercase font-bold tracking-wider border transition-all duration-200 active:scale-95 ${
            statusFilter === 'Resolved'
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
              : 'bg-navy-700/60 border-navy-500/80 text-slate-400 hover:text-white'
          }`}
        >
          Resolved
        </button>
      </div>

      {/* List */}
      {filteredBlockers.length === 0 ? (
        <div className="bg-navy-800/40 border border-dashed border-navy-500/30 text-center py-16 px-6 rounded-2xl max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-white">{statusFilter === 'Open' ? 'No open problems.' : 'No problems found.'}</h4>
          <p className="text-[14px] text-slate-500 mt-1 leading-relaxed">
            {normalizedProblems.length === 0 ? 'Problems created while learning will appear here.' : 'Try a different search or filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBlockers.map((b) => (
            <div
              key={b.id}
              className={`bg-navy-800/80 border border-navy-550/40 border-l-4 rounded-2xl p-5 backdrop-blur-sm transition-all duration-300 ${
                b.workspaceStatus === 'Resolved'
                  ? 'border-l-blue-500 border-blue-500/10 hover:border-blue-500/20'
                  : 'border-l-red-500 border-red-500/15 hover:border-red-500/25'
              }`}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    {b.weekNumber && <span className="text-xs text-slate-500 font-semibold">Week {b.weekNumber}</span>}
                    {b.stage && <span className="badge-slate text-xs">Stage: {b.stage}</span>}
                    {b.missionTitle && <span className="badge-slate text-xs">Mission: {b.missionTitle}</span>}
                    {b.resourceTitle && <span className="badge-slate text-xs">Resource: {b.resourceTitle}</span>}
                    {b.projectTitle && <span className="badge-slate text-xs">Project: {b.projectTitle}</span>}
                    {b.dateCreated && <span className="text-xs text-slate-500">{new Date(b.dateCreated).toLocaleDateString()}</span>}
                    <span
                      className={`text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        b.workspaceStatus === 'Resolved'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}
                    >
                      {b.workspaceStatus}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white leading-snug">{b.title}</h3>
                  {b.errorMessage && (
                    <pre className="bg-navy-950 text-red-400 border border-red-900/30 font-mono text-[13px] rounded-xl p-3 mt-2.5 overflow-x-auto max-w-full leading-relaxed">
                      <code>{b.errorMessage}</code>
                    </pre>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {b.workspaceStatus !== 'Resolved' && (
                    <button
                      onClick={() => setSolvingBlockerId(b.id)}
                      className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[13px] font-bold uppercase tracking-wider py-1.5 px-3 rounded-xl hover:bg-blue-500/20 transition-all active:scale-95"
                    >
                      Resolve
                    </button>
                  )}
                  <button
                    onClick={() => setActivePromptBlocker(b)}
                    className="bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-[13px] font-bold uppercase tracking-wider py-1.5 px-3 rounded-xl hover:bg-accent-primary/20 transition-all active:scale-95 flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" /> Ask {mentorName}
                  </button>
                  <button
                    onClick={() => deleteBlocker(b.id)}
                    className="p-2 text-slate-500 hover:text-red-400 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Problem context */}
              <div className="mt-4 grid md:grid-cols-2 gap-4 text-[14px] text-slate-400 border-t border-navy-500/20 pt-3.5">
                {b.whatTryingToDo && (
                  <div>
                    <span className="font-bold text-slate-500 uppercase text-xs tracking-wider block mb-0.5">What I was doing</span>
                    <p className="text-slate-300">{b.whatTryingToDo}</p>
                  </div>
                )}
                {b.whatWentWrong && b.whatWentWrong !== b.title && (
                  <div>
                    <span className="font-bold text-slate-500 uppercase text-xs tracking-wider block mb-0.5">What went wrong</span>
                    <p className="text-slate-300 whitespace-pre-wrap break-words">{b.whatWentWrong}</p>
                  </div>
                )}
                {b.whatAlreadyTried && (
                  <div>
                    <span className="font-bold text-slate-500 uppercase text-xs tracking-wider block mb-0.5">What I tried</span>
                    <p className="text-slate-300">{b.whatAlreadyTried}</p>
                  </div>
                )}
              </div>

              {b.workspaceStatus === 'Resolved' && b.solutionNotes && (
                <div className="bg-blue-950/20 border border-blue-500/10 rounded-xl p-3.5 mt-3.5">
                  <span className="text-[13px] font-bold text-blue-400 mb-1 uppercase tracking-wider flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> What fixed it
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">{b.solutionNotes}</p>
                  {b.dateResolved && <p className="text-xs text-slate-500 mt-2">Resolved: {new Date(b.dateResolved).toLocaleString()}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Solver Modal */}
      {solvingBlockerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <div className="surface-card w-full max-w-md p-6 animate-scale-in text-left">
            <div className="flex items-center justify-between mb-4 border-b border-navy-500/40 pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Record Resolution</h2>
              <button onClick={() => setSolvingBlockerId(null)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSolveSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-1">What was the solution? *</label>
                  <textarea
                    rows={4}
                    value={solutionNotes}
                    onChange={(e) => setSolutionNotes(e.target.value)}
                    placeholder="Describe how you fixed this error so you can reference it later."
                    className="input-base w-full text-xs resize-none"
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end pt-3 border-t border-navy-500/40">
                  <button
                    type="button"
                    onClick={() => setSolvingBlockerId(null)}
                    className="bg-navy-700/60 border border-navy-500/80 text-slate-300 font-bold px-4 py-2 rounded-xl hover:text-white transition-all text-xs uppercase tracking-wider active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!solutionNotes}
                    className="bg-accent-primary text-navy-900 font-bold px-4 py-2 rounded-xl hover:bg-accent-primary-dim active:scale-95 transition-all text-xs uppercase tracking-wider shadow-primary-glow disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Save Resolution
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ask Mentor Modal */}
      {activePromptBlocker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <div className="surface-card w-full max-w-2xl p-6 animate-scale-in text-left">
            <div className="flex items-center justify-between mb-4 border-b border-navy-500/40 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Ask {mentorName} Help Prompt</h2>
                <p className="text-[13px] text-slate-500 mt-0.5">Copy this request structure to ask your mentor for help.</p>
              </div>
              <button onClick={() => setActivePromptBlocker(null)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-navy-950 rounded-xl p-4 border border-navy-500/30 max-h-[300px] overflow-y-auto">
                <p className="text-[14px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {generateMentorPrompt(activePromptBlocker)}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-navy-500/40">
                <button
                  type="button"
                  onClick={() => setActivePromptBlocker(null)}
                  className="bg-navy-700/60 border border-navy-500/80 text-slate-300 font-bold px-4 py-2 rounded-xl hover:text-white transition-all text-xs uppercase tracking-wider active:scale-95"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => copyPromptToClipboard(generateMentorPrompt(activePromptBlocker))}
                  className="bg-accent-primary text-navy-900 font-bold px-4 py-2 rounded-xl hover:bg-accent-primary-dim active:scale-95 transition-all text-xs uppercase tracking-wider shadow-primary-glow flex items-center gap-1.5"
                >
                  <Copy className="w-4 h-4" /> {copiedBlocker ? 'Copied!' : 'Copy Prompt'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Problem Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <div className="surface-card w-full max-w-lg p-6 animate-scale-in my-8 max-h-[90vh] overflow-y-auto text-left">
            <div className="flex items-center justify-between mb-4 border-b border-navy-500/40 pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Add Problem</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-1">Problem Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TypeError: Cannot read properties of undefined"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-base w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-1">Related Week</label>
                  <select
                    value={relatedWeek}
                    onChange={(e) => setRelatedWeek(e.target.value)}
                    className="input-base w-full text-xs"
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i + 1}>Week {i + 1}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-1">Skill Area (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. DOM Selection, CSS"
                    value={skillArea}
                    onChange={(e) => setSkillArea(e.target.value)}
                    className="input-base w-full text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mission/Session Title (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Bootcamp Status Board v1"
                  value={relatedMission}
                  onChange={(e) => setRelatedMission(e.target.value)}
                  className="input-base w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-1">What were you trying to do?</label>
                <input
                  type="text"
                  placeholder="e.g. Click the complete button to toggle item state"
                  value={whatTryingToDo}
                  onChange={(e) => setWhatTryingToDo(e.target.value)}
                  className="input-base w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-1">What went wrong?</label>
                <textarea
                  rows={2}
                  placeholder="Explain exactly what behaved incorrectly."
                  value={whatWentWrong}
                  onChange={(e) => setWhatWentWrong(e.target.value)}
                  className="input-base w-full text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-1">Error message or technical detail</label>
                <textarea
                  rows={3}
                  placeholder="Paste an error message or relevant code snippet here..."
                  value={errorMessage}
                  onChange={(e) => setErrorMessage(e.target.value)}
                  className="input-base w-full text-[13px] font-mono resize-none text-red-300"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-1">What have you tried already?</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Console.log the variable, checked MDN variables page"
                  value={whatAlreadyTried}
                  onChange={(e) => setWhatAlreadyTried(e.target.value)}
                  className="input-base w-full text-xs resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-navy-500/40">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-navy-700/60 border border-navy-500/80 text-slate-300 font-bold px-4 py-2 rounded-xl hover:text-white transition-all text-xs uppercase tracking-wider active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-accent-primary text-navy-900 font-bold px-4 py-2 rounded-xl hover:bg-accent-primary-dim active:scale-95 transition-all text-xs uppercase tracking-wider shadow-primary-glow"
                >
                  Create Problem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
}
