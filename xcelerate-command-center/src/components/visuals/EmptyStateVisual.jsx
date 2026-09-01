import React from 'react';

export default function EmptyStateVisual({
  icon: Icon = null,
  tone = 'muted',
  size = 'md',
  className = '',
  ...props
}) {
  const dimensions = {
    sm: { width: 120, height: 90 },
    md: { width: 180, height: 130 },
  };

  const { width, height } = dimensions[size] || dimensions.md;

  const getToneColors = () => {
    switch (tone) {
      case 'brand':
        return {
          stroke: '#3B82F6', // Blue
          glow: 'rgba(59, 130, 246, 0.08)',
        };
      case 'cyan':
        return {
          stroke: '#06B6D4', // Cyan
          glow: 'rgba(6, 182, 212, 0.08)',
        };
      case 'success':
        return {
          stroke: '#10B981', // Green
          glow: 'rgba(16, 185, 129, 0.08)',
        };
      case 'warning':
        return {
          stroke: '#F59E0B', // Amber
          glow: 'rgba(245, 158, 11, 0.08)',
        };
      case 'danger':
        return {
          stroke: '#EF4444', // Red
          glow: 'rgba(239, 68, 68, 0.08)',
        };
      case 'muted':
      default:
        return {
          stroke: '#475569', // Slate
          glow: 'rgba(71, 85, 105, 0.05)',
        };
    }
  };

  const colors = getToneColors();

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 180 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <filter id="esBlur" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      {/* Glow shadow */}
      <rect
        x="20"
        y="20"
        width="140"
        height="90"
        rx="12"
        fill={colors.glow}
        filter="url(#esBlur)"
      />

      {/* Grid backdrop */}
      <g opacity="0.1">
        <line x1="20" y1="40" x2="160" y2="40" stroke={colors.stroke} strokeWidth="0.5" />
        <line x1="20" y1="65" x2="160" y2="65" stroke={colors.stroke} strokeWidth="0.5" />
        <line x1="20" y1="90" x2="160" y2="90" stroke={colors.stroke} strokeWidth="0.5" />
        
        <line x1="55" y1="20" x2="55" y2="110" stroke={colors.stroke} strokeWidth="0.5" />
        <line x1="90" y1="20" x2="90" y2="110" stroke={colors.stroke} strokeWidth="0.5" />
        <line x1="125" y1="20" x2="125" y2="110" stroke={colors.stroke} strokeWidth="0.5" />
      </g>

      {/* Main Border Panel */}
      <rect
        x="20"
        y="20"
        width="140"
        height="90"
        rx="10"
        stroke="#1E293B"
        strokeWidth="1"
      />

      {/* Central Slot for Icon */}
      <circle cx="90" cy="65" r="22" fill="#080F21" stroke="#1E293B" strokeWidth="1" />
      <circle cx="90" cy="65" r="16" fill="#0B1329" stroke={colors.stroke} strokeWidth="1" strokeDasharray="2 2" opacity="0.8" />

      {/* Render the icon inside the slot */}
      {Icon && (
        <g transform="translate(80, 55)">
          <Icon className="w-5 h-5 text-slate-500" strokeWidth={1.5} style={{ color: colors.stroke }} />
        </g>
      )}

      {/* Tech indicators on corner */}
      <rect x="25" y="25" width="6" height="1" rx="0.5" fill={colors.stroke} opacity="0.4" />
      <rect x="25" y="28" width="3" height="1" rx="0.5" fill={colors.stroke} opacity="0.3" />
      
      <rect x="149" y="101" width="6" height="1" rx="0.5" fill={colors.stroke} opacity="0.4" />
      <rect x="152" y="98" width="3" height="1" rx="0.5" fill={colors.stroke} opacity="0.3" />
    </svg>
  );
}
