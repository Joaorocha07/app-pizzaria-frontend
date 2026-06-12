/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './index.ts', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#8B1A1A',
        'primary-dark': '#6B1313',
        'primary-light': '#A52020',
        dark: '#0D0D0D',
        'dark-card': '#1A1A1A',
        'dark-border': '#2A2A2A',
        accent: '#C8943C',
        offwhite: '#F5F0E8',
        success: '#22C55E',
        danger: '#EF4444',
        warning: '#F59E0B',
      },
    },
  },
  plugins: [],
};
