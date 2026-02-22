import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      // ─── Design Tokens ─────────────────────────────────────────────────────
      colors: {
        // Brand
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d7fe',
          300: '#a5bafd',
          400: '#818dfb',
          500: '#6366f1',  // primary
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Surface (dark-first design)
        surface: {
          0:   '#080812',  // deepest bg
          50:  '#0d0d1f',
          100: '#12122a',
          200: '#1a1a35',
          300: '#22223f',
          400: '#2d2d52',
          500: '#3d3d6b',
        },
        // Accent colors
        glow: {
          violet: '#7c3aed',
          blue:   '#2563eb',
          cyan:   '#0891b2',
          green:  '#059669',
          amber:  '#d97706',
          rose:   '#e11d48',
        },
        // Semantic
        success: '#10b981',
        warning: '#f59e0b',
        error:   '#ef4444',
        info:    '#3b82f6',
      },

      fontFamily: {
        sans:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-cal)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },

      backgroundImage: {
        // Gradient backgrounds
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        // Mesh gradients
        'mesh-purple': 'radial-gradient(at 40% 20%, hsla(260,100%,56%,0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(220,100%,56%,0.2) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(300,100%,56%,0.15) 0px, transparent 50%)',
        'mesh-warm':   'radial-gradient(at 20% 80%, hsla(30,100%,60%,0.3) 0px, transparent 50%), radial-gradient(at 80% 20%, hsla(0,100%,60%,0.2) 0px, transparent 50%)',
        'mesh-cool':   'radial-gradient(at 60% 80%, hsla(180,100%,56%,0.2) 0px, transparent 50%), radial-gradient(at 20% 30%, hsla(240,100%,56%,0.25) 0px, transparent 50%)',
        // Glass gradient
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      },

      boxShadow: {
        'glow-sm':   '0 0 15px -3px rgba(99,102,241,0.3)',
        'glow':      '0 0 30px -5px rgba(99,102,241,0.4)',
        'glow-lg':   '0 0 60px -10px rgba(99,102,241,0.5)',
        'glow-rose': '0 0 30px -5px rgba(225,29,72,0.4)',
        'glow-cyan': '0 0 30px -5px rgba(8,145,178,0.4)',
        'card':      '0 4px 24px -4px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)',
        'card-hover':'0 8px 40px -8px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4)',
        'inner-glow':'inset 0 1px 0 rgba(255,255,255,0.08)',
      },

      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      animation: {
        'fade-in':        'fadeIn 0.4s ease-out',
        'fade-up':        'fadeUp 0.5s ease-out',
        'scale-in':       'scaleIn 0.3s ease-out',
        'slide-up':       'slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        'slide-down':     'slideDown 0.3s ease-out',
        'pulse-glow':     'pulseGlow 2s ease-in-out infinite',
        'spin-slow':      'spin 8s linear infinite',
        'float':          'float 3s ease-in-out infinite',
        'shimmer':        'shimmer 2s linear infinite',
        'bounce-in':      'bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1)',
        'counter':        'counter 0.8s ease-out',
        'draw-line':      'drawLine 1s ease-out forwards',
        'gradient-shift': 'gradientShift 4s ease infinite',
      },

      keyframes: {
        fadeIn:        { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeUp:        { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:       { from: { opacity: '0', transform: 'scale(0.9)' }, to: { opacity: '1', transform: 'scale(1)' } },
        slideUp:       { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown:     { from: { opacity: '0', transform: 'translateY(-16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseGlow:     { '0%,100%': { boxShadow: '0 0 20px rgba(99,102,241,0.3)' }, '50%': { boxShadow: '0 0 40px rgba(99,102,241,0.6)' } },
        float:         { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        shimmer:       { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
        bounceIn:      { from: { opacity: '0', transform: 'scale(0.3)' }, '50%': { transform: 'scale(1.05)' }, to: { opacity: '1', transform: 'scale(1)' } },
        drawLine:      { from: { strokeDashoffset: '1000' }, to: { strokeDashoffset: '0' } },
        gradientShift: { '0%,100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
      },

      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
