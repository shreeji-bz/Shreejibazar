/** @type {import('tailwindcss').Config} */
// All colors are theme tokens: `rgb(var(--x-rgb) / <alpha-value>)` so opacity
// modifiers (bg-error/10, border-gold/40) work in BOTH light and dark.
const token = (name) => `rgb(var(--${name}-rgb) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: token('background'),
        'background-secondary': token('background-secondary'),
        card: token('card'),
        'card-secondary': token('card-secondary'),
        'card-tertiary': token('card-tertiary'),
        gold: {
          dark: token('gold-dark'),
          DEFAULT: token('gold'),
          bright: token('gold-bright'),
          light: token('gold-light'),
          muted: token('gold-muted'),
        },
        'text-primary': token('text-primary'),
        'text-secondary': token('text-secondary'),
        'text-muted': token('text-muted'),
        border: token('border'),
        // Semantic status colors (both themes).
        success: token('success'),
        error: token('error'),
        warning: token('warning'),
        info: token('info'),
      },
    },
  },
  plugins: [],
};
