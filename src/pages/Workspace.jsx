import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { workspaceNavigationItems } from '../config/navigation';

export default function Workspace() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Workspace</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your projects, notes, problems, and proof.</p>
      </div>

      <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Workspace sections">
        {workspaceNavigationItems.map(({ id, label, route, icon: Icon }) => (
          <NavLink
            key={id}
            to={route}
            className={({ isActive }) =>
              `inline-flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20'
                  : 'text-slate-400 border border-navy-500/30 hover:text-white hover:bg-navy-800'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  );
}

