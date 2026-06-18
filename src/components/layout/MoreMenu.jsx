import React from 'react';
import { Link } from 'react-router-dom';
import {
  Upload, Clock, BookOpen, FolderKanban,
  FileText, CheckSquare, Settings, X, AlertCircle, Award, Shield
} from 'lucide-react';

const moreItems = [
  { to: '/import', label: 'Import Roadmap', icon: Upload, desc: 'Upload roadmap JSON' },
  { to: '/timeline', label: 'Bootcamp Timeline', icon: Clock, desc: 'View all 6 months' },
  { to: '/resources', label: 'Resource Vault', icon: BookOpen, desc: 'Learning vault' },
  { to: '/projects', label: 'Project Tracker', icon: FolderKanban, desc: 'Track your builds' },
  { to: '/notes', label: 'Notes Journal', icon: FileText, desc: 'Capture what you learn' },
  { to: '/checkpoints', label: 'Checkpoints', icon: CheckSquare, desc: 'Rate your confidence' },
  { to: '/blockers', label: 'Blockers Journal', icon: AlertCircle, desc: 'Track active errors' },
  { to: '/proof', label: 'Proof of Work', icon: Award, desc: 'Verify build deliverables' },
  { to: '/side-quests', label: 'Side Quests', icon: Shield, desc: 'Locked side items' },
  { to: '/settings', label: 'Settings', icon: Settings, desc: 'Configure setup parameters' },
];

export default function MoreMenu({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="absolute bottom-0 left-0 right-0 bg-navy-800 border-t border-navy-400 rounded-t-2xl more-menu-overlay">
        <div className="flex items-center justify-between px-5 py-4 border-b border-navy-400">
          <div>
            <h2 className="font-bold text-white">More Pages</h2>
            <p className="text-xs text-slate-500">Navigate to any section</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-navy-600 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
          {moreItems.map(({ to, label, icon: Icon, desc }) => (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className="flex flex-col gap-2 p-4 bg-navy-700 border border-navy-400 rounded-xl
                         hover:border-accent-primary/30 hover:bg-navy-600 transition-all duration-200
                         active:scale-95"
            >
              <div className="w-9 h-9 rounded-lg bg-navy-600 border border-navy-300 flex items-center justify-center">
                <Icon className="w-4.5 h-4.5 text-accent-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">{label}</p>
                <p className="text-[14px] text-slate-500 mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="h-6" />
      </div>
    </div>
  );
}
