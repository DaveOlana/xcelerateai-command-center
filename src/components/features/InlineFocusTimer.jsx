import React from 'react';
import { AlertCircle, CheckCircle2, Coffee, FileText, Pause, Play, Square } from 'lucide-react';
import { useApp } from '../../context/AppContext';

function getSessionContext(sessionTimer, roadmap, settings) {
  const stored = sessionTimer?.context || {};
  return {
    courseId: stored.courseId || roadmap?.id || '',
    courseTitle: stored.courseTitle || roadmap?.shortTitle || roadmap?.title || roadmap?.bootcampTitle || 'Current course',
    weekNumber: stored.weekNumber || settings?.activeWeek,
    weekTitle: stored.weekTitle || '',
    stage: stored.stage || sessionTimer?.type || 'Study',
    stageLabel: stored.stageLabel || sessionTimer?.type || 'Study',
    taskTitle: stored.taskTitle || sessionTimer?.title || 'Focus activity',
    missionId: stored.missionId || '',
    missionTitle: stored.missionTitle || '',
    resourceTitle: stored.resourceTitle || '',
    projectId: stored.projectId || '',
    focusSessionId: sessionTimer?.activeSessionId || '',
  };
}

export default function InlineFocusTimer() {
  const {
    roadmap,
    settings,
    sessionTimer,
    pauseTimer,
    resumeTimer,
    startBreakTimer,
    endSessionTimer,
    resetTimer,
    addNote,
    addBlocker,
  } = useApp();
  const [expanded, setExpanded] = React.useState(false);
  const [noteText, setNoteText] = React.useState('');
  const [problemText, setProblemText] = React.useState('');
  const [triedText, setTriedText] = React.useState('');
  const [reflection, setReflection] = React.useState('');
  const [feedback, setFeedback] = React.useState('');
  const [endedSession, setEndedSession] = React.useState(null);

  const context = getSessionContext(sessionTimer, roadmap, settings);

  React.useEffect(() => {
    if (sessionTimer?.showExpiredPrompt && !endedSession) {
      setEndedSession({
        context,
        elapsedSeconds: sessionTimer.accumulatedActiveSeconds || sessionTimer.durationMinutes * 60,
      });
      setExpanded(true);
    }
  }, [context, endedSession, sessionTimer?.accumulatedActiveSeconds, sessionTimer?.durationMinutes, sessionTimer?.showExpiredPrompt]);

  if (!sessionTimer?.activeSessionId && !endedSession) return null;

  const activeContext = endedSession?.context || context;
  const contextFields = {
    linkedWeek: activeContext.weekNumber,
    linkedMission: activeContext.missionId || activeContext.missionTitle,
    linkedResource: activeContext.resourceTitle,
    linkedProject: activeContext.projectId,
    roadmapId: activeContext.courseId,
    roadmapTitle: activeContext.courseTitle,
    focusStage: activeContext.stageLabel,
    focusSessionId: activeContext.focusSessionId,
  };

  const saveNote = (event) => {
    event.preventDefault();
    if (!noteText.trim()) return;
    addNote({
      title: `Focus note — Week ${activeContext.weekNumber}`,
      date: new Date().toISOString().split('T')[0],
      noteType: 'session_note',
      type: 'Session Note',
      content: noteText.trim(),
      whatLearned: noteText.trim(),
      whatILearned: noteText.trim(),
      ...contextFields,
    });
    setNoteText('');
    setFeedback('Note saved');
  };

  const saveProblem = (event) => {
    event.preventDefault();
    if (!problemText.trim()) return;
    addBlocker({
      title: problemText.trim(),
      weekNumber: Number(activeContext.weekNumber),
      missionTitle: activeContext.missionTitle || activeContext.taskTitle,
      skillArea: activeContext.stageLabel,
      whatTryingToDo: activeContext.taskTitle,
      whatWentWrong: problemText.trim(),
      errorMessage: '',
      whatAlreadyTried: triedText.trim(),
      roadmapId: activeContext.courseId,
      resourceTitle: activeContext.resourceTitle,
      focusSessionId: activeContext.focusSessionId,
    });
    setProblemText('');
    setTriedText('');
    setFeedback('Problem saved');
  };

  const endFocus = () => {
    setEndedSession({ context, elapsedSeconds: sessionTimer.accumulatedActiveSeconds || 0 });
    endSessionTimer('ended');
    setExpanded(true);
  };

  const finishSession = (saveReflection) => {
    if (saveReflection && reflection.trim()) {
      addNote({
        title: `Focus reflection — Week ${activeContext.weekNumber}`,
        date: new Date().toISOString().split('T')[0],
        noteType: 'session_note',
        type: 'Session Reflection',
        content: reflection.trim(),
        whatLearned: reflection.trim(),
        whatILearned: reflection.trim(),
        ...contextFields,
      });
    }
    resetTimer();
    setEndedSession(null);
    setReflection('');
    setFeedback('');
  };

  if (endedSession) {
    return (
      <section className="surface-card surface-card--compact mb-6 space-y-4 border-brand-green/25 bg-brand-green/5 p-5" aria-label="Focus session complete">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-text-primary">Focus ended</h3>
            <p className="mt-1 text-xs text-text-secondary">
              {activeContext.taskTitle} · {Math.max(0, Math.round((endedSession.elapsedSeconds || 0) / 60))} minutes focused
            </p>
          </div>
        </div>
        <div>
          <label htmlFor="focus-reflection" className="text-xs font-semibold text-text-primary">Anything worth remembering? <span className="font-normal text-text-muted">Optional</span></label>
          <textarea id="focus-reflection" rows={2} value={reflection} onChange={(event) => setReflection(event.target.value)} className="input-base mt-2 w-full resize-none text-sm" />
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => finishSession(false)} className="btn-secondary justify-center px-4 py-2 text-xs font-semibold">Skip</button>
          <button type="button" onClick={() => finishSession(true)} disabled={!reflection.trim()} className="btn-primary justify-center px-4 py-2 text-xs font-bold disabled:opacity-50">Save reflection</button>
        </div>
      </section>
    );
  }

  const minutes = String(Math.floor((sessionTimer.timeLeftSeconds || 0) / 60)).padStart(2, '0');
  const seconds = String((sessionTimer.timeLeftSeconds || 0) % 60).padStart(2, '0');

  return (
    <section className="surface-card sticky top-4 z-20 mb-6 border-accent-primary/25 p-5" aria-label="Active focus timer">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-accent-primary">{sessionTimer.isBreak ? 'Break' : 'Focus'}</p>
          <p className="mt-1 truncate text-sm font-bold text-white">{activeContext.taskTitle}</p>
          <p className="mt-1 text-xs text-slate-400">Week {activeContext.weekNumber} · {activeContext.stageLabel}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 font-mono text-2xl font-bold tabular-nums text-white">{minutes}:{seconds}</span>
          {sessionTimer.isRunning ? (
            <button type="button" onClick={pauseTimer} className="btn-secondary flex items-center gap-1.5 px-3 py-2 text-xs font-bold"><Pause className="h-3.5 w-3.5" /> Pause</button>
          ) : (
            <button type="button" onClick={resumeTimer} className="btn-primary flex items-center gap-1.5 px-3 py-2 text-xs font-bold"><Play className="h-3.5 w-3.5" /> Resume</button>
          )}
          {!sessionTimer.isBreak && <button type="button" onClick={() => startBreakTimer(sessionTimer.recommendedBreakMinutes || 10)} className="btn-secondary flex items-center gap-1.5 px-3 py-2 text-xs font-bold"><Coffee className="h-3.5 w-3.5" /> Break</button>}
          <button type="button" onClick={endFocus} className="btn-secondary flex items-center gap-1.5 border-red-500/20 px-3 py-2 text-xs font-bold text-red-400"><Square className="h-3.5 w-3.5" /> End</button>
          <button type="button" onClick={() => setExpanded((value) => !value)} className="btn-secondary px-3 py-2 text-xs font-semibold">{expanded ? 'Hide tools' : 'Note or problem'}</button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 grid gap-4 border-t border-navy-700/40 pt-4 md:grid-cols-2">
          <form onSubmit={saveNote} className="space-y-3">
            <p className="flex items-center gap-2 text-sm font-bold text-white"><FileText className="h-4 w-4 text-accent-primary" /> Add note</p>
            <textarea rows={2} value={noteText} onChange={(event) => { setNoteText(event.target.value); setFeedback(''); }} placeholder="What is worth remembering?" className="input-base w-full resize-none text-sm" />
            <button type="submit" disabled={!noteText.trim()} className="btn-secondary w-full justify-center py-2 text-xs font-bold disabled:opacity-50">Save note</button>
          </form>
          <form onSubmit={saveProblem} className="space-y-3">
            <p className="flex items-center gap-2 text-sm font-bold text-white"><AlertCircle className="h-4 w-4 text-red-400" /> I'm stuck</p>
            <textarea rows={2} required value={problemText} onChange={(event) => { setProblemText(event.target.value); setFeedback(''); }} placeholder="What is wrong?" className="input-base w-full resize-none text-sm" />
            <input value={triedText} onChange={(event) => setTriedText(event.target.value)} placeholder="What have you tried? (optional)" className="input-base w-full text-sm" />
            <button type="submit" disabled={!problemText.trim()} className="btn-secondary w-full justify-center border-red-500/20 py-2 text-xs font-bold text-red-400 disabled:opacity-50">Save problem</button>
          </form>
          {feedback && <p className="text-xs text-emerald-400 md:col-span-2">{feedback}</p>}
        </div>
      )}
    </section>
  );
}
