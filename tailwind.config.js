/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        dark: {
          deep: '#08080a',
          surface: '#111114',
          card: '#16161a',
          elevated: '#1f1f25',
          border: 'rgba(255, 255, 255, 0.08)'
        },
        crimson: {
          DEFAULT: '#ff2a4b',
          glow: 'rgba(255, 42, 75, 0.35)',
          hover: '#e01c3c'
        }
      },
      fontFamily: {
        gothic: ['AngelWish', 'cursive', 'serif'],
        street: ['Space Grotesk', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif']
      },
      keyframes: {
        bump: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.25)' }
        }
      },
      animation: {
        bump: 'bump 300ms ease-out'
      }
    }
  },
  plugins: []
};
