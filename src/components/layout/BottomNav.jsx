import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Target, Calendar, BarChart2, MoreHorizontal } from 'lucide-react';

const bottomNavItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/today', label: 'Today', icon: Target },
  { to: '/missions', label: 'Missions', icon: Calendar },
  { to: '/progress', label: 'Progress', icon: BarChart2 },
  { to: '/more', label: 'More', icon: MoreHorizontal },
];

export default function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-navy-800 border-t border-navy-400 mobile-nav-safe">
      <div className="flex items-center justify-around px-2 pt-2 pb-2">
        {bottomNavItems.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-0 ${
                isActive
                  ? 'text-accent-primary'
                  : 'text-slate-500 hover:text-slate-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-lg transition-all duration-200 ${isActive ? 'bg-accent-primary/15' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[13px] font-medium leading-none">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
