import React from 'react';
import { useLocation } from 'react-router-dom';
import { getNavigationItemForPath } from '../../config/navigation';

export default function MobileHeader() {
  const location = useLocation();

  const currentTitle = getNavigationItemForPath(location.pathname)?.pageTitle || 'XcelerateAI';

  return (
    <header className="glass-surface fixed left-0 right-0 top-0 z-40 border-b border-border-default lg:hidden">
      <div className="flex min-h-16 items-center px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl border border-border-default bg-bg-surface shadow-sm">
            <img src="/xcelerate-icon.png" alt="XcelerateAI" className="w-5 h-5 object-contain" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase leading-none tracking-[0.18em] text-accent-primary">XcelerateAI</p>
            <p className="mt-1 text-sm font-semibold leading-tight text-text-primary">{currentTitle}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
