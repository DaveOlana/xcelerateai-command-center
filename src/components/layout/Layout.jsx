import React from 'react';
import { Outlet } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
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
