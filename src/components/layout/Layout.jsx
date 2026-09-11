import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext.jsx';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import MobileHeader from './MobileHeader';
import Onboarding from '../features/Onboarding';
import ErrorBoundary from '../common/ErrorBoundary';
import CommandPalette from '../common/CommandPalette';
import SessionSwitchConfirmation from '../features/SessionSwitchConfirmation';
import { shouldRenderExclusiveOnboarding } from '../../utils/learningExperience.js';

export default function Layout() {
  const { settings, onboardingCompleted } = useApp();
  const auth = useAuth();

  if (!auth.hasLearnerAccess) {
    return (
      <div className="theme-transition min-h-screen bg-bg-app bg-grid text-text-primary">
        <header className="border-b border-border-divider bg-bg-surface/90 px-5 backdrop-blur sm:px-8">
          <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between gap-5">
            <Link to="/" className="flex items-center gap-3" aria-label="XcelerateAI home">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-default bg-bg-soft"><img src="/xcelerate-icon.png" alt="" className="h-5 w-5 object-contain" /></span>
              <span><span className="block text-sm font-extrabold text-text-primary">XcelerateAI</span><span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Learning OS</span></span>
            </Link>
            <nav className="flex items-center gap-2 text-sm font-semibold" aria-label="Guest navigation">
              <Link to="/curricula" className="rounded-lg px-3 py-2 text-text-secondary hover:bg-bg-soft hover:text-text-primary">Catalog</Link>
              <Link to="/settings" className="hidden rounded-lg px-3 py-2 text-text-secondary hover:bg-bg-soft hover:text-text-primary sm:inline-flex">Settings</Link>
              {!auth.user && <Link to="/auth/login" className="btn-secondary px-3 py-2">Sign in</Link>}
              {!auth.user && <Link to="/auth/register" className="btn-primary hidden px-3 py-2 sm:inline-flex">Create account</Link>}
            </nav>
          </div>
        </header>
        <main><ErrorBoundary><Outlet /></ErrorBoundary></main>
      </div>
    );
  }

  if (shouldRenderExclusiveOnboarding(onboardingCompleted)) {
    return <Onboarding />;
  }
  
  const isCollapsed = settings?.sidebarCollapsed || false;
  return (
    <div className="theme-transition min-h-screen bg-bg-app bg-grid text-text-primary">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Header */}
      <MobileHeader />

      {/* Main Content */}
      <main className={`min-h-screen transition-all duration-300 ${isCollapsed ? 'lg:ml-[76px]' : 'lg:ml-[256px]'}`}>
        {/* Top padding for mobile header */}
        <div className="pb-28 pt-[64px] lg:pb-0 lg:pt-0">
          <div className="mx-auto max-w-[1240px] animate-fade-in">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </div>
      </main>

      {/* Interruption confirmation overlay */}
      <SessionSwitchConfirmation />

      {/* Global Command Palette */}
      <CommandPalette />


      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
}
