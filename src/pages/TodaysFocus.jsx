import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getActiveWeekData } from '../utils/progressCalculator';
import {
  CheckCircle2, Target, BookOpen, AlertCircle, Copy, HelpCircle,
  FileText, Clock, Play, Pause, RotateCcw, Coffee, ShieldAlert,
  ChevronRight, ToggleLeft, ToggleRight, X, Terminal
} from 'lucide-react';
import { getItemTitle } from '../utils/safeRender';
import { PageShell, SectionCard, InfoPill, StatusBadge, CommandButton, SecondaryButton, EmptyState } from '../components/common/UIComponents';

export default function TodaysFocus() {
  const navigate = useNavigate();
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
    notes,
    userProfile
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
      <PageShell>
        <EmptyState
          message="No Active Operations Found"
          submessage="Please go to the roadmap loader to import your mission timeline."
          icon={AlertCircle}
          actionText="Load Custom JSON"
          onActionClick={() => navigate('/import')}
        />
      </PageShell>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-navy-700 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
            <span className="text-xs text-accent-primary font-bold tracking-widest uppercase">
              {focusMode ? 'Focus Mode Active' : 'Detailed Command Mode'}
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Daily Focus Cockpit</h1>
          <p className="text-slate-350 text-[15px] mt-2 font-medium">
            {userProfile?.displayName || userProfile?.name || 'Operator'}, today's focus is waiting. Week {week.weekNumber} Operations · {week.title}
          </p>
        </div>

        {/* View Mode Toggle button */}
        <button
          onClick={() => setFocusMode(!focusMode)}
          className="flex items-center gap-3 bg-navy-850 border border-navy-700 px-5 py-3 rounded-xl hover:border-navy-600 transition-all text-xs font-bold uppercase tracking-wider text-slate-350 shadow-sm"
        >
          <span>{focusMode ? 'Switch to Command Mode' : 'Switch to Focus Mode'}</span>
          {focusMode ? <ToggleLeft className="w-5 h-5 text-slate-500" /> : <ToggleRight className="w-5 h-5 text-accent-primary" />}
        </button>
      </div>

      {/* ── FOCUS MODE VIEW ── */}
      {focusMode && (
        <div className="space-y-8 max-w-4xl mx-auto">
          {/* STEP 1: LEARN */}
          <div className="relative pl-8 border-l border-navy-700/40 pb-4">
            <div className="absolute left-[-12px] top-1 w-6 h-6 rounded-full bg-navy-900 border border-accent-cyan flex items-center justify-center text-accent-cyan text-xs font-bold">
              1
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-accent-cyan tracking-widest uppercase">Phase 1: Learn</span>
                <h3 className="text-lg font-bold text-white mt-1">Study Daily Focus Materials</h3>
              </div>

              {mainResource ? (
                <div className="bg-navy-850 border border-navy-700/20 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <span className="badge-slate text-xs">{mainResource.type}</span>
                    <h4 className="text-[15px] font-bold text-white leading-snug mt-2 truncate">{mainResource.title}</h4>
                    {mainResource.timeEstimate && (
                      <span className="text-xs text-slate-450 font-medium block">Estimated Time: {mainResource.timeEstimate}</span>
                    )}
                  </div>
                  <div className="flex gap-3 flex-shrink-0 w-full sm:w-auto">
                    <a
                      href={mainResource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary py-2.5 px-5 text-xs font-bold text-center flex-1 sm:flex-initial"
                    >
                      Open Resource
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-navy-900 border border-navy-750 p-6 rounded-2xl text-center text-slate-500 text-sm">
                  No resources listed for today. Proceed to your builds.
                </div>
              )}
            </div>
          </div>

          {/* STEP 2: BUILD */}
          <div className="relative pl-8 border-l border-navy-700/40 pb-4">
            <div className="absolute left-[-12px] top-1 w-6 h-6 rounded-full bg-navy-900 border border-accent-primary flex items-center justify-center text-accent-primary text-xs font-bold">
              2
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-accent-primary tracking-widest uppercase">Phase 2: Build</span>
                <h3 className="text-lg font-bold text-white mt-1">Milestone Checklist & Focus Timer</h3>
              </div>

              <div className="grid md:grid-cols-5 gap-6">
                {/* Checklist column */}
                <div className="md:col-span-3 space-y-3">
                  <span className="text-[11px] font-bold text-slate-450 tracking-widest uppercase block">Daily Priority Checklist</span>
                  {focusTasks.map((task, idx) => {
                    const done = isTaskComplete(month.monthNumber, week.weekNumber, idx);
                    return (
                      <button
                        key={idx}
                        onClick={() => toggleTask(month.monthNumber, week.weekNumber, idx)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-200 ${
                          done
                            ? 'bg-emerald-500/5 border-emerald-500/10 text-slate-500'
                            : 'bg-navy-850 border-navy-700/30 hover:border-navy-600 text-slate-200'
                        }`}
                      >
                        <div className={`w-5.5 h-5.5 rounded-lg flex items-center justify-center flex-shrink-0 transition-all border ${
                          done ? 'border-emerald-500 bg-emerald-500/20' : 'border-navy-600 bg-navy-900'
                        }`}>
                          {done && <CheckCircle2 className="w-4 h-4 text-emerald-450" />}
                        </div>
                        <span className={`text-[14px] font-medium flex-1 ${done ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                          {getItemTitle(task)}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 bg-navy-900 px-2 py-0.5 rounded border border-navy-750 uppercase tracking-wider">
                          T{idx + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Focus Timer column */}
                <div className="md:col-span-2">
                  <div className="bg-navy-850 border border-navy-700/20 rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-4">
                    {!sessionTimer.activeSessionId ? (
                      <div className="w-full space-y-3">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Start Focus Block</span>
                        
                        {week.scheduledSessions && week.scheduledSessions.length > 0 ? (
                          <div className="space-y-2">
                            {week.scheduledSessions.map((session, sidx) => {
                              const title = session.title || session.name || `Session ${sidx + 1}`;
                              const mins = session.durationMinutes || session.duration || 45;
                              return (
                                <button
                                  key={sidx}
                                  onClick={() => startTimer(
                                    `session-${sidx}`,
                                    'Focus Session',
                                    title,
                                    mins,
                                    75,
                                    10
                                  )}
                                  className="btn-secondary w-full py-2 text-xs font-bold text-left px-3.5 flex justify-between items-center hover:border-accent-primary/50 group"
                                >
                                  <span className="group-hover:text-white transition-colors truncate pr-2">{title}</span>
                                  <span className="text-slate-500 font-mono flex-shrink-0">{mins}m</span>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <button
                            onClick={() => startTimer('daily-focus', 'Focus Session', 'Daily Focus Block', 45, 75, 10)}
                            className="btn-primary w-full py-2.5 text-xs font-bold"
                          >
                            Start 45m Session
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="w-full flex flex-col items-center gap-4">
                        <div className="relative w-40 h-40">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                            <circle cx="64" cy="64" r="54" fill="none" stroke="#0C0F1E" strokeWidth="5" />
                            <circle
                              cx="64" cy="64" r="54"
                              fill="none"
                              stroke={sessionTimer.isBreak ? '#22D3EE' : '#3B82F6'}
                              strokeWidth="5"
                              strokeDasharray={2 * Math.PI * 54}
                              strokeDashoffset={2 * Math.PI * 54 - (timerProgress / 100) * 2 * Math.PI * 54}
                              strokeLinecap="round"
                              className="transition-all duration-1000"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <p className="text-3xl font-mono font-bold text-white tracking-tight tabular-nums">{minutes}:{seconds}</p>
                            <p className="text-[10px] text-slate-450 uppercase tracking-widest mt-1 font-bold">
                              {sessionTimer.isBreak ? 'Rest' : 'Active'}
                            </p>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex gap-2.5 items-center justify-center">
                          <button
                            onClick={resetTimer}
                            className="p-2 rounded-lg bg-navy-900 border border-navy-700 text-slate-400 hover:text-white"
                            title="Reset Timer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          {sessionTimer.isRunning ? (
                            <button
                              onClick={pauseTimer}
                              className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold"
                            >
                              Pause
                            </button>
                          ) : (
                            <button
                              onClick={resumeTimer}
                              className="px-3.5 py-1.5 rounded-lg bg-accent-primary/10 border border-accent-primary/20 text-accent-primary hover:bg-accent-primary/20 text-xs font-semibold"
                            >
                              Resume
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: PROVE */}
          <div className="relative pl-8 border-l border-navy-700/40 pb-4">
            <div className="absolute left-[-12px] top-1 w-6 h-6 rounded-full bg-navy-900 border border-purple-500 flex items-center justify-center text-purple-400 text-xs font-bold">
              3
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-purple-400 tracking-widest uppercase">Phase 3: Prove</span>
                <h3 className="text-lg font-bold text-white mt-1">Submit Proof of Work & Repository</h3>
              </div>

              <div className="bg-navy-850 border border-navy-700/20 rounded-3xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <p className="text-[14px] text-slate-350 max-w-xl">
                    Once you complete today's build tasks, document your code additions, screenshots, and push commitments to GitHub.
                  </p>
                  <Link to="/proof" className="btn-secondary py-2.5 px-5 text-xs font-bold whitespace-nowrap w-full sm:w-auto text-center">
                    Submit Proof Page
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 4: REFLECT */}
          <div className="relative pl-8 pb-4">
            <div className="absolute left-[-12px] top-1 w-6 h-6 rounded-full bg-navy-900 border border-amber-500 flex items-center justify-center text-amber-400 text-xs font-bold">
              4
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-amber-400 tracking-widest uppercase">Phase 4: Reflect</span>
                <h3 className="text-lg font-bold text-white mt-1">Capture Progress Context & Barriers</h3>
              </div>

              <div className="grid md:grid-cols-5 gap-6">
                <div className="md:col-span-3 bg-navy-850 border border-navy-700/20 rounded-3xl p-6">
                  <form onSubmit={handleSaveQuickNote} className="space-y-4">
                    <div className="flex justify-between items-center text-[11px] text-slate-450 font-bold uppercase tracking-wider">
                      <span>Quick Note Entry</span>
                      {noteSaved && <span className="text-emerald-400 font-bold">Note Saved ✓</span>}
                    </div>
                    <textarea
                      rows={2}
                      value={quickNote}
                      onChange={(e) => setQuickNote(e.target.value)}
                      placeholder="Explain errors resolved, daily milestones achieved, or patterns learned..."
                      className="input-base w-full text-xs"
                      required
                    />
                    <SecondaryButton type="submit" disabled={!quickNote} className="w-full py-2.5 text-xs font-bold">
                      Save Note to Journal
                    </SecondaryButton>
                  </form>
                </div>

                <div className="md:col-span-2 bg-navy-850 border border-navy-700/20 rounded-3xl p-6 flex flex-col justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-slate-450 tracking-widest uppercase block">Barriers & Help</span>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Blocked on an issue? Log it as a blocker or generate debugging prompts.</p>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowBlockerModal(true)}
                      className="btn-secondary w-full py-2.5 text-xs font-bold text-red-400 border-red-500/20 hover:bg-red-500/5"
                    >
                      Log Blocker
                    </button>
                    <button
                      onClick={copyLemontHelpPrompt}
                      className="btn-secondary w-full py-2.5 text-xs font-bold text-accent-cyan border-accent-cyan/20 hover:bg-accent-cyan/5"
                    >
                      Ask Lemont Debug Prompt
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── COMMAND MODE VIEW ── */}
      {!focusMode && (
        <div className="space-y-6">
          <SectionCard title="Week Operational Overview" subtitle="Objective metrics parsed from active JSON roadmap.">
            <div className="bg-navy-900 border border-navy-700/20 rounded-2xl p-5 space-y-3 text-[14px] text-slate-350">
              <p className="leading-relaxed"><span className="font-bold text-white uppercase text-[12px] tracking-wider mr-2">Objective:</span> {week.objective}</p>
              <p className="leading-relaxed"><span className="font-bold text-white uppercase text-[12px] tracking-wider mr-2">Elliot Link:</span> {week.elliotConnection || 'Guides logic blocks and UI rendering.'}</p>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-navy-700/30">
                <div>
                  <span className="text-xs text-slate-450 font-bold uppercase tracking-wider">Time budget estimate</span>
                  <p className="font-semibold text-white mt-1">{week.estimatedHours || '20-25 Hours'}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-450 font-bold uppercase tracking-wider">Data download estimate</span>
                  <p className="font-semibold text-accent-cyan mt-1">{week.estimatedData || '1-3GB'}</p>
                </div>
              </div>
            </div>
          </SectionCard>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Checklist of all tasks */}
            <SectionCard title="Complete Operational Checklist">
              <div className="space-y-2.5">
                {(week.tasks || []).map((task, idx) => {
                  const done = isTaskComplete(month.monthNumber, week.weekNumber, idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleTask(month.monthNumber, week.weekNumber, idx)}
                      className={`w-full flex items-center gap-3.5 p-4 rounded-2xl border text-left transition-all ${
                        done ? 'bg-emerald-500/5 border-emerald-500/10 text-slate-550' : 'bg-navy-900/40 border-navy-700/20 hover:border-navy-600 text-white'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                        done ? 'border-emerald-500 bg-emerald-500/25' : 'border-navy-650'
                      }`}>
                        {done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-450" />}
                      </div>
                      <span className="text-[14px]">{getItemTitle(task)}</span>
                    </button>
                  );
                })}
              </div>
            </SectionCard>

            {/* Active week blockers list */}
            <SectionCard title="Logged Operational Barriers">
              {activeWeekBlockers.length === 0 ? (
                <div className="bg-navy-900/20 border border-navy-700/20 rounded-2xl p-6 text-center text-[13px] text-slate-500">
                  No open progress blockers logged for this week.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activeWeekBlockers.map((b) => (
                    <div key={b.id} className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl text-xs flex justify-between items-center gap-3">
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate text-[14px]">{b.title}</p>
                        <p className="text-[13px] text-slate-450 truncate mt-1">{b.errorMessage || 'No error log saved'}</p>
                      </div>
                      <Link to="/blockers" className="btn-secondary py-1 px-3 text-xs border-red-500/20 text-red-450 whitespace-nowrap">
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
          <div className="card w-full max-w-md bg-navy-850 border border-navy-700 animate-scale-in">
            <div className="flex items-center justify-between mb-4 border-b border-navy-700 pb-2">
              <h2 className="text-xs font-bold text-white uppercase tracking-widest">Log Active Blocker</h2>
              <button onClick={() => setShowBlockerModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBlockerSubmit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-slate-450 uppercase tracking-wider mb-1">Blocker Error Title *</label>
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
                <label className="block text-[12px] font-bold text-slate-450 uppercase tracking-wider mb-1">Console Error Stack Logs</label>
                <textarea
                  rows={2}
                  placeholder="Paste terminal log stack traces here..."
                  value={blockerError}
                  onChange={(e) => setBlockerError(e.target.value)}
                  className="input-base w-full text-xs font-mono text-red-400 bg-navy-900 resize-none"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-450 uppercase tracking-wider mb-1">What did you try already? *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explain steps taken before getting blocked..."
                  value={blockerTried}
                  onChange={(e) => setBlockerTried(e.target.value)}
                  className="input-base w-full resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-navy-700">
                <SecondaryButton onClick={() => setShowBlockerModal(false)}>
                  Cancel
                </SecondaryButton>
                <button type="submit" className="btn-primary py-2.5 px-5 text-xs font-bold">
                  Log Blocker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
}
