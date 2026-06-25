import React from 'react';
import { Lock, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

/**
 * PageShell - Wraps page content with standard max-width, padding, and smooth transition.
 */
export function PageShell({ children, className = "" }) {
  return (
    <div className={`max-w-6xl mx-auto py-2 lg:py-4 space-y-6 animate-slide-up ${className}`}>
      {children}
    </div>
  );
}

/**
 * PageHeader - Renders standard page title, description, and slot for action controls.
 */
export function PageHeader({ title, subtitle, actions, className = "" }) {
  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy-500 pb-5 ${className}`}>
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-slate-400 text-sm mt-1 leading-relaxed">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3 no-print">{actions}</div>}
    </div>
  );
}

/**
 * SectionCard - The main content tile surface. Includes header action structures.
 */
export function SectionCard({ title, subtitle, headerActions, children, className = "", hoverable = false }) {
  return (
    <div className={`bg-navy-850 border border-navy-700/25 rounded-3xl p-7 lg:p-8 backdrop-blur-sm shadow-card transition-all duration-300 ${
      hoverable ? 'hover:border-navy-600 hover:shadow-card-hover' : ''
    } ${className}`}>
      {(title || subtitle || headerActions) && (
        <div className="flex items-start justify-between gap-4 mb-5 border-b border-navy-700/30 pb-4">
          <div>
            {title && <h3 className="text-[16px] font-bold text-white tracking-tight">{title}</h3>}
            {subtitle && <p className="text-[13px] text-slate-400 mt-1 leading-relaxed">{subtitle}</p>}
          </div>
          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * StatCard - Structured indicator tile for KPI statistics.
 */
export function StatCard({ label, value, icon: Icon, helperText, accentColor = "green", className = "" }) {
  const borderColors = {
    green: "border-navy-700/25 hover:border-accent-primary/30",
    cyan: "border-navy-700/25 hover:border-accent-cyan/30",
    orange: "border-navy-700/25 hover:border-orange-500/30",
    purple: "border-navy-700/25 hover:border-purple-500/30",
    amber: "border-navy-700/25 hover:border-amber-500/30",
    red: "border-navy-700/25 hover:border-red-500/30",
  };

  const textColors = {
    green: "text-accent-primary",
    cyan: "text-accent-cyan",
    orange: "text-orange-400",
    purple: "text-purple-400",
    amber: "text-amber-400",
    red: "text-red-400",
  };

  return (
    <div className={`bg-navy-850 border rounded-3xl p-6 lg:p-7 flex flex-col justify-between transition-all duration-300 shadow-sm ${borderColors[accentColor] || "border-navy-700/25"} ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        {Icon && <Icon className={`w-5 h-5 ${textColors[accentColor] || "text-slate-400"}`} />}
      </div>
      <div>
        <p className="text-3xl font-extrabold tracking-tight text-white">{value}</p>
        {helperText && <p className="text-[13px] text-slate-450 mt-2 font-medium leading-relaxed">{helperText}</p>}
      </div>
    </div>
  );
}

/**
 * ProgressBar - Custom metric loader bar.
 */
export function ProgressBar({ percent, className = "", colorClass = "bg-gradient-to-r from-accent-primary to-accent-cyan" }) {
  const pct = Math.min(100, Math.max(0, Math.round(percent || 0)));
  return (
    <div className={`h-2 bg-navy-900 rounded-full overflow-hidden w-full ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/**
 * InfoPill - Muted metadata label tags.
 */
export function InfoPill({ label, icon: Icon, className = "", variant = "slate" }) {
  const variants = {
    slate: "bg-navy-900 text-slate-400 border-navy-700",
    green: "bg-accent-primary/10 text-accent-primary border-accent-primary/20",
    cyan: "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${variants[variant] || variants.slate} ${className}`}>
      {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
      <span>{label}</span>
    </span>
  );
}

/**
 * StatusBadge - Uniform badge mapping for state tags.
 */
export function StatusBadge({ status, className = "" }) {
  const normalized = String(status || '').toLowerCase();
  
  let styles = "bg-navy-900 text-slate-400 border-navy-750"; // default
  if (normalized === 'completed' || normalized === 'complete' || normalized === 'studied') {
    styles = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
  } else if (normalized === 'in progress' || normalized === 'studying' || normalized === 'available') {
    styles = "bg-accent-primary/10 text-accent-primary border border-accent-primary/20";
  } else if (normalized === 'blocked') {
    styles = "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse";
  } else if (normalized === 'locked') {
    styles = "bg-navy-900 text-slate-500 border-navy-700";
  } else if (normalized === 'submitted') {
    styles = "bg-blue-500/10 text-blue-400 border-blue-500/20";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${styles} ${className}`}>
      {normalized === 'locked' && <Lock className="w-3 h-3" />}
      <span>{status}</span>
    </span>
  );
}

/**
 * CommandButton - Futuristic accent main button.
 */
export function CommandButton({ children, onClick, type = "button", disabled = false, className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`bg-accent-primary text-white font-semibold px-6 py-3 rounded-xl
                 hover:bg-accent-primary-dim active:scale-95 transition-all duration-200
                 shadow-sm disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-[14px] ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * SecondaryButton - Muted background action button.
 */
export function SecondaryButton({ children, onClick, type = "button", disabled = false, className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`bg-navy-850 border border-navy-700 text-slate-350 font-semibold px-6 py-3 rounded-xl
                 hover:border-navy-600 hover:text-white active:scale-95 transition-all duration-200
                 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-[14px] ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * EmptyState - Clean styled empty panel placeholder with support for action buttons.
 */
export function EmptyState({ 
  message, 
  submessage, 
  icon: Icon = AlertCircle, 
  actionText, 
  onActionClick, 
  secondaryActionText,
  onSecondaryActionClick,
  className = "" 
}) {
  return (
    <div className={`bg-navy-850/60 border border-navy-700/20 text-center py-10 px-6 space-y-4 rounded-3xl max-w-md mx-auto backdrop-blur-sm shadow-sm ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-navy-900 border border-navy-700/50 flex items-center justify-center mx-auto">
        <Icon className="w-5 h-5 text-slate-400" />
      </div>
      <div className="space-y-1.5">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">{message || "No Data Found"}</h4>
        {submessage && <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">{submessage}</p>}
      </div>
      
      {(actionText || secondaryActionText) && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 pt-2">
          {actionText && onActionClick && (
            <button
              onClick={onActionClick}
              className="btn-primary py-2 px-4 text-xs font-bold w-full sm:w-auto"
            >
              {actionText}
            </button>
          )}
          {secondaryActionText && onSecondaryActionClick && (
            <button
              onClick={onSecondaryActionClick}
              className="btn-secondary py-2.5 px-4 text-xs font-bold w-full sm:w-auto"
            >
              {secondaryActionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * LoadingState - Themed Loader indicator.
 */
export function LoadingState({ message = "Loading Command Module...", className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center space-y-3 ${className}`}>
      <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
      <p className="text-xs text-slate-500 tracking-wider">Loading...</p>
    </div>
  );
}

/**
 * LockWarningCard - Premium unified glassmorphic lock warning component.
 */
export function LockWarningCard({ title, message, missingLabel, nextActionLabel, onNextAction, className = "" }) {
  return (
    <div className={`bg-navy-800/80 border border-red-500/35 rounded-2xl p-6 text-center space-y-4 max-w-xl mx-auto my-6 backdrop-blur-sm animate-scale-in shadow-card ${className}`}>
      <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto shadow-red-500/5 shadow-inner">
        <Lock className="w-5 h-5 text-red-400" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">{title}</h3>
        <p className="text-[14px] text-slate-400 mt-1.5 leading-relaxed">{message}</p>
      </div>
      {missingLabel && (
        <div className="bg-navy-950/70 rounded-xl p-3 text-[13px] text-amber-400 font-mono font-bold border border-navy-500/30 max-w-sm mx-auto">
           PREREQUISITE: {missingLabel}
        </div>
      )}
      {nextActionLabel && onNextAction && (
        <button
          type="button"
          onClick={onNextAction}
          className="bg-navy-700/80 border border-navy-450 text-slate-300 hover:text-white hover:border-accent-primary/30 px-5 py-2.5 rounded-xl transition-all duration-200 text-[13px] uppercase tracking-wider font-bold font-mono active:scale-95 mx-auto flex items-center gap-1.5"
        >
          {nextActionLabel}
        </button>
      )}
    </div>
  );
}
