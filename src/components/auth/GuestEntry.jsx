import React from 'react';
import { ArrowRight, BookOpen, LogIn, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function GuestEntry({ restricted = false }) {
  const auth = useAuth();
  const conflict = auth.accessMode === 'account-conflict';
  const unverified = auth.accessMode === 'unverified';

  const title = conflict
    ? 'This device belongs to another local learner.'
    : unverified
      ? 'Confirm your email to activate your Learning OS.'
      : restricted
        ? 'Sign in to continue learning.'
        : 'Build professional capability with intent.';
  const description = conflict
    ? 'The local learning record is safely preserved and has not been exposed, deleted, merged, or reassigned. Sign in with the account that first claimed this browser.'
    : unverified
      ? 'Your account exists, but learner progress stays locked until the email address is verified.'
      : 'Explore published curricula freely. A verified account activates Missions, Skill Checks, Builds, Proof, Progress, and your private Workspace.';

  return (
    <div className="flex min-h-[calc(100vh-72px)] items-center px-5 py-12 sm:px-8">
      <section className="mx-auto w-full max-w-5xl overflow-hidden rounded-[30px] border border-border-default bg-bg-surface shadow-card">
        <div className="grid lg:grid-cols-[1.08fr_.92fr]">
          <div className="p-8 sm:p-12 lg:p-14">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-violet">XcelerateAI · Learning OS</p>
            <h1 className="mt-5 max-w-2xl font-heading text-4xl font-extrabold tracking-tight text-text-primary sm:text-5xl">{title}</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-text-secondary">{description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {!conflict && !unverified && <Link to="/auth/register" className="btn-primary justify-center gap-2 px-5 py-3 text-sm">Create account <ArrowRight className="h-4 w-4" /></Link>}
              {!conflict && <Link to={unverified ? '/auth/verify' : '/auth/login'} className="btn-secondary justify-center gap-2 px-5 py-3 text-sm">{unverified ? <ShieldCheck className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}{unverified ? 'Open verification' : 'Sign in'}</Link>}
              <Link to="/curricula" className="btn-secondary justify-center gap-2 px-5 py-3 text-sm"><BookOpen className="h-4 w-4" /> Explore curricula</Link>
              {conflict && <Link to="/settings" className="btn-primary justify-center px-5 py-3 text-sm">Resolve in Settings</Link>}
            </div>
          </div>
          <div className="border-t border-border-divider bg-bg-soft p-8 sm:p-12 lg:border-l lg:border-t-0 lg:p-14">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-text-muted">Verified learner journey</p>
            <ol className="mt-8 space-y-6">
              {[
                ['01', 'Learn', 'Open focused resources and mark real study activity.'],
                ['02', 'Practice', 'Demonstrate understanding through graded skill checks.'],
                ['03', 'Build', 'Turn capability into working professional projects.'],
                ['04', 'Prove', 'Record evidence and reflect on what you can now do.'],
              ].map(([number, label, copy]) => <li key={label} className="flex gap-4"><span className="font-mono text-xs font-bold text-brand-violet">{number}</span><div><p className="font-bold text-text-primary">{label}</p><p className="mt-1 text-sm leading-relaxed text-text-muted">{copy}</p></div></li>)}
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}
