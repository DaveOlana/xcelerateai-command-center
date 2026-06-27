import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Github, Image, CheckSquare, Film, Calendar, CheckCircle2, 
  AlertTriangle, ExternalLink, ShieldAlert, ShieldCheck, 
  Sparkles, FileText, ArrowRight, Clipboard 
} from 'lucide-react';
import { PageShell, PageHeader, SectionCard, MetricCard, StatusBadge } from '../components/common/UIComponents';

export default function ProofOfWork() {
  const { roadmap, weekProofs, submitWeekProof, settings } = useApp();
  const navigate = useNavigate();
  
  const [selectedWeekNum, setSelectedWeekNum] = useState(settings.activeWeek);
  const submissionFormRef = useRef(null);

  // Collect all weeks flat
  const weeks = useMemo(() => {
    const list = [];
    roadmap?.months?.forEach((month) => {
      month.weeks?.forEach((week) => {
        list.push({
          weekNumber: week.weekNumber,
          title: week.title,
          monthNumber: month.monthNumber,
          deliverable: week.deliverable,
          proofOfWork: week.proofOfWork,
        });
      });
    });
    return list;
  }, [roadmap]);

  const activeWeekInfo = weeks.find((w) => w.weekNumber === selectedWeekNum);
  
  // Current proof database object
  const currentProof = weekProofs[selectedWeekNum] || {
    githubRepoLink: '',
    githubCommitLink: '',
    screenshotNote: '',
    readmeCompleted: false,
    reflectionCompleted: false,
    demoVideoLink: '',
  };

  // Form states
  const [repo, setRepo] = useState(currentProof.githubRepoLink || '');
  const [commit, setCommit] = useState(currentProof.githubCommitLink || '');
  const [screenshot, setScreenshot] = useState(currentProof.screenshotNote || '');
  const [readme, setReadme] = useState(currentProof.readmeCompleted || false);
  const [reflection, setReflection] = useState(currentProof.reflectionCompleted || false);
  const [video, setVideo] = useState(currentProof.demoVideoLink || '');
  const [saved, setSaved] = useState(false);

  // Validation States
  const [errors, setErrors] = useState({ repo: '', commit: '', video: '', readme: '' });

  // Sync state when week changes
  useEffect(() => {
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

  // Calculate statistics for MetricCards
  const totalWeeks = weeks.length;
  const submittedProofs = weeks.filter(w => {
    const p = weekProofs[w.weekNumber];
    return p && p.githubRepoLink && p.githubCommitLink && p.readmeCompleted;
  });
  const submittedCount = submittedProofs.length;

  const pendingProofs = weeks.filter(w => {
    const req = w.proofOfWork !== false && (w.deliverable || w.proofOfWork);
    if (!req) return false;
    const p = weekProofs[w.weekNumber];
    return !p || !p.githubRepoLink || !p.githubCommitLink || !p.readmeCompleted;
  });
  const pendingCount = pendingProofs.length;

  const scrollToSubmissionForm = () => {
    submissionFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Collect submitted gallery items
  const galleryItems = useMemo(() => {
    return weeks.filter(w => {
      const p = weekProofs[w.weekNumber];
      return p && (p.githubRepoLink || p.githubCommitLink || p.screenshotNote);
    }).map(w => ({
      week: w,
      proof: weekProofs[w.weekNumber]
    }));
  }, [weeks, weekProofs]);

  return (
    <PageShell>
      {/* ── 1. Proof Hero ── */}
      <div className="relative overflow-hidden rounded-radius-xxl border border-border-default bg-bg-surface p-8 lg:p-10 shadow-card flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-brand-cyan/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-brand-violet/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-6 flex-1 text-left w-full z-10">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-brand-cyan animate-pulse" />
            <span className="text-xs text-brand-cyan font-bold tracking-widest uppercase">
              Portfolio Evidence Locker
            </span>
          </div>

          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-heading">
              Proof of Work
            </h1>
            <p className="text-text-secondary mt-3 text-[15px] leading-relaxed max-w-xl">
              Proof turns your learning into evidence you can revisit, share, and build on. Link your GitHub contributions to document your engineering velocity.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-2 no-print">
            <button 
              onClick={scrollToSubmissionForm} 
              className="btn-primary py-3 px-6 text-[14px] font-bold"
            >
              Submit Current Proof
            </button>
            <Link to="/progress" className="btn-secondary py-3 px-6 text-[14px] font-semibold">
              View Progress Overview
            </Link>
          </div>
        </div>

        {/* Small stats layout */}
        <div className="hidden md:flex flex-col items-end gap-1.5 text-right z-10 pr-4">
          <span className="text-4xl font-mono font-extrabold text-white">{submittedCount}</span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Verified Modules</span>
          <ProgressBar percent={totalWeeks > 0 ? (submittedCount / totalWeeks) * 100 : 0} className="w-32 mt-2" colorClass="bg-gradient-to-r from-brand-cyan to-brand-blue" />
        </div>
      </div>

      {/* ── 2. Proof Status Overview Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Verified Submissions"
          value={`${submittedCount}`}
          icon={CheckCircle2}
          accentColor="green"
          helperText={`${submittedCount} of ${totalWeeks} weeks confirmed`}
        />
        <MetricCard
          label="Action Required"
          value={`${pendingCount}`}
          icon={AlertTriangle}
          accentColor={pendingCount > 0 ? "amber" : "blue"}
          helperText={`${pendingCount} pending checkpoints`}
        />
        <MetricCard
          label="Active Week"
          value={`Week ${settings.activeWeek}`}
          icon={Calendar}
          accentColor="cyan"
          helperText="Current study coordinates"
        />
        <MetricCard
          label="Evidence Ratio"
          value={`${totalWeeks > 0 ? Math.round((submittedCount / totalWeeks) * 100) : 0}%`}
          icon={FileText}
          accentColor="violet"
          helperText="Total timeline coverage"
        />
      </div>

      {/* ── 3. Main Workspace Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (1/3 width) - Week Timeline Selector */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-bg-surface border border-border-default rounded-radius-xxl p-5 flex flex-col h-[600px] shadow-sm">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4 px-1">
              Select Module Week
            </span>
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 no-scrollbar">
              {weeks.map((w) => {
                const proof = weekProofs[w.weekNumber];
                const exists = proof && (proof.githubRepoLink || proof.githubCommitLink);
                const active = w.weekNumber === selectedWeekNum;
                const complete = isProofComplete(proof);
                const requiresProof = w.proofOfWork !== false && (w.deliverable || w.proofOfWork);

                let weekBadge = "border-border-default bg-bg-soft/40 text-text-muted";
                if (exists) {
                  weekBadge = complete 
                    ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-455" 
                    : "bg-brand-amber/5 border-brand-amber/25 text-brand-amber";
                }

                return (
                  <button
                    key={w.weekNumber}
                    onClick={() => setSelectedWeekNum(w.weekNumber)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                      active
                        ? 'border-brand-cyan bg-brand-cyan/5 text-white shadow-primary-glow-sm'
                        : 'border-border-default bg-bg-surface hover:border-border-strong hover:bg-bg-soft'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-555 uppercase tracking-wider">Week {w.weekNumber}</span>
                        {!requiresProof && (
                          <span className="text-[8px] bg-navy-900 border border-navy-750 text-slate-550 px-1 py-0.2 rounded">Study Only</span>
                        )}
                      </div>
                      <h4 className="font-bold text-white text-xs mt-1 truncate leading-tight">{w.title}</h4>
                    </div>

                    <div className="flex-shrink-0">
                      {exists ? (
                        complete ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-450" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-brand-amber" />
                        )
                      ) : requiresProof ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-navy-850" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (2/3 width) - Current Requirement, Form, and Gallery */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Week Context */}
          {activeWeekInfo && (
            <SectionCard 
              title={`Week ${activeWeekInfo.weekNumber} Deliverable`} 
              subtitle={`Month ${activeWeekInfo.monthNumber} Course Specification`}
            >
              <div className="space-y-4">
                <h3 className="font-extrabold text-white text-[15px]">{activeWeekInfo.title}</h3>
                
                {activeWeekInfo.deliverable ? (
                  <div className="bg-bg-soft border border-border-default rounded-xl p-4 text-xs text-text-secondary leading-relaxed italic">
                    " {activeWeekInfo.deliverable} "
                  </div>
                ) : (
                  <div className="p-4 bg-navy-850 border border-navy-750 rounded-xl text-xs text-slate-550 italic">
                    No active deliverable specified for this module. Verify your study resources to confirm next step tasks.
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {/* Submission Area Form */}
          <div ref={submissionFormRef}>
            <SectionCard 
              title="Submission Cockpit" 
              subtitle={`Submit verification records for Week ${selectedWeekNum}`}
              headerActions={
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                  isProofComplete(currentProof)
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-navy-900 text-slate-500 border-navy-750'
                }`}>
                  {isProofComplete(currentProof) ? 'Verified ✓' : 'Awaiting Proof'}
                           <form onSubmit={handleSubmit} className="space-y-6">
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

                {/* Validation alert banner inside cockpit form */}
                <div className={`rounded-xl p-4 border flex items-start gap-3 transition-all ${
                  isProofComplete({ githubRepoLink: repo, githubCommitLink: commit, readmeCompleted: readme }) 
                    ? 'border-blue-500/20 bg-blue-500/5' 
                    : 'border-brand-amber/20 bg-brand-amber/5'
                }`}>
                  {isProofComplete({ githubRepoLink: repo, githubCommitLink: commit, readmeCompleted: readme }) ? (
                    <>
                      <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Verification Complete</h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                          All minimum proof requirements (GitHub Repo, Commit, and README checkbox) are active. Save this record to submit proof.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-5 h-5 text-brand-amber flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-semibold">Verification Pending</h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                          Repository URL, commit hash link, and README check are required to verify completions.
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Form buttons */}
                <div className="flex gap-3 justify-end pt-3 border-t border-navy-800/40 items-center">
                  {saved && (
                    <span className="text-[11px] font-bold text-accent-primary uppercase tracking-widest animate-fade-in">
                      ✓ Evidence Saved Successfully
                    </span>
                  )}
                  <button
                    type="submit"
                    className="btn-primary py-2.5 px-6 text-xs font-bold uppercase tracking-wider"
              <div className="space-y-4">
                <h3 className="font-extrabold text-white text-[15px]">{activeWeekInfo.title}</h3>
                
                {activeWeekInfo.deliverable ? (
                  <div className="bg-bg-soft border border-border-default rounded-xl p-4 text-xs text-text-secondary leading-relaxed italic">
                    " {activeWeekInfo.deliverable} "
                  </div>
                ) : (
                  <div className="p-4 bg-navy-850 border border-navy-750 rounded-xl text-xs text-slate-550 italic">
                    No active deliverable specified for this module. Verify your study resources to confirm next step tasks.
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {/* Submission Area Form */}
          <div ref={submissionFormRef}>
            <SectionCard 
              title="Submission Cockpit" 
              subtitle={`Submit verification records for Week ${selectedWeekNum}`}
              headerActions={
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                  isProofComplete(currentProof)
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-navy-900 text-slate-500 border-navy-750'
                }`}>
                  {isProofComplete(currentProof) ? 'Verified ✓' : 'Awaiting Proof'}
                </span>
              }
            >
              <form onSubmit={handleSubmit} className="space-y-6">
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

                {/* Validation alert banner inside cockpit form */}
                <div className={`rounded-xl p-4 border flex items-start gap-3 transition-all ${
                  isProofComplete({ githubRepoLink: repo, githubCommitLink: commit, readmeCompleted: readme }) 
                    ? 'border-blue-500/20 bg-blue-500/5' 
                    : 'border-brand-amber/20 bg-brand-amber/5'
                }`}>
                  {isProofComplete({ githubRepoLink: repo, githubCommitLink: commit, readmeCompleted: readme }) ? (
                    <>
                      <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Verification Complete</h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                          All minimum proof requirements (GitHub Repo, Commit, and README checkbox) are active. Save this record to submit proof.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-5 h-5 text-brand-amber flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-semibold">Verification Pending</h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                          Repository URL, commit hash link, and README check are required to verify completions.
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Form buttons */}
                <div className="flex gap-3 justify-end pt-3 border-t border-navy-800/40 items-center">
                  {saved && (
                    <span className="text-[11px] font-bold text-accent-primary uppercase tracking-widest animate-fade-in">
                      ✓ Evidence Saved Successfully
                    </span>
                  )}
                  <button
                    type="submit"
                    className="btn-primary py-2.5 px-6 text-xs font-bold uppercase tracking-wider"
                  >
                    Save Proof & Verify
                  </button>
                </div>
              </form>
          >
            {galleryItems.length === 0 ? (
              <div className="text-center py-10 text-slate-500 italic bg-navy-850/20 border border-navy-800/40 rounded-xl">
                No proof submitted yet. Your first submission will appear here.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4 pt-1">
                {galleryItems.map(({ week: w, proof }) => {
                  const isVerified = isProofComplete(proof);
                  
                  return (
                    <div key={w.weekNumber} className={`bg-bg-soft border rounded-2xl p-5 space-y-4 flex flex-col justify-between transition-all hover:border-border-strong ${
                      isVerified ? 'border-emerald-500/10' : 'border-border-default'
                    }`}>
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[10px] font-bold text-slate-550 uppercase tracking-widest">Week {w.weekNumber}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                            isVerified ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-brand-amber/10 text-brand-amber border-brand-amber/20'
                          }`}>
                            {isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-sm leading-snug">{w.title}</h4>
                        
                        {proof.screenshotNote && (
                          <div className="text-[11px] text-slate-450 bg-bg-surface px-2.5 py-1.5 rounded-lg border border-border-divider font-mono truncate">
                            📂 {proof.screenshotNote}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2.5 pt-3 border-t border-navy-800/40 text-xs">
                        <div className="flex gap-2 justify-between">
                          {proof.githubRepoLink && (
                            <a
                              href={proof.githubRepoLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 btn-secondary py-1.5 text-center flex items-center justify-center gap-1 text-[11px]"
                            >
                              <Github className="w-3.5 h-3.5" /> Repository
                            </a>
                          )}
                          {proof.githubCommitLink && (
                            <a
                              href={proof.githubCommitLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 btn-secondary py-1.5 text-center flex items-center justify-center gap-1 text-[11px]"
                            >
                              <FileText className="w-3.5 h-3.5" /> Commit
                            </a>
                          )}
                        </div>
                        {proof.demoVideoLink && (
                          <a
                            href={proof.demoVideoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary w-full py-1.5 text-center flex items-center justify-center gap-1 text-[11px] text-accent-cyan border-accent-cyan/15 hover:bg-accent-cyan/5"
                          >
                            <Film className="w-3.5 h-3.5" /> Demo Video
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          {/* Missing / Pending Proof Section */}
          {pendingCount > 0 && (
            <div className="p-5 bg-brand-amber/5 border border-brand-amber/20 rounded-radius-xxl space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-brand-amber" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Awaiting Verification</h4>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                The following active coordinates require proof submissions before you can mark their weeks complete:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {pendingProofs.map(w => (
                  <button
                    key={w.weekNumber}
                    onClick={() => setSelectedWeekNum(w.weekNumber)}
                    className="px-2.5 py-1 bg-navy-800/80 border border-navy-700 hover:border-brand-amber hover:text-white rounded-lg text-xs font-mono font-bold text-slate-400"
                  >
                    W{w.weekNumber}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </PageShell>
  );
}

