import React, { useState } from 'react';
import { Play, Pause, Coffee, Square, Clock, ChevronDown, ChevronUp, GripHorizontal } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function FloatingTimer() {
  const { sessionTimer, pauseTimer, resumeTimer, startBreakTimer, endSessionTimer } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // If no session is active, don't show the floating pill
  if (!sessionTimer || !sessionTimer.activeSessionId) return null;

  const minutes = String(Math.floor(sessionTimer.timeLeftSeconds / 60)).padStart(2, '0');
  const seconds = String(sessionTimer.timeLeftSeconds % 60).padStart(2, '0');

  // Format mode string
  const modeText = sessionTimer.isBreak
    ? 'Break'
    : sessionTimer.isRunning
    ? 'Focusing'
    : 'Paused';

  const modeColor = sessionTimer.isBreak
    ? 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5'
    : sessionTimer.isRunning
    ? 'text-accent-primary border-accent-primary/20 bg-accent-primary/5'
    : 'text-amber-500 border-amber-500/20 bg-amber-500/5';

  const handlePointerDown = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
  };

  return (
    <div 
      className="fixed top-[72px] left-4 right-4 sm:left-auto sm:right-6 sm:top-6 sm:w-80 z-50 select-none animate-fade-in no-print cursor-grab active:cursor-grabbing"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        touchAction: 'none'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Sleek Glassmorphic Pill Banner */}
      <div className="relative overflow-hidden bg-navy-900/80 backdrop-blur-xl border border-navy-450/60 rounded-2xl sm:rounded-3xl shadow-amber-glow transition-all duration-300">
        {/* Glow effect lines */}
        <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${sessionTimer.isBreak ? 'from-cyan-500 to-transparent' : 'from-accent-primary to-transparent'}`} />

        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3">
            {/* Session Info */}
            <div className="flex items-center gap-2 min-w-0">
              <GripHorizontal className="w-3.5 h-3.5 text-slate-500 hover:text-slate-350 cursor-grab active:cursor-grabbing flex-shrink-0" />
              <div className={`p-2 rounded-xl border ${modeColor} flex-shrink-0`}>
                {sessionTimer.isBreak ? (
                  <Coffee className="w-4 h-4" />
                ) : (
                  <Clock className="w-4 h-4 animate-pulse" />
                )}
              </div>
              <div className="min-w-0">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${modeColor}`}>
                  {modeText}
                </span>
                <h4 className="text-xs sm:text-[13px] font-bold text-white mt-1 truncate max-w-[140px] sm:max-w-[180px]">
                  {sessionTimer.title || 'Focus Session'}
                </h4>
              </div>
            </div>

            {/* Time & Expand/Collapse Toggle */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="text-right font-mono">
                <span className="text-base sm:text-lg font-bold text-white leading-none">
                  {minutes}:{seconds}
                </span>
              </div>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-navy-800 transition-colors"
                title={collapsed ? "Show controls" : "Hide controls"}
              >
                {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Collapsible Action Controls */}
          {!collapsed && (
            <div className="mt-3 pt-3 border-t border-navy-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {sessionTimer.isRunning ? (
                  <button
                    onClick={pauseTimer}
                    className="flex items-center gap-1 bg-navy-850 hover:bg-navy-800 border border-navy-700 hover:border-navy-600 text-slate-300 font-semibold px-2.5 py-1.5 rounded-xl transition-all text-xs"
                    title="Pause Timer"
                  >
                    <Pause className="w-3.5 h-3.5" /> Pause
                  </button>
                ) : (
                  <button
                    onClick={resumeTimer}
                    className="flex items-center gap-1 bg-accent-primary hover:bg-accent-primary-dim text-navy-950 font-bold px-2.5 py-1.5 rounded-xl transition-all text-xs shadow-primary-glow-sm"
                    title="Resume Timer"
                  >
                    <Play className="w-3.5 h-3.5 fill-navy-950" /> Resume
                  </button>
                )}

                {/* Take Break (only show when not already on break) */}
                {!sessionTimer.isBreak && (
                  <button
                    onClick={() => startBreakTimer(10)}
                    className="flex items-center gap-1 bg-navy-850 hover:bg-navy-800 border border-navy-700 hover:border-navy-600 text-cyan-400 font-semibold px-2.5 py-1.5 rounded-xl transition-all text-xs"
                    title="Start 10 Min Break"
                  >
                    <Coffee className="w-3.5 h-3.5" /> Break
                  </button>
                )}
              </div>

              {/* End Session Button */}
              <button
                onClick={() => endSessionTimer('ended')}
                className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-red-400 font-semibold px-2.5 py-1.5 rounded-xl transition-all text-xs"
                title="End Session"
              >
                <Square className="w-3.5 h-3.5 fill-red-400" /> End
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
