import React from 'react';

export default function ProofVaultVisual({
  status = 'empty',
  size = 'md',
  className = '',
  ...props
}) {
  const dimensions = {
    sm: { width: 140, height: 110 },
    md: { width: 220, height: 170 },
    lg: { width: 300, height: 230 },
  };

  const { width, height } = dimensions[size] || dimensions.md;

  const getStatusColors = () => {
    switch (status) {
      case 'verified':
        return {
          primary: '#10B981', // Success Green
          secondary: '#059669',
          glow: 'rgba(16, 185, 129, 0.2)',
          iconStroke: '#FFFFFF',
        };
      case 'pending':
      case 'required':
        return {
          primary: '#F59E0B', // Amber
          secondary: '#D97706',
          glow: 'rgba(245, 158, 11, 0.15)',
          iconStroke: '#080F21',
        };
      case 'missing':
        return {
          primary: '#EF4444', // Red
          secondary: '#DC2626',
          glow: 'rgba(239, 68, 68, 0.15)',
          iconStroke: '#FFFFFF',
        };
      case 'empty':
      default:
        return {
          primary: '#06B6D4', // Cyan
          secondary: '#3B82F6', // Blue
          glow: 'rgba(6, 182, 212, 0.15)',
          iconStroke: '#FFFFFF',
        };
    }
  };

  const colors = getStatusColors();

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 220 170"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <filter id="vaultGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <linearGradient id="vaultPlate" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B1329" />
          <stop offset="100%" stopColor="#1C2541" />
        </linearGradient>
      </defs>

      {/* Outer subtle flat boundary outline */}
      <rect
        x="15"
        y="15"
        width="190"
        height="140"
        rx="18"
        stroke={colors.primary}
        strokeWidth="1"
        opacity="0.1"
      />

      {/* Document card sheet stacked in the back */}
      <rect
        x="45"
        y="20"
        width="130"
        height="120"
        rx="8"
        fill="#0D172C"
        stroke="#1E293B"
        strokeWidth="1"
        opacity="0.5"
      />
      <line x1="60" y1="35" x2="160" y2="35" stroke="#1E293B" strokeWidth="1.5" opacity="0.3" />
      <line x1="60" y1="48" x2="140" y2="48" stroke="#1E293B" strokeWidth="1" opacity="0.2" />

      {/* Main Front Secure Plate Vault Card */}
      <rect
        x="35"
        y="30"
        width="150"
        height="110"
        rx="12"
        fill="url(#vaultPlate)"
        stroke="#1E293B"
        strokeWidth="1.5"
      />

      {/* Abstract safe combination grid lines */}
      <circle cx="110" cy="85" r="38" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" opacity="0.75" />
      
      {/* Outer seal frame */}
      <circle cx="110" cy="85" r="28" fill="#080F21" stroke="#1E293B" strokeWidth="1" />

      {/* Central status emblem */}
      <circle cx="110" cy="85" r="20" fill={colors.primary} fillOpacity="0.1" stroke={colors.primary} strokeWidth="1.5" />

      {/* Render status icon representation */}
      {status === 'verified' && (
        // Check shield path
        <path
          d="M 102,85 L 107,90 L 118,79"
          stroke={colors.primary}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {(status === 'pending' || status === 'required') && (
        // Alert mark exclamation symbol
        <g>
          <rect x="108.5" y="75" width="3" height="12" rx="1" fill={colors.primary} />
          <circle cx="110" cy="94" r="2" fill={colors.primary} />
        </g>
      )}

      {status === 'missing' && (
        // Cross cancel symbol
        <path
          d="M 103,78 L 117,92 M 117,78 L 103,92"
          stroke={colors.primary}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )}

      {status === 'empty' && (
        // Muted key lock icon
        <g stroke={colors.primary} strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
          <rect x="102" y="82" width="16" height="12" rx="2" fill="none" />
          <path d="M 105,82 L 105,78 C 105,74.5 107.5,73 110,73 C 112.5,73 115,74.5 115,78 L 115,82" fill="none" />
          <circle cx="110" cy="88" r="1.5" fill={colors.primary} />
        </g>
      )}

      {/* Decorative details dots */}
      <circle cx="50" cy="45" r="2" fill={colors.primary} opacity="0.4" />
      <circle cx="60" cy="45" r="2" fill="#1E293B" />
      <circle cx="70" cy="45" r="2" fill="#1E293B" />

      {/* Clean decorative tech lines at the bottom instead of labels */}
      <line x1="85" y1="124" x2="135" y2="124" stroke="#1E293B" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}
