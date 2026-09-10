import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Flame,
  FolderKanban,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  calculateBuildSummary,
  calculateConsistency,
  calculateCourseProgress,
  calculateSkillSummary,
  getCheckpointStatusValue,
} from '../utils/progressCalculator';
import { getWeekStepStatus } from '../utils/unlockChecker';
import { getRoadmapIdentity } from '../utils/resourceActivity.js';
import { PageShell } from '../components/common/UIComponents';

const STATUS_OPTIONS = [
  { stored: 'Not yet', label: 'Not assessed' },
  { stored: 'Learning', label: 'Developing' },
  { stored: 'Confident', label: 'Confident' },
];

const SKILL_FILTERS = [
  { value: 'All', label: 'All' },
  { value: 'Confident', label: 'Confident' },
  { value: 'Learning', label: 'Developing' },
  { value: 'Not yet', label: 'Not assessed' },
];

function getWeeks(roadmap) {
  if (Array.isArray(roadmap?.months) && roadmap.months.length > 0) {
    return roadmap.months.flatMap((month) =>
      (month.weeks || []).map((week) => ({
        ...week,
        monthNumber: week.monthNumber ?? month.monthNumber ?? 1,
      }))
    );
  }
  return (Array.isArray(roadmap?.weeks) ? roadmap.weeks : []).map((week) => ({
    ...week,
    monthNumber: week.monthNumber ?? 1,
  }));
}

function displayStatus(status) {
  if (status === 'Confident') return 'Confident';
  if (status === 'Learning') return 'Developing';
  return 'Not assessed';
}

function statusClasses(status) {
  if (status === 'Confident') return 'border-brand-green/25 bg-brand-green/5 text-brand-green';
  if (status === 'Learning') return 'border-brand-amber/25 bg-brand-amber/5 text-brand-amber';
  return 'border-border-default bg-bg-soft text-text-muted';
}

function StatusIcon({ status, className = 'h-4 w-4' }) {
  if (status === 'Confident') return <CheckCircle2 className={`${className} text-brand-green`} />;
  if (status === 'Learning') return <TrendingUp className={`${className} text-brand-amber`} />;
  return <Circle className={`${className} text-text-muted`} />;
}

function formatFocusedTime(totalSeconds) {
  const minutes = Math.round(totalSeconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

function CourseProgressRing({ percent }) {
  const radius = 76;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div
      className="relative h-52 w-52 shrink-0 sm:h-60 sm:w-60"
      role="img"
      aria-label={`Course Progress ${percent} percent`}
    >
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id="course-progress-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgb(var(--brand-blue))" />
            <stop offset="100%" stopColor="rgb(var(--brand-violet))" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r={radius} fill="none" stroke="rgb(var(--border-default))" strokeWidth="11" />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="url(#course-progress-gradient)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500 motion-reduce:transition-none"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {percent === 100 && <CheckCircle2 className="mb-1 h-5 w-5 text-brand-green" aria-hidden="true" />}
        <span className="text-4xl font-extrabold tracking-tight text-text-primary sm:text-5xl">{percent}%</span>
        <span className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">complete</span>
      </div>
    </div>
  );
}

function Panel({ children, className = '', open = false }) {
  return (
    <section className={`${open ? 'py-3 sm:py-5' : 'rounded-[24px] border border-border-default bg-bg-surface p-5 shadow-sm sm:p-7'} ${className}`}>
      {children}
    </section>
  );
}

export default function ProgressOverview() {
  const {
    roadmap,
    progress,
    checkpointStatuses,
    setCheckpointStatus,
    settings,
    streak,
    resourcesStatus,
    skillChecks,
    skillCheckAttempts,
    practicalMissions,
    weekProofs,
    weekReflections,
    timerHistory,
  } = useApp();
  const [skillFilter, setSkillFilter] = useState('All');
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [evidenceDraft, setEvidenceDraft] = useState({ explanation: '', link: '', projectProof: '' });

  const weeks = useMemo(() => getWeeks(roadmap), [roadmap]);
  const courseProgress = useMemo(() => calculateCourseProgress(roadmap, progress), [roadmap, progress]);
  const skillSummary = useMemo(() => calculateSkillSummary(roadmap, checkpointStatuses), [roadmap, checkpointStatuses]);
  const buildSummary = useMemo(() => calculateBuildSummary(roadmap, progress), [roadmap, progress]);
  const consistency = useMemo(() => calculateConsistency(streak, timerHistory), [streak, timerHistory]);

  const checkpoints = Array.isArray(roadmap?.checkpoints) ? roadmap.checkpoints : [];
  const filteredCheckpoints = checkpoints.filter((checkpoint) => (
    skillFilter === 'All' || getCheckpointStatusValue(checkpointStatuses?.[checkpoint.skill]) === skillFilter
  ));
  const visibleCheckpoints = showAllSkills ? filteredCheckpoints : filteredCheckpoints.slice(0, 6);
  const activeWeek = Number(settings?.activeWeek) || 1;
  const displayWeek = Math.min(activeWeek, courseProgress.weeks.total || activeWeek);
  const milestonePercent = buildSummary.milestones.total > 0
    ? Math.round((buildSummary.milestones.completed / buildSummary.milestones.total) * 100)
    : 0;

  const needsAttention = useMemo(() => weeks.filter((week) => {
    if (Number(week.weekNumber) > activeWeek) return false;
    const proofRequired = week.proofOfWork !== false && Boolean(
      week.proofOfWork || week.proof || week.proofRequirement || week.deliverable
    );
    if (!proofRequired) return false;
    const stepStatus = getWeekStepStatus({
      week,
      weekNum: week.weekNumber,
      monthNum: week.monthNumber,
      progress,
      resourcesStatus,
      skillChecks,
      practicalMissions,
      weekProofs,
      weekReflections,
      settings,
      skillCheckAttempts,
      roadmapId: getRoadmapIdentity(roadmap, settings.activeRoadmapId),
    });
    return stepStatus.proofUnlocked && !stepStatus.proofDone;
  }), [activeWeek, practicalMissions, progress, resourcesStatus, roadmap, settings, skillChecks, skillCheckAttempts, weekProofs, weekReflections, weeks]);

  const openConfidenceForm = (checkpoint) => {
    const rawRecord = checkpointStatuses?.[checkpoint.skill];
    const record = rawRecord && typeof rawRecord === 'object' ? rawRecord : {};
    setEvidenceDraft({
      explanation: record.explanation || '',
      link: record.link || '',
      projectProof: record.projectProof || '',
    });
    setEditingSkill(checkpoint.skill);
  };

  const updateSkillStatus = (checkpoint, status) => {
    if (status === 'Confident') {
      openConfidenceForm(checkpoint);
      return;
    }
    const rawRecord = checkpointStatuses?.[checkpoint.skill];
    const existingEvidence = rawRecord && typeof rawRecord === 'object'
      ? { explanation: rawRecord.explanation || '', link: rawRecord.link || '', projectProof: rawRecord.projectProof || '' }
      : {};
    setCheckpointStatus(checkpoint.skill, status, existingEvidence);
    setEditingSkill(null);
  };

  const saveConfidence = (event, skill) => {
    event.preventDefault();
    setCheckpointStatus(skill, 'Confident', evidenceDraft);
    setEditingSkill(null);
  };

  return (
    <PageShell>
      <header className="mb-2">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-violet">Development story</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">Progress</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">
          See how your course completion, confidence, builds, and learning rhythm are developing.
        </p>
      </header>

      <Panel className="overflow-hidden bg-[radial-gradient(circle_at_top_left,rgb(var(--brand-blue)/0.10),transparent_45%)]">
        <div className="grid items-center gap-8 lg:grid-cols-[auto_1fr] lg:gap-14">
          <CourseProgressRing percent={courseProgress.percent} />
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-text-muted">Course progress</p>
            <h2 className="mt-2 text-2xl font-bold text-text-primary sm:text-3xl">
              Week {displayWeek} of {courseProgress.weeks.total || '—'}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-secondary">
              Course progress measures completed required learning activities. Skill confidence, build completion, and consistency are shown separately below.
            </p>
            <dl className="mt-7 grid gap-4 border-t border-border-divider pt-6 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-text-muted">Weeks completed</dt>
                <dd className="mt-1 text-2xl font-bold text-text-primary">{courseProgress.weeks.completed} / {courseProgress.weeks.total}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-text-muted">Required activities</dt>
                <dd className="mt-1 text-2xl font-bold text-text-primary">
                  {courseProgress.activities.total > 0 ? `${courseProgress.activities.completed} / ${courseProgress.activities.total}` : 'Not supplied'}
                </dd>
              </div>
            </dl>
            {courseProgress.usesWeekFallback && courseProgress.weeks.total > 0 && (
              <p className="mt-4 text-xs leading-relaxed text-text-muted">
                This curriculum has no required activity list, so course progress uses completed weeks.
              </p>
            )}
          </div>
        </div>
      </Panel>

      <Panel open>
        <div className="flex flex-col gap-5 border-b border-border-divider pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-blue">Capability</p>
            <h2 className="mt-2 text-2xl font-bold text-text-primary">Skills</h2>
            <p className="mt-1 text-sm text-text-secondary">Your self-assessed confidence across course checkpoints.</p>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Filter skills by status">
            {SKILL_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => { setSkillFilter(filter.value); setShowAllSkills(false); }}
                aria-pressed={skillFilter === filter.value}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  skillFilter === filter.value
                    ? 'border-brand-blue bg-brand-blue/10 text-brand-blue'
                    : 'border-border-default bg-bg-soft text-text-secondary hover:border-border-strong hover:text-text-primary'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {checkpoints.length === 0 ? (
          <p className="py-7 text-sm text-text-muted">This curriculum does not define skill checkpoints.</p>
        ) : (
          <>
            <div className="py-6">
              <div className="flex h-2 overflow-hidden rounded-full bg-bg-soft" aria-label={`${skillSummary.confident} confident, ${skillSummary.developing} developing, ${skillSummary.notAssessed} not assessed`}>
                {skillSummary.total > 0 && (
                  <>
                    <span className="bg-brand-green" style={{ width: `${(skillSummary.confident / skillSummary.total) * 100}%` }} />
                    <span className="bg-brand-amber" style={{ width: `${(skillSummary.developing / skillSummary.total) * 100}%` }} />
                    <span className="bg-border-strong" style={{ width: `${(skillSummary.notAssessed / skillSummary.total) * 100}%` }} />
                  </>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-text-secondary">
                <span><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-brand-green" />{skillSummary.confident} confident</span>
                <span><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-brand-amber" />{skillSummary.developing} developing</span>
                <span><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-border-strong" />{skillSummary.notAssessed} not assessed</span>
              </div>
            </div>

            {visibleCheckpoints.length === 0 ? (
              <p className="rounded-radius-lg border border-dashed border-border-default bg-bg-soft px-4 py-6 text-center text-sm text-text-muted">
                No skills match this filter.
              </p>
            ) : (
              <div className="divide-y divide-border-divider border-y border-border-divider">
                {visibleCheckpoints.map((checkpoint, index) => {
                  const rawRecord = checkpointStatuses?.[checkpoint.skill];
                  const status = getCheckpointStatusValue(rawRecord);
                  const record = rawRecord && typeof rawRecord === 'object' ? rawRecord : {};
                  return (
                    <article key={checkpoint.skill || index} className="py-5">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="flex min-w-0 gap-3">
                          <StatusIcon status={status} className="mt-0.5 h-5 w-5 shrink-0" />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-bold text-text-primary">{checkpoint.skill || `Skill ${index + 1}`}</h3>
                              <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusClasses(status)}`}>{displayStatus(status)}</span>
                            </div>
                            {checkpoint.question && <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">{checkpoint.question}</p>}
                            {record.dateMarked && (
                              <p className="mt-2 text-[11px] text-text-muted">
                                Updated {new Date(record.dateMarked).toLocaleDateString()}{record.explanation ? ' · confidence evidence saved' : ''}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 sm:flex xl:shrink-0">
                          {STATUS_OPTIONS.map((option) => (
                            <button
                              key={option.stored}
                              type="button"
                              onClick={() => updateSkillStatus(checkpoint, option.stored)}
                              className={`rounded-radius-sm border px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                                status === option.stored ? statusClasses(option.stored) : 'border-border-default bg-bg-soft text-text-secondary hover:border-border-strong hover:text-text-primary'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {editingSkill === checkpoint.skill && (
                        <form onSubmit={(event) => saveConfidence(event, checkpoint.skill)} className="ml-0 mt-5 space-y-4 rounded-radius-lg border border-brand-blue/20 bg-brand-blue/5 p-4 sm:ml-8">
                          <div>
                            <label className="text-xs font-semibold text-text-primary" htmlFor={`explanation-${index}`}>Explain this skill in your own words</label>
                            <textarea id={`explanation-${index}`} required rows={3} value={evidenceDraft.explanation} onChange={(event) => setEvidenceDraft((draft) => ({ ...draft, explanation: event.target.value }))} className="input-base mt-1.5 w-full text-sm" />
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <label className="text-xs font-semibold text-text-secondary" htmlFor={`link-${index}`}>Evidence link (optional)</label>
                              <input id={`link-${index}`} type="url" value={evidenceDraft.link} onChange={(event) => setEvidenceDraft((draft) => ({ ...draft, link: event.target.value }))} className="input-base mt-1.5 w-full text-sm" />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-text-secondary" htmlFor={`project-${index}`}>Project (optional)</label>
                              <select id={`project-${index}`} value={evidenceDraft.projectProof} onChange={(event) => setEvidenceDraft((draft) => ({ ...draft, projectProof: event.target.value }))} className="input-base mt-1.5 w-full text-sm">
                                <option value="">No project selected</option>
                                {(roadmap?.projects || []).map((project, projectIndex) => (
                                  <option key={project.id || projectIndex} value={project.name || project.title || `Project ${projectIndex + 1}`}>
                                    {project.name || project.title || `Project ${projectIndex + 1}`}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
                            <button type="button" onClick={() => setEditingSkill(null)} className="btn-secondary justify-center px-4 py-2 text-xs">Cancel</button>
                            <button type="submit" className="btn-primary justify-center px-4 py-2 text-xs">Save as Confident</button>
                          </div>
                        </form>
                      )}
                    </article>
                  );
                })}
              </div>
            )}

            {filteredCheckpoints.length > 6 && (
              <button
                type="button"
                onClick={() => setShowAllSkills((shown) => !shown)}
                aria-expanded={showAllSkills}
                className="mt-5 inline-flex items-center gap-1 rounded-sm text-sm font-semibold text-brand-blue hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-bg-canvas"
              >
                {showAllSkills ? 'Show fewer skills' : `View all ${filteredCheckpoints.length} skills`}
                {showAllSkills ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            )}
          </>
        )}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel>
          <div className="flex items-start justify-between gap-4">
            <div>
              <FolderKanban className="h-5 w-5 text-brand-violet" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-bold text-text-primary">Builds</h2>
              <p className="mt-1 text-sm text-text-secondary">Project delivery stays distinct from course completion.</p>
            </div>
            <Link to="/workspace/projects" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-blue hover:opacity-80">
              View Projects <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {buildSummary.projects.total === 0 ? (
            <div className="mt-7 rounded-radius-lg border border-dashed border-border-default bg-bg-soft p-5">
              <p className="text-sm font-semibold text-text-primary">No projects are defined yet.</p>
              <p className="mt-1 text-xs leading-relaxed text-text-muted">Build progress will appear when this curriculum includes project milestones.</p>
            </div>
          ) : (
            <>
              <dl className="mt-7 grid grid-cols-2 gap-5">
                <div><dt className="text-xs text-text-muted">Projects completed</dt><dd className="mt-1 text-2xl font-bold text-text-primary">{buildSummary.projects.completed} / {buildSummary.projects.total}</dd></div>
                <div><dt className="text-xs text-text-muted">Milestones completed</dt><dd className="mt-1 text-2xl font-bold text-text-primary">{buildSummary.milestones.completed} / {buildSummary.milestones.total}</dd></div>
              </dl>
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-bg-soft" aria-label={`${milestonePercent} percent of milestones completed`}>
                <div className="h-full rounded-full bg-brand-violet transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${milestonePercent}%` }} />
              </div>
            </>
          )}
        </Panel>

        <Panel>
          <Flame className="h-5 w-5 text-brand-amber" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-bold text-text-primary">Consistency</h2>
          <p className="mt-1 text-sm text-text-secondary">Learning regularity and focused effort, not skill mastery.</p>
          <dl className="mt-7 grid grid-cols-2 gap-5">
            <div><dt className="text-xs text-text-muted">Current streak</dt><dd className="mt-1 text-2xl font-bold text-text-primary">{consistency.currentStreak} day{consistency.currentStreak === 1 ? '' : 's'}</dd></div>
            <div><dt className="text-xs text-text-muted">Longest streak</dt><dd className="mt-1 text-2xl font-bold text-text-primary">{consistency.longestStreak} day{consistency.longestStreak === 1 ? '' : 's'}</dd></div>
          </dl>
          {consistency.hasTrustedSessionHistory ? (
            <dl className="mt-6 grid grid-cols-2 gap-5 border-t border-border-divider pt-5">
              <div><dt className="flex items-center gap-1.5 text-xs text-text-muted"><Timer className="h-3.5 w-3.5" /> Focused this week</dt><dd className="mt-1 text-lg font-bold text-text-primary">{formatFocusedTime(consistency.focusedSecondsThisWeek)}</dd></div>
              <div><dt className="flex items-center gap-1.5 text-xs text-text-muted"><CheckCircle2 className="h-3.5 w-3.5" /> Completed sessions</dt><dd className="mt-1 text-lg font-bold text-text-primary">{consistency.sessionsThisWeek}</dd></div>
            </dl>
          ) : (
            <p className="mt-6 border-t border-border-divider pt-5 text-xs leading-relaxed text-text-muted">Focus totals appear after a completed Focus Session is recorded this week.</p>
          )}
        </Panel>
      </div>

      {needsAttention.length > 0 && (
        <section className="rounded-[20px] border border-brand-amber/25 bg-brand-amber/5 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-brand-amber" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-text-primary">Needs attention</h2>
              <p className="mt-1 text-sm text-text-secondary">Unlocked proof requirements that still need to be completed.</p>
              <div className="mt-4 divide-y divide-brand-amber/15 border-y border-brand-amber/15">
                {needsAttention.map((week) => (
                  <div key={`${week.monthNumber}-${week.weekNumber}`} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-semibold text-text-primary">Week {week.weekNumber} required proof is incomplete</p>
                    <Link to="/workspace/proof" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-blue hover:opacity-80">Review Proof <ArrowRight className="h-3.5 w-3.5" /></Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </PageShell>
  );
}
