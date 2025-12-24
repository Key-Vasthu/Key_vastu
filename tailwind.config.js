/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Deep saffron/orange (traditional Indian)
        saffron: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // Secondary - Deep blue (astrological)
        astral: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#1e3a5f',
          600: '#162d4d',
          700: '#0f1f35',
          800: '#0a1628',
          900: '#050b14',
        },
        // Accent - Gold
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#d4a418',
          600: '#b8860b',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
        },
        // Earth tones
        earth: {
          50: '#fdf8f3',
          100: '#f5ebe0',
          200: '#e8d5c4',
          300: '#d4b896',
          400: '#c19a6b',
          500: '#a67c52',
          600: '#8b5e34',
          700: '#6f4e37',
          800: '#5c4033',
          900: '#3d2914',
        },
        // Warm cream background
        cream: {
          50: '#fffef7',
          100: '#fefcf3',
          200: '#fdf8e8',
          300: '#f9f1d9',
          400: '#f4e6c3',
          500: '#eddcb0',
        },
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        body: ['Nunito Sans', 'sans-serif'],
        accent: ['Cormorant Garamond', 'serif'],
        sanskrit: ['Tiro Devanagari Sanskrit', 'serif'],
      },
      backgroundImage: {
        'mandala-pattern': "url('/mandala-pattern.svg')",
        'vasthu-grid': "url('/vasthu-grid.svg')",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'gold': '0 4px 14px 0 rgba(212, 164, 24, 0.39)',
        'saffron': '0 4px 14px 0 rgba(249, 115, 22, 0.39)',
        'inner-gold': 'inset 0 2px 4px 0 rgba(212, 164, 24, 0.25)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}

