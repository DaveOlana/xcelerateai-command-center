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

export default function Layout() {
  const [showMore, setShowMore] = useState(false);
  const location = useLocation();
  const { settings } = useApp();
  
  const isCollapsed = settings?.sidebarCollapsed || false;

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
      <Sidebar />

      {/* Mobile Header */}
      <MobileHeader />

      {/* Main Content */}
      <main className={`min-h-screen transition-all duration-300 ${isCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[280px]'}`}>
        {/* Top padding for mobile header */}
        <div className="pt-[60px] lg:pt-0 pb-24 lg:pb-0">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto animate-fade-in">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </div>
      </main>

      {/* Global Command Palette */}
      <CommandPalette />


      {/* Mobile Bottom Nav */}
      <BottomNav />

      {/* Mobile More Menu */}
      {showMore && <MoreMenu onClose={() => window.history.back()} />}

      {/* Onboarding Wizard */}
      <Onboarding />
      <OnboardingTour />
    </div>
  );
}
