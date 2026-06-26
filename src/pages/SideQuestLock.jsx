import React, { useState } from 'react';
import { Shield, Sparkles, AlertTriangle, EyeOff, Lock, Check } from 'lucide-react';
import { PageShell, PageHeader, SectionCard, CommandButton, SecondaryButton, StatusBadge, InfoPill } from '../components/common/UIComponents';
import { useApp } from '../context/AppContext';

export default function SideQuestLock() {
  const { roadmap, userProfile, settings } = useApp();
  const roadmapTitle = roadmap?.title || roadmap?.bootcampTitle || 'Active Roadmap';
  const roadmapShortTitle = roadmap?.shortTitle || roadmapTitle;
  const displayName = userProfile?.displayName || userProfile?.name || roadmap?.learner || 'Operator';

  const [activeQuest, setActiveQuest] = useState(null);
  const [shieldPower, setShieldPower] = useState(100);
  const [shieldGlow, setShieldGlow] = useState(false);

  const lockedQuests = [
    { id: 'kotlin', name: 'Kotlin Native Android Apps', temptation: 'Why learn Java/JS when Kotlin is native Android standard?', lockReason: `You are on a JS-first path. Complete React Native and build your project's Android base first.`, timeSaved: '120 Hours' },
    { id: 'swift', name: 'Swift iOS Development', temptation: 'Should I build iOS apps natively in Xcode using Swift?', lockReason: 'Expo and React Native cover cross-platform deployment. Xcode is a major setup drag for a beginner.', timeSaved: '150 Hours' },
    { id: 'python', name: 'Python AI & PyTorch models', temptation: 'I want to build my own local LLM model weights!', lockReason: `${displayName}, you need to build the API interface first. Connect to open APIs using JS before training models.`, timeSaved: '200 Hours' },
    { id: 'playstore', name: 'Google Play Store Publishing', temptation: 'Let\'s create a developer account and push alpha builds.', lockReason: 'Store setups cost money and take weeks. Keep testing on Expo Go; publish your capstone at the end.', timeSaved: '40 Hours' },
    { id: 'gmail', name: 'Advanced Gmail Automation APIs', temptation: `I want my AI assistant to draft and delete email drafts autonomously.`, lockReason: 'OAuth2 credential setups are complex and introduce security risks. Stick to local notes first.', timeSaved: '60 Hours' },
    { id: 'social', name: 'Autopilot Social Media Bot', temptation: 'Let\'s write twitter and instagram scheduling pipelines.', lockReason: 'This will drain your focus from basic JavaScript DOM events and UI loops. Locked.', timeSaved: '50 Hours' },
    { id: 'voice', name: 'Real-time Voice Assistant Integration', temptation: 'Let\'s add WebRTC speech recognition and text-to-speech.', lockReason: 'Voice pipelines require heavy backend resources. Complete core text features first.', timeSaved: '100 Hours' },
    { id: 'cloud', name: 'Complex Multi-Region Cloud Infrastructure', temptation: 'Let\'s set up AWS ECS, Kubernetes and global CDN.', lockReason: 'Deploy to Vercel and Netlify for free in 1 minute. Cloud complexity blocks simple builds.', timeSaved: '80 Hours' },
    { id: 'memory', name: 'Advanced Vector DB Long-Term Memory', temptation: 'I want to integrate Pinecone, pgvector and rag flows.', lockReason: 'Begin with standard browser localStorage memory. Move to databases later.', timeSaved: '90 Hours' },
  ];

  const handleQuestClick = (quest) => {
    setActiveQuest(quest);
    setShieldGlow(true);
    setShieldPower(100);
    setTimeout(() => setShieldGlow(false), 800);
  };

  const totalTimeSaved = '890 Hours';

  return (
    <PageShell>
      <PageHeader
        title="Side Quest Lock"
        subtitle={`Prevent shiny object syndrome. Focus strictly on ${roadmapShortTitle} core milestones.`}
        actions={
          <div className="bg-blue-500/5 border border-blue-500/20 py-2.5 px-4 rounded-xl text-center flex-shrink-0">
            <p className="text-[13px] text-slate-500 uppercase tracking-wider">Total Focus Time Saved</p>
            <p className="text-sm font-bold text-blue-400 font-mono mt-0.5 flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-accent-primary" /> {totalTimeSaved}</p>
          </div>
        }
      />

      {/* Focus Shield Indicator */}
      <div className="card relative overflow-hidden flex flex-col items-center py-8 text-center bg-gradient-to-b from-navy-800 to-navy-900 border border-navy-400">
        <div className="absolute inset-0 bg-glow-primary opacity-20 pointer-events-none" />
        
        {/* Shield graphic */}
        <div className="relative mb-4">
          <div className={`absolute inset-0 rounded-full bg-accent-primary/20 blur-xl transition-all duration-300 ${shieldGlow ? 'scale-150 opacity-100' : 'scale-100 opacity-0'}`} />
          <div className={`w-20 h-20 rounded-full border-2 border-accent-primary/30 flex items-center justify-center transition-all duration-700 ${shieldGlow ? 'border-accent-primary scale-105 bg-accent-primary/10' : 'bg-navy-700'}`}>
            <Shield className={`w-10 h-10 transition-transform duration-300 ${shieldGlow ? 'text-accent-primary scale-110' : 'text-slate-400'}`} />
          </div>
        </div>

        <h2 className="text-lg font-bold text-white mb-1">XcelerateAI Command Guard</h2>
        <p className="text-xs text-slate-400 max-w-sm mb-4">
          Deflecting complex out-of-scope frameworks to keep your learning velocity high.
        </p>

        {/* Shield Stats */}
        <div className="flex gap-6 text-center">
          <div>
            <p className="text-xs text-slate-500">Shield Status</p>
            <p className="text-sm font-semibold text-accent-primary uppercase mt-0.5">Deflecting</p>
          </div>
          <div className="w-px bg-navy-600 self-stretch" />
          <div>
            <p className="text-xs text-slate-500">Shield Health</p>
            <p className="text-sm font-mono font-semibold text-accent-cyan mt-0.5">{shieldPower}%</p>
          </div>
        </div>
      </div>

      {/* Grid of locked side quests */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lockedQuests.map((q) => {
          const active = activeQuest?.id === q.id;
          return (
            <button
              key={q.id}
              onClick={() => handleQuestClick(q)}
              className={`card text-left card-hover flex flex-col justify-between gap-4 border transition-all ${
                active ? 'border-accent-primary bg-accent-primary/5 ring-1 ring-accent-primary/20' : 'border-navy-400'
              }`}
            >
              <div className="space-y-2 w-full">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-semibold">
                    Locked
                  </span>
                  <span className="text-[13px] text-slate-500 font-mono">Locks {q.timeSaved}</span>
                </div>
                <h3 className="font-bold text-white text-sm line-clamp-1">{q.name}</h3>
                <p className="text-xs text-slate-500 italic">"I want to: {q.temptation}"</p>
              </div>

              <div className="flex items-center gap-1 text-[14px] font-semibold text-accent-cyan mt-2">
                <Lock className="w-3.5 h-3.5" /> Later, not now
              </div>
            </button>
          );
        })}
      </div>

      {/* Focus Shield Modal */}
      {activeQuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="card w-full max-w-md bg-navy-800 border border-navy-400 animate-scale-in text-center py-6">
            <div className="relative mx-auto mb-4 w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <EyeOff className="w-8 h-8 text-red-400" />
            </div>

            <h3 className="text-lg font-bold text-white">Distraction Blocked</h3>
            <p className="text-xs text-accent-primary font-bold uppercase tracking-wider mt-1">
              Focus Shield: 100% · Build {roadmapShortTitle} First
            </p>

            <div className="bg-navy-950 border border-navy-400 rounded-xl p-4 my-4 text-left space-y-3">
              <div>
                <span className="text-[13px] text-slate-500 uppercase tracking-wider font-bold">Shiny Object</span>
                <h4 className="text-sm font-bold text-white mt-0.5">{activeQuest.name}</h4>
              </div>

              <div>
                <span className="text-[13px] text-slate-500 uppercase tracking-wider font-bold">Why it is tempting</span>
                <p className="text-xs text-slate-400 mt-0.5 italic">"{activeQuest.temptation}"</p>
              </div>

              <div className="border-t border-navy-400/50 pt-2.5">
                <span className="text-[13px] text-slate-500 uppercase tracking-wider font-bold">Focus Guard Reason</span>
                <p className="text-xs text-amber-300 mt-0.5">{activeQuest.lockReason}</p>
              </div>
            </div>

            <button
              onClick={() => setActiveQuest(null)}
              className="btn-primary w-full flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Focus Shield Acknowledged
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
