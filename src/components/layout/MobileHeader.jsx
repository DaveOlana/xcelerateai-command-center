import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Flame } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function MobileHeader() {
  const { streak, roadmap } = useApp();
  const location = useLocation();

  const titles = {
    '/': 'Dashboard',
    '/today': "Today's Focus",
    '/missions': 'Weekly Missions',
    '/progress': 'Progress',
    '/timeline': 'Timeline',
    '/resources': 'Resource Vault',
    '/projects': 'Project Tracker',
    '/notes': 'Notes Journal',
    '/checkpoints': 'Checkpoints',
    '/import': 'Import Roadmap',
    '/settings': 'Settings',
    '/more': 'More',
  };

  const currentTitle = titles[location.pathname] || 'XcelerateAI';

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-navy-800/95 backdrop-blur-md border-b border-navy-400">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
            <img src="/xcelerate-icon.png" alt="XcelerateAI" className="w-5 h-5 object-contain" />
          </div>
          <div>
            <p className="text-xs font-bold text-accent-primary tracking-widest uppercase leading-none">XcelerateAI</p>
            <p className="text-sm font-semibold text-white leading-tight">{currentTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-orange-400 font-bold text-sm">{streak.currentStreak}</span>
          <span className="text-orange-400/60 text-[13px]">streak</span>
        </div>
      </div>
    </header>
  );
}
