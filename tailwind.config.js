/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: 'rgb(var(--legacy-white) / <alpha-value>)',
        navy: {
          950: 'rgb(var(--legacy-navy-950) / <alpha-value>)',
          900: 'rgb(var(--legacy-navy-900) / <alpha-value>)',
          850: 'rgb(var(--legacy-navy-850) / <alpha-value>)',
          800: 'rgb(var(--legacy-navy-800) / <alpha-value>)',
          700: 'rgb(var(--legacy-navy-700) / <alpha-value>)',
          600: 'rgb(var(--legacy-navy-600) / <alpha-value>)',
          500: 'rgb(var(--legacy-navy-500) / <alpha-value>)',
          450: 'rgb(var(--legacy-navy-450) / <alpha-value>)',
          400: 'rgb(var(--legacy-navy-400) / <alpha-value>)',
          300: 'rgb(var(--legacy-navy-300) / <alpha-value>)',
        },
        slate: {
          50: 'rgb(var(--legacy-slate-50) / <alpha-value>)',
          100: 'rgb(var(--legacy-slate-100) / <alpha-value>)',
          200: 'rgb(var(--legacy-slate-200) / <alpha-value>)',
          300: 'rgb(var(--legacy-slate-300) / <alpha-value>)',
          350: 'rgb(var(--legacy-slate-350) / <alpha-value>)',
          400: 'rgb(var(--legacy-slate-400) / <alpha-value>)',
          450: 'rgb(var(--legacy-slate-450) / <alpha-value>)',
          500: 'rgb(var(--legacy-slate-500) / <alpha-value>)',
          550: 'rgb(var(--legacy-slate-550) / <alpha-value>)',
          600: 'rgb(var(--legacy-slate-600) / <alpha-value>)',
          700: 'rgb(var(--legacy-slate-700) / <alpha-value>)',
          800: 'rgb(var(--legacy-slate-800) / <alpha-value>)',
          900: 'rgb(var(--legacy-slate-900) / <alpha-value>)',
          950: 'rgb(var(--legacy-slate-950) / <alpha-value>)',
        },
        accent: {
          primary: 'rgb(var(--accent-primary) / <alpha-value>)',
          'primary-dim': 'rgb(var(--accent-primary-hover) / <alpha-value>)',
          'primary-glow': 'rgb(var(--accent-primary) / 0.1)',
          cyan: 'rgb(var(--accent-cyan) / <alpha-value>)',
          'cyan-dim': 'rgb(var(--accent-cyan-soft) / <alpha-value>)',
        },
        status: {
          locked: '#475569',
          active: '#2563EB',
          complete: '#10B981', // Strictly Green for success/complete
          warning: '#F59E0B',
          error: '#EF4444',
        },
        // Semantic design tokens
        bg: {
          app: 'var(--bg-app)',
          page: 'var(--bg-page)',
          surface: 'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
          soft: 'var(--bg-soft)',
          glass: 'var(--bg-glass)',
          overlay: 'var(--bg-overlay)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          disabled: 'var(--text-disabled)',
          inverse: 'var(--text-inverse)',
          'on-brand': 'var(--text-on-brand)',
        },
        border: {
          default: 'var(--border-default)',
          strong: 'var(--border-strong)',
          focus: 'var(--border-focus)',
          divider: 'var(--border-divider)',
        },
        brand: {
          blue: 'var(--color-brand)',
          cyan: 'var(--color-focus)',
          violet: 'var(--color-project)',
          green: 'var(--color-success)',
          amber: 'var(--color-warning)',
          red: 'var(--color-danger)',
          slate: 'var(--color-neutral)',
          on: 'var(--text-on-brand)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Manrope', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'radius-sm': 'var(--radius-sm)',
        'radius-md': 'var(--radius-md)',
        'radius-lg': 'var(--radius-lg)',
        'radius-xl': 'var(--radius-xl)',
        'radius-xxl': 'var(--radius-xxl)',
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)",
        'glow-primary': 'radial-gradient(circle at center, rgba(59,130,246,0.12) 0%, transparent 70%)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      animation: {
        'pulse-primary': 'pulse-primary 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'check-pop': 'check-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'progress-fill': 'progress-fill 1s ease-out',
        'streak-bounce': 'streak-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-primary': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        'slide-in': {
          from: { transform: 'translateX(-100%)', opacity: 0 },
          to: { transform: 'translateX(0)', opacity: 1 },
        },
        'fade-in': {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        'check-pop': {
          '0%': { transform: 'scale(0)' },
          '70%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        'progress-fill': {
          from: { width: '0%' },
        },
        'streak-bounce': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59,130,246,0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(59,130,246,0.25)' },
        },
      },
      boxShadow: {
        'primary-glow': '0 0 20px rgba(59,130,246,0.2), 0 0 40px rgba(59,130,246,0.05)',
        'primary-glow-sm': '0 0 10px rgba(59,130,246,0.15)',
        'amber-glow': '0 0 20px rgba(245, 158, 11, 0.2), 0 0 40px rgba(245, 158, 11, 0.05)',
        'cyan-glow': '0 0 20px rgba(6, 182, 212, 0.2), 0 0 40px rgba(6, 182, 212, 0.05)',
        'card': 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
      },
    },
  },
  plugins: [],
}
