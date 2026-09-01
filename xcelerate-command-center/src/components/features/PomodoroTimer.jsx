import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';

const MODES = {
  WORK: { label: 'Focus', duration: 25 * 60, color: '#3b82f6' },
  BREAK: { label: 'Break', duration: 5 * 60, color: '#00d4ff' },
};

export default function PomodoroTimer() {
  const [mode, setMode] = useState('WORK');
  const [secondsLeft, setSecondsLeft] = useState(MODES.WORK.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const intervalRef = useRef(null);

  const currentMode = MODES[mode];
  const totalSeconds = currentMode.duration;
  const progress = (secondsLeft / totalSeconds) * 100;

  // SVG ring props
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setSecondsLeft(currentMode.duration);
  }, [currentMode.duration]);

  const toggleMode = useCallback((newMode) => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setMode(newMode);
    setSecondsLeft(MODES[newMode].duration);
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            // Auto-switch mode
            if (mode === 'WORK') {
              setSessionsCompleted((s) => s + 1);
              setMode('BREAK');
              setSecondsLeft(MODES.BREAK.duration);
            } else {
              setMode('WORK');
              setSecondsLeft(MODES.WORK.duration);
            }
            // Browser notification if permitted
            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
              new Notification(
                mode === 'WORK' ? ' Focus session complete! Take a break.' : ' Break over. Back to work!'
              );
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode]);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="card flex flex-col items-center gap-5">
      {/* Mode Tabs */}
      <div className="flex gap-2 w-full">
        <button
          onClick={() => toggleMode('WORK')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            mode === 'WORK'
              ? 'bg-accent-primary/15 text-accent-primary border border-accent-primary/30'
              : 'bg-navy-800 text-slate-500 border border-navy-400 hover:text-slate-300'
          }`}
        >
          <Brain className="w-4 h-4" />
          Focus (25m)
        </button>
        <button
          onClick={() => toggleMode('BREAK')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            mode === 'BREAK'
              ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30'
              : 'bg-navy-800 text-slate-500 border border-navy-400 hover:text-slate-300'
          }`}
        >
          <Coffee className="w-4 h-4" />
          Break (5m)
        </button>
      </div>

      {/* Ring Timer */}
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          {/* Track */}
          <circle
            cx="64" cy="64" r={radius}
            fill="none"
            stroke="#112240"
            strokeWidth="8"
          />
          {/* Progress */}
          <circle
            cx="64" cy="64" r={radius}
            fill="none"
            stroke={currentMode.color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="pomodoro-progress"
            style={{ filter: `drop-shadow(0 0 6px ${currentMode.color}60)` }}
          />
        </svg>

        {/* Time Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-3xl font-bold font-mono text-white tabular-nums">
            {minutes}:{seconds}
          </p>
          <p className="text-[13px] text-slate-500 uppercase tracking-widest mt-0.5">
            {currentMode.label}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="w-10 h-10 rounded-full bg-navy-700 border border-navy-400 flex items-center justify-center
                     text-slate-400 hover:text-white hover:border-navy-300 transition-all duration-200 active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsRunning((r) => !r)}
          className="w-14 h-14 rounded-full flex items-center justify-center font-semibold
                     transition-all duration-200 active:scale-95 shadow-primary-glow"
          style={{
            backgroundColor: currentMode.color,
            color: '#050d1a',
          }}
        >
          {isRunning
            ? <Pause className="w-5 h-5" />
            : <Play className="w-5 h-5 ml-0.5" />
          }
        </button>
      </div>

      {/* Sessions counter */}
      {sessionsCompleted > 0 && (
        <div className="flex items-center gap-2">
          {Array.from({ length: Math.min(sessionsCompleted, 8) }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-accent-primary"
              style={{ opacity: i < sessionsCompleted ? 1 : 0.2 }}
            />
          ))}
          <span className="text-xs text-slate-500 ml-1">
            {sessionsCompleted} session{sessionsCompleted !== 1 ? 's' : ''} today
          </span>
        </div>
      )}

      {isRunning && (
        <p className="text-xs text-slate-600 text-center">
          {mode === 'WORK'
            ? ' Stay focused. Distractions can wait.'
            : '☕ Step away. Rest is part of learning.'}
        </p>
      )}
    </div>
  );
}
