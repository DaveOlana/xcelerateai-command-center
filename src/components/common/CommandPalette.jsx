import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, LayoutDashboard, Target, Calendar, BarChart2, 
  Upload, Settings, FolderKanban, FileText, CheckSquare, 
  Clock, BookOpen, AlertCircle, Award, Shield, Command
} from 'lucide-react';

const STATIC_COMMANDS = [
  { id: 'dash', title: 'Dashboard', icon: LayoutDashboard, route: '/' },
  { id: 'today', title: "Today's Focus", icon: Target, route: '/today' },
  { id: 'missions', title: 'Weekly Missions', icon: Calendar, route: '/missions' },
  { id: 'progress', title: 'Progress Overview', icon: BarChart2, route: '/progress' },
  { id: 'proof', title: 'Proof of Work', icon: Award, route: '/proof' },
  { id: 'blockers', title: 'Blockers Journal', icon: AlertCircle, route: '/blockers' },
  { id: 'notes', title: 'Notes Journal', icon: FileText, route: '/notes' },
  { id: 'projects', title: 'Project Tracker', icon: FolderKanban, route: '/projects' },
  { id: 'resources', title: 'Resource Vault', icon: BookOpen, route: '/resources' },
  { id: 'settings', title: 'Settings & Backup', icon: Settings, route: '/settings' },
  { id: 'import', title: 'Import JSON Roadmap', icon: Upload, route: '/import' },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Filter commands based on query
  const filteredCommands = query === '' 
    ? STATIC_COMMANDS 
    : STATIC_COMMANDS.filter(cmd => cmd.title.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        setQuery('');
        setSelectedIndex(0);
      }
      
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle arrow keys
  useEffect(() => {
    if (!isOpen) return;

    const handleNavigation = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          navigate(filteredCommands[selectedIndex].route);
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleNavigation);
    return () => window.removeEventListener('keydown', handleNavigation);
  }, [isOpen, selectedIndex, filteredCommands, navigate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Palette */}
      <div className="relative w-full max-w-xl bg-navy-900 border border-navy-500/50 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        <div className="flex items-center px-4 py-4 border-b border-navy-500/30">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-white text-[15px] placeholder:text-slate-500"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-navy-800 border border-navy-600">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ESC</span>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No commands found for "{query}"
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-3 py-2">
                Navigation
              </p>
              {filteredCommands.map((cmd, index) => {
                const Icon = cmd.icon;
                const isSelected = index === selectedIndex;
                
                return (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      navigate(cmd.route);
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left ${
                      isSelected 
                        ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20 shadow-[inset_0_0_15px_rgba(37,99,235,0.1)]' 
                        : 'text-slate-300 hover:bg-navy-800 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-accent-primary' : 'text-slate-400'}`} />
                    <span className="text-[14px] font-medium flex-1">{cmd.title}</span>
                    {isSelected && (
                      <span className="text-[11px] text-accent-primary font-bold uppercase tracking-wider bg-accent-primary/10 px-2 py-0.5 rounded">
                        Enter
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 bg-navy-950/50 border-t border-navy-500/20 flex items-center justify-between text-slate-500 text-[11px] uppercase tracking-wider font-bold">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><Command className="w-3.5 h-3.5" /> Navigate</span>
            <span className="flex items-center gap-1.5"><span className="text-sm leading-none">↑↓</span> Select</span>
          </div>
          <span>Command Palette</span>
        </div>
      </div>
    </div>
  );
}
