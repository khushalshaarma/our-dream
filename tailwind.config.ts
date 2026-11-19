import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          plum: '#24152F',
          surface: '#4B213D',
          aubergine: '#211629',
          card: 'rgba(75, 33, 61, 0.45)',
          glass: 'rgba(33, 22, 41, 0.65)',
        },
        pastel: {
          pink: '#F4A9C5',
          lilac: '#C8B3F5',
          mint: '#B6E7DC',
          cream: '#FFF0D7',
          blue: '#C9D7FF',
          rose: '#E89AA7',
          mauve: '#8D6B9E',
        },
      },
      fontFamily: {
        cormorant: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-dmsans)', '-apple-system', 'sans-serif'],
        pixel: ['var(--font-pixel)', 'monospace'],
      },
      boxShadow: {
        'glow-pink': '0 0 25px -2px rgba(244, 169, 197, 0.55)',
        'glow-lilac': '0 0 25px -4px rgba(200, 179, 245, 0.45)',
        'glow-mint': '0 0 20px -3px rgba(182, 231, 220, 0.4)',
        '3d-btn': '0 6px 0 #33152A, 0 10px 20px rgba(0, 0, 0, 0.4)',
        '3d-btn-pressed': '0 2px 0 #33152A, 0 4px 10px rgba(0, 0, 0, 0.3)',
        '3d-card': '0 15px 35px -5px rgba(10, 3, 16, 0.6), 0 5px 15px rgba(244, 169, 197, 0.15)',
        'polaroid': '0 14px 28px rgba(0,0,0,0.45), 0 10px 10px rgba(0,0,0,0.35)',
      },
      animation: {
        'float-slow': 'float 5s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.75' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
