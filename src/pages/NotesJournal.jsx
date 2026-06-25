import React, { useState, useMemo } from 'react';
import { Plus, Trash2, FileText, ChevronDown, ChevronUp, Calendar, X, Tag, Link as LinkIcon, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatNoteDate, getTodayISO } from '../utils/dateUtils';
import { PageShell, PageHeader, SectionCard, CommandButton, SecondaryButton, StatusBadge, InfoPill } from '../components/common/UIComponents';

const NOTE_TYPES = [
  { value: 'session_note', label: 'Session Note' },
  { value: 'daily_reflection', label: 'Daily Reflection' },
  { value: 'bug_note', label: 'Bug Note' },
  { value: 'concept_note', label: 'Concept Note' },
  { value: 'project_note', label: 'Project Note' },
  { value: 'question_for_lemont', label: 'Question for Lemont' },
  { value: 'resource_summary', label: 'Resource Summary' }
];

const NOTE_TYPE_STYLES = {
  daily_reflection: "bg-blue-500/10 text-blue-400 border border-blue-500/25",
  bug_note: "bg-red-500/10 text-red-400 border border-red-500/25 font-mono",
  concept_note: "bg-purple-500/10 text-purple-400 border border-purple-500/25",
  project_note: "bg-amber-500/10 text-amber-400 border border-amber-500/25",
  question_for_lemont: "bg-blue-500/10 text-blue-400 border border-blue-500/25",
  resource_summary: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/25",
  session_note: "bg-slate-500/10 text-slate-400 border border-slate-500/25"
};

const EMPTY_NOTE = {
  title: '',
  date: getTodayISO(),
  noteType: 'session_note',
  linkedWeek: '',
  linkedMission: '',
  linkedResource: '',
  linkedBlocker: '',
  linkedProject: '',
  whatLearned: '',
  whatConfused: '',
  whatBuilt: '',
  questionsForMentor: '',
  nextAction: '',
};

export default function NotesJournal() {
  const { notes, addNote, deleteNote, settings, roadmap, blockers } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_NOTE);
  const [expandedNote, setExpandedNote] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Filters State
  const [filterType, setFilterType] = useState('all');
  const [filterWeek, setFilterWeek] = useState('all');
  const [filterLinkType, setFilterLinkType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const mentorName = settings.mentorName || 'Lemont';

  // ── EXTRACT DATA FROM ROADMAP FOR SELECTS ──
  const allWeeks = useMemo(() => {
    if (!roadmap?.months) return [];
    const list = [];
    roadmap.months.forEach((m) => {
      if (m.weeks) {
        m.weeks.forEach((w) => {
          list.push({
            weekNumber: w.weekNumber,
            title: `Week ${w.weekNumber}: ${w.title}`,
            missions: w.practicalMissions || [],
            resources: w.resources || []
          });
        });
      }
    });
    return list;
  }, [roadmap]);

  const allMissions = useMemo(() => {
    if (!roadmap?.months) return [];
    const list = [];
    roadmap.months.forEach((m) => {
      if (m.weeks) {
        m.weeks.forEach((w) => {
          if (w.practicalMissions) {
            w.practicalMissions.forEach((pm) => {
              list.push({
                missionId: pm.missionId,
                title: `${pm.missionId} - ${pm.title}`,
                weekNumber: w.weekNumber
              });
            });
          }
        });
      }
    });
    return list;
  }, [roadmap]);

  const allResources = useMemo(() => {
    if (!roadmap?.months) return [];
    const list = [];
    roadmap.months.forEach((m) => {
      if (m.weeks) {
        m.weeks.forEach((w) => {
          if (w.resources) {
            w.resources.forEach((r) => {
              list.push({
                title: r.title,
                weekNumber: w.weekNumber
              });
            });
          }
        });
      }
    });
    return list;
  }, [roadmap]);

  const projects = useMemo(() => {
    return roadmap?.projects || [];
  }, [roadmap]);

  // Dynamic lists based on selected week in form
  const availableMissions = useMemo(() => {
    if (!form.linkedWeek) return allMissions;
    return allMissions.filter(m => m.weekNumber === parseInt(form.linkedWeek, 10));
  }, [form.linkedWeek, allMissions]);

  const availableResources = useMemo(() => {
    if (!form.linkedWeek) return allResources;
    return allResources.filter(r => r.weekNumber === parseInt(form.linkedWeek, 10));
  }, [form.linkedWeek, allResources]);

  const handleChange = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Clear mission/resource if week changes and current selection is no longer valid
      if (field === 'linkedWeek') {
        next.linkedMission = '';
        next.linkedResource = '';
      }
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    addNote(form);
    setForm({ ...EMPTY_NOTE, date: getTodayISO() });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    deleteNote(id);
    setDeleteConfirm(null);
    if (expandedNote === id) setExpandedNote(null);
  };

  // ── FILTER NOTES ──
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      // 1. Filter by Note Type
      if (filterType !== 'all' && note.noteType !== filterType) return false;

      // 2. Filter by Linked Week
      if (filterWeek !== 'all' && String(note.linkedWeek) !== String(filterWeek)) return false;

      // 3. Filter by Link Type presence
      if (filterLinkType !== 'all') {
        if (filterLinkType === 'week' && !note.linkedWeek) return false;
        if (filterLinkType === 'mission' && !note.linkedMission) return false;
        if (filterLinkType === 'resource' && !note.linkedResource) return false;
        if (filterLinkType === 'blocker' && !note.linkedBlocker) return false;
        if (filterLinkType === 'project' && !note.linkedProject) return false;
      }

      // 4. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = note.title?.toLowerCase().includes(query);
        const learnedMatch = note.whatLearned?.toLowerCase().includes(query);
        const confusedMatch = note.whatConfused?.toLowerCase().includes(query);
        const builtMatch = note.whatBuilt?.toLowerCase().includes(query);
        const nextMatch = note.nextAction?.toLowerCase().includes(query);
        return titleMatch || learnedMatch || confusedMatch || builtMatch || nextMatch;
      }

      return true;
    });
  }, [notes, filterType, filterWeek, filterLinkType, searchQuery]);

  return (
    <PageShell>
      <PageHeader
        title="Notes Journal"
        subtitle={`${notes.length} note${notes.length !== 1 ? 's' : ''} captured. Documenting builds and debug paths secures understanding.`}
        actions={
          <CommandButton onClick={() => setShowForm((v) => !v)}>
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancel' : 'New Note'}
          </CommandButton>
        }
      />

      {/* New Note Form */}
      {showForm && (
        <SectionCard className="border-accent-primary/30 shadow-primary-glow-sm">
          <h2 className="font-bold text-white mb-5 flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent-primary" />
            New Learning & Build Note
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="section-label mb-1.5 block">Note Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Week 2 - Mini Calculator Build Logs"
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                  className="input-base w-full text-sm"
                />
              </div>
              <div>
                <label className="section-label mb-1.5 block">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="input-base w-full text-sm"
                />
              </div>
            </div>

            {/* Note Type and Metadata Links */}
            <div className="bg-navy-950/60 rounded-xl p-4 border border-navy-400/50 space-y-4">
              <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wide">
                <Tag className="w-3.5 h-3.5 text-accent-primary" /> NOTE TAG & CONTEXT LINKING
              </p>
              
              <div className="grid sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-[13px] text-slate-400 font-semibold mb-1 block uppercase">Note Type</label>
                  <select
                    value={form.noteType}
                    onChange={(e) => handleChange('noteType', e.target.value)}
                    className="input-base w-full text-xs"
                  >
                    {NOTE_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[13px] text-slate-400 font-semibold mb-1 block uppercase">Link Week</label>
                  <select
                    value={form.linkedWeek}
                    onChange={(e) => handleChange('linkedWeek', e.target.value)}
                    className="input-base w-full text-xs"
                  >
                    <option value="">-- No Week --</option>
                    {allWeeks.map(w => (
                      <option key={w.weekNumber} value={w.weekNumber}>{w.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[13px] text-slate-400 font-semibold mb-1 block uppercase">Link Mission</label>
                  <select
                    value={form.linkedMission}
                    onChange={(e) => handleChange('linkedMission', e.target.value)}
                    className="input-base w-full text-xs"
                  >
                    <option value="">-- No Mission --</option>
                    {availableMissions.map(m => (
                      <option key={m.missionId} value={m.missionId}>{m.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[13px] text-slate-400 font-semibold mb-1 block uppercase">Link Resource</label>
                  <select
                    value={form.linkedResource}
                    onChange={(e) => handleChange('linkedResource', e.target.value)}
                    className="input-base w-full text-xs"
                  >
                    <option value="">-- No Resource --</option>
                    {availableResources.map((r, i) => (
                      <option key={i} value={r.title}>{r.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[13px] text-slate-400 font-semibold mb-1 block uppercase">Link Blocker</label>
                  <select
                    value={form.linkedBlocker}
                    onChange={(e) => handleChange('linkedBlocker', e.target.value)}
                    className="input-base w-full text-xs"
                  >
                    <option value="">-- No Blocker --</option>
                    {blockers.map(b => (
                      <option key={b.id} value={b.id}>
                        [{b.status}] {b.title.slice(0, 30)}{b.title.length > 30 ? '...' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[13px] text-slate-400 font-semibold mb-1 block uppercase">Link Project</label>
                  <select
                    value={form.linkedProject}
                    onChange={(e) => handleChange('linkedProject', e.target.value)}
                    className="input-base w-full text-xs"
                  >
                    <option value="">-- No Project --</option>
                    {projects.map((p, i) => (
                      <option key={i} value={i}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Note Fields */}
            {[
              { field: 'whatLearned', label: ' What I Learned', placeholder: 'What was the main lesson, concept, or logic flow developed?' },
              { field: 'whatConfused', label: '❓ What Confused Me', placeholder: 'What did I struggle with or needs debugging?' },
              { field: 'whatBuilt', label: '🔨 What I Built', placeholder: 'What script, layout, or feature did I code?' },
              {
                field: 'questionsForMentor',
                label: `💬 Questions to Ask ${mentorName}`,
                placeholder: `Write any blocks to raise during mentor reviews...`,
              },
              { field: 'nextAction', label: '➡️ Next Action', placeholder: 'What is the immediate next build step?' },
            ].map(({ field, label, placeholder }) => (
              <div key={field}>
                <label className="section-label mb-1.5 block">{label}</label>
                <textarea
                  placeholder={placeholder}
                  value={form[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                  rows={2}
                  className="input-base w-full text-sm resize-none"
                />
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <CommandButton type="submit">
                <Plus className="w-4 h-4" /> Save Journal Note
              </CommandButton>
              <SecondaryButton onClick={() => setShowForm(false)}>
                Cancel
              </SecondaryButton>
            </div>
          </form>
        </SectionCard>
      )}

      {/* FILTER CONTROLS BAR */}
      <div className="card border-navy-400 p-4 space-y-3">
        <p className="text-[13px] text-slate-500 font-bold uppercase tracking-wider">FILTER ARCHIVE</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search bar */}
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base w-full text-xs pl-9 py-2"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-base w-full text-xs py-2"
            >
              <option value="all">All Note Types</option>
              {NOTE_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Week Filter */}
          <div>
            <select
              value={filterWeek}
              onChange={(e) => setFilterWeek(e.target.value)}
              className="input-base w-full text-xs py-2"
            >
              <option value="all">All Weeks</option>
              {allWeeks.map(w => (
                <option key={w.weekNumber} value={w.weekNumber}>{w.title}</option>
              ))}
            </select>
          </div>

          {/* Link Type Filter */}
          <div>
            <select
              value={filterLinkType}
              onChange={(e) => setFilterLinkType(e.target.value)}
              className="input-base w-full text-xs py-2"
            >
              <option value="all">All Link Types</option>
              <option value="week">Linked to Week</option>
              <option value="mission">Linked to Mission</option>
              <option value="resource">Linked to Resource</option>
              <option value="blocker">Linked to Blocker</option>
              <option value="project">Linked to Project</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <div className="card text-center py-14">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No notes match filters</p>
          <p className="text-xs text-slate-600 mt-1">Adjust your filter choices or create a new note.</p>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="btn-primary mt-4 flex items-center gap-2 mx-auto">
              <Plus className="w-4 h-4" /> Add A Note
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotes.map((note) => {
            const isExpanded = expandedNote === note.id;
            const isDeleteConfirm = deleteConfirm === note.id;
            const typeLabel = NOTE_TYPES.find(t => t.value === note.noteType)?.label || 'Note';

            // Resolve linked blocker title
            const linkedBlockerObj = note.linkedBlocker ? blockers.find(b => b.id === note.linkedBlocker) : null;
            const linkedProjectObj = note.linkedProject !== '' && note.linkedProject !== undefined ? projects[parseInt(note.linkedProject, 10)] : null;

            return (
              <div
                key={note.id}
                className={`card card-hover transition-all border border-navy-400 ${
                  isExpanded ? 'border-accent-primary/30 bg-navy-800/80 shadow-primary-glow-sm' : ''
                }`}
              >
                {/* Note Header */}
                <div className="flex items-start gap-3">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => setExpandedNote(isExpanded ? null : note.id)}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[13px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${NOTE_TYPE_STYLES[note.noteType] || 'badge-slate'}`}>
                        {typeLabel}
                      </span>
                      <h3 className="font-semibold text-white">{note.title}</h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {note.date ? new Date(note.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : formatNoteDate(note.createdAt)}
                      </span>

                      {/* Display linked items tags */}
                      {note.linkedWeek && (
                        <span className="badge-slate font-mono text-xs">Week {note.linkedWeek}</span>
                      )}
                      {note.linkedMission && (
                        <span className="badge-slate font-mono text-xs">Mission {note.linkedMission}</span>
                      )}
                      {note.linkedResource && (
                        <span className="badge-slate text-xs max-w-[120px] truncate" title={note.linkedResource}>
                          Resource: {note.linkedResource}
                        </span>
                      )}
                      {linkedBlockerObj && (
                        <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs px-1.5 py-0.5 rounded font-mono truncate max-w-[120px]" title={linkedBlockerObj.title}>
                          Blocker: {linkedBlockerObj.title}
                        </span>
                      )}
                      {linkedProjectObj && (
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs px-1.5 py-0.5 rounded font-mono truncate max-w-[120px]" title={linkedProjectObj.name}>
                          Project: {linkedProjectObj.name}
                        </span>
                      )}
                    </div>

                    {!isExpanded && note.whatLearned && (
                      <p className="text-xs text-slate-400 mt-2 line-clamp-1">
                         {note.whatLearned}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setExpandedNote(isExpanded ? null : note.id)}
                      className="text-slate-400 hover:text-white transition-colors p-1"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {isDeleteConfirm ? (
                      <div className="flex items-center gap-1 bg-navy-900 border border-navy-400 rounded-lg p-1 animate-scale-in">
                        <button onClick={() => handleDelete(note.id)} className="text-[13px] text-red-400 hover:text-red-300 font-semibold px-2 py-0.5 transition-colors">Delete</button>
                        <button onClick={() => setDeleteConfirm(null)} className="text-[13px] text-slate-400 hover:text-white px-2 py-0.5 transition-colors">Cancel</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(note.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Note Content */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-navy-400/50 space-y-4 animate-fade-in text-xs">
                    {[
                      { field: 'whatLearned', label: ' What I Learned' },
                      { field: 'whatConfused', label: '❓ What Confused Me' },
                      { field: 'whatBuilt', label: '🔨 What I Built' },
                      { field: 'questionsForMentor', label: `💬 Questions to Ask ${mentorName}` },
                      { field: 'nextAction', label: '➡️ Next Action' },
                    ].map(({ field, label }) =>
                      note[field] ? (
                        <div key={field} className="space-y-1">
                          <p className="text-slate-400 font-semibold uppercase tracking-wider text-xs">{label}</p>
                          <p className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">{note[field]}</p>
                        </div>
                      ) : null
                    )}

                    {/* Context Links Details block inside card */}
                    <div className="mt-4 pt-3 border-t border-navy-400/30 flex flex-wrap gap-2 text-[13px] text-slate-400">
                      <span className="font-semibold flex items-center gap-1 uppercase text-xs">
                        <LinkIcon className="w-3 h-3 text-accent-primary" /> Linked Elements:
                      </span>
                      {note.linkedWeek && <span className="bg-navy-950 px-2 py-0.5 rounded border border-navy-400">Week {note.linkedWeek}</span>}
                      {note.linkedMission && <span className="bg-navy-950 px-2 py-0.5 rounded border border-navy-400">Mission {note.linkedMission}</span>}
                      {note.linkedResource && <span className="bg-navy-950 px-2 py-0.5 rounded border border-navy-400 truncate max-w-[150px]">Res: {note.linkedResource}</span>}
                      {linkedBlockerObj && <span className="bg-navy-950 px-2 py-0.5 rounded border border-red-500/20 text-red-400 truncate max-w-[150px]">Blocker: {linkedBlockerObj.title}</span>}
                      {linkedProjectObj && <span className="bg-navy-950 px-2 py-0.5 rounded border border-amber-500/20 text-amber-400 truncate max-w-[150px]">Proj: {linkedProjectObj.name}</span>}
                      {!note.linkedWeek && !note.linkedMission && !note.linkedResource && !note.linkedBlocker && !note.linkedProject && <span className="text-slate-500 italic">None</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
