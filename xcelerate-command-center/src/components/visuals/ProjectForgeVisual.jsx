import React from 'react';

export default function ProjectForgeVisual({
  status = 'empty',
  size = 'md',
  className = '',
  ...props
}) {
  const dimensions = {
    sm: { width: 150, height: 110 },
    md: { width: 220, height: 160 },
    lg: { width: 300, height: 220 },
  };

  const { width, height } = dimensions[size] || dimensions.md;

  const getStatusColors = () => {
    switch (status) {
      case 'completed':
      case 'ready':
        return {
          primary: '#10B981', // Green
          secondary: '#8B5CF6', // Violet
          accent: '#06B6D4',
          glow: 'rgba(16, 185, 129, 0.15)',
        };
      case 'blocked':
        return {
          primary: '#EF4444', // Red
          secondary: '#F59E0B', // Amber
          accent: '#8B5CF6',
          glow: 'rgba(239, 68, 68, 0.15)',
        };
      case 'building':
        return {
          primary: '#8B5CF6', // Violet
          secondary: '#3B82F6', // Blue
          accent: '#06B6D4',
          glow: 'rgba(139, 92, 246, 0.2)',
        };
      case 'empty':
      default:
        return {
          primary: '#64748B', // Slate
          secondary: '#3B82F6',
          accent: '#06B6D4',
          glow: 'rgba(100, 116, 139, 0.05)',
        };
    }
  };

  const colors = getStatusColors();

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 220 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <filter id="forgeGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <linearGradient id="forgeBlockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B1329" />
          <stop offset="100%" stopColor="#1C2541" />
        </linearGradient>
      </defs>

      {/* Glow shadow */}
      <rect
        x="20"
        y="20"
        width="180"
        height="120"
        rx="16"
        fill={colors.glow}
        filter="url(#forgeGlow)"
      />

      {/* Outer framing line */}
      <rect
        x="15"
        y="15"
        width="190"
        height="130"
        rx="14"
        stroke="#1E293B"
        strokeWidth="1"
        opacity="0.6"
      />

      {/* Stacked building block panels (Background) */}
      <rect
        x="35"
        y="65"
        width="65"
        height="60"
        rx="6"
        fill="url(#forgeBlockGrad)"
        stroke="#1E293B"
        strokeWidth="1.5"
      />
      <line x1="45" y1="78" x2="90" y2="78" stroke="#1E293B" strokeWidth="1" />
      <circle cx="50" cy="95" r="2.5" fill={colors.accent} />
      <circle cx="50" cy="108" r="2.5" fill="#3B82F6" />

      {/* Main stacked build card (Foreground active project block) */}
      <rect
        x="80"
        y="35"
        width="105"
        height="85"
        rx="10"
        fill="#080F21"
        stroke={colors.primary}
        strokeWidth="1.5"
      />

      {/* Capstone badge shape flag */}
      <g opacity="0.9">
        <path
          d="M 155,35 L 175,35 L 175,55 L 165,49 L 155,55 Z"
          fill={colors.secondary}
          stroke={colors.secondary}
          strokeWidth="0.5"
        />
        {/* Star inside the flag representing Capstone achievement */}
        <path
          d="M 165,40 L 166.2,42.5 L 169,42.9 L 167,44.9 L 167.5,47.6 L 165,46.3 L 162.5,47.6 L 163,44.9 L 161,42.9 L 163.8,42.5 Z"
          fill="#FFFFFF"
        />
      </g>

      {/* Connected nodes via route path */}
      <g>
        {/* Repo Node */}
        <circle cx="105" cy="65" r="7" fill="#0E172C" stroke={colors.accent} strokeWidth="1.5" />
        <path d="M 102,65 L 108,65" stroke={colors.accent} strokeWidth="1" />
        <path d="M 105,62 L 105,68" stroke={colors.accent} strokeWidth="1" />

        {/* Node Connection Line */}
        <path
          d="M 112,65 L 143,65"
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeDasharray="2 2"
          opacity="0.75"
        />

        {/* Live Demo Node */}
        <circle cx="150" cy="65" r="7" fill="#0E172C" stroke={colors.primary} strokeWidth="1.5" />
        {/* Play triangle inside Demo Node */}
        <path d="M 148.5,61.5 L 153.5,65 L 148.5,68.5 Z" fill={colors.primary} />
      </g>

      {/* Mock Code Block Display lines inside the foreground card */}
      <g opacity="0.7">
        <rect x="95" y="85" width="40" height="5" rx="1.5" fill="#1E293B" />
        <rect x="95" y="96" width="70" height="5" rx="1.5" fill={colors.glow} />
        <rect x="95" y="107" width="55" height="5" rx="1.5" fill="#1E293B" />
      </g>

      {/* Decorative details status dot */}
      <circle cx="45" cy="35" r="3" fill={colors.primary} />
      <circle cx="57" cy="35" r="3" fill="#1E293B" />

      {/* Corner indicators */}
      <path d="M 22,28 L 22,22 L 28,22" stroke="#1D283A" strokeWidth="1" />
      <path d="M 198,28 L 198,22 L 192,22" stroke="#1D283A" strokeWidth="1" />
    </svg>
  );
}
