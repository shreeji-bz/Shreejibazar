/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        'background-secondary': 'var(--background-secondary)',
        card: 'var(--card)',
        'card-secondary': 'var(--card-secondary)',
        'card-tertiary': 'var(--card-tertiary)',
        gold: {
          dark: 'var(--gold-dark)',
          DEFAULT: 'var(--gold)',
          bright: 'var(--gold-bright)',
          light: 'var(--gold-light)',
          muted: 'var(--gold-muted)',
        },
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        border: 'var(--border)',
      },
    },
  },
  plugins: [],
};
