import React, { useState } from 'react';
import { CheckCircle2, Github, FileText, ChevronDown, ChevronUp, FolderKanban, Cpu, Star, ExternalLink, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageShell, PageHeader, StatCard, ProgressBar } from '../components/common/UIComponents';

export default function ProjectTracker() {
  const {
    roadmap, progress,
    toggleProjectMilestone, setProjectGithubLink, setProjectNote,
  } = useApp();

  const [expanded, setExpanded] = useState(0);
  const [githubInputs, setGithubInputs] = useState({});
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

  const completedMilestonesCount = Object.values(progress.completedProjectMilestones || {})
    .reduce((a, arr) => a + arr.length, 0);
  const totalMilestonesCount = projects.reduce((a, p) => a + (p.milestones?.length || 0), 0);

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
          icon={({ className }) => <img src="/xcelerate-icon.png" alt="Xcelerate" className={`object-contain ${className}`} />} 
          helperText="Milestones mapped in file"
          accentColor="cyan"
        />
        <StatCard 
          label="Completed Milestones" 
          value={`${completedMilestonesCount}/${totalMilestonesCount}`} 
          icon={CheckCircle2} 
          helperText="Overall project status"
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
          const savedNote = progress.projectNotes?.[pi] || '';
          const localGithub = githubInputs[pi] ?? savedGithub;
          const localNote = noteInputs[pi] ?? savedNote;

          const isElliotBoss = project.name.toLowerCase().includes('elliot');

          return (
            <div
              key={pi}
              className={`rounded-2xl border backdrop-blur-sm transition-all duration-350 p-5 ${
                isElliotBoss
                  ? 'border-accent-cyan/35 bg-gradient-to-r from-navy-800 to-navy-750/70 shadow-primary-glow-sm relative overflow-hidden'
                  : 'border-navy-500/20 bg-navy-800/80 hover:border-navy-500/40 hover:shadow-card-hover'
              }`}
            >
              {isElliotBoss && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent-cyan/5 rounded-full blur-2xl pointer-events-none" />
              )}

              {/* Header Toggler */}
              <button
                onClick={() => setExpanded(isExpanded ? -1 : pi)}
                className="w-full text-left"
              >
                <div className="flex items-start gap-4">
                  {/* Badge Index */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm font-mono
                    ${percent === 100
                      ? 'bg-blue-500/20 border border-blue-500/40 text-blue-400'
                      : isElliotBoss
                      ? 'bg-accent-cyan/15 border border-accent-cyan/30 text-accent-cyan shadow-primary-glow-sm'
                      : percent > 0
                      ? 'bg-accent-primary/15 border border-accent-primary/30 text-accent-primary'
                      : 'bg-navy-750 border border-navy-500/40 text-slate-500'
                    }`}
                  >
                    {percent === 100 ? '✓' : isElliotBoss ? <img src="/xcelerate-icon.png" alt="Xcelerate" className="w-5 h-5 object-contain opacity-80" /> : `${pi + 1}`}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-white text-base leading-snug">{project.name}</h3>
                      {isElliotBoss && (
                        <span className="bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 text-xs px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-accent-cyan" /> CAPSTONE BOSS
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1 leading-relaxed">{project.description}</p>
                    
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex-1">
                        <ProgressBar percent={percent} colorClass={isElliotBoss ? 'bg-gradient-to-r from-accent-cyan to-accent-primary' : 'bg-gradient-to-r from-accent-primary to-blue-500'} />
                      </div>
                      <span className="text-[13px] text-slate-500 font-mono flex-shrink-0 font-bold">
                        {done.length}/{total} Milestones · {percent}%
                      </span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 mt-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </div>
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="mt-5 pt-5 border-t border-navy-500/20 space-y-5 animate-slide-up">
                  <div>
                    <span className="text-[13px] font-bold text-slate-400 block mb-1.5">
                      Project Brief
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{project.description}</p>
                  </div>

                  {/* Milestones list */}
                  <div>
                    <span className="text-[13px] font-bold text-slate-400 block mb-3">
                      Build Milestones
                    </span>
                    <div className="space-y-2.5">
                      {project.milestones?.map((milestone, mi) => {
                        const mDone = done.includes(mi);
                        return (
                          <button
                            key={mi}
                            onClick={() => toggleProjectMilestone(pi, mi)}
                            className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 active:scale-95
                              ${mDone
                                ? 'bg-blue-500/5 border-blue-500/20 text-slate-400 hover:border-blue-500/30'
                                : 'bg-navy-800/40 border-navy-500/20 hover:border-navy-500/40 text-slate-200'
                              }`}
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all duration-200
                              ${mDone ? 'border-blue-500 bg-blue-500/20' : 'border-navy-300 bg-navy-900'}`}
                            >
                              {mDone && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                              )}
                            </div>
                            <span className={`text-xs ${mDone ? 'line-through text-slate-500 font-medium' : 'font-semibold text-slate-200'}`}>
                              {milestone}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Github Link */}
                    <div>
                      <span className="text-[13px] font-bold text-slate-400 block mb-1.5">
                        Repository Link
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="https://github.com/dave/ellio-v1"
                          value={localGithub}
                          onChange={(e) => setGithubInputs((prev) => ({ ...prev, [pi]: e.target.value }))}
                          className="input-base flex-1 text-xs"
                        />
                        <button
                          onClick={() => {
                            setProjectGithubLink(pi, localGithub);
                            alert('GitHub link updated.');
                          }}
                          className="bg-navy-700/60 border border-navy-500 hover:text-white font-bold px-4 py-2 rounded-xl text-xs active:scale-95 transition-all"
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

                    {/* Project Notes */}
                    <div>
                      <span className="text-[13px] font-bold text-slate-400 block mb-1.5 flex items-center justify-between">
                        Project Notes
                        {savedNote && <span className="text-accent-primary text-[10px] font-bold">Saved</span>}
                      </span>
                      <textarea
                        placeholder="Capture issues, design patterns, and package choices made during development."
                        value={localNote}
                        onChange={(e) => setNoteInputs((prev) => ({ ...prev, [pi]: e.target.value }))}
                        rows={3}
                        className="input-base w-full text-xs resize-none"
                      />
                      <button
                        onClick={() => {
                          setProjectNote(pi, localNote);
                          alert('Project notes updated.');
                        }}
                        className="bg-navy-700/60 border border-navy-500 hover:text-white font-bold px-4 py-2 rounded-xl text-xs active:scale-95 transition-all mt-2.5"
                      >
                        Save Notes
                      </button>
                    </div>
                  </div>

                  {/* Status completion badges */}
                  {percent === 100 && (
                    <div className="flex items-center gap-3 p-3.5 bg-blue-500/10 border border-blue-500/25 rounded-xl">
                      <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <p className="text-blue-400 font-bold text-xs">
                        {isElliotBoss ? 'Final Target Complete! Elliot V1 stands assembled. 🤖' : 'Project Complete!'}
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
