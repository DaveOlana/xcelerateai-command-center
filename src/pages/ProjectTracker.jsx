import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Github, FileText, ChevronDown, ChevronUp, FolderKanban, Star, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageShell, PageHeader, StatCard, ProgressBar } from '../components/common/UIComponents';

export default function ProjectTracker() {
  const {
    roadmap, progress, blockers,
    toggleProjectMilestone, setProjectGithubLink, setProjectNote, setProjectLiveDemoLink,
  } = useApp();

  const [expanded, setExpanded] = useState(0);
  const [githubInputs, setGithubInputs] = useState({});
  const [liveDemoInputs, setLiveDemoInputs] = useState({});
  const [noteInputs, setNoteInputs] = useState({});

  const projects = roadmap?.projects || [];

  if (projects.length === 0) {
    return (
      <PageShell>
        <PageHeader 
          title="Project Tracker" 
          subtitle="Track your builds and milestones across all capstone projects."
        />
        <div className="bg-navy-800/40 border border-dashed border-navy-500/30 text-center py-16 px-6 rounded-2xl max-w-md mx-auto">
          <FolderKanban className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">No Projects Found</h4>
          <p className="text-[14px] text-slate-500 mt-1">Import a rich roadmap configuration with a projects array to start tracking.</p>
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

  const completedMilestonesCount = Object.values(progress.completedProjectMilestones || {})
    .reduce((a, arr) => a + arr.length, 0);
  const totalMilestonesCount = projects.reduce((a, p) => a + (Array.isArray(p.milestones) ? p.milestones.length : 0), 0);

  return (
    <PageShell>
      {/* Header */}
      <PageHeader 
        title="Project Tracker" 
        subtitle={`Track your builds and milestones across all ${projects.length} bootcamp projects.`}
      />

      {/* Summary KPI deck */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard 
          label="Total Projects" 
          value={projects.length} 
          icon={FolderKanban} 
          helperText="Active deliverables"
          accentColor="blue"
        />
        <StatCard 
          label="Total Milestones" 
          value={totalMilestonesCount} 
          icon={CheckCircle2} 
          helperText="Milestones mapped in file"
          accentColor="cyan"
        />
        <StatCard 
          label="Completed Milestones" 
          value={totalMilestonesCount > 0 ? `${completedMilestonesCount}/${totalMilestonesCount}` : 'None defined'} 
          icon={CheckCircle2} 
          helperText={totalMilestonesCount > 0 ? 'Overall project status' : 'No milestones supplied in this roadmap'}
          accentColor="purple"
        />
      </div>

      {/* Projects list */}
      <div className="space-y-4">
        {projects.map((project, pi) => {
          const done = progress.completedProjectMilestones?.[pi] || [];
          const total = project.milestones?.length || 0;
          const percent = total > 0 ? Math.round((done.length / total) * 100) : 0;
          const isExpanded = expanded === pi;
          
          const savedGithub = progress.projectGithubLinks?.[pi] || '';
          const savedLiveDemo = progress.projectLiveDemoLinks?.[pi] || '';
          const savedNote = progress.projectNotes?.[pi] || '';
          
          const localGithub = githubInputs[pi] ?? savedGithub;
          const localLiveDemo = liveDemoInputs[pi] ?? savedLiveDemo;
          const localNote = noteInputs[pi] ?? savedNote;

          const isCapstone = project.capstone === true || project.featured === true;
          const projectBlockers = getProjectBlockers(project);

          return (
            <div
              key={pi}
              className={`rounded-3xl border transition-all duration-350 p-6 lg:p-7 ${
                isCapstone
                  ? 'border-accent-cyan/30 bg-gradient-to-r from-navy-850 to-navy-900 shadow-sm relative overflow-hidden'
                  : 'border-navy-700/25 bg-navy-850 hover:border-navy-600 hover:shadow-card-hover'
              }`}
            >
              {isCapstone && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent-cyan/5 rounded-full blur-2xl pointer-events-none" />
              )}

              {/* Header Toggler */}
              <button
                onClick={() => setExpanded(isExpanded ? -1 : pi)}
                className="w-full text-left"
              >
                <div className="flex items-start gap-4">
                  {/* Badge Index */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm
                    ${percent === 100
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-450'
                      : isCapstone
                      ? 'bg-accent-cyan/15 border border-accent-cyan/30 text-accent-cyan shadow-sm'
                      : percent > 0
                      ? 'bg-accent-primary/15 border border-accent-primary/30 text-accent-primary'
                      : 'bg-navy-900 border border-navy-750 text-slate-500'
                    }`}
                  >
                    {percent === 100 ? '✓' : isCapstone ? '★' : `${pi + 1}`}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-white text-[16px] leading-snug" title={project.name}>{project.name}</h3>
                      {isCapstone && (
                        <span className="bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                          ★ CAPSTONE
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider
                        ${percent === 100
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : percent > 0
                          ? 'bg-accent-primary/10 text-accent-primary border-accent-primary/20 animate-pulse'
                          : 'bg-navy-900 text-slate-500 border-navy-750'
                        }`}
                      >
                        {percent === 100 ? 'Completed' : percent > 0 ? 'In Progress' : 'Not Started'}
                      </span>
                    </div>
                    <p className="text-[13px] text-slate-400 mt-1.5 line-clamp-1 leading-relaxed">{project.description}</p>
                    
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex-1">
                        <ProgressBar percent={percent} colorClass={isCapstone ? 'bg-gradient-to-r from-accent-cyan to-accent-primary' : 'bg-gradient-to-r from-accent-primary to-blue-500'} />
                      </div>
                      <span className="text-[13px] text-slate-455 font-bold">
                        {total > 0 ? `${done.length}/${total} Milestones · ${percent}%` : 'No milestones supplied'}
                      </span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 mt-1.5">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-450" /> : <ChevronDown className="w-4 h-4 text-slate-455" />}
                  </div>
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="mt-6 pt-6 border-t border-navy-700/30 space-y-6 animate-slide-up">
                  {/* Blocker Alert Box */}
                  {projectBlockers.length > 0 && (
                    <div className="flex flex-col gap-2.5 p-4 bg-brand-red/10 border border-brand-red/20 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-red animate-ping" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-brand-red" /> Active Project Blockers ({projectBlockers.length})
                        </h4>
                      </div>
                      <div className="space-y-1.5 pl-5">
                        {projectBlockers.map(b => (
                          <div key={b.id} className="flex justify-between items-center text-xs">
                            <span className="text-slate-300 font-semibold">{b.title}</span>
                            <Link to="/blockers" className="text-brand-red hover:underline font-bold">Resolve Blocker</Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">
                      Project Brief
                    </span>
                    <p className="text-[14px] text-slate-300 leading-relaxed font-sans">{project.description}</p>
                  </div>

                  {/* Milestones list */}
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">
                      Build Milestones
                    </span>
                    {total > 0 ? (
                      <div className="space-y-2.5">
                        {project.milestones.map((milestone, mi) => {
                          const mDone = (Array.isArray(done) ? done : []).includes(mi);
                          const milestoneTitle = typeof milestone === 'string' ? milestone : (milestone?.title || `Milestone ${mi + 1}`);
                          return (
                            <button
                              key={mi}
                              onClick={() => toggleProjectMilestone(pi, mi)}
                              className={`w-full flex items-center gap-3.5 p-4 rounded-2xl border text-left transition-all duration-200 active:scale-98
                                ${mDone
                                  ? 'bg-emerald-500/5 border-emerald-500/10 text-slate-450 hover:border-emerald-500/20'
                                  : 'bg-navy-900 border-navy-750 hover:border-navy-655 text-slate-200'
                                }`}
                            >
                              <div className={`w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 transition-all duration-200
                                ${mDone ? 'border-emerald-500 bg-emerald-500/20' : 'border-navy-600 bg-navy-850'}`}
                              >
                                {mDone && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                )}
                              </div>
                              <span className={`text-[14px] ${mDone ? 'line-through text-slate-500 font-medium' : 'font-semibold text-slate-200'}`} title={milestoneTitle}>
                                {milestoneTitle}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-navy-900/60 border border-dashed border-navy-600/30 rounded-xl p-4 text-center">
                        <p className="text-sm text-slate-550">No milestones supplied in this roadmap for this project.</p>
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    {/* Repository and Live Demo Links */}
                    <div className="space-y-4">
                      {/* GitHub Link */}
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">
                          Repository Link
                        </span>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            placeholder="https://github.com/your-username/project-repo"
                            value={localGithub}
                            onChange={(e) => setGithubInputs((prev) => ({ ...prev, [pi]: e.target.value }))}
                            className="input-base flex-1 text-xs"
                          />
                          <button
                            onClick={() => {
                              setProjectGithubLink(pi, localGithub);
                              alert('Repository link updated.');
                            }}
                            className="bg-navy-900 border border-navy-700 hover:text-white font-bold px-4 py-2 rounded-xl text-xs active:scale-95 transition-all"
                          >
                            Save
                          </button>
                          {savedGithub && (
                            <a
                              href={savedGithub}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan hover:bg-accent-cyan/25 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                            >
                              Open <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Live Demo Link */}
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">
                          Live Demo Link
                        </span>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            placeholder="https://your-project.vercel.app or similar"
                            value={localLiveDemo}
                            onChange={(e) => setLiveDemoInputs((prev) => ({ ...prev, [pi]: e.target.value }))}
                            className="input-base flex-1 text-xs"
                          />
                          <button
                            onClick={() => {
                              setProjectLiveDemoLink(pi, localLiveDemo);
                              alert('Live Demo link updated.');
                            }}
                            className="bg-navy-900 border border-navy-700 hover:text-white font-bold px-4 py-2 rounded-xl text-xs active:scale-95 transition-all"
                          >
                            Save
                          </button>
                          {savedLiveDemo && (
                            <a
                              href={savedLiveDemo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 hover:bg-emerald-500/25 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                            >
                              Open <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Project Notes */}
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2 flex items-center justify-between">
                        Project Notes
                        {savedNote && <span className="text-emerald-455 text-[10px] font-bold">Saved</span>}
                      </span>
                      <textarea
                        placeholder="Capture issues, design patterns, and package choices made during development."
                        value={localNote}
                        onChange={(e) => setNoteInputs((prev) => ({ ...prev, [pi]: e.target.value }))}
                        rows={6}
                        className="input-base w-full text-xs resize-none"
                      />
                      <button
                        onClick={() => {
                          setProjectNote(pi, localNote);
                          alert('Project notes updated.');
                        }}
                        className="bg-navy-900 border border-navy-700 hover:text-white font-bold px-4 py-2 rounded-xl text-xs active:scale-95 transition-all mt-2.5"
                      >
                        Save Notes
                      </button>
                    </div>
                  </div>

                  {/* Status completion badges */}
                  {percent === 100 && (
                    <div className="flex items-center gap-3.5 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                      <ShieldCheck className="w-5 h-5 text-emerald-450 flex-shrink-0" />
                      <p className="text-emerald-455 font-bold text-xs">
                        {isCapstone ? 'Final Capstone Project Complete! All milestones verified. 🚀' : 'Project Complete!'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
