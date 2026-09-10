import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { workspaceNavigationItems } from '../config/navigation';
import { PageShell } from '../components/common/UIComponents';

export default function Workspace() {
  return (
    <PageShell className="!space-y-7">
      <header>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight text-text-primary lg:text-3xl">Workspace</h1>
        <p className="mt-1 text-sm text-text-secondary">Your projects, learning notes, problems, and evidence—together in one personal workbench.</p>
      </header>

      <nav className="overflow-x-auto rounded-2xl border border-border-default bg-bg-surface/90 p-1.5 shadow-sm backdrop-blur-xl" aria-label="Workspace sections">
        <div className="flex min-w-max gap-1">
        {workspaceNavigationItems.map(({ id, label, route, icon: Icon }) => (
          <NavLink
            key={id}
            to={route}
            className={({ isActive }) =>
              `inline-flex min-h-10 min-w-[118px] items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet ${
                isActive
                  ? 'bg-brand-violet text-on-brand shadow-primary-glow-sm'
                  : 'text-text-secondary hover:bg-bg-soft hover:text-text-primary'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
        </div>
      </nav>

      <Outlet />
    </PageShell>
  );
}
