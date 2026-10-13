/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111111',
        sub: '#5b5b5b',
        mute: '#8a8a8a',
        line: '#ececec',
        soft: '#f5f5f0',
        paper: '#fbfbf8',
        mint: {
          50: '#eff7f1',
          100: '#dcefe2',
          200: '#bee0c9',
          500: '#7cc99c',
          700: '#3f8a5e',
          900: '#1f4f37',
        },
        peach: {
          50: '#fdf3ea',
          100: '#fde2cf',
          500: '#f4a472',
          700: '#c47640',
        },
        rose: {
          50: '#fdf0ee',
          100: '#fbd9d4',
          500: '#e98a85',
          700: '#b85852',
        },
      },
      fontFamily: {
        sans: ['"InterVariable"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"InterVariable"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'ui-serif', 'Georgia', 'serif'],
        mono: ['"Fira Code"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      letterSpacing: {
        tightish: '-0.02em',
        crunch: '-0.04em',
      },
      boxShadow: {
        card: '0 1px 0 rgba(17,17,17,0.04), 0 8px 24px -16px rgba(17,17,17,0.08)',
        ring: 'inset 0 0 0 1px #ececec',
      },
      keyframes: {
        fadein: {
          '0%': { opacity: 0, transform: 'translateY(4px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        fadein: 'fadein 200ms ease-out',
      },
    },
  },
  plugins: [],
};
