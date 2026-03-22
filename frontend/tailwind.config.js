/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          950: '#0A0B0F',
          900: '#0F1117',
          800: '#161820',
          700: '#1E2130',
          600: '#272A3C',
          500: '#363A52',
        },
        signal: {
          blue:   '#4F8EF7',
          teal:   '#2DD4BF',
          amber:  '#F59E0B',
          red:    '#EF4444',
          green:  '#22C55E',
          purple: '#A78BFA',
        },
      },
      animation: {
        'fade-up':    'fadeUp 0.5s ease forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}
