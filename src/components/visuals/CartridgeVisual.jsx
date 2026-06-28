import React from 'react';

export default function CartridgeVisual({
  size = 'md',
  state = 'neutral',
  className = '',
  ...props
}) {
  // Size mapping
  const dimensions = {
    sm: { width: 140, height: 100 },
    md: { width: 220, height: 160 },
    lg: { width: 300, height: 220 },
  };

  const { width, height } = dimensions[size] || dimensions.md;

  // State color mapping
  // returns { primary, secondary, statusLed, glow }
  const getStateColors = () => {
    switch (state) {
      case 'empty':
      case 'neutral':
        return {
          primary: '#64748B', // Slate
          secondary: '#334155', // Muted slate
          accent: '#06B6D4', // Muted Cyan
          led: '#475569', // Muted
          glow: 'rgba(71, 85, 105, 0.15)',
        };
      case 'loaded':
        return {
          primary: '#06B6D4', // Cyan
          secondary: '#1E293B',
          accent: '#10B981', // Success Green
          led: '#10B981',
          glow: 'rgba(6, 182, 212, 0.25)',
        };
      case 'success':
        return {
          primary: '#10B981', // Success Green
          secondary: '#06B6D4', // Cyan
          accent: '#10B981',
          led: '#10B981',
          glow: 'rgba(16, 185, 129, 0.25)',
        };
      case 'importing':
        return {
          primary: '#3B82F6', // Blue
          secondary: '#06B6D4', // Cyan
          accent: '#3B82F6',
          led: '#F59E0B', // Amber pulse indicator
          glow: 'rgba(59, 130, 246, 0.3)',
        };
      default:
        return {
          primary: '#06B6D4',
          secondary: '#1E293B',
          accent: '#3B82F6',
          led: '#475569',
          glow: 'rgba(6, 182, 212, 0.15)',
        };
    }
  };

  const colors = getStateColors();

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
        {/* Gradients */}
        <linearGradient id="cartridgeBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B1329" />
          <stop offset="100%" stopColor="#1C2541" />
        </linearGradient>
        
        <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colors.primary} />
          <stop offset="100%" stopColor={colors.secondary} />
        </linearGradient>

        <radialGradient id="centralGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={colors.primary} stopOpacity="0.4" />
          <stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
        </radialGradient>

        <filter id="blurFilter" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      {/* Outer subtle flat boundary outline */}
      <rect
        x="12"
        y="12"
        width="196"
        height="136"
        rx="18"
        stroke={colors.primary}
        strokeWidth="1"
        opacity="0.1"
      />

      {/* Main Cartridge Body */}
      <rect
        x="20"
        y="20"
        width="180"
        height="120"
        rx="12"
        fill="url(#cartridgeBody)"
        stroke="#1E293B"
        strokeWidth="1.5"
      />

      {/* Diagonal Grip Cuts (Futuristic tech aesthetics) */}
      <path d="M 25,45 L 35,35 M 25,55 L 35,45 M 25,65 L 35,55" stroke="#1E293B" strokeWidth="1.5" />
      <path d="M 195,45 L 185,35 M 195,55 L 185,45 M 195,65 L 185,55" stroke="#1E293B" strokeWidth="1.5" />

      {/* Connection gold/cyan contact pins on the left edge */}
      <g opacity="0.85">
        <rect x="18" y="40" width="4" height="6" rx="1" fill={colors.primary} />
        <rect x="18" y="52" width="4" height="6" rx="1" fill={colors.primary} />
        <rect x="18" y="64" width="4" height="6" rx="1" fill={colors.primary} />
        <rect x="18" y="76" width="4" height="6" rx="1" fill={colors.primary} />
        <rect x="18" y="88" width="4" height="6" rx="1" fill={colors.primary} />
        <rect x="18" y="100" width="4" height="6" rx="1" fill={colors.primary} />
      </g>

      {/* Connection gold/cyan contact pins on the right edge */}
      <g opacity="0.85">
        <rect x="198" y="40" width="4" height="6" rx="1" fill={colors.primary} />
        <rect x="198" y="52" width="4" height="6" rx="1" fill={colors.primary} />
        <rect x="198" y="64" width="4" height="6" rx="1" fill={colors.primary} />
        <rect x="198" y="76" width="4" height="6" rx="1" fill={colors.primary} />
        <rect x="198" y="88" width="4" height="6" rx="1" fill={colors.primary} />
        <rect x="198" y="100" width="4" height="6" rx="1" fill={colors.primary} />
      </g>

      {/* Circuit board route traces */}
      <path
        d="M 50,80 L 80,80 L 100,60 L 130,60"
        stroke={colors.primary}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />
      <path
        d="M 50,110 L 90,110 L 110,90 L 130,90"
        stroke={colors.secondary}
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.25"
      />
      <path
        d="M 170,80 L 150,80 L 135,95"
        stroke={colors.primary}
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.2"
      />

      {/* Central Chip / Integrated Circuit Block */}
      <rect
        x="80"
        y="50"
        width="60"
        height="60"
        rx="8"
        fill="#080F21"
        stroke="#1E293B"
        strokeWidth="1"
      />

      {/* Radial soft glow on central chip */}
      <rect
        x="82"
        y="52"
        width="56"
        height="56"
        rx="6"
        fill="url(#centralGlow)"
        pointerEvents="none"
      />

      {/* Micro-lines inside the chip representing layout patterns */}
      <line x1="95" y1="65" x2="125" y2="65" stroke={colors.primary} strokeWidth="1" opacity="0.4" />
      <line x1="95" y1="75" x2="115" y2="75" stroke={colors.primary} strokeWidth="1" opacity="0.3" />
      <line x1="95" y1="85" x2="125" y2="85" stroke={colors.primary} strokeWidth="1" opacity="0.4" />
      <line x1="95" y1="95" x2="105" y2="95" stroke={colors.primary} strokeWidth="1" opacity="0.2" />

      {/* Central accent line or tiny node dot */}
      <circle cx="110" cy="80" r="3.5" fill={colors.primary} />
      <circle cx="110" cy="80" r="1.5" fill="#FFFFFF" />

      {/* Status LED Lights */}
      <g>
        {/* LED 1 */}
        <circle cx="160" cy="38" r="3" fill={colors.led} />
        {state === 'importing' && (
          <circle cx="160" cy="38" r="5" stroke={colors.led} strokeWidth="1" opacity="0.6" className="animate-ping" />
        )}
        
        {/* LED 2 */}
        <circle cx="172" cy="38" r="3" fill={state === 'success' || state === 'loaded' ? colors.secondary : '#334155'} />
        
        {/* LED 3 */}
        <circle cx="184" cy="38" r="3" fill="#1E293B" stroke="#475569" strokeWidth="0.5" />
      </g>

      {/* Clean decorative tech lines at the bottom instead of labels */}
      <line x1="75" y1="128" x2="145" y2="128" stroke="#1E293B" strokeWidth="1" opacity="0.6" />
      <circle cx="110" cy="128" r="2" fill={colors.primary} opacity="0.5" />
    </svg>
  );
}
