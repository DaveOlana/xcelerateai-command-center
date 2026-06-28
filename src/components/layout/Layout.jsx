import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import MobileHeader from './MobileHeader';
import MoreMenu from './MoreMenu';
import Onboarding from '../features/Onboarding';
import OnboardingTour from '../features/OnboardingTour';
import ErrorBoundary from '../common/ErrorBoundary';
import CommandPalette from '../common/CommandPalette';
import FloatingTimer from '../features/FloatingTimer';
import SessionSwitchConfirmation from '../features/SessionSwitchConfirmation';

export default function Layout() {
  const [showMore, setShowMore] = useState(false);
  const location = useLocation();
  const { settings, sessionTimer } = useApp();
  
  const isCollapsed = settings?.sidebarCollapsed || false;
  const isFocusMode = sessionTimer?.activeSessionId && location.pathname === '/today';

  // Toggle more menu when /more route is active on mobile
  React.useEffect(() => {
    if (location.pathname === '/more') {
      setShowMore(true);
    } else {
      setShowMore(false);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-navy-950 bg-grid">
      {/* Desktop Sidebar */}
      {!isFocusMode && <Sidebar />}

      {/* Mobile Header */}
      {!isFocusMode && <MobileHeader />}

      {/* Main Content */}
      <main className={`min-h-screen transition-all duration-300 ${isFocusMode ? 'ml-0' : isCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[280px]'}`}>
        {/* Top padding for mobile header */}
        <div className={isFocusMode ? 'p-4 lg:p-8' : 'pt-[60px] lg:pt-0 pb-32 lg:pb-0'}>
          <div className={`${isFocusMode ? '' : 'p-4 lg:p-8'} max-w-7xl mx-auto animate-fade-in`}>
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </div>
      </main>

      {/* Global Floating Timer UI */}
      {location.pathname !== '/' && <FloatingTimer />}

      {/* Interruption confirmation overlay */}
      <SessionSwitchConfirmation />

      {/* Global Command Palette */}
      <CommandPalette />


      {/* Mobile Bottom Nav */}
      {!isFocusMode && <BottomNav />}

      {/* Mobile More Menu */}
      {showMore && <MoreMenu onClose={() => window.history.back()} />}

      {/* Onboarding Wizard */}
      <Onboarding />
      <OnboardingTour />
    </div>
  );
}
