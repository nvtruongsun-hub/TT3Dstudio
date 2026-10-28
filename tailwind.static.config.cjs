/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './index.html',
    './admin.html',
    './js/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: 'var(--bg-canvas)',
          dark: '#191614',
          light: '#FAF8F5'
        },
        surface: {
          DEFAULT: 'var(--bg-surface)',
          elevated: 'var(--bg-surface-elevated)',
          dark: '#231F1C',
          light: '#FFFFFF'
        },
        border: {
          subtle: 'var(--border-subtle)',
          hover: 'var(--border-hover)',
          active: 'var(--border-active)'
        },
        content: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)'
        },
        accent: {
          DEFAULT: 'var(--accent-primary)',
          hover: 'var(--accent-hover)',
          subtle: 'var(--accent-subtle)'
        },
        artisan: {
          linen: '#FAF8F5',
          cashmere: '#F4F0EA',
          terracotta: '#D45B34',
          terracottaHover: '#BD4A26',
          charcoal: '#1F2421',
          slate: '#58635D',
          sage: '#2D6A4F',
          sageBg: '#EBF5F0',
          border: '#E8E2D8'
        },
        tech: {
          cyan: '#64E8F5',
          cyanDark: '#006B7A',
          titanium: '#1B2530',
          obsidian: '#080B10',
          surface: '#121820',
          orange: '#FF5C00',
          emerald: '#69D9AF'
        },
        industrial: {
          orange: '#FF5C00',
          hover: '#E05200',
          charcoal: '#121820',
          muted: '#8A8F98',
          text: '#F2F6FA'
        },
        brand: {
          cyan: '#64E8F5',
          accent: '#64E8F5'
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
