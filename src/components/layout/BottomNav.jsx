import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  isNavigationItemActive,
  mobileBottomNavigationItems,
} from '../../config/navigation';

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-navy-800 border-t border-navy-400 mobile-nav-safe">
      <div className="flex items-center justify-around px-2 pt-2 pb-2">
        {mobileBottomNavigationItems.map((item) => {
          const { id, route, label, icon: Icon } = item;
          const isActive = isNavigationItemActive(item, location.pathname);

          return (
          <Link
            key={id}
            to={route}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-0 ${
                isActive
                  ? 'text-accent-primary'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
          >
              <>
                <div className={`p-1.5 rounded-lg transition-all duration-200 ${isActive ? 'bg-accent-primary/15' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[13px] font-medium leading-none">{label}</span>
              </>
          </Link>
          );
        })}
      </div>
    </nav>
  );
}
