import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, Loader2 } from 'lucide-react';

export default function InlineStatus({
  status = 'info',
  label,
  className = '',
  ...props
}) {
  if (!label) return null;

  const icons = {
    success: CheckCircle2,
    warning: AlertTriangle,
    danger: AlertCircle,
    info: Info,
    loading: Loader2,
  };

  const Icon = icons[status] || Info;

  const styles = {
    success: 'text-emerald-450',
    warning: 'text-brand-amber',
    danger: 'text-red-400',
    info: 'text-brand-blue',
    loading: 'text-brand-cyan',
  };

  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${styles[status]} ${className}`}
      {...props}
    >
      <Icon className={`w-3.5 h-3.5 ${status === 'loading' ? 'animate-spin' : ''}`} aria-hidden="true" />
      {label}
    </span>
  );
}
