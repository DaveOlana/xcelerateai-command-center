/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#080B16', // Deep charcoal/navy background
          900: '#0C0F1E', // Sidebar/Deep navigation surface
          850: '#121829', // Card surface
          800: '#172033', // Elevated card
          700: '#1E293B', // Subtle backgrounds
          600: '#2E3E59', // High contrast borders
          500: '#475569', // Muted borders
          450: '#64748B',
          400: '#94A3B8',
          300: '#CBD5E1', // Muted text
        },
        accent: {
          primary: '#2563EB', // Modern blue accent
          'primary-dim': '#3B82F6', // Lighter hover state
          'primary-glow': 'rgba(37,99,235,0.1)',
          cyan: '#06B6D4',
          'cyan-dim': '#22D3EE',
        },
        status: {
          locked: '#475569',
          active: '#2563EB',
          complete: '#10B981', // Strictly Green for success/complete
          warning: '#F59E0B',
          error: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
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
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.15)',
      },
    },
  },
  plugins: [],
}
