import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  isNavigationItemActive,
  mobileBottomNavigationItems,
} from '../../config/navigation';

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="glass-surface mobile-nav-safe fixed bottom-0 left-0 right-0 z-50 border-t border-border-default lg:hidden">
      <div className="flex items-center justify-around px-2 pb-2 pt-2">
        {mobileBottomNavigationItems.map((item) => {
          const { id, route, label, icon: Icon } = item;
          const isActive = isNavigationItemActive(item, location.pathname);

          return (
          <Link
            key={id}
            to={route}
            className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 transition-all duration-200 ${
                isActive
                  ? 'text-accent-primary'
                  : 'text-text-muted hover:text-text-primary'
              }`}
          >
              <>
                <div className={`rounded-xl px-3 py-1.5 transition-all duration-200 ${isActive ? 'bg-accent-primary/10 ring-1 ring-accent-primary/15' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold leading-none">{label}</span>
              </>
          </Link>
          );
        })}
      </div>
    </nav>
  );
}
