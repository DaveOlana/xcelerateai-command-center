import React from 'react';
import { 
  CheckCircle2, Activity, Clock3, Lock, 
  AlertTriangle, AlertCircle, Octagon, Circle, Asterisk 
} from 'lucide-react';

export default function StatusIcon({ 
  status = 'neutral', 
  className = '', 
  size = 'md',
  ...props 
}) {
  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const currentSize = iconSizes[size] || size;

  const mapping = {
    completed: { Icon: CheckCircle2, style: 'text-emerald-400' },
    success: { Icon: CheckCircle2, style: 'text-emerald-400' },
    active: { Icon: Activity, style: 'text-brand-blue' },
    pending: { Icon: Clock3, style: 'text-slate-450' },
    locked: { Icon: Lock, style: 'text-slate-600' },
    warning: { Icon: AlertTriangle, style: 'text-brand-amber' },
    danger: { Icon: AlertCircle, style: 'text-red-400' },
    blocker: { Icon: Octagon, style: 'text-red-500' },
    optional: { Icon: Circle, style: 'text-slate-500/60' },
    required: { Icon: Asterisk, style: 'text-brand-cyan' },
    neutral: { Icon: Circle, style: 'text-slate-550' },
  };

  const config = mapping[status] || mapping.neutral;
  const SelectedIcon = config.Icon;

  return (
    <SelectedIcon 
      className={`${config.style} ${currentSize} ${className}`} 
      aria-hidden="true" 
      {...props} 
    />
  );
}
