import React, { useState } from 'react';
import { Play, Pause, Coffee, Square, Clock, GripVertical, Move } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function FloatingTimer() {
  const { sessionTimer, pauseTimer, resumeTimer, startBreakTimer, endSessionTimer } = useApp();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(false);

  // If no session is active, don't show the floating timer
  if (!sessionTimer || !sessionTimer.activeSessionId) return null;

  const minutes = String(Math.floor(sessionTimer.timeLeftSeconds / 60)).padStart(2, '0');
  const seconds = String(sessionTimer.timeLeftSeconds % 60).padStart(2, '0');

  // Format mode string
  const modeText = sessionTimer.isBreak
    ? 'Break'
    : sessionTimer.isRunning
    ? 'Focus'
    : 'Paused';

  const themeColor = sessionTimer.isBreak
    ? '#22D3EE' // Cyan
    : sessionTimer.isRunning
    ? '#3B82F6' // Accent Primary (Blue)
    : '#F59E0B'; // Amber

  const themeClass = sessionTimer.isBreak
    ? 'text-cyan-400 border-cyan-500/20'
    : sessionTimer.isRunning
    ? 'text-accent-primary border-accent-primary/20'
    : 'text-amber-500 border-amber-500/20';

  const shadowClass = sessionTimer.isBreak
    ? 'shadow-cyan-glow'
    : sessionTimer.isRunning
    ? 'shadow-primary-glow'
    : 'shadow-amber-glow';

  const timerProgress = sessionTimer.durationMinutes > 0
    ? (sessionTimer.timeLeftSeconds / (sessionTimer.durationMinutes * 60)) * 100
    : 100;

  // Circular progress calculations
  const radius = 42;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timerProgress / 100) * circumference;

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

  const handleToggleControls = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) return;
    setShowControls(!showControls);
  };

  return (
    <div 
      className="fixed top-[72px] right-4 sm:right-6 sm:top-6 z-50 select-none animate-fade-in no-print"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        touchAction: 'none'
      }}
    >
      {/* Outer wrapper for hover states */}
      <div 
        className="relative flex items-center justify-end"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
        onClick={handleToggleControls}
      >
        {/* Dynamic Frosted Slide-out Controls Dock */}
        <div 
          className={`flex items-center gap-2 bg-navy-900/90 backdrop-blur-xl border border-navy-450/60 p-2 rounded-full shadow-lg transition-all duration-300 absolute right-[105%] top-1/2 -translate-y-1/2 ${
            showControls 
              ? 'opacity-100 translate-x-0 pointer-events-auto' 
              : 'opacity-0 translate-x-4 pointer-events-none'
          }`}
        >
          {sessionTimer.isRunning ? (
            <button
              onClick={pauseTimer}
              className="p-2 rounded-full bg-navy-850 hover:bg-navy-850/80 border border-navy-700 text-slate-350 hover:text-white transition-all hover:scale-105 active:scale-95"
              title="Pause Session"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={resumeTimer}
              className="p-2 rounded-full bg-accent-primary hover:bg-accent-primary-dim text-navy-950 font-bold transition-all hover:scale-105 active:scale-95 shadow-primary-glow-sm"
              title="Resume Session"
            >
              <Play className="w-3.5 h-3.5 fill-navy-950" />
            </button>
          )}

          {!sessionTimer.isBreak && (
            <button
              onClick={() => startBreakTimer(10)}
              className="p-2 rounded-full bg-navy-850 hover:bg-navy-850/80 border border-navy-700 text-cyan-400 transition-all hover:scale-105 active:scale-95"
              title="Take 10 Min Break"
            >
              <Coffee className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => endSessionTimer('ended')}
            className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 transition-all hover:scale-105 active:scale-95"
            title="End Session"
          >
            <Square className="w-3.5 h-3.5 fill-red-400" />
          </button>
        </div>

        {/* Circular Glassmorphic Main Dial */}
        <div 
          className={`w-28 h-28 rounded-full bg-navy-900/80 backdrop-blur-xl border border-navy-450/60 flex items-center justify-center relative ${shadowClass} cursor-grab active:cursor-grabbing hover:scale-102 transition-all duration-300`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* SVG Progress Circle */}
          <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle 
              cx="50" 
              cy="50" 
              r={radius} 
              fill="none" 
              stroke="#070a14/40" 
              strokeWidth={strokeWidth} 
            />
            <circle 
              cx="50" 
              cy="50" 
              r={radius} 
              fill="none" 
              stroke={themeColor} 
              strokeWidth={strokeWidth} 
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>

          {/* Time & State Text */}
          <div className="flex flex-col items-center justify-center text-center z-10 select-none">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 font-mono">
              {modeText}
            </span>
            <span className="text-xl font-bold font-mono text-white leading-none mt-1.5 tabular-nums">
              {minutes}:{seconds}
            </span>
            
            <div className="flex items-center gap-1 mt-1.5 text-slate-500">
              <GripVertical className="w-3 h-3 hover:text-slate-350" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
