import React from 'react';
import { Calendar, ChevronDown, ChevronUp, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { normalizeWorkspaceNote } from '../../utils/workspaceAdapters';
import { WorkspaceEmptyState, WorkspaceFilterPills, WorkspaceSearch, WorkspaceSectionHeader, formatWorkspaceDate } from '../../components/workspace/WorkspacePrimitives';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'insights', label: 'Insights' },
  { value: 'projects', label: 'Projects' },
  { value: 'reflections', label: 'Reflections' },
];

const TYPE_LABELS = {
  study_insight: 'Study insight', resource_summary: 'Resource note', project_note: 'Project note',
  daily_reflection: 'Reflection', bug_note: 'Problem note', concept_note: 'Concept note',
  question_for_mentor: 'Mentor question', session_note: 'Learning note',
};

function matchesFilter(note, filter) {
  if (filter === 'all') return true;
  if (filter === 'insights') return note.noteType === 'study_insight' || note.noteType === 'concept_note';
  if (filter === 'projects') return note.noteType === 'project_note' || note.linkedProject !== '';
  if (filter === 'reflections') return String(note.noteType).includes('reflection');
  return true;
}

export default function NotesWorkbench() {
  const { notes, addNote, updateNote, deleteNote } = useApp();
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const [expanded, setExpanded] = React.useState(null);
  const [showForm, setShowForm] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({ title: '', noteType: 'session_note', whatLearned: '', linkedWeek: '' });
  const normalized = React.useMemo(() => (notes || []).map(normalizeWorkspaceNote), [notes]);
  const visible = React.useMemo(() => normalized.filter((note) => {
    if (!matchesFilter(note, filter)) return false;
    const needle = query.trim().toLowerCase();
    return !needle || [note.title, note.whatLearned, note.whatConfused, note.whatBuilt, note.linkedMission, note.linkedResource, note.focusStage].some((value) => String(value || '').toLowerCase().includes(needle));
  }), [normalized, query, filter]);

  const saveNew = (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.whatLearned.trim()) return;
    addNote({ ...form, date: new Date().toISOString().slice(0, 10) });
    setForm({ title: '', noteType: 'session_note', whatLearned: '', linkedWeek: '' });
    setShowForm(false);
  };

  const beginEdit = (note) => {
    setEditing({ id: note.id, title: note.title, whatLearned: note.whatLearned });
  };
  const saveEdit = (event) => {
    event.preventDefault();
    if (!editing?.title.trim() || !editing?.whatLearned.trim()) return;
    updateNote(editing.id, { title: editing.title, whatLearned: editing.whatLearned });
    setEditing(null);
  };

  return (
    <div className="space-y-7">
      <WorkspaceSectionHeader title="Notes" description="A searchable journal of what you learned, questioned, built, and wanted to remember." action={<button type="button" onClick={() => setShowForm((open) => !open)} className="btn-primary flex min-h-11 items-center gap-2 px-4 py-2 text-sm">{showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{showForm ? 'Cancel' : 'New note'}</button>} />

      {showForm && (
        <form onSubmit={saveNew} className="rounded-2xl border border-brand-violet/25 bg-bg-surface p-5 shadow-primary-glow-sm sm:p-6">
          <h3 className="font-heading text-lg font-bold text-text-primary">New standalone note</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold text-text-primary sm:col-span-2">Title<input required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="What do you want to remember?" className="input-base mt-2 w-full text-sm" /></label>
            <label className="text-sm font-bold text-text-primary">Type<select value={form.noteType} onChange={(event) => setForm((current) => ({ ...current, noteType: event.target.value }))} className="input-base mt-2 w-full text-sm"><option value="session_note">Learning note</option><option value="concept_note">Concept note</option><option value="project_note">Project note</option><option value="daily_reflection">Reflection</option><option value="question_for_mentor">Mentor question</option></select></label>
            <label className="text-sm font-bold text-text-primary">Week <span className="font-normal text-text-muted">(optional)</span><input type="number" min="1" max="999" value={form.linkedWeek} onChange={(event) => setForm((current) => ({ ...current, linkedWeek: event.target.value }))} className="input-base mt-2 w-full text-sm" /></label>
            <label className="text-sm font-bold text-text-primary sm:col-span-2">Note<textarea required rows={5} value={form.whatLearned} onChange={(event) => setForm((current) => ({ ...current, whatLearned: event.target.value }))} placeholder="Write the useful part in your own words..." className="input-base mt-2 w-full resize-y text-sm" /></label>
          </div>
          <button type="submit" className="btn-primary mt-4 px-4 py-2.5 text-sm">Save note</button>
        </form>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <WorkspaceSearch value={query} onChange={setQuery} placeholder="Search notes and insights..." label="Search notes" />
        <WorkspaceFilterPills options={FILTERS} value={filter} onChange={setFilter} label="Filter notes" />
      </div>

      {visible.length === 0 ? (
        <WorkspaceEmptyState title={normalized.length ? 'No notes match' : 'No notes yet'} description={normalized.length ? 'Try a different search or filter.' : 'Insights and notes you capture while learning will appear here.'} action={!normalized.length && !showForm ? <button type="button" onClick={() => setShowForm(true)} className="btn-secondary px-4 py-2 text-sm">Create a note</button> : null} />
      ) : (
        <div className="divide-y divide-border-divider border-y border-border-divider">
          {visible.map((note) => {
            const open = expanded === note.id;
            const date = formatWorkspaceDate(note.createdAt || note.date);
            const context = note.linkedWeek ? `Week ${note.linkedWeek}` : note.focusStage || (note.focusSessionId ? 'Focus Session' : '');
            return (
              <article key={note.id} className="py-5">
                <div className="flex items-start gap-4">
                  <button type="button" onClick={() => setExpanded(open ? null : note.id)} aria-expanded={open} className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet">
                    <div className="flex flex-wrap items-center gap-2 text-xs"><span className="font-bold text-brand-violet">{TYPE_LABELS[note.noteType] || 'Note'}</span>{context && <span className="text-text-muted">{context}</span>}{date && <span className="flex items-center gap-1 text-text-muted"><Calendar className="h-3.5 w-3.5" />{date}</span>}</div>
                    <h3 className="mt-2 font-heading text-lg font-bold text-text-primary">{note.title}</h3>
                    {!open && <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-text-secondary">{note.whatLearned || 'Open to view this note.'}</p>}
                  </button>
                  <button type="button" onClick={() => setExpanded(open ? null : note.id)} aria-label={`${open ? 'Collapse' : 'Open'} ${note.title}`} className="rounded-lg p-2 text-text-muted hover:bg-bg-soft hover:text-text-primary focus-visible:ring-2 focus-visible:ring-brand-violet">{open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button>
                </div>

                {open && (
                  <div className="mt-4 rounded-2xl bg-bg-soft p-5">
                    {editing?.id === note.id ? (
                      <form onSubmit={saveEdit} className="space-y-3"><input value={editing.title} onChange={(event) => setEditing((current) => ({ ...current, title: event.target.value }))} className="input-base w-full text-sm" aria-label="Note title" /><textarea rows={6} value={editing.whatLearned} onChange={(event) => setEditing((current) => ({ ...current, whatLearned: event.target.value }))} className="input-base w-full resize-y text-sm" aria-label="Note content" /><div className="flex gap-2"><button className="btn-primary px-4 py-2 text-xs">Save changes</button><button type="button" onClick={() => setEditing(null)} className="btn-secondary px-4 py-2 text-xs">Cancel</button></div></form>
                    ) : (
                      <>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-primary">{note.whatLearned || 'No primary note content was recorded.'}</p>
                        <div className="mt-5 grid gap-3 text-sm text-text-secondary sm:grid-cols-2">
                          {note.whatConfused && <p><span className="font-bold text-text-primary">What was unclear:</span> {note.whatConfused}</p>}
                          {note.whatBuilt && <p><span className="font-bold text-text-primary">What I built:</span> {note.whatBuilt}</p>}
                          {note.questionsForMentor && <p><span className="font-bold text-text-primary">Mentor question:</span> {note.questionsForMentor}</p>}
                          {note.nextAction && <p><span className="font-bold text-text-primary">Next action:</span> {note.nextAction}</p>}
                          {note.linkedMission && <p><span className="font-bold text-text-primary">Mission:</span> {note.linkedMission}</p>}
                          {note.linkedResource && <p><span className="font-bold text-text-primary">Resource:</span> {note.linkedResource}</p>}
                        </div>
                        <div className="mt-5 flex gap-2 border-t border-border-divider pt-4"><button type="button" onClick={() => beginEdit(note)} className="btn-secondary flex items-center gap-2 px-3 py-2 text-xs"><Pencil className="h-3.5 w-3.5" />Edit</button><button type="button" onClick={() => { if (window.confirm(`Delete “${note.title}”? This cannot be undone.`)) deleteNote(note.id); }} className="btn-secondary flex items-center gap-2 px-3 py-2 text-xs text-red-500"><Trash2 className="h-3.5 w-3.5" />Delete</button></div>
                      </>
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
