import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Github, Image, CheckSquare, Film, Calendar, CheckCircle2, AlertTriangle, ExternalLink, ShieldAlert, ShieldCheck } from 'lucide-react';
import { PageShell, PageHeader, SectionCard, StatusBadge } from '../components/common/UIComponents';

export default function ProofOfWork() {
  const { roadmap, weekProofs, submitWeekProof, settings } = useApp();
  const [selectedWeekNum, setSelectedWeekNum] = useState(settings.activeWeek);

  // Collect all weeks flat
  const weeks = [];
  roadmap?.months?.forEach((month) => {
    month.weeks?.forEach((week) => {
      weeks.push({
        weekNumber: week.weekNumber,
        title: week.title,
        monthNumber: month.monthNumber,
        deliverable: week.deliverable,
      });
    });
  });

  const activeWeekInfo = weeks.find((w) => w.weekNumber === selectedWeekNum);
  const currentProof = weekProofs[selectedWeekNum] || {
    githubRepoLink: '',
    githubCommitLink: '',
    screenshotNote: '',
    readmeCompleted: false,
    reflectionCompleted: false,
    demoVideoLink: '',
  };

  // Form states
  const [repo, setRepo] = useState(currentProof.githubRepoLink);
  const [commit, setCommit] = useState(currentProof.githubCommitLink);
  const [screenshot, setScreenshot] = useState(currentProof.screenshotNote);
  const [readme, setReadme] = useState(currentProof.readmeCompleted);
  const [reflection, setReflection] = useState(currentProof.reflectionCompleted);
  const [video, setVideo] = useState(currentProof.demoVideoLink);
  const [saved, setSaved] = useState(false);

  // Validation States
  const [errors, setErrors] = useState({ repo: '', commit: '', video: '', readme: '' });

  // Sync state when week changes
  React.useEffect(() => {
    const proof = weekProofs[selectedWeekNum] || {
      githubRepoLink: '',
      githubCommitLink: '',
      screenshotNote: '',
      readmeCompleted: false,
      reflectionCompleted: false,
      demoVideoLink: '',
    };
    setRepo(proof.githubRepoLink || '');
    setCommit(proof.githubCommitLink || '');
    setScreenshot(proof.screenshotNote || '');
    setReadme(proof.readmeCompleted || false);
    setReflection(proof.reflectionCompleted || false);
    setVideo(proof.demoVideoLink || '');
    setSaved(false);
    setErrors({ repo: '', commit: '', video: '', readme: '' });
  }, [selectedWeekNum, weekProofs]);

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = { repo: '', commit: '', video: '', readme: '' };
    let hasError = false;

    if (!repo.trim()) {
      newErrors.repo = 'Repository link is required.';
      hasError = true;
    } else if (!repo.startsWith('https://github.com/')) {
      newErrors.repo = 'Repository link must start with https://github.com/';
      hasError = true;
    } else if (!isValidUrl(repo)) {
      newErrors.repo = 'Please enter a valid URL.';
      hasError = true;
    }

    if (!commit.trim()) {
      newErrors.commit = 'Commit link is required.';
      hasError = true;
    } else if (!commit.startsWith('https://github.com/')) {
      newErrors.commit = 'Commit link must start with https://github.com/';
      hasError = true;
    } else if (!isValidUrl(commit)) {
      newErrors.commit = 'Please enter a valid URL.';
      hasError = true;
    }

    if (video.trim() && !isValidUrl(video)) {
      newErrors.video = 'Please enter a valid URL.';
      hasError = true;
    }

    if (!readme) {
      newErrors.readme = 'Confirmation of README completion is required.';
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    submitWeekProof(selectedWeekNum, {
      githubRepoLink: repo,
      githubCommitLink: commit,
      screenshotNote: screenshot,
      readmeCompleted: readme,
      reflectionCompleted: reflection,
      demoVideoLink: video,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };
  const isProofComplete = (proof) => {
    return proof && proof.githubRepoLink && proof.githubCommitLink && proof.readmeCompleted;
  };

  return (
    <PageShell>
      <PageHeader 
        title="Proof of Work" 
        subtitle="Provide evidence of your build outcomes. Required for completing major modules."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Week Selector Sidebar */}
        <div className="bg-navy-800/80 border border-navy-500/30 rounded-2xl p-4 flex flex-col h-[calc(100vh-220px)] backdrop-blur-sm">
          <span className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">
            Timeline Weeks
          </span>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {weeks.map((w) => {
              const proof = weekProofs[w.weekNumber];
              const exists = proof && (proof.githubRepoLink || proof.githubCommitLink);
              const active = w.weekNumber === selectedWeekNum;
              const complete = isProofComplete(proof);

              return (
                <button
                  key={w.weekNumber}
                  onClick={() => setSelectedWeekNum(w.weekNumber)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-200 ${
                    active
                      ? 'bg-accent-primary/10 border-accent-primary/35 text-white shadow-primary-glow-sm'
                      : exists
                      ? complete
                        ? 'bg-blue-500/5 border-blue-500/20 text-slate-300 hover:border-blue-500/40'
                        : 'bg-amber-500/5 border-amber-500/20 text-slate-300 hover:border-amber-500/40'
                      : 'bg-navy-800/30 border-navy-500/20 text-slate-400 hover:text-slate-200 hover:border-navy-500/50'
                  }`}
                >
                  <div className="min-w-0 pr-2 font-sans">
                    <p className={`text-xs font-bold uppercase tracking-wider ${active ? 'text-accent-primary' : 'text-slate-500'}`}>
                      Week {w.weekNumber}
                    </p>
                    <p className="text-xs font-bold truncate mt-0.5">{w.title}</p>
                  </div>

                  <div className="flex-shrink-0">
                    {exists ? (
                      complete ? (
                        <CheckCircle2 className="w-4 h-4 text-blue-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      )
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-navy-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Proof Submission Console */}
        {activeWeekInfo && (
          <div className="lg:col-span-2 space-y-5">
            {/* Week Context */}
            <div className="bg-navy-800/80 border border-navy-500/30 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                <span>Week {activeWeekInfo.weekNumber} Deliverable</span>
                <span>·</span>
                <span>Month {activeWeekInfo.monthNumber}</span>
              </div>
              <h2 className="text-base font-bold text-white mb-2">{activeWeekInfo.title}</h2>
              <div className="bg-navy-900 border border-navy-500/40 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed italic">
                "{activeWeekInfo.deliverable || 'No deliverable specified in roadmap.'}"
              </div>
            </div>

            {/* Proof Input Form */}
            <form onSubmit={handleSubmit} className="bg-navy-800/80 border border-navy-500/30 rounded-2xl p-5 backdrop-blur-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-navy-500/30 pb-3">
                <Github className="w-4 h-4 text-accent-primary" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Evidence Submission Deck</h3>
              </div>

              {/* ── REQUIRED SECTION ── */}
              <div className="space-y-4">
                <div className="border-l-2 border-brand-blue pl-3 py-1">
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Required Deliverables</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">These metrics are mandatory to verify and unlock progress.</p>
                </div>

                {/* GitHub Repo */}
                <div className="space-y-1">
                  <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    GitHub Repository Link *
                    {repo && !errors.repo && (
                      <a href={repo} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline flex items-center gap-0.5">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </label>
                  <input
                    type="text"
                    placeholder="https://github.com/your-username/your-project"
                    value={repo}
                    onChange={(e) => setRepo(e.target.value)}
                    className={`input-base w-full text-xs font-mono ${errors.repo ? 'border-brand-red/50 focus:border-brand-red' : ''}`}
                  />
                  {errors.repo && <p className="text-[11px] text-brand-red font-bold mt-1">{errors.repo}</p>}
                </div>

                {/* GitHub Commit Link */}
                <div className="space-y-1">
                  <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    GitHub Commit Link *
                    {commit && !errors.commit && (
                      <a href={commit} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline flex items-center gap-0.5">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </label>
                  <input
                    type="text"
                    placeholder="https://github.com/your-username/your-project/commit/..."
                    value={commit}
                    onChange={(e) => setCommit(e.target.value)}
                    className={`input-base w-full text-xs font-mono ${errors.commit ? 'border-brand-red/50 focus:border-brand-red' : ''}`}
                  />
                  {errors.commit && <p className="text-[11px] text-brand-red font-bold mt-1">{errors.commit}</p>}
                </div>

                {/* README Checkbox */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setReadme(!readme)}
                    className={`w-full flex items-center gap-2.5 p-3 rounded-xl border text-left text-xs font-bold transition-all duration-200 active:scale-98 ${
                      readme
                        ? 'bg-accent-primary/10 border-accent-primary/25 text-white'
                        : errors.readme
                        ? 'bg-brand-red/5 border-brand-red/20 text-slate-400'
                        : 'bg-navy-800/40 border-navy-500/20 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${readme ? 'border-accent-primary bg-accent-primary/20' : 'border-navy-300'}`}>
                      {readme && <CheckCircle2 className="w-3 h-3 text-accent-primary" />}
                    </div>
                    <span>Confirm README is completed and customized *</span>
                  </button>
                  {errors.readme && <p className="text-[11px] text-brand-red font-bold mt-1">{errors.readme}</p>}
                </div>
              </div>

              {/* ── OPTIONAL SECTION ── */}
              <div className="space-y-4 pt-2 border-t border-navy-700/20">
                <div className="border-l-2 border-slate-500 pl-3 py-1">
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Optional Metadata additions</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Provide optional context to build your portfolio credibility.</p>
                </div>

                {/* Demo Video Link */}
                <div className="space-y-1">
                  <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    Demo Video Link
                    {video && !errors.video && (
                      <a href={video} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline flex items-center gap-0.5">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </label>
                  <input
                    type="text"
                    placeholder="https://youtube.com/watch?v=... or Loom URL"
                    value={video}
                    onChange={(e) => setVideo(e.target.value)}
                    className={`input-base w-full text-xs font-mono ${errors.video ? 'border-brand-red/50 focus:border-brand-red' : ''}`}
                  />
                  {errors.video && <p className="text-[11px] text-brand-red font-bold mt-1">{errors.video}</p>}
                </div>

                {/* Screenshot Notes */}
                <div className="space-y-1">
                  <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">Screenshot Note / Local File Path</label>
                  <input
                    type="text"
                    placeholder="e.g. C:/Users/HP/Screenshots/status-board.png or relative description"
                    value={screenshot}
                    onChange={(e) => setScreenshot(e.target.value)}
                    className="input-base w-full text-xs"
                  />
                </div>

                {/* Reflection Checkbox */}
                <div>
                  <button
                    type="button"
                    onClick={() => setReflection(!reflection)}
                    className={`w-full flex items-center gap-2.5 p-3 rounded-xl border text-left text-xs font-bold transition-all duration-200 active:scale-[0.99] ${
                      reflection
                        ? 'bg-accent-primary/10 border-accent-primary/25 text-white'
                        : 'bg-navy-800/40 border-navy-500/20 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${reflection ? 'border-accent-primary bg-accent-primary/20' : 'border-navy-300'}`}>
                      {reflection && <CheckCircle2 className="w-3 h-3 text-accent-primary" />}
                    </div>
                    <span>Mark Reflection Journal complete</span>
                  </button>
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex gap-3 justify-end pt-3 border-t border-navy-500/20 items-center">
                {saved && (
                  <span className="text-[13px] font-bold text-accent-primary uppercase tracking-wider animate-fade-in">
                    ✓ Evidence Saved Successfully
                  </span>
                )}
                <button
                  type="submit"
                  className="bg-accent-primary text-navy-900 font-bold px-5 py-2.5 rounded-xl hover:bg-accent-primary-dim active:scale-95 transition-all text-xs uppercase tracking-wider shadow-primary-glow"
                >
                  Save Proof & Verify
                </button>
              </div>
            </form>

            {/* Validation Banner */}
            <div className={`rounded-2xl p-4 border backdrop-blur-sm flex items-start gap-3 transition-all ${
              isProofComplete(currentProof) 
                ? 'border-blue-500/20 bg-blue-500/5' 
                : 'border-amber-500/25 bg-amber-500/5'
            }`}>
              {isProofComplete(currentProof) ? (
                <>
                  <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Verification Complete</h4>
                    <p className="text-[14px] text-slate-400 mt-1 leading-relaxed">
                      All minimum proof requirements (GitHub Repo, Commit, and README checkbox) are active. This week's core deliverable stands approved.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-semibold">Missing Proof Metrics</h4>
                    <p className="text-[14px] text-slate-400 mt-1 leading-relaxed">
                      To complete Week {selectedWeekNum}, you must submit the GitHub repository link, the commit link, and check the README completion checkbox.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
