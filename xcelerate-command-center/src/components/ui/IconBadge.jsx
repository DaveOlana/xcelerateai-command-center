import React from 'react';

export default function IconBadge({ 
  icon: Icon, 
  size = 'md', 
  tone = 'brand', 
  className = '', 
  ...props 
}) {
  if (!Icon) return null;

  const sizeClasses = {
    sm: 'p-1.5 rounded-lg',
    md: 'p-2 rounded-xl',
    lg: 'p-2.5 rounded-2xl',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const toneClasses = {
    brand: 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20',
    cyan: 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-brand-amber/10 text-brand-amber border border-brand-amber/20',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20',
    muted: 'bg-navy-800/60 text-slate-400 border border-navy-700/40',
    violet: 'bg-brand-violet/10 text-brand-violet border border-brand-violet/20',
  };

  return (
    <span 
      className={`inline-flex items-center justify-center ${sizeClasses[size]} ${toneClasses[tone]} ${className}`}
      {...props}
    >
      <Icon className={iconSizes[size]} aria-hidden="true" />
    </span>
  );
}
