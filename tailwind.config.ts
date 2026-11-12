import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: '#F4F0E6',
        'paper-soft': '#FAF7EF',
        'paper-deep': '#E9E3D3',
        ink: '#14160F',
        'ink-soft': '#262A1F',
        forest: {
          DEFAULT: '#123E33',
          deep: '#0A2B23',
          mid: '#184C3E',
          light: '#276653',
        },
        lime: {
          DEFAULT: '#D8F26B',
          soft: '#E7F7A6',
        },
        amber: '#E8A13B',
        clay: '#C55734',
        sky: '#4F7FA3',
        line: '#D8D1C0',
        muted: '#6C6F63',
        'muted-dark': '#A5AA9A',
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-manrope)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.75rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,22,15,0.04), 0 18px 48px -24px rgba(20,22,15,0.24)',
        lift: '0 30px 80px -32px rgba(10,43,35,0.45)',
        crisp: '0 0 0 1px rgba(20,22,15,0.06)',
      },
      backgroundImage: {
        'dot-grid':
          'radial-gradient(circle at 1px 1px, rgba(20,22,15,0.13) 1px, transparent 0)',
        'dot-grid-light':
          'radial-gradient(circle at 1px 1px, rgba(244,240,230,0.18) 1px, transparent 0)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        spinSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        scan: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '15%': { opacity: '1' },
          '85%': { opacity: '1' },
          '100%': { transform: 'translateY(180px)', opacity: '0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.5s ease-out both',
        marquee: 'marquee 28s linear infinite',
        'spin-slow': 'spinSlow 30s linear infinite',
        scan: 'scan 3s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
