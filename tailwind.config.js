/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: '#04030a',
          900: '#07060f',
          800: '#0b0a16',
          700: '#12101f',
          600: '#1a1730',
        },
        neon: {
          cyan: '#22f7e6',
          magenta: '#ff2ea6',
          violet: '#8b5cf6',
          lime: '#c8f31d',
          amber: '#ffb347',
        },
      },
      fontFamily: {
        display: ['"Unbounded"', 'sans-serif'],
        body: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 6px rgba(34,247,230,.6), 0 0 24px rgba(34,247,230,.35)',
        'neon-magenta': '0 0 6px rgba(255,46,166,.6), 0 0 24px rgba(255,46,166,.35)',
        'neon-violet': '0 0 6px rgba(139,92,246,.6), 0 0 24px rgba(139,92,246,.35)',
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        flicker: {
          '0%,100%': { opacity: '1' },
          '92%': { opacity: '1' },
          '93%': { opacity: '.4' },
          '94%': { opacity: '1' },
          '96%': { opacity: '.6' },
          '97%': { opacity: '1' },
        },
        pulseRing: {
          '0%': { transform: 'scale(.8)', opacity: '.8' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        flicker: 'flicker 6s linear infinite',
        'pulse-ring': 'pulseRing 2.4s ease-out infinite',
        floaty: 'floaty 7s ease-in-out infinite',
        scanline: 'scanline 9s linear infinite',
      },
    },
  },
  plugins: [],
};
