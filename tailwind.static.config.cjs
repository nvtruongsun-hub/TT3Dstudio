/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './admin.html',
    './js/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          dark: '#0B0C0E',
          light: '#F8F9FA'
        },
        surface: {
          dark: '#14161C',
          light: '#FFFFFF'
        },
        industrial: {
          orange: '#FF5C00',
          hover: '#E05200',
          charcoal: '#14161C',
          muted: '#8A8F98',
          text: '#EDEDED'
        },
        brand: {
          cyan: '#FF5C00',
          accent: '#FF5C00'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Space Grotesk"', '"Plus Jakarta Sans"', 'sans-serif']
      }
    }
  },
  plugins: []
};
