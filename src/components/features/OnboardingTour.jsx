import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, ChevronRight, X, Play, Target } from 'lucide-react';

const TOUR_STEPS = [
  {
    id: 'welcome',
    title: "Welcome to XcelerateAI Command Center",
    description: "This is your mission-control dashboard for building Elliot V1. Track your learning, follow today’s focus, complete missions, prove your work, and monitor your progress.",
    target: 'center'
  },
  {
    id: 'sidebar',
    title: "Sidebar Navigation",
    description: "Use the sidebar to move between Dashboard, Today’s Focus, Weekly Missions, Projects, Progress, and Settings.",
    target: '[data-tour="sidebar"]',
    position: 'right'
  },
  {
    id: 'dashboard-hero',
    title: "Dashboard Overview",
    description: "This is your mission overview. It shows your current bootcamp status, next move, overall progress, and system alerts.",
    target: '[data-tour="dashboard-hero"]',
    position: 'bottom'
  },
  {
    id: 'today-focus',
    title: "Today’s Focus Operations",
    description: "This is where daily execution happens. Start here when you want to study focus resources, log build checklists, submit proofs of work, and record reflections.",
    target: '[data-tour="sidebar-today"]',
    position: 'right'
  },
  {
    id: 'weekly-missions',
    title: "Weekly Mission Modules",
    description: "Weekly Missions contain the structured step-by-step curriculum modules. Complete required tasks to unlock future weeks.",
    target: '[data-tour="sidebar-missions"]',
    position: 'right'
  },
  {
    id: 'project-tracker',
    title: "Project Tracker Workspace",
    description: "Track real projects here, including project briefs, milestones, notes, repository commit links, and current execution statuses.",
    target: '[data-tour="sidebar-projects"]',
    position: 'right'
  },
  {
    id: 'progress',
    title: "Progress Analytics",
    description: "Monitor your overall Elliot readiness index, skill group confidence charts, and completed checklists.",
    target: '[data-tour="sidebar-progress"]',
    position: 'right'
  },
  {
    id: 'import-roadmap',
    title: "Import Roadmap / JSON",
    description: "Load the bootcamp roadmap JSON data here when setting up the Command Center or restoring your timeline files.",
    target: '[data-tour="sidebar-import"]',
    position: 'right'
  },
  {
    id: 'export-progress',
    title: "Export & Settings",
    description: "Access configurations and export progress backups regularly here to safeguard operations or transfer devices.",
    target: '[data-tour="sidebar-settings"]',
    position: 'right'
  },
  {
    id: 'ready',
    title: "You’re Ready",
    description: "Initialize daily tasks inside Today’s Focus, complete one small mission, and keep your progress regularly backed up.",
    target: '[data-tour="dashboard-hero"]',
    position: 'bottom',
    isLast: true
  }
];

export default function OnboardingTour() {
  const { settings } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const tooltipRef = useRef(null);

  // Read localStorage checks on load/render
  useEffect(() => {
    const setupDone = localStorage.getItem('xai_setup_completed_v1') === 'true' || settings.onboardingCompleted;
    const tourSeen = localStorage.getItem('xai_onboarding_seen_v1') === 'true';

    // Start tour only on Dashboard path '/'
    if (setupDone && !tourSeen && location.pathname === '/') {
      setActive(true);
      setStepIndex(0);
    }
  }, [settings.onboardingCompleted, location.pathname]);

  // Handle global page listen window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync / Calculate spotlight bounding box
  useEffect(() => {
    if (!active) return;
    const currentStep = TOUR_STEPS[stepIndex];

    if (!currentStep || currentStep.target === 'center') {
      setRect({ x: 0, y: 0, width: 0, height: 0 });
      return;
    }

    // Short timeout to let transition/render happen
    const timer = setTimeout(() => {
      const element = document.querySelector(currentStep.target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        const domRect = element.getBoundingClientRect();
        setRect({
          x: domRect.x,
          y: domRect.y,
          width: domRect.width,
          height: domRect.height
        });
      } else {
        // Fallback to center if element is hidden/missing (e.g. collapsed sidebar item)
        setRect({ x: 0, y: 0, width: 0, height: 0 });
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [stepIndex, active, windowSize]);

  // Keyboard navigation listeners
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleBack();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, stepIndex]);

  if (!active) return null;

  const currentStep = TOUR_STEPS[stepIndex];
  const isCenter = currentStep.target === 'center' || (rect.width === 0 && rect.height === 0);

  const handleNext = () => {
    if (stepIndex < TOUR_STEPS.length - 1) {
      setStepIndex((idx) => idx + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex((idx) => idx - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('xai_onboarding_seen_v1', 'true');
    setActive(false);
  };

  const handleComplete = () => {
    localStorage.setItem('xai_onboarding_seen_v1', 'true');
    setActive(false);
    // Automatically redirect/scroll user to Today's Focus to start action
    navigate('/today');
  };

  // Helper function to handle custom tour replay
  window.replayXaiOnboardingTour = () => {
    localStorage.setItem('xai_onboarding_seen_v1', 'false');
    navigate('/');
    setActive(true);
    setStepIndex(0);
  };

  // Calculate dynamic coordinates for tooltip cloud positioning
  const getTooltipPosition = () => {
    const isMobile = windowSize.w < 768;
    if (isMobile) {
      return {
        position: 'fixed',
        left: '16px',
        right: '16px',
        bottom: '16px',
        zIndex: 100
      };
    }

    if (isCenter) {
      return {
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 100,
        width: '420px'
      };
    }

    // Desktop absolute calculations relative to spotlight
    const padding = 16;
    let top = rect.y + rect.height + padding;
    let left = rect.x + rect.width / 2 - 200; // Center tooltip card

    if (currentStep.position === 'right') {
      left = rect.x + rect.width + padding;
      top = rect.y + rect.height / 2 - 100;
    } else if (currentStep.position === 'left') {
      left = rect.x - 400 - padding;
      top = rect.y + rect.height / 2 - 100;
    } else if (currentStep.position === 'top') {
      top = rect.y - 200 - padding;
      left = rect.x + rect.width / 2 - 200;
    }

    // Keep tooltip within visible boundaries
    left = Math.max(16, Math.min(left, windowSize.w - 420));
    top = Math.max(16, Math.min(top, windowSize.h - 320));

    return {
      position: 'absolute',
      left: `${left}px`,
      top: `${top}px`,
      zIndex: 100,
      width: '400px'
    };
  };

  return (
    <div className="fixed inset-0 z-[99] overflow-hidden select-none">
      {/* Spotlight Overlay Container */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="spotlight-mask">
            {/* Draw a white box over the entire screen */}
            <rect width="100%" height="100%" fill="white" />
            {/* Draw a black cut-out box inside the white mask */}
            {!isCenter && (
              <rect
                x={rect.x - 6}
                y={rect.y - 6}
                width={rect.width + 12}
                height={rect.height + 12}
                rx={12}
                ry={12}
                fill="black"
                className="transition-all duration-300 ease-out"
              />
            )}
          </mask>
        </defs>
        {/* Draw a dark semi-transparent screen and apply mask */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(4, 6, 12, 0.85)"
          mask="url(#spotlight-mask)"
          className="pointer-events-auto"
        />
      </svg>

      {/* Tooltip cloud modal */}
      <div
        ref={tooltipRef}
        style={getTooltipPosition()}
        className="card bg-navy-850 border border-navy-700/60 p-6 sm:p-7 shadow-primary-glow flex flex-col justify-between space-y-5 animate-scale-in pointer-events-auto"
      >
        {/* Header content */}
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-accent-cyan tracking-widest uppercase block">
              Cockpit Tutorial · Step {stepIndex + 1} of {TOUR_STEPS.length}
            </span>
            <button
              onClick={handleSkip}
              className="text-slate-500 hover:text-slate-350 transition-colors p-1"
              title="Skip Tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <h3 className="text-[16px] font-extrabold text-white leading-snug">
            {currentStep.title}
          </h3>
          <p className="text-[13px] text-slate-400 leading-relaxed">
            {currentStep.description}
          </p>
        </div>

        {/* Buttons / Actions */}
        <div className="flex justify-between items-center pt-3 border-t border-navy-700/25">
          <button
            onClick={handleSkip}
            className="text-xs text-slate-450 hover:text-slate-200 transition-colors font-medium"
          >
            Skip Tour
          </button>

          <div className="flex gap-2">
            {stepIndex > 0 && (
              <button
                onClick={handleBack}
                className="px-3.5 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-slate-350 hover:text-white font-semibold flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}

            {currentStep.isLast ? (
              <button
                onClick={handleComplete}
                className="btn-primary py-2 px-4 text-xs font-bold bg-accent-cyan hover:bg-accent-cyan-dim flex items-center gap-1"
              >
                <Target className="w-3.5 h-3.5" /> Start Today's Focus
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
