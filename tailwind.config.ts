import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base / Cream Background Palette
        cream: {
          50: '#FDFCF9',
          100: '#FBF9F5', // Primary Base Canvas
          200: '#F7F5F0', // Secondary warm container
          300: '#EFEBE3', // Subtle hairline borders
          400: '#E3DDD3',
          500: '#D2C9BD',
        },
        // Typography / Neutral Dark Palette
        charcoal: {
          50: '#F4F5F6',
          100: '#E6E7EA',
          200: '#C7C9CF',
          400: '#8A8D98',
          500: '#63666F', // Body secondary text
          700: '#404249', // Subheading / labels
          800: '#2B2D31', // Deep graphite
          900: '#1E1F22', // Primary high-contrast headings
        },
        // Primary Action / Terracotta Palette
        terracotta: {
          50: '#FDF6F3',
          100: '#FBEFEA',
          200: '#F6D9D0',
          300: '#EEB7A6',
          400: '#DE866B',
          500: '#C85A32', // Brand Main Action & Accent
          600: '#BD5338', // Muted Clay variant
          700: '#A13F22', // Hover / pressed state
          800: '#83341D',
          900: '#6C2D1C',
        },
        // Tech / NFC & 3D Interactive Feature Callouts (Delicate, Non-Neon)
        tech: {
          50: '#F0F9FF',
          100: '#E0F2FE', // Chip / pill background
          200: '#BAE6FD',
          400: '#38BDF8',
          500: '#0EA5E9', // NFC touchpoint & 3D indicator
          600: '#0284C7',
          teal: '#14B8A6',
        },
        // Verification & Stock status
        success: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          600: '#16A34A',
          700: '#15803D',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'warm-sm': '0 1px 3px rgba(30, 31, 34, 0.04), 0 1px 2px rgba(30, 31, 34, 0.02)',
        'warm-md': '0 4px 14px -2px rgba(43, 45, 49, 0.06), 0 2px 6px -1px rgba(43, 45, 49, 0.03)',
        'warm-lg': '0 12px 28px -4px rgba(43, 45, 49, 0.08), 0 4px 10px -2px rgba(43, 45, 49, 0.04)',
        'warm-xl': '0 20px 40px -8px rgba(43, 45, 49, 0.12), 0 8px 16px -4px rgba(43, 45, 49, 0.06)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};

export default config;
