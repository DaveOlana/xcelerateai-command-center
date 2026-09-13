import React from 'react';
import { Link } from 'react-router-dom';

export default function AuthShell({ eyebrow, title, description, children, footer }) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center px-5 py-12">
      <section className="w-full rounded-[28px] border border-border-default bg-bg-surface p-6 shadow-card sm:p-9">
        <Link to="/" className="text-xs font-bold uppercase tracking-[0.16em] text-brand-blue">XcelerateAI</Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.14em] text-text-muted">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-text-primary">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">{description}</p>
        <div className="mt-7">{children}</div>
        {footer && <div className="mt-7 border-t border-border-divider pt-5 text-sm text-text-secondary">{footer}</div>}
      </section>
    </div>
  );
}
