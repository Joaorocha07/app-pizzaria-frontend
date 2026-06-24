/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './index.ts', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#E63946',
        'primary-dark': '#D62839',
        'primary-light': '#FF4D5A',
        dark: '#0D0D0D',
        'dark-card': '#1A1A1A',
        'dark-elevated': '#242424',
        'dark-border': '#2A2A2A',
        accent: '#F4A261',
        'accent-green': '#2A9D8F',
        offwhite: '#F5F0E8',
        'text-secondary': '#A0A0A0',
        'text-muted': '#666666',
        success: '#2A9D8F',
        danger: '#E63946',
        warning: '#F59E0B',
      },
    },
  },
  plugins: [],
};
