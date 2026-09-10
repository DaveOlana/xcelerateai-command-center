import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function StatusBanner({
  message,
  type = 'info',
  onClose,
  className = '',
  ...props
}) {
  if (!message) return null;

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const Icon = icons[type] || Info;

  const styles = {
    success: 'bg-brand-green/5 border-brand-green/20 text-brand-green',
    error: 'bg-red-500/5 border-red-500/20 text-red-500',
    warning: 'bg-brand-amber/5 border-brand-amber/20 text-brand-amber',
    info: 'bg-brand-blue/5 border-brand-blue/20 text-brand-blue',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start justify-between gap-3 p-3.5 border rounded-xl transition-all duration-200 ease-out transform scale-100 translate-y-0 ${styles[type]} ${className}`}
      {...props}
    >
      <div className="flex gap-2.5 items-start min-w-0">
        <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span className="text-xs font-semibold leading-relaxed break-words">{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
        className="text-text-muted hover:text-text-primary flex-shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded p-0.5"
          aria-label="Close message"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
