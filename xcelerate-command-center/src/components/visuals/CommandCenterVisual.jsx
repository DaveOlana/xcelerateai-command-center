import React from 'react';

export default function CommandCenterVisual({
  size = 'md',
  active = false,
  className = '',
  ...props
}) {
  const dimensions = {
    sm: { width: 160, height: 100 },
    md: { width: 300, height: 180 },
    lg: { width: 420, height: 250 },
  };

  const { width, height } = dimensions[size] || dimensions.md;

  const accentColor = active ? '#06B6D4' : '#64748B'; // Cyan or Slate
  const accentGlow = active ? 'rgba(6, 182, 212, 0.2)' : 'rgba(100, 116, 139, 0.05)';

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 300 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <filter id="ccBlur" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <linearGradient id="panelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0B1329" />
          <stop offset="100%" stopColor="#1C2541" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Background Glow */}
      <rect
        x="20"
        y="20"
        width="260"
        height="140"
        rx="16"
        fill={accentGlow}
        filter="url(#ccBlur)"
      />

      {/* Grid Background */}
      <g opacity="0.15">
        <line x1="20" y1="40" x2="280" y2="40" stroke="#475569" strokeWidth="0.5" />
        <line x1="20" y1="70" x2="280" y2="70" stroke="#475569" strokeWidth="0.5" />
        <line x1="20" y1="100" x2="280" y2="100" stroke="#475569" strokeWidth="0.5" />
        <line x1="20" y1="130" x2="280" y2="130" stroke="#475569" strokeWidth="0.5" />
        
        <line x1="60" y1="20" x2="60" y2="160" stroke="#475569" strokeWidth="0.5" />
        <line x1="120" y1="20" x2="120" y2="160" stroke="#475569" strokeWidth="0.5" />
        <line x1="180" y1="20" x2="180" y2="160" stroke="#475569" strokeWidth="0.5" />
        <line x1="240" y1="20" x2="240" y2="160" stroke="#475569" strokeWidth="0.5" />
      </g>

      {/* Outer Shell Console Ring */}
      <rect
        x="15"
        y="15"
        width="270"
        height="150"
        rx="14"
        stroke="#1E293B"
        strokeWidth="1.5"
        opacity="0.8"
      />

      {/* Left Back Panel Card */}
      <rect
        x="35"
        y="45"
        width="80"
        height="90"
        rx="8"
        fill="url(#panelGrad)"
        stroke="#1E293B"
        strokeWidth="1"
        opacity="0.8"
      />
      <line x1="45" y1="60" x2="105" y2="60" stroke="#1E293B" strokeWidth="1" />
      <rect x="45" y="70" width="40" height="6" rx="2" fill="#1E293B" />
      <rect x="45" y="82" width="60" height="20" rx="4" fill="#080F21" opacity="0.6" />
      
      {/* Route Line connection */}
      <path
        d="M 115,90 L 140,90"
        stroke={accentColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      <circle cx="115" cy="90" r="2.5" fill={accentColor} />

      {/* Right Back Panel Card */}
      <rect
        x="185"
        y="45"
        width="80"
        height="90"
        rx="8"
        fill="url(#panelGrad)"
        stroke="#1E293B"
        strokeWidth="1"
        opacity="0.8"
      />
      <line x1="195" y1="60" x2="255" y2="60" stroke="#1E293B" strokeWidth="1" />
      <rect x="195" y="70" width="50" height="6" rx="2" fill="#1E293B" />
      
      {/* Micro graphic lines (e.g. mock progress or logs) */}
      <line x1="195" y1="90" x2="245" y2="90" stroke={accentColor} strokeWidth="1.5" opacity="0.3" />
      <line x1="195" y1="100" x2="235" y2="100" stroke="#10B981" strokeWidth="1.5" opacity="0.3" />
      <line x1="195" y1="110" x2="250" y2="110" stroke="#64748B" strokeWidth="1" opacity="0.2" />

      {/* Route Line connection */}
      <path
        d="M 185,90 L 160,90"
        stroke={accentColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      <circle cx="185" cy="90" r="2.5" fill={accentColor} />

      {/* Main Front Central Active Mission Panel */}
      <rect
        x="95"
        y="35"
        width="110"
        height="110"
        rx="10"
        fill="#080F21"
        stroke={accentColor}
        strokeWidth="1.5"
        boxShadow="0px 4px 20px rgba(0, 0, 0, 0.5)"
      />

      {/* Top Title Bar of Central Card */}
      <path
        d="M 95,45 C 95,41 98,35 105,35 L 195,35 C 202,35 205,41 205,45 L 205,55 L 95,55 Z"
        fill="#0E172C"
      />
      <circle cx="110" cy="45" r="2" fill={accentColor} />
      <rect x="118" y="42" width="50" height="6" rx="2" fill="#1E293B" />

      {/* Target Crosshair / Radar Visual inside Central Card */}
      <circle cx="150" cy="95" r="25" stroke="#1E293B" strokeWidth="1.5" />
      <circle cx="150" cy="95" r="15" stroke="#1E293B" strokeWidth="1" />
      <line x1="150" y1="65" x2="150" y2="125" stroke="#1E293B" strokeWidth="0.75" />
      <line x1="120" y1="95" x2="180" y2="95" stroke="#1E293B" strokeWidth="0.75" />
      
      {/* Active node coordinates */}
      {active && (
        <>
          <circle cx="160" cy="85" r="3" fill="#10B981" />
          <circle cx="160" cy="85" r="5" stroke="#10B981" strokeWidth="1" opacity="0.5" />
        </>
      )}

      {/* Decorative corners */}
      <path d="M 18,25 L 18,18 L 25,18" stroke="#334155" strokeWidth="1.5" />
      <path d="M 282,25 L 282,18 L 275,18" stroke="#334155" strokeWidth="1.5" />
      <path d="M 18,155 L 18,162 L 25,162" stroke="#334155" strokeWidth="1.5" />
      <path d="M 282,155 L 282,162 L 275,162" stroke="#334155" strokeWidth="1.5" />
    </svg>
  );
}
