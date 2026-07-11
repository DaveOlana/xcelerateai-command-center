import React from 'react';
import { Lock, AlertCircle, Loader2, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

/**
 * PageShell - Wraps page content with standard max-width, padding, and smooth transition.
 */
export function PageShell({ children, className = "" }) {
  return (
    <div className={`w-full max-w-full md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 py-4 lg:py-6 space-y-6 animate-slide-up ${className}`}>
      {children}
    </div>
  );
}

/**
 * PageHeader - Renders standard page title, description, and slot for action controls.
 */
export function PageHeader({ title, subtitle, actions, className = "" }) {
  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-default pb-5 ${className}`}>
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight font-heading">{title}</h1>
        {subtitle && <p className="text-text-secondary text-sm mt-1.5 leading-relaxed">{subtitle}</p>}
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
    <div className={`bg-bg-surface border border-border-default rounded-radius-xxl p-6 lg:p-8 backdrop-blur-sm shadow-card transition-all duration-300 ${
      hoverable ? 'hover:border-border-strong hover:shadow-card-hover' : ''
    } ${className}`}>
      {(title || subtitle || headerActions) && (
        <div className="flex items-start justify-between gap-4 mb-6 border-b border-border-divider pb-4">
          <div>
            {title && <h3 className="text-[16px] font-bold text-white tracking-tight font-heading">{title}</h3>}
            {subtitle && <p className="text-[13px] text-text-muted mt-1 leading-relaxed">{subtitle}</p>}
          </div>
          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * ActionCard - For primary high-priority decisions/actions
 */
export function ActionCard({ children, className = "", onClick }) {
  const CardWrapper = onClick ? 'button' : 'div';
  return (
    <CardWrapper
      onClick={onClick}
      className={`bg-bg-surface border-2 border-brand-blue/35 rounded-radius-xxl p-6 lg:p-7 shadow-card hover:border-brand-blue hover:shadow-card-hover transition-all duration-300 text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''} ${className}`}
    >
      {children}
    </CardWrapper>
  );
}

/**
 * LearningCard - For missions, lessons, checkpoints, resources
 */
export function LearningCard({ children, className = "", hoverable = false, onClick }) {
  const CardWrapper = onClick ? 'button' : 'div';
  return (
    <CardWrapper
      onClick={onClick}
      className={`bg-bg-surface border border-border-default rounded-radius-xl p-5 lg:p-6 shadow-sm transition-all duration-300 text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus ${
        hoverable || onClick ? 'hover:border-border-strong hover:bg-bg-elevated cursor-pointer' : ''
      } ${onClick ? 'active:scale-[0.99]' : ''} ${className}`}
    >
      {children}
    </CardWrapper>
  );
}

/**
 * MetricCard - For statistics and progress charts
 */
export function MetricCard({ label, value, icon: Icon, helperText, accentColor = "blue", className = "" }) {
  const borderColors = {
    blue: "border-border-default hover:border-brand-blue/30",
    cyan: "border-border-default hover:border-brand-cyan/30",
    violet: "border-border-default hover:border-brand-violet/30",
    green: "border-border-default hover:border-brand-green/30",
    amber: "border-border-default hover:border-brand-amber/30",
    red: "border-border-default hover:border-brand-red/30",
  };

  const textColors = {
    blue: "text-brand-blue",
    cyan: "text-brand-cyan",
    violet: "text-brand-violet",
    green: "text-brand-green",
    amber: "text-brand-amber",
    red: "text-brand-red",
  };

  return (
    <div className={`bg-bg-surface border rounded-radius-lg p-5 flex flex-col justify-between transition-all duration-300 shadow-sm ${borderColors[accentColor] || "border-border-default"} ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-bold text-text-muted uppercase tracking-wider">{label}</span>
        {Icon && <Icon className={`w-4 h-4 ${textColors[accentColor] || "text-text-muted"}`} />}
      </div>
      <div>
        <p className="text-2xl font-extrabold tracking-tight text-white font-heading">{value}</p>
        {helperText && <p className="text-[12px] text-text-muted mt-1.5 font-medium leading-relaxed">{helperText}</p>}
      </div>
    </div>
  );
}

/**
 * ReflectionCard - For journal reflections, notes, and blockers
 */
export function ReflectionCard({ children, className = "" }) {
  return (
    <div className={`bg-bg-soft border border-border-default rounded-radius-xl p-5 lg:p-6 shadow-sm border-l-4 border-l-brand-violet/60 ${className}`}>
      {children}
    </div>
  );
}

/**
 * StatCard - Structured indicator tile for KPI statistics (Backwards compatible wrapper)
 */
export function StatCard({ label, value, icon: Icon, helperText, accentColor = "blue", className = "" }) {
  return (
    <MetricCard
      label={label}
      value={value}
      icon={Icon}
      helperText={helperText}
      accentColor={accentColor === "green" ? "blue" : accentColor} /* Prefer Blue over success Green for stats */
      className={className}
    />
  );
}

/**
 * ProgressBar - Custom metric loader bar.
 */
export function ProgressBar({ percent, className = "", colorClass = "bg-gradient-to-r from-brand-blue to-brand-cyan" }) {
  const pct = Math.min(100, Math.max(0, Math.round(percent || 0)));
  return (
    <div className={`h-1.5 bg-bg-soft border border-border-divider rounded-full overflow-hidden w-full ${className}`}>
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
    slate: "bg-bg-soft text-text-secondary border-border-default",
    blue: "bg-brand-blue/10 text-brand-blue border-brand-blue/20",
    cyan: "bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20",
    amber: "bg-brand-amber/10 text-brand-amber border-brand-amber/20",
    purple: "bg-brand-violet/10 text-brand-violet border-brand-violet/20",
    red: "bg-brand-red/10 text-brand-red border-brand-red/20",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-radius-sm text-xs font-semibold border ${variants[variant] || variants.slate} ${className}`}>
      {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
      <span>{label}</span>
    </span>
  );
}

/**
 * StatusBadge - Uniform badge mapping for state tags.
 */
export function StatusBadge({ status, className = "" }) {
  const normalized = String(status || '').toLowerCase();
  
  let styles = "bg-bg-soft text-text-muted border-border-default"; // default
  let Icon = null;

  if (normalized === 'completed' || normalized === 'complete' || normalized === 'studied') {
    styles = "bg-brand-green/10 text-brand-green border border-brand-green/20";
    Icon = CheckCircle2;
  } else if (normalized === 'in progress' || normalized === 'studying' || normalized === 'available' || normalized === 'active') {
    styles = "bg-brand-blue/10 text-brand-blue border border-brand-blue/20";
    Icon = Loader2;
  } else if (normalized === 'blocked') {
    styles = "bg-brand-red/10 text-brand-red border border-brand-red/20 animate-pulse";
    Icon = ShieldAlert;
  } else if (normalized === 'locked') {
    styles = "bg-bg-app text-text-disabled border-border-default";
    Icon = Lock;
  } else if (normalized === 'submitted') {
    styles = "bg-brand-violet/10 text-brand-violet border border-brand-violet/20";
    Icon = CheckCircle2;
  } else if (normalized === 'learning') {
    styles = "bg-brand-amber/10 text-brand-amber border border-brand-amber/20";
    Icon = AlertTriangle;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${styles} ${className}`}>
      {Icon && <Icon className={`w-3 h-3 ${normalized === 'in progress' ? 'animate-spin' : ''}`} />}
      <span>{status}</span>
    </span>
  );
}

/**
 * CommandButton - Accent main button (Primary Button)
 */
export function CommandButton({ children, onClick, type = "button", disabled = false, className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`bg-brand-blue text-white font-semibold px-6 py-3 rounded-radius-lg
                 hover:bg-blue-600 active:scale-95 transition-all duration-200
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus
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
      className={`bg-bg-elevated border border-border-default text-text-secondary font-semibold px-6 py-3 rounded-radius-lg
                 hover:border-border-strong hover:text-white active:scale-95 transition-all duration-200
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus
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
    <div className={`bg-bg-surface border border-border-default text-center py-10 px-6 space-y-4 rounded-radius-xxl max-w-md mx-auto backdrop-blur-sm shadow-sm ${className}`}>
      <div className="w-12 h-12 rounded-radius-lg bg-bg-soft border border-border-divider flex items-center justify-center mx-auto">
        <Icon className="w-5 h-5 text-text-muted" />
      </div>
      <div className="space-y-1.5">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider font-heading">{message || "No Data Found"}</h4>
        {submessage && <p className="text-xs text-text-secondary max-w-xs mx-auto leading-relaxed">{submessage}</p>}
      </div>
      
      {(actionText || secondaryActionText) && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 pt-2">
          {actionText && onActionClick && (
            <button
              onClick={onActionClick}
              className="bg-brand-blue text-white font-semibold px-4 py-2.5 rounded-radius-md hover:bg-blue-600 transition-all text-xs font-bold w-full sm:w-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
            >
              {actionText}
            </button>
          )}
          {secondaryActionText && onSecondaryActionClick && (
            <button
              onClick={onSecondaryActionClick}
              className="bg-bg-elevated border border-border-default text-text-secondary font-semibold px-4 py-2.5 rounded-radius-md hover:border-border-strong hover:text-white transition-all text-xs font-bold w-full sm:w-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
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
      <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
      <p className="text-xs text-text-muted tracking-wider uppercase font-mono">{message || "Loading..."}</p>
    </div>
  );
}

/**
 * LockWarningCard - Premium unified glassmorphic lock warning component.
 */
export function LockWarningCard({ title, message, missingLabel, nextActionLabel, onNextAction, className = "" }) {
  return (
    <div className={`bg-bg-surface border border-brand-red/30 rounded-radius-xxl p-6 lg:p-8 text-center space-y-4 max-w-xl mx-auto my-6 backdrop-blur-sm animate-scale-in shadow-card ${className}`}>
      <div className="w-12 h-12 rounded-full bg-brand-red/10 border border-brand-red/20 flex items-center justify-center mx-auto shadow-sm">
        <Lock className="w-5 h-5 text-brand-red" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-heading">{title}</h3>
        <p className="text-[14px] text-text-secondary mt-1.5 leading-relaxed">{message}</p>
      </div>
      {missingLabel && (
        <div className="bg-bg-soft rounded-radius-lg p-3 text-[13px] text-brand-amber font-mono font-bold border border-border-divider max-w-sm mx-auto">
           PREREQUISITE: {missingLabel}
        </div>
      )}
      {nextActionLabel && onNextAction && (
        <button
          type="button"
          onClick={onNextAction}
          className="bg-bg-elevated border border-border-default text-text-secondary hover:text-white hover:border-brand-blue/30 px-5 py-2.5 rounded-radius-lg transition-all duration-200 text-[13px] uppercase tracking-wider font-bold active:scale-95 mx-auto flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
        >
          {nextActionLabel}
        </button>
      )}
    </div>
  );
}
