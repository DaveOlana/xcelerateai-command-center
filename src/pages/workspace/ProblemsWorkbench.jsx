import React from 'react';
import { Check, ChevronDown, ChevronUp, Copy, Plus, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { normalizeWorkspaceProblem } from '../../utils/workspaceAdapters';
import { writeTemplateToClipboard } from '../../utils/templateUtils.js';
import { WorkspaceEmptyState, WorkspaceFilterPills, WorkspaceSearch, WorkspaceSectionHeader, formatWorkspaceDate } from '../../components/workspace/WorkspacePrimitives';

export default function ProblemsWorkbench() {
  const { blockers, addBlocker, solveBlocker, deleteBlocker, roadmap, settings } = useApp();
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState('All');
  const [expanded, setExpanded] = React.useState(null);
  const [showForm, setShowForm] = React.useState(false);
  const [solution, setSolution] = React.useState({ id: null, value: '' });
  const [copyState, setCopyState] = React.useState('');
  const [form, setForm] = React.useState({ title: '', weekNumber: settings.activeWeek || 1, missionTitle: '', skillArea: '', whatTryingToDo: '', whatWentWrong: '', errorMessage: '', whatAlreadyTried: '' });
  const mentorName = settings?.mentorName || roadmap?.mentorLabel || 'Mentor';
  const problems = React.useMemo(() => (blockers || []).map(normalizeWorkspaceProblem), [blockers]);
  const openCount = problems.filter((problem) => problem.workspaceStatus === 'Open').length;
  const resolvedCount = problems.length - openCount;
  const visible = problems.filter((problem) => {
    if (filter !== 'All' && problem.workspaceStatus !== filter) return false;
    const needle = query.trim().toLowerCase();
    return !needle || [problem.title, problem.whatWentWrong, problem.whatAlreadyTried, problem.solutionNotes, problem.errorMessage, problem.missionTitle].some((value) => String(value || '').toLowerCase().includes(needle));
  });

  const create = (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    addBlocker({ ...form, weekNumber: Number(form.weekNumber) || settings.activeWeek });
    setForm({ title: '', weekNumber: settings.activeWeek || 1, missionTitle: '', skillArea: '', whatTryingToDo: '', whatWentWrong: '', errorMessage: '', whatAlreadyTried: '' });
    setShowForm(false);
  };
  const resolve = (event) => {
    event.preventDefault();
    if (!solution.value.trim()) return;
    solveBlocker(solution.id, solution.value.trim());
    setSolution({ id: null, value: '' });
  };
  const copyMentorPrompt = async (problem) => {
    const prompt = `I am on Week ${problem.weekNumber || '[week]'}${problem.missionTitle ? `, working on "${problem.missionTitle}"` : ''} in ${roadmap?.title || 'my course'}.\n\nI am trying to: ${problem.whatTryingToDo || problem.title}.\nWhat went wrong: ${problem.whatWentWrong || problem.errorMessage || 'I am stuck.'}\nWhat I tried: ${problem.whatAlreadyTried || 'I have reviewed the relevant material.'}\n\nPlease help me debug this without giving me the complete answer immediately.`;
    const result = await writeTemplateToClipboard(prompt);
    setCopyState(result.ok ? problem.id : `failed-${problem.id}`);
  };

  return (
    <div className="space-y-7">
      <WorkspaceSectionHeader title="Problems" description="Keep track of where you got stuck, what you tried, and what eventually worked." action={<button type="button" onClick={() => setShowForm((open) => !open)} className="btn-primary flex min-h-11 items-center gap-2 px-4 py-2 text-sm">{showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{showForm ? 'Cancel' : 'Add problem'}</button>} />

      {showForm && (
        <form onSubmit={create} className="rounded-2xl border border-brand-violet/25 bg-bg-surface p-5 shadow-primary-glow-sm sm:p-6">
          <h3 className="font-heading text-lg font-bold text-text-primary">Where are you stuck?</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold text-text-primary sm:col-span-2">Problem<input required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="input-base mt-2 w-full text-sm" placeholder="Describe the issue briefly" /></label>
            <label className="text-sm font-bold text-text-primary">Week<input type="number" min="1" value={form.weekNumber} onChange={(event) => setForm((current) => ({ ...current, weekNumber: event.target.value }))} className="input-base mt-2 w-full text-sm" /></label>
            <label className="text-sm font-bold text-text-primary">Mission or context<input value={form.missionTitle} onChange={(event) => setForm((current) => ({ ...current, missionTitle: event.target.value }))} className="input-base mt-2 w-full text-sm" /></label>
            <label className="text-sm font-bold text-text-primary sm:col-span-2">What were you trying to do?<textarea rows={2} value={form.whatTryingToDo} onChange={(event) => setForm((current) => ({ ...current, whatTryingToDo: event.target.value }))} className="input-base mt-2 w-full resize-y text-sm" /></label>
            <label className="text-sm font-bold text-text-primary sm:col-span-2">What went wrong?<textarea rows={3} value={form.whatWentWrong} onChange={(event) => setForm((current) => ({ ...current, whatWentWrong: event.target.value }))} className="input-base mt-2 w-full resize-y text-sm" /></label>
            <label className="text-sm font-bold text-text-primary">Technical detail<textarea rows={3} value={form.errorMessage} onChange={(event) => setForm((current) => ({ ...current, errorMessage: event.target.value }))} className="input-base mt-2 w-full resize-y font-mono text-xs" /></label>
            <label className="text-sm font-bold text-text-primary">What I tried<textarea rows={3} value={form.whatAlreadyTried} onChange={(event) => setForm((current) => ({ ...current, whatAlreadyTried: event.target.value }))} className="input-base mt-2 w-full resize-y text-sm" /></label>
          </div>
          <button className="btn-primary mt-4 px-4 py-2.5 text-sm">Save problem</button>
        </form>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <WorkspaceSearch value={query} onChange={setQuery} placeholder="Search problems and solutions..." label="Search problems" />
        <WorkspaceFilterPills options={[{ value: 'All', label: 'All', count: problems.length }, { value: 'Open', label: 'Open', count: openCount }, { value: 'Resolved', label: 'Resolved', count: resolvedCount }]} value={filter} onChange={setFilter} label="Filter problems" />
      </div>

      {visible.length === 0 ? (
        <WorkspaceEmptyState title={problems.length ? 'No problems match' : 'No problems recorded'} description={problems.length ? 'Try a different search or status.' : 'Items you create through “I’m stuck” or Add problem will appear here.'} />
      ) : (
        <div className="space-y-3">
          {visible.map((problem) => {
            const open = expanded === problem.id;
            const resolved = problem.workspaceStatus === 'Resolved';
            return (
              <article key={problem.id} className={`rounded-2xl border bg-bg-surface p-5 transition-colors duration-200 ${open ? 'border-border-strong' : 'border-border-default hover:border-border-strong'}`}>
                <div className="flex items-start gap-4">
                  <button type="button" onClick={() => setExpanded(open ? null : problem.id)} aria-expanded={open} className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet">
                    <div className="flex flex-wrap items-center gap-2 text-xs"><span className={`rounded-full px-2 py-1 font-bold ${resolved ? 'bg-emerald-500/10 text-emerald-500' : 'bg-brand-amber/10 text-brand-amber'}`}>{problem.workspaceStatus}</span>{problem.weekNumber && <span className="text-text-muted">Week {problem.weekNumber}</span>}{formatWorkspaceDate(problem.dateCreated) && <span className="text-text-muted">{formatWorkspaceDate(problem.dateCreated)}</span>}</div>
                    <h3 className="mt-2 font-heading text-lg font-bold text-text-primary">{problem.title}</h3>
                    {!open && <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{problem.whatWentWrong || problem.errorMessage || 'Open to review the details.'}</p>}
                  </button>
                  <button type="button" onClick={() => setExpanded(open ? null : problem.id)} aria-label={`${open ? 'Collapse' : 'Open'} ${problem.title}`} className="rounded-lg p-2 text-text-muted hover:bg-bg-soft focus-visible:ring-2 focus-visible:ring-brand-violet">{open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button>
                </div>
                {open && (
                  <div className="mt-4 rounded-2xl bg-bg-soft p-5 text-sm text-text-secondary">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {problem.whatTryingToDo && <p><span className="font-bold text-text-primary">What I was trying to do:</span><br />{problem.whatTryingToDo}</p>}
                      {problem.whatAlreadyTried && <p><span className="font-bold text-text-primary">What I tried:</span><br />{problem.whatAlreadyTried}</p>}
                      {problem.errorMessage && <pre className="overflow-auto whitespace-pre-wrap rounded-xl border border-border-default bg-bg-surface p-3 font-mono text-xs text-text-primary sm:col-span-2">{problem.errorMessage}</pre>}
                      {problem.solutionNotes && <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 sm:col-span-2"><span className="font-bold text-text-primary">Solution:</span><br />{problem.solutionNotes}</p>}
                    </div>
                    {solution.id === problem.id ? (
                      <form onSubmit={resolve} className="mt-4 border-t border-border-divider pt-4"><label className="font-bold text-text-primary">What solved it?<textarea autoFocus rows={3} value={solution.value} onChange={(event) => setSolution({ id: problem.id, value: event.target.value })} className="input-base mt-2 w-full resize-y text-sm" /></label><div className="mt-3 flex gap-2"><button className="btn-primary px-4 py-2 text-xs">Save solution</button><button type="button" onClick={() => setSolution({ id: null, value: '' })} className="btn-secondary px-4 py-2 text-xs">Cancel</button></div></form>
                    ) : (
                      <div className="mt-5 flex flex-wrap gap-2 border-t border-border-divider pt-4">{!resolved && <button type="button" onClick={() => setSolution({ id: problem.id, value: '' })} className="btn-primary flex items-center gap-2 px-3 py-2 text-xs"><Check className="h-3.5 w-3.5" />Resolve</button>}<button type="button" onClick={() => copyMentorPrompt(problem)} className="btn-secondary flex items-center gap-2 px-3 py-2 text-xs"><Copy className="h-3.5 w-3.5" />{copyState === problem.id ? 'Prompt copied' : 'Ask mentor prompt'}</button><button type="button" onClick={() => { if (window.confirm(`Delete “${problem.title}”? This cannot be undone.`)) deleteBlocker(problem.id); }} className="btn-secondary flex items-center gap-2 px-3 py-2 text-xs text-red-500"><Trash2 className="h-3.5 w-3.5" />Delete</button>{copyState === `failed-${problem.id}` && <span className="w-full text-xs text-brand-amber" role="status">Copy failed. Select the problem details above and copy them manually.</span>}</div>
                    )}
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
