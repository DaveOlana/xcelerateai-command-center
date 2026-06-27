import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle2, Github, FileText, ChevronDown, ChevronUp, 
  FolderKanban, Star, ExternalLink, ShieldCheck, Award, 
  Sparkles, ArrowRight, BookOpen, AlertTriangle, AlertCircle 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageShell, PageHeader, MetricCard, ProgressBar, SectionCard, StatusBadge } from '../components/common/UIComponents';

export default function ProjectTracker() {
  const {
    roadmap, progress, blockers,
    toggleProjectMilestone, setProjectGithubLink, setProjectNote, setProjectLiveDemoLink,
  } = useApp();
  const navigate = useNavigate();
  const workspaceRef = useRef(null);

  const [activeProjIdx, setActiveProjIdx] = useState(0);
  const [githubInputs, setGithubInputs] = useState({});
  const [liveDemoInputs, setLiveDemoInputs] = useState({});
  const [noteInputs, setNoteInputs] = useState({});

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
          title="Project Tracker" 
          subtitle="Track your builds and milestones across all capstone projects."
        />
        <div className="bg-bg-surface border border-dashed border-border-default text-center py-16 px-6 rounded-radius-xxl max-w-md mx-auto">
          <FolderKanban className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider font-heading">No Projects Found</h4>
          <p className="text-[13px] text-text-secondary mt-1">Import a rich roadmap configuration with a projects array to start tracking.</p>
        </div>
      </PageShell>
    );
  }

  const getProjectBlockers = (project) => {
    if (!Array.isArray(blockers)) return [];
    const projectNameLower = String(project.name || '').toLowerCase();
    return blockers.filter(b => {
      if (b.status === 'Solved') return false;
      const titleMatch = String(b.title || '').toLowerCase().includes(projectNameLower);
      const skillMatch = String(b.skillArea || '').toLowerCase().includes(projectNameLower);
      const missionMatch = String(b.missionTitle || '').toLowerCase().includes(projectNameLower);
      return titleMatch || skillMatch || missionMatch;
    });
  };

  // overall calculations
  const completedMilestonesCount = Object.values(progress.completedProjectMilestones || {})
    .reduce((a, arr) => a + arr.length, 0);
  
  const totalMilestonesCount = projects.reduce((a, p) => a + (Array.isArray(p.milestones) ? p.milestones.length : 0), 0);

  const completedProjectsCount = projects.filter((proj, idx) => {
    const done = progress.completedProjectMilestones?.[idx] || [];
    return done.length > 0 && done.length === proj.milestones?.length;
  }).length;

  const activeProject = projects[activeProjIdx] || projects[0];
  const activeDoneMilestones = progress.completedProjectMilestones?.[activeProjIdx] || [];
  const activeTotalMilestones = activeProject?.milestones?.length || 0;
  const activePercent = activeTotalMilestones > 0 ? Math.round((activeDoneMilestones.length / activeTotalMilestones) * 100) : 0;

  const savedGithub = progress.projectGithubLinks?.[activeProjIdx] || '';
  const savedNote = progress.projectNotes?.[activeProjIdx] || '';
  
  const localGithub = githubInputs[activeProjIdx] ?? savedGithub;
  const localNote = noteInputs[activeProjIdx] ?? savedNote;

  const isCapstone = activeProject?.capstone === true || activeProject?.featured === true;

  // Find next milestone index
  const nextMilestoneIdx = activeProject?.milestones?.findIndex((_, idx) => !activeDoneMilestones.includes(idx));

  const scrollToWorkspace = () => {
    workspaceRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <PageShell>
      {/* ── 1. Project Studio Hero ── */}
      <div className="relative overflow-hidden rounded-radius-xxl border border-border-default bg-bg-surface p-8 lg:p-10 shadow-card flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-brand-violet/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-6 flex-1 text-left w-full z-10">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-brand-violet animate-pulse" />
            <span className="text-xs text-brand-violet font-bold tracking-widest uppercase">
              Production Build Studio
            </span>
          </div>

          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-heading">
              Project Tracker
            </h1>
            <p className="text-text-secondary mt-3 text-[15px] leading-relaxed max-w-xl">
              Turn this roadmap into something you can show. Manage your capstone tracks and portfolio integrations.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-2 no-print">
            <button 
              onClick={scrollToWorkspace}
              className="btn-primary py-3 px-6 text-[14px] font-bold"
            >
              Continue Project
            </button>
            <Link to="/proof" className="btn-secondary py-3 px-6 text-[14px] font-semibold">
              View Proof of Work
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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
          label="Resolved Milestones"
          value={`${completedMilestonesCount} / ${totalMilestonesCount}`}
          icon={Award}
          accentColor="cyan"
          helperText="Total project tasks"
        />
        <MetricCard
          label="Milestones Ratio"
          value={`${totalMilestonesCount > 0 ? Math.round((completedMilestonesCount / totalMilestonesCount) * 100) : 0}%`}
          icon={Sparkles}
          accentColor="violet"
          helperText="Total builds completion"
      {/* ── 3. Active Project Selector Tabs ── */}
      <div className="bg-bg-surface border border-border-default rounded-radius-xxl p-5 shadow-sm">
        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4 block">
          Select Project Track
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
                    ? 'border-brand-violet bg-brand-violet/5 text-white shadow-primary-glow-sm'
                    : 'border-border-default bg-bg-surface/50 text-slate-400 hover:border-border-strong hover:bg-bg-soft'
                              <div className="space-y-1.5 min-w-0 w-full font-sans">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-slate-550 uppercase tracking-wider">Project {idx + 1}</span>
                    {isCapstoneProj && (
                      <span className="bg-brand-cyan/15 text-brand-cyan text-[8px] font-bold px-1.5 py-0.2 rounded border border-brand-cyan/25 uppercase tracking-wide">
                        Capstone
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-white text-xs truncate leading-tight">{proj.name || proj.title}</h4>
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
                    : 'bg-navy-900 text-slate-500 border-navy-750'
                }`}>
                  {activePercent === 100 ? 'Completed' : 'In Progress'}
                </span>
              </div>
            }
          >
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Project Brief</span>
                <p className="text-xs text-text-secondary leading-relaxed">{activeProject.description || "No project description provided."}</p>
              </div>

              {/* Milestones timeline */}
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Build Timeline Milestones</span>
                {activeTotalMilestones > 0 ? (
                  <div className="space-y-2.5">
                    {activeProject.milestones.map((milestone, mi) => {
                      const mDone = activeDoneMilestones.includes(mi);
                      const milestoneTitle = typeof milestone === 'string' ? milestone : (milestone?.title || `Milestone ${mi + 1}`);
                      
                      let milestoneStyle = "border-border-default bg-bg-surface text-slate-300";
                      let dotColor = "border-navy-600 bg-navy-850";
                      
                      if (mDone) {
                        milestoneStyle = "border-emerald-500/15 bg-emerald-500/5 text-text-muted";
                        dotColor = "border-emerald-500 bg-emerald-500/20";
                      } else if (mi === nextMilestoneIdx) {
                        milestoneStyle = "border-brand-violet bg-brand-violet/5 text-white shadow-primary-glow-sm";
                        dotColor = "border-brand-violet bg-brand-violet/25 animate-pulse";
                      } else if (nextMilestoneIdx !== undefined && mi > nextMilestoneIdx) {
                        milestoneStyle = "border-border-default bg-bg-surface/30 opacity-60 text-slate-500";
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
                  <div className="p-4 bg-navy-850 border border-navy-750 rounded-xl text-xs text-slate-550 italic">
                    No milestones supplied for this project.
                  </div>
                )}
              </div>

              {/* GitHub Link Entry */}
              <div className="pt-4 border-t border-navy-800/40 space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Repository Configuration</span>
                <div className="flex gap-2 flex-col sm:flex-row">
                  <input
                    type="url"
                    placeholder="https://github.com/username/project-repo"
                    value={localGithub}
                    onChange={(e) => setGithubInputs((prev) => ({ ...prev, [activeProjIdx]: e.target.value }))}
                    className="input-base flex-1 text-xs font-mono"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setProjectGithubLink(activeProjIdx, localGithub);
                        alert('GitHub repository link configured.');
                      }}
                      className="btn-primary py-2 px-5 text-xs font-bold active:scale-95 transition-all whitespace-nowrap"
                    >
                      Save Link
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
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right Column (1/3 width) - Project Notes, Blockers, Celebration Card */}
        <div className="space-y-6">
          
          {/* Capstone Celebration Card */}
          {activePercent === 100 && (
            <div className="p-5 bg-emerald-500/5 border border-emerald-500/25 rounded-radius-xxl space-y-3 shadow-emerald-glow text-center">
              <ShieldCheck className="w-10 h-10 text-emerald-450 mx-auto animate-pulse" />
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-heading">
                  Project Complete
                </h4>
                <p className="text-xs text-emerald-450 mt-1 leading-normal">
                  {isCapstone ? 'Final Capstone Project Complete! All milestones verified and logged. 🚀' : 'All project milestones resolved successfully.'}
                </p>
              </div>
            </div>
          )}

          {/* Project Notes form */}
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
              />
              <button
                onClick={() => {
                  setProjectNote(activeProjIdx, localNote);
                  alert('Project notes updated.');
                }}
                className="btn-primary py-2 px-5 text-xs font-bold w-full active:scale-95 transition-all text-center"
              >
                Save Project Notes
              </button>
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

