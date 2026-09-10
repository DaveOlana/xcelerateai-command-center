import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  coreSidebarItems,
  isNavigationItemActive,
  temporarySidebarItems,
  utilitySidebarItems,
} from '../../config/navigation';

function SidebarLink({ item, isCollapsed, pathname, subdued = false }) {
  const { route, label, icon: Icon } = item;
  const isActive = isNavigationItemActive(item, pathname);

  return (
    <Link
      to={route}
      title={isCollapsed ? label : undefined}
      className={`group relative flex items-center rounded-xl font-medium transition-all duration-200 ${
        isCollapsed ? 'mx-auto h-11 w-11 justify-center' : 'gap-3 px-3.5 py-2.5 text-[14px]'
      } ${
        isActive
          ? 'bg-accent-primary/10 text-text-primary ring-1 ring-accent-primary/15 font-semibold'
          : subdued
            ? 'text-text-muted hover:bg-bg-elevated/60 hover:text-text-secondary'
            : 'text-text-secondary hover:bg-bg-elevated/70 hover:text-text-primary'
      }`}
    >
      <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${
        isActive
          ? 'text-accent-primary'
          : subdued
            ? 'text-text-disabled group-hover:text-text-muted'
            : 'text-text-muted group-hover:text-text-primary'
      }`} />
      {!isCollapsed && (
        <>
          <span className="flex-1 whitespace-nowrap">{label}</span>
          {isActive && <span className="h-1.5 w-1.5 rounded-full bg-accent-primary" aria-hidden="true" />}
        </>
      )}
    </Link>
  );
}

export default function Sidebar() {
  const { roadmap, settings, updateSettings, userProfile } = useApp();
  const location = useLocation();
  const isCollapsed = settings?.sidebarCollapsed || false;
  const learnerName = userProfile?.displayName || userProfile?.name || roadmap?.learner || 'Learner';
  const learnerInitial = learnerName.charAt(0).toUpperCase();

  const toggleSidebar = () => {
    updateSettings({ sidebarCollapsed: !isCollapsed });
  };

  return (
    <aside
      className={`glass-surface fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-border-default transition-all duration-300 lg:flex ${isCollapsed ? 'w-[76px]' : 'w-[256px]'}`}
    >
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-7 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-border-default bg-bg-surface text-text-muted shadow-sm transition-all hover:border-border-strong hover:text-text-primary"
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      <div className={`border-b border-border-divider py-6 ${isCollapsed ? 'px-3' : 'px-5'}`}>
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-border-default bg-bg-surface shadow-sm" title="XcelerateAI Learning OS">
            <img src="/xcelerate-icon.png" alt="Xcelerate" className="w-6 h-6 object-contain" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-[16px] font-extrabold tracking-tight text-text-primary">XcelerateAI</p>
              <p className="truncate text-[12px] font-medium text-text-muted">Learning OS</p>
            </div>
          )}
        </div>
      </div>

      <nav className={`flex-1 overflow-y-auto py-5 ${isCollapsed ? 'px-2' : 'px-3'}`} aria-label="Primary navigation">
        <div className="space-y-1">
          {coreSidebarItems.map((item) => (
            <SidebarLink key={item.id} item={item} isCollapsed={isCollapsed} pathname={location.pathname} />
          ))}
        </div>

        {temporarySidebarItems.length > 0 && (
          <div className={`border-t border-border-divider ${isCollapsed ? 'mt-4 pt-4' : 'mt-5 pt-4'}`}>
            {temporarySidebarItems.map((item) => (
              <SidebarLink
                key={item.id}
                item={item}
                isCollapsed={isCollapsed}
                pathname={location.pathname}
                subdued
              />
            ))}
          </div>
        )}
      </nav>

      <div className={`border-t border-border-divider ${isCollapsed ? 'px-2 py-4' : 'px-3 py-4'}`}>
        <div className="space-y-1">
          {utilitySidebarItems.map((item) => (
            <SidebarLink key={item.id} item={item} isCollapsed={isCollapsed} pathname={location.pathname} />
          ))}
        </div>

        <div
          className={`mt-3 flex items-center border-t border-border-divider pt-3 ${isCollapsed ? 'justify-center' : 'gap-3 px-3'}`}
          title={learnerName}
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-accent-primary/20 bg-accent-primary/10 text-xs font-bold text-accent-primary">
            {learnerInitial}
          </div>
          {!isCollapsed && <p className="truncate text-sm font-medium text-text-secondary">{learnerName}</p>}
        </div>
      </div>
    </aside>
  );
}
