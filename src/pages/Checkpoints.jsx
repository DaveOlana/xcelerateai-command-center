import React, { useState } from 'react';
import { CheckCircle2, Circle, TrendingUp, ChevronDown, ChevronUp, Link as LinkIcon, ExternalLink, ShieldCheck, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ImportRequiredCard from '../components/common/ImportRequiredCard';
import { PageShell, PageHeader, SectionCard, StatusBadge, ProgressBar } from '../components/common/UIComponents';

const STATUS_CONFIG = {
  'Not yet': {
    color: 'text-slate-400',
    bg: 'bg-slate-700/40 border-slate-600/50',
    active: 'bg-slate-700 border-slate-500 text-slate-200 shadow-md',
    dot: 'bg-slate-500',
  },
  'Learning': {
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    active: 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-md',
    dot: 'bg-amber-400',
  },
  'Confident': {
    color: 'text-accent-primary',
    bg: 'bg-accent-primary/10 border-accent-primary/20',
    active: 'bg-accent-primary/20 border-accent-primary/50 text-accent-primary shadow-primary-glow-sm',
    dot: 'bg-accent-primary',
  },
};

export default function Checkpoints() {
  const { roadmap, checkpointStatuses, setCheckpointStatus } = useApp();

  const checkpoints = roadmap?.checkpoints || [];
  const projects = roadmap?.projects || [];
  const [activeEvidenceSkill, setActiveEvidenceSkill] = useState(null);

  // Evidence Form States
  const [explanation, setExplanation] = useState('');
  const [link, setLink] = useState('');
  const [projectProof, setProjectProof] = useState('');

  const stats = React.useMemo(() => {
    return {
      confident: checkpoints.filter((c) => checkpointStatuses[c.skill]?.status === 'Confident').length,
      learning: checkpoints.filter((c) => checkpointStatuses[c.skill]?.status === 'Learning').length,
      notYet: checkpoints.filter((c) => !checkpointStatuses[c.skill] || checkpointStatuses[c.skill]?.status === 'Not yet').length,
    };
  }, [checkpoints, checkpointStatuses]);

  const handleOpenEvidence = (skillRecord) => {
    const current = checkpointStatuses[skillRecord.skill] || {};
    setExplanation(current.explanation || '');
    setLink(current.link || '');
    setProjectProof(current.projectProof || '');
    setActiveEvidenceSkill(skillRecord.skill);
  };

  const handleSaveEvidenceSubmit = (e, skill) => {
    e.preventDefault();
    setCheckpointStatus(skill, 'Confident', {
      explanation,
      link,
      projectProof,
    });
    setActiveEvidenceSkill(null);
  };

  if (checkpoints.length === 0) {
    return (
      <PageShell>
        <PageHeader title="Skill Checkpoints" subtitle="Honest self-assessment of your current skills." />
        <div className="bg-navy-800/40 border border-dashed border-navy-500/30 text-center py-16 px-6 rounded-2xl max-w-md mx-auto">
          <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">No Checkpoints Defined</h4>
          <p className="text-[14px] text-slate-500 mt-1">This roadmap has no skill checkpoints configured. Import a roadmap with a checkpoints array to begin self-assessment.</p>
        </div>
      </PageShell>
    );
  }

  const overallPercent = checkpoints.length > 0 ? Math.round((stats.confident / checkpoints.length) * 100) : 0;

  return (
    <PageShell>
      <PageHeader 
        title="Skill Checkpoints" 
        subtitle="Honest self-assessment of your current skills. Confident ratings require verification."
      />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-navy-800/60 border border-accent-primary/25 rounded-2xl p-4 text-center">
          <p className="text-2xl font-extrabold text-accent-primary text-glow">{stats.confident}</p>
          <p className="text-[13px] text-slate-500 mt-1 uppercase tracking-wider font-bold">Confident</p>
          <div className="w-1.5 h-1.5 rounded-full bg-accent-primary mx-auto mt-2" />
        </div>
        <div className="bg-navy-800/60 border border-amber-500/20 rounded-2xl p-4 text-center">
          <p className="text-2xl font-extrabold text-amber-400">{stats.learning}</p>
          <p className="text-[13px] text-slate-500 mt-1 uppercase tracking-wider font-bold">Learning</p>
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mx-auto mt-2" />
        </div>
        <div className="bg-navy-800/60 border border-navy-500/30 rounded-2xl p-4 text-center">
          <p className="text-2xl font-extrabold text-slate-400">{stats.notYet}</p>
          <p className="text-[13px] text-slate-500 mt-1 uppercase tracking-wider font-bold">Not Yet</p>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-500 mx-auto mt-2" />
        </div>
      </div>

      {/* Overall checkpoint progress */}
      <SectionCard>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-bold text-slate-500 uppercase tracking-widest font-mono">Skill Confidence Meter</span>
          <span className="text-xs font-mono font-bold text-accent-primary">{overallPercent}% Confident</span>
        </div>
        <div className="flex h-2.5 bg-navy-950 rounded-full overflow-hidden w-full gap-0.5">
          {stats.confident > 0 && (
            <div
              className="bg-accent-primary rounded-l-full transition-all duration-700"
              style={{ width: `${(stats.confident / checkpoints.length) * 100}%` }}
            />
          )}
          {stats.learning > 0 && (
            <div
              className="bg-amber-400 transition-all duration-700"
              style={{ width: `${(stats.learning / checkpoints.length) * 100}%` }}
            />
          )}
          {stats.notYet > 0 && (
            <div
              className="bg-navy-800 flex-1 rounded-r-full transition-all duration-700"
            />
          )}
        </div>
        <div className="flex items-center gap-4 mt-3 text-[13px] font-medium text-slate-500 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-primary" /> Confident ({stats.confident})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Learning ({stats.learning})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-600" /> Not yet ({stats.notYet})
          </span>
        </div>
      </SectionCard>

      {/* Checkpoint Cards */}
      <div className="space-y-4">
        {checkpoints.map((checkpoint, i) => {
          const currentRecord = checkpointStatuses[checkpoint.skill] || { status: 'Not yet' };
          const statusVal = currentRecord.status || 'Not yet';
          const config = STATUS_CONFIG[statusVal];
          const hasEvidence = currentRecord.explanation || currentRecord.link || currentRecord.projectProof;

          return (
            <div
              key={i}
              className={`rounded-2xl p-5 border bg-navy-800/70 backdrop-blur-sm transition-all duration-300 ${
                statusVal === 'Confident'
                  ? 'border-accent-primary/20 hover:border-accent-primary/30'
                  : statusVal === 'Learning'
                  ? 'border-amber-500/20 hover:border-amber-500/30'
                  : 'border-navy-500/20 hover:border-navy-500/40'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${config.dot}`} />
                    <span className="text-[13px] font-bold text-slate-500 uppercase tracking-widest font-mono" title={checkpoint.skill}>{checkpoint.skill}</span>
                  </div>
                  <p className="text-sm font-medium text-white italic leading-relaxed">
                    {checkpoint.question ? `"${checkpoint.question}"` : <span className="text-slate-500 not-italic">No assessment question provided in the roadmap</span>}
                  </p>
                </div>

                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[13px] font-mono font-bold uppercase tracking-wider border ${
                    statusVal === 'Confident' ? 'bg-accent-primary/10 text-accent-primary border-accent-primary/20' :
                    statusVal === 'Learning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-navy-700 text-slate-400 border-navy-500/50'
                  }`}>
                    {statusVal}
                  </span>
                </div>
              </div>

              {/* Status buttons */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                {['Not yet', 'Learning', 'Confident'].map((status) => {
                  const sCfg = STATUS_CONFIG[status];
                  const isActive = statusVal === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        if (status === 'Confident') {
                          handleOpenEvidence(checkpoint);
                        } else {
                          setCheckpointStatus(checkpoint.skill, status);
                        }
                      }}
                      className={`py-2 px-2 rounded-xl border text-[13px] font-bold uppercase tracking-wider transition-all duration-200 active:scale-95
                        ${isActive ? sCfg.active : `${sCfg.bg} ${sCfg.color} hover:opacity-85`}`}
                    >
                      {status === 'Confident' && isActive && <Check className="w-3.5 h-3.5 inline mr-1" />}
                      {status === 'Confident' ? 'Verify Proof' : status}
                    </button>
                  );
                })}
              </div>

              {/* Evidence details display */}
              {statusVal === 'Confident' && hasEvidence && (
                <div className="bg-navy-900 border border-navy-500/40 rounded-xl p-3.5 mt-3.5 space-y-2.5 text-xs text-slate-400 font-mono">
                  <div className="flex justify-between items-center border-b border-navy-800 pb-1.5">
                    <span className="font-bold text-accent-primary uppercase text-[13px] tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Confidence Proof
                    </span>
                    <button onClick={() => handleOpenEvidence(checkpoint)} className="text-[13px] text-slate-500 hover:text-white transition-colors">
                      Edit Evidence
                    </button>
                  </div>
                  {currentRecord.explanation && (
                    <div>
                      <span className="font-semibold text-slate-500 block mb-0.5">My Explanation:</span>
                      <p className="text-slate-300 leading-relaxed font-sans">{currentRecord.explanation}</p>
                    </div>
                  )}
                  {currentRecord.projectProof && (
                    <div>
                      <span className="font-semibold text-slate-500 block mb-0.5">Project Reference:</span>
                      <p className="text-white font-medium font-sans">{currentRecord.projectProof}</p>
                    </div>
                  )}
                  {currentRecord.link && (
                    <div className="flex items-center gap-1 text-[14px] pt-1">
                      <span className="font-semibold text-slate-500">Evidence Link:</span>
                      <a href={currentRecord.link} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline flex items-center gap-0.5">
                        {currentRecord.link} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Evidence Modal overlay */}
              {activeEvidenceSkill === checkpoint.skill && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
                  <div className="bg-navy-850 border border-navy-500/60 rounded-2xl w-full max-w-md p-6 animate-scale-in text-left shadow-card">
                    <div className="flex items-center justify-between mb-4 border-b border-navy-500/40 pb-3">
                      <div>
                        <h3 className="font-bold text-white text-sm uppercase tracking-wider">Save Skill Evidence</h3>
                        <p className="text-[13px] text-slate-500 mt-0.5">Provide proof context to unlock Confident rating.</p>
                      </div>
                      <button onClick={() => setActiveEvidenceSkill(null)} className="text-slate-400 hover:text-white transition-colors">
                        <ChevronDown className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={(e) => handleSaveEvidenceSubmit(e, checkpoint.skill)} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">Explanation in your own words *</label>
                        <textarea
                          rows={3}
                          value={explanation}
                          onChange={(e) => setExplanation(e.target.value)}
                          placeholder="e.g. variables declared with let are block scoped; const values cannot be reassigned."
                          className="input-base w-full text-xs"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">Evidence Link / GitHub Reference</label>
                        <input
                          type="url"
                          value={link}
                          onChange={(e) => setLink(e.target.value)}
                          placeholder="https://github.com/..."
                          className="input-base w-full text-xs font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">Project Proof Title</label>
                        <select
                          value={projectProof}
                          onChange={(e) => setProjectProof(e.target.value)}
                          className="input-base w-full text-xs"
                        >
                          <option value="">Select Project...</option>
                          {projects.length > 0 ? (
                            projects.map((p, pi) => (
                              <option key={p.id || pi} value={p.name || p.title}>{p.name || p.title}</option>
                            ))
                          ) : (
                            <option value="" disabled>No projects defined in roadmap</option>
                          )}
                        </select>
                      </div>

                      <div className="flex gap-2 justify-end pt-3 border-t border-navy-500/40">
                        <button
                          type="button"
                          onClick={() => setActiveEvidenceSkill(null)}
                          className="bg-navy-700/60 border border-navy-500/80 text-slate-300 font-bold px-4 py-2 rounded-xl hover:text-white transition-all text-xs uppercase tracking-wider"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-accent-primary text-navy-900 font-bold px-4 py-2 rounded-xl hover:bg-accent-primary-dim transition-all text-xs uppercase tracking-wider shadow-primary-glow-sm"
                        >
                          Verify Confidence
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
