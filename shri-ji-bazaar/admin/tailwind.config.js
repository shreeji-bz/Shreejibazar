/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#050505',
        'background-secondary': '#0A0A0A',
        card: '#120C05',
        'card-secondary': '#1A1005',
        'card-tertiary': '#211508',
        gold: {
          dark: '#8A5A00',
          DEFAULT: '#D89B18',
          bright: '#C9A227',
          light: '#E8C547',
          muted: '#B8942B',
        },
        'text-primary': '#FFFFFF',
        'text-secondary': '#B8A98A',
        'text-muted': '#7A6E5A',
        border: '#2A2008',
      },
    },
  },
  plugins: [],
};
