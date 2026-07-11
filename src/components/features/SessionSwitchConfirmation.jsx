import React from 'react';
import { AlertTriangle, Play } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function SessionSwitchConfirmation() {
  const {
    sessionTimer,
    showSwitchConfirmation,
    pendingTimerParams,
    confirmSwitchTimer,
    cancelSwitchTimer
  } = useApp();

  if (!showSwitchConfirmation || !pendingTimerParams) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in no-print">
      <div className="bg-navy-900 border border-amber-500/30 rounded-3xl w-full max-w-md p-6 md:p-8 animate-scale-in text-center shadow-amber-glow">
        <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <AlertTriangle className="w-6 h-6 text-amber-400" />
        </div>
        
        <h2 className="text-xl font-extrabold text-white tracking-tight">
          Active Timer Detected
        </h2>
        
        <p className="text-sm text-slate-300 mt-3 leading-relaxed">
          You are currently in the middle of <span className="text-amber-400 font-bold">"{sessionTimer.title}"</span>. 
          Starting <span className="text-accent-primary font-bold">"{pendingTimerParams.title}"</span> will interrupt and end your current block early.
        </p>

        <div className="bg-navy-950/60 border border-navy-800 rounded-2xl p-4 mt-5 text-left space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Current Session</span>
            <span className="text-slate-300 font-semibold font-mono">
              {Math.floor(sessionTimer.timeLeftSeconds / 60)}m left
            </span>
          </div>
          <div className="flex justify-between items-center text-xs border-t border-navy-800/40 pt-2">
            <span className="text-slate-500">New Target Session</span>
            <span className="text-accent-primary font-semibold font-mono">
              {pendingTimerParams.durationMinutes} minutes
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 mt-6">
          <button
            onClick={confirmSwitchTimer}
            className="w-full bg-accent-primary hover:bg-accent-primary-dim text-navy-950 font-bold py-3 rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-primary-glow-sm"
          >
            <Play className="w-4 h-4 fill-navy-950" /> End & Start New Session
          </button>
          
          <button
            onClick={cancelSwitchTimer}
            className="w-full bg-navy-800 hover:bg-navy-750 border border-navy-700 text-slate-350 font-bold py-2.5 rounded-xl hover:text-white transition-all text-sm uppercase tracking-wider"
          >
            Keep Current Session
          </button>
        </div>
      </div>
    </div>
  );
}
