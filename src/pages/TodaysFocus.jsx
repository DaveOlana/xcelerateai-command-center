import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getActiveWeekData } from '../utils/progressCalculator';
import {
  CheckCircle2, Target, BookOpen, AlertCircle, Copy, HelpCircle,
  FileText, Clock, Play, Pause, RotateCcw, Coffee, ShieldAlert,
  ChevronRight, ToggleLeft, ToggleRight, X, Terminal
} from 'lucide-react';
import { getItemTitle } from '../utils/safeRender';
import { PageShell, SectionCard, InfoPill, StatusBadge, CommandButton, SecondaryButton } from '../components/common/UIComponents';

export default function TodaysFocus() {
  const {
    roadmap,
    settings,
    toggleTask,
    isTaskComplete,
    sessionTimer,
    startTimer,
    pauseTimer,
    resumeTimer,
    startBreakTimer,
    resetTimer,
    acknowledgeExpiredPrompt,
    addBlocker,
    addNote,
    blockers,
    practicalMissions,
    notes
  } = useApp();

  // Cockpit view modes: Focus Mode (minimal) vs Command Mode (detailed)
  const [focusMode, setFocusMode] = useState(true);

  // Quick notes state
  const [quickNote, setQuickNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  // Blocker Modal Form State
  const [showBlockerModal, setShowBlockerModal] = useState(false);
  const [blockerTitle, setBlockerTitle] = useState('');
  const [blockerError, setBlockerError] = useState('');
  const [blockerTried, setBlockerTried] = useState('');

  // Active roadmap week details
  const activeData = getActiveWeekData(roadmap, settings.activeWeek);

  const activeWeekBlockers = blockers.filter(
    (b) => b.weekNumber === settings.activeWeek && b.status !== 'Solved'
  );

  // Sound / trigger alert check when timer triggers showExpiredPrompt
  const [showTimerAlertModal, setShowTimerAlertModal] = useState(false);

  useEffect(() => {
    if (sessionTimer.showExpiredPrompt) {
      setShowTimerAlertModal(true);
    } else {
      setShowTimerAlertModal(false);
    }
  }, [sessionTimer.showExpiredPrompt]);

  // Break alert checking
  const [showBreakPrompt, setShowBreakPrompt] = useState(false);

  useEffect(() => {
    if (!sessionTimer.isRunning || sessionTimer.isBreak) return;
    const maxSec = (sessionTimer.maxContinuousMinutes || 75) * 60;
    if (sessionTimer.accumulatedActiveSeconds >= maxSec) {
      setShowBreakPrompt(true);
    }
  }, [sessionTimer.accumulatedActiveSeconds, sessionTimer.isRunning, sessionTimer.isBreak, sessionTimer.maxContinuousMinutes]);

  if (!activeData) {
    return (
      <div className="card text-center py-16 max-w-xl mx-auto my-12">
        <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white uppercase tracking-wider">No Active Operations Found</h2>
        <p className="text-xs text-slate-400 mt-2">Please go to the roadmap loader to import your mission timeline.</p>
        <Link to="/import" className="btn-primary mt-6 inline-flex py-2.5 px-6">
           Load Custom JSON
        </Link>
      </div>
    );
  }

  const { week, month } = activeData;

  // Key targets: first 3 incomplete tasks
  const focusTasks = (week.tasks || []).slice(0, 3);
  const mainResource = week.resources?.[0];

  const handleSaveQuickNote = (e) => {
    e.preventDefault();
    if (!quickNote) return;
    addNote({
      title: `Daily Note — Week ${week.weekNumber}`,
      type: 'Session Note',
      linkedItem: `Week ${week.weekNumber}`,
      content: quickNote,
      whatILearned: quickNote,
      whatConfusedMe: 'None logged.',
    });
    setQuickNote('');
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const handleAddBlockerSubmit = (e) => {
    e.preventDefault();
    if (!blockerTitle) return;
    addBlocker({
      title: blockerTitle,
      weekNumber: week.weekNumber,
      skillArea: 'General Focus',
      whatTryingToDo: 'Daily study exercises',
      whatWentWrong: blockerTried,
      errorMessage: blockerError,
      whatAlreadyTried: blockerTried,
    });
    setBlockerTitle('');
    setBlockerError('');
    setBlockerTried('');
    setShowBlockerModal(false);
    alert('Blocker logged. Your progress status indicator is now flagged as blocked.');
  };

  // Ask Lemont Helper Generator
  const copyLemontHelpPrompt = () => {
    const activeBlocker = activeWeekBlockers[0] || blockers[0];
    const recentNote = notes?.[0]?.content || notes?.[0]?.whatLearned || "None recorded yet";
    const currentMission = week.practicalMissions?.[0];
    const missionTitle = currentMission ? currentMission.title : week.title;
    
    const filesToCreate = currentMission?.filesToCreate || currentMission?.files || week.files || ["Not specified"];
    const filesStr = Array.isArray(filesToCreate) ? filesToCreate.join(', ') : String(filesToCreate);
    
    const errorStr = activeBlocker?.errorMessage || activeBlocker?.title || "No active error logged";
    const triedStr = activeBlocker?.whatAlreadyTried || activeBlocker?.whatWentWrong || "Reviewed documentation and code logs";
    const noteText = recentNote !== "None recorded yet" ? `Recent note: "${recentNote}"` : "";

    const promptText = `I am on Week ${week.weekNumber}, Mission "${missionTitle}" of the XcelerateAI Bootcamp. I am trying to build "${week.deliverable || "this week's milestones"}". I created these files: ${filesStr}. The error I got is: ${errorStr}. I have tried: ${triedStr}. ${noteText} Please help me debug this without giving me the full answer immediately.`;
    
    navigator.clipboard.writeText(promptText);
    alert('Ask Lemont debug prompt copied to clipboard!');
  };

  // Timer format helpers
  const minutes = String(Math.floor(sessionTimer.timeLeftSeconds / 60)).padStart(2, '0');
  const seconds = String(sessionTimer.timeLeftSeconds % 60).padStart(2, '0');
  const timerProgress = sessionTimer.durationMinutes > 0 
    ? (sessionTimer.timeLeftSeconds / (sessionTimer.durationMinutes * 60)) * 100 
    : 100;

  const handleTimerCompleteAction = (action) => {
    acknowledgeExpiredPrompt();
    setShowTimerAlertModal(false);
    if (action === 'complete') {
      alert('Focus session recorded!');
      resetTimer();
    } else if (action === 'restart') {
      startTimer(
        sessionTimer.activeSessionId || 'daily-focus',
        sessionTimer.type || 'Focus Session',
        sessionTimer.title || 'Focus Session',
        sessionTimer.durationMinutes,
        sessionTimer.maxContinuousMinutes,
        sessionTimer.recommendedBreakMinutes
      );
    } else {
      resetTimer();
    }
  };

  return (
    <PageShell>
      {/* ── Timer Expiration Alert Modal ── */}
      {showTimerAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="card w-full max-w-md bg-navy-850 border border-navy-500/40 animate-scale-in text-center p-8 space-y-5">
            <div className="w-14 h-14 rounded-full bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center mx-auto">
              <Clock className="w-7 h-7 text-accent-primary animate-pulse" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-white uppercase tracking-wider">Session Completed</h3>
              <p className="text-[14px] text-slate-400 mt-2">
                Your focus timer for <span className="text-white font-semibold">"{sessionTimer.title || 'Daily Focus'}"</span> expired.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <CommandButton onClick={() => handleTimerCompleteAction('complete')} className="w-full py-3 text-[15px]">
                Mark Session Complete
              </CommandButton>
              <SecondaryButton onClick={() => handleTimerCompleteAction('restart')} className="w-full py-3 text-[15px]">
                Restart Timer
              </SecondaryButton>
              <button
                onClick={() => handleTimerCompleteAction('interrupted')}
                className="text-slate-500 hover:text-red-400 text-[14px] font-medium transition-colors py-2"
              >
                Log as Interrupted / Save Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Break Reminder Alert Modal ── */}
      {showBreakPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="card w-full max-w-md bg-navy-850 border border-amber-500/30 animate-scale-in text-center p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
              <Coffee className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">Take a Break, Operator</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                You've been studying for <span className="text-amber-400 font-bold">{Math.floor(sessionTimer.accumulatedActiveSeconds / 60)} minutes</span> continuously. Rest your eyes to optimize long-term memory.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <CommandButton
                onClick={() => {
                  startBreakTimer(sessionTimer.recommendedBreakMinutes || 10);
                  setShowBreakPrompt(false);
                }}
                className="w-full bg-accent-cyan hover:bg-accent-cyan-dim"
              >
                Start {sessionTimer.recommendedBreakMinutes || 10} Min Break
              </CommandButton>
              <SecondaryButton onClick={() => setShowBreakPrompt(false)} className="w-full">
                Remind Me in 15 Min
              </SecondaryButton>
            </div>
          </div>
        </div>
      )}

      {/* ── Header and Controls ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-navy-600 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-primary animate-pulse" />
            <span className="text-xs text-accent-primary font-bold tracking-wider uppercase">
              {focusMode ? 'Focus Workspace' : 'Command Workspace'}
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">Daily Focus Cockpit</h1>
          <p className="text-slate-400 text-[15px] mt-2 font-medium">
            Week {week.weekNumber} Operations · {week.title}
          </p>
        </div>

        {/* View Mode Toggle button */}
        <button
          onClick={() => setFocusMode(!focusMode)}
          className="flex items-center gap-3 bg-navy-800 border border-navy-600 px-5 py-3 rounded-xl hover:border-navy-450 transition-all text-[13px] font-bold uppercase tracking-wider text-slate-300 shadow-sm"
        >
          <span>{focusMode ? 'Switch to Command Mode' : 'Switch to Focus Mode'}</span>
          {focusMode ? <ToggleLeft className="w-5 h-5 text-slate-500" /> : <ToggleRight className="w-5 h-5 text-accent-primary" />}
        </button>
      </div>

      {/* ── FOCUS MODE VIEW ── */}
      {focusMode && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column: Tasks + Resources */}
          <div className="space-y-6">
            {/* Key Focus Targets */}
            <SectionCard title="Key Focus Targets" subtitle="Dave's priority study milestones for today.">
              <div className="space-y-3 pt-2">
                {focusTasks.map((task, idx) => {
                  const done = isTaskComplete(month.monthNumber, week.weekNumber, idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleTask(month.monthNumber, week.weekNumber, idx)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                        done
                          ? 'bg-accent-primary/5 border-accent-primary/20 text-slate-500'
                          : 'bg-navy-800 border-navy-600 hover:border-navy-400 text-slate-200'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all border ${
                        done ? 'border-accent-primary bg-accent-primary/20' : 'border-navy-400 bg-navy-900'
                      }`}>
                        {done && <CheckCircle2 className="w-3.5 h-3.5 text-accent-primary" />}
                      </div>
                      <span className={`text-[15px] font-medium flex-1 ${done ? 'line-through text-slate-500' : 'text-white'}`}>
                        {getItemTitle(task)}
                      </span>
                      <span className="text-[14px] text-slate-500 font-bold bg-navy-900 px-2 py-1 rounded border border-navy-600 uppercase tracking-wider">
                        Task {idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            </SectionCard>

            {/* Main Resource */}
            {mainResource && (
              <SectionCard title="Daily Focus Resource" subtitle="Primary documentation/reference material.">
                <div className="bg-navy-800 border border-navy-600 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mt-2">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <InfoPill label={mainResource.type} variant="cyan" />
                    <h4 className="text-[16px] font-bold text-white leading-snug mt-1 truncate">{mainResource.title}</h4>
                    {mainResource.timeEstimate && (
                      <span className="text-[13px] text-slate-400 font-medium block">Estimated Time: {mainResource.timeEstimate}</span>
                    )}
                  </div>
                  <a
                    href={mainResource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary py-2.5 px-5 text-[13px] flex-shrink-0"
                  >
                    Open Resource
                  </a>
                </div>
              </SectionCard>
            )}

            {/* Quick Actions Panel */}
            <SectionCard title="Quick Commander Logs" subtitle="Capture context or blockages instantly.">
              <div className="grid grid-cols-2 gap-4 pb-5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBlockerModal(true)}
                  className="btn-secondary py-3 text-[13px] font-bold border-red-500/30 text-red-400 hover:bg-red-500/10 flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4" /> I'm Blocked
                </button>
                <button
                  type="button"
                  onClick={copyLemontHelpPrompt}
                  className="btn-secondary py-3 text-[13px] font-bold border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/10 flex items-center justify-center gap-2"
                >
                  <Terminal className="w-4 h-4" /> Ask Lemont
                </button>
              </div>

              {/* Fast Quick Note logging */}
              <form onSubmit={handleSaveQuickNote} className="border-t border-navy-600 pt-5 space-y-4">
                <div className="flex justify-between items-center text-[12px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>Quick Note Entry</span>
                  {noteSaved && <span className="text-accent-primary font-semibold">Logged ✓</span>}
                </div>
                <textarea
                  rows={2}
                  value={quickNote}
                  onChange={(e) => setQuickNote(e.target.value)}
                  placeholder="Capture errors resolved, notes, or ideas..."
                  className="input-base w-full text-[14px] resize-none"
                  required
                />
                <SecondaryButton type="submit" disabled={!quickNote} className="w-full py-3 text-[14px]">
                  Save Note to Journal
                </SecondaryButton>
              </form>
            </SectionCard>
          </div>

          {/* Right Column: Focus Timer / Pomodoro Cockpit */}
          <div className="space-y-6">
            <SectionCard title="Focus Interval Controller" className="flex flex-col items-center py-8 text-center bg-navy-800 border-navy-600">
              {!sessionTimer.activeSessionId ? (
                <div className="w-full space-y-6 px-4">
                  <p className="text-[14px] text-slate-400 font-medium">Select target operational session to launch timer:</p>
                  <div className="grid gap-3 text-left">
                    {(week.sessions || []).length > 0 ? (
                      (week.sessions || []).map((s, idx) => (
                        <button
                          key={s.sessionId || idx}
                          onClick={() => startTimer(s.sessionId || `w${week.weekNumber}-s${idx}`, s.type || 'Focus Session', s.title || `Session ${idx + 1}`, s.durationMinutes, s.maxContinuousMinutes || 75, s.recommendedBreakMinutes || 10)}
                          className="p-4 bg-navy-900 border border-navy-600 rounded-xl text-[15px] font-bold text-white hover:border-accent-primary/40 hover:bg-navy-800 transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-[14px] text-accent-primary uppercase tracking-wider font-bold bg-accent-primary/10 px-2.5 py-1 rounded border border-accent-primary/20">{s.type || 'Focus'}</span>
                            <span className="group-hover:text-accent-primary transition-colors">{s.title}</span>
                          </div>
                          <span className="text-[14px] text-slate-400 font-medium">{s.durationMinutes} Min</span>
                        </button>
                      ))
                    ) : (
                      [
                        { id: 'study-session', label: 'Study Focus Block', duration: 45, type: 'Study Session' },
                        { id: 'build-session', label: 'Build Core Code', duration: 90, type: 'Build Session' },
                        { id: 'quick-session', label: 'Warmup Focus', duration: 25, type: 'Warmup Focus' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          onClick={() => startTimer(s.id, s.type, s.label, s.duration, 75, 10)}
                          className="p-4 bg-navy-900 border border-navy-600 rounded-xl text-[15px] font-bold text-white hover:border-accent-primary/40 hover:bg-navy-800 transition-all flex items-center justify-between group"
                        >
                          <span className="group-hover:text-accent-primary transition-colors">{s.label}</span>
                          <span className="text-[14px] text-slate-400 font-medium">{s.duration} Min</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center gap-8">
                  <div>
                    <span className="badge-slate text-[14px] uppercase tracking-widest">{sessionTimer.type}</span>
                    <h4 className="text-[18px] font-bold text-white mt-2 uppercase tracking-wide">{sessionTimer.title}</h4>
                  </div>

                  {/* POMODORO COUNTDOWN RING */}
                  <div className="relative w-56 h-56">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                      <circle cx="64" cy="64" r="56" fill="none" stroke="#0F172A" strokeWidth="6" />
                      <circle
                        cx="64" cy="64" r="56"
                        fill="none"
                        stroke={sessionTimer.isBreak ? '#22D3EE' : '#3B82F6'}
                        strokeWidth="6"
                        strokeDasharray={2 * Math.PI * 56}
                        strokeDashoffset={2 * Math.PI * 56 - (timerProgress / 100) * 2 * Math.PI * 56}
                        strokeLinecap="round"
                        style={{ filter: `drop-shadow(0 0 6px ${sessionTimer.isBreak ? '#22D3EE' : '#3B82F6'}50)` }}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-5xl font-mono font-bold text-white tracking-tight tabular-nums">{minutes}:{seconds}</p>
                      <p className="text-[14px] text-slate-400 uppercase tracking-widest mt-1 font-bold">
                        {sessionTimer.isBreak ? 'Break Interval' : 'Focus Active'}
                      </p>
                    </div>
                  </div>

                  {/* Timer Controls bar */}
                  <div className="flex gap-3 items-center justify-center">
                    <button
                      onClick={resetTimer}
                      className="w-10 h-10 rounded-xl bg-navy-900 border border-navy-500/80 flex items-center justify-center text-slate-500 hover:text-white transition-all"
                      title="Reset Timer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    {sessionTimer.isRunning ? (
                      <button
                        onClick={pauseTimer}
                        className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 hover:bg-amber-500/20 transition-all"
                        title="Pause Timer"
                      >
                        <Pause className="w-5 h-5 fill-amber-400/20" />
                      </button>
                    ) : (
                      <button
                        onClick={resumeTimer}
                        className="w-12 h-12 rounded-xl bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center text-accent-primary hover:bg-accent-primary/20 transition-all"
                        title="Resume Timer"
                      >
                        <Play className="w-5 h-5 fill-accent-primary" />
                      </button>
                    )}

                    {!sessionTimer.isBreak && (
                      <button
                        onClick={() => startBreakTimer(sessionTimer.recommendedBreakMinutes)}
                        className="w-10 h-10 rounded-xl bg-navy-900 border border-navy-500/80 flex items-center justify-center text-slate-500 hover:text-accent-cyan transition-all"
                        title="Start Break"
                      >
                        <Coffee className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      )}

      {/* ── COMMAND MODE VIEW ── */}
      {!focusMode && (
        <div className="space-y-6">
          <SectionCard title="Week Operational Overview" subtitle="Objective metrics parsed from active JSON roadmap.">
            <div className="bg-navy-900/50 border border-navy-500/50 rounded-xl p-4 space-y-3 text-xs text-slate-300">
              <p className="leading-relaxed"><span className="font-bold text-white font-mono uppercase text-xs mr-2">Objective:</span> {week.objective}</p>
              <p className="leading-relaxed"><span className="font-bold text-white font-mono uppercase text-xs mr-2">Elliot Link:</span> {week.elliotConnection || 'Guides logic blocks and UI rendering.'}</p>
              
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-navy-500/30">
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider font-mono">Time budget estimate</span>
                  <p className="font-semibold text-white mt-0.5">{week.estimatedHours || '20-25 Hours'}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider font-mono">Data download estimate</span>
                  <p className="font-semibold text-accent-cyan mt-0.5">{week.estimatedData || '1-3GB'}</p>
                </div>
              </div>
            </div>
          </SectionCard>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Checklist of all tasks */}
            <SectionCard title="Complete Operational Checklist">
              <div className="space-y-2">
                {(week.tasks || []).map((task, idx) => {
                  const done = isTaskComplete(month.monthNumber, week.weekNumber, idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleTask(month.monthNumber, week.weekNumber, idx)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        done ? 'bg-accent-primary/5 border-accent-primary/10 text-slate-500' : 'bg-navy-900/40 border-navy-500/50 hover:border-navy-450 text-white'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                        done ? 'border-accent-primary bg-accent-primary/25' : 'border-navy-300'
                      }`}>
                        {done && <CheckCircle2 className="w-3.5 h-3.5 text-accent-primary" />}
                      </div>
                      <span className="text-xs">{getItemTitle(task)}</span>
                    </button>
                  );
                })}
              </div>
            </SectionCard>

            {/* Active week blockers list */}
            <SectionCard title="Logged Operational Barriers">
              {activeWeekBlockers.length === 0 ? (
                <div className="bg-navy-900/20 border border-navy-500/30 rounded-xl p-6 text-center text-xs text-slate-500">
                  No open progress blockers logged for this week.
                </div>
              ) : (
                <div className="space-y-2">
                  {activeWeekBlockers.map((b) => (
                    <div key={b.id} className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl text-xs flex justify-between items-center gap-3">
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">{b.title}</p>
                        <p className="text-[13px] text-slate-500 truncate mt-0.5">{b.errorMessage || 'No error log saved'}</p>
                      </div>
                      <Link to="/blockers" className="btn-secondary py-1 px-2.5 text-[13px] border-red-500/30 text-red-400 whitespace-nowrap">
                        Inspect
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      )}

      {/* Log Blocker Modal overlay */}
      {showBlockerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="card w-full max-w-md bg-navy-850 border border-navy-400 animate-scale-in">
            <div className="flex items-center justify-between mb-4 border-b border-navy-500/30 pb-2">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Log active blocker</h2>
              <button onClick={() => setShowBlockerModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBlockerSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wide mb-1">Blocker Error Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TypeError: Cannot read properties of null"
                  value={blockerTitle}
                  onChange={(e) => setBlockerTitle(e.target.value)}
                  className="input-base w-full"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wide mb-1">Console Error Stack logs</label>
                <textarea
                  rows={2}
                  placeholder="Paste terminal log stack traces here..."
                  value={blockerError}
                  onChange={(e) => setBlockerError(e.target.value)}
                  className="input-base w-full text-xs font-mono text-red-300 resize-none"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wide mb-1">What did you try already? *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explain steps taken before getting blocked..."
                  value={blockerTried}
                  onChange={(e) => setBlockerTried(e.target.value)}
                  className="input-base w-full resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-navy-500/20">
                <SecondaryButton onClick={() => setShowBlockerModal(false)}>
                  Cancel
                </SecondaryButton>
                <CommandButton type="submit">
                  Log Blocker
                </CommandButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
}
