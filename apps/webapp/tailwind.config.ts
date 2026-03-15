import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        /* ── Semantic theme colors (dark/light via CSS variables) ──── */
        th: {
          DEFAULT: 'rgb(var(--c-text) / <alpha-value>)',
          bg: 'rgb(var(--c-bg) / <alpha-value>)',
          raised: 'rgb(var(--c-raised) / <alpha-value>)',
          muted: 'rgb(var(--c-muted) / <alpha-value>)',
          invert: 'rgb(var(--c-invert) / <alpha-value>)',
          border: 'rgb(var(--c-border) / <alpha-value>)',
        },
        brand: {
          50: '#f0f0ff',
          100: '#dddcff',
          200: '#bfbbff',
          300: '#9d95ff',
          400: '#7b6cff',
          500: '#6c5ce7', // primary — rich electric violet
          600: '#5a3fd6',
          700: '#4930b8',
          800: '#3c2896',
          900: '#33257b',
          950: '#1e1554',
        },
        surface: {
          0: '#06060e', // deepest — near true black
          50: '#0a0a18',
          100: '#0f0f22',
          200: '#16162e',
          300: '#1e1e3a',
          400: '#282848',
          500: '#36365e',
        },
        neon: {
          violet: '#a855f7',
          blue: '#3b82f6',
          cyan: '#22d3ee',
          mint: '#34d399',
          amber: '#fbbf24',
          rose: '#fb7185',
          pink: '#f472b6',
        },
        success: '#34d399',
        warning: '#fbbf24',
        error: '#fb7185',
        info: '#60a5fa',
      },

      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'var(--font-mono)', 'monospace'],
      },

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        // Aurora mesh backgrounds
        aurora:
          'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(108,92,231,0.25) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 50%, rgba(34,211,238,0.12) 0%, transparent 50%), radial-gradient(ellipse 50% 50% at 20% 80%, rgba(168,85,247,0.1) 0%, transparent 50%)',
        'aurora-subtle':
          'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(108,92,231,0.12) 0%, transparent 50%)',
        // Card glass gradient
        'glass-gradient':
          'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)',
        'glass-gradient-strong':
          'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)',
        // Holographic
        holo: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(34,211,238,0.1) 50%, rgba(251,191,36,0.08) 100%)',
        'holo-border':
          'linear-gradient(135deg, rgba(168,85,247,0.5), rgba(59,130,246,0.5), rgba(34,211,238,0.5), rgba(52,211,153,0.5))',
        // Shimmer
        'card-shine':
          'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 55%, transparent 60%)',
      },

      boxShadow: {
        'glow-sm': '0 0 20px -4px rgba(108,92,231,0.35)',
        glow: '0 0 40px -8px rgba(108,92,231,0.45)',
        'glow-lg': '0 0 80px -16px rgba(108,92,231,0.5)',
        'glow-cyan': '0 0 40px -8px rgba(34,211,238,0.35)',
        'glow-rose': '0 0 40px -8px rgba(251,113,133,0.35)',
        'glow-amber': '0 0 40px -8px rgba(251,191,36,0.35)',
        'glow-mint': '0 0 40px -8px rgba(52,211,153,0.35)',
        card: '0 2px 16px -2px rgba(0,0,0,0.5), 0 0 1px rgba(255,255,255,0.06)',
        'card-hover':
          '0 8px 32px -4px rgba(0,0,0,0.6), 0 0 1px rgba(255,255,255,0.1)',
        'card-elevated':
          '0 16px 48px -8px rgba(0,0,0,0.7), 0 0 1px rgba(255,255,255,0.08)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.06)',
        'inner-light': 'inset 0 0 24px rgba(255,255,255,0.02)',
        dock: '0 -8px 32px -4px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
      },

      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      animation: {
        shimmer: 'shimmer 2.5s linear infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
        'aurora-shift': 'auroraShift 8s ease-in-out infinite alternate',
        'gradient-x': 'gradientX 6s ease infinite',
        'card-shine': 'cardShine 3s ease-in-out infinite',
        'border-rotate': 'borderRotate 4s linear infinite',
        breathe: 'breathe 4s ease-in-out infinite',
      },

      keyframes: {
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to: { backgroundPosition: '200% 0' },
        },
        pulseGlow: { '0%,100%': { opacity: '0.6' }, '50%': { opacity: '1' } },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        auroraShift: {
          '0%': { backgroundPosition: '0% 50%', opacity: '0.7' },
          '100%': { backgroundPosition: '100% 50%', opacity: '1' },
        },
        gradientX: {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        cardShine: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        borderRotate: {
          from: { '--angle': '0deg' },
          to: { '--angle': '360deg' },
        },
        breathe: {
          '0%,100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
      },

      backdropBlur: {
        xs: '2px',
        '3xl': '64px',
      },
    },
  },
  plugins: [],
};

export default config;
