import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, FolderKanban, ExternalLink, Award, Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageShell, PageHeader, MetricCard, ProgressBar, SectionCard } from '../components/common/UIComponents';
import { ProjectForgeVisual } from '../components/visuals';
import StatusBanner from '../components/ui/StatusBanner';
import InlineStatus from '../components/ui/InlineStatus';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import CopyTemplateButton from '../components/common/CopyTemplateButton';
import { resolveTemplates } from '../utils/templateUtils.js';

export default function ProjectTracker() {
  const {
    roadmap, progress,
    toggleProjectMilestone, setProjectGithubLink, setProjectNote, setProjectLiveDemoLink,
  } = useApp();
  const workspaceRef = useRef(null);

  const [activeProjIdx, setActiveProjIdx] = useState(0);
  const [githubInputs, setGithubInputs] = useState({});
  const [liveDemoInputs, setLiveDemoInputs] = useState({});
  const [noteInputs, setNoteInputs] = useState({});

  // Loading & Feedback States
  const [savingGithub, setSavingGithub] = useState(false);
  const [githubError, setGithubError] = useState('');
  const [githubSuccess, setGithubSuccess] = useState('');

  const [savingLiveDemo, setSavingLiveDemo] = useState(false);
  const [liveDemoError, setLiveDemoError] = useState('');
  const [liveDemoSuccess, setLiveDemoSuccess] = useState('');

  const [savingNote, setSavingNote] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState('');

  const projects = useMemo(() => roadmap?.projects || [], [roadmap]);

  // Auto-focus the first incomplete project on load
  useEffect(() => {
    if (projects.length > 0) {
      const firstIncomplete = projects.findIndex((proj, idx) => {
        const done = progress.completedProjectMilestones?.[idx] || [];
        return done.length < (proj.milestones?.length || 0);
      });
      if (firstIncomplete !== -1) {
        setActiveProjIdx(firstIncomplete);
      }
    }
  }, [projects, progress.completedProjectMilestones]);

  if (projects.length === 0) {
    return (
      <PageShell>
        <PageHeader 
          title="Projects"
          subtitle="Review what you are building and update project milestones."
        />
        <div className="surface-card border-dashed text-center py-16 px-6 max-w-md mx-auto select-none">
          <h4 className="text-sm font-bold text-white">No projects are available in this course.</h4>
        </div>
      </PageShell>
    );
  }

  // overall calculations
  const completedMilestonesCount = Object.values(progress.completedProjectMilestones || {})
    .reduce((a, arr) => a + arr.length, 0);
  
  const totalMilestonesCount = projects.reduce((a, p) => a + (Array.isArray(p.milestones) ? p.milestones.length : 0), 0);

  const completedProjectsCount = projects.filter((proj, idx) => {
    const done = progress.completedProjectMilestones?.[idx] || [];
    return done.length > 0 && done.length === proj.milestones?.length;
  }).length;

  const activeProject = projects[activeProjIdx] || projects[0];
  const activeProjectTemplates = resolveTemplates(activeProject);
  const activeDoneMilestones = progress.completedProjectMilestones?.[activeProjIdx] || [];
  const activeTotalMilestones = activeProject?.milestones?.length || 0;
  const activePercent = activeTotalMilestones > 0 ? Math.round((activeDoneMilestones.length / activeTotalMilestones) * 100) : 0;

  const savedGithub = progress.projectGithubLinks?.[activeProjIdx] || '';
  const savedLiveDemo = progress.projectLiveDemoLinks?.[activeProjIdx] || '';
  const savedNote = progress.projectNotes?.[activeProjIdx] || '';
  
  const localGithub = githubInputs[activeProjIdx] ?? savedGithub;
  const localLiveDemo = liveDemoInputs[activeProjIdx] ?? savedLiveDemo;
  const localNote = noteInputs[activeProjIdx] ?? savedNote;

  const isCapstone = activeProject?.capstone === true || activeProject?.featured === true;

  // Find next milestone index
  const nextMilestoneIdx = activeProject?.milestones?.findIndex((_, idx) => !activeDoneMilestones.includes(idx));

  const scrollToWorkspace = () => {
    workspaceRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSaveGithub = () => {
    setGithubError('');
    setGithubSuccess('');

    if (!localGithub.trim()) {
      setGithubError('Repository link is required.');
      return;
    }

    if (!localGithub.startsWith('https://github.com/')) {
      setGithubError('Repository link must start with https://github.com/');
      return;
    }

    setSavingGithub(true);
    setTimeout(() => {
      setProjectGithubLink(activeProjIdx, localGithub);
      setSavingGithub(false);
      setGithubSuccess('Repository link saved.');
      setTimeout(() => setGithubSuccess(''), 3000);
    }, 600);
  };

  const handleSaveLiveDemo = () => {
    setLiveDemoError('');
    setLiveDemoSuccess('');

    if (localLiveDemo.trim() && !localLiveDemo.startsWith('http://') && !localLiveDemo.startsWith('https://')) {
      setLiveDemoError('Live Demo URL must start with http:// or https://');
      return;
    }

    setSavingLiveDemo(true);
    setTimeout(() => {
      setProjectLiveDemoLink(activeProjIdx, localLiveDemo);
      setSavingLiveDemo(false);
      setLiveDemoSuccess('Live Demo link saved.');
      setTimeout(() => setLiveDemoSuccess(''), 3000);
    }, 600);
  };

  const handleSaveNote = () => {
    setNoteSuccess('');
    setSavingNote(true);
    setTimeout(() => {
      setProjectNote(activeProjIdx, localNote);
      setSavingNote(false);
      setNoteSuccess('Project notes saved.');
      setTimeout(() => setNoteSuccess(''), 3000);
    }, 600);
  };

  return (
    <PageShell>
      {/* ── 1. Project Studio Hero ── */}
      <div className="surface-card surface-card--hero relative overflow-hidden p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-brand-violet/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-6 flex-1 text-left w-full z-10">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-brand-violet animate-pulse" />
            <span className="text-xs text-brand-violet font-bold tracking-widest uppercase">
              What are you building?
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-heading">
              Projects
            </h1>
            <p className="text-text-secondary mt-3 text-[15px] leading-relaxed max-w-xl">
              Review project purpose, milestones, repository, demo, and notes without changing their curriculum order.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-2 no-print">
            <button 
              onClick={scrollToWorkspace}
              className="btn-primary py-3 px-6 text-[14px] font-bold"
            >
              Continue Project
            </button>
            <Link to="/workspace/proof" className="btn-secondary py-3 px-6 text-[14px] font-semibold">
              View Proof
            </Link>
          </div>
        </div>

        {/* Circular Overall Projects Milestones indicator */}
        <div className="hidden md:flex flex-col items-end gap-1.5 text-right z-10 pr-4">
          <span className="text-4xl font-mono font-extrabold text-white">{completedProjectsCount} / {projects.length}</span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Completed Projects</span>
          <ProgressBar percent={projects.length > 0 ? (completedProjectsCount / projects.length) * 100 : 0} className="w-36 mt-2" colorClass="bg-gradient-to-r from-brand-violet to-brand-blue" />
        </div>
      </div>

      {/* ── 2. Project Status Overview Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          label="Active Projects"
          value={`${projects.length}`}
          icon={FolderKanban}
          accentColor="blue"
          helperText="Assigned in roadmap"
        />
        <MetricCard
          label="Completed Projects"
          value={`${completedProjectsCount}`}
          icon={CheckCircle2}
          accentColor="green"
          helperText="Milestones fully complete"
        />
        <MetricCard
          label="Completed Milestones"
          value={`${completedMilestonesCount} / ${totalMilestonesCount}`}
          icon={Award}
          accentColor="cyan"
          helperText="Total project tasks"
        />
        <MetricCard
          label="Milestone Progress"
          value={`${totalMilestonesCount > 0 ? Math.round((completedMilestonesCount / totalMilestonesCount) * 100) : 0}%`}
          icon={Sparkles}
          accentColor="violet"
          helperText="Total builds completion"
        />
      </div>
      {/* ── 3. Active Project Selector Tabs ── */}
      <div className="surface-card p-5">
        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4 block">
          Choose a project
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {projects.map((proj, idx) => {
            const isSelected = activeProjIdx === idx;
            const done = progress.completedProjectMilestones?.[idx] || [];
            const total = proj.milestones?.length || 0;
            const percent = total > 0 ? Math.round((done.length / total) * 100) : 0;
            const isCapstoneProj = proj.capstone === true || proj.featured === true;

            return (
              <button
                key={idx}
                onClick={() => setActiveProjIdx(idx)}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all ${
                  isSelected
                    ? 'border-brand-violet/50 bg-brand-violet/5 text-text-primary shadow-primary-glow-sm'
                    : 'border-border-default bg-bg-surface text-text-secondary hover:border-border-strong hover:bg-bg-soft'
                }`}
              >
                <div className="space-y-1.5 min-w-0 w-full font-sans">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-slate-550 uppercase tracking-wider">Project {idx + 1}</span>
                    {isCapstoneProj && (
                      <span className="bg-brand-cyan/15 text-brand-cyan text-[8px] font-bold px-1.5 py-0.2 rounded border border-brand-cyan/25 uppercase tracking-wide">
                        Capstone
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-text-primary text-xs truncate leading-tight">{proj.name || proj.title}</h4>
                </div>

                <div className="w-full space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                    <span>{done.length}/{total} Milestones</span>
                    <span>{percent}%</span>
                  </div>
                  <ProgressBar percent={percent} colorClass={isCapstoneProj ? 'bg-gradient-to-r from-brand-cyan to-brand-violet' : 'bg-gradient-to-r from-brand-blue to-brand-violet'} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 4. Project Workspace Dashboard ── */}
      <div ref={workspaceRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3 width) - Project timeline/milestones and Repository */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard
            title={activeProject.name || activeProject.title}
            subtitle={activeProject.type || "Bootcamp Build Project"}
            headerActions={
              <div className="flex gap-2">
                {isCapstone && (
                  <span className="bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/25 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    Featured
                  </span>
                )}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                  activePercent === 100
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-bg-soft text-text-muted border-border-default'
                }`}>
                  {activePercent === 100 ? 'Completed' : 'In Progress'}
                </span>
              </div>
            }
          >
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">About this project</span>
                <p className="text-xs text-text-secondary leading-relaxed">{activeProject.description || "No project description provided."}</p>
              </div>

              {activeProjectTemplates.length > 0 && (
                <div className="space-y-3 border-t border-border-divider pt-4">
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-widest text-slate-400">Starter templates</span>
                    {activeProject.readmePrompt && <p className="mt-2 text-xs leading-relaxed text-text-secondary">{activeProject.readmePrompt}</p>}
                  </div>
                  {activeProjectTemplates.map((template) => <CopyTemplateButton key={template.id} template={template} />)}
                </div>
              )}

              {/* Milestones timeline */}
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Milestones</span>
                {activeTotalMilestones > 0 ? (
                  <div className="space-y-2.5">
                    {activeProject.milestones.map((milestone, mi) => {
                      const mDone = activeDoneMilestones.includes(mi);
                      const milestoneTitle = typeof milestone === 'string' ? milestone : (milestone?.title || `Milestone ${mi + 1}`);
                      
                      let milestoneStyle = "border-border-default bg-bg-surface text-text-primary";
                      let dotColor = "border-border-strong bg-bg-soft";
                      
                      if (mDone) {
                        milestoneStyle = "border-emerald-500/15 bg-emerald-500/5 text-text-muted";
                        dotColor = "border-emerald-500 bg-emerald-500/20";
                      } else if (mi === nextMilestoneIdx) {
                        milestoneStyle = "border-brand-violet/55 bg-brand-violet/5 text-text-primary shadow-primary-glow-sm";
                        dotColor = "border-brand-violet bg-brand-violet/25 animate-pulse";
                      } else if (nextMilestoneIdx !== undefined && mi > nextMilestoneIdx) {
                        milestoneStyle = "border-border-default bg-bg-soft text-text-muted";
                      }

                      return (
                        <button
                          key={mi}
                          onClick={() => toggleProjectMilestone(activeProjIdx, mi)}
                          className={`w-full flex items-center gap-3.5 p-4 rounded-xl border text-left transition-all active:scale-[0.99] ${milestoneStyle}`}
                        >
                          <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${dotColor}`}>
                            {mDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-450" />}
                          </div>
                          <span className={`text-xs ${mDone ? 'line-through text-slate-500 font-medium' : 'font-semibold'}`}>
                            {milestoneTitle}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-bg-soft border border-border-default rounded-xl text-xs text-text-muted italic">
                    No milestones supplied for this project.
                  </div>
                )}
              </div>

              {/* GitHub Link Entry */}
              <div className="pt-4 border-t border-navy-800/40 space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Repository</span>
                <div className="flex gap-2 flex-col sm:flex-row">
                  <input
                    type="url"
                    placeholder="https://github.com/username/project-repo"
                    value={localGithub}
                    onChange={(e) => setGithubInputs((prev) => ({ ...prev, [activeProjIdx]: e.target.value }))}
                    className="input-base flex-1 text-xs font-mono"
                    disabled={savingGithub}
                  />
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={handleSaveGithub}
                      disabled={savingGithub}
                      className="btn-primary py-2 px-5 text-xs font-bold active:scale-95 transition-all whitespace-nowrap disabled:opacity-50"
                    >
                      {savingGithub ? 'Saving...' : 'Save Link'}
                    </button>
                    {savedGithub && (
                      <a
                        href={savedGithub}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap text-brand-cyan border-brand-cyan/25"
                      >
                        Open <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
                {githubError && (
                  <StatusBanner type="error" message={githubError} />
                )}
                {savingGithub && (
                  <LoadingIndicator label="Saving repository link..." size="sm" />
                )}
                {githubSuccess && (
                  <InlineStatus status="success" label={githubSuccess} />
                )}
              </div>

              {/* Live Demo Link Entry */}
              <div className="pt-4 border-t border-navy-800/40 space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Live demo</span>
                <div className="flex gap-2 flex-col sm:flex-row">
                  <input
                    type="url"
                    placeholder="https://example.com/live-demo"
                    value={localLiveDemo}
                    onChange={(e) => setLiveDemoInputs((prev) => ({ ...prev, [activeProjIdx]: e.target.value }))}
                    className="input-base flex-1 text-xs font-mono"
                    disabled={savingLiveDemo}
                  />
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={handleSaveLiveDemo}
                      disabled={savingLiveDemo}
                      className="btn-primary py-2 px-5 text-xs font-bold active:scale-95 transition-all whitespace-nowrap disabled:opacity-50"
                    >
                      {savingLiveDemo ? 'Saving...' : 'Save Link'}
                    </button>
                    {savedLiveDemo && (
                      <a
                        href={savedLiveDemo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap text-brand-cyan border-brand-cyan/25"
                      >
                        Open <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
                {liveDemoError && (
                  <StatusBanner type="error" message={liveDemoError} />
                )}
                {savingLiveDemo && (
                  <LoadingIndicator label="Saving live demo link..." size="sm" />
                )}
                {liveDemoSuccess && (
                  <InlineStatus status="success" label={liveDemoSuccess} />
                )}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right Column (1/3 width) - Project Notes, Blockers, Celebration Card */}
        <div className="space-y-6">
          
          {/* Capstone Celebration Card */}
          {activePercent === 100 && (
            <div className="p-5 bg-emerald-500/5 border border-emerald-500/25 rounded-radius-xxl space-y-3 shadow-emerald-glow text-center select-none">
              <ProjectForgeVisual status="completed" size="md" className="mx-auto" />
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-heading">
                  Project Complete
                </h4>
                <p className="text-xs text-emerald-455 mt-1 leading-normal font-medium">
                  {isCapstone ? 'Final Capstone Project Complete! All milestones verified and logged.' : 'All project milestones resolved successfully.'}
                </p>
              </div>
            </div>
          )}

          <SectionCard
            title="Project Notes"
            subtitle="Capture choices, configurations, or packages during build"
          >
            <div className="space-y-4">
              <textarea
                placeholder="Write database architecture notes, tech stacks, or deployment links here..."
                value={localNote}
                onChange={(e) => setNoteInputs((prev) => ({ ...prev, [activeProjIdx]: e.target.value }))}
                rows={5}
                className="input-base w-full text-xs resize-none"
                disabled={savingNote}
              />
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleSaveNote}
                  disabled={savingNote}
                  className="btn-primary py-2 px-5 text-xs font-bold w-full active:scale-95 transition-all text-center disabled:opacity-50"
                >
                  {savingNote ? 'Updating...' : 'Save Project Notes'}
                </button>
                {savingNote && (
                  <LoadingIndicator label="Saving project notes..." size="sm" />
                )}
                {noteSuccess && (
                  <InlineStatus status="success" label={noteSuccess} />
                )}
              </div>
            </div>
          </SectionCard>

          {/* Alternative / Planned Projects Summary */}
          {projects.length > 1 && (
            <SectionCard
              title="Other planned projects"
              subtitle="Timeline tracks scheduled for this roadmap"
            >
              <div className="space-y-3 pt-1">
                {projects.map((proj, idx) => {
                  if (idx === activeProjIdx) return null;
                  
                  const done = progress.completedProjectMilestones?.[idx] || [];
                  const total = proj.milestones?.length || 0;
                  const percent = total > 0 ? Math.round((done.length / total) * 100) : 0;
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveProjIdx(idx)}
                      className="w-full text-left p-3.5 bg-bg-soft/40 border border-border-default hover:border-border-strong rounded-xl flex items-center justify-between gap-4 transition-all"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-[9px] font-bold text-slate-550 uppercase tracking-widest">Project {idx + 1}</span>
                        <h4 className="font-bold text-white text-xs truncate mt-0.5 leading-tight">{proj.name || proj.title}</h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-400 bg-bg-surface px-2 py-0.5 rounded border border-border-divider flex-shrink-0">
                        {percent}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </SectionCard>
          )}

        </div>
      </div>
    </PageShell>
  );
}

