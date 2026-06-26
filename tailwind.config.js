/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './index.ts', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#C0392B',
        'primary-dark': '#A93226',
        'primary-light': '#E74C3C',
        dark: '#0A0A0A',
        'dark-card': '#111111',
        'dark-elevated': '#1A1A1A',
        'dark-border': '#1C1C1C',
        accent: '#B8860B',
        'accent-light': '#D4A017',
        'accent-green': '#2A9D8F',
        offwhite: '#F5F0E8',
        'text-secondary': '#A0A0A0',
        'text-muted': '#666666',
        success: '#2A9D8F',
        danger: '#C0392B',
        warning: '#F59E0B',
      },
    },
  },
  plugins: [],
};
