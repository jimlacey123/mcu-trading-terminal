/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: '#0a0a0a',
          panel: '#0f0f0f',
          border: '#222222',
          text: '#e8e8e8',
          muted: '#666666',
          orange: '#ff6600',
          green: '#00d264',
          red: '#ff3333',
        },
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'monospace'],
        sans: ['"IBM Plex Sans Condensed"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
