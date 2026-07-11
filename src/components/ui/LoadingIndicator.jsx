import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingIndicator({
  label,
  size = 'md',
  className = '',
  ...props
}) {
  const sizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const textSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center gap-2 text-slate-400 font-bold uppercase tracking-wider ${textSizes[size]} ${className}`}
      {...props}
    >
      <Loader2 className={`${sizes[size]} animate-spin text-brand-cyan`} aria-hidden="true" />
      {label && <span>{label}</span>}
    </div>
  );
}
