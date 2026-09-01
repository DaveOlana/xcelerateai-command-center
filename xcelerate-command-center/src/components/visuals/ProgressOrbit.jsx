import React from 'react';

export default function ProgressOrbit({
  value = 0,
  label = 'Roadmap Progress',
  sublabel = '',
  size = 'md',
  showNodes = true,
  className = '',
  ...props
}) {
  // Safe value clamping
  const rawValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  const clampedValue = Math.min(Math.max(0, rawValue), 100);

  // Size mapping (diameter)
  const dimensions = {
    sm: { diameter: 140, strokeWidth: 8, fontVal: 'text-2xl', fontLbl: 'text-[9px]' },
    md: { diameter: 200, strokeWidth: 10, fontVal: 'text-4xl', fontLbl: 'text-[11px]' },
    lg: { diameter: 260, strokeWidth: 12, fontVal: 'text-5xl', fontLbl: 'text-[13px]' },
  };

  const config = dimensions[size] || dimensions.md;
  const radius = (config.diameter - config.strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  // Orbit angle calculations for visual node dots
  const getOrbitPosition = (angleDegrees) => {
    const angleRadians = (angleDegrees - 90) * (Math.PI / 180);
    const x = config.diameter / 2 + radius * Math.cos(angleRadians);
    const y = config.diameter / 2 + radius * Math.sin(angleRadians);
    return { x, y };
  };

  // Color variables based on progress value
  const isComplete = clampedValue === 100;
  const progressColor = isComplete ? '#10B981' : '#06B6D4'; // Green or Cyan
  const glowColor = isComplete ? 'rgba(16, 185, 129, 0.2)' : 'rgba(6, 182, 212, 0.2)';

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className="relative"
        style={{ width: config.diameter, height: config.diameter }}
      >
        <svg
          width={config.diameter}
          height={config.diameter}
          viewBox={`0 0 ${config.diameter} ${config.diameter}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          {...props}
        >
          <defs>
            <filter id="orbitGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
            <linearGradient id="orbitProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor={progressColor} />
            </linearGradient>
          </defs>

          {/* Underlay Track */}
          <circle
            cx={config.diameter / 2}
            cy={config.diameter / 2}
            r={radius}
            stroke="#1E293B"
            strokeWidth={config.strokeWidth}
            opacity="0.8"
          />

          {/* Glowing under-effect for progress */}
          <circle
            cx={config.diameter / 2}
            cy={config.diameter / 2}
            r={radius}
            stroke={progressColor}
            strokeWidth={config.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter="url(#orbitGlow)"
            opacity="0.5"
          />

          {/* Main Progress Ring */}
          <circle
            cx={config.diameter / 2}
            cy={config.diameter / 2}
            r={radius}
            stroke="url(#orbitProgressGrad)"
            strokeWidth={config.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${config.diameter / 2} ${config.diameter / 2})`}
          />

          {/* Orbit Nodes (Tiny systems circles) */}
          {showNodes && (
            <g opacity="0.85">
              {[0, 60, 120, 180, 240, 300].map((deg, i) => {
                const { x, y } = getOrbitPosition(deg);
                // Highlight nodes that the progress bar has already passed
                const nodeActive = clampedValue >= (deg / 360) * 100 || deg === 0;
                return (
                  <g key={i}>
                    <circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#0B1329"
                      stroke={nodeActive ? progressColor : '#334155'}
                      strokeWidth="1.5"
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r="1.5"
                      fill={nodeActive ? progressColor : '#475569'}
                    />
                  </g>
                );
              })}
            </g>
          )}
        </svg>

        {/* Text Center Labels */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 select-none">
          <span className={`${config.fontVal} font-black text-white tracking-tight`}>
            {clampedValue}%
          </span>
          <span className={`${config.fontLbl} text-slate-500 uppercase tracking-widest font-bold mt-1`}>
            {label}
          </span>
          {sublabel && (
            <span className="text-[10px] text-slate-400 font-medium font-mono mt-0.5 truncate max-w-full">
              {sublabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
