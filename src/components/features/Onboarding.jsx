import React, { useState } from 'react';
import { ArrowRight, BookOpen, Code2, Hammer, ShieldCheck, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ONBOARDING_DESTINATION } from '../../utils/learningExperience.js';

const LEARNING_LOOP = [
  { label: 'Learn', icon: BookOpen },
  { label: 'Practice', icon: Code2 },
  { label: 'Build', icon: Hammer },
  { label: 'Prove', icon: ShieldCheck },
];

export default function Onboarding() {
  const { onboardingCompleted, completeOnboarding, userProfile } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState(userProfile?.displayName || userProfile?.name || '');
  const [error, setError] = useState('');

  if (onboardingCompleted) return null;

  const startLearning = (event) => {
    event.preventDefault();
    const learnerName = name.trim();
    if (!learnerName) {
      setError('Enter your display name to continue.');
      return;
    }
    completeOnboarding(learnerName, learnerName);
    localStorage.setItem('xai_setup_completed_v1', 'true');
    navigate(ONBOARDING_DESTINATION, { replace: true });
  };

  return (
    <div className="theme-transition relative min-h-screen overflow-x-hidden bg-bg-app text-text-primary">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(145deg,var(--bg-app)_0%,var(--bg-page)_52%,var(--bg-app)_100%)]" aria-hidden="true" />
      <main className="relative mx-auto flex min-h-screen w-full max-w-[1320px] items-center px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-16 xl:px-16">
        <div className="grid w-full items-center gap-12 motion-safe:animate-fade-in md:gap-14 lg:grid-cols-[minmax(0,1.16fr)_minmax(400px,0.94fr)] lg:gap-20 xl:gap-24">
          <section className="max-w-[620px] lg:pr-4" aria-labelledby="onboarding-title">
            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border-default bg-bg-surface shadow-sm">
                <img src="/xcelerate-icon.png" alt="" className="h-7 w-7 object-contain" />
              </span>
              <div>
                <p className="font-heading text-lg font-extrabold tracking-[-0.02em] text-text-primary">XcelerateAI</p>
                <p className="mt-0.5 text-xs font-medium tracking-[0.08em] text-text-muted">Learning OS</p>
              </div>
            </div>
            <div className="mt-12 h-px w-16 bg-border-strong sm:mt-14" aria-hidden="true" />
            <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-violet">Welcome</p>
            <h1 id="onboarding-title" className="mt-3 max-w-[590px] font-heading text-[clamp(2.35rem,3.4vw,2.875rem)] font-extrabold leading-[1.1] tracking-[-0.035em] text-text-primary">
              Build practical skill through purposeful work.
            </h1>
            <p className="mt-5 max-w-[540px] text-[15px] leading-7 text-text-secondary sm:text-base">
              Follow a guided course, practice what you learn, create meaningful projects, and keep evidence of your progress.
            </p>
          </section>

          <section className="w-full rounded-[30px] border border-border-default bg-bg-surface p-6 shadow-[var(--surface-card-shadow)] sm:p-8 lg:p-9" aria-labelledby="profile-setup-title">
            <form onSubmit={startLearning}>
              <header className="border-b border-border-divider pb-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-blue">Profile setup</p>
                <h2 id="profile-setup-title" className="mt-2 font-heading text-2xl font-extrabold tracking-[-0.025em] text-text-primary">Make this space yours.</h2>
                <p className="mt-2 text-sm leading-6 text-text-secondary">One detail before you enter your learning environment.</p>
              </header>

              <div className="pt-6">
                <label htmlFor="first-run-name" className="text-sm font-bold text-text-primary">Display name</label>
                <p id="first-run-name-help" className="mt-1.5 text-xs leading-5 text-text-muted">How XcelerateAI should address you.</p>
                <div className="relative mt-3.5">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-muted" aria-hidden="true" />
                  <input
                    id="first-run-name"
                    type="text"
                    value={name}
                    onChange={(event) => { setName(event.target.value); setError(''); }}
                    className="min-h-[52px] w-full rounded-xl border border-border-default bg-bg-soft py-3 pl-11 pr-4 text-[15px] text-text-primary outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-text-disabled hover:border-border-strong focus:border-border-focus focus:bg-bg-surface focus:ring-4 focus:ring-brand-blue/10 motion-reduce:transition-none"
                    placeholder="Enter your name"
                    autoFocus
                    required
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'first-run-name-help first-run-name-error' : 'first-run-name-help'}
                  />
                </div>
                {error && <p id="first-run-name-error" role="alert" className="mt-2 text-xs font-medium text-red-500">{error}</p>}
              </div>

              <div className="mt-7 border-t border-border-divider pt-6">
                <p className="text-xs font-bold tracking-wide text-text-secondary">Your learning journey</p>
                <div className="relative mt-5">
                  <div className="absolute left-[12.5%] right-[12.5%] top-5 h-px bg-border-strong" aria-hidden="true" />
                  <ol className="relative grid grid-cols-4 gap-1" aria-label="Learn, Practice, Build, Prove">
                    {LEARNING_LOOP.map(({ label, icon: Icon }) => (
                      <li key={label} className="group flex min-w-0 flex-col items-center text-center">
                        <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-brand-blue/20 bg-bg-surface text-brand-blue shadow-sm transition-transform duration-200 motion-safe:group-hover:-translate-y-0.5 motion-reduce:transition-none">
                          <Icon className="h-[17px] w-[17px]" aria-hidden="true" />
                        </span>
                        <span className="mt-2.5 text-[11px] font-semibold text-text-secondary sm:text-xs">{label}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <button type="submit" className="group mt-8 flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-accent-primary px-5 py-3 text-sm font-bold text-[var(--text-on-brand)] shadow-[0_10px_24px_rgb(var(--accent-primary)/0.18)] transition-[background-color,box-shadow,transform] duration-200 hover:bg-accent-primary-dim hover:shadow-[0_12px_28px_rgb(var(--accent-primary)/0.24)] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface motion-reduce:transition-none">
                <span>Continue to curriculum catalog</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(255,255,255,0.14)] transition-transform duration-200 motion-safe:group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
