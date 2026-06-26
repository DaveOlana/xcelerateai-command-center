import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Target, Calendar, BarChart2, Upload,
  Clock, BookOpen, FolderKanban, FileText, CheckSquare,
  Settings, Flame, ChevronRight, ChevronLeft, AlertCircle, Award, Shield
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getBootcampDay } from '../../utils/dateUtils';
import { calculateOverallProgress } from '../../utils/progressCalculator';

const navGroups = [
  {
    title: "Workspace Core",
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { to: '/today', label: "Today's Focus", icon: Target },
      { to: '/missions', label: 'Weekly Missions', icon: Calendar },
      { to: '/progress', label: 'Progress', icon: BarChart2 },
    ]
  },
  {
    title: "Evidence & Logs",
    items: [
      { to: '/proof', label: 'Proof of Work', icon: Award },
      { to: '/blockers', label: 'Blockers Journal', icon: AlertCircle },
      { to: '/notes', label: 'Notes Journal', icon: FileText },
      { to: '/checkpoints', label: 'Checkpoints', icon: CheckSquare },
    ]
  },
  {
    title: "Roadmap Assets",
    items: [
      { to: '/timeline', label: 'Timeline', icon: Clock },
      { to: '/resources', label: 'Resource Vault', icon: BookOpen },
      { to: '/projects', label: 'Project Tracker', icon: FolderKanban },
      { to: '/side-quests', label: 'Side Quests', icon: Shield },
    ]
  },
  {
    title: "System",
    items: [
      { to: '/import', label: 'Load Roadmap', icon: Upload },
      { to: '/settings', label: 'Settings', icon: Settings },
    ]
  }
];

export default function Sidebar() {
  const { roadmap, streak, settings, checkpointStatuses, progress, updateSettings, userProfile } = useApp();
  const bootcampDay = getBootcampDay(settings?.startDate);
  
  const isCollapsed = settings?.sidebarCollapsed || false;

  const toggleSidebar = () => {
    updateSettings({ sidebarCollapsed: !isCollapsed });
  };

  // Compute progress for a compact monitor
  const progScore = React.useMemo(() => {
    if (!roadmap) return 0;
    const computed = calculateOverallProgress(roadmap, progress, checkpointStatuses);
    return computed.overall;
  }, [roadmap, progress, checkpointStatuses]);

  return (
    <aside 
      data-tour="sidebar"
      className={`hidden lg:flex flex-col h-screen bg-navy-900 border-r border-navy-700/25 fixed left-0 top-0 z-40 transition-all duration-300 ${isCollapsed ? 'w-[80px]' : 'w-[280px]'}`}
    >
      
      {/* Collapse Toggle */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 w-6 h-6 bg-navy-850 border border-navy-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-navy-850 z-50 transition-all"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Header / Brand */}
      <div className={`py-6 border-b border-navy-700/20 flex flex-col ${isCollapsed ? 'px-3 items-center' : 'px-6'}`}>
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 flex-shrink-0" title="XcelerateAI Command Center">
            <img src="/xcelerate-icon.png" alt="Xcelerate" className="w-6 h-6 object-contain" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 transition-opacity duration-300">
              <p className="text-[16px] font-extrabold text-white tracking-tight truncate">XcelerateAI</p>
              <p className="text-[12px] text-slate-400 font-medium truncate">Bootcamp Cockpit</p>
            </div>
          )}
        </div>

        {/* Operator Card */}
        {(() => {
          const operatorName = userProfile?.displayName || userProfile?.name || roadmap?.learner || 'Operator';
          const initial = operatorName.charAt(0).toUpperCase();
          return (
            <div className={`mt-5 bg-navy-850 border border-navy-700/30 rounded-xl flex items-center gap-3 transition-all ${isCollapsed ? 'p-2 justify-center' : 'p-3.5'}`} title={`Operator: ${operatorName}`}>
              <div className="w-10 h-10 rounded-full bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary text-sm font-bold flex-shrink-0">
                {initial}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 transition-opacity duration-300">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Operator</span>
                  <p className="text-sm font-bold text-slate-200 truncate">{operatorName}</p>
                </div>
              )}
            </div>
          );
        })()}

        {/* Load Custom JSON Button */}
        {!isCollapsed && (
          <div className="mt-4 transition-opacity duration-300">
            <NavLink
              to="/import"
              className="flex flex-col gap-1 w-full text-left p-3 rounded-xl border border-accent-cyan/20 bg-accent-cyan/5 hover:bg-accent-cyan/10 transition-all group"
            >
              <span className="text-[13px] font-bold text-accent-cyan flex items-center gap-2">
                 Load Roadmap
              </span>
              <span className="text-[12px] text-slate-400">
                Import bootcamp data JSON
              </span>
            </NavLink>
          </div>
        )}
      </div>

      {/* Navigation Scrollbox */}
      <nav className={`flex-1 py-5 space-y-6 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-4'}`}>
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            {!isCollapsed ? (
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 px-3 mb-2">{group.title}</p>
            ) : (
              <div className="w-full h-px bg-navy-700/20 my-4" />
            )}
            {group.items.map(({ to, label, icon: Icon, exact }) => {
              let tourAttr = undefined;
              if (to === '/') tourAttr = 'sidebar-dashboard';
              else if (to === '/today') tourAttr = 'sidebar-today';
              else if (to === '/missions') tourAttr = 'sidebar-missions';
              else if (to === '/progress') tourAttr = 'sidebar-progress';
              else if (to === '/import') tourAttr = 'sidebar-import';
              else if (to === '/settings') tourAttr = 'sidebar-settings';
              else if (to === '/projects') tourAttr = 'sidebar-projects';

              return (
                <NavLink
                  key={to}
                  to={to}
                  end={exact}
                  title={isCollapsed ? label : undefined}
                  data-tour={tourAttr}
                className={({ isActive }) =>
                  `flex items-center rounded-lg font-medium transition-all duration-200 group relative ${
                    isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5 text-[14px]'
                  } ${
                    isActive
                      ? 'bg-accent-primary/10 text-white border-l-[3px] border-accent-primary font-semibold ' + (isCollapsed ? 'pl-[9px]' : 'pl-[9px]')
                      : 'text-slate-450 hover:text-slate-200 hover:bg-navy-850/50 border-l-[3px] border-transparent ' + (isCollapsed ? 'pl-3' : 'pl-[9px]')
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-accent-primary' : 'text-slate-550 group-hover:text-slate-350'}`} />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 whitespace-nowrap">{label}</span>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-55 text-accent-primary" />}
                      </>
                    )}
                  </>
                )}
              </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* System Status Foot Monitor */}
      {!isCollapsed && (
        <div className="p-5 border-t border-navy-700/25 bg-navy-900 transition-opacity duration-300">
          <div className="space-y-2.5 text-[12px] text-slate-450 font-medium">
            <div className="flex justify-between items-center">
              <span>System</span>
              <span className="text-emerald-400 flex items-center gap-1.5 text-[13px] font-bold tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </span>
            </div>
            {settings?.startDate && (
              <div className="flex justify-between items-center">
                <span>Day Index</span>
                <span className="text-white font-semibold">Day {bootcampDay || 1}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span>Study Streak</span>
              <span className="text-amber-450 font-semibold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                {streak.currentStreak} Day{streak.currentStreak !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="pt-2 mt-2 border-t border-navy-750">
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-slate-500">Progress</span>
                <span className="text-accent-primary font-bold">{progScore}%</span>
              </div>
              <div className="w-full h-1.5 bg-navy-850 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className="h-full bg-accent-primary transition-all duration-1000"
                  style={{ width: `${progScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
